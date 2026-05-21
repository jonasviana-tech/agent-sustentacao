'use strict';

const config = require('../config');
const { parseTicket } = require('./ticket-parser');
const { identifyClient } = require('./client-identifier');
const { searchDocs } = require('./kb-search');
const { runTriage } = require('./llm-triage');
const { extractKeywords } = require('../utils/text');

/**
 * Builds a human-readable annotation text from the LLM triage result.
 * This is what gets pasted as a Freshdesk note by the Automator.
 */
function formatResponsavel(responsavel) {
  if (!responsavel) return 'Nao definido';
  if (typeof responsavel === 'string') return responsavel;
  const name = responsavel.displayName || 'Nao definido';
  const jira = responsavel.jiraProjectKey
    ? ` (Jira ${responsavel.jiraProjectKey})`
    : '';
  return `${name}${jira}`;
}

function buildAnnotation(triagem, ticket) {
  if (triagem.resumoParaAnotacao) return triagem.resumoParaAnotacao;

  const lines = [
    `**Triagem Automatica**`,
    ``,
    `**Cliente:** ${triagem.cliente || 'Nao identificado'}`,
    `**Projeto:** ${triagem.projeto || 'Nao identificado'}`,
    `**Responsavel:** ${formatResponsavel(triagem.responsavel)}`,
    `**Area Afetada:** ${triagem.areaAfetada || 'Desconhecido'}`,
    `**Severidade:** ${triagem.severidade || 'NaoInformado'}`,
    `**Confianca:** ${triagem.confianca || 'Baixa'}`,
    ``,
    `---`,
    `**Chamado:** ${ticket.subject || '(sem assunto)'}`,
    ``,
  ];

  if (triagem.hipoteses?.length) {
    lines.push(`**Hipoteses:**`);
    for (const h of triagem.hipoteses) {
      lines.push(`- ${h.causa}`);
      if (h.evidencia) lines.push(`  Evidencia: ${h.evidencia}`);
      if (h.componente) lines.push(`  Componente: ${h.componente}`);
    }
    lines.push('');
  }

  if (triagem.tratativa) {
    const { investigacaoImediata, correcaoProvavel, mitigacaoTemporaria } = triagem.tratativa;
    if (investigacaoImediata?.length) {
      lines.push(`**Investigacao Imediata:**`);
      investigacaoImediata.forEach((i) => lines.push(`- ${i}`));
      lines.push('');
    }
    if (correcaoProvavel?.length) {
      lines.push(`**Correcao Provavel:**`);
      correcaoProvavel.forEach((c) => lines.push(`- ${c}`));
      lines.push('');
    }
    if (mitigacaoTemporaria?.length) {
      lines.push(`**Mitigacao Temporaria:**`);
      mitigacaoTemporaria.forEach((m) => lines.push(`- ${m}`));
      lines.push('');
    }
  }

  if (triagem.referencias?.length) {
    lines.push(`**Referencias:**`);
    for (const r of triagem.referencias) {
      lines.push(`- ${r.file} (linhas ${r.startLine}-${r.endLine})`);
    }
  }

  return lines.join('\n');
}

/**
 * Full triage pipeline:
 * 1. Parse the raw Freshdesk payload into a normalized ticket
 * 2. Identify the client and project
 * 3. Search the knowledge base for relevant snippets
 * 4. Call the LLM to produce structured triage
 * 5. Return everything in a clean API response
 *
 * @param {object} rawPayload - Raw body from Freshdesk webhook or API request
 * @returns {Promise<object>} Structured triage result
 */
async function runTriagemPipeline(rawPayload) {
  const cfg = config();
  const ticket = parseTicket(rawPayload);

  if (!ticket.subject) {
    const err = new Error('validation_error: subject is required');
    err.statusCode = 400;
    throw err;
  }

  const clientInfo = await identifyClient(ticket);

  const extraTerms = [];
  if (clientInfo.cliente) extraTerms.push(clientInfo.cliente);
  if (clientInfo.projeto) extraTerms.push(clientInfo.projeto);

  const keywords = extractKeywords(ticket, extraTerms);

  const kbSnippets = clientInfo.knowledgeBase.length
    ? await searchDocs({
        docsRoot: cfg.docsRoot,
        relativePaths: clientInfo.knowledgeBase,
        keywords,
        maxTotalSnippets: 8,
      })
    : [];

  const llmInput = {
    mapping: {
      cliente: clientInfo.cliente,
      projeto: clientInfo.projeto,
      responsavel: clientInfo.responsavel,
    },
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      descriptionText: ticket.descriptionText,
      requester: ticket.requester,
      company: ticket.company,
      url: ticket.url,
      tags: ticket.tags,
    },
    keywords,
    kbSnippets,
  };

  const llmResult = await runTriage(llmInput);
  const triagem = llmResult.json;

  // Responsável vem do projeto-responsaveis.json (fonte canônica), não do LLM
  triagem.responsavel = clientInfo.responsavel;

  const resumoParaAnotacao = buildAnnotation(triagem, ticket);

  return {
    ok: true,
    ticketId: ticket.id ?? null,
    triagem: {
      ...triagem,
      resumoParaAnotacao,
    },
    meta: {
      provider: llmResult.provider,
      model: llmResult.model,
      kbSnippetsCount: kbSnippets.length,
      keywordsUsed: keywords,
    },
  };
}

module.exports = { runTriagemPipeline };
