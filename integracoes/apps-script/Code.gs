/**
 * ==========================================================================
 * Raiz Odontologia — Apps Script (agenda + formulário de contato)
 * --------------------------------------------------------------------------
 * Publicar como: Implantar > Nova implantação > App da Web
 *   • Executar como: Eu
 *   • Quem pode acessar: Qualquer pessoa
 * Depois de qualquer mudança no código: Implantar > Gerenciar implantações >
 * editar a implantação existente > Versão: "Nova versão" (só salvar não basta).
 *
 * Fuso do projeto: Configurações do projeto > Fuso horário = America/Sao_Paulo
 * (também definido em appsscript.json).
 *
 * Passo a passo completo: integracoes/apps-script/LEIA-ME.md
 * ==========================================================================
 */

/* ---------- CONFIGURAÇÃO (mantenha igual ao js/config.js do site) ---------- */
const CONFIG = {
  AGENDA_ID: '6298cb8efa282c31096eb88dc601487435fdddd2b18a9d7fca2f182bebfd47e7@group.calendar.google.com',
  PLANILHA_ID: '1V3u1WNe0BbDE-r7kBVs08mxn_q9FJOTDWZQsszn_NdU',
  EMAIL_CLINICA: 'odevjp@gmail.com',
  NOME_CLINICA: 'Raiz Odontologia',
  ENDERECO: 'Água Verde, Curitiba - PR',
  TIPO_CONSULTA: 'Consulta de avaliação',
  DURACAO_MIN: 40,
  INTERVALO_MIN: 10,
  ANTECEDENCIA_MIN_HORAS: 2,
  JANELA_DIAS: 30,
  // 0 = domingo … 6 = sábado
  EXPEDIENTE: {
    1: ['08:00', '19:00'], 2: ['08:00', '19:00'], 3: ['08:00', '19:00'],
    4: ['08:00', '19:00'], 5: ['08:00', '19:00'], 6: ['08:00', '12:00'],
  },
  PAUSA: ['12:00', '13:00'],
  FUSO: 'America/Sao_Paulo',
  OFFSET: '-03:00',
  // Portfólio: limite de agendamentos pelo site por dia e marcação para limpeza semanal
  MODO_DEMO: true,
  LIMITE_DEMO_POR_DIA: 15,
  MARCA_SITE: '[agendado-pelo-site]',
  // Proteção contra abuso (vale também fora do modo demo)
  INTERVALO_MESMO_WHATSAPP_S: 60,   // o mesmo WhatsApp só envia de novo depois de 1 minuto
  MAX_ENVIOS_POR_HORA: 40,          // teto geral de agendamentos + contatos por hora
};

/* ---------- Proteção contra envios em série ----------
   Usa o cache do Apps Script (some sozinho depois do prazo). */
function enviouAgoraHaPouco_(whatsapp) {
  return !!CacheService.getScriptCache().get('zap-' + whatsapp);
}
/* Só marca depois de um envio bem-sucedido (quem pegou "horário ocupado" pode tentar outro na hora) */
function marcarEnvio_(whatsapp) {
  CacheService.getScriptCache().put('zap-' + whatsapp, '1', CONFIG.INTERVALO_MESMO_WHATSAPP_S);
}
function acimaDoTetoPorHora_() {
  const cache = CacheService.getScriptCache();
  const chave = 'hora-' + Utilities.formatDate(new Date(), CONFIG.FUSO, 'yyyyMMddHH');
  const total = Number(cache.get(chave) || 0) + 1;
  cache.put(chave, String(total), 3600);
  return total > CONFIG.MAX_ENVIOS_POR_HORA;
}

/* Eventos criados pelo site (marcação no fim da descrição) */
function doSite_(eventos) {
  return eventos.filter(function (ev) { return (ev.getDescription() || '').indexOf(CONFIG.MARCA_SITE) !== -1; });
}

/* Abre a agenda configurada; se o ID estiver errado, o erro já diz o que conferir */
function agenda_() {
  const agenda = CalendarApp.getCalendarById(CONFIG.AGENDA_ID);
  if (!agenda) throw new Error('Agenda não encontrada. Confira o AGENDA_ID e se o script roda na conta dona da agenda.');
  return agenda;
}

