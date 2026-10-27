# Raiz Odontologia — landing page (projeto conceitual)

Landing page de clínica odontológica com **agenda própria ligada ao Google Agenda**, alternativa de agendamento pelo WhatsApp, formulário de contato para planilha e e-mail, e rastreamento pronto para GA4, Google Ads, Meta Pixel e Clarity.

> Projeto conceitual de portfólio por **João Pedro Morais**, baseado em um pedido real do 99Freelas. A clínica, a equipe e os contatos são fictícios.

**Site:** https://raizodontologia.vercel.app · **Código:** https://github.com/joaoepedro/lp-raizodontologia

## Tecnologias

HTML, CSS e JavaScript puros. Sem frameworks, sem bibliotecas, sem etapa de build. Integração com Google Apps Script (Agenda, Planilhas e Gmail).

## Estrutura

```
index.html · obrigado.html · politica-de-privacidade.html
css/      reset.css · variables.css (tokens) · style.css
js/       config.js (painel de controle) · utils.js · tracking.js · agenda.js · form.js · main.js · obrigado.js
assets/   img/ (WebP em 3 tamanhos, SVG do dente, imagem de compartilhamento) · fonts/ (.woff2 + licenças OFL)
integracoes/apps-script/   Code.gs · appsscript.json · LEIA-ME.md
docs/     ponto de partida, briefing, persona, copy, identidade visual
robots.txt · sitemap.xml · vercel.json
```

## Rodar localmente

Abra a pasta no VS Code e use a extensão **Live Server**, ou no terminal:

```
python -m http.server 8000
```

e acesse `http://localhost:8000`. Não abra o `index.html` direto pelo arquivo (`file://`).

## Configurar

Tudo o que muda fica em `js/config.js`:

- `modoDemo`: `true` mostra avisos no lugar de WhatsApp/telefone fictícios e simula a agenda sem Apps Script.
- `agenda.appsScriptUrl` e `formulario.appsScriptUrl`: URL do App da Web (passo a passo em `integracoes/apps-script/LEIA-ME.md`).
- `rastreamento`: IDs do GTM, GA4, Google Ads, Meta Pixel e Clarity. Sem ID, os eventos aparecem no console.
- Contatos, horários de atendimento, mensagens do WhatsApp e redes sociais.

Textos e imagens editáveis estão marcados no HTML com `<!-- ✏️ EDITÁVEL -->` … `<!-- ✏️ FIM -->`.

## Eventos de conversão

| Evento | Quando | Meta |
|---|---|---|
| `agendamento_confirmado` | consulta marcada na agenda | Schedule |
| `generate_lead` | página de obrigado (uma vez por envio) | Lead |
| `clique_whatsapp` | qualquer botão de WhatsApp | Contact |
| `clique_telefone` | link de telefone | Contact |
| `agenda_vista` → `dia_escolhido` → `horario_escolhido` → `formulario_iniciado` | funil da agenda (sem dados pessoais) | — |
| `cta_clique`, `mapa_aberto` | botões de agendar e mapa do rodapé | — |

## Testes

- Lógica do Apps Script testada com serviços do Google simulados (horários, conflito, "ocupado", proteção contra repetição, limpeza).
- Lighthouse, axe, larguras de 320 a 1920px, teclado, movimento reduzido, validador do W3C e fluxos da agenda e do contato: resultados em `docs/revisao-2026-10-27.md`.

## Publicar

GitHub + Vercel, sem comando de build. Depois de publicar, atualize a URL em `index.html` (canonical e Open Graph), `robots.txt`, `sitemap.xml` e `js/config.js`.

## Créditos

Fontes Newsreader e Manrope (SIL Open Font License). Fotos de banco de imagens licenciadas.
