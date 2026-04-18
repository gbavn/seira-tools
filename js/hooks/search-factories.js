/* ── Search Factories ────────────────────────────────────────────────────
   Funções fábrica que criam objetos de estado para buscas autocomplete.
   São usadas como sub-estado dentro de Alpine.data de ferramentas,
   evitando duplicar a mesma lógica em calcBatalha, genPokemon, etc.

   Uso dentro de um Alpine.data:
     enemySlot: makePokemonSearchSlot(),
     ...
     onEnemyInput() { this.enemySlot.search(query, gen); },
     selectEnemy(p) { this.enemySlot.select(p); }

   Depende de: stFormatName (utils/format.js)
──────────────────────────────────────────────────────────────────────── */

/**
 * Cria um slot de busca de Pokémon com estado próprio.
 * @param {{ maxResults?: number }} opts
 */
function makePokemonSearchSlot(opts = {}) {
  const max = opts.maxResults ?? 8;
  return {
    query:     '',
    selected:  null,
    forms:     [],
    formSelected: null,
    suggestions: [],
    showList:  false,

    search(gen) {
      if (!this.query || !gen) { this.showList = false; return; }
      const api = Alpine.store('api');
      if (!api.ready) return;
      const q = this.query.toLowerCase();
      this.suggestions = api.pokemonByGen(gen)
        .filter(p => p.name.toLowerCase().includes(q))
        .slice(0, max);
      this.showList = this.suggestions.length > 0;
    },

    select(p) {
      this.selected   = p;
      this.query      = stFormatName(p.name);
      this.showList   = false;
      this.formSelected = null;
      this.forms = Alpine.store('api').formsOf(p.id).filter(f => f.form_type !== 'gender');
    },

    clear() {
      this.query = ''; this.selected = null; this.forms = [];
      this.formSelected = null; this.suggestions = []; this.showList = false;
    },

    get artwork() {
      return this.formSelected?.artwork ?? this.selected?.artwork ?? '';
    },
  };
}

/**
 * Cria um slot de busca de Item com estado próprio.
 * @param {{ allowedCategories?: string[]|null, maxResults?: number }} opts
 */
function makeItemSearchSlot(opts = {}) {
  const max     = opts.maxResults ?? 10;
  const allowed = opts.allowedCategories ?? null;
  return {
    query:       '',
    selected:    null,
    suggestions: [],
    showList:    false,
    qty:         1,
    showSkins:   false,
    skin:        null,

    search() {
      if (this.query.length < 2) { this.showList = false; return; }
      const api = Alpine.store('api');
      if (!api.ready) return;
      const q = this.query.toLowerCase();
      this.suggestions = api.items
        .filter(item => {
          if (allowed) {
            const mapped = ST_CATEGORY_MAP[item.category];
            if (!allowed.includes(item.category) && !allowed.includes(mapped)) return false;
          }
          return item.name.toLowerCase().includes(q);
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, max);
      this.showList = this.suggestions.length > 0;
    },

    select(item) {
      this.selected  = item;
      this.query     = item.name;
      this.showList  = false;
      this.qty       = 1;
      this.showSkins = item.name === 'Rotom Phone';
      this.skin      = null;
    },

    clear() {
      this.query = ''; this.selected = null; this.suggestions = [];
      this.showList = false; this.qty = 1; this.showSkins = false; this.skin = null;
    },

    get sprite() {
      if (this.showSkins && this.skin) return this.skin.imagem;
      return this.selected?.sprite ?? '';
    },

    get isUnique() { return this.selected?.is_unique ?? false; },
  };
}

/**
 * Cria um slot de busca de Move com estado próprio.
 * @param {{ maxResults?: number }} opts
 */
function makeMoveSearchSlot(opts = {}) {
  const max = opts.maxResults ?? 10;
  return {
    query:       '',
    selected:    null,
    suggestions: [],
    showList:    false,
    tag:         'normal', // 'normal' | 'tm' | 'em'

    search() {
      if (this.query.length < 1) { this.showList = false; return; }
      const api = Alpine.store('api');
      if (!api.ready) return;
      const q = this.query.toLowerCase();
      this.suggestions = api.moves
        .filter(m => m.name.toLowerCase().includes(q))
        .slice(0, max);
      this.showList = this.suggestions.length > 0;
    },

    select(m) {
      this.selected = m;
      this.query    = stFormatName(m.name);
      this.showList = false;
    },

    clear() {
      this.query = ''; this.selected = null;
      this.suggestions = []; this.showList = false; this.tag = 'normal';
    },
  };
}
