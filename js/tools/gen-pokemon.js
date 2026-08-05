/* ── Gerador de Pokémon ──────────────────────────────────────────────────
   Gera o código BBcode de ficha completa de um Pokémon.
   Depende de: makePokemonSearchSlot, makeMoveSearchSlot (hooks/search-factories.js),
               makePreviewPanel (hooks/preview-factories.js),
               stFormatName, stSlugifyBall (utils/format.js),
               stRenderPokeCard, stEsc (utils/poke-card-render.js),
               stCopyText (utils/clipboard.js),
               ST_EXP_TABLE (constants/exp-tables.js),
               ST_POKEBALL_ORDER (constants/items-meta.js)
──────────────────────────────────────────────────────────────────────── */

// tag do slot de movimento → tag BBCode emitida pelo parser do fórum
const ST_MOVE_TAG_BBCODE = {
  normal: 'move',
  tm:     'move-tm',
  em:     'move-em',
  es:     'move-es',
};

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
    preview:     makePreviewPanel(),
    code:        '',
    copied:      false,
    _t:          null,

    init() {
      Alpine.store('api').load().then(() => {
        const raw = Alpine.store('api').items.filter(i => i.category === 'pokeball');
        this.pokeballs = raw.slice().sort((a, b) => {
          const ia = ST_POKEBALL_ORDER.indexOf(stSlugifyBall(a.name));
          const ib = ST_POKEBALL_ORDER.indexOf(stSlugifyBall(b.name));
          if (ia === -1 && ib === -1) return a.name.localeCompare(b.name);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });
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

    /**
     * Preenche os 6 slots de movimento com os últimos golpes de level-up
     * aprendidos até o nível atual (do maior nível pro menor).
     */
    carregarUltimosMovimentos() {
      const d = this.displayPokemon;
      if (!d) { alert('Selecione um Pokémon.'); return; }
      const learnset = d.moveset_by_level || [];
      if (!learnset.length) { alert('Este Pokémon não tem moveset de level-up cadastrado.'); return; }

      const nivel = +this.nivel || 0;
      const maxLevelByMove = new Map();
      learnset.forEach(({ move, level }) => {
        if (level > nivel) return;
        const atual = maxLevelByMove.get(move);
        if (atual === undefined || level > atual) maxLevelByMove.set(move, level);
      });

      const aprendidos = [...maxLevelByMove.entries()].sort((a, b) => b[1] - a[1]);
      const apiMoves = Alpine.store('api').moves;

      this.moves.forEach((slot, i) => {
        const entry = aprendidos[i];
        if (!entry) { slot.clear(); return; }
        const [nome] = entry;
        const found = apiMoves.find(m => m.name.toLowerCase() === nome.toLowerCase());
        slot.select(found || { name: nome, type: '' });
        slot.tag = 'normal';
      });
    },

    get displayPokemon() { return this.species.formSelected ?? this.species.selected; },
    get tipos() {
      const d = this.displayPokemon;
      if (!d) return '';
      const t = d.types || [d.type_1, d.type_2].filter(Boolean);
      return t.join(' ').toLowerCase();
    },
    get expMax() { return ST_EXP_TABLE[+this.nivel] || 0; },

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
          const name = stFormatName(s.selected.name);
          const tag  = ST_MOVE_TAG_BBCODE[s.tag] || 'move';
          const t    = (s.selected.type || '').toLowerCase();
          return `[${tag}${t ? ` t="${t}"` : ''}]${name}[/${tag}]`;
        });

      const st = this.stats;
      let sa = `hp="${d.stats?.hp || 0}" atq="${d.stats?.attack || 0}" def="${d.stats?.defense || 0}" atqesp="${d.stats?.special_attack || 0}" defesp="${d.stats?.special_defense || 0}" vel="${d.stats?.speed || 0}"`;
      if (st.hp)     sa += ` thp="${st.hp}"`;
      if (st.atq)    sa += ` tatq="${st.atq}"`;
      if (st.def)    sa += ` tdef="${st.def}"`;
      if (st.atqesp) sa += ` tatqesp="${st.atqesp}"`;
      if (st.defesp) sa += ` tdefesp="${st.defesp}"`;
      if (st.vel)    sa += ` tvel="${st.vel}"`;

      const cs = this.concurso;
      let ca = '';
      if (cs.cool)      ca += ` cool="${cs.cool}"`;
      if (cs.beautiful) ca += ` beautiful="${cs.beautiful}"`;
      if (cs.cute)      ca += ` cute="${cs.cute}"`;
      if (cs.clever)    ca += ` clever="${cs.clever}"`;
      if (cs.tough)     ca += ` tough="${cs.tough}"`;

      const spoilerLabel = this.apelido && this.apelido !== stFormatName(d.name)
        ? `${stFormatName(this.species.selected.name)} / ${this.apelido}`
        : stFormatName(d.name);

      this.code = [
        `[spoiler="${spoilerLabel}"]`,
        `[poke nick="${nick}" especie="${stFormatName(d.name)}" art="${d.artwork || ''}"`,
        ` tipo="${this.tipos}" ball="${ballSlug}"${gnrAttr}`,
        ` hab="${stFormatName(this.ability)}" level="${this.nivel}" exp="${this.expAtual}/${this.expMax}"`,
        ` fel="${this.felicidade}/255" item="${this.item || 'Nada'}" ot="${this.ot}"${ca}]`,
        `\n${this.particularidades}`,
        `\n${moveTags.join('\n')}`,
        `\n[stats ${sa}]`,
        `\n[/poke][/spoiler]`,
      ].join('');
    },

    /** Dados normalizados pro preview visual (stRenderPokeCard). */
    get previewData() {
      const d = this.displayPokemon;
      if (!d) return null;

      const ballObj  = this.pokeballs.find(b => b.id == this.pokeball);
      const ballSlug = stSlugifyBall(ballObj?.name || 'pokeball');

      const moves = this.moves
        .filter(s => s.selected)
        .map(s => ({
          nome: stFormatName(s.selected.name),
          tipo: (s.selected.type || '').toLowerCase(),
          tag:  s.tag === 'normal' ? '' : s.tag,
        }));

      const statMap = [
        ['hp', 'hp', 'HP'], ['atq', 'attack', 'ATQ'], ['def', 'defense', 'DEF'],
        ['atqesp', 'special_attack', 'ATQ ESP.'], ['defesp', 'special_defense', 'DEF ESP.'],
        ['vel', 'speed', 'VEL'],
      ];
      const stats = statMap.map(([key, dbKey, label]) => ({
        label,
        base: d.stats?.[dbKey] || 0,
        tr:   +this.stats[key] || 0,
      }));

      return {
        nick:    this.apelido || stFormatName(d.name),
        especie: stFormatName(d.name),
        num:     d.id,
        art:     d.artwork,
        tipos:   this.tipos,
        ballIcon: 'https://www.serebii.net/itemdex/sprites/sv/' + ballSlug + '.png',
        genero:  this.gender || 'Sem Gênero',
        habilidade: stFormatName(this.ability),
        level:   this.nivel,
        exp:     `${this.expAtual}/${this.expMax}`,
        felicidade: `${this.felicidade}/255`,
        item:    this.item || 'Nada',
        ot:      this.ot,
        particularidades: stEsc(this.particularidades).replace(/\n/g, '<br>'),
        moves,
        stats,
        concurso: this.concurso,
      };
    },

    get previewHtml() {
      const d = this.previewData;
      return d ? stRenderPokeCard(d) : '<p class="st-preview-empty">Selecione um Pokémon para pré-visualizar.</p>';
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
