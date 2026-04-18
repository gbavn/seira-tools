/* ── Calculadora de Personagem ───────────────────────────────────────────
   Calcula o avanço de nível do treinador após uma postagem válida.
   Base: 3 EXP por postagem + bônus de eventos/perícias.
   Depende de: ST_EXP_PERSONAGEM (constants/exp-tables.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('calcPersonagem', () => ({
    nivel:    1,
    expAtual: 0,
    bonus:    0,
    result:   null,

    calcular() {
      const nv    = +this.nivel   || 1;
      const ea    = +this.expAtual || 0;
      const bns   = +this.bonus   || 0;
      const ganhou = 3 + bns;

      // EXP acumulada total
      const baseAtual   = ST_EXP_PERSONAGEM[nv - 1] || 0;
      const expAcumAtual = baseAtual + ea;
      const novoAcum     = expAcumAtual + ganhou;

      // Novo nível
      let novoNivel = nv;
      for (let i = nv; i < 25; i++) {
        if (novoAcum >= ST_EXP_PERSONAGEM[i]) novoNivel = i + 1;
        else break;
      }
      novoNivel = Math.min(novoNivel, 25);

      const baseNovoNivel = ST_EXP_PERSONAGEM[novoNivel - 1] || 0;
      const expNoNivel    = novoAcum - baseNovoNivel;
      const expMax        = novoNivel < 25
        ? ST_EXP_PERSONAGEM[novoNivel] - baseNovoNivel
        : 0;

      this.result = {
        ganhou,
        novoNivel,
        expNoNivel: Math.max(0, expNoNivel),
        expMax,
        subiu: novoNivel > nv,
      };
    },
  }));

});
