# Configurar a agenda e o formulário (Google Apps Script)

Tempo estimado: 15 minutos. Você precisa de uma conta Google.

## 1. Criar a agenda de teste

1. Abra o [Google Agenda](https://calendar.google.com) > **Outras agendas** > **+** > **Criar nova agenda**.
2. Nome: `Raiz Odontologia (demonstração)`. Fuso horário: **(GMT-03:00) Horário de Brasília**.
3. Em **Configurações da agenda** > **Integrar agenda**, copie o **ID da agenda** (termina em `@group.calendar.google.com`).

> Em um cliente real, use a agenda oficial da clínica (a única agenda da recepção), nunca uma agenda paralela.

## 2. Criar a planilha

1. Crie uma planilha nova no [Google Planilhas](https://sheets.google.com) chamada `Raiz — Agendamentos e contatos`.
2. Copie o ID da planilha: é o trecho da URL entre `/d/` e `/edit`.
3. As abas **Agendamentos** e **Contatos** são criadas sozinhas no primeiro registro.

## 3. Criar o Apps Script

1. Acesse [script.google.com](https://script.google.com) > **Novo projeto**. Nome: `Raiz — agenda`.
2. Apague o conteúdo de `Código.gs` e cole todo o `Code.gs` desta pasta.
3. Em **Configurações do projeto** (engrenagem):
   - **Fuso horário:** `(GMT-03:00) São Paulo`;
   - marque **Mostrar arquivo de manifesto "appsscript.json"** e cole o conteúdo do `appsscript.json` desta pasta.
4. No topo do `Code.gs`, preencha `AGENDA_ID`, `PLANILHA_ID` e `EMAIL_CLINICA`.
5. Selecione a função `testarHorarios` e clique em **Executar**. Autorize o acesso (Agenda, Planilhas, e-mail). O registro deve mostrar os próximos dias com horários.
6. Selecione `instalarGatilhos` e clique em **Executar** (cria a limpeza semanal da demonstração, toda segunda às 3h).

## 4. Publicar como App da Web

1. **Implantar** > **Nova implantação** > tipo **App da Web**.
2. **Executar como:** Eu. **Quem pode acessar:** Qualquer pessoa.
3. Copie a **URL do App da Web** (termina em `/exec`).
4. No site, abra `js/config.js` e cole a URL em `agenda.appsScriptUrl` **e** em `formulario.appsScriptUrl`.

## 5. Testar

- Abra o site, escolha um dia e um horário e confirme. O evento deve aparecer no Google Agenda, a linha na aba **Agendamentos** e o e-mail chegar.
- Recarregue a página: o horário marcado não aparece mais.
- Crie um evento à mão na agenda (ex.: "Almoço da equipe") num horário livre: ele some da página.
- Abra a página em duas abas, escolha o mesmo horário nas duas e confirme quase juntas: só uma passa; a outra recebe o aviso de horário ocupado.
- Envie o formulário de contato com um link de teste `?utm_source=teste&utm_campaign=lancamento`: a linha na aba **Contatos** deve ter as UTMs.

## Proteções já incluídas

- **Mesmo WhatsApp em menos de 1 minuto:** o segundo envio recebe "aguarde" (evita cliques duplos e envios em série). Só conta depois de um envio que deu certo: quem recebeu "horário ocupado" pode escolher outro na hora.
- **Teto por hora:** no máximo 40 agendamentos + contatos por hora (`MAX_ENVIOS_POR_HORA`), para ninguém usar o formulário para disparar e-mails em massa.
- **Modo demo:** no máximo 15 agendamentos pelo site por dia (`LIMITE_DEMO_POR_DIA`) e limpeza semanal só dos eventos com a marcação `[agendado-pelo-site]`.
- **Isca anti-robô**, validação de todos os campos no servidor e valores que começam com `= + - @` gravados como texto na planilha.

## Cuidados

- **Mudou o código?** Salvar não basta: **Implantar** > **Gerenciar implantações** > lápis > **Versão: Nova versão** > **Implantar**. A URL continua a mesma.
- **Horários errados?** Confira o fuso do projeto (passo 3) e o da agenda (passo 1).
- **Mudou horários de atendimento?** Altere em dois lugares: `EXPEDIENTE` no `Code.gs` e `agenda.expediente` no `js/config.js`.
- **Privacidade:** o `doGet` devolve só horários livres. Nomes e telefones ficam apenas na agenda e na planilha, que não devem ser compartilhadas publicamente.
