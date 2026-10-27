/* ==========================================================================
   Agenda própria ligada ao Google Agenda (via Google Apps Script)
   --------------------------------------------------------------------------
   Fluxo: 1) dia → 2) horário → 3) dados → confirmação.
   • Com agenda.appsScriptUrl preenchido no config.js:
       GET  ?acao=horarios          → { ok, dias: [{ data, horarios: ["08:00", …] }] }
       POST acao=agendar + dados    → { ok: true } ou { ok: false, erro: "ocupado" | "limite" | "invalido" }
     O servidor só devolve horários LIVRES (nunca nomes ou dados de pacientes)
     e confere de novo o horário antes de criar o evento.
   • Sem URL (prévia do portfólio): os horários são simulados no navegador.
   ========================================================================== */

(function () {
  "use strict";

  const U = window.Utils;
  const AG = U.lerConfig("agenda");
  const URL_API = AG.appsScriptUrl;
  const CHAVE_DEMO = "raiz-demo-reservas";

  const raiz = U.$("#agenda");
  if (!raiz) return;

  const el = {
    secao: U.$("#agendar"),
    dias: U.$("#agenda-dias"),
    horas: U.$("#agenda-horas"),
    anteriores: U.$("#dias-anteriores"),
    proximos: U.$("#dias-proximos"),
    passoDados: U.$("#agenda-passo-dados"),
    rotuloDados: U.$("#rotulo-dados"),
    resumo: U.$("#agenda-resumo"),
    trocar: U.$("#trocar-horario"),
    form: U.$("#form-agenda"),
    botao: U.$("#agenda-confirmar"),
    erro: U.$("#agenda-erro"),
    confirmacao: U.$("#agenda-confirmacao"),
    confirmacaoTexto: U.$("#confirmacao-texto"),
    adicionar: U.$("#adicionar-agenda"),
    whatsappPos: U.$("#whatsapp-pos"),
    anuncio: U.$("#agenda-anuncio"),
    avisoDemo: U.$("#agenda-aviso-demo"),
  };

  const estado = {
    dias: [],            // [{ data: "2026-10-26", horarios: ["08:00", …] }]
    dia: null,
    hora: null,
    carregando: false,
    eventos: {},         // evita disparar o mesmo evento de funil duas vezes
  };

  /* ---------- Textos de data ---------- */
  const semCurta = (d) => U.formatarDia(d, { weekday: "short" }).replace(".", "");
  const semLonga = (d) => U.formatarDia(d, { weekday: "long" }).replace("-feira", "");
  const diaMes = (d) => U.formatarDia(d, { day: "2-digit", month: "2-digit" });
  const mesCurto = (d) => U.formatarDia(d, { month: "short" }).replace(".", "");
  const vagas = (n) => n + (n === 1 ? " horário livre" : " horários livres");
  const rotuloAcessivel = (d, n) =>
    U.formatarDia(d, { weekday: "long", day: "numeric", month: "long" }) + (n ? ", " + vagas(n) : ", sem horários");

  function anunciar(texto) {
    el.anuncio.textContent = "";
    window.setTimeout(() => { el.anuncio.textContent = texto; }, 50);
  }

  function rastrearUmaVez(nome, dados) {
    if (estado.eventos[nome]) return;
    estado.eventos[nome] = true;
    window.Rastreamento && window.Rastreamento.evento(nome, dados);
  }

  /* ---------- Modo demonstração (sem Apps Script) ---------- */
  function reservasDemo() {
    try { return JSON.parse(U.armazenamento.ler("localStorage", CHAVE_DEMO) || "[]"); } catch (e) { return []; }
  }

  function horariosDemo() {
    const hoje = U.hojeSP();
    const limite = Date.now() + AG.antecedenciaMinHoras * 3600 * 1000;
    const reservados = reservasDemo();
    const dias = [];
    for (let i = 0; i <= AG.janelaDias; i++) {
      const data = U.somarDias(hoje, i);
      const base = U.horariosDoExpediente(data);
      if (!base.length) continue; // domingo
      const livres = base.filter((h) =>
        U.paraData(data, h).getTime() > limite &&
        U.hash(data + h) > 0.38 &&                     // ~38% já ocupado, de forma estável
        !reservados.includes(data + " " + h));
      dias.push({ data, horarios: livres });
    }
    return Promise.resolve({ ok: true, dias });
  }

  function agendarDemo(dados) {
    return new Promise((resolver) => {
      window.setTimeout(() => {
        const chave = dados.data + " " + dados.hora;
        const reservados = reservasDemo();
        if (reservados.includes(chave)) return resolver({ ok: false, erro: "ocupado" });
        reservados.push(chave);
        U.armazenamento.gravar("localStorage", CHAVE_DEMO, JSON.stringify(reservados.slice(-30)));
        resolver({ ok: true });
      }, 900);
    });
  }

  /* ---------- Comunicação com o Apps Script ---------- */
  function buscarHorarios() {
    if (!URL_API) return horariosDemo();
    return U.buscarJson(URL_API + "?acao=horarios", { method: "GET" });
  }

  function enviarAgendamento(dados) {
    if (!URL_API) return agendarDemo(dados);
    // URLSearchParams = requisição "simples": sem preflight de CORS, e a resposta pode ser lida
    return U.buscarJson(URL_API, { method: "POST", body: new URLSearchParams(Object.assign({ acao: "agendar" }, dados)) });
  }

  /* ---------- Renderização ---------- */
  function mensagem(container, texto, comBotao) {
    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = "agenda__mensagem";
    p.textContent = texto;
    container.appendChild(p);
    if (comBotao) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "botao botao--secundario botao--compacto";
      b.textContent = "Tentar de novo";
      b.addEventListener("click", carregar);
      container.appendChild(b);
    }
  }

  function renderizarDias() {
    el.dias.innerHTML = "";
    estado.dias.forEach((d) => {
      const n = d.horarios.length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dia";
      b.dataset.data = d.data;
      b.disabled = n === 0;
      b.setAttribute("aria-pressed", String(estado.dia === d.data));
      // O nome acessível começa pelo texto visível (exigência WCAG 2.5.3) e completa com as vagas
      b.innerHTML =
        '<span class="dia__semana">' + semCurta(d.data) + "</span>" +
        '<span class="dia__numero">' + Number(d.data.slice(8)) + "</span>" +
        '<span class="dia__vagas">' + (n ? mesCurto(d.data) : "sem horários") + "</span>" +
        '<span class="visualmente-oculto">' + (n ? ", " + vagas(n) : "") + "</span>";
      b.title = rotuloAcessivel(d.data, n);
      b.addEventListener("click", () => escolherDia(d.data));
      el.dias.appendChild(b);
    });
    atualizarSetas();
  }

  function renderizarHoras() {
    const dia = estado.dias.find((d) => d.data === estado.dia);
    if (!dia) { mensagem(el.horas, "Escolha um dia para ver os horários livres."); return; }
    if (!dia.horarios.length) { mensagem(el.horas, "Esse dia já está completo. Que tal outro dia?"); return; }
    el.horas.innerHTML = "";
    dia.horarios.forEach((h) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hora";
      b.textContent = U.formatarHora(h);
      b.setAttribute("aria-pressed", String(estado.hora === h));
      b.addEventListener("click", () => escolherHora(h));
      el.horas.appendChild(b);
    });
  }

  function atualizarSetas() {
    const max = el.dias.scrollWidth - el.dias.clientWidth;
    el.anteriores.disabled = el.dias.scrollLeft <= 4;
    el.proximos.disabled = el.dias.scrollLeft >= max - 4;
  }

  /* ---------- Escolhas ---------- */
  function escolherDia(data) {
    estado.dia = data;
    estado.hora = null;
    U.$$(".dia", el.dias).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.data === data)));
    el.passoDados.hidden = true;
    renderizarHoras();
    const n = (estado.dias.find((d) => d.data === data) || { horarios: [] }).horarios.length;
    anunciar(U.formatarDia(data, { weekday: "long", day: "numeric", month: "long" }) + " selecionado. " + (n ? vagas(n) : "Sem horários") + ".");
    rastrearUmaVez("dia_escolhido", { local: "agenda" });
  }

  function escolherHora(hora) {
    estado.hora = hora;
    U.$$(".hora", el.horas).forEach((b) => b.setAttribute("aria-pressed", String(b.textContent === U.formatarHora(hora))));
    el.resumo.textContent = AG.tipoConsulta + " · " + semLonga(estado.dia) + ", " + diaMes(estado.dia) + " · " + U.formatarHora(hora);
    el.erro.textContent = "";
    el.passoDados.hidden = false;
    anunciar("Horário das " + U.formatarHora(hora) + " selecionado.");
    rastrearUmaVez("horario_escolhido", { local: "agenda" });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      el.passoDados.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }

  /* ---------- Carregamento ---------- */
  function carregar() {
    if (estado.carregando) return Promise.resolve();
    estado.carregando = true;
    raiz.dataset.estado = "carregando";
    mensagem(el.dias, "Buscando horários livres…");
    return buscarHorarios()
      .then((resp) => {
        if (!resp || !resp.ok || !Array.isArray(resp.dias)) throw new Error("resposta inválida");
        estado.dias = resp.dias;
        raiz.dataset.estado = "pronto";
        renderizarDias();
        if (estado.dia) renderizarHoras();
      })
      .catch((erro) => {
        console.warn("[agenda]", erro);
        raiz.dataset.estado = "erro";
        mensagem(el.dias, "Não conseguimos carregar os horários agora. Tente de novo ou agende pelo WhatsApp.", true);
      })
      .finally(() => { estado.carregando = false; });
  }

  /* ---------- Envio ---------- */
  function enviar(evento) {
    evento.preventDefault();
    el.erro.textContent = "";
    const F = window.Formularios;
    if (!F.validar(el.form)) return;
    if (el.form.elements.site.value) return; // isca anti-robô preenchida

    const dados = Object.assign({
      data: estado.dia,
      hora: estado.hora,
      nome: el.form.elements.nome.value.trim(),
      whatsapp: U.soDigitos(el.form.elements.whatsapp.value),
      email: el.form.elements.email.value.trim(),
      primeira_vez: el.form.elements.primeira_vez.value,
      consentimento: "sim",
    }, U.obterUtms());

    el.botao.disabled = true;
    el.botao.textContent = "Confirmando seu horário…";

    enviarAgendamento(dados)
      .then((resp) => {
        if (resp && resp.ok) return concluir(dados);
        if (resp && resp.erro === "ocupado") {
          el.passoDados.hidden = true;
          estado.hora = null;
          return carregar().then(() => {
            mensagem(el.horas, "");
            renderizarHoras();
            const aviso = document.createElement("p");
            aviso.className = "formulario__erro-geral agenda__aviso-ocupado";
            aviso.setAttribute("role", "alert");
            aviso.tabIndex = -1;
            aviso.textContent = "Poxa, alguém acabou de marcar esse horário. Atualizamos a lista: escolha outro, seus dados continuam aqui.";
            el.horas.prepend(aviso);
            aviso.focus(); // o botão de confirmar sumiu; o foco não pode se perder
          });
        }
        if (resp && resp.erro === "aguarde") {
          el.erro.textContent = "Recebemos um pedido com este WhatsApp agora há pouco. Aguarde um minuto e tente de novo.";
          return;
        }
        if (resp && resp.erro === "limite") {
          el.erro.textContent = U.lerConfig("modoDemo")
            ? "A agenda de demonstração atingiu o limite de hoje. Tente amanhã ou veja o fluxo pelo WhatsApp."
            : "Estamos recebendo muitos pedidos agora. Tente de novo em alguns minutos ou agende pelo WhatsApp.";
          return;
        }
        throw new Error((resp && resp.erro) || "falha");
      })
      .catch((erro) => {
        console.warn("[agenda]", erro);
        el.erro.textContent = "Não conseguimos confirmar agora. Tente de novo ou agende pelo WhatsApp.";
      })
      .finally(() => {
        el.botao.disabled = false;
        el.botao.textContent = "Confirmar minha consulta";
      });
  }

  function concluir(dados) {
    const preposicao = U.diaDaSemana(dados.data) === 6 ? "no" : "na";
    const quando = semLonga(dados.data) + ", " + diaMes(dados.data) + ", às " + U.formatarHora(dados.hora);
    el.confirmacaoTexto.innerHTML = "";
    el.confirmacaoTexto.append(
      "Te esperamos " + preposicao + " ",
      Object.assign(document.createElement("strong"), { textContent: quando }),
      ", no " + U.lerConfig("contato.bairro") + ". Você vai receber a confirmação pelo WhatsApp. Chegue uns 10 minutos antes e traga seus exames, se tiver."
    );
    const msg = U.lerConfig("mensagensWhatsApp.posAgendamento")
      .replace("{dia}", semLonga(dados.data) + ", " + diaMes(dados.data))
      .replace("{hora}", U.formatarHora(dados.hora));
    el.whatsappPos.dataset.mensagemPersonalizada = msg;
    el.whatsappPos.href = U.linkWhatsApp(msg);
    estado.ultimo = dados;

    raiz.dataset.estado = "concluido";
    el.confirmacao.hidden = false;
    el.confirmacao.focus();
    window.Rastreamento && window.Rastreamento.evento("agendamento_confirmado", { local: "agenda", primeira_vez: dados.primeira_vez });
  }

  /* Arquivo .ics: funciona no Google Agenda, Apple e Outlook */
  function baixarIcs() {
    const d = estado.ultimo;
    if (!d) return;
    const inicio = U.paraData(d.data, d.hora);
    const fim = new Date(inicio.getTime() + AG.duracaoMin * 60000);
    const fmt = (x) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const linhas = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Raiz Odontologia//Agenda//PT-BR", "BEGIN:VEVENT",
      "UID:" + fmt(inicio) + "-" + Math.random().toString(36).slice(2) + "@raizodontologia",
      "DTSTAMP:" + fmt(new Date()), "DTSTART:" + fmt(inicio), "DTEND:" + fmt(fim),
      "SUMMARY:" + AG.tipoConsulta + " — Raiz Odontologia",
      "LOCATION:" + U.lerConfig("contato.bairro") + "\\, " + U.lerConfig("contato.cidade") + " - " + U.lerConfig("contato.uf"),
      "DESCRIPTION:Chegue uns 10 minutos antes e traga seus exames\\, se tiver.",
      "END:VEVENT", "END:VCALENDAR",
    ];
    const blob = new Blob([linhas.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "consulta-raiz-odontologia.ics";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------- Ligações ---------- */
  function iniciar() {
    // Aviso só quando os horários são simulados (sem Apps Script). Com a agenda real ligada, não aparece nada.
    if (U.lerConfig("modoDemo") && !URL_API) {
      el.avisoDemo.hidden = false;
      el.avisoDemo.textContent = "Agenda de demonstração: nesta prévia os horários são simulados no seu navegador. Com o Apps Script configurado, eles vêm de um Google Agenda de teste.";
    }

    const passo = () => Math.max(el.dias.clientWidth * 0.8, 160);
    el.anteriores.addEventListener("click", () => el.dias.scrollBy({ left: -passo(), behavior: "smooth" }));
    el.proximos.addEventListener("click", () => el.dias.scrollBy({ left: passo(), behavior: "smooth" }));
    el.dias.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas, { passive: true });

    el.trocar.addEventListener("click", () => {
      el.passoDados.hidden = true;
      const ativo = U.$('.hora[aria-pressed="true"]', el.horas) || U.$(".hora", el.horas);
      if (ativo) ativo.focus();
    });
    el.form.addEventListener("submit", enviar);
    el.form.addEventListener("focusin", () => rastrearUmaVez("formulario_iniciado", { local: "agenda" }), { once: true });
    el.adicionar.addEventListener("click", baixarIcs);
    window.Formularios && window.Formularios.ligarCampos(el.form);

    // Só busca os horários quando a seção estiver chegando perto (economiza chamadas ao Apps Script)
    if ("IntersectionObserver" in window) {
      const perto = new IntersectionObserver((itens) => {
        if (itens.some((i) => i.isIntersecting)) { carregar(); perto.disconnect(); }
      }, { rootMargin: "900px 0px" });
      perto.observe(el.secao);
      const vista = new IntersectionObserver((itens) => {
        if (itens.some((i) => i.isIntersecting)) { rastrearUmaVez("agenda_vista", { local: "agenda" }); vista.disconnect(); }
      }, { threshold: 0.3 });
      vista.observe(raiz);
    } else {
      carregar();
    }
  }

  // DOMContentLoaded dispara depois de todos os scripts "defer" (form.js incluído)
  if (document.readyState === "complete") iniciar();
  else document.addEventListener("DOMContentLoaded", iniciar);
})();
