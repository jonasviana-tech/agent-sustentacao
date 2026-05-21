'use strict';

const fs = require('fs/promises');
const config = require('../config');
const { normalizeText } = require('../utils/text');

let _mappingCache = null;

async function loadMapping() {
  if (_mappingCache) return _mappingCache;
  const raw = await fs.readFile(config().clientesPath, 'utf8');
  _mappingCache = JSON.parse(raw);
  return _mappingCache;
}

function scoreMatch(text, tokens) {
  const t = normalizeText(text);
  let score = 0;
  for (const token of tokens || []) {
    const k = normalizeText(token);
    if (k && t.includes(k)) score += 1;
  }
  return score;
}

function pickClient(mapping, ticket) {
  const companyId = ticket?.company?.id;
  const text = `${ticket?.subject || ''}\n${ticket?.descriptionText || ''}`;

  let best = null;
  let bestScore = -1;

  for (const client of mapping?.clientes || []) {
    let score = 0;

    if (companyId && Array.isArray(client.freshdeskCompanyIds) &&
        client.freshdeskCompanyIds.includes(companyId)) {
      score += 10;
    }

    score += scoreMatch(text, client.aliases) * 2;

    if (score > bestScore) {
      bestScore = score;
      best = client;
    }
  }

  return best && bestScore > 0 ? best : null;
}

function pickProjeto(client, ticket) {
  const projetos = client?.projetos || [];
  if (!projetos.length) return null;
  if (projetos.length === 1) return projetos[0];

  const text = `${ticket?.subject || ''}\n${ticket?.descriptionText || ''}`;
  let best = projetos[0];
  let bestScore = -1;

  for (const proj of projetos) {
    const score = scoreMatch(text, proj.areaPalavrasChave) + scoreMatch(text, [proj.projeto]);
    if (score > bestScore) {
      bestScore = score;
      best = proj;
    }
  }

  return best;
}

function buildResponsavel(projeto, fallback) {
  const src = projeto || fallback || {};
  const fb = fallback || {};
  return {
    displayName: src.responsavelDisplayName || fb.responsavelDisplayName || 'Nao definido',
    accountId: src.responsavelAccountId || fb.responsavelAccountId || null,
    jiraProjectKey: src.jiraProjectKey || fb.jiraProjectKey || null,
    jiraIssueTypeName: src.jiraIssueTypeName || fb.jiraIssueTypeName || null,
  };
}

/**
 * Identifica cliente, projeto e responsável a partir de config/clientes.json.
 */
async function identifyClient(ticket) {
  const mapping = await loadMapping();
  const client = pickClient(mapping, ticket);
  const projeto = client ? pickProjeto(client, ticket) : null;
  const fallback = mapping?.fallback || {};

  return {
    cliente: client?.cliente || null,
    projeto: projeto?.projeto || null,
    responsavel: buildResponsavel(projeto, fallback),
    knowledgeBase: client?.knowledgeBase || [],
    labels: projeto?.labels || [],
  };
}

identifyClient.clearCache = () => { _mappingCache = null; };

module.exports = { identifyClient };
