/* ── Tool Nav ────────────────────────────────────────────────────────────
   Gerencia qual ferramenta está ativa e a abertura dos submenus de nav.
   Depende de: Alpine.store('api') (stores/api.store.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('toolNav', () => ({
    active:    'calc-batalha',
    openGroup: null,

    select(id) {
      this.active    = id;
      this.openGroup = null;
      Alpine.store('api').load();
    },

    open(group)  { this.openGroup = group; },
    close(group) { if (this.openGroup === group) this.openGroup = null; },
    isOpen(group)  { return this.openGroup === group; },
    isActive(id)   { return this.active === id; },
    groupActive(ids) { return ids.includes(this.active); },
  }));

});
