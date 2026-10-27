/* ==========================================================================
   Rastreamento: Google Tag Manager / GA4 / Google Ads, Meta Pixel e Clarity
   --------------------------------------------------------------------------
   • IDs ficam no config.js. Sem ID, o evento só aparece no console (F12).
   • LGPD: nada de medição ou anúncio carrega antes do consentimento.
     O Google recebe o "Consent Mode" negado por padrão; o Meta Pixel e o
     Clarity só carregam depois que a pessoa aceita.
   • Nenhum dado pessoal (nome, telefone, e-mail) é enviado a essas ferramentas.
   ========================================================================== */

(function () {
  "use strict";

  const { lerConfig, armazenamento } = window.Utils;
  const R = lerConfig("rastreamento");
  const CHAVE_CONSENTIMENTO = "raiz-cookies";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* Consent Mode v2: tudo negado até a escolha da pessoa */
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", wait_for_update: 500,
  });

  let consentimento = lerConsentimento();
  let carregados = { google: false, meta: false, clarity: false };

  function lerConsentimento() {
    try { return JSON.parse(armazenamento.ler("localStorage", CHAVE_CONSENTIMENTO) || "null"); } catch (e) { return null; }
  }

  function carregarScript(src) {
    const s = document.createElement("script");
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  /* ---------- Google (GTM ou gtag direto) ---------- */
  function carregarGoogle() {
    if (carregados.google) return;
    if (R.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      carregarScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(R.gtmId));
      carregados.google = true;
    } else if (R.ga4Id || R.googleAdsId) {
      carregarScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(R.ga4Id || R.googleAdsId));
      gtag("js", new Date());
      if (R.ga4Id) gtag("config", R.ga4Id);
      if (R.googleAdsId) gtag("config", R.googleAdsId);
      carregados.google = true;
    }
  }

  /* ---------- Meta Pixel (código base oficial do Gerenciador de Eventos) ---------- */
  function carregarMeta() {
    if (carregados.meta || !R.metaPixelId) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq("init", R.metaPixelId);
    window.fbq("track", "PageView");
    carregados.meta = true;
  }

  /* ---------- Microsoft Clarity ---------- */
  function carregarClarity() {
    if (carregados.clarity || !R.clarityId) return;
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",R.clarityId);
    carregados.clarity = true;
  }

  function aplicarConsentimento(escolha) {
    consentimento = escolha;
    if (!escolha) return;
    gtag("consent", "update", {
      analytics_storage: escolha.medicao ? "granted" : "denied",
      ad_storage: escolha.anuncios ? "granted" : "denied",
      ad_user_data: escolha.anuncios ? "granted" : "denied",
      ad_personalization: escolha.anuncios ? "granted" : "denied",
    });
    if (escolha.medicao || escolha.anuncios) carregarGoogle();
    if (escolha.anuncios) carregarMeta();
    if (escolha.medicao) carregarClarity();
  }

  function salvarConsentimento(escolha) {
    const registro = { medicao: !!escolha.medicao, anuncios: !!escolha.anuncios, data: new Date().toISOString() };
    armazenamento.gravar("localStorage", CHAVE_CONSENTIMENTO, JSON.stringify(registro));
    aplicarConsentimento(registro);
  }

  /* ---------- Eventos ---------- */
  const MAPA_META = {
    clique_whatsapp: "Contact",
    clique_telefone: "Contact",
    agendamento_confirmado: "Schedule",
    generate_lead: "Lead",
  };

  function idEvento() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function evento(nome, dados) {
    const parametros = Object.assign({}, dados || {});
    const eventId = idEvento(); // o mesmo ID deve ir para a API de Conversões, se usada

    const algumId = R.gtmId || R.ga4Id || R.googleAdsId || R.metaPixelId;
    if (!algumId || lerConfig("modoDemo")) {
      console.info("[rastreamento]", nome, parametros);
    }

    // GTM lê do dataLayer; o gtag direto envia para GA4
    window.dataLayer.push(Object.assign({ event: nome, event_id: eventId }, parametros));
    if (!R.gtmId && carregados.google && R.ga4Id) gtag("event", nome, parametros);

    // Conversões do Google Ads (sem GTM)
    if (!R.gtmId && carregados.google && R.googleAdsId) {
      if (nome === "agendamento_confirmado" && R.googleAdsRotuloAgendamento) {
        gtag("event", "conversion", { send_to: R.googleAdsId + "/" + R.googleAdsRotuloAgendamento, transaction_id: eventId });
      }
      if (nome === "generate_lead" && R.googleAdsRotuloLead) {
        gtag("event", "conversion", { send_to: R.googleAdsId + "/" + R.googleAdsRotuloLead, transaction_id: eventId });
      }
    }

    // Meta Pixel
    if (carregados.meta && window.fbq) {
      const padrao = MAPA_META[nome];
      if (padrao) window.fbq("track", padrao, { content_name: parametros.local || nome }, { eventID: eventId });
      else window.fbq("trackCustom", nome, parametros, { eventID: eventId });
    }
    return eventId;
  }

  aplicarConsentimento(consentimento);

  window.Rastreamento = Object.freeze({
    evento,
    salvarConsentimento,
    temEscolha: () => !!consentimento,
    escolhaAtual: () => consentimento,
  });
})();
