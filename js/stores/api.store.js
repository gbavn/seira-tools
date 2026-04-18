/* ── Store: api ──────────────────────────────────────────────────────────
   Cache centralizado de todos os dados do RPG.

   Origem dos dados:
     items  → Supabase rpg.items
     moves  → Supabase rpg.moves
     config → Supabase rpg.config
     pokemon → JSON GitHub   (TODO: migrar para rpg.pokemon)
     perks   → JSON GitHub   (TODO: migrar para rpg.perks)

   Depende de: stDb (supabase.js), ST_API, ST_GEN_LIMITS,
               ST_HIDDEN_IDS (misc.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.store('api', {
    pokemon:  [],
    items:    [],
    moves:    [],
    perks:    [],
    hiddenIds: ST_HIDDEN_IDS,
    ready:    false,
    loading:  false,
    error:    null,

    async load() {
      if (this.ready || this.loading) return;
      this.loading = true;
      this.error   = null;

      try {
        const [pokRes, perksRes, itemsRes, movesRes, cfgRes] = await Promise.all([
          // JSON (ainda não migrado)
          fetch(ST_API.pokemon).then(r => r.json()),
          fetch(ST_API.perks).then(r => r.json()),
          // Supabase
          stDb.schema('rpg').from('items').select('*'),
          stDb.schema('rpg').from('moves').select('*'),
          stDb.schema('rpg').from('config').select('data').single(),
        ]);

        // Erros do Supabase vêm no campo .error
        if (itemsRes.error) throw new Error(`items: ${itemsRes.error.message}`);
        if (movesRes.error) throw new Error(`moves: ${movesRes.error.message}`);
        if (cfgRes.error)   throw new Error(`config: ${cfgRes.error.message}`);

        this.pokemon = pokRes;
        this.perks   = perksRes;
        this.items   = itemsRes.data;
        this.moves   = movesRes.data;

        // IDs ocultos extras vindos da config
        const extraHidden = cfgRes.data?.data?.hidden?.pokemon || [];
        this.hiddenIds = [...ST_HIDDEN_IDS, ...extraHidden];

        this.ready = true;
      } catch (e) {
        this.error = `Erro ao carregar dados: ${e.message}`;
        console.error('[st-api]', e);
      } finally {
        this.loading = false;
      }
    },

    /* ── Helpers de consulta ────────────────────────────────────────── */

    /**
     * Pokémon base (sem formas), excluindo IDs ocultos.
     * O campo `form_of` vem do JSON atual.
     * TODO: quando migrar para Supabase, usar `base_pokemon_id === null`.
     */
    pokemonBase() {
      return this.pokemon.filter(p => p.form_of == null && !this.hiddenIds.includes(p.id));
    },

    /** Pokémon base de uma geração específica. */
    pokemonByGen(gen) {
      const g = ST_GEN_LIMITS[gen];
      if (!g) return [];
      return this.pokemonBase().filter(p => p.id >= g.offset && p.id < g.offset + g.limit);
    },

    /** Formas de um Pokémon base pelo seu ID. */
    formsOf(baseId) {
      return this.pokemon.filter(p => p.form_of === baseId && !this.hiddenIds.includes(p.id));
    },

    /**
     * Retorna todas as perícias como array flat com campo `categoria`.
     * O JSON de perks tem formato { categoria: [...] }.
     * TODO: quando migrar para Supabase, já virá flat com campo `category`.
     */
    allPerks() {
      const result = [];
      Object.entries(this.perks).forEach(([cat, list]) => {
        list.forEach(p => result.push({ ...p, categoria: cat }));
      });
      return result;
    },
  });

});
