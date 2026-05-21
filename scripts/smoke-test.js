'use strict';

/**
 * Smoke test: chama os endpoints locais ou de producao para validar o servico.
 *
 * Uso:
 *   node scripts/smoke-test.js
 *
 * Variaveis de ambiente (opcionais):
 *   SMOKE_BASE_URL  — ex.: https://sustentacao-agent.onrender.com (default: http://localhost:3000)
 *   WEBHOOK_SHARED_SECRET
 *   API_KEY
 */

require('dotenv').config();
const axios = require('axios');

async function main() {
  const base = (process.env.SMOKE_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
  const secret = process.env.WEBHOOK_SHARED_SECRET;
  const apiKey = process.env.API_KEY;

  console.log(`\n--- Smoke test: ${base} ---\n`);

  // 1. Health
  console.log('1. GET /health');
  const health = await axios.get(`${base}/health`, { validateStatus: () => true });
  console.log(`   status=${health.status}`, health.data);

  // 2. Webhook
  if (secret) {
    console.log('\n2. POST /webhook/freshdesk');
    const r = await axios.post(`${base}/webhook/freshdesk`, {
      ticket: {
        id: 999999,
        subject: 'Teste - Funchal fila retorno a cada 5 dias',
        description_text: 'Caixa Consorcio. Tickets na skill AGUARDANDO_LIBERACAO_CONSTRUCAO_REFORMA_IMOVEL_FUNCHAL retornam para fila a cada 5 dias. Producao.',
        company: { name: 'CAIXA' },
        requester: { email: 'teste@t4h.com.br', name: 'Teste' },
      },
    }, { headers: { 'X-Webhook-Secret': secret }, timeout: 120_000, validateStatus: () => true });
    console.log(`   status=${r.status}`);
    if (r.data?.triagem) {
      const t = r.data.triagem;
      console.log(`   cliente: ${t.cliente}`);
      console.log(`   projeto: ${t.projeto}`);
      console.log(`   responsavel: ${t.responsavel?.displayName}`);
      console.log(`   area: ${t.areaAfetada} | severidade: ${t.severidade}`);
    } else {
      console.log('  ', JSON.stringify(r.data));
    }
  } else {
    console.log('\n2. SKIP /webhook/freshdesk (WEBHOOK_SHARED_SECRET nao definido)');
  }

  // 3. On-demand
  if (apiKey) {
    console.log('\n3. POST /v1/triagem');
    const r = await axios.post(`${base}/v1/triagem`, {
      subject: 'Erro no fluxo TCC Caixa Consorcio',
      description: 'Esteira de contemplacao travando no step de validacao em producao.',
      company: { name: 'CAIXA' },
    }, { headers: { 'X-API-Key': apiKey }, timeout: 120_000, validateStatus: () => true });
    console.log(`   status=${r.status}`);
    if (r.data?.triagem?.resumoParaAnotacao) {
      console.log('\n   resumoParaAnotacao:\n');
      console.log(r.data.triagem.resumoParaAnotacao);
    }
  } else {
    console.log('\n3. SKIP /v1/triagem (API_KEY nao definido)');
  }

  console.log('\n--- Fim ---\n');
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exitCode = 1;
});
