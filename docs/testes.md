# Testes e qualidade

Como a página foi testada, o que os testes encontraram e como repetir.

## Resultados

| Área | Resultado |
|---|---|
| Lighthouse celular | Desempenho 96–99 · Acessibilidade 100 · Boas práticas 100 · SEO 100 |
| Lighthouse computador | 100 · 100 · 100 · 100 |
| Core Web Vitals (celular simulado) | LCP ~2,0 s · CLS 0 · TBT 0–100 ms |
| Acessibilidade automática (axe, WCAG 2.2 AA) | 0 problemas |
| HTML (validador do W3C) | 0 erros |
| Peso da primeira visita | 15 requisições, ~260 KB antes da compressão |

## O que foi testado

**Desempenho e SEO**
- Lighthouse no celular e no computador, várias rodadas, num servidor com compressão e cache iguais aos da Vercel; PageSpeed Insights no site publicado.
- Título, descrição, canonical, Open Graph, `robots.txt`, `sitemap.xml` e dados estruturados (`Dentist`) conferidos campo a campo.

**Responsividade**
- Larguras de 320, 375, 768, 1024, 1366, 1440 e 1920px, celular deitado e tablet em pé e deitado: nenhuma rolagem lateral.
- Texto em 150% e 200% (quem aumenta a fonte no celular): nada cortado.

**Acessibilidade além do automático**
- Percurso completo com a tecla Tab (62 itens no celular, 67 no computador): ordem igual à da tela, foco visível em todos, nenhuma armadilha.
- Janelas: o foco entra, Esc fecha e o foco volta ao botão que abriu.
- Agenda pelo teclado: dias e horários com estado "selecionado" e anúncio para leitor de tela; ao confirmar, o foco vai para "Consulta marcada".
- Movimento reduzido: conteúdo visível, sem deslocamentos.
- Sem JavaScript: todo o conteúdo visível.
- Hierarquia de títulos sem saltos, marcos da página, textos alternativos, alvos de toque.

**Formulários e agenda**
- Cada mensagem de erro, `aria-invalid`, o erro só some ao digitar, máscara do telefone, isca anti-robô, página de obrigado.
- Lead registrado uma única vez (recarregar o obrigado não repete).
- UTMs chegando com o agendamento e com o contato.
- Lógica do Apps Script com os serviços do Google simulados: horários por dia da semana e pausa, domingo bloqueado, horário fora da grade recusado, mesmo horário duas vezes → "ocupado", mesmo WhatsApp em 1 minuto → "aguarde", fórmulas neutralizadas na planilha.
- Agenda real (Google Agenda), no computador e no celular: evento criado, horário some da página, evento criado à mão bloqueia o horário, dois agendamentos simultâneos no mesmo horário → só um passa.

## O que os testes encontraram (e foi corrigido)

| Problema | Correção |
|---|---|
| Se o `main.js` falhasse, 31 blocos ficavam invisíveis (animação nunca disparava) | Rede de segurança: após 3 s sem animação, tudo aparece |
| Evento com hora marcada que atravessa dois dias só bloqueava o primeiro | A busca de horários considera todo evento que encosta no dia |
| Falha no e-mail de aviso fazia o formulário mostrar erro, mesmo com o contato salvo | E-mail protegido; o contato não se perde |
| Raízes do dente decorativo cortadas em telas acima de ~1350px | Tamanho fixo do traço em telas largas e hero com altura suficiente |
| Com fonte grande, texto cortado à direita e link "Pular para o conteúdo" aparecendo | Grades com `minmax(0, 1fr)`, topo que quebra linha e link escondido com `transform` |

## Como repetir

1. **PageSpeed Insights** (pagespeed.web.dev): cole o endereço do site; teste celular e computador.
2. **axe DevTools** (extensão gratuita do Chrome): abra a página, role até o fim e rode a análise.
3. **Validador do W3C** (validator.w3.org): cole o endereço.
4. **Teclado:** percorra a página só com Tab, Enter, Espaço e Esc, inclusive a agenda.
5. **Celular de verdade:** role a página inteira e faça um agendamento.
6. **Agenda real:** depois de mudar horários no Apps Script, confira um agendamento, um evento criado à mão e dois agendamentos simultâneos.
