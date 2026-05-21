# Caixa Consórcio — Extração Completa dos Fluxos de Automação (FLOW)

> Extraído dos backups de automação em 13/04/2026.
> Fonte: `projects/backup-automacao/CaixaConsorcio/`
> Complementar ao documento do WebApp (`extracao-webapp-caixa-homologacao-consorcio.md`).

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Inventário de Fluxos por Categoria](#2-inventário-de-fluxos-por-categoria)
3. [Bens Móveis — Fluxos de Automação (35)](#3-bens-móveis--fluxos-de-automação-35)
4. [Bens Imóveis — Fluxos de Automação (28)](#4-bens-imóveis--fluxos-de-automação-28)
5. [TCC — Transferência de Cotas Completa (28)](#5-tcc--transferência-de-cotas-completa-28)
6. [Transferência de Cotas (15)](#6-transferência-de-cotas-15)
7. [Substituição de Garantia (14)](#7-substituição-de-garantia-14)
8. [Fluxos Auxiliares e de Roteamento](#8-fluxos-auxiliares-e-de-roteamento)
9. [APIs e Scripts de Automação](#9-apis-e-scripts-de-automação)
10. [Templates de E-mail](#10-templates-de-e-mail)
11. [Webhooks e Mudanças de Automação](#11-webhooks-e-mudanças-de-automação)
12. [Integrações Externas](#12-integrações-externas)
13. [Estrutura dos Dados Extraídos](#13-estrutura-dos-dados-extraídos)

---

## 1. Visão Geral

| Item | Valor |
|------|-------|
| **Plataforma** | Force Flow (Workforce) |
| **Cliente** | Caixa |
| **Produto** | Consórcio |
| **Total de categorias** | 32 pastas |
| **Total de fluxos** | ~130 fluxos de automação |
| **Status** | Todos `published` (ativos) |
| **Trigger padrão** | Mudança de `tabId` + `skillId` no ticket |

### Macro-categorias dos fluxos

| Grupo | Fluxos | Descrição |
|-------|--------|-----------|
| **Bens Móveis** (pasta `bens`) | 35 | Ciclo completo de aquisição de veículos: abertura → crédito → documentação → vistoria → faturamento → contrato → pagamento → registro → dossiê |
| **Bens Imóveis** (pasta `bens`) | 28 | Ciclo completo de utilização de crédito imobiliário: abertura → crédito → conformidade → contrato → registro → pagamento |
| **TCC** | 28 | Transferência de Cotas Completa: abertura → crédito → documental → emissão termo → conferência → registro |
| **Transferência de Cotas** | 15 | Versão anterior/paralela de transferência de cotas |
| **Substituição de Garantia** | 14 | Substituição de garantias: análise → vistoria → contrato → registro → dossiê |
| **Backoffice** | 4 | Roteamento do backoffice (auto, imóvel, jurídico, produto) |
| **Auxiliares** | ~6 | Fluxos de apoio (abertura, vistoria, mesa crédito, etc.) |

---

## 2. Inventário de Fluxos por Categoria

### Fluxos Standalone (1 fluxo por categoria)

| Categoria | Fluxo | Flow ID | Descrição |
|-----------|-------|---------|-----------|
| `aguardando-evolucao-e-reforma` | Aguardando evolução e reforma | `fc264cf9-...` | Orquestra imóvel em construção/reforma/vistoria; roteia por tab e BPO (esteira, Funchal, Funchal PCD) |
| `alcada-de-cancalemento` | Alçada de Cancelamento | `0d49157f-...` | Consulta blacklist; se protocolo alvo → e-mail falha sistêmica + cancelamento; conclui WebApp |
| `analise-de-credito` | Análise de crédito - TCC Imóvel | `8a3f5233-...` | Mesa crédito TCC imóvel: BPO, reprovação, link TCC, e-mail, conclusão WebApp |
| `analise-de-fraude` | Análise de fraude - Bens Imóveis | `8bc92d3a-...` | Roteamento pós-fraude por tab, BPO, PCD e skills manuais do ciclo imóvel |
| `analise-diretoria-dirot` | Análise Diretoria DIROT | `886433c5-...` | Decisão diretoria (aprovado/pendência/reprovado) → Financeiro Grupo Funchal ou PCD |
| `automovel-inicio` | Automóvel início | `f2a43c71-...` | Placeholder: Start → Finish imediato |
| `backoffice-auto` | Backoffice Auto | `4f32536b-...` | Roteamento massivo backoffice automóvel: pendência doc, links, e-mails fases 1–3 |
| `backoffice-bens-moveis-juridico` | Backoffice bens móveis jurídico | `89cc2dad-...` | Jurídico → esteira interna / Funchal PCD / Funchal |
| `backoffice-bens-moveis-produto` | Backoffice bens móveis produto | `c4624db3-...` | Produto → esteira interna / PCD / Funchal |
| `backoffice-imovel` | Backoffice Imóvel | `373e7bc4-...` | Roteamento massivo backoffice imóvel por tab, PCD e `skill_atual` |
| `bens-imoveis` | Bens Imóveis - Validação de Minuta | `385acd86-...` | Validação de minuta: emissão, cancelamento, aditivo, backoffice |
| `bens-moveis` | Bens Móveis - Consulta de Laudo | `234bade6-...` | Consulta laudo: PCD, doc pendente, BPOs; integrações WebApp |
| `caixa` | Acompanhamento assinatura contrato + pagamento taxa (Imóveis) | `507f78e8-...` | PCD, pendência cliente/boleto, contrato+boleto OK |
| `contestacao-laudo-vistoria-control` | Contestação laudo vistoria control | `5cf098ba-...` | Roteia vistoria BPO1–4 e PCD conforme skill |
| `contestacao-laudo-vistoria-imovel` | Contestação laudo vistoria imóvel | `8107d6b4-...` | Laudo aprovado/reprovado → esteira interna / Funchal PCD |
| `fluxo-de-abertura` | Fluxo de Abertura - Bens Imóveis | `1c4db776-...` | Abertura com PCD, cotas aprovadas/não aprovadas, BPO1–3; e-mail abertura |
| `inicio-substituicao` | Início substituição | `9fea9060-...` | Start → processo manual |
| `juridico` | Jurídico - Bens Imóveis | `333c1046-...` | Tab jurídico → BPO (esteira/Funchal PCD/Funchal) → Backoffice |
| `liberacao` | Liberação Pagamento Imóvel | `9e624741-...` | Grande fluxo: doc pendente (link + e-mails), filas por BPO (HCP, pagamentos) |
| `liberacao-pagamento-automovel` | Liberação Pagamento Automóvel - Pagamento Rejeitado | `a3d7c68d-...` | Link WebApp + e-mail atualização + fila pagamentos rejeitados |
| `mesa-de-credito` | Mesa de Crédito - Bens Imóveis | `822f3861-...` | Crivo fiador, aprovação/recusa, override, pendência, reanálise |
| `mudanca-automacao-vistoria` | Mudança automação vistoria | `554131e4-...` | Start → processo manual vistoria |
| `produto` | Produto - Bens Imóveis | `d722160b-...` | Doc pendente/aprovado/recusado → BPO → Backoffice |
| `solicitacao-de-processo` | Solicitação de Processo | `23a2995a-...` | Interação com cliente → fim |
| `substituicao-de-garantias` | Manutenção de garantia | — | Pós-manutenção: link WebApp, e-mail, mudança automação Detran/HCP PCD |
| `teste-click` | Teste Click | `85685925-...` | ClickSign: envelope + webapp link + e-mail (teste) |
| `validacao-processo-bem-imovel` | Validação Processo Bem Imóvel | `007fa49c-...` | Salvar skill + roteamento por aba (emissão, cancelamento, aditivo) |
| `vistoria-retorno-laudo-infocar` | Vistoria Retorno Laudo Infocar | `43513253-...` | Aprovado → cobrança; reprovado → cancelamento; pendência → análise laudo |

---

## 3. Bens Móveis — Fluxos de Automação (35)

Ciclo completo de aquisição de veículos (automóveis leves). Cada fluxo é acionado por mudança de `tabId` + `skillId` no ticket.

### Fase 1: Abertura e Dados Cadastrais

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Abertura de solicitação** | `cfe53fd7-...` | Validação de cotas, consulta BPO, derivação PF/PJ, confirmação | Abertura 3114, Consulta BPO Uso Móvel, Deriva BPO PF/PJ, Validação Cotas |
| **Confirmação e atualização de dados cadastrais** | `1372a0de-...` | Atualização cadastral via Newcon | Atualização Dados Cadastrais Newcon |

### Fase 2: Análise de Crédito

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Análise de crédito - Mesa** | `ec9a4bbb-...` | Aprovação, recusa, override, pendência, reanálise | Rascunho Automóvel, Concluded, Geração Link |
| **Análise de crédito - Pagamento** | `6ca9ed7a-...` | Crédito na etapa pagamento; fraude/backoffice/cancelamento | Deriva BPO PF/PJ, Rascunho Automóvel, Concluded |
| **Análise de crédito - Vencidos** | `9912c6c9-...` | Reanálise de casos vencidos via Crivo | API Crivo, Pending, Geração Link |
| **Reanálise mesa** | `59e3c0a6-...` | Links, rascunho automóvel, filas crédito/cancelamento | Rascunho Automóvel, Geração Link, Pending |
| **Análise Override** | `e1d78b8c-...` | Encerrar, pendência ou volta mesa/pagamento | Pending WebApp |
| **Análise de fraude** | `9b5589a3-...` | Roteador fraude/governança | Mudança automação Reembolso |

### Fase 3: Documentação e Bem

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Análise da documentação do bem** | `44699448-...` | Vistoria, cadastro, faturamento, jurídico/produto; mudanças automação vistoria BPO1–4 | Verificar tipo/usabilidade, Pending, Geração Link |
| **Validação de documentação** | `6a1cec76-...` | Roteamento genérico de validação | API Teckey, Pending, Concluded |
| **Validação de nota fiscal** | `03763ab6-...` | Validação NF | Pending, Concluded |
| **Cadastro do bem** | `e1637262-...` | Cadastro: tabs, pendência doc, cancelamento | Salvar skillId, Pending, Geração Link |

### Fase 4: Vistoria

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Vistoria** | `ba9994e7-...` | Criação vistoria InfoVist, fotos RC, ID WebApp; webhook retorno | Criação Vistoria InfoVist, Envio Fotos RC, Webapp ID Vistoria |
| **Contestação de laudo** | `2a54d71c-...` | Contestação → refação/vistoria | Concluded |

### Fase 5: Faturamento e Contrato

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Emissão de autorização de faturamento** | `63fd5cde-...` | Autorização por tab/BPO (cota quitada vs não quitada) | Anvil autorização quitada/não quitada, Billing Anvil, Campo Editável |
| **Geração de cobrança taxa serviço faturamento** | `a5583217-...` | Cobrança taxa serviço | Concluded, Geração Link |
| **Emissão e envio de contrato** | `5c7b8ad7-...` | ClickSign completo (envelope → signers → run → e-mail → download) | Scripts 01–07 ClickSign/Teckey, Concluded, Geração Link |
| **Registro eletrônico de contrato** | `27a6d703-...` | Boleto, orçamento, pendências, programação | Salvar skillId, Pending, Geração Link |
| **Registro de contrato físico** | `bb9b2787-...` | Backoffice, pendências, programação | Salvar skillId, Pending, Concluded |

### Fase 6: Pagamento

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Análise pagamento** | `a15e7d14-...` | Aprovação/reprovação, liberação, programação | Concluded, Pending, Geração Link |
| **Aprovação do pagamento alçada diretoria** | `1611dc71-...` | Alçada diretoria: aprovação/reprovação | Deriva BPO PF/PJ, Concluded, Geração Link |
| **Pendência de aprovação** | `f0a16222-...` | MIGO, programação, DIROT, autorização faturamento BPO/PCD | Geração Link, Pending, Concluded |
| **Agendamento do pagamento** | `17f89848-...` | Trilha operacional segura | Salvar skillId, Geração Link, Pending, Concluded |
| **Programação de pagamento** | `e9098226-...` | Pesquisa satisfação, pendências, financeiro | Ativar Pesquisa Satisfação, Pending, Concluded |
| **Liberação de pagamento** | `2df6bd8b-...` | Finalidade aquisição, BPO/PCD, WebApp, filas manuais | Pending, Concluded, Geração Link |
| **Pagamentos rejeitados** | `8ad12a11-...` | Backoffice e WebApp | Salvar skillId, Pending, Concluded |
| **Financeiro administradora** | `ba598e2b-...` | Etapas financeiras administradora | Concluded, Geração Link |
| **Financeiro de grupo** | `e5f2668c-...` | Programação e aprovação | Ativar Pesquisa Satisfação, Concluded |
| **Reembolso de despesas** | `284b1b5f-...` | Backoffice, doc pendente, análise pagamento | Salvar skillId, Pending, Concluded |

### Fase 7: Pós-pagamento e Registro

| Fluxo | Flow ID | Descrição | APIs Principais |
|-------|---------|-----------|-----------------|
| **Alienação do bem** | `787ca6a4-...` | Conclusão, pendências, cartório, gravames, backoffice | Geração Link, Pending, Concluded |
| **Alienação pós pagamento IQ** | `b903e31b-...` | Regularização e filas BPO/PCD | Concluded, Geração Link |
| **Registro do bem nos Detrans** | `3d2bc57c-...` | Pós-registro: reembolso, dossiê HCP, BPO/PCD | Geração Link |
| **Registro do bem nos Detrans - IQ** | `0ab0c816-...` | Fluxo mínimo IQ | Geração Link |
| **Envio de dossiê para o HCP** | `64dbdacb-...` | Envio dossiê HCP/GED | Criar Survey Satisfaction |
| **Envio de dossiê para o PODOC** | `ae4b3966-...` | Passagem etapa PODOC | — |

---

## 4. Bens Imóveis — Fluxos de Automação (28)

Ciclo completo de utilização de crédito imobiliário.

### Fase 1: Dados Cadastrais

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Confirmação e atualização de dados cadastrais** | `8c864bd5-...` | Dados cadastrais imóvel via Newcon |

### Fase 2: Análise de Crédito

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Análise de crédito - Pagamento** | `4724a475-...` | Crédito na etapa pagamento imóvel |
| **Análise de crédito - Vencidos** | `7ef38e1c-...` | Reavaliação de crédito vencido |
| **Reanálise mesa** | `370a7394-...` | Reanálise: recusa, pendência, aprovação |

### Fase 3: Conformidade e Viabilidade

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Análise Conformidade** | `66e3f440-...` | Conformidade documental/operacional |
| **Análise da viabilidade do bem** | `73d80d78-...` | Viabilidade: laudo e rotas |
| **Pendência contrato conformidade FGTS** | `9d1f7175-...` | Pendência contrato FGTS |
| **Pendência de interveniente quitante** | `6c515998-...` | Interveniente quitante |

### Fase 4: Vistoria e Documentação

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Solicitação de vistoria** | `28a010ca-...` | Solicitação vistoria: taxa e acompanhamento |
| **Pendência de vistoria** | `77fd2db4-...` | Pendência vistoria |
| **Emissão de termo declaração pagamento crédito espécie** | `c412efca-...` | Termo declaração crédito espécie |

### Fase 5: Contrato

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Emissão de contrato** | `8887bf36-...` | Emissão contrato imóvel |
| **Alçada diretoria - Emissão contrato** | `f2515757-...` | Alçada diretoria para emissão |
| **Aguardando Contrato** | `2ca17b09-...` | Aguarda formalização contrato |
| **Exigências cartorárias** | `a900a54d-...` | Exigências cartorárias |
| **Acompanhamento assinatura registro imóveis** | `db52b1d0-...` | Acompanha assinatura/registro contrato |
| **Acompanhamento registro contrato ONR** | `42650e3f-...` | Acompanhamento registro ONR |
| **Aguardando registro contrato físico** | `787a0545-...` | Aguarda registro físico |

### Fase 6: Pagamento

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Análise pagamento** | `4fc1c09e-...` | Análise pagamento imóvel |
| **Aprovação pagamento alçada diretoria** | `8f9472c3-...` | Alçada diretoria pagamento |
| **Pendência de aprovação** | `1084067c-...` | Pendência de aprovação |
| **Agendamento do pagamento** | `699b3820-...` | Filas financeiras |
| **Programação de pagamento** | `11733607-...` | Programação pagamento imóvel |
| **Liberação pagamento construção e reforma** | `f3120473-...` | Liberação construção/reforma |
| **Pagamentos rejeitados** | `a4886d90-...` | Motivos e correção |
| **Financeiro administradora** | `546fb863-...` | Financeiro administradora imóvel |
| **Financeiro de grupo** | `e7f11e69-...` | Financeiro grupo imóvel |

### Fase 7: Dossiê

| Fluxo | Flow ID | Descrição |
|-------|---------|-----------|
| **Envio de dossiê para o HCP** | `acf1fd5d-...` | Dossiê HCP com pesquisa satisfação |

---

## 5. TCC — Transferência de Cotas Completa (28)

Processo completo de transferência de cotas do consórcio entre consorciados.

### Fase 1: Abertura

| Fluxo | Descrição | APIs |
|-------|-----------|------|
| **TCC - Abertura** | Abertura protocolo, link webapp TCC, e-mail abertura, consulta BPO → emissão boleto | Abertura 3115, Consulta BPO TCC, TCC Gerar Link |

### Fase 2: Crédito

| Fluxo | Descrição |
|-------|-----------|
| **Análise Crédito BPO** | Aprovado/reprovado/mesa/BO/cancelamento → documental ou recusa+Concluded |
| **Análise Crédito BPO - Móvel** | Espelho BPO para bens móveis |
| **Análise Crédito Mesa** | Mesa: recusa, pendência, aprovação, override, fraude |
| **Reanálise Crédito Mesa** | Reanálise: recusa, pendência, aprovação |
| **Análise de fraude** | `skill_atual` → retorno filas ou Backoffice fraude |

### Fase 3: Documental

| Fluxo | Descrição |
|-------|-----------|
| **Análise Documental Com Bem (imóvel)** | Pendência/aprovado/reprovado/BO/cancelamento → emissão termo imóvel |
| **Análise Documental Com Bem Móvel** | Idem para bens móveis |
| **Análise Documental Cota Quitada** | Cancelamento/pendência/aprovação/BO → termo via boleto cota quitada |
| **Análise Documental Sem Bem** | → Emissão segunda via sem bem / filas doc |
| **Análise Jurídico** | Tab jurídico → Backoffice por BPO |
| **Análise Produto** | Produto → Backoffice BPO |
| **Análise Backoffice** | Hub ~120 blocos: `skill_atual` → dezenas de filas TCC |

### Fase 4: Cobrança e Conferência

| Fluxo | Descrição |
|-------|-----------|
| **Cobrança Tarifa Transferência** | Envio boleto → link+pendência; cancelamento/BO; conferência baixa |
| **Conferência Baixa Boleto** | Compensado → crédito/doc; falta pagamento → recusa+Finish |
| **Alçada Cancelamento** | Decisão tab cancelamento → Finish |

### Fase 5: Emissão de Termos

| Fluxo | Descrição |
|-------|-----------|
| **Emissão Termo Cessão + 2ª via Boleto - Imóvel** | Governança/contrato/pendência/BO/cancelamento |
| **Emissão Termo Cessão + 2ª via Boleto - Móvel** | Aguardando contrato/boleto, pendências |
| **Emissão Termo Cessão + 2ª via Boleto - Sem Bem** | Gov.br, pendências, confirmação sem bem |
| **Emissão Termo Cessão Via Boleto - Cota Quitada** | Encadeia conf. sem bem e emissão via boleto |
| **Aguardando Contrato Boleto** | Pendências doc/taxas: TCC PENDING + link + pendência |

### Fase 6: Confirmação e Registro

| Fluxo | Descrição |
|-------|-----------|
| **Confirmação Negociação - Bem Imóvel** | Pendências ou confirmado → envio dossiê HCP por BPO |
| **Confirmação Negociação - Cota Cancelada** | Confirmado → HCP; cancelado → Finish |
| **Confirmação Negociação - Cota Cancelada/Quitada** | Mescla cenários; pending+pendência |
| **Confirmação Negociação - Sem Bem** | Termo OK, pendências, cancelamento, BO |
| **Manutenção Alienação Confirmação Negociação** | SNG pendência ou DETRAN + manutenção alienação |
| **Registro Bens Detran** | Registro/balcão → envio dossiê HCP por BPO |
| **Envio Dossiê HCP** | Decisão documentos HCP → Finish |

---

## 6. Transferência de Cotas (15)

Versão anterior/paralela da transferência (convive com TCC).

| Fluxo | Descrição |
|-------|-----------|
| **Análise de crédito BPO** | Aprovação/reprovação/mesa → documental ou concluded |
| **Análise de crédito MESA** | Crivo, recusa, pendência, aprovação, override, fraude |
| **Análise Documental - Cota Cancelada** | Pendência/aprovação/reprovação → emissão ou finish |
| **Análise Documental - Cota Quitada** | Idem quitada |
| **Análise Documental - Fila Automóvel** | PF/PJ veículos |
| **Análise Documental - Fila Imóvel** | Imóvel + concluded reprova |
| **Análise Documental - Sem Bem** | Sem bem |
| **Conferência Boleto** | Compensado → crédito BPO/doc; recusada → concluded |
| **Confirmação negociação - Com bem Imóvel** | Pendência/confirmação/cancelamento → dossiê HCP |
| **Confirmação negociação - Cota Cancelada** | Idem confirmação |
| **Confirmação negociação - Cota Quitada** | Idem |
| **Confirmação negociação - Sem Bem** | Idem |
| **Emissão termo cessão + 2ª via boleto - Sem Bem** | Link + confirmação / GOV |
| **Envio de dossiê para o HCP** | Script Envio Dossiê GED → Finish |
| **Geração Boleto Taxa Transferência** | Envio boleto / recusada concluded |

---

## 7. Substituição de Garantia (14)

Processo de substituição de garantias do consórcio (troca de bem).

| # | Fluxo | Descrição |
|---|-------|-----------|
| 1 | **Análise Conformidade** | Conformidade: boleto vistoria, vistoria/AVM, pending, link, filas PCD |
| 2 | **Análise da Documentação - Auto** | Pendência/OK novo-semi → pending, link, e-mails, PCD |
| 3 | **Análise da Documentação - Imóvel** | Idem para imóvel |
| 4 | **Assinatura contrato + acompanhamento taxa** | Pendência/contrato assinado → pending, link, manutenção PCD |
| 5 | **Cadastro do Bem** | Newcon + link + e-mail bem cadastrado → geração boleto/contrato PCD |
| 6 | **Contestação de Laudo** | Refazer laudo Dekra/Control; contestação → negativa + concluded |
| 7 | **Envio Dossiê HCP - Auto** | Envio GED + link + e-mail + concluded |
| 8 | **Envio Dossiê HCP - Imóvel** | Igual auto, para imóvel |
| 9 | **Geração Boleto e Contrato (genérico)** | Pendência/aprovado/reprovado laudo → pending, interação, análise |
| 10 | **Geração Boleto e Contrato - Auto** | GeracaoBoletoContrato + e-mail + PCD |
| 11 | **Geração Boleto e Contrato - Imóvel** | GeracaoBoletoContrato + link + assinatura/taxa PCD |
| 12 | **Manutenção de Garantia - Imóvel** | Link + e-mail bem substituído → mudança automação HCP PCD |
| 13 | **Registro do Bem nos Detrans - Auto** | Registro Detrans + link + e-mail → envio dossiê HCP manual |
| 14 | **Vistoria** | InfoVist criação/fotos/PDF, webhook, laudo aprovado/contestado/reprovado |

---

## 8. Fluxos Auxiliares e de Roteamento

| Categoria | Fluxo | Função |
|-----------|-------|--------|
| `backoffice-auto` | Backoffice Auto | Hub central de roteamento do backoffice automóvel — árvores por tab/skill/PCD |
| `backoffice-imovel` | Backoffice Imóvel | Hub central de roteamento do backoffice imóvel |
| `backoffice-bens-moveis-juridico` | BM Jurídico | Roteamento jurídico → BPO |
| `backoffice-bens-moveis-produto` | BM Produto | Roteamento produto → BPO |
| `analise-diretoria-dirot` | Diretoria DIROT | Decisão da diretoria → financeiro |
| `mesa-de-credito` | Mesa de Crédito - Imóveis | Crivo, aprovação/recusa, override, pendência |
| `juridico` | Jurídico - Imóveis | Tab jurídico → BPO → Backoffice |
| `produto` | Produto - Imóveis | Doc pendente/aprovado/recusado → BPO |
| `fluxo-de-abertura` | Abertura - Imóveis | Abertura com PCD, cotas aprovadas, BPO1–3 |
| `liberacao` | Liberação Pagamento Imóvel | Doc pendente, filas por BPO (HCP, pagamentos) |
| `liberacao-pagamento-automovel` | Pagamento Rejeitado Auto | Link + e-mail + fila pagamentos rejeitados |
| `alcada-de-cancalemento` | Alçada Cancelamento | Blacklist, falha sistêmica, cancelamento |
| `solicitacao-de-processo` | Solicitação de Processo | Interação com cliente → fim |

---

## 9. APIs e Scripts de Automação

### Scripts Globais (usados em múltiplas categorias)

| Script | Script ID | Função | Categorias |
|--------|-----------|--------|------------|
| **Caixa - Salvar skillId atual** | `4948b664-...` | Salva a skill atual no ticket para roteamento futuro | Bens, TCC, Substituição |
| **Caixa - Pending WebApp** | `d82bcb6e-...` | Marca pendência no WebApp para o consorciado | Bens, TCC, Transferência |
| **CONCLUDED WEBAPP [USO CREDITO]** | `7d3f2931-...` | Conclui o protocolo no WebApp | Bens, TCC, Transferência |
| **GERAÇÃO LINK WEBAPP** | `d248333b-...` | Gera link de acesso ao WebApp para o consorciado | Bens, TCC, Transferência |
| **PENDING WEBAPP [HML]** | `5831a052-...` | Marca pendência no WebApp (variante HML) | Bens, Transferência |
| **Deriva BPO - PF ou PJ** | `125f1abf-...` | Identifica se o ticket é PF ou PJ para roteamento | Bens, TCC |

### Scripts de Abertura

| Script | Script ID | Função |
|--------|-----------|--------|
| **Abertura solicitação uso do crédito - 3114** | `7902f068-...` | Abertura de protocolo de uso de crédito (bens) |
| **Abertura solicitação transferência de cotas - 3115** | `7a16293e-...` | Abertura de protocolo de transferência (TCC) |
| **Consulta de BPO - Uso Móvel** | `73e6971c-...` | Consulta BPO para uso móvel |
| **Consulta de BPO - Transferência de Cotas** | `9ed9b12f-...` | Consulta BPO para transferência |
| **Validação de Cotas - Atualizado** | `38732958-...` | Valida cotas do consorciado |

### Scripts de Integração

| Script | Script ID | Função |
|--------|-----------|--------|
| **01 - ATUALIZAÇÃO DADOS CADASTRAIS NEWCON** | `28a4a709-...` | Atualiza dados cadastrais no sistema Newcon |
| **03 - API TECKEY** | `b9cd5af6-...` | Integração com API Teckey (validação documental) |
| **05 - API CRIVO** | `f680ae78-...` | Integração com API Crivo (análise de crédito) |
| **06 - Envio Dossie GED** | `6619d593-...` | Envio de dossiê para o GED/HCP |
| **Verificar tipo e usabilidade** | `7ee25ce0-...` | Verifica tipo e usabilidade do bem |

### Scripts ClickSign (contrato digital)

| Script | Script ID | Função |
|--------|-----------|--------|
| **01 - CRIAÇÃO DE ENVELOPE** | `b911e615-...` | Cria envelope ClickSign |
| **02 - INSERIR CAMPOS ENVELOPE** | `f19d42e3-...` | Insere campos no envelope |
| **02 - INSERIR CAMPOS ENVELOPE - Funchal** | `6fffaafc-...` | Variante Funchal |
| **03 - ADD SIGNER** | `886a5a79-...` | Adiciona signatário |
| **03 - ADD SIGNER - Funchal** | `72154ca1-...` | Variante Funchal |
| **04 - REQUIREMENT** | `c17b5aec-...` | Adiciona requisitos de assinatura |
| **04 - REQUIREMENT - Funchal** | `fafb2667-...` | Variante Funchal |
| **05 - RUN ENVELOPE** | `348d7d75-...` | Executa/envia envelope |
| **06 - Envio de e-mail ClickSign** | `ec02d590-...` | E-mail de notificação ClickSign |
| **06 - Envio de e-mail ClickSign - Funchal** | `9559973e-...` | Variante Funchal |
| **07 - KEY WEBAPP** | `578f48b9-...` | Salva chave WebApp pós-assinatura |
| **Click - Download Contrato de Alienação** | `73e1084b-...` | Download do contrato de alienação |

### Scripts de Faturamento (Anvil)

| Script | Script ID | Função |
|--------|-----------|--------|
| **Anvil - Autorização de faturamento - Cota Quitada** | `64469bac-...` | Autorização de faturamento (cota quitada) |
| **Billing Anvil** | `bdf2705d-...` | Faturamento Anvil |
| **Caixa - Autorização de Faturamento - Cota não quitada** | `7b521eac-...` | Autorização (cota não quitada) |
| **CAMPO EDITAVEL** | `3de2bff3-...` | Campo editável na autorização |

### Scripts de Vistoria

| Script | Script ID | Função |
|--------|-----------|--------|
| **Criação vistoria Básico - InfoVist** | `e426848f-...` | Cria solicitação de vistoria na InfoVist |
| **Envio de fotos de vistoria para o RC - InfoVist** | `8304fc50-...` | Envia fotos de vistoria para o RC |
| **Webapp - Envio de ID de vistoria** | `890185c7-...` | Envia ID de vistoria ao WebApp |

### Scripts TCC Específicos

| Script | Script ID | Função |
|--------|-----------|--------|
| **TCC - Gerar Link** | `f41465ff-...` | Gera link de acesso para TCC no WebApp |
| **TCC - PENDING** | `73dead2a-...` | Marca pendência no WebApp (contexto TCC) |
| **TCC - CONCLUED** | `1bcadb30-...` | Conclui protocolo no WebApp (contexto TCC) |

### Outros Scripts

| Script | Script ID | Função |
|--------|-----------|--------|
| **Rascunho Automóvel** | `07672a0e-...` | Gera rascunho de protocolo para automóvel |
| **Rascunho Imóvel** | `debf9a8e-...` | Gera rascunho para imóvel |
| **Gerar link de rascunho** | `52bf8966-...` | Link de rascunho para o consorciado |
| **Ativar pesquisa satisfação** | `0d4101a1-...` | Ativa pesquisa de satisfação pós-entrega |
| **Criar Survey Satisfaction id** | `9c1338eb-...` | Cria ID da pesquisa de satisfação |

---

## 10. Templates de E-mail

### Bens Móveis (17 templates)

| Template | Template ID | Assunto | Uso Principal |
|----------|-------------|---------|---------------|
| **Abertura solicitação - Auto** | `5f432827-...` | Abertura de solicitação | Abertura de solicitação |
| **Automóvel aprovados** | `074dce0e-...` | Atualização de status | Crédito aprovado |
| **Email aviso pendência fase 1** | `725ebfec-...` | Pendência(s) no processo | 1ª notificação de pendência (22 fluxos) |
| **Email aviso pendência fase 2** | `ddc6298e-...` | Pendência(s) no processo | 2ª notificação (22 fluxos) |
| **Email aviso pendência fase 3** | `a26f9421-...` | Pendência(s) no processo | 3ª notificação (22 fluxos) |
| **EMAIL MODELO** | `de2586df-...` | Bem não aceito pelas regras da administradora | Viabilidade recusada |
| **Imóvel PF - Aprovados** | `163056d8-...` | Atualização de status | Crédito imóvel aprovado |
| **Imóvel PF - Encerramento após pagamento** | `8c57d36b-...` | Atualização de status | Pós-pagamento construção/reforma |
| **Imóvel PF Atualização de status** | `6cc79448-...` | Atualização de status | Status geral imóvel PF (10 fluxos) |
| **Imóvel PF negativa** | `9fde0180-...` | Atualização de status | Crédito recusado imóvel |
| **Imóvel PF Pendência** | `72feaa57-...` | Atualização de status | Pendência ONR/FGTS |
| **Imóvel PF Pendência** | `531673f7-...` | Atualização de status | Pendência geral imóvel (19 fluxos) |
| **Imóvel PJ - Pendência** | `b8f569fc-...` | Pendência de dados cadastrais | Dados cadastrais PJ |
| **Veículos leves PF - Atualização de status** | `720af872-...` | Atualização de status | Status geral (35 fluxos!) |
| **Veículos leves PF - Pendência** | `96264369-...` | Documentação Pendente | Documentação pendente crédito |
| **Veículos leves PF - Negativa** | `8e32b2ed-...` | Análise de crédito recusada | Recusa de crédito |
| **Veículos Pesados PF - Atualização** | `adfa9562-...` | Atualização de status | Emissão contrato |

### TCC (3 templates)

| Template | Template ID | Assunto | Uso |
|----------|-------------|---------|-----|
| **TCC - Abertura Transferência** | `1225a09c-...` | Abertura da solicitação | Abertura + reanálise |
| **TCC - Pendência Transferência** | `4cacd367-...` | Documentação pendente | Pendência (15 fluxos) |
| **TCC - Recusado Transferência** | `93cf2019-...` | Atualização de status | Recusa (9 fluxos) |

### Transferência de Cotas (7 templates)

| Template | Template ID | Assunto |
|----------|-------------|---------|
| **Imóvel PF Atualização de status** | `6cc79448-...` | Atualização de Status |
| **Imóvel PF negativa** | `9fde0180-...` | Negativa |
| **Imóvel PF Pendência** | `531673f7-...` | Pendência |
| **Imóvel PJ - Negativa** | `cefb2983-...` | Negativa |
| **Veículos leves PF - Atualização** | `720af872-...` | Atualização de Status |
| **Veículos leves PJ - Negativa** | `bd0922fb-...` | Atualização de Status |
| **Veículos leves PJ - Pendência** | `4e4069da-...` | Pendência |

---

## 11. Webhooks e Mudanças de Automação

### Webhooks (1)

| Webhook | Fluxo |
|---------|-------|
| **retorno_webhook_vistoria** | BENS MÓVEIS - Vistoria |

### Mudanças de Automação (9)

| Mudança | Fluxo |
|---------|-------|
| Mudança automação - Reembolso de despesas | BENS MÓVEIS - Análise de fraude |
| Mudança automação - Vistoria BPO1 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria BPO2 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria BPO3 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria BPO4 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria PCD BPO1 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria PCD BPO2 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria PCD BPO3 | BENS MÓVEIS - Análise da documentação do bem |
| Mudança automação - Vistoria PCD BPO4 | BENS MÓVEIS - Análise da documentação do bem |

---

## 12. Integrações Externas

| Sistema | Função | Scripts/APIs |
|---------|--------|-------------|
| **Newcon** | Atualização de dados cadastrais | `01 - ATUALIZAÇÃO DADOS CADASTRAIS NEWCON` |
| **Crivo** | Análise de crédito (scoring, bureau) | `05 - API CRIVO` |
| **Teckey** | Validação de documentação | `03 - API TECKEY` |
| **ClickSign** | Assinatura digital de contratos | Scripts 01–07 ClickSign (envelope, signers, requirements, run, e-mail) |
| **Anvil** | Geração de autorização de faturamento (PDF) | `Anvil - Autorização`, `Billing Anvil` |
| **InfoVist** | Solicitação e retorno de vistoria veicular | `Criação vistoria InfoVist`, `Envio fotos RC`, webhook `retorno_webhook_vistoria` |
| **Dekra/Control** | Vistoria alternativa / contestação de laudo | Scripts de contestação na substituição de garantia |
| **GED/HCP** | Armazenamento de dossiê documental | `06 - Envio Dossie GED` |
| **ONR** | Registro de contratos imobiliários | Fluxo de acompanhamento ONR |
| **Detran** | Registro de bens móveis | Fluxos de registro nos Detrans |
| **WebApp** | Geração de links, pendências, conclusão de protocolos | `GERAÇÃO LINK WEBAPP`, `PENDING WEBAPP`, `CONCLUDED WEBAPP` |
| **Force/Workforce** | Plataforma de automação de fluxos | Todos os fluxos rodam na plataforma Force |
| **Funchal** | BPO (Business Process Outsourcing) — operações terceirizadas | Variantes "Funchal" e "Funchal PCD" nos scripts ClickSign e roteamentos |

### Conceitos-chave nos Fluxos

| Conceito | Descrição |
|----------|-----------|
| **BPO** | Business Process Outsourcing — operações terceirizadas para processamento (Funchal, PCD) |
| **PCD** | Pessoa com Deficiência — rotas especiais de atendimento com BPOs dedicados |
| **Skill** | Habilidade/fila do ticket no Force — determina o roteamento do fluxo |
| **Tab** | Tabulação/etapa do ticket — combinada com skill, dispara os fluxos |
| **Esteira interna** | BPO interno (equipe própria) vs Funchal (terceirizado) |
| **skill_atual** | Campo salvo no ticket que identifica a skill anterior para roteamento no backoffice |

---

## 13. Estrutura dos Dados Extraídos

```
projects/backup-automacao/CaixaConsorcio/
├── aguardando-evolucao-e-reforma/
│   ├── glossario-apis-templates.md
│   └── aguardando-evolucao-e-reforma/
│       ├── flow-meta.json          # flowId, flowUrl, grupo, grupoSlug
│       ├── flow-slim-*.json        # name, status, automationFlowTriggers, blocos
│       ├── resumo-*.md             # Resumo do fluxo
│       ├── fluxo-*-diagrama.md     # Diagrama em Mermaid
│       ├── doc-fluxo-*.md          # Documentação detalhada
│       └── README.md               # Índice
├── bens/                           # 63 subfluxos (35 móveis + 28 imóveis)
│   ├── glossario-apis-templates.md # 38 APIs, 17 templates, 1 webhook, 9 mudanças
│   ├── bens-moveis-abertura-de-solicitacao/
│   ├── bens-moveis-analise-de-credito-mesa/
│   ├── ... (33 mais bens-moveis)
│   ├── bens-imoveis-analise-conformidade/
│   └── ... (27 mais bens-imoveis)
├── tcc/                            # 28 subfluxos
│   ├── glossario-apis-templates.md # 10 APIs, 3 templates
│   ├── tcc-abertura/
│   ├── tcc-analise-credito-bpo/
│   └── ... (26 mais)
├── transferencia-de-cotas/         # 15 subfluxos
│   ├── glossario-apis-templates.md # 4 APIs, 7 templates
│   └── ...
├── substituicao-de-garantia/       # 14 subfluxos
│   ├── glossario-apis-templates.md
│   └── ...
├── backoffice-auto/
├── backoffice-imovel/
├── ... (demais categorias standalone)
└── vistoria-retorno-laudo-infocar/
```

**Total: ~832 arquivos** cobrindo ~130 fluxos de automação.

### Estrutura de cada fluxo

| Arquivo | Conteúdo |
|---------|----------|
| `flow-meta.json` | `flowId`, `flowUrl`, `grupo`, `grupoSlug` |
| `flow-slim-*.json` | Nome, status (`published`), `automationFlowTriggers` (lista de `tabId`+`skillId`), blocos de automação |
| `resumo-*.md` | Narrativa de negócio do fluxo |
| `fluxo-*-diagrama.md` | Diagrama Mermaid do fluxo |
| `doc-fluxo-*.md` | Documentação técnica detalhada (blocos, decisões, scripts) |
| `glossario-apis-templates.md` | Referência consolidada por categoria (nível pasta-mãe) |
| `README.md` | Índice e links do fluxo |

---

## 14. Correlação WebApp × FLOW

Para juntar este documento com o do WebApp, as correspondências são:

| WebApp (Esteira) | FLOW (Categoria principal) | Observação |
|------------------|---------------------------|------------|
| Aquisição (`aquisicao_de_veiculos_leves`) | `bens/bens-moveis-*` (35 fluxos) | Ciclo completo de automóvel |
| Imóveis (`imoveis`) | `bens/bens-imoveis-*` (28 fluxos) + fluxos standalone (abertura, mesa crédito, jurídico, produto, liberação, etc.) | Ciclo completo de imóvel |
| Quitação (`quitacao_de_financiamento`) | Compartilha fluxos de bens móveis/imóveis (mesma automação) | Mesma esteira do FLOW |
| Solicitação de Acesso (`solicitacao_de_acesso`) | Sem fluxo FLOW correspondente | Fluxo interno do WebApp (token economiário) |
| — | `tcc/` (28 fluxos) | Transferência de Cotas Completa — esteira adicional no FLOW |
| — | `transferencia-de-cotas/` (15 fluxos) | Transferência de Cotas (versão anterior) |
| — | `substituicao-de-garantia/` (14 fluxos) | Substituição de Garantia — esteira adicional no FLOW |

### Pontos de integração WebApp ↔ FLOW

| Ponto | WebApp → FLOW | FLOW → WebApp |
|-------|---------------|---------------|
| **Abertura** | WebApp cria protocolo no Force | FLOW envia e-mail de abertura ao consorciado |
| **Pendência** | WebApp exibe formulário de pendência | FLOW marca `PENDING WEBAPP` + `GERAÇÃO LINK WEBAPP` + e-mail |
| **Conclusão** | WebApp exibe tela de conclusão | FLOW marca `CONCLUDED WEBAPP` |
| **Link de acesso** | WebApp gera URL com token RSA | FLOW chama `GERAÇÃO LINK WEBAPP` para enviar link por e-mail |
| **Rascunho** | WebApp permite continuar/deletar | FLOW chama `Rascunho Automóvel/Imóvel` para criar rascunho |
| **Pesquisa satisfação** | — | FLOW ativa pesquisa satisfação pós-entrega |
