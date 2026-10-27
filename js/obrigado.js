/* Página de obrigado: cumprimenta pelo nome e dispara o Lead UMA vez por envio.
   Se a pessoa recarregar a página, o evento não se repete (marcação no sessionStorage). */
(function () {
  "use strict";
  const U = window.Utils;
  let lead = null;
  try { lead = JSON.parse(U.armazenamento.ler("sessionStorage", "raiz-lead") || "null"); } catch (e) { lead = null; }

  if (lead && lead.nome) {
    document.getElementById("obrigado-nome").textContent = ", " + lead.nome;
  }
  if (lead && lead.pendente) {
    window.Rastreamento && window.Rastreamento.evento("generate_lead", { local: "contato" });
    lead.pendente = false;
    U.armazenamento.gravar("sessionStorage", "raiz-lead", JSON.stringify(lead));
  }
})();
