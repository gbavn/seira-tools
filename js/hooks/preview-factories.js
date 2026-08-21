/* ── Preview Factories ───────────────────────────────────────────────────
   Fábrica de estado para o painel de pré-visualização (mostra/esconde o
   HTML renderizado de uma ficha antes de copiar o código para o fórum).

   Uso dentro de um Alpine.data:
     preview: makePreviewSlot(),
     ...
     get previewHtml() { return stRenderPokeCard(this); },
──────────────────────────────────────────────────────────────────────── */

/**
 * Cria um slot de preview com estado próprio (aberto/fechado).
 */
function makePreviewSlot() {
  return {
    open: false,
    toggle() { this.open = !this.open; },
  };
}
