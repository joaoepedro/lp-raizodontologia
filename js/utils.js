/* ==========================================================================
   Utilitários compartilhados (sem dependências)
   Expostos em window.Utils para agenda.js, form.js, tracking.js e main.js.
   ========================================================================== */

(function () {
  "use strict";

  const FUSO = "America/Sao_Paulo";

  /* ---------- DOM ---------- */
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));

  /* Lê um valor do CONFIG por caminho: "contato.whatsappExibicao" */
  function lerConfig(caminho) {
    return caminho.split(".").reduce((obj, chave) => (obj == null ? undefined : obj[chave]), window.CONFIG);
  }

  /* ---------- Armazenamento à prova de falhas (modo privado, bloqueios) ---------- */
  const armazenamento = {
    ler(tipo, chave) {
      try { return window[tipo].getItem(chave); } catch (e) { return null; }
    },
    gravar(tipo, chave, valor) {
      try { window[tipo].setItem(chave, valor); } catch (e) { /* ignora */ }
    },
    remover(tipo, chave) {
      try { window[tipo].removeItem(chave); } catch (e) { /* ignora */ }
    },
  };

  /* ---------- Texto e validação ---------- */
  const soDigitos = (v) => String(v || "").replace(/\D/g, "");

  /* (41) 99999-1234 enquanto a pessoa digita */
  function mascaraTelefone(valor) {
    let d = soDigitos(valor);
    if (d.length > 11 && d.startsWith("55")) d = d.slice(2); // preenchimento automático com +55
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  const validar = {
    nome(v) {
      const t = String(v || "").trim();
      if (!t) return "vazio";
      if (t.split(/\s+/).length < 2 || t.length < 5) return "curto";
      return "";
    },
    whatsapp(v) {
      const d = soDigitos(v);
      if (!d) return "vazio";
      // celular brasileiro: DDD (2) + 9 + 8 dígitos
      if (d.length !== 11 || d[2] !== "9") return "invalido";
      return "";
    },
    email(v) {
      const t = String(v || "").trim();
      if (!t) return ""; // opcional
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t) ? "" : "invalido";
    },
  };

  /* ---------- WhatsApp ---------- */
  function linkWhatsApp(mensagem) {
    const numero = soDigitos(lerConfig("contato.whatsapp"));
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem || "");
  }

  /* ---------- UTMs e identificadores de clique ---------- */
  const CHAVES_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

  function capturarUtms() {
    const params = new URLSearchParams(window.location.search);
    const novas = {};
    CHAVES_UTM.forEach((k) => { if (params.get(k)) novas[k] = params.get(k).slice(0, 200); });
    if (Object.keys(novas).length) {
      armazenamento.gravar("sessionStorage", "raiz-utms", JSON.stringify(novas));
    }
    if (!armazenamento.ler("sessionStorage", "raiz-pagina-entrada")) {
      armazenamento.gravar("sessionStorage", "raiz-pagina-entrada", window.location.pathname + window.location.search);
    }
  }

  function obterUtms() {
    let utms = {};
    try { utms = JSON.parse(armazenamento.ler("sessionStorage", "raiz-utms") || "{}"); } catch (e) { utms = {}; }
    const saida = {};
    CHAVES_UTM.forEach((k) => { saida[k] = utms[k] || ""; });
    saida.pagina_entrada = armazenamento.ler("sessionStorage", "raiz-pagina-entrada") || "";
    saida.dispositivo = window.matchMedia("(max-width: 767px)").matches ? "celular" : "computador";
    return saida;
  }

  /* ---------- Datas no fuso de Brasília ----------
     A agenda trabalha com "YYYY-MM-DD" e "HH:MM" sempre no fuso da clínica,
     independentemente do fuso do aparelho do visitante. */
  function hojeSP() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());
  }

  function paraData(diaISO, hora) {
    return new Date(diaISO + "T" + (hora || "12:00") + ":00" + lerConfig("agenda.fusoHorario"));
  }

  function somarDias(diaISO, n) {
    const d = paraData(diaISO, "12:00");
    d.setUTCDate(d.getUTCDate() + n);
    return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(d);
  }

  function diaDaSemana(diaISO) {
    return paraData(diaISO, "12:00").getUTCDay(); // meio-dia em -03:00 = 15h UTC, mesmo dia
  }

  function formatarDia(diaISO, opcoes) {
    return new Intl.DateTimeFormat("pt-BR", Object.assign({ timeZone: FUSO }, opcoes)).format(paraData(diaISO, "12:00"));
  }

  /* "09:40" → "9h40" ; "10:00" → "10h" */
  function formatarHora(hhmm) {
    const [h, m] = hhmm.split(":");
    return Number(h) + "h" + (m === "00" ? "" : m);
  }

  const paraMinutos = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const deMinutos = (min) => String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");

  /* Lista de horários de início possíveis de um dia, segundo o expediente do config.js */
  function horariosDoExpediente(diaISO) {
    const ag = lerConfig("agenda");
    const faixa = ag.expediente[diaDaSemana(diaISO)];
    if (!faixa) return [];
    const inicio = paraMinutos(faixa[0]);
    const fim = paraMinutos(faixa[1]);
    const passo = ag.duracaoMin + ag.intervaloMin;
    const pausa = ag.pausa ? ag.pausa.map(paraMinutos) : null;
    const lista = [];
    for (let t = inicio; t + ag.duracaoMin <= fim; t += passo) {
      if (pausa && t < pausa[1] && t + ag.duracaoMin > pausa[0]) {
        t = pausa[1] - passo; // pula para o fim da pausa
        continue;
      }
      lista.push(deMinutos(t));
    }
    return lista;
  }

  /* fetch com limite de tempo: se o Apps Script não responder em 15 s, a página
     mostra a mensagem de erro (com o WhatsApp) em vez de ficar carregando para sempre. */
  function buscarJson(url, opcoes, ms) {
    const controle = "AbortController" in window ? new AbortController() : null;
    const relogio = controle ? window.setTimeout(() => controle.abort(), ms || 15000) : null;
    return fetch(url, Object.assign({}, opcoes, controle ? { signal: controle.signal } : {}))
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .finally(() => { if (relogio) window.clearTimeout(relogio); });
  }

  /* Número pseudoaleatório estável a partir de um texto (usado no modo demo) */
  function hash(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }

  window.Utils = Object.freeze({
    $, $$, lerConfig, armazenamento, soDigitos, mascaraTelefone, validar, linkWhatsApp,
    capturarUtms, obterUtms, hojeSP, paraData, somarDias, diaDaSemana, formatarDia, formatarHora,
    paraMinutos, horariosDoExpediente, hash, buscarJson,
  });
})();
