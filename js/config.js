/* ==========================================================================
   PAINEL DE CONTROLE — Raiz Odontologia
   --------------------------------------------------------------------------
   Tudo o que muda com frequência fica AQUI: contatos, horários da agenda,
   links e IDs de rastreamento. Os outros scripts só LEEM estes valores.

   Como editar: troque só o que está entre aspas (ou o número) e salve.
   Não apague vírgulas, chaves { } nem colchetes [ ].
   ========================================================================== */

(function () {
  "use strict";

  const CONFIG = {
    /* ---------- Site ---------- */
    site: {
      nome: "Raiz Odontologia",
      url: "https://raiz-odontologia.vercel.app", // endereço final (sem barra no fim)
      projetoConceitual: true,                     // mostra a faixa de "projeto conceitual"
      autorPortfolio: "João Pedro Morais",
    },

    /* Modo demonstração: com true, WhatsApp/telefone mostram um aviso em vez
       de abrir conversa (os contatos são fictícios) e a agenda funciona com
       horários simulados se o Apps Script ainda não estiver configurado. */
    modoDemo: true,

    /* ---------- Contatos ---------- */
    contato: {
      whatsapp: "5541900000000",            // 55 + DDD + número, só dígitos
      whatsappExibicao: "(41) 90000-0000",
      telefone: "+554130000000",            // formato internacional para o link tel:
      telefoneExibicao: "(41) 3000-0000",
      email: "contato@raizodontologia.com.br",
      bairro: "Água Verde",
      cidade: "Curitiba",
      uf: "PR",
      horarioTexto: "Seg. a sex. 8h–19h · Sáb. 8h–12h",
      mapaBusca: "Água Verde, Curitiba - PR", // o que o Google Maps procura
    },

    /* ---------- Responsável técnica (CFO) ---------- */
    responsavelTecnica: {
      nome: "Dra. Helena Kowalski",
      cro: "CRO-PR 21.437",
      inscricaoClinica: "CRO-PR EPAO 3.582",
    },

    /* ---------- Mensagens prontas do WhatsApp ---------- */
    mensagensWhatsApp: {
      geral: "Olá! Vim pelo site e gostaria de agendar uma consulta de avaliação na Raiz Odontologia.",
      agenda: "Olá! Vim pelo site e prefiro agendar minha avaliação por aqui. Que horários vocês têm?",
      duvida: "Olá! Vim pelo site e tenho uma dúvida antes de agendar.",
      posAgendamento: "Olá! Acabei de agendar pelo site para {dia} às {hora}. Gostaria de confirmar.",
    },

    /* ---------- Agenda (ligada ao Google Agenda pelo Apps Script) ----------
       IMPORTANTE: os mesmos horários precisam estar no Apps Script
       (integracoes/apps-script/Code.gs). O servidor é quem decide de verdade. */
    agenda: {
      appsScriptUrl: "https://script.google.com/macros/s/AKfycbxyvsI5h6IJodnRz_UL6AURwuBtS7f1bXYeoVNmjc_rzHonJ3v8s7ZuKPE2IVNWuywx/exec", // URL do App da Web (termina em /exec). Vazio = horários simulados
      tipoConsulta: "Consulta de avaliação",
      duracaoMin: 40,
      intervaloMin: 10,
      antecedenciaMinHoras: 2,    // não mostra horários que começam em menos de 2 h
      janelaDias: 30,             // até quantos dias à frente dá para marcar
      // 0 = domingo … 6 = sábado. [início, fim] no fuso de Brasília.
      expediente: {
        1: ["08:00", "19:00"],
        2: ["08:00", "19:00"],
        3: ["08:00", "19:00"],
        4: ["08:00", "19:00"],
        5: ["08:00", "19:00"],
        6: ["08:00", "12:00"],
      },
      pausa: ["12:00", "13:00"],  // almoço (dias úteis)
      fusoHorario: "-03:00",
    },

    /* ---------- Formulário de contato ---------- */
    formulario: {
      appsScriptUrl: "https://script.google.com/macros/s/AKfycbxyvsI5h6IJodnRz_UL6AURwuBtS7f1bXYeoVNmjc_rzHonJ3v8s7ZuKPE2IVNWuywx/exec", // pode ser a mesma URL da agenda
      paginaObrigado: "obrigado.html",
    },

    /* ---------- Rastreamento (deixe vazio o que não usar) ----------
       Sem ID, os eventos aparecem só no console do navegador (F12). */
    rastreamento: {
      gtmId: "",                  // GTM-XXXXXXX (se usar, configure GA4 e Ads dentro do GTM)
      ga4Id: "",                  // G-XXXXXXXXXX (usado só se não houver GTM)
      googleAdsId: "",            // AW-XXXXXXXXX
      googleAdsRotuloAgendamento: "", // rótulo da conversão "agendamento"
      googleAdsRotuloLead: "",        // rótulo da conversão "formulário"
      metaPixelId: "",            // apenas números
      clarityId: "",              // Microsoft Clarity
    },

    /* ---------- Redes sociais (vazio = esconde o link) ---------- */
    redes: {
      instagram: "",
      facebook: "",
    },
  };

  /* Congela o objeto inteiro para nenhum outro script alterar os valores. */
  function congelar(obj) {
    Object.values(obj).forEach(function (v) {
      if (v && typeof v === "object") congelar(v);
    });
    return Object.freeze(obj);
  }

  window.CONFIG = congelar(CONFIG);
})();
