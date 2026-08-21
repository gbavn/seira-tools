/* ── Render do Card de Pokémon (Preview) ─────────────────────────────────
   Gera o HTML de pré-visualização da ficha a partir do estado do Gerador
   de Pokémon, espelhando o template do parser BBcode do fórum (mesmas
   classes .tabpokecard/.tabpokemoves/.tabpokestatus/.tabpokecontest e
   ícones `gmi`/Font Awesome usados em produção) — é só uma aproximação
   para o jogador conferir antes de copiar; quem realmente renderiza o
   [poke] postado é o parser do fórum.

   Depende de: stFormatName (utils/format.js),
               ST_TYPE_ICONS, ST_TYPE_PT (constants/pokemon-types.js)
──────────────────────────────────────────────────────────────────────── */

const ST_POKE_STAT_ICONS = {
  hp:     'gmi-glass-heart',
  atq:    'gmi-fist',
  def:    'gmi-bordered-shield',
  atqesp: 'gmi-hypersonic-bolt',
  defesp: 'gmi-bolt-shield',
  vel:    'gmi-steelwing-emblem',
};
const ST_POKE_STAT_NAMES = { hp: 'HP', atq: 'ATQ', def: 'DEF', atqesp: 'ATQ ESP.', defesp: 'DEF ESP.', vel: 'VEL' };

const ST_POKE_CONTEST_META = [
  { key: 'cool',      cls: 'ct-cool',   icon: 'gmi-sunglasses',    label: 'Irado' },
  { key: 'beautiful', cls: 'ct-beauty', icon: 'gmi-crowned-heart', label: 'Belo' },
  { key: 'cute',      cls: 'ct-cute',   icon: 'gmi-candy-canes',   label: 'Fofo' },
  { key: 'clever',    cls: 'ct-smart',  icon: 'gmi-bolt-eye',      label: 'Sagaz' },
  { key: 'tough',     cls: 'ct-tough',  icon: 'gmi-broken-shield', label: 'Forte' },
];

const ST_MOVE_TAG_ICON = { tm: 'fa-compact-disc', em: 'fa-egg', es: 'fa-star' };

/**
 * Renderiza o preview do card a partir do estado de `genPokemon`.
 * @param {object} ctx — a instância Alpine de genPokemon (this).
 */
function stRenderPokeCard(ctx) {
  const d = ctx.displayPokemon;
  if (!d) return `<p class="st-preview-empty">Selecione um Pokémon para ver o preview.</p>`;

  const nick = ctx.apelido || stFormatName(d.name);
  const ballObj  = ctx.pokeballs.find(b => b.id == ctx.pokeball);
  const ballSrc  = ballObj?.sprite || '';

  const typeSlugs = (d.types || [d.type_1, d.type_2].filter(Boolean)).map(t => t.toLowerCase());
  const typeBadges = typeSlugs.map(t =>
    `<span class="st-preview-type"><img src="${ST_TYPE_ICONS[t] || ''}" alt="${t}"> ${ST_TYPE_PT[t] || stFormatName(t)}</span>`
  ).join('');

  const infoRow = (label, value) =>
    `<div class="tabpokeinforow"><span class="label">${label}</span><span class="value">${value}</span></div>`;

  const st = ctx.stats;
  const statRows = [
    ['hp',     d.stats?.hp,             st.hp],
    ['atq',    d.stats?.attack,         st.atq],
    ['def',    d.stats?.defense,        st.def],
    ['atqesp', d.stats?.special_attack, st.atqesp],
    ['defesp', d.stats?.special_defense,st.defesp],
    ['vel',    d.stats?.speed,          st.vel],
  ].map(([key, base, trained]) => (
    `<div class="tabpokestat"><i class="gmi ${ST_POKE_STAT_ICONS[key]}"></i>` +
    `<span class="tabpokestatname">${ST_POKE_STAT_NAMES[key]}</span>` +
    `<span class="tabpokestatbase">${base || 0}</span>` +
    (trained > 0 ? `<span class="tabpokestatvalue"> (+${trained})</span>` : '') +
    `</div>`
  )).join('');

  const moveRows = ctx.moves
    .filter(s => s.selected)
    .map(s => {
      const typeSlug = (s.selected.type || '').toLowerCase();
      const icon = ST_MOVE_TAG_ICON[s.tag];
      const src  = icon ? `<span class="move-src"><i class="fa-solid ${icon}"></i></span>` : '';
      return `<div class="move ${typeSlug}">${stFormatName(s.selected.name)}${src}</div>`;
    }).join('');

  const contestBlock = `<div class="tabpokecontest">${ST_POKE_CONTEST_META.map(m => (
    `<div class="tabpokestat ${m.cls}"><i class="gmi ${m.icon}"></i>` +
    `<span class="tabpokestatname">${m.label}</span><span class="tabpokestatvalue">${+ctx.concurso?.[m.key] || 0}</span></div>`
  )).join('')}</div>`;

  return [
    `<div class="tabpokecard">`,
    `<h2>${ballSrc ? `<img src="${ballSrc}" style="vertical-align:middle;margin-right:6px;width:20px;height:20px;">` : ''}${nick}</h2>`,
    `<div class="tabpoketop">`,
    `<div class="tabpokeimage"><img src="${d.artwork || ''}" alt="${nick}"></div>`,
    `<div class="tabpokeinfo">`,
    infoRow('Espécie', `#${d.id} – ${stFormatName(d.name)}`),
    infoRow('Tipo', typeBadges),
    infoRow('Gênero', ctx.gender || 'Sem Gênero'),
    infoRow('Habilidade', stFormatName(ctx.ability)),
    infoRow('Level', `${ctx.nivel} (${ctx.expAtual}/${ctx.expMax})`),
    infoRow('Felicidade', `${ctx.felicidade}/255`),
    infoRow('Item Equipado', ctx.item || 'Nada'),
    infoRow('OT', ctx.ot || '—'),
    `</div>`,
    `</div>`,
    `<div class="tabpokepart"><h4><i class="gmi gmi-polar-star"></i> Particularidades</h4><div class="fitext">${ctx.particularidades || '—'}</div></div>`,
    `<div class="tabpokebottom">`,
    `<div class="tabpokesidelabel"><i class="gmi gmi-spell-book"></i> Traços</div>`,
    `<div class="tabpoketraits">`,
    `<div class="tabpokemoves">${moveRows}</div>`,
    `<div class="tabpokestatwrap"><div class="tabpokestatus">${statRows}</div>${contestBlock}</div>`,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('');
}
