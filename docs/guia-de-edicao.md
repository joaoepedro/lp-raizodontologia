# Guia de edição: Raiz Odontologia

Este guia é para quem vai cuidar da página no dia a dia, sem precisar saber programar. Leia a parte 1 uma vez; depois, use o índice para ir direto ao que precisa.

1. [Como a página é publicada](#1-como-a-página-é-publicada)
2. [Como editar um arquivo pelo GitHub](#2-como-editar-um-arquivo-pelo-github)
3. [Painel de controle (`config.js`)](#3-painel-de-controle-configjs)
4. [Textos da página](#4-textos-da-página)
5. [Trocar fotos](#5-trocar-fotos)
6. [Mudanças que aparecem em mais de um lugar](#6-mudanças-que-aparecem-em-mais-de-um-lugar)
7. [A agenda no dia a dia](#7-a-agenda-no-dia-a-dia)
8. [O que não mexer](#8-o-que-não-mexer)
9. [Se algo der errado](#9-se-algo-der-errado)
10. [Como ler os resultados](#10-como-ler-os-resultados)

---

## 1. Como a página é publicada

```
Você edita um arquivo no GitHub  →  a Vercel percebe sozinha  →  a página atualiza em 1 a 2 minutos
```

- **GitHub** guarda os arquivos da página e o histórico de todas as mudanças (dá para voltar atrás em qualquer uma).
- **Vercel** é a hospedagem: publica a versão nova a cada mudança salva no GitHub.
- **Google Agenda + Planilha + Apps Script** cuidam da agenda e do formulário (parte 7).

Depois de qualquer alteração, abra a página e aperte **Ctrl+F5** (no celular, feche e abra a aba) para ver a versão nova.

## 2. Como editar um arquivo pelo GitHub

1. Entre em **github.com** e abra o repositório da página.
2. Clique no arquivo (ex.: `js` → `config.js`, ou `index.html`).
3. Clique no **lápis** ("Edit this file"), no canto superior direito do arquivo.
4. Para achar um trecho, use **Ctrl+F** dentro do editor.
5. Faça a alteração.
6. Clique em **Commit changes…**, escreva o que mudou (ex.: `Atualiza horário de sábado`) e confirme em **Commit changes**.
7. Em 1 a 2 minutos a página está atualizada. Para acompanhar: no painel da Vercel, aba **Deployments**, a mudança aparece como **Ready**.

> Faça **uma mudança por vez** e confira a página antes da próxima. Se algo quebrar, fica fácil saber qual foi.

## 3. Painel de controle (`config.js`)

Fica em `js/config.js`. Tudo o que muda com frequência está aqui.

**Regras de ouro:**
- Troque só o que está **entre aspas** (ou o número).
- Não apague aspas `"`, vírgulas `,`, chaves `{ }` nem colchetes `[ ]`.
- Linhas que começam com `//` ou ficam entre `/* */` são explicações; não mudam nada.

| O que mudar | Onde | Exemplo |
|---|---|---|
| WhatsApp (para o link) | `contato.whatsapp` | `"5541999991234"`: 55 + DDD + número, **só dígitos** |
| WhatsApp (como aparece) | `contato.whatsappExibicao` | `"(41) 99999-1234"` |
| Telefone (para ligar) | `contato.telefone` | `"+554133334444"` |
| Telefone (como aparece) | `contato.telefoneExibicao` | `"(41) 3333-4444"` |
| Horário escrito na página | `contato.horarioTexto` | `"Seg. a sex. 8h–19h · Sáb. 8h–12h"` |
| Busca do mapa no rodapé | `contato.mapaBusca` | `"Rua Exemplo, 100 - Água Verde, Curitiba - PR"` |
| Responsável técnica | `responsavelTecnica.nome` / `.cro` | `"Dra. Nome Sobrenome"` / `"CRO-PR 12.345"` |
| Mensagens prontas do WhatsApp | `mensagensWhatsApp` | `{dia}` e `{hora}` são preenchidos sozinhos |
| Horários da agenda | `agenda.expediente`, `agenda.pausa` | veja a parte 6, porque precisa mudar em 2 lugares |
| Antecedência mínima e janela | `agenda.antecedenciaMinHoras`, `agenda.janelaDias` | `2` horas, `30` dias |
| Instagram e Facebook | `redes.instagram`, `redes.facebook` | link completo; vazio esconde o link |
| Rastreamento | `rastreamento` | IDs fornecidos por quem cuida dos anúncios |
| Projeto real (sem avisos de demonstração) | `modoDemo` e `site.projetoConceitual` | `false` |

## 4. Textos da página

Os textos editáveis do `index.html` estão entre duas marcações:

```html
<!-- ✏️ EDITÁVEL: subtítulo (até 160 caracteres) -->
<p class="hero__subtitulo">Aqui a gente ouve você antes de qualquer tratamento…</p>
<!-- ✏️ FIM -->
```

**Troque só o texto entre `>` e `<`.** Não apague nada que esteja entre `< >` (são as "etiquetas" que dão forma à página). O limite de caracteres está na marcação; passar dele pode desalinhar o layout no celular.

| Seção | O que dá para editar |
|---|---|
| Topo do arquivo | Título da aba e do Google (até 60) · descrição no Google (até 155) |
| Hero | Frase acima do título · título (a palavra entre `<em>` fica dourada) · subtítulo · foto |
| Cuidado | Título · 3 parágrafos · lista "Vale marcar uma avaliação se você…" |
| Tratamentos | Título, apoio, os 8 tratamentos, frase final |
| A clínica | Foto · título e texto · destaques (números) · equipe |
| O jeito Raiz | Os 6 diferenciais |
| Como funciona | As 5 etapas |
| Dúvidas | Perguntas e respostas (dá para acrescentar copiando um bloco `<details>` inteiro) |
| Contato | Texto de apoio · bairros atendidos |

Também editáveis: o texto do `obrigado.html` e a `politica-de-privacidade.html` (esta deve ser revisada pelo jurídico da clínica).

**Regras do CFO valem para qualquer texto novo:** sem preço, desconto ou "avaliação grátis"; sem "o melhor", "sem dor" ou promessa de resultado; sem "antes e depois" sem autorização por escrito do paciente.

## 5. Trocar fotos

As fotos ficam em `assets/img/`. Cada foto existe em 3 tamanhos, e o navegador escolhe o melhor para cada tela. **Mantenha exatamente os mesmos nomes de arquivo.**

| Foto | Arquivos | Formato |
|---|---|---|
| Hero (dentista atendendo) | `dentista-atendimento-400.webp`, `-640.webp`, `-960.webp` | quadrada (400×400, 640×640, 960×960) |
| A clínica | `clinica-consultorio-480.webp`, `-720.webp`, `-1080.webp` | vertical 2:3 (480×720, 720×1080, 1080×1620) |
| Prévia no WhatsApp e redes | `og-raiz-odontologia.jpg` | 1200×630, JPG |

**Como preparar (grátis, no navegador):**
1. Abra **squoosh.app** e arraste a foto.
2. Em **Resize**, coloque a largura do tamanho (ex.: 640); a altura acompanha se a foto já estiver no formato certo (corte antes, se precisar).
3. Em **Compress**, escolha **WebP**, qualidade **75**.
4. Baixe e renomeie com o nome exato da tabela. Repita para os 3 tamanhos.

**Como enviar:** no GitHub, abra a pasta `assets/img` → **Add file** → **Upload files** → arraste os arquivos → **Commit changes**. Arquivo com o mesmo nome substitui o antigo.

Se a foto nova mostrar outra pessoa ou outro lugar, atualize também o texto alternativo (`alt="…"`) logo abaixo da marcação ✏️ da foto: ele descreve a imagem para quem usa leitor de tela e para o Google.

## 6. Mudanças que aparecem em mais de um lugar

Algumas informações aparecem em vários pontos (página, Google, agenda). Use estas listas para não esquecer nenhum.

### Horário de atendimento
- [ ] `js/config.js`: `contato.horarioTexto` (texto) e `agenda.expediente` / `agenda.pausa` (horários da agenda)
- [ ] `integracoes/apps-script/Code.gs`: `EXPEDIENTE` e `PAUSA`, **iguais** ao `config.js`; depois, no Apps Script, **Implantar → Gerenciar implantações → editar → Nova versão** (só salvar não basta)
- [ ] `index.html`: bloco de dados estruturados no início do arquivo (`openingHoursSpecification`)
- [ ] `index.html`: diferencial "Horário que cabe na sua rotina", se mencionar o horário

### Telefone ou WhatsApp
- [ ] `js/config.js`: os quatro campos de `contato`
- [ ] `index.html`: `"telephone"` nos dados estruturados

### Equipe ou responsável técnica
- [ ] `js/config.js`: `responsavelTecnica` (aparece no hero e no rodapé)
- [ ] `index.html`: seção da equipe (nome, área, CRO, frase e as iniciais no círculo)
- [ ] `index.html`: `"employee"` nos dados estruturados
- [ ] `politica-de-privacidade.html`: encarregada pelos dados, se mudar

### Duração da consulta
- [ ] `js/config.js`: `agenda.duracaoMin` e `agenda.intervaloMin`
- [ ] `Code.gs`: `DURACAO_MIN` e `INTERVALO_MIN` (e nova versão da implantação)
- [ ] `index.html`: "40 minutos" no apoio da agenda, na etapa 3 de "Como funciona" e na dúvida "Quanto tempo dura…"

### Endereço completo (projeto real)
- [ ] `js/config.js`: `contato.mapaBusca`
- [ ] `index.html`: item "Endereço" da seção Contato e dados estruturados (`address`, `geo`)
- [ ] `Code.gs`: `ENDERECO` (vai no e-mail de confirmação)
- [ ] Perfil da Empresa no Google: **exatamente** o mesmo endereço

## 7. A agenda no dia a dia

A agenda da página **é o Google Agenda da clínica**. A página só mostra os horários em que não há nenhum evento.

| Situação | O que fazer no Google Agenda |
|---|---|
| Bloquear um horário (reunião, almoço da equipe) | Criar um evento nesse horário; ele some da página na hora |
| Feriado, folga ou férias | Criar um evento de **dia inteiro**; o dia todo fica sem horários |
| Paciente cancelou | Apagar o evento (o horário volta para a página) e marcar "cancelado" na coluna **status** da planilha |
| Paciente remarcou | Mover o evento para o novo horário |
| Agendamento por telefone ou WhatsApp | Criar o evento na mesma agenda, para a página não oferecer aquele horário |

**Planilha:** cada agendamento pelo site vira uma linha na aba **Agendamentos**; cada mensagem do formulário, na aba **Contatos**. A coluna **status** é para a recepção atualizar.

**E-mails:** cada agendamento envia um aviso para a clínica e uma confirmação para o paciente (se ele informou e-mail). Uma conta Gmail comum envia até cerca de 100 e-mails por dia.

## 8. O que não mexer

- Pastas `css/` e `js/` (exceto o `config.js`).
- No `index.html`, qualquer coisa fora das marcações ✏️: `class="…"`, `id="…"`, `data-…="…"` e as etiquetas `< >`.
- No `Code.gs`, qualquer coisa abaixo do bloco `CONFIG`.
- Arquivos `vercel.json`, `robots.txt` e `sitemap.xml` (só mudam se o endereço do site mudar).

## 9. Se algo der errado

**A página quebrou depois de uma edição:**
1. Na Vercel, abra o projeto e, no quadro **Production Deployment**, clique em **Instant Rollback** → escolha a publicação anterior → **Continue** → **Confirm Rollback**. A versão que funcionava volta ao ar em segundos. (No plano gratuito, só dá para voltar para a publicação imediatamente anterior.)
2. No GitHub, abra o arquivo editado → **History** para ver exatamente o que mudou e corrija com calma.
3. **Importante:** depois de um rollback, a Vercel **para de publicar sozinha**. Quando a correção estiver no GitHub, volte ao projeto na Vercel, clique em **Undo Rollback**, escolha a publicação mais nova (com a correção) e confirme. A partir daí, cada mudança volta a ser publicada automaticamente.

**A mudança não aparece:** aperte Ctrl+F5; confira na Vercel se a publicação está **Ready**; espere 2 minutos.

**A agenda mostra "Não conseguimos carregar os horários":** confira se a URL em `agenda.appsScriptUrl` termina em `/exec` e se a implantação do Apps Script continua ativa (script.google.com → projeto → Implantar → Gerenciar implantações).

**Horários aparecem errados (adiantados ou atrasados):** o fuso do Apps Script ou da agenda não está em São Paulo. Confira em Configurações do projeto (Apps Script) e nas configurações do Google Agenda.

**O link no WhatsApp mostra a imagem antiga:** é cache do WhatsApp; ele atualiza sozinho em alguns dias. Para testar na hora, envie o link com `?v=2` no final.

## 10. Como ler os resultados

Uma vez por mês, olhe três coisas:

1. **Quantos agendamentos e de onde vieram:** aba **Agendamentos** da planilha. A coluna `utm_source` mostra a origem (ex.: `instagram`, `google`); vazio = acesso direto ou busca orgânica.
2. **Onde as pessoas desistem** (com o GA4 configurado): os eventos `agenda_vista` → `dia_escolhido` → `horario_escolhido` → `formulario_iniciado` → `agendamento_confirmado` mostram em que passo o visitante parou.
3. **Quantos viraram paciente:** compare os agendamentos com as consultas que de fato aconteceram (coluna **status**).

Como interpretar:
- **Muitas visitas e poucos agendamentos** → o problema está na página (título, oferta, agenda). Vale testar outro título.
- **Muitos agendamentos e poucos comparecimentos** → o problema está depois da página (confirmação, lembrete, atendimento).
- **Poucas visitas** → o problema está nos anúncios ou no perfil do Google, não na página.

Para os links de anúncio, use sempre UTMs, por exemplo:
`https://raizodontologia.vercel.app/?utm_source=instagram&utm_medium=cpc&utm_campaign=avaliacao-novembro`
