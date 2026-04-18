/* ── Calculadora de Batalha ──────────────────────────────────────────────
   EXP = (BaseEXP × nível / 4.5 / qtParticipantes) × MC × MET
   Depende de: makePokemonSearchSlot (hooks/search-factories.js),
               stMakeSlotBatalha, stCalcNivelPokemon (utils/exp.js),
               stFormatName (utils/format.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('calcBatalha', () => ({
    gen:             '',
    enemy:           makePokemonSearchSlot({ maxResults: 8 }),
    enemyLevel:      5,
    tipoConfronto:   '1',
    nivelPersonagem: 1,
    qtParticipantes: 1,
    team:            [stMakeSlotBatalha(0)],
    results:         [],

    init() {
      Alpine.store('api').load();
      document.addEventListener('click', e => {
        if (!this.$el.contains(e.target)) this.enemy.showList = false;
      });
    },

    onGenChange() { this.enemy.clear(); },

    syncTeam() {
      const qt = Math.max(1, +this.qtParticipantes || 1);
      while (this.team.length < qt) this.team.push(stMakeSlotBatalha(this.team.length));
      this.team.splice(qt);
    },

    calcular() {
      if (!this.enemy.selected) { alert('Selecione o Pokémon inimigo.'); return; }

      const base   = this.enemy.selected.base_experience || 100;
      const nivel  = +this.enemyLevel || 1;
      const MC     = +this.tipoConfronto || 1;
      const nivelP = +this.nivelPersonagem || 1;
      const qt     = this.team.length;

      this.results = this.team.map(s => {
        if (+s.fixo > 0) {
          const r = stCalcNivelPokemon(+s.nivel, +s.expAtual, +s.fixo);
          return { ...s, ganhou: +s.fixo, ...r };
        }

        let MET = 1;
        if (s.luckyEgg)    MET *= 1.5;
        if (s.domador)     MET *= 1 + Math.min(0.35, 0.15 + (nivelP - 1) * 0.02);
        if (+s.evento > 1) MET *= +s.evento;

        const exp = Math.round((base * nivel / 4.5 / qt) * MC * MET);
        const r   = stCalcNivelPokemon(+s.nivel, +s.expAtual, exp);
        return { ...s, ganhou: exp, ...r };
      });
    },
  }));

});
