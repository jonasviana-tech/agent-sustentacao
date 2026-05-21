'use strict';

const path = require('path');
const dotenv = require('dotenv');

// PROJECT_ROOT é sempre a raiz do repositório (dois níveis acima de src/config/)
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Carrega .env da raiz do projeto (ignorado pelo .gitignore — nunca sobe ao Git)
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const REQUIRED_FOR_LLM = {
  anthropic: ['ANTHROPIC_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  gemini: ['GEMINI_API_KEY'],
  mock: [],
};

function load() {
  const provider = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
  const port = Number(process.env.PORT) || 3000;

  // Pasta raiz dos arquivos de documentação (KB)
  // Por padrão: <PROJECT_ROOT>/docs/
  const docsRoot = process.env.DOCS_ROOT
    ? path.resolve(process.env.DOCS_ROOT)
    : path.join(PROJECT_ROOT, 'docs');

  // Mapeamento cliente → projeto → responsável
  // Por padrão: <PROJECT_ROOT>/config/clientes.json
  const clientesPath = process.env.CLIENTES_PATH
    ? path.resolve(process.env.CLIENTES_PATH)
    : path.join(PROJECT_ROOT, 'config', 'clientes.json');

  const missing = [];

  if (!process.env.WEBHOOK_SHARED_SECRET && !process.env.API_KEY) {
    missing.push('WEBHOOK_SHARED_SECRET ou API_KEY (ao menos um obrigatorio)');
  }

  const requiredKeys = REQUIRED_FOR_LLM[provider];
  if (!requiredKeys) {
    missing.push(`LLM_PROVIDER="${provider}" invalido. Use: anthropic | openai | gemini | mock`);
  } else {
    for (const key of requiredKeys) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length) {
    const msg = `[config] Variaveis obrigatorias ausentes:\n  - ${missing.join('\n  - ')}`;
    console.error(msg);
    if (provider !== 'mock') throw new Error(msg);
  }

  return Object.freeze({
    port,
    docsRoot,
    clientesPath,

    llm: {
      provider,
      model: process.env.LLM_MODEL || undefined,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
    },

    auth: {
      webhookSecret: process.env.WEBHOOK_SHARED_SECRET || '',
      apiKey: process.env.API_KEY || '',
    },

    freshdesk: {
      domain: process.env.FRESHDESK_DOMAIN || '',
      apiKey: process.env.FRESHDESK_API_KEY || '',
    },
  });
}

let _cached = null;

function config() {
  if (!_cached) _cached = load();
  return _cached;
}

config.reload = () => {
  _cached = null;
  return config();
};

module.exports = config;
