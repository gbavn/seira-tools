/* ── Utilitários de Experiência ──────────────────────────────────────────
   Depende de: ST_EXP_TABLE (constants/exp-tables.js)
──────────────────────────────────────────────────────────────────────── */

/**
 * Calcula o novo nível e EXP de um Pokémon após ganhar experiência.
 *
 * @param {number} nivelAtual  - Nível atual do Pokémon
 * @param {number} expAtual    - EXP atual dentro do nível
 * @param {number} expGanha    - Quantidade de EXP ganha
 * @returns {{ nivel: number, expAtual: number, expMax: number }}
 */
function stCalcNivelPokemon(nivelAtual, expAtual, expGanha) {
  // Acumula EXP total desde o nível 1
  let total = expAtual;
  for (let i = 0; i < nivelAtual; i++) total += ST_EXP_TABLE[i] || 0;
  total += expGanha;

  // Descobre o novo nível
  let novoNivel = 0;
  let acum = 0;
  for (let i = 0; i < 100; i++) {
    acum += ST_EXP_TABLE[i] || 0;
    if (total < acum) { novoNivel = i; break; }
    if (i === 99) novoNivel = 100;
  }

  // EXP dentro do novo nível
  let expNoNivel = total;
  for (let i = 0; i < novoNivel; i++) expNoNivel -= ST_EXP_TABLE[i] || 0;

  return {
    nivel:    novoNivel,
    expAtual: expNoNivel,
    expMax:   novoNivel < 100 ? ST_EXP_TABLE[novoNivel] : 0,
  };
}

/**
 * Cria o estado inicial de um slot de time para batalha.
 * @param {number} i - índice do slot (0-based)
 */
function stMakeSlotBatalha(i) {
  return { nome: `Pokémon ${i + 1}`, nivel: 1, expAtual: 0, luckyEgg: false, domador: false, evento: 1, fixo: 0 };
}

/**
 * Cria o estado inicial de um slot de time para RP.
 * @param {number} i - índice do slot (0-based)
 */
function stMakeSlotRP(i) {
  return { nome: `Pokémon ${i + 1}`, nivel: 1, expAtual: 0, domador: false, evento: 1, fixo: 0 };
}
