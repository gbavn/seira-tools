/* ── Utilitário de Clipboard ─────────────────────────────────────────────
   Usa a Clipboard API moderna com fallback para execCommand.
──────────────────────────────────────────────────────────────────────── */

/**
 * Copia texto para a área de transferência.
 * @param {string} text - Texto a copiar
 * @returns {Promise<void>}
 */
function stCopyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => _fallbackCopy(text));
  }
  return Promise.resolve(_fallbackCopy(text));
}

function _fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}
