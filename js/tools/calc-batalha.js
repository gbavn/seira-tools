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
    ressonancia:     false,
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
        const nivelAntes = +s.nivel || 1;
        const felicAntes = +s.felicidade || 0;

        // EXP ganha: valor fixo sobrescreve o cálculo
        let exp;
        if (+s.fixo > 0) {
          exp = +s.fixo;
        } else {
          let MET = 1;
          if (s.luckyEgg)    MET *= 1.5;
          if (s.domador)     MET *= 1 + Math.min(0.35, 0.15 + (nivelP - 1) * 0.02);
          if (+s.evento > 1) MET *= +s.evento;
          exp = Math.round((base * nivel / 4.5 / qt) * MC * MET);
        }

        const r             = stCalcNivelPokemon(nivelAntes, +s.expAtual, exp);
        const niveisSubidos = Math.max(0, r.nivel - nivelAntes);
        const subiu         = niveisSubidos > 0;
        const felicGanha    = stCalcFelicidade(niveisSubidos, this.ressonancia);

        return {
          nome:        s.nome,
          ganhou:      exp,
          nivelAntes,
          subiu,
          felicAntes,
          felicGanha,
          felicNova:   felicAntes + felicGanha,
          nivel:       r.nivel,
          expAtual:    r.expAtual,
          expMax:      r.expMax,
        };
      });
    },
  }));

});