/* ---------- Respostas JSON ---------- */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Datas ---------- */
function hojeISO_() {
  return Utilities.formatDate(new Date(), CONFIG.FUSO, 'yyyy-MM-dd');
}
function paraData_(dia, hora) {
  return new Date(dia + 'T' + hora + ':00' + CONFIG.OFFSET);
}
function somarDias_(dia, n) {
  const d = paraData_(dia, '12:00');
  d.setDate(d.getDate() + n);
  return Utilities.formatDate(d, CONFIG.FUSO, 'yyyy-MM-dd');
}
function diaSemana_(dia) {
  return Number(Utilities.formatDate(paraData_(dia, '12:00'), CONFIG.FUSO, 'u')) % 7; // u: 1=seg … 7=dom
}
function minutos_(hhmm) { const p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
function hhmm_(min) { return ('0' + Math.floor(min / 60)).slice(-2) + ':' + ('0' + (min % 60)).slice(-2); }

/* Horários de início possíveis no expediente (mesma regra do utils.js do site) */
function horariosDoExpediente_(dia) {
  const faixa = CONFIG.EXPEDIENTE[diaSemana_(dia)];
  if (!faixa) return [];
  const inicio = minutos_(faixa[0]);
  const fim = minutos_(faixa[1]);
  const passo = CONFIG.DURACAO_MIN + CONFIG.INTERVALO_MIN;
  const pausa = CONFIG.PAUSA ? CONFIG.PAUSA.map(minutos_) : null;
  const lista = [];
  for (let t = inicio; t + CONFIG.DURACAO_MIN <= fim; t += passo) {
    if (pausa && t < pausa[1] && t + CONFIG.DURACAO_MIN > pausa[0]) { t = pausa[1] - passo; continue; }
    lista.push(hhmm_(t));
  }
  return lista;
}

/* Livre = não cruza nenhum evento da agenda (inclui eventos criados à mão pela recepção) */
function estaLivre_(inicio, fim, eventos) {
  return !eventos.some(function (ev) {
    if (ev.isAllDayEvent()) return true; // feriado/folga marcado como dia inteiro bloqueia o dia
    return ev.getStartTime() < fim && ev.getEndTime() > inicio;
  });
}

/* ---------- GET: horários livres ---------- */
function doGet(e) {
  const acao = (e && e.parameter && e.parameter.acao) || '';
  if (acao !== 'horarios') return json_({ ok: false, erro: 'acao' });
  try {
    return json_({ ok: true, dias: listarHorariosLivres_() });
  } catch (erro) {
    console.error(erro);
    return json_({ ok: false, erro: 'interno' });
  }
}

function listarHorariosLivres_() {
  const agenda = agenda_();
  const hoje = hojeISO_();
  const ultimo = somarDias_(hoje, CONFIG.JANELA_DIAS);
  const eventos = agenda.getEvents(paraData_(hoje, '00:00'), paraData_(ultimo, '23:59'));
  const limite = Date.now() + CONFIG.ANTECEDENCIA_MIN_HORAS * 3600 * 1000;
  const dias = [];

  for (let i = 0; i <= CONFIG.JANELA_DIAS; i++) {
    const dia = somarDias_(hoje, i);
    const base = horariosDoExpediente_(dia);
    if (!base.length) continue;
    // Todo evento que encosta neste dia, inclusive os que começaram antes (ex.: congresso de 2 dias marcado com hora)
    const inicioDia = paraData_(dia, '00:00');
    const fimDia = paraData_(somarDias_(dia, 1), '00:00');
    const doDia = eventos.filter(function (ev) {
      return ev.getStartTime() < fimDia && ev.getEndTime() > inicioDia;
    });
    const livres = base.filter(function (h) {
      const inicio = paraData_(dia, h);
      const fim = new Date(inicio.getTime() + CONFIG.DURACAO_MIN * 60000);
      return inicio.getTime() > limite && estaLivre_(inicio, fim, doDia);
    });
    dias.push({ data: dia, horarios: livres }); // só horários: nenhum dado de paciente sai daqui
  }
  return dias;
}

/* ---------- POST: agendar ou contato ---------- */
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.site) return json_({ ok: true }); // isca anti-robô preenchida: finge sucesso e descarta
  try {
    if (p.acao === 'agendar') return json_(agendar_(p));
    if (p.acao === 'contato') return json_(registrarContato_(p));
    return json_({ ok: false, erro: 'acao' });
  } catch (erro) {
    console.error(erro);
    return json_({ ok: false, erro: 'interno' });
  }
}

