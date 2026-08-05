/* ── Render de Card de Pokémon (preview) ─────────────────────────────────
   Versão simplificada do buildCard() do parser do fórum (seira-parser.js),
   usada só para pré-visualização dentro do gerador — sem tooltips e sem
   fetch de moves no Supabase, que são papel do parser no fórum, não do
   gerador. Reaproveita as classes de forum.css (.tabpokecard,
   .tabpokemoves .move.<tipo>, .tabpokestatus etc.) para ficar fiel ao
   resultado real; o que forum.css não cobre (badges de fonte de golpe,
   bloco de concurso) ganha CSS próprio inline nas páginas dos geradores.
   Depende de: ST_TYPE_ICONS, ST_TYPE_PT (constants/pokemon-types.js)
──────────────────────────────────────────────────────────────────────── */

const ST_MOVE_TAG_ICON = {
  tm: 'fa-compact-disc',
  em: 'fa-egg',
  es: 'fa-star',
};

const ST_CONTEST_META = [
  { key: 'cool',      cls: 'ct-cool',   icon: 'fa-fire',     label: 'Irado' },
  { key: 'beautiful', cls: 'ct-beauty', icon: 'fa-gem',      label: 'Belo'  },
  { key: 'cute',      cls: 'ct-cute',   icon: 'fa-heart',    label: 'Fofo'  },
  { key: 'clever',    cls: 'ct-smart',  icon: 'fa-brain',    label: 'Sagaz' },
  { key: 'tough',     cls: 'ct-tough',  icon: 'fa-dumbbell', label: 'Forte' },
];

function stEsc(str) {
  return String(str ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

function stRenderTipoRow(tiposStr) {
  const tipos = (tiposStr || '').trim().split(/\s+/).filter(Boolean);
  return tipos.map(t => {
    const icon  = ST_TYPE_ICONS[t] || '';
    const label = ST_TYPE_PT[t] || t;
    return '<span class="st-preview-type">'
      + (icon ? '<img src="' + icon + '" alt="' + stEsc(t) + '">' : '')
      + stEsc(label)
      + '</span>';
  }).join('');
}

function stRenderMoves(moves) {
  const list = (moves || []).slice(0, 6).map(mv => {
    const cls  = mv.tipo ? ' ' + mv.tipo : '';
    const icon = ST_MOVE_TAG_ICON[mv.tag] || '';
    return '<div class="move' + cls + '">'
      + stEsc(mv.nome || '—')
      + (icon ? '<span class="move-src"><i class="fas ' + icon + '"></i></span>' : '')
      + '</div>';
  });
  while (list.length < 6) list.push('<div class="move">—</div>');
  return list.join('');
}

function stRenderStats(stats) {
  return (stats || []).map(s =>
    '<div class="tabpokestat">'
    + '<span class="tabpokestatname">' + stEsc(s.label) + '</span>'
    + '<span class="tabpokestatbase">' + stEsc(s.base) + '</span>'
    + (s.tr > 0 ? '<span class="tabpokestatvalue"> (+' + s.tr + ')</span>' : '')
    + '</div>'
  ).join('');
}

function stRenderContest(concurso) {
  return ST_CONTEST_META.map(c => {
    const val = (concurso && concurso[c.key]) || 0;
    return '<div class="tabpokestat ' + c.cls + '">'
      + '<i class="fas ' + c.icon + '"></i>'
      + '<span class="tabpokestatname">' + c.label + '</span>'
      + '<span class="tabpokestatvalue">' + val + '</span>'
      + '</div>';
  }).join('');
}

/**
 * Monta o HTML de preview do card de Pokémon.
 * @param {object} d — ver gen-pokemon.js `previewData` para o formato.
 */
function stRenderPokeCard(d) {
  return ''
    + '<div class="tabpokecard">'
    + '<h2>'
    +   (d.ballIcon ? '<img src="' + d.ballIcon + '" alt="pokébola" onerror="this.style.display=\'none\'">' : '')
    +   stEsc(d.nick || '???')
    + '</h2>'
    + '<div class="tabpoketop">'
    +   '<div class="tabpokeimage"><img src="' + stEsc(d.art || '') + '" alt="' + stEsc(d.especie || '') + '"></div>'
    +   '<div class="tabpokeinfo">'
    +     '<div class="tabpokeinforow"><span class="label">Espécie</span><span class="value">#' + stEsc(d.num || '0') + ' – ' + stEsc(d.especie || '???') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Tipo</span><span class="value">' + stRenderTipoRow(d.tipos) + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Gênero</span><span class="value">' + stEsc(d.genero || 'Sem Gênero') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Habilidade</span><span class="value">' + stEsc(d.habilidade || '—') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Level</span><span class="value">' + stEsc(d.level || '—') + (d.exp ? ' (' + stEsc(d.exp) + ')' : '') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Felicidade</span><span class="value">' + stEsc(d.felicidade || '—') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">Item Equipado</span><span class="value">' + stEsc(d.item || 'Nada') + '</span></div>'
    +     '<div class="tabpokeinforow"><span class="label">OT</span><span class="value">' + stEsc(d.ot || '—') + '</span></div>'
    +   '</div>'
    + '</div>'
    + '<div class="tabpokepart">'
    +   '<h4><i class="fas fa-book-open"></i> Particularidades</h4>'
    +   '<p>' + (d.particularidades || '<em>Sem particularidades.</em>') + '</p>'
    + '</div>'
    + '<div class="tabpokebottom">'
    +   '<div class="tabpokesidelabel"><i class="fas fa-book"></i>Traços</div>'
    +   '<div class="tabpoketraits">'
    +     '<div class="tabpokemoves">' + stRenderMoves(d.moves) + '</div>'
    +     '<div class="tabpokestatus">' + stRenderStats(d.stats) + '</div>'
    +     '<div class="tabpokecontest">' + stRenderContest(d.concurso) + '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
}
