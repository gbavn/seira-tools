/* ── Gerador de Pokémon ──────────────────────────────────────────────────
   Gera o código BBcode de ficha completa de um Pokémon.
   Depende de: makePokemonSearchSlot, makeMoveSearchSlot (hooks/search-factories.js),
               makePreviewSlot (hooks/preview-factories.js),
               stRenderPokeCard (utils/poke-card-render.js),
               stFormatName, stSlugifyBall (utils/format.js),
               stCopyText (utils/clipboard.js),
               ST_EXP_TABLE (constants/exp-tables.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('genPokemon', () => ({
    modo:        'normal', // 'normal' | 'starter' | 'ovo'
    gen:         '',
    species:     makePokemonSearchSlot({ maxResults: 8 }),
    genderOptions: [],
    gender:      '',
    abilityOptions: [],
    ability:     '',
    apelido:     '',
    pokeball:    '',
    nivel:       1,
    expAtual:    0,
    felicidade:  70,
    item:        'Nada',
    ot:          '',
    particularidades: '',
    stats:       { hp: 0, atq: 0, def: 0, atqesp: 0, defesp: 0, vel: 0 },
    concurso:    { cool: 0, beautiful: 0, cute: 0, clever: 0, tough: 0 },
    moves:       Array.from({ length: 6 }, () => makeMoveSearchSlot()),
    pokeballs:   [],
    preview:     makePreviewSlot(),
    code:        '',
    copied:      false,
    _t:          null,

    init() {
      Alpine.store('api').load().then(() => {
        this.pokeballs = Alpine.store('api').items.filter(i => i.category === 'pokeball');
        const pb = this.pokeballs.find(b => /poké\s*ball/i.test(b.name));
        if (pb) this.pokeball = pb.id;
      });
      document.addEventListener('click', e => {
        if (!this.$el.contains(e.target)) {
          this.species.showList = false;
          this.moves.forEach(m => m.showList = false);
        }
      });
    },

    setModo(m) {
      this.modo = m;
      if (m === 'starter') { this.nivel = 5;  this.felicidade = 70;  this.item = 'Nada'; }
      if (m === 'ovo')     { this.nivel = 1;  this.felicidade = 100; this.item = 'Nada'; this.ot = 'Ovo'; }
    },

    onGenChange() { this.species.clear(); },

    carregarUltimosMovimentos() {
      const d = this.displayPokemon;
      if (!d) return;
      const learned = (d.moveset_by_level || [])
        .filter(m => m.level <= this.nivel)
        .sort((a, b) => b.level - a.level)
        .slice(0, 6);

      const byName = new Map(Alpine.store('api').moves.map(m => [m.name.toLowerCase(), m]));
      this.moves = learned.map(entry => {
        const slot = makeMoveSearchSlot();
        const move = byName.get(entry.move.toLowerCase());
        if (move) slot.select(move);
        return slot;
      });
      while (this.moves.length < 6) this.moves.push(makeMoveSearchSlot());
    },

    onSpeciesSelect(p) {
      this.species.select(p);
      const ab = p.abilities || {};
      this.abilityOptions = [];
      (ab.normal || []).forEach(a => this.abilityOptions.push({ value: a, label: stFormatName(a) }));
      if (this.modo !== 'starter') {
        (ab.hidden || []).forEach(a => this.abilityOptions.push({ value: a, label: stFormatName(a) + ' (HA)' }));
        (ab.exotic || []).forEach(a => this.abilityOptions.push({ value: a, label: stFormatName(a) + ' (EX)' }));
      }
      this.ability = this.abilityOptions[0]?.value || '';

      const g = p.gender || {};
      this.genderOptions = [];
      if (g.male === 0 && g.female === 0) {
        this.genderOptions.push({ value: '', label: 'Sem Gênero' });
      } else {
        if (g.male !== 0)   this.genderOptions.push({ value: 'Masculino ♂', label: 'Masculino ♂' });
        if (g.female !== 0) this.genderOptions.push({ value: 'Feminino ♀',  label: 'Feminino ♀' });
      }
      this.gender = this.genderOptions[0]?.value || '';
    },

    get displayPokemon() { return this.species.formSelected ?? this.species.selected; },
    get tipos() {
      const d = this.displayPokemon;
      if (!d) return '';
      const t = d.types || [d.type_1, d.type_2].filter(Boolean);
      return t.join(' ').toLowerCase();
    },
    get expMax() { return ST_EXP_TABLE[+this.nivel] || 0; },
    get previewHtml() { return stRenderPokeCard(this); },

    gerar() {
      if (!this.species.selected) { alert('Selecione um Pokémon.'); return; }
      const d       = this.displayPokemon;
      const nick    = this.apelido || stFormatName(d.name);
      const ballObj = this.pokeballs.find(b => b.id == this.pokeball);
      const ballSlug = stSlugifyBall(ballObj?.name || 'pokeball');
      const gnrAttr = this.gender ? ` gnr="${this.gender}"` : '';

      const moveTags = this.moves
        .filter(s => s.selected)
        .map(s => {
          let name = stFormatName(s.selected.name);
          if (s.tag === 'tm') name += ' (TM)';
          if (s.tag === 'em') name += ' (EM)';
          if (s.tag === 'es') name += ' (ES)';
          const t = (s.selected.type || '').toLowerCase();
          return `[move${t ? ` t="${t}"` : ''}]${name}[/move]`;
        });

      const st = this.stats;
      let sa = `hp="${d.stats?.hp || 0}" atq="${d.stats?.attack || 0}" def="${d.stats?.defense || 0}" atqesp="${d.stats?.special_attack || 0}" defesp="${d.stats?.special_defense || 0}" vel="${d.stats?.speed || 0}"`;
      if (st.hp)     sa += ` thp="${st.hp}"`;
      if (st.atq)    sa += ` tatq="${st.atq}"`;
      if (st.def)    sa += ` tdef="${st.def}"`;
      if (st.atqesp) sa += ` tatqesp="${st.atqesp}"`;
      if (st.defesp) sa += ` tdefesp="${st.defesp}"`;
      if (st.vel)    sa += ` tvel="${st.vel}"`;

      const spoilerLabel = this.apelido && this.apelido !== stFormatName(d.name)
        ? `${stFormatName(this.species.selected.name)} / ${this.apelido}`
        : stFormatName(d.name);

      const ct = this.concurso;
      const concursoTag = `[concurso irado="${ct.cool || 0}" belo="${ct.beautiful || 0}" fofo="${ct.cute || 0}" sagaz="${ct.clever || 0}" forte="${ct.tough || 0}"]`;

      this.code = [
        `[spoiler="${spoilerLabel}"]`,
        `[poke nick="${nick}" especie="${stFormatName(d.name)}" art="${d.artwork || ''}"`,
        ` tipo="${this.tipos}" ball="${ballSlug}"${gnrAttr}`,
        ` hab="${stFormatName(this.ability)}" level="${this.nivel}" exp="${this.expAtual}/${this.expMax}"`,
        ` fel="${this.felicidade}/255" item="${this.item || 'Nada'}" ot="${this.ot}"]`,
        `\n${this.particularidades}`,
        `\n${moveTags.join('\n')}`,
        `\n[stats ${sa}]`,
        `\n${concursoTag}`,
        `\n[/poke][/spoiler]`,
      ].join('');
    },

    copy() {
      if (!this.code) return;
      stCopyText(this.code);
      this.copied = true;
      clearTimeout(this._t);
      this._t = setTimeout(() => this.copied = false, 2000);
    },
  }));

});
