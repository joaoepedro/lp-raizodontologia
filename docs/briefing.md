# Briefing — Raiz Odontologia (projeto conceitual)

> Clínica, equipe, CRO, endereço e contatos são **fictícios**. A página terá aviso visível de "projeto conceitual".

## Tipo de página

**Serviço / negócio local**, tamanho médio. Conversão por agendamento, WhatsApp, ligação ou formulário.

## A clínica

- **Nome:** Raiz Odontologia
- **Conceito:** cuidar da saúde bucal desde a base (a raiz). Clínica geral humanizada, com foco em **cuidado, prevenção e saúde**. O medo de dentista não é o tema da página: aparece só como quebra de objeção.
- **Cidade:** Curitiba – PR, bairro Água Verde (endereço fictício, sem número real; o mapa mostra só o bairro).
- **Atendimento:** particular. Segunda a sexta, 8h às 19h; sábado, 8h às 12h.
- **Equipe (fictícia):**
  - Dra. Helena Kowalski — clínica geral e periodontia; **responsável técnica**, CRO-PR (número fictício, sinalizado na página)
  - Dr. Rafael Moreira — implantodontia e prótese
  - Dra. Júlia Tanaka — ortodontia e odontopediatria
- **Estrutura:** 4 consultórios, radiografia digital na clínica, escaneamento intraoral (sem moldagem com massa), esterilização com rastreabilidade, acessibilidade no térreo, sala de espera infantil.

## Tratamentos (cards)

1. Consulta de avaliação e prevenção
2. Limpeza e cuidado com a gengiva
3. Restaurações e tratamento de canal
4. Clareamento dental
5. Ortodontia (aparelho fixo e alinhadores)
6. Facetas e lentes de contato dental
7. Implantes e próteses
8. Odontopediatria

## Objetivo e conversões

**Objetivo único:** levar o visitante a marcar a **primeira consulta de avaliação**.

| Conversão | Onde | Evento |
|---|---|---|
| Agendamento confirmado (principal) | Agenda na página | Meta `Schedule` · GA4 `agendamento_confirmado` · conversão Google Ads |
| Clique no WhatsApp | Botão flutuante e CTAs | Meta `Contact` · GA4 `clique_whatsapp` |
| Clique no telefone | Contato e rodapé | Meta `Contact` · GA4 `clique_telefone` |
| Formulário enviado | Seção Contato → `obrigado.html` | Meta `Lead` · GA4 `generate_lead` |

Todos os botões principais levam para a agenda (`#agendar`), e o WhatsApp fica como alternativa visível. A única saída é a Política de Privacidade.

## Agenda online

- Tipo único: **Consulta de avaliação, 40 min** (intervalo de 10 min entre consultas). Os tratamentos são marcados depois, na própria consulta.
- Horários, dias, duração, antecedência mínima (ex.: 2 h) e janela (ex.: 30 dias) ficam no `config.js`.
- A agenda oficial é o Google Agenda (de teste, no portfólio). A página mostra só horários livres.
- Dados pedidos: nome, WhatsApp, e-mail (opcional), "primeira vez na clínica?" e consentimento LGPD.

### Fluxo na página (visual próprio, Google Agenda nos bastidores)

1. **Dia:** faixa com os próximos dias úteis (rolagem lateral no celular, semana inteira no desktop); dias sem vaga desabilitados.
2. **Horário:** horários livres do dia, buscados no `doGet` (sem dados de pacientes).
3. **Dados:** formulário abaixo, no mesmo bloco (sem modal), com resumo "Consulta de avaliação · dia · hora".
4. **Confirmar:** `doPost` revalida com `LockService` e então:
   - cria o evento no Google Agenda (dados do paciente na descrição);
   - grava uma linha na planilha;
   - envia e-mail para a clínica e confirmação ao paciente (se informou e-mail).
5. **Confirmação:** o bloco mostra "Consulta marcada" + adicionar à agenda + WhatsApp; disparam `Schedule` (Meta), conversão Google Ads e `agendamento_confirmado` (GA4).
- Horário ocupado no meio tempo: aviso, recarrega horários e mantém os dados digitados.

### Planilha

- **Aba "Agendamentos":** carimbo do pedido, data/hora da consulta, nome, WhatsApp, e-mail, primeira vez, UTMs (source, medium, campaign, content, term), página de origem, dispositivo, status (confirmado/cancelado, atualizado pela recepção).
- **Aba "Contatos":** formulário de contato com os mesmos campos de UTM.
- **Abandono:** nenhum dado pessoal antes da confirmação (LGPD). O funil é medido só com eventos anônimos no GA4: `agenda_vista` → `dia_escolhido` → `horario_escolhido` → `formulario_iniciado` → `agendamento_confirmado`.

## Origem do tráfego e temperatura

Tráfego **equilibrado**:
- **Google Ads + Google Meu Negócio** → público **morno/quente**, que já procura dentista. A primeira dobra precisa responder rápido: quem são, onde ficam, horários e "agendar agora".
- **Instagram / Facebook** → público **frio**. Os blocos seguintes mostram por que cuidar agora (prevenção, saúde geral) antes de pedir a ação.
- Fórmula: AIDA na primeira dobra; um PAS leve no bloco de cuidado/prevenção; FAB nos tratamentos e diferenciais.
- Ainda não há anúncios. A promessa do título vira a base dos anúncios.

## Regras de publicidade (CFO)

- Sem preços, descontos, formas de pagamento ou "avaliação grátis" como apelo (Código de Ética Odontológica, Res. CFO 118/2012).
- Sem promessa de resultado, sem superlativos, sem "antes e depois" (projeto conceitual, sem paciente real).
- Nome da responsável técnica e CRO visíveis na seção Sobre e no rodapé.
- Depoimentos: não serão inventados como reais. A prova vem da equipe nomeada, da estrutura concreta e da transparência (decidido na copy). Em projeto real, entra um bloco "Avaliações no Google" com avaliações verdadeiras.

## Contatos em modo demonstração

WhatsApp, telefone e e-mail fictícios não podem abrir conversa com um desconhecido real. O `config.js` tem `modoDemo: true`: os cliques abrem uma janela explicando que o projeto é conceitual e mostrando a mensagem que seria enviada, e o evento é registrado no console. **Decidido na Etapa 5:** manter o aviso (nenhum número real exposto).

## Prazo e orçamento (referência para o estudo de caso)

- Prazo de referência: 15 dias úteis.
- Faixa típica no 99Freelas para esse escopo: R$ 1.500 a R$ 3.500.

## Entregáveis

Landing page publicada (Vercel, SSL), `obrigado.html`, `politica-de-privacidade.html`, Apps Script de agenda e formulário, rastreamento (GTM/GA4/Meta Pixel prontos via `config.js`), SEO local (`Dentist`), guia de edição nível 2, README e material de portfólio.
