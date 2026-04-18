/* ── Calculadora de Roleplay ─────────────────────────────────────────────
   EXP = (70 × rank × nível_pokémon × 0.25) × MET / qtParticipantes
   Depende de: stMakeSlotRP, stCalcNivelPokemon (utils/exp.js),
               ST_EXP_PERSONAGEM (constants/exp-tables.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('calcRP', () => ({
    nivelTreinador:  1,
    qtParticipantes: 1,
    team:    [stMakeSlotRP(0)],
    results: [],

    init() { Alpine.store('api').load(); },

    syncTeam() {
      const qt = Math.max(1, +this.qtParticipantes || 1);
      while (this.team.length < qt) this.team.push(stMakeSlotRP(this.team.length));
      this.team.splice(qt);
    },

    calcular() {
      const nivelP = +this.nivelTreinador || 1;
      const qt     = this.team.length;
      const rank   = 1 + (nivelP - 1) * 0.1;

      this.results = this.team.map(s => {
        // Valor fixo sobrescreve o cálculo
        if (+s.fixo > 0) {
          const r = stCalcNivelPokemon(+s.nivel, +s.expAtual, +s.fixo);
          return { ...s, ganhou: +s.fixo, ...r };
        }

        let MET = 1;
        if (s.domador) MET *= 1 + Math.min(0.35, 0.15 + (nivelP - 1) * 0.02);
        if (+s.evento > 1) MET *= +s.evento;

        const exp = Math.round(((70 * rank) * (+s.nivel) * 0.25) * MET / qt);
        const r   = stCalcNivelPokemon(+s.nivel, +s.expAtual, exp);
        return { ...s, ganhou: exp, ...r };
      });
    },
  }));

});
