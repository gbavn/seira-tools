/* ── Calculadora de Roleplay ─────────────────────────────────────────────
   EXP = (70 × rank × nível_pokémon × 0.25) × MET / qtParticipantes
   Depende de: stMakeSlotRP, stCalcNivelPokemon (utils/exp.js),
               ST_EXP_PERSONAGEM (constants/exp-tables.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('calcRP', () => ({
    nivelTreinador:  1,
    qtParticipantes: 1,
    ressonancia:     false,
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
        const nivelAntes  = +s.nivel || 1;
        const felicAntes  = +s.felicidade || 0;

        // EXP ganha: valor fixo sobrescreve o cálculo
        let exp;
        if (+s.fixo > 0) {
          exp = +s.fixo;
        } else {
          let MET = 1;
          if (s.domador) MET *= 1 + Math.min(0.35, 0.15 + (nivelP - 1) * 0.02);
          if (+s.evento > 1) MET *= +s.evento;
          exp = Math.round(((70 * rank) * nivelAntes * 0.25) * MET / qt);
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
          felicNova:   Math.min(255, felicAntes + felicGanha),
          nivel:       r.nivel,
          expAtual:    r.expAtual,
          expMax:      r.expMax,
        };
      });
    },
  }));

});