function validarPessoa_(p) {
  const nome = String(p.nome || '').trim();
  const whatsapp = String(p.whatsapp || '').replace(/\D/g, '');
  const email = String(p.email || '').trim();
  if (nome.split(/\s+/).length < 2 || nome.length > 80) return false;
  if (whatsapp.length !== 11 || whatsapp.charAt(2) !== '9') return false;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  if (p.consentimento !== 'sim') return false;
  return true;
}

function agendar_(p) {
  if (!validarPessoa_(p)) return { ok: false, erro: 'invalido' };
  const dia = String(p.data || '');
  const hora = String(p.hora || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || horariosDoExpediente_(dia).indexOf(hora) === -1) {
    return { ok: false, erro: 'invalido' };
  }
  const inicio = paraData_(dia, hora);
  const fim = new Date(inicio.getTime() + CONFIG.DURACAO_MIN * 60000);
  if (inicio.getTime() < Date.now() + CONFIG.ANTECEDENCIA_MIN_HORAS * 3600 * 1000) return { ok: false, erro: 'ocupado' };
  if (inicio > paraData_(somarDias_(hojeISO_(), CONFIG.JANELA_DIAS), '23:59')) return { ok: false, erro: 'invalido' };

  const zap = String(p.whatsapp).replace(/\D/g, '');
  if (acimaDoTetoPorHora_()) return { ok: false, erro: 'limite' };
  if (enviouAgoraHaPouco_(zap)) return { ok: false, erro: 'aguarde' };

  // Uma pessoa por vez: dois cliques no mesmo horário ao mesmo tempo → só um passa
  const trava = LockService.getScriptLock();
  if (!trava.tryLock(15000)) return { ok: false, erro: 'interno' };
  try {
    const agenda = agenda_();

    if (CONFIG.MODO_DEMO) {
      const hoje = hojeISO_();
      const criadosHoje = doSite_(agenda.getEvents(paraData_(hoje, '00:00'), paraData_(somarDias_(hoje, CONFIG.JANELA_DIAS + 1), '00:00')))
        .filter(function (ev) { return Utilities.formatDate(ev.getDateCreated(), CONFIG.FUSO, 'yyyy-MM-dd') === hoje; });
      if (criadosHoje.length >= CONFIG.LIMITE_DEMO_POR_DIA) return { ok: false, erro: 'limite' };
    }

    // Confere de novo: alguém pode ter marcado (ou a recepção bloqueou) no meio tempo
    const conflitos = agenda.getEvents(new Date(inicio.getTime() - 60000), new Date(fim.getTime() + 60000));
    if (!estaLivre_(inicio, fim, conflitos)) return { ok: false, erro: 'ocupado' };

    const nome = String(p.nome).trim();
    const descricao = [
      'Paciente: ' + nome,
      'WhatsApp: ' + p.whatsapp,
      'E-mail: ' + (p.email || '—'),
      'Primeira consulta: ' + (p.primeira_vez === 'sim' ? 'sim' : 'não'),
      'Origem: ' + (p.utm_source || 'direto') + ' / ' + (p.utm_campaign || '—'),
      '',
      CONFIG.MARCA_SITE,
    ].join('\n');
    agenda.createEvent(CONFIG.TIPO_CONSULTA + ' — ' + nome, inicio, fim, { description: descricao });

    registrarLinha_('Agendamentos', [
      new Date(), dia, hora, nome, p.whatsapp, p.email || '', p.primeira_vez || '',
      p.utm_source || '', p.utm_medium || '', p.utm_campaign || '', p.utm_content || '', p.utm_term || '',
      p.gclid || '', p.fbclid || '', p.pagina_entrada || '', p.dispositivo || '', 'confirmado',
    ]);
  } finally {
    trava.releaseLock();
  }

  marcarEnvio_(zap);
  avisarPorEmail_(p, dia, hora);
  return { ok: true };
}

