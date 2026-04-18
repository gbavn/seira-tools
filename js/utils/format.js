/* ── Utilitários de Formatação ───────────────────────────────────────────
   Funções puras sem estado — não dependem de Alpine.
──────────────────────────────────────────────────────────────────────── */

/**
 * Capitaliza cada palavra de uma string, preservando hífens.
 * Ex.: "fire-punch" → "Fire-Punch"
 */
function stFormatName(str) {
  if (!str) return '';
  const sep = str.includes('-') ? '-' : ' ';
  return str
    .split(/[\s-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(sep);
}

/**
 * Gera um slug limpo para o nome de uma Pokébola.
 * Ex.: "Poké Ball" → "pokeball"
 */
function stSlugifyBall(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '');
}
