# Ponto de partida — Landing page de clínica odontológica (projeto conceitual)

Data: 20/10/2026 · Tipo de projeto: portfólio (cliente fictício, baseado em um pedido real do 99Freelas)

## Situação de cada item

| Item | Status | Observação |
|---|---|---|
| Briefing | Parcial | Descrição do 99Freelas cobre estrutura, funcionalidades e entregáveis. Faltam: nome, cidade, tratamentos, preços, prazo fictícios (Etapa 1). |
| Branding | Criar do zero | Clínica fictícia sem marca. Cores pedidas: branco, azul e verde (confiança). Primeiro projeto do portfólio: sem restrição de identidade anterior. |
| Persona / público | Criar do zero | Etapa 2. |
| Copy | Criar do zero | Inclui copywriting com foco em conversão, linguagem acessível e regras do CFO (Res. CFO 196/2019 e Código de Ética). |
| Sites de referência | Criar do zero | Pesquisar 3 a 5 clínicas reais como inspiração (Etapa 2). Nunca copiar código, layout ou textos. |
| Anúncios | Não existem | Tráfego previsto: Google Ads, Instagram, Facebook e Google Meu Negócio. A copy definirá a promessa que os anúncios devem repetir. |
| Integrações | Definidas | Ver abaixo. |
| Agendamento | Definido | Agenda própria na página ligada ao Google Agenda via Apps Script + "Agendar pelo WhatsApp". |
| Domínio e hospedagem | Criar | GitHub + Vercel (`nome.vercel.app`). SSL automático da Vercel. |
| Edição pós-entrega | Definido | **Nível 2**: `config.js` + textos/imagens marcados com `<!-- ✏️ EDITÁVEL -->`, editados pelo GitHub. |

## Integrações decididas

- **Agenda**: Google Agenda de teste do autor (João Pedro Morais) como agenda única oficial (sem agenda paralela). Apps Script:
  - `doGet` → só horários livres (sem dados de pacientes); dias, horários, duração e intervalo ficam no `config.js` do site **e** espelhados no `Code.gs` (o servidor é quem decide).
  - `doPost` → revalida com `LockService`, cria evento com `CalendarApp`, registra na planilha.
  - Demonstração: gatilho semanal que limpa eventos de teste, limite de agendamentos por dia, aviso de projeto conceitual.
- **Formulário de contato**: mesmo projeto Apps Script → grava na planilha **e** envia aviso por e-mail (MailApp). Honeypot, consentimento LGPD, UTMs.
- **WhatsApp**: botão flutuante e CTAs com mensagem pronta (`wa.me`), clique contado como `Contact`. Número fictício em modo demo.
- **Telefone**: link `tel:` rastreado como conversão.
- **Rastreamento**: GTM, GA4 e Meta Pixel carregados só se houver ID no `config.js` (sem ID, eventos vão para o console). Banner de cookies LGPD.
- **SEO local**: dados estruturados `Dentist`, Open Graph, sitemap, robots.

## Stack

HTML, CSS e JavaScript puros, sem frameworks, bibliotecas, npm ou build.

## Restrições de conteúdo (CFO/CRO)

- Sem promessa de resultado, sem preço, desconto ou "avaliação grátis" como chamariz (Código de Ética Odontológica, Res. CFO 118/2012), sem superlativos ("o melhor", "garantido").
- "Antes e depois": a Res. CFO 196/2019 permite com autorização do paciente e sem sensacionalismo, mas em projeto conceitual **não usaremos** (não há paciente real para autorizar).
- Nome do responsável técnico e número do CRO visíveis.
- Depoimentos: em portfólio, não apresentar depoimento inventado como real.
