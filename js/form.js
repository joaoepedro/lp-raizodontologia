/* ==========================================================================
   Formulários: validação compartilhada (agenda e contato) e envio do contato
   --------------------------------------------------------------------------
   • Mensagens de erro ficam no HTML (data-erro-vazio, data-erro-curto…),
     então dá para editar o texto sem mexer aqui.
   • O erro some só quando a pessoa digita (evento "input"), nunca ao sair
     do campo: isso evita o layout pular e o toque errar o próximo campo.
   ========================================================================== */

(function () {
  "use strict";

  const U = window.Utils;

  function mostrarErro(campo, codigo) {
    const idErro = (campo.getAttribute("aria-describedby") || "").split(" ").find((id) => id.endsWith("-erro"));
    const alvo = idErro && document.getElementById(idErro);
    if (!alvo) return;
    if (codigo) {
      alvo.textContent = alvo.dataset["erro" + codigo.charAt(0).toUpperCase() + codigo.slice(1)] || "Confira este campo.";
      campo.setAttribute("aria-invalid", "true");
    } else {
      alvo.textContent = "";
      campo.removeAttribute("aria-invalid");
    }
  }

  function codigoDoCampo(campo) {
    switch (campo.name) {
      case "nome": return U.validar.nome(campo.value);
      case "whatsapp": return U.validar.whatsapp(campo.value);
      case "email": return U.validar.email(campo.value);
      case "assunto": return campo.value ? "" : "vazio";
      case "consentimento": return campo.checked ? "" : "vazio";
      default: return "";
    }
  }

  /* Valida o formulário inteiro; foca o primeiro campo com erro. */
  function validar(form) {
    let primeiro = null;
    ["nome", "whatsapp", "email", "assunto", "consentimento"].forEach((nome) => {
      const campo = form.elements[nome];
      if (!campo) return;
      const codigo = codigoDoCampo(campo);
      mostrarErro(campo, codigo);
      if (codigo && !primeiro) primeiro = campo;
    });
    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  function ligarCampos(form) {
    const tel = form.elements.whatsapp;
    if (tel) {
      tel.addEventListener("input", () => {
        const fim = tel.selectionStart === tel.value.length;
        tel.value = U.mascaraTelefone(tel.value);
        if (fim) tel.setSelectionRange(tel.value.length, tel.value.length);
      });
    }
    // Limpa o erro só enquanto a pessoa corrige
    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true" && !codigoDoCampo(e.target)) mostrarErro(e.target, "");
    });
    form.addEventListener("change", (e) => {
      if ((e.target.type === "checkbox" || e.target.tagName === "SELECT") && !codigoDoCampo(e.target)) mostrarErro(e.target, "");
    });
  }

  window.Formularios = Object.freeze({ validar, ligarCampos });

  /* ---------- Formulário de contato ---------- */
  function iniciarContato() {
    const form = U.$("#form-contato");
    if (!form) return;
    const erroGeral = U.$("#contato-erro");
    const botao = form.querySelector('button[type="submit"]');
    const textoBotao = botao.textContent;
    const url = U.lerConfig("formulario.appsScriptUrl");

    ligarCampos(form);
    form.addEventListener("focusin", () => {
      window.Rastreamento && window.Rastreamento.evento("formulario_iniciado", { local: "contato" });
    }, { once: true });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      erroGeral.textContent = "";
      if (!validar(form)) return;
      if (form.elements.site.value) return; // isca anti-robô

      const dados = Object.assign({
        acao: "contato",
        nome: form.elements.nome.value.trim(),
        whatsapp: U.soDigitos(form.elements.whatsapp.value),
        email: form.elements.email.value.trim(),
        assunto: form.elements.assunto.value,
        mensagem: form.elements.mensagem.value.trim().slice(0, 500),
        consentimento: "sim",
      }, U.obterUtms());

      botao.disabled = true;
      botao.textContent = "Enviando…";

      const envio = url
        ? U.buscarJson(url, { method: "POST", body: new URLSearchParams(dados) })
        : new Promise((ok) => window.setTimeout(() => ok({ ok: true, demo: true }), 700));

      envio
        .then((resp) => {
          if (resp && resp.erro === "aguarde") {
            erroGeral.textContent = "Recebemos uma mensagem com este WhatsApp agora há pouco. Aguarde um minuto e tente de novo.";
            botao.disabled = false;
            botao.textContent = textoBotao;
            return;
          }
          if (!resp || !resp.ok) throw new Error((resp && resp.erro) || "falha");
          // O obrigado.html lê isto para cumprimentar e disparar o Lead uma única vez
          U.armazenamento.gravar("sessionStorage", "raiz-lead", JSON.stringify({
            nome: dados.nome.split(/\s+/)[0], pendente: true,
          }));
          window.location.href = U.lerConfig("formulario.paginaObrigado");
        })
        .catch((erro) => {
          console.warn("[contato]", erro);
          erroGeral.textContent = "Não conseguimos enviar agora. Tente de novo ou fale pelo WhatsApp.";
          botao.disabled = false;
          botao.textContent = textoBotao;
        });
    });
  }

  if (document.readyState === "complete") iniciarContato();
  else document.addEventListener("DOMContentLoaded", iniciarContato);
})();
