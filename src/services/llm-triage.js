'use strict';

const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const config = require('../config');

async function loadSystemPrompt() {
  const promptPath = path.resolve(__dirname, '../../prompts/system-prompt.md');
  return fs.readFile(promptPath, 'utf8');
}

function safeJsonParse(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(trimmed.slice(start, end + 1)); } catch { /* fall through */ }
    }
    return null;
  }
}

function formatAxiosError(err, prefix) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const preview = data == null ? '' : JSON.stringify(data).slice(0, 500);
  return [prefix, status ? `status=${status}` : null, err?.message, preview]
    .filter(Boolean).join(' | ');
}

// ---- Provider callers ----

async function callAnthropic({ systemPrompt, userContent, model, apiKey }) {
  const finalModel = model || 'claude-sonnet-4-20250514';
  const resp = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: finalModel,
      max_tokens: 2048,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 90_000,
    },
  );

  const text = (resp?.data?.content || [])
    .filter((c) => c?.type === 'text')
    .map((c) => c.text)
    .join('\n');

  return { rawText: text, provider: 'anthropic', model: finalModel };
}

async function callOpenAI({ systemPrompt, userContent, model, apiKey }) {
  const finalModel = model || 'gpt-4o-mini';
  const resp = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: finalModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    },
    {
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      timeout: 90_000,
    },
  );

  return { rawText: resp?.data?.choices?.[0]?.message?.content || '', provider: 'openai', model: finalModel };
}

async function callGemini({ systemPrompt, userContent, model, apiKey }) {
  const finalModel = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(finalModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const resp = await axios.post(url, {
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  }, { headers: { 'content-type': 'application/json' }, timeout: 90_000 });

  const text = (resp?.data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || '').filter(Boolean).join('\n');

  return { rawText: text, provider: 'gemini', model: finalModel };
}

function callMock({ userContent }) {
  const input = safeJsonParse(userContent) || {};
  const ticket = input?.ticket || {};
  const clientName = input?.mapping?.cliente || 'Cliente';
  const projetoName = input?.mapping?.projeto || 'Projeto';
  const responsavel = input?.mapping?.responsavel || {
    displayName: 'Nao definido',
    accountId: null,
    jiraProjectKey: null,
  };
  const refs = (input?.kbSnippets || []).slice(0, 3);

  const out = {
    cliente: clientName,
    projeto: projetoName,
    responsavel,
    areaAfetada: 'Desconhecido',
    categoria: 'Triagem mock (sem LLM externo)',
    ambiente: 'NaoInformado',
    severidade: 'NaoInformado',
    confianca: refs.length ? 'Media' : 'Baixa',
    palavrasChave: input?.keywords || [],
    hipoteses: [{
      causa: 'Hipotese generica (modo mock, sem LLM).',
      evidencia: refs.length ? 'Trechos de docs encontrados por palavra-chave.' : 'Sem trechos relevantes.',
      componente: refs[0]?.file || 'desconhecido',
    }],
    tratativa: {
      investigacaoImediata: ['Validar logs do fluxo/esteira correspondente.'],
      correcaoProvavel: ['Confirmar causa e ajustar configuracao.'],
      mitigacaoTemporaria: ['Aplicar workaround operacional.'],
    },
    referencias: refs.map((r) => ({ file: r.file, startLine: r.startLine, endLine: r.endLine })),
    resumoParaAnotacao: [
      `**Triagem Automatica (mock)**`,
      `Cliente: ${clientName} | Projeto: ${projetoName} | Responsavel: ${responsavel.displayName}${responsavel.jiraProjectKey ? ` (Jira ${responsavel.jiraProjectKey})` : ''}`,
      `Assunto: ${ticket.subject || '(nao informado)'}`,
      `Confianca: ${refs.length ? 'Media' : 'Baixa'}`,
      `Hipotese: Hipotese generica — verificar logs e confirmar ambiente.`,
    ].join('\n'),
  };

  return { rawText: JSON.stringify(out), provider: 'mock', model: 'mock' };
}

// ---- Main entry point ----

/**
 * Runs the LLM triage: loads system prompt, calls the configured provider,
 * and parses the JSON response.
 *
 * @param {{ ticket, mapping, keywords, kbSnippets }} inputData
 * @returns {Promise<{ json: object, rawText: string, provider: string, model: string }>}
 */
async function runTriage(inputData) {
  const cfg = config();
  const { provider, model, anthropicApiKey, openaiApiKey, geminiApiKey } = cfg.llm;

  const systemPrompt = await loadSystemPrompt();
  const userContent = JSON.stringify(inputData);

  let result;
  try {
    switch (provider) {
      case 'openai':
        result = await callOpenAI({ systemPrompt, userContent, model, apiKey: openaiApiKey });
        break;
      case 'gemini':
        result = await callGemini({ systemPrompt, userContent, model, apiKey: geminiApiKey });
        break;
      case 'mock':
        result = callMock({ userContent });
        break;
      default:
        result = await callAnthropic({ systemPrompt, userContent, model, apiKey: anthropicApiKey });
    }
  } catch (err) {
    throw new Error(formatAxiosError(err, `llm_provider_error:${provider}`));
  }

  const parsed = safeJsonParse(result.rawText);
  if (!parsed) {
    throw new Error(`llm_invalid_json: provider=${result.provider} model=${result.model}`);
  }

  return { json: parsed, rawText: result.rawText, provider: result.provider, model: result.model };
}

module.exports = { runTriage };
