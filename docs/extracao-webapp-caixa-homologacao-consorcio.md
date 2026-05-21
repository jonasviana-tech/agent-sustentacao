# Caixa Consórcio — Extração Completa das Esteiras (Homologação)

> Extraído da API WebApp em 13/04/2026 — ambiente de homologação (QA).
> Fonte: `projects/documentacao-webapp/caixa/consorcio/esteiras/`
> Documento gerado também com base em: `WORKFLOWS-FORMS-SCRIPTS-E-LOTE.md`, `cpr-references-scan.json`, payloads de formulários.

---

## Sumário

1. [Visão Geral do Serviço](#1-visão-geral-do-serviço)
2. [Tipos de Usuário](#2-tipos-de-usuário-no-sistema)
3. [Mapa das Esteiras](#3-mapa-das-esteiras)
4. [Regra Central: Roteamento por Análise de Crédito](#4-regra-de-negócio-central-roteamento-por-análise-de-crédito)
5. [Esteira: Aquisição de Bens Móveis](#5-esteira-aquisição-de-bens-móveis-veículos)
6. [Esteira: Imóveis](#6-esteira-imóveis-utilização-do-crédito)
7. [Esteira: Quitação de Financiamento](#7-esteira-quitação-de-financiamento)
8. [Esteira: Solicitação de Acesso](#8-esteira-solicitação-de-acesso-economiário)
9. [Catálogo Completo de Formulários e Campos](#9-catálogo-completo-de-formulários-e-campos)
10. [CPRs — Consultas Prévias de Produto](#10-cprs--consultas-prévias-de-produto)
11. [Regras Transversais](#11-regras-transversais-todas-as-esteiras-de-produto)
12. [Integração com Force (Workforce)](#12-integração-com-force-workforce)
13. [Ordem dos Formulários por Step](#13-ordem-dos-formulários-por-step)
14. [Scripts por Esteira](#14-scripts-por-esteira)
15. [Hooks de Formulários e Campos](#15-hooks-de-formulários-e-campos)
16. [Estrutura dos Dados Extraídos](#16-estrutura-dos-dados-extraídos)

---

## 1. Visão Geral do Serviço

| Item | Valor |
|------|-------|
| **Cliente** | Caixa |
| **Serviço** | Consórcio |
| **Service Key** | `consorcio` |
| **Client Service ID** | `3148efd2-c5ee-4126-8a84-2a33581b430d` |
| **Client ID** | `b450a851-30ad-40a4-95e1-72b2df270bde` |
| **Ambiente** | Homologação (`https://webapp-qa-api.hml-tech4h.com.br`) |
| **Provedor de protocolo** | Force |
| **Menu principal (workflow group)** | `5b9ddc17-8fdf-481a-97e2-7b0690d2808f` |
| **Esteiras no menu** | 7 (em 3 grupos) |
| **Esteiras ativas no serviço consórcio** | **4** |
| **Extração de documentos (Tech4IA)** | Ativa (`https://api.tech4.ai/document/extract/`) |
| **Limite de documentos por protocolo** | 10 |
| **Abertura em lote (batch)** | Não configurada em nenhuma esteira |
| **Total de CPRs do cliente** | 241 (233 exportadas em disco) |

---

## 2. Tipos de Usuário no Sistema

| Tipo | Chave | Pode criar ticket | Pode consultar |
|------|-------|-------------------|----------------|
| Pessoa Física | `person` | Sim | Sim |
| Pessoa Jurídica | `company` | Sim | Sim |
| Backoffice | `backoffice` | Sim | Sim |
| Economiário | `economiario` | Sim (em 3 esteiras) | Sim |
| Tech | `tech` | Sim | Sim |
| System | `system` | Sim | Sim |
| Corretor | `broker` | Não | Sim |
| Consultor | `consultant` | Não | Sim |
| Jurídico | `juridico` | Não | Sim |
| Ouvidoria | `ouvidoria` | Não | Sim |
| Qualidade | `qualidade` | Não | Sim |
| Call Center | `call_center` | Não | Sim |

---

## 3. Mapa das Esteiras

| # | Esteira | Título | Descrição | Workflow Key | CPR | Forms | Steps |
|---|---------|--------|-----------|--------------|-----|-------|-------|
| 1 | **Aquisição** | Aquisição (bens móveis) | Utilize sua cota para realizar a compra do bem desejado | `aquisicao_de_veiculos_leves` | Sim | 18 | 6 |
| 2 | **Imóveis** | Utilização do crédito | Residencial, comercial, construção, reforma, ampliação, quitação de financiamento | `imoveis` | Sim | 36 | 6 |
| 3 | **Quitação** | Quitação de financiamento próprio | Utilize sua cota contemplada para quitar financiamentos vinculados ao bem | `quitacao_de_financiamento` | Sim | 17 | 6 |
| 4 | **Sol. Acesso** | Solicitação de acesso | Solicitação para que o economiário possa criar solicitações em nome do cliente | `solicitacao_de_acesso` | Não | 1 | 1 |

### Menu de Navegação (Workflow Groups)

| Grupo | ID | Esteiras | Ícone |
|-------|-----|---------|-------|
| Bens Móveis | `35104d69-a6b8-4c5f-86d2-afb90716085d` | Aquisição (índice 1), Quitação (índice 2) | Carro |
| Imóveis | `0b3ef765-ff21-4fcd-8771-443580aae7a3` | Imóveis (índice 1) | Imóvel |
| Principal | `5b9ddc17-8fdf-481a-97e2-7b0690d2808f` | Solicitação de Acesso (índice 4) | — |

---

## 4. Regra de Negócio Central: Roteamento por Análise de Crédito

As três esteiras de produto (Aquisição, Imóveis e Quitação) compartilham a mesma lógica de roteamento via `custom_filters`. Essa lógica determina **qual jornada o consorciado segue** com base no status das cotas.

### Status de Análise de Crédito (`quota_analysis_status`)

| Status | Significado | Jornada |
|--------|-------------|---------|
| `aprovado` | Crédito aprovado para todas as cotas | Jornada simplificada — etapa de **aprovado** |
| `mesa` | Crédito em análise (padrão) | Jornada completa — etapa de **mesa** |
| `fiador` | Pelo menos uma cota exige fiador | Jornada com **fiador** obrigatório |
| `reprovado` | Crédito reprovado | — |
| `vencida` | Análise vencida | — |
| `pendente` | Pendente de avaliação | — |

### Lógica de Determinação do Status

```
1. Buscar todas as cotas do protocolo em products
2. SE todas as cotas têm saldo devedor = 0 OU status = "aprovado"
   → journeyStatus = "aprovado"
3. SENÃO SE alguma cota tem status = "fiador"
   → journeyStatus = "fiador"
4. SENÃO (padrão)
   → journeyStatus = "mesa"
```

### Roteamento PF vs PJ

Além do status de crédito, o sistema identifica o tipo de pessoa pelo documento:
- **CPF (11 dígitos)** → filtro `person` = true → jornada PF
- **CNPJ (14 dígitos)** → filtro `company` = true → jornada PJ

### Combinação Final de Steps (6 variantes por esteira de produto)

| Tipo Pessoa | Status Crédito | Step Key Pattern |
|-------------|----------------|------------------|
| PF | Aprovado | `*_pf_aprovado` |
| PF | Mesa | `*_pf_mesa` |
| PJ | Aprovado | `*_pj_aprovado` |
| PJ | Mesa | `*_pj_mesa` |
| PF (Fiador) | Mesa | `*_fiador_pf_mesa` |
| PJ (Fiador) | Mesa | `*_fiador_pj_mesa` |

### Diferença de tipo de bem por esteira

| Esteira | Filtro de tipo de bem |
|---------|----------------------|
| Aquisição | `automovel: true` |
| Quitação | `automovel: true` |
| Imóveis | `imovel: true` |

---

## 5. Esteira: Aquisição de Bens Móveis (Veículos)

### Identificação

| Item | Valor |
|------|-------|
| **UUID** | `f113bb79-4609-4751-945f-6368d33a7878` |
| **Workflow Key** | `aquisicao_de_veiculos_leves` |
| **Alternative Title** | Aquisição de bens móveis |
| **CPR** | `81e7b318-...` — "Abertura de novo ticket (Pós contemplação bens Móveis)" |
| **Product Key (CPR)** | `abertura-ticket-pos-contemplacao-bens-moveis` |
| **flow_form_id** | `b8ac8e12-63ea-4ab5-b08d-56f0ac11bd4b` |
| **update_workflow_protocol_function_id** | — |

### Tela de Conclusão

- **Ícone:** `/assets/icons/success.svg`
- **Título:** "Sua solicitação foi recebida com sucesso."
- **Botões:** "Voltar para o início" / "Nova solicitação"
- **Fluxo pós-criação:** `finish`
- **Mensagem no topo do protocolo:** "Nosso time já está trabalhando para atender sua demanda e o prazo estimado para a análise é de **2 dias úteis**. Lembrando que poderão ser solicitados documentos complementares, se necessário."

### Fases de Tabulação (7 fases)

| # | Fase | Tabulation Start ID |
|---|------|---------------------|
| 1 | Análise de crédito | `7edf6aa7-107b-42ba-bba0-005537864a86` |
| 2 | Análise dados cadastrais | `313d70ad-2ae5-4e25-8c45-4112a23f7c4b` |
| 3 | Análise da documentação do bem | `95d2e716-1b75-4973-82bc-a545a599e6dd` |
| 4 | Vistoria (veículo 0km **não necessita**) | `76b0cf81-4e8d-4a30-9dcf-1c198d381761` |
| 5 | Emissão de autorização de faturamento | `daaddd56-b37b-4b54-b8cd-4f9a3d315d67` |
| 6 | Assinatura de contrato | `f5076cdc-2388-435a-81bc-2aa04dd1d16b` |
| 7 | Pagamento | `9ad3d18a-0693-4685-a02f-72f5033c8be4` |

### Steps

| Step Key | Tipo | Crédito | Forms |
|----------|------|---------|-------|
| `aquisicao_de_veiculos_leves_pf_aprovado` | PF | Aprovado | ~14 ordens |
| `aquisicao_de_veiculos_leves_pj_aprovado` | PJ | Aprovado | ~14 ordens |
| `aquisicao_de_veiculos_leves_pf_mesa` | PF | Mesa | 3 ordens (atualizacaoCadastral → envioDeDocumentosFather → informacoesAdicionais) |
| `aquisicao_de_veiculos_leves_pj_mesa` | PJ | Mesa | 3 ordens (atualizacaoCadastral → envioDeDocumentos → informacoesAdicionais) |
| `aquisicao_de_veiculos_leves_fiador_pf_mesa` | PF Fiador | Mesa | 3 ordens |
| `aquisicao_de_veiculos_leves_fiador_pj_mesa` | PJ Fiador | Mesa | ~15 ordens |

### Regras de Pendência (7 UUIDs)

`721457c8`, `cde56e82`, `892323db`, `6151c80f`, `39731761`, `ea015461`, `c448a3fb`

### Regra de Busca de Rascunhos

- `UserAccountRequestedId` (quem está criando)
- `Id` vazio (apenas rascunhos)
- `MainUserAccountSocialNumber` (documento do consorciado, opcional)
- `ProductTypes` (tipo do produto da primeira cota, opcional)

### Regras de Pré-criação (`execute_before_create_protocol`)

1. Copia as cotas (`products.quotas`) para `custom.quotas{n}`
2. Remove e-mails das cotas por segurança
3. Limpa campos internos (keys numéricas, logs, endereços redundantes)
4. Define `valorDeLaudo = "00,00"` quando o objeto existe sem valor
5. Normaliza `complemento` do endereço

### Configurações Adicionais

| Config | Valor |
|--------|-------|
| `optimize_cache` | `true` |
| `module_ticket_details` | `true` |
| `always_show_pending_forms` | `true` |
| `duplicate_protocol_action` | `false` |
| `after_protocol_creation_flow` | `finish` |
| Comentários permitidos | person, company, backoffice |
| Botão rascunho (continuar/deletar) | person, company, backoffice, tech, system, economiario |

---

## 6. Esteira: Imóveis (Utilização do Crédito)

### Identificação

| Item | Valor |
|------|-------|
| **UUID** | `8f5f4cf8-5f17-441f-adac-007b09f68289` |
| **Workflow Key** | `imoveis` |
| **CPR** | `f01c40ef-...` — "Abertura de novo ticket (Aquisição de Imóveis)" |
| **Product Key (CPR)** | `abertura-ticket-pos-contemplacao-bens-imoveis` |
| **flow_form_id** | `54141523-7c93-45d6-bafd-668373933116` |
| **update_workflow_protocol_function_id** | `1df4cba5-8ec5-4bc3-a6de-732e79b9f991` |

### Tela de Conclusão

Mesma da Aquisição: "Sua solicitação foi recebida com sucesso." + mensagem de prazo de 2 dias úteis.

### Fases de Tabulação (10 entradas, 7 fases distintas)

| # | Fase | IDs |
|---|------|-----|
| 1 | Análise de crédito | `a9c59bb0-...` |
| 2 | Análise de documentação | `65799f33-...`, `7ee317af-...` (2 variantes) |
| 3 | Análise jurídica e vistoria do imóvel | `ecbe7a24-...`, `780e8f5d-...` (2 variantes) |
| 4 | Emissão do contrato | `5133dde1-...` |
| 5 | Envio do contrato | `9d04ad6b-...` |
| 6 | Aguardando contrato e matrícula registrada | `2ff3b71b-...`, `8f1abcdf-...` (2 variantes) |
| 7 | Pagamento | `2d14bf7b-...` |

> **As fases com 2 IDs indicam variantes de fluxo (possivelmente PF/PJ ou tipos de imóvel diferentes).**

### Steps

| Step Key | Tipo | Crédito | Forms |
|----------|------|---------|-------|
| `aquisicao_de_imoveis_pf_aprovado` | PF | Aprovado | ~14 ordens |
| `aquisicao_de_imoveis_pj_aprovado` | PJ | Aprovado | ~14 ordens |
| `aquisicao_de_imoveis_pf_mesa_credito` | PF | Mesa | 3 ordens |
| `aquisicao_de_imoveis_pj_mesa_credito` | PJ | Mesa | 2 ordens |
| `aquisicao_de_imoveis_fiador_pf_mesa_credito` | PF Fiador | Mesa | 3 ordens |
| `aquisicao_de_imoveis_fiador_pj_mesa_credito` | PJ Fiador | Mesa | ~15 ordens |

### Regras de Pendência (7 UUIDs)

`721457c8`, `39731761`, `ea015461`, `5a217ed5`, `9e3592e4`, `14fdcf5f`, `5b844d8f`

### Regra de Busca de Rascunhos (diferente da Aquisição)

- `UserAccountRequestedId` + documento + tipo de produto
- **Não** filtra por `Id` vazio (permite localizar protocolos existentes)

### Regras de Pré-criação (`execute_before_create_protocol`)

- **Obrigatório** ter pelo menos 1 cota (lança erro se `quotas.length === 0`)
- Formatação de datas e valores monetários nos campos das cotas
- Lista estendida de campos removidos (específicos de imóvel)

### Formulários Específicos de Imóveis (não existem nas outras esteiras)

| Formulário | Descrição |
|------------|-----------|
| `informacoeDoBem` | Documentação do imóvel (matrícula, certidões, obra, rural) |
| `informacoeDoBemComplementar` | Complemento do imóvel (com validação FGTS) |
| `informacoeAdicionaisDoBem` | Tipo de utilização da carta de crédito |
| `informacoeAdicionaisDoBemComplementar` | Imóvel objeto da garantia |
| `informacoeVistoriaDoBem` | Dados para agendamento de vistoria |
| `dadosDoVendedorPF` | Vendedor 1 (PF, com validação API) |
| `dadosDoVendedor2` a `dadosDoVendedor10` | Cadeia de até 10 vendedores |
| `dadosDoVendedor` | Dados completos do vendedor (PF/PJ, docs, certidões) |
| `dadosDoConjugeVendedor` | Cônjuge do vendedor |
| `dadosDoConjugeFiador` | Cônjuge do fiador |
| `dadosAdicionais` | Controle "Deseja adicionar outro vendedor?" |
| `comprovanteDoVendedor` | Endereço do vendedor |

---

## 7. Esteira: Quitação de Financiamento

### Identificação

| Item | Valor |
|------|-------|
| **UUID** | `c182fdcd-8252-4f0b-ad7e-6a823f29923d` |
| **Workflow Key** | `quitacao_de_financiamento` |
| **CPR** | `81e7b318-...` (mesmo da Aquisição — compartilhado) |
| **flow_form_id** | `84b370b0-9c23-4b50-aefc-66516d701f34` |

### Fases de Tabulação (7 fases — mesmo padrão da Aquisição)

| # | Fase | Tabulation Start ID |
|---|------|---------------------|
| 1 | Análise de crédito | (diferente da Aquisição) |
| 2 | Análise dados cadastrais | |
| 3 | Análise da documentação do bem | |
| 4 | Vistoria (veículo 0km não necessita) | |
| 5 | Emissão de autorização de faturamento | |
| 6 | Assinatura de contrato | |
| 7 | Pagamento | `5d63bfb5-41ba-41f5-8eb4-61a1e04e3ede` (ID diferente da Aquisição) |

### Steps

| Step Key | Tipo | Crédito |
|----------|------|---------|
| `quitacao_de_financiamento_aprovado_pf` | PF | Aprovado |
| `quitacao_de_financiamento_aprovado_pj` | PJ | Aprovado |
| `quitacao_de_financiamento_mesa_pf` | PF | Mesa |
| `quitacao_de_financiamento_mesa_pj` | PJ | Mesa |
| `quitacao_de_financiamento_fiador_mesa_pf` | PF Fiador | Mesa |
| `quitacao_de_financiamento_fiador_mesa_pj` | PJ Fiador | Mesa |

### Regras de Pendência (4 UUIDs — subconjunto)

`721457c8`, `892323db`, `39731761`, `ea015461`

### Regra de Busca de Rascunhos (simplificada)

Apenas `UserAccountRequestedId` + `Id` vazio. **Sem** filtro por documento ou tipo de produto.

### Configuração Adicional

- **`workflow_protocol_additional_information_title`**: "Informação adicionais do protocolo"

---

## 8. Esteira: Solicitação de Acesso (Economiário)

### Identificação

| Item | Valor |
|------|-------|
| **UUID** | `84bfd7d9-d2ab-4149-bf55-f8668a4418e8` |
| **Workflow Key** | `solicitacao_de_acesso` |
| **CPR** | **Nenhum** (`null`) |
| **flow_form_id** | `9c5342fb-7bf3-407a-9642-dfc4c4ef650a` |

### Propósito

Fluxo administrativo para que o **economiário** (funcionário da Caixa) obtenha autorização para criar e abrir solicitações **em nome do cliente** (consorciado).

### Tela de Conclusão (diferente das demais)

- **Título:** "Token Validado e Autorização Concedida!"
- **Fluxo pós-criação:** `finish`

### Etapa Única

Uma única etapa (`solicitacao_de_acesso`) com **1 formulário** (`solicitacaoDeAcesso`).

### Regras de Negócio Específicas

1. **Validação de token:** `on_form_validation` chama API `valida-token-economiario`
2. **Janela de tempo:** Token tem validade de **20 minutos** — se expirar, o protocolo é deletado automaticamente
3. **Máximo de tentativas:** Limite de tentativas via `localStorage`; ao esgotar, protocolo encerrado
4. **Preenchimento automático:** `on_load` preenche dados do consorciado e inicia countdown visual
5. **Mensagem de consentimento:** Exibe no topo do protocolo para o economiário

### Filtros de Exibição (`custom_filters`)

Lógica diferente das demais: quando `accessSession.user_account_type` é `person` ou `company`, aplica filtro `consorciado = true`.

### Regra de Busca de Rascunhos

Mesma da esteira de Imóveis: `UserAccountRequestedId` + documento + tipo de produto (sem `Id isEmpty`).

---

## 9. Catálogo Completo de Formulários e Campos

### 9.1. Formulários Compartilhados (Aquisição, Quitação e parcialmente Imóveis)

#### `atualizacaoCadastral` — Informações de contato para notificações

| Campo | Label | Tipo | Obrigatório | Máscara | Scripts | Opções |
|-------|-------|------|-------------|---------|---------|--------|
| `telefone` | Telefone (celular) | text | Condicional (Yup) | — | `on_blur` (máscara telefone), `validator` | — |
| `email` | E-mail | text | Condicional (Yup) | — | `validator` (formato email) | — |
| `desejaInserirTelefonesAdicionais` | Deseja inserir telefone adicional? | check | Não | — | `on_load`, `on_change` | Sim / Não |
| `nomeContato` | Nome do contato | text | Não | — | — | — |
| `telefoneComercial` | Telefone | text | Não | — | `on_blur` (máscara telefone) | — |

#### `dadosDoConsorciado` — Dados pessoais do consorciado (PF)

| Campo | Label | Tipo | Obrigatório | Máscara | Scripts |
|-------|-------|------|-------------|---------|---------|
| `nome` | Nome | text | Sim | — | — |
| `dataDeNascimento` | Data de nascimento | date | Sim | — | — |
| `cpf` | CPF | text | Sim | cpf | — |
| `telefoneCelular` | Telefone celular | text | Sim | — | `on_blur` (telefone) |
| `telefoneResidencial` | Telefone residencial | text | Não | — | `on_blur` (telefone) |
| `telefoneComercial` | Telefone comercial | text | Não | — | `on_blur` (telefone) |
| `email` | E-mail | text | Sim | — | — |
| `estadoCivil` | Estado civil | select | Sim | — | `on_load`, `on_change` | Solteiro, Casado, Divorciado, Viúvo, União estável |
| `regimeDeCasamento` | Regime de casamento | select | Condicional | — | — | (exibido quando casado) |
| `certidaoCasamentoOuEscrituraPublicaUniaoEstavel` | Certidão de casamento | file | Condicional | — | `on_load` | — |
| `ocupacao` | Profissão | text | Não | — | — |
| `identidade` | Identidade | text | Não | — | — |
| `orgaoExpedidor` | Órgão expedidor | text | Não | — | — |
| `uf` | UF | text | Não | — | — |
| `nacionalidade` | Nacionalidade | text | Não | — | — |
| `pcd` | PCD | select | Sim | — | — | Sim / Não |

> **IA/OCR:** Campo virtual `documentoIdentificacao` (file) em `extract_iag` — extrai dados automaticamente do documento.

#### `dadosDoConsorciado` — Variante Quitação (PF/PJ)

Variante com campos adicionais para PJ:

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `tipoDocumento` | Tipo documento | select | `on_load`, `on_change` | CPF / CNPJ |
| `contratoSocial` | Contrato social | file | `on_load`, `on_change` |
| `estatutoSocial` | Estatuto social | file | `on_load`, `on_change` |
| `ataDeEeleicaoUltimaDiretoria` | Ata de eleição | file | `on_load`, `on_change` |
| `atoConstitutivo` | Ato constitutivo | file | `on_load`, `on_change` |
| `razaoSocial` | Razão social | text | `on_load` |
| `documentoSocioOuRepresentanteLegal` | Doc. sócio/representante | file | `on_load`, `on_change` |
| `CRF` | CRF (FGTS) | file | `on_load`, `on_change` |
| `certidaoSimplificadaJuntaComercial` | Certidão junta comercial | file | `on_load`, `on_change` |

#### `dadosConjugeConsorciado` — Dados pessoais do cônjuge

| Campo | Label | Tipo | Obrigatório | Scripts |
|-------|-------|------|-------------|---------|
| `desejaAdicionarConjuge` | Deseja adicionar cônjuge? | select | Sim | `on_load`, `on_change` | Sim / Não |
| `nomeConjuge` | Nome cônjuge | text | Condicional | — |
| `telefoneConjuge` | Telefone cônjuge | text | Condicional | phone mask |
| `emailConjuge` | E-mail cônjuge | text | Condicional | — |
| `dataDeNascimentoConjuge` | Data de nascimento | date | Condicional | — |
| `cpfConjuge` | CPF cônjuge | text | Condicional | cpf |
| `regimeTrabalhistaConjuge` | Regime trabalhista | select | Condicional | `on_load`, `on_change` |
| `pcdConjuge` | PCD | select | Condicional | — | Sim / Não |

**Opções de regime trabalhista:** Assalariado, Aposentado/Pensionista, Autônomo, Sócio/Autônomo, Profissional Liberal, Locador de Imóvel, Produtor Rural

**Documentos de comprovação de renda (condicional ao regime trabalhista):**

| Campo | Tipo | Regime |
|-------|------|--------|
| `tresUltimosHoliritesConjuge` | file | Assalariado |
| `comprovanteAposentadoriaConjuge` | file | Aposentado/Pensionista |
| `declaracaoImpostoRendaAutonomoConjuge` | file | Autônomo |
| `extratoBancarioAutonomoConjuge` | file | Autônomo |
| `declaracaoImpostoRendaSocioAutonomoConjuge` | file | Sócio/Autônomo |
| `decoreSocioAutonomoConjuge` | file | Sócio/Autônomo |
| `decoreAutonomoConjuge` | file | Autônomo |
| `declaracaoImpostoRendaProfissionalLiberalConjuge` | file | Prof. Liberal |
| `carteiraProfissionalOuRegistroConjuge` | file | Prof. Liberal |
| `contratoLocacaoConjuge` | file | Locador |
| `declaracaoImpostoRendaConjuge` | file | Geral |
| `declaracaoImpostoRendaProdutoRuralConjuge` | file | Produtor Rural |
| `extratoBancarioConjuge` | file | Geral |
| `consolidadoContratoSocialConjuge` | file | Sócio |

> **IA/OCR:** Campo virtual `documentoIdentificacaoConjuge` (file) em `extract_iag`.

#### `comprovanteDeEnderecoConsorciado` — Comprovante de endereço

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `comprovacaoDeParentescoOuDeclaracaoDeTerceiros` | Comprovação de parentesco / Declaração de terceiros | file | `on_load`, `on_change` |
| `cep` | CEP | text / address | `on_blur` (ViaCEP) |
| `logradouro` | Logradouro | text | — |
| `numero` | Número | text | — |
| `bairro` | Bairro | text | — |
| `localidade` | Cidade | text | — |
| `complemento` | Complemento | text | — |
| `estado` | Estado | select | Todas as UFs |

> **IA/OCR:** Campo virtual `comprovanteEndereco` (file) em `extract_iag`.

#### `comprovanteDeEnderecoFiador` — Endereço do fiador

Mesma estrutura do consorciado. Campo `cep` com tipo `address` (map_form_data com subfields). IA/OCR: `comprovanteEndereco`.

#### `rendaComplementarDoConsorciado` — Renda complementar

**Formulário múltiplo** — max. 3 respostas, entidade "Renda complementar"

| Campo | Label | Tipo | Máscara |
|-------|-------|------|---------|
| `nomeRenda` | Atividade | text | — |
| `valorRenda` | Valor | text | money |
| `comprovanteRenda` | Comprovante de renda | file | — |

#### `informacaoAdicionais` — Controle de renda complementar

| Campo | Label | Tipo | Obrigatório | Scripts |
|-------|-------|------|-------------|---------|
| `desejaAdicionaRendaComplementar` | Deseja adicionar renda complementar? | select | Sim | `on_load`, `on_change` | Sim / Não |

#### `dadosDoFiador` — Dados pessoais do fiador

Mesma estrutura do `dadosDoConsorciado` com campos de fiador: `nome`, `dataDeNascimento`, `cpf`, `estadoCivil`, `regimeDeCasamento`, `certidaoCasamentoOuEscrituraPublicaUniaoEstavel`, `ocupacao`, `identidade`, `orgaoExpedidor`, `uf`, `nacionalidade`, `pcd`.

> **IA/OCR:** `documentoIdentificacao` (fiador).

#### `cadastroRepresentanteLegal` — Representante legal PJ

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `temProcuracao` | Tem procuração? | select | `on_load`, `on_change` | Sim / Não (default Não) |
| `procuracaoRepresentante` | Procuração | file | `on_load`, `on_change` |
| `tipoRepresentante` | Tipo | select | `on_load`, `on_change` | PF / PJ |
| `nomeRepresentante` | Nome | text | Condicional |
| `razaoSocialDoRepresentante` | Razão social | text | Condicional (PJ) |
| `emailRepresentante` | E-mail | text | Condicional |
| `telefoneRepresentante` | Telefone | text | phone mask |

#### `cadastroRepresentanteLegalFiador` — Representante legal do fiador

Mesma estrutura de `cadastroRepresentanteLegal`.

#### `comentarioExtra` — Comentário adicional

| Campo | Label | Tipo | Obrigatório |
|-------|-------|------|-------------|
| `comentario` | Comentário | textarea | Não |

#### `formDePagamentoDoBem` — Utilização do crédito / Pagamento

| Campo | Label | Tipo | Obrigatório | Scripts |
|-------|-------|------|-------------|---------|
| `hidden` | — | hidden | — | `on_load` (orquestra bens via respostas do protocolo) |
| `valorCompraEVenda` a `valorCompraEVenda10` | Valor compra e venda | text | 1º obrigatório | máscara money |
| `valorDaCartaDeCredito` | Valor da carta de crédito | text | — | money |
| `valorRecusosProprios` | Valor recursos próprios | text | Sim | money |
| `htmlMessageTitle` | — | html | — | `on_load` (relabel para "Valor da obra" em Construção/Reforma) |
| `tipoPagamentoGrid` | Tipo pagamento | radiogrid | — | `on_load`, `on_change` | "Desconto na carta" / "Boleto" |
| `tipoPagamento` | — | hidden | — | Preenchido via `on_form_validation` |
| `sobraDeCredito` | Sobra de crédito | select | — | `on_load`, `on_change` | Redução do prazo / Redução da parcela / Redução prazo e reembolso |
| `tipoConta` | Tipo conta | radio | — | — | Corrente / Poupança |
| `banco` | Banco | selectsearch | — | — | Lista completa de bancos |
| `numeroAgencia` | Agência | text | — | — |
| `numeroConta` | Conta | text | — | — |
| `digitoConta` | Dígito | text | — | — |

> **`on_form_validation`:** Valida campos monetários, converte `tipoPagamentoGrid` para `tipoPagamento`. Se `sobraDeCredito` ≠ "Redução do prazo e reembolso", limpa dados bancários.

#### `dadosBancariosDoVendedor` — Dados para pagamento (multi-vendedor)

Formulário extenso com **blocos repetidos para até 10 vendedores** (N=1 sem sufixo, N=2..10 com sufixo numérico).

**Padrão por vendedor N:**

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `hidden` / `hiddenN` | — | hidden | `on_load` (mostra/esconde blocos) |
| `htmlMessagetitulo` / `htmlMessagetituloN` | Título vendedor | html | — |
| `tipoVendedor` / `tipoVendedorN` | Tipo vendedor | select | `on_change` | Pessoa Física / Jurídica |
| `nome` / `nomeN` | Nome | text | — |
| `telefone` / `telefoneN` | Telefone | text | — |
| `razaoSocial` / `razaoSocialN` | Razão social | text | (PJ) |
| `cpf` / `cpfN` | CPF | text | cpf mask |
| `cnpj` / `cnpjN` | CNPJ | text | cnpj mask |
| `formaPagamento` / `formaPagamentoN` | Forma pagamento PJ | select | `on_change` |
| `tipoContaVendedor` / `tipoContaVendedorN` | Tipo conta | radio | — | Corrente / Poupança |
| `bancoVendedor` / `bancoVendedorN` | Banco | selectsearch | — | Lista completa |
| `numeroAgenciaVendedor` / `numeroAgenciaVendedorN` | Agência | text (max 4) | — |
| `numeroContaVendedor` / `numeroContaVendedorN` | Conta | text (max 10) | — |
| `digitoConta` / `digitoContaN` | Dígito | text (max 2) | — |
| `htmlMessageBoleto` / `htmlMessageBoletoN` | Msg boleto | html | — |

> **`on_form_validation`:** Modal de confirmação se dados estiverem vazios ao submeter.

#### `envioDeDocumentos` / `envioDeDocumentosFather` — Upload de documentos

Formulários com `workflow_form_fields: []` (campos via step bindings). Possuem `on_form_validation` que:
- Bloqueia se campos de CEP do endereço estiverem vazios
- Alerta se não há cotas vinculadas ao protocolo

#### `informacoesAdicionais` — Container pai

`workflow_form_fields: []`. Container para `informacaoAdicionais`.

### 9.2. Formulários Exclusivos da Esteira Imóveis

#### `informacoeAdicionaisDoBem` — Tipo de bem imóvel

| Campo | Label | Tipo | Scripts | Opções |
|-------|-------|------|---------|--------|
| `tipoDeBem` | Tipo de utilização da carta de crédito | select | `on_load`, `on_change` | Aquisição, Quitação próprio, Construção, Reforma/Ampliação, Imóvel na Planta, Imóvel Rural |
| `tipoImovel` | Tipo de imóvel | select | `on_load`, `on_change` | (condicional ao tipoDeBem) |
| `tipoImovelQuitacaoFinanciamento` | Tipo imóvel quitação | select | — | (exibido quando tipoDeBem = Quitação) |
| `usouFGTSouPretendeUsar` | Usou FGTS ou pretende usar? | radio | `on_load`, `on_change` | Sim / Não |
| `jaSolicitouLiberacaoDoFGTS` | Já solicitou liberação do FGTS? | radio | `on_load`, `on_change` | Sim / Não |
| `saldoFGTSBem` | Saldo FGTS | text | money | — |
| `imovelEstaAlienado` | Imóvel está alienado? | radio | `on_load`, `on_change` | Sim / Não |
| + campos de contato da agência, HTML messages condicionais | — | — | — | — |

#### `informacoeDoBem` — Documentação do imóvel

Formulário grande com muitos campos de **arquivo** para documentação legal:

| Campo | Label | Tipo |
|-------|-------|------|
| `matriculaImovel` | Matrícula atualizada do imóvel | file |
| `certidaoDeOnus` | Certidão de ônus | file |
| `certidaoMunicipalNegativaDeDebitosDoImovel` | Certidão municipal negativa de débitos do imóvel | file |
| `certicaoNegativaDeDebitosCondominial` | Certidão negativa de débitos condominiais | file |
| `viaDaArtDaExecucaoDaObra` | Via da ART da execução da obra | file |
| `alvaraDaObraEmitidoPelaPrefeitura` | Alvará da obra emitido pela prefeitura | file |
| `orcamentoDiscriminativo` | Orçamento discriminativo | file |
| `orcamentoResumo` | Orçamento resumo | file |
| `cronogramaFisicoFinanceiroEspecificacoesTecnicas` | Cronograma físico-financeiro / especificações técnicas | file |
| `carteiraDeIdentidadeProfissionalEComprovanteDeRegistroNoCREA` | Carteira profissional + registro CREA | file |
| `matriculaDoTerrenoComAverbacaoDaIncorporacao` | Matrícula do terreno com averbação da incorporação | file |
| `contratoDeCompraEVendaDoConsorciadoComAConstrutora` | Contrato de compra e venda com a construtora | file |
| `memorialDeIncorporacaoComRegistroEmCartorio` | Memorial de incorporação com registro em cartório | file |
| `itrImpostoTerritorialRuralCertidaoDeRegularidadeFiscal` | ITR — Certidão de regularidade fiscal | file |
| `certidaoNegativaDeDebitoDoImovelRural` | Certidão negativa de débito do imóvel rural | file |
| `certificadoDeInscricaoNoCARCadastroAmbientalRural` | Certificado CAR (Cadastro Ambiental Rural) | file |
| `laudoDeAvaliacaoDoImovelRural` | Laudo de avaliação do imóvel rural | file |
| `htmlMessageBemCep` | — | html |
| `cep` | CEP do imóvel | address (com `map_form_data`) |
| `iptuImovel` | IPTU do imóvel | file |

> **IA/OCR:** `iptuImovel` em `extract_iag`. Campos de CEP expandem para endereço completo via `map_form_data`.

#### `informacoeDoBemComplementar` — Complemento do imóvel

`workflow_form_fields: []`. Campos via step bindings.

- **`on_form_validation`:** Modal FGTS se `jaSolicitouLiberacaoDoFGTS == 'Não'`
- **IA/OCR:** `matriculaImovel` em `extract_iag`

#### `informacoeAdicionaisDoBemComplementar` — Imóvel objeto da garantia

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| html header | — | html | — |
| Arquivos do bem em garantia | — | file | — |
| `cepBemGarantia` | CEP do bem em garantia | address | `on_load`, `map_form_data` com keys `*BemGarantia` |

> **IA/OCR:** `iptuImovelEmGarantia` em `extract_iag`.

#### `informacoeVistoriaDoBem` — Dados de vistoria

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `htmlMessage` | — | html | `add_function` |
| `nome` | Nome | text | `validator`, `add_function` |
| `telefone` | Telefone | text | `validator`, `on_blur` (máscara), `add_function` |
| `email` | E-mail | text | `add_function` |
| `horario` | Horário de preferência | text | `add_function` |

#### `dadosDoVendedorPF` — Vendedor 1 (cadeia de vendedores)

**Formulário múltiplo** — max. 20 respostas, entidade "Vendedor", first_entity "1° Vendedor"

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `estadoCivil` | Estado civil | select | `on_load`, `on_change` |
| `desejaAdicionarOutroVendedor2` | Deseja adicionar outro vendedor? | select | `is_filter`, `delete_next_responses` | Sim / Não |

> **`on_form_validation`:** Async — chama `/get-seller-verification`; modal se CPF/CNPJ ausente ou vendedor duplicado.

#### `dadosDoVendedor2` a `dadosDoVendedor10` — Vendedores adicionais

Mesma estrutura de `dadosDoVendedorPF` com `estadoCivil` + `desejaAdicionarOutroVendedorN+1`. Cada um com max 20 respostas e `on_form_validation` com verificação de vendedor via API.

#### `dadosDoVendedor` — Dados completos do vendedor (PF/PJ)

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `tipoVendedor` | Tipo | select | `on_change` | Pessoa Física / Jurídica |
| `estadoCivil` | Estado civil | select | `on_load`, `on_change` |
| `certidaoCasamento` | Certidão de casamento | file | `on_load` |
| `escrituraPublicaUniaoEstavel` | Escritura pública união estável | file | `on_load` |
| `contratoSocial` | Contrato social | file | `on_load`, `on_change` |
| `estatudiSicialAtaDeEleicaoDaUltimaDiretoria` | Estatuto social / Ata de eleição | file | `on_load`, `on_change` |
| `certificadoDeRegularidadeDoFGTS` | CRF (FGTS) | file | `on_load`, `on_change` |
| `certidaoSimplificadaDaJuntaComercial` | Certidão junta comercial | file | `on_load`, `on_change` |
| `certidaoConjuntaNegativaDeDebitosCertidaoDeQuitacaoDeTributosEContribuicoesFederais` | Certidão neg. tributos federais | file | `on_load`, `on_change` |
| `certidaoNegativaDividaAtivaMunicipal` | Certidão neg. dívida ativa municipal | file | `on_load`, `on_change` |
| `certidaoNegativaDividaAtivaEstadual` | Certidão neg. dívida ativa estadual | file | `on_load`, `on_change` |
| `procuracao` | Procuração | file | `on_load`, `on_change` |

#### `dadosDoConjugeVendedor` — Cônjuge do vendedor

| Campo | Tipo | Scripts |
|-------|------|---------|
| `certidaoConjuntaNegativaDeDebitosCertidaoDeQuitacaoDeTributosEContribuicoesFederaisConjuge` | file | `on_load`, `on_change` |
| `certidaoNegativaDividaAtivaMunicipalConjuge` | file | `on_load`, `on_change` |
| `certidaoNegativaDividaAtivaEstadualConjuge` | file | `on_load`, `on_change` |

#### `dadosDoConjugeFiador` — Cônjuge do fiador (Imóveis)

Campos com prefixo `field_`: `field_nome`, `field_dataDeNascimento`, `field_cpf`, `field_nacionalidade`, etc. Certidão negativa de tributos federais do cônjuge do fiador.

#### `comprovanteDoVendedor` — Endereço do vendedor

Mesma estrutura de `comprovanteDeEnderecoConsorciado`: html, comprovante (file), cep (ViaCEP), endereço completo, estado (select UFs).

#### `dadosAdicionais` — Controle de cadeia de vendedores

| Campo | Label | Tipo | Scripts |
|-------|-------|------|---------|
| `desejaAdicionarOutroVendedor2` | Deseja adicionar outro vendedor? | select | `on_load`, `on_change`, `is_filter` | Sim / Não |

### 9.3. Formulário Exclusivo da Esteira Veículos

#### `informacoeDoBemDoConsorciado` — Informações do veículo

`workflow_form_fields: []`. Campos via step bindings.

- **`on_form_validation`:** Define `formData.chassi = '-'` se ausente.
- **IA/OCR:** `documentoIdentificacaoMovel` em `extract_iag` com branching Novo/Usado.

#### `informacoeDoBemComplementarDoConsorciado` — Veículo complementar

| Campo | Label | Tipo | Max Length |
|-------|-------|------|-----------|
| `fabricanteComplementar` | Fabricante | text | — |
| `anoFabricacaoComplementar` | Ano fabricação | text | 4 |
| `anoModeloComplementar` | Ano modelo | text | 4 |
| `corComplementar` | Cor | text | — |
| `chassiComplementar` | Chassi | text | 17 |
| `combustivelComplementar` | Combustível | text | — |
| `ufLicenciamentoComplementar` | UF licenciamento | select | Todas UFs |
| `vendedorComplementar` | Vendedor | text | — |
| `modeloComplementar` | Modelo | text | — |
| `renavamComplementar` | Renavam | text | — |
| `placaVeiculoComplementar` | Placa | text | 7 |
| `cidadeLicenciamentoComplementar` | Cidade licenciamento | text | — |
| `htmlMessageComplementar` | — | html | — |
| `telefoneComplementar` | Telefone | text | phone mask |
| `emailComplementar` | E-mail | text | — |
| `desejaAdicionarOutroBem2` | Deseja adicionar outro bem? | select | — | Sim / Não (`is_filter`, `delete_next_responses`) |

> **IA/OCR:** `documentoIdentificacaoMovelComplementar` com branching Novo/Usado.

### 9.4. Formulário Exclusivo da Esteira Solicitação de Acesso

#### `solicitacaoDeAcesso` — Token de acesso economiário

| Campo | Label | Tipo | Obrigatório | Max Length | Scripts |
|-------|-------|------|-------------|-----------|---------|
| `htmlMessage` | — | html | Não | — | `on_load` (preenche dados consorciado + countdown) |
| `tokenAcesso` | Código de Acesso | text | Sim (Yup) | 8 | `validator` |
| `message` | Descreva um comentário | hidden | Sim | — | default: "Solicitação feita pelo Economiário" |
| `nomeConsorciado` | Nome Consorciado | hidden | Não | — | auto-preenchido |
| `documentoConsorciado` | Documento Consorciado | hidden | Não | — | auto-preenchido |
| `emailConsorciado` | E-mail Consorciado | hidden | Não | — | auto-preenchido |
| `nomeEconomiario` | Nome Economiário | hidden | Não | — | auto-preenchido |
| `documentoEconomiario` | Documento Economiário | hidden | Não | — | auto-preenchido |

> **`on_form_validation`:** Valida token via API `valida-token-economiario`, gerencia tentativas via `localStorage`, deleta protocolo e redireciona em caso de expiração (20min) ou falha.

---

## 10. CPRs — Consultas Prévias de Produto

### CPRs referenciados pelas esteiras

| Esteira | CPR ID | Título | Product Key |
|---------|--------|--------|-------------|
| Aquisição | `81e7b318-...` | Abertura de novo ticket (Pós contemplação bens Móveis) | `abertura-ticket-pos-contemplacao-bens-moveis` |
| Imóveis | `f01c40ef-...` | Abertura de novo ticket (Aquisição de Imóveis) | `abertura-ticket-pos-contemplacao-bens-imoveis` |
| Quitação | `81e7b318-...` | Mesmo da Aquisição (compartilhado) | `abertura-ticket-pos-contemplacao-bens-moveis` |
| Solicitação de Acesso | — | Sem CPR | — |

O CPR realiza a **busca de cotas do consorciado** antes de abrir o ticket: o consorciado informa CPF/CNPJ, o sistema consulta as cotas na API do consórcio, e o usuário seleciona quais cotas deseja utilizar.

### CPRs relacionados ao Consórcio (exportados em disco)

| Product Key | Título | ID |
|-------------|--------|-----|
| `abertura-ticket-automovel` | Automóvel | `6a02897d-...` |
| `abertura-ticket-aquisicao-bem-imovel` | Abertura de novo ticket (Aquisição de bem imóvel) | `5b4fa03d-...` |
| `abertura-ticket-quitacao-financiamento-proprio` | Quitação de financiamento próprio | `22eb7826-...` |
| `assuntos-pos-contemplacao` | Pós Contemplação | `316f89bf-...` |
| `get-cotas-consorcio-porto` | Busca cotas consórcio porto | `05ab3227-...` |
| `consulta-tickets-consorcio` | Consulta Tickets Abertos, Rascunhos e Pendentes Consorcio | `2ead71fd-...` |
| `acao-tickets-consorcio` | Ação Atualização/Criação Tickets Consorcio | `a934b136-...` |
| `analise-fiador` | Análise Fiador | `727190e8-...` |
| `abertura-ticket-quitacao-financiamento-proprio` (auto) | Quitação auto | (variante) |
| `abertura-ticket-aquisicao` | Aquisição | (variante) |
| `abertura-ticket-reforma-imovel` | Reforma de imóvel | (variante) |
| `abertura-ticket-contrucao-terreno-proprio` | Construção terreno próprio | (variante) |
| `abertura-ticket-contrucao-terreno-teceiros` | Construção terreno terceiros | (variante) |
| `abertura-ticket-baixa-hipoteca` | Baixa de hipoteca | (variante) |
| `abertura-ticket-liberacao-garantia` | Liberação de garantia | (variante) |
| `abertura-ticket-cancelamento` | Cancelamento | (variante) |
| `abertura-ticket-reembolso` | Reembolso | (variante) |
| `abertura-ticket-transferencia` | Transferência | (variante) |
| `abertura-ticket-substituicao` | Substituição | (variante) |
| `abertura-ticket-substituicao-garantia-aquisicao` | Substituição garantia (aquisição) | (variante) |
| `abertura-ticket-substituicao-garantia-substituicao` | Substituição garantia (substituição) | (variante) |
| `abertura-ticket-transferencia-de-cota-com-bem-imovel` | Transferência de cota com bem imóvel | (variante) |
| `abertura-transferencia-de-cota-sem-o-bem-e-contemplada` | Transferência cota sem bem (contemplada) | (variante) |
| `abertura-transferencia-de-cota-sem-o-bem-e-nao-contemplada` | Transferência cota sem bem (não contemplada) | (variante) |
| `consulta-ticket-aberto-cliente-auto` | Consulta ticket aberto auto | (variante) |
| `consulta-ticket-aberto-cliente-imovel` | Consulta ticket aberto imóvel | (variante) |
| `problemas-app-consorico` | Problemas app consórcio | (variante) |
| `revalidacao-consorcio-corretores` | Revalidação consórcio corretores | (variante) |
| `verifica-unico-consorcio` | Verificação Único consórcio | (variante) |

> **Total exportado:** 241 CPRs do cliente Caixa. Payloads e scripts em `projects/documentacao-webapp/caixa/cpr/`.

---

## 11. Regras Transversais (todas as esteiras de produto)

### 11.1. Comentários

Apenas `person`, `company` e `backoffice` podem comentar na jornada.

### 11.2. Botão de Rascunho

Visível para: `tech`, `person`, `system`, `company`, `backoffice`, `economiario`.
Ações: "Continuar" e "Deletar rascunho".

### 11.3. Formulários de Pendência

Quando o backoffice envia o ticket de volta para o consorciado (pendência):
1. Identifica o último `tab_id` da jornada
2. Se o `tab_id` está na lista de formulários de pendência → exibe apenas esse formulário
3. Caso contrário → exibe o formulário padrão (default)

### 11.4. Pré-criação do Protocolo

Todas as esteiras de produto executam limpeza e normalização:
- Cópia das cotas para `custom.quotas{n}`
- Remoção de e-mails das cotas
- Limpeza de campos internos/logs
- Normalização de valores monetários e complementos de endereço

### 11.5. Módulo de Detalhes do Ticket

Todas as esteiras: `module_ticket_details: true`.

### 11.6. Cache Otimizado

Aquisição: `optimize_cache: true`. Demais: sem flag explícita.

### 11.7. Sem Avaliação/Rating

Todas as esteiras: `rating` desabilitado para todos os tipos de usuário.

### 11.8. IA/OCR (Tech4IA)

Vários formulários utilizam `optional_config.extract_iag` para extrair dados de documentos enviados via upload:
- `documentoIdentificacao` (consorciado, fiador)
- `documentoIdentificacaoConjuge`
- `comprovanteEndereco`
- `documentoIdentificacaoMovel` / `documentoIdentificacaoMovelComplementar` (veículos)
- `matriculaImovel` (imóveis)
- `iptuImovel` / `iptuImovelEmGarantia` (imóveis)

---

## 12. Integração com Force (Workforce)

| Configuração | Valor |
|--------------|-------|
| **URL criação ticket** | `https://forceflow.tech4h.com.br/tickets` |
| **URL jornada** | `https://temp-api-production-force.../ra-messages/wp/journey` |
| **URL comentários** | `https://temp-api-production-force.../ra-messages/ra/tickets/{protocol}/interactions/automation-flow-block-api` |
| **URL interação** | `https://temp-api-production-force.../tickets/{protocolNumber}/interactions/{flowInteractionId}` |
| **URL SAS (upload)** | `https://forceflow.tech4h.com.br/clients/{client_id}/sas` |
| **Client ID Force** | `757703e8-a628-4478-ad4e-aa4cfc2441ac` |
| **Slug (HML)** | `237da8b3-4071-4d96-b33f-9c8dde234ed8` |
| **Slug (PROD)** | `36060dda-c0da-471a-a952-7d1fafb0bc02` |
| **URL e-mail** | `https://webapp-qa-api.hml-tech4h.com.br/{client_key}/{service_key}/communication/email-template/{id}/send` |
| **URL protocolo interno** | `https://webapp-qa-api.hml-tech4h.com.br/{client_key}/{service_key}/protocol/protocol` |
| **URL redirect protocolo** | `https://webapp-qa.hml-tech4h.com.br/{client_key}/{service_key}/token?rsa={rsa}&redirect=VIEW_PROTOCOL:{id}` |
| **URL criação usuário BCP** | `https://webapp-qa-api.hml-tech4h.com.br/{client_key}/{service_key}/authentication/user-account/bcp` |
| **Storage Azure** | `devwebappfiles` / `prodwebappfiles` (container: `techforms`) |
| **Messaging (Service Bus)** | Queue `batch_protocol` em `webappservicebusdev.servicebus.windows.net` |
| **Limite de documentos** | 10 |
| **e-mail cancelamento cota** | Template ID: `95b76366-5ab4-4161-98a9-1cf4489216ed` |

---

## 13. Ordem dos Formulários por Step

### Aquisição de Bens Móveis

**PF Aprovado** (`aquisicao_de_veiculos_leves_pf_aprovado`):
1. `atualizacaoCadastral`
2. `envioDeDocumentosFather`
3-14. Repetições de `informacoeDoBemDoConsorciado` + `dadosBancariosDoVendedor` + `formDePagamentoDoBem` (até 10 bens) + `comentarioExtra`

**PF Mesa** (`aquisicao_de_veiculos_leves_pf_mesa`):
1. `atualizacaoCadastral`
2. `envioDeDocumentosFather`
3. `informacoesAdicionais`

**PJ Aprovado** (`aquisicao_de_veiculos_leves_pj_aprovado`):
1. `atualizacaoCadastral`
2. `envioDeDocumentos`
3-14. Repetições de `informacoeDoBemDoConsorciado` + `dadosBancariosDoVendedor` + `formDePagamentoDoBem` + `comentarioExtra`

**PJ Mesa** (`aquisicao_de_veiculos_leves_pj_mesa`):
1. `atualizacaoCadastral`
2. `envioDeDocumentos`
3. `informacoesAdicionais`

**Fiador PF Mesa** (`aquisicao_de_veiculos_leves_fiador_pf_mesa`):
1. `atualizacaoCadastral`
2-3. `envioDeDocumentosFather` (duplicado)

**Fiador PJ Mesa** (`aquisicao_de_veiculos_leves_fiador_pj_mesa`):
1. `atualizacaoCadastral`
2. `envioDeDocumentosFather`
3. `envioDeDocumentos`
4-15. Repetições de `informacoeDoBemDoConsorciado` + `dadosBancariosDoVendedor` + `formDePagamentoDoBem`

### Imóveis

**PF Aprovado** (`aquisicao_de_imoveis_pf_aprovado`):
1. `atualizacaoCadastral`
2. `envioDeDocumentosFather`
3. `informacoeDoBemComplementar`
4-14. `dadosDoVendedorPF` → `dadosDoVendedor2`...`10` + `formDePagamentoDoBem`

**PF Mesa** (`aquisicao_de_imoveis_pf_mesa_credito`):
1. `atualizacaoCadastral`
2. `envioDeDocumentosFather`
3. `informacoesAdicionais`

**PJ Mesa** (`aquisicao_de_imoveis_pj_mesa_credito`):
1. `atualizacaoCadastral`
2. `envioDeDocumentos`

**Fiador PF/PJ Mesa**: Similar ao padrão base com `envioDeDocumentosFather` duplicado + cadeia de vendedores.

### Quitação de Financiamento

Mesmo padrão da Aquisição, substituindo `informacoeDoBemDoConsorciado` por formulários de quitação. Steps mesa são curtos (3 formulários), aprovados são extensos.

### Solicitação de Acesso

1. `solicitacaoDeAcesso` (único)

---

## 14. Scripts por Esteira

Cada esteira possui **7 scripts** extraídos em `scripts/`:

| Script | Função |
|--------|--------|
| `custom_filters.js` | Roteamento de etapas por status de crédito e tipo PF/PJ |
| `pendency_custom_filters.js` | Define qual formulário exibir em pendências |
| `execute_before_create_protocol.js` | Limpeza e normalização antes de criar protocolo |
| `execute_filter_workflow_protocols_before_create_draft.js` | Busca de rascunhos existentes |
| `get_external_identification_function.js` | Identificação externa do consorciado |
| `get_main_user_account_data_function.js` | Dados do usuário principal do protocolo (referencia form `e40b7b56`) |
| `top_custom_section_protocol_function.js` | HTML exibido no topo do protocolo |

---

## 15. Hooks de Formulários e Campos

### Formulários com `on_form_validation`

| Formulário | Esteira(s) | Função |
|------------|------------|--------|
| `envioDeDocumentosFather` | Todas | Valida CEP + cotas antes de enviar docs |
| `envioDeDocumentos` | Todas | Mesma validação |
| `formDePagamentoDoBem` | Todas | Parse radiogrid, validação monetária, limpeza banco |
| `dadosBancariosDoVendedor` | Aquisição, Quitação | Modal confirmação dados vazios |
| `informacoeDoBemDoConsorciado` | Aquisição, Quitação | Define chassi default |
| `informacoeDoBemComplementar` | Imóveis | Modal FGTS |
| `dadosDoVendedorPF` | Imóveis | Verificação vendedor via API |
| `dadosDoVendedor2`...`10` | Imóveis | Verificação vendedor via API |
| `solicitacaoDeAcesso` | Sol. Acesso | Validação token economiário |

### Campos com hooks relevantes

| Campo | Hook | Descrição |
|-------|------|-----------|
| `estadoCivil` | `on_load`, `on_change` | Exibe/esconde campos de cônjuge |
| `regimeTrabalhistaConjuge` | `on_load`, `on_change` | Exibe/esconde docs de renda por regime |
| `temProcuracao` | `on_load`, `on_change` | Exibe/esconde campos de representante |
| `tipoRepresentante` | `on_load`, `on_change` | Alterna PF/PJ do representante |
| `tipoVendedor` | `on_change` | Alterna campos PF/PJ do vendedor |
| `desejaAdicionarConjuge` | `on_load`, `on_change` | Exibe/esconde formulário de cônjuge |
| `desejaAdicionaRendaComplementar` | `on_load`, `on_change` | Exibe/esconde formulário de renda |
| `desejaAdicionarOutroBem2` | `on_change` | Adiciona novo bem (`is_filter`) |
| `desejaAdicionarOutroVendedor2` | `on_load`, `on_change` | Adiciona novo vendedor (`is_filter`) |
| `cep` | `on_blur` | Busca ViaCEP |
| `telefone*` | `on_blur` | Máscara telefone brasileiro |
| `tipoDeBem` | `on_load`, `on_change` | Alterna tipo imóvel e campos condicionais |
| `usouFGTSouPretendeUsar` | `on_load`, `on_change` | Exibe campos FGTS |
| `imovelEstaAlienado` | `on_load`, `on_change` | Exibe campos alienação |
| `tipoPagamentoGrid` | `on_load`, `on_change` | Alterna desconto na carta / boleto |
| `sobraDeCredito` | `on_load`, `on_change` | Alterna tipo de sobra + banco |

---

## 16. Estrutura dos Dados Extraídos

```
projects/documentacao-webapp/caixa/
├── payload.json                              # Client service completo (920+ linhas)
├── services-index.json                       # Índice de serviços
├── WORKFLOW-MENU-RESUMO-ALL-SERVICES.json    # Resumo do menu (3 grupos, 7 itens)
├── assets/                                   # Ícones e logos
├── consorcio/
│   ├── payload.json                          # Mesmo que raiz
│   └── esteiras/
│       ├── aquisicao_de_veiculos_leves/      # 18 forms, 6 steps
│       │   ├── payload.json
│       │   ├── scripts/ (7 .js)
│       │   ├── workflow-steps/ (6 dirs)
│       │   │   └── */payload.json + workflow-step-forms/
│       │   ├── workflow-forms/ (18 dirs)
│       │   │   └── */payload.json + *.js (field scripts)
│       │   └── workflow-groups/
│       ├── imoveis/                          # 36 forms, 6 steps
│       ├── quitacao_de_financiamento/        # 17 forms, 6 steps
│       └── solicitacao_de_acesso/            # 1 form, 1 step
├── cpr/
│   ├── payloads/ (233 .json)
│   └── scripts/ (233 .js)
└── docs/
    ├── WORKFLOWS-FORMS-SCRIPTS-E-LOTE.md     # Documentação de forms/scripts/steps
    ├── workflows-forms-scripts-lote.data.json
    ├── cpr-references-scan.json
    └── sync-workflow-esteiras-last-run.json
```

**Total de arquivos extraídos:** ~1890+ (esteiras) + 466 (CPRs) + assets + docs

---

## 17. Referências de UUIDs

### Formulários — IDs por esteira

#### Aquisição

| Form Key | UUID |
|----------|------|
| `atualizacaoCadastral` | `e40b7b56-c533-4608-8ae4-6d208967d8a1` |
| `envioDeDocumentosFather` | `c004b74c-5369-4198-aef8-4028df3cb232` |
| `envioDeDocumentos` | `e0f406c6-8c94-477b-be25-fb4c05facfbc` |
| `dadosDoConsorciado` | `56b1cce9-1510-410e-bca7-7ce4d29bc5a3` |
| `cadastroRepresentanteLegal` | `2535d947-b856-45d4-8c67-a53510bd94df` |
| `comprovanteDeEnderecoConsorciado` | `c244a943-5072-42b1-bfdb-eb6690fc8704` |
| `informacoeDoBemDoConsorciado` | `2a90e020-62d7-4339-861c-06c539952790` |
| `informacoeDoBemComplementarDoConsorciado` | `48ea7a6a-4193-47cc-93a1-d505824ae208` |
| `dadosBancariosDoVendedor` | `fe102d9a-1f43-43aa-be7c-3476fcc3d2f5` |
| `formDePagamentoDoBem` | `a2f62343-2cbd-4414-876e-0711af7ffcb6` |
| `informacoesAdicionais` | `0c233afa-91e8-426a-87cb-e62bb053972d` |
| `informacaoAdicionais` | `fb22ce66-c96d-47e0-827b-4b6b1e670684` |
| `rendaComplementarDoConsorciado` | `b3b11f26-2783-4eea-a8a7-ac58974d5623` |
| `dadosConjugeConsorciado` | `03b8137d-eaaa-411e-8e06-8bcdab701b45` |
| `dadosDoFiador` | `de9b6325-ee12-4c95-8860-c9b88d9a61c6` |
| `cadastroRepresentanteLegalFiador` | `17f4ad75-2c19-4f8f-a871-25b2b513cc99` |
| `comprovanteDeEnderecoFiador` | `8dc51782-77e7-4215-a9c3-30f86ec7b6d7` |
| `comentarioExtra` | `e7360787-e937-41a4-97a1-66f234338c63` |

#### Imóveis (forms exclusivos)

| Form Key | UUID |
|----------|------|
| `dadosDoConsorciado` | `a443faf6-fd81-4097-b723-7b6f42e9ad40` |
| `envioDeDocumentosFather` | `79c47a90-d630-4b00-807a-1d1d82f6bdea` |
| `comprovanteDeEnderecoConsorciado` | `5fd2c147-ac40-4b97-8ff9-72428d8881a4` |
| `informacoeDoBemComplementar` | `88f95467-d7ca-4ccd-8e99-abf2084ff073` |
| `informacoeDoBem` | `3da8f210-5ece-49e6-b055-03cb1999dc33` |
| `informacoeAdicionaisDoBem` | `6e7efb41-18eb-436f-ac45-9b45c73f6663` |
| `informacoeVistoriaDoBem` | `7a7596ec-671b-44c1-9ff2-426b1b5472d8` |
| `informacoeAdicionaisDoBemComplementar` | `78351f2a-14d4-4174-a390-0640f7fda047` |
| `dadosDoVendedorPF` | `338c7e76-745e-415a-9ed1-ba897888ac41` |
| `dadosDoVendedor` | `fa1fc17c-616d-4f3d-82c8-bd409c209dfd` |
| `dadosDoVendedor2` | `8846d0b5-21dd-4b32-8d0f-a53d8aa040b3` |
| `dadosDoVendedor3` | `1fd298e8-59e0-40d9-8c36-724610f21688` |
| `dadosDoVendedor4` | `0d50002f-9cfe-4b49-abb1-0b3958a73f36` |
| `dadosDoVendedor5` | `dc536804-8beb-4809-9f72-5129d56b0845` |
| `dadosDoVendedor6` | `8d46293f-31a3-4670-ab03-40c25f855a79` |
| `dadosDoVendedor7` | `34ea3824-711a-460c-ac8c-a4fc5cedde27` |
| `dadosDoVendedor8` | `9118de95-19f1-41c2-8748-e4dacb4c10fd` |
| `dadosDoVendedor9` | `ebe22850-c0bd-4510-96e0-8c4bc03cb93d` |
| `dadosDoVendedor10` | `2c67c0f0-333c-49f5-b893-9e8f4e9f117c` |
| `dadosBancariosDoVendedor` | `ac5ec57b-ae15-480e-9a7f-0596ad0e0fcf` |
| `comprovanteDoVendedor` | `a4ba5ac7-ee62-4422-bd2b-8ace4ceed7ff` |
| `dadosAdicionais` | `95971d61-91c2-4b8f-afad-f3053b117830` |
| `dadosDoConjugeVendedor` | `46431659-9bcd-4b88-90fd-1887bf5db81d` |
| `dadosDoConjugeConsorciado` | `e0802da8-9721-4892-a71b-2b1dc16e94d3` |
| `dadosDoConjugeFiador` | `5908f616-428e-4f55-8dd5-07a8f0e0e9d0` |
| `formDePagamentoDoBem` | `794bd3de-7b91-4e2c-9ffb-acdb6276b183` |
| `cadastroRepresentanteLegal` | `0726e8ad-8010-4917-8da5-e61830244296` |
| `cadastroRepresentanteLegalFiador` | `66033130-92a5-4f35-b0bc-541d10067759` |
| `comprovanteDeEnderecoFiador` | `687e4f64-4fb1-4b41-a7e3-b611dbbbd106` |
| `dadosDoFiador` | `50b7cba8-eb88-45f4-a3af-418b79fb8dc5` |
| `envioDeDocumentos` | `950da745-c6e2-414a-b636-f4d623167a14` |

#### Quitação (forms com UUIDs diferentes)

| Form Key | UUID |
|----------|------|
| `atualizacaoCadastral` | `0229757c-f37b-4cc2-839a-869b7f494546` |
| `envioDeDocumentosFather` | `4f3bb719-06b4-4bc3-af42-eb2537007aa1` |
| `dadosDoConsorciado` | `f42dd106-dc4a-41cf-bd3d-676888d803c7` |
| `comprovanteDeEnderecoConsorciado` | `b80224d0-b362-45c3-9477-84c6bec736c8` |
| `cadastroRepresentanteLegal` | `3960a9a4-3962-41fb-aac3-80b6f33bbb2e` |
| `informacoeDoBemDoConsorciado` | `ef15cda0-ea36-4227-910f-4f9eeef8fae3` |
| `informacoeDoBemComplementarDoConsorciado` | `63298227-5ea7-4a2c-af57-e21ea4bda6b3` |
| `formDePagamentoDoBem` | `905706ff-78e7-4c19-85ce-3b823eef5768` |
| `cadastroRepresentanteLegalFiador` | `b5f72aa0-0005-45da-9ace-fb5a9e42b4d2` |
| `dadosDoFiador` | `c8758c07-c0df-406b-8a85-e16c6e675992` |
| `comprovanteDeEnderecoFiador` | `c34494d5-5840-422e-a9d1-fad8aa44ed94` |

#### Solicitação de Acesso

| Form Key | UUID |
|----------|------|
| `solicitacaoDeAcesso` | `6104a2d7-c87a-4d70-920e-d91e788cbae6` |