function registrarContato_(p) {
  if (!validarPessoa_(p)) return { ok: false, erro: 'invalido' };
  if (acimaDoTetoPorHora_()) return { ok: false, erro: 'limite' };
  const zap = String(p.whatsapp).replace(/\D/g, '');
  if (enviouAgoraHaPouco_(zap)) return { ok: false, erro: 'aguarde' };
  const trava = LockService.getScriptLock();
  if (!trava.tryLock(15000)) return { ok: false, erro: 'interno' };
  try {
    registrarLinha_('Contatos', [
      new Date(), String(p.nome).trim(), p.whatsapp, p.email || '', p.assunto || '', String(p.mensagem || '').slice(0, 500),
      p.utm_source || '', p.utm_medium || '', p.utm_campaign || '', p.utm_content || '', p.utm_term || '',
      p.gclid || '', p.fbclid || '', p.pagina_entrada || '', p.dispositivo || '', 'novo',
    ]);
  } finally {
    trava.releaseLock();
  }
  marcarEnvio_(zap);
  try {
    MailApp.sendEmail({
      to: CONFIG.EMAIL_CLINICA,
      subject: 'Novo contato pelo site — ' + String(p.nome).trim(),
      body: 'Nome: ' + p.nome + '\nWhatsApp: ' + p.whatsapp + '\nE-mail: ' + (p.email || '—') +
        '\nAssunto: ' + (p.assunto || '—') + '\nMensagem: ' + (p.mensagem || '—') +
        '\n\nOrigem: ' + (p.utm_source || 'direto') + ' / ' + (p.utm_campaign || '—'),
    });
  } catch (erro) {
    console.error('E-mail não enviado', erro); // a linha já está na planilha: o contato não se perde
  }
  return { ok: true };
}

/* Valores que começam com = + - @ viram texto (evita fórmula maliciosa na planilha) */
function seguro_(valor) {
  if (valor instanceof Date) return valor;
  const t = String(valor == null ? '' : valor);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function registrarLinha_(aba, valores) {
  const planilha = SpreadsheetApp.openById(CONFIG.PLANILHA_ID);
  let folha = planilha.getSheetByName(aba);
  if (!folha) folha = criarAba_(planilha, aba);
  folha.appendRow(valores.map(seguro_));
}

function criarAba_(planilha, aba) {
  const folha = planilha.insertSheet(aba);
  const comum = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'página de entrada', 'dispositivo', 'status'];
  const cabecalho = aba === 'Agendamentos'
    ? ['Registrado em', 'Data da consulta', 'Hora', 'Nome', 'WhatsApp', 'E-mail', 'Primeira vez'].concat(comum)
    : ['Registrado em', 'Nome', 'WhatsApp', 'E-mail', 'Assunto', 'Mensagem'].concat(comum);
  folha.appendRow(cabecalho);
  folha.setFrozenRows(1);
  folha.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold');
  return folha;
}

function avisarPorEmail_(p, dia, hora) {
  const quando = Utilities.formatDate(paraData_(dia, hora), CONFIG.FUSO, "dd/MM/yyyy 'às' HH:mm");
  try {
    MailApp.sendEmail({
      to: CONFIG.EMAIL_CLINICA,
      subject: 'Nova avaliação pelo site — ' + quando,
      body: 'Paciente: ' + p.nome + '\nWhatsApp: ' + p.whatsapp + '\nE-mail: ' + (p.email || '—') +
        '\nPrimeira consulta: ' + (p.primeira_vez === 'sim' ? 'sim' : 'não') + '\nQuando: ' + quando,
    });
    if (p.email) {
      MailApp.sendEmail({
        to: p.email,
        subject: 'Consulta marcada — ' + CONFIG.NOME_CLINICA,
        body: 'Olá, ' + String(p.nome).split(' ')[0] + '!\n\nSua ' + CONFIG.TIPO_CONSULTA.toLowerCase() + ' está marcada para ' + quando +
          ', no ' + CONFIG.ENDERECO + '.\nChegue uns 10 minutos antes e traga seus exames, se tiver.\n\n' +
          'Precisa remarcar? É só responder pelo WhatsApp da clínica.\n\n' + CONFIG.NOME_CLINICA,
      });
    }
  } catch (erro) {
    console.error('E-mail não enviado', erro); // o agendamento continua válido
  }
}

/* ---------- Portfólio: limpeza semanal e instalação do gatilho ---------- */
function limparDemonstracao() {
  const agenda = agenda_();
  const inicio = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const fim = new Date(Date.now() + (CONFIG.JANELA_DIAS + 2) * 24 * 3600 * 1000);
  doSite_(agenda.getEvents(inicio, fim)).forEach(function (ev) { ev.deleteEvent(); });
}

/* Rode UMA vez pelo editor (Executar > instalarGatilhos) */
function instalarGatilhos() {
  ScriptApp.getProjectTriggers().forEach(function (g) {
    if (g.getHandlerFunction() === 'limparDemonstracao') ScriptApp.deleteTrigger(g);
  });
  ScriptApp.newTrigger('limparDemonstracao').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
}

/* Teste rápido pelo editor: deve listar os horários livres no registro de execução */
function testarHorarios() {
  console.log(JSON.stringify(listarHorariosLivres_().slice(0, 3)));
}
