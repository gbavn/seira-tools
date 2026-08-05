/* ── Preview Factory ─────────────────────────────────────────────────────
   Estado compartilhado do painel de pré-visualização usado pelos
   geradores. Cada gerador é responsável por expor seu próprio `previewHtml`
   (getter que monta o HTML) — este hook só cuida do show/hide do painel,
   evitando duplicar esse controle em cada Alpine.data.

   Uso dentro de um Alpine.data:
     preview: makePreviewPanel(),
     get previewHtml() { ... },
   No HTML:
     <button @click="preview.toggle()">Pré-visualizar</button>
     <div x-show="preview.open" x-html="previewHtml"></div>
──────────────────────────────────────────────────────────────────────── */
function makePreviewPanel() {
  return {
    open: false,
    toggle() { this.open = !this.open; },
  };
}
