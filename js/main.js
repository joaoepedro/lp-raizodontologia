/* ==========================================================================
   Comportamentos gerais da página
   Menu, aviso conceitual, valores do config.js no HTML, WhatsApp/telefone,
   botão flutuante, animações ao rolar, mapa sob demanda e cookies.
   ========================================================================== */

(function () {
  "use strict";

  const U = window.Utils;
  const demo = U.lerConfig("modoDemo");
  const rastrear = (nome, dados) => window.Rastreamento && window.Rastreamento.evento(nome, dados);

  U.capturarUtms();

  /* ---------- Valores do config.js no HTML (data-config="caminho") ----------
     O HTML já traz o valor escrito como reserva; aqui ele é atualizado. */
  function preencherConfig() {
    U.$$("[data-config]").forEach((elemento) => {
      const valor = U.lerConfig(elemento.dataset.config);
      if (typeof valor === "string" && valor.trim()) elemento.textContent = valor;
    });
    U.$$("[data-ano]").forEach((elemento) => { elemento.textContent = String(new Date().getFullYear()); });
    U.$$("[data-rede]").forEach((item) => {
      const url = U.lerConfig("redes." + item.dataset.rede);
      if (url) { item.hidden = false; item.querySelector("a").href = url; }
    });
  }

  /* ---------- Aviso de projeto conceitual ---------- */
  function ligarAviso() {
    const aviso = U.$("#aviso-conceitual");
    if (!aviso) return;
    if (!U.lerConfig("site.projetoConceitual")) { aviso.remove(); return; }
    U.$("[data-fechar-aviso]", aviso).addEventListener("click", () => {
      U.armazenamento.gravar("localStorage", "raiz-aviso-fechado", "1");
      document.documentElement.classList.add("aviso-fechado");
      U.$(".logo").focus();
    });
  }

  /* ---------- Menu do celular ---------- */
  function ligarMenu() {
    const botao = U.$("#menu-botao");
    const menu = U.$("#menu");
    const desktop = window.matchMedia("(min-width: 1200px)"); // mesmo ponto do CSS do menu

    function definir(aberto) {
      menu.classList.toggle("menu--aberto", aberto);
      botao.setAttribute("aria-expanded", String(aberto));
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    }

    botao.addEventListener("click", () => definir(botao.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) definir(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && botao.getAttribute("aria-expanded") === "true") { definir(false); botao.focus(); }
    });
    document.addEventListener("click", (e) => {
      if (botao.getAttribute("aria-expanded") === "true" && !e.target.closest(".topo")) definir(false);
    });
    desktop.addEventListener("change", () => definir(false));

    // Linha sob o topo depois de rolar
    const topo = U.$("#topo");
    const marcar = () => topo.classList.toggle("topo--rolou", window.scrollY > 8);
    window.addEventListener("scroll", marcar, { passive: true });
    marcar();
  }

  /* ---------- Diálogo do modo demonstração ---------- */
  function avisoDemo(tipo, mensagem) {
    const dialogo = U.$("#dialogo-demo");
    if (!dialogo || typeof dialogo.showModal !== "function") return;
    U.$("#dialogo-demo-texto").textContent = tipo === "telefone"
      ? "Os contatos da Raiz Odontologia são fictícios. Em um site real, este botão ligaria para a clínica."
      : "Os contatos da Raiz Odontologia são fictícios. Em um site real, este botão abriria a conversa no WhatsApp com a mensagem abaixo já escrita.";
    U.$("#dialogo-demo-mensagem").textContent = mensagem ? "“" + mensagem + "”" : "";
    dialogo.showModal();
  }

  /* ---------- WhatsApp, telefone e CTAs ---------- */
  function ligarContatos() {
    U.$$("[data-whatsapp]").forEach((link) => {
      const mensagem = () => link.dataset.mensagemPersonalizada || U.lerConfig("mensagensWhatsApp." + link.dataset.whatsapp) || "";
      link.href = U.linkWhatsApp(mensagem());
      if (!demo) { link.target = "_blank"; link.rel = "noopener"; }
      link.addEventListener("click", (e) => {
        rastrear("clique_whatsapp", { local: link.dataset.local || "pagina" });
        if (demo) { e.preventDefault(); avisoDemo("whatsapp", mensagem()); }
      });
    });

    U.$$("[data-telefone]").forEach((link) => {
      link.href = "tel:" + U.lerConfig("contato.telefone");
      link.addEventListener("click", (e) => {
        rastrear("clique_telefone", { local: link.dataset.local || "pagina" });
        if (demo) { e.preventDefault(); avisoDemo("telefone"); }
      });
    });

    U.$$("[data-evento]").forEach((link) => {
      link.addEventListener("click", () => rastrear(link.dataset.evento, { local: link.dataset.local || "pagina" }));
    });
  }

  /* ---------- Botão flutuante: aparece quando o topo da página sai da tela ---------- */
  function ligarFlutuante() {
    const botao = U.$(".whatsapp-flutuante");
    const hero = U.$(".hero");
    if (!botao || !hero || !("IntersectionObserver" in window)) { botao && botao.classList.add("whatsapp-flutuante--visivel"); return; }
    new IntersectionObserver(([item]) => {
      botao.classList.toggle("whatsapp-flutuante--visivel", !item.isIntersecting);
    }, { threshold: 0.05 }).observe(hero);
  }

  /* ---------- Animações ao rolar ----------
     Cada elemento sobe e aparece devagar quando entra na tela. Itens de uma mesma
     lista (tratamentos, diferenciais, etapas, equipe) entram em cascata: o atraso
     cresce 120 ms por item, até 4 itens por "onda". */
  function ligarRevelar() {
    const itens = U.$$(".revelar");
    document.documentElement.classList.add("revelar-ok"); // avisa a rede de segurança do <head> que as animações estão ativas
    if (!("IntersectionObserver" in window)) { itens.forEach((i) => i.classList.add("visivel")); return; }
    const observador = new IntersectionObserver((entradas) => {
      const chegando = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
      chegando.forEach((alvo, ordem) => {
        const irmaos = alvo.parentElement ? U.$$(":scope > .revelar", alvo.parentElement) : [];
        const posicao = irmaos.length > 1 ? Math.min(ordem, 3) : 0;
        alvo.style.setProperty("--atraso", posicao * 120 + "ms");
        alvo.classList.add("visivel");
        observador.unobserve(alvo);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    itens.forEach((i) => observador.observe(i));
  }

  /* ---------- Dúvidas: abre e fecha deslizando ----------
     Sem JavaScript, o <details> nativo continua funcionando (abre direto).
     Com JavaScript: só uma resposta aberta por vez, com a altura animada. */
  function ligarDuvidas() {
    const itens = U.$$(".faq__item");
    if (!itens.length) return;
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const DURACAO = 480;
    const CURVA = "cubic-bezier(0.22, 1, 0.36, 1)";

    itens.forEach((item) => {
      item.removeAttribute("name"); // a exclusividade passa a ser controlada aqui, com animação
      const resumo = item.querySelector("summary");
      const conteudo = document.createElement("div");
      conteudo.className = "faq__conteudo";
      while (resumo.nextSibling) conteudo.appendChild(resumo.nextSibling);
      item.appendChild(conteudo);
      item._animacao = null;

      resumo.addEventListener("click", (e) => {
        e.preventDefault();
        if (item.open && !item._fechando) fechar(item);
        else {
          itens.forEach((outro) => { if (outro !== item && outro.open) fechar(outro); });
          abrir(item);
        }
      });
    });

    function animar(item, de, para, aoTerminar) {
      const caixa = item.querySelector(".faq__conteudo");
      if (item._animacao) item._animacao.cancel();
      if (semMovimento.matches || !caixa.animate) { aoTerminar(); return; }
      item._animacao = caixa.animate(
        [{ height: de + "px", opacity: para > de ? 0 : 1 }, { height: para + "px", opacity: para > de ? 1 : 0 }],
        { duration: DURACAO, easing: CURVA }
      );
      item._animacao.onfinish = () => { item._animacao = null; aoTerminar(); };
    }

    function abrir(item) {
      const caixa = item.querySelector(".faq__conteudo");
      const atual = item.open ? caixa.offsetHeight : 0;
      item._fechando = false;
      item.open = true;
      animar(item, atual, caixa.scrollHeight, () => {});
    }

    function fechar(item) {
      const caixa = item.querySelector(".faq__conteudo");
      item._fechando = true;
      item.classList.add("faq__item--fechando");
      animar(item, caixa.offsetHeight, 0, () => {
        item.open = false;
        item._fechando = false;
        item.classList.remove("faq__item--fechando");
      });
    }
  }

  /* ---------- Mapa só quando pedido ---------- */
  function ligarMapa() {
    const botao = U.$("#ver-mapa");
    if (!botao) return;
    botao.addEventListener("click", () => {
      const caixa = U.$("#mapa");
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(U.lerConfig("contato.mapaBusca")) + "&output=embed";
      iframe.title = "Mapa do bairro " + U.lerConfig("contato.bairro") + ", " + U.lerConfig("contato.cidade");
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      caixa.innerHTML = "";
      caixa.classList.add("rodape__mapa--carregado");
      caixa.appendChild(iframe);
      iframe.focus();
      rastrear("mapa_aberto", { local: "rodape" });
    });
  }

  /* ---------- Cookies (LGPD) ---------- */
  function ligarCookies() {
    const banner = U.$("#cookies");
    const dialogo = U.$("#dialogo-cookies");
    if (!banner || !window.Rastreamento) return;

    function fecharBanner() {
      banner.hidden = true;
      document.body.classList.remove("cookies-aberto");
    }
    function salvar(escolha) { window.Rastreamento.salvarConsentimento(escolha); fecharBanner(); }

    if (!window.Rastreamento.temEscolha()) {
      banner.hidden = false;
      document.body.classList.add("cookies-aberto");
      document.body.style.setProperty("--altura-cookies", banner.offsetHeight + 8 + "px");
    }

    U.$$("[data-cookies]", banner).forEach((b) => b.addEventListener("click", () => {
      salvar(b.dataset.cookies === "aceitar" ? { medicao: true, anuncios: true } : { medicao: false, anuncios: false });
    }));

    U.$$("[data-abrir-cookies]").forEach((b) => b.addEventListener("click", () => {
      const atual = window.Rastreamento.escolhaAtual() || {};
      U.$("#cookie-medicao").checked = !!atual.medicao;
      U.$("#cookie-anuncios").checked = !!atual.anuncios;
      dialogo.returnValue = "";
      dialogo.showModal();
    }));

    dialogo.addEventListener("close", () => {
      if (dialogo.returnValue === "salvar") {
        salvar({ medicao: U.$("#cookie-medicao").checked, anuncios: U.$("#cookie-anuncios").checked });
      }
    });
  }

  function iniciar() {
    preencherConfig();
    ligarAviso();
    ligarMenu();
    ligarContatos();
    ligarFlutuante();
    ligarRevelar();
    ligarDuvidas();
    ligarMapa();
    ligarCookies();
  }

  if (document.readyState === "complete") iniciar();
  else document.addEventListener("DOMContentLoaded", iniciar);
})();
