/* ── Render do Card de Pokémon (Preview) ─────────────────────────────────
   Gera o HTML de pré-visualização da ficha (classes .tabpokecard / .tabpokemoves /
   .tabpokestatus / .tabpokecontest, definidas no CSS do fórum) a partir do
   estado do Gerador de Pokémon. Não substitui o BBcode gerado por gerar() —
   é só uma aproximação visual para o jogador conferir antes de copiar.

   Depende de: stFormatName (utils/format.js),
               ST_TYPE_ICONS, ST_TYPE_PT (constants/pokemon-types.js)
──────────────────────────────────────────────────────────────────────── */

const ST_POKE_STAT_ICONS = {
  hp:     'fa-heart-pulse',
  atq:    'fa-hand-fist',
  def:    'fa-shield',
  atqesp: 'fa-wand-magic-sparkles',
  defesp: 'fa-shield-halved',
  vel:    'fa-bolt',
};

const ST_POKE_CONTEST_META = [
  { key: 'cool',       cls: 'ct-cool',   icon: 'fa-fire',      label: 'Irado' },
  { key: 'beautiful',  cls: 'ct-beauty', icon: 'fa-gem',       label: 'Belo' },
  { key: 'cute',       cls: 'ct-cute',   icon: 'fa-heart',     label: 'Fofo' },
  { key: 'clever',     cls: 'ct-smart',  icon: 'fa-brain',     label: 'Sagaz' },
  { key: 'tough',      cls: 'ct-tough',  icon: 'fa-dumbbell',  label: 'Forte' },
];

const ST_MOVE_TAG_LABEL = { tm: 'TM', em: 'EM', es: 'ES' };

/**
 * Renderiza o preview do card a partir do estado de `genPokemon`.
 * @param {object} ctx — a instância Alpine de genPokemon (this).
 */
function stRenderPokeCard(ctx) {
  const d = ctx.displayPokemon;
  if (!d) return `<p class="st-preview-empty">Selecione um Pokémon para ver o preview.</p>`;

  const nick = ctx.apelido || stFormatName(d.name);
  const ballObj  = ctx.pokeballs.find(b => b.id == ctx.pokeball);
  const ballName = ballObj?.name || 'Poké Ball';

  const typeSlugs = (d.types || [d.type_1, d.type_2].filter(Boolean)).map(t => t.toLowerCase());
  const typeBadges = typeSlugs.map(t =>
    `<span class="st-preview-type"><img src="${ST_TYPE_ICONS[t] || ''}" alt="${t}"> ${ST_TYPE_PT[t] || stFormatName(t)}</span>`
  ).join('');

  const infoRow = (label, value) =>
    `<div class="tabpokeinforow"><span class="label">${label}</span><span class="value">${value}</span></div>`;

  const st = ctx.stats;
  const totalStat = (base, trained) => (base || 0) + (trained || 0);
  const statRows = [
    ['hp',     'HP',            totalStat(d.stats?.hp, st.hp)],
    ['atq',    'Ataque',        totalStat(d.stats?.attack, st.atq)],
    ['def',    'Defesa',        totalStat(d.stats?.defense, st.def)],
    ['atqesp', 'Atq. Especial', totalStat(d.stats?.special_attack, st.atqesp)],
    ['defesp', 'Def. Especial', totalStat(d.stats?.special_defense, st.defesp)],
    ['vel',    'Velocidade',    totalStat(d.stats?.speed, st.vel)],
  ].map(([key, label, value]) => (
    `<div class="tabpokestat"><i class="fas ${ST_POKE_STAT_ICONS[key]}"></i>` +
    `<span class="tabpokestatname">${label}</span><span class="tabpokestatvalue">${value}</span></div>`
  )).join('');

  const moveRows = ctx.moves
    .filter(s => s.selected)
    .map(s => {
      const typeSlug = (s.selected.type || '').toLowerCase();
      const tagLabel = ST_MOVE_TAG_LABEL[s.tag];
      const src = tagLabel ? `<span class="move-src">${tagLabel}</span>` : '';
      return `<div class="move ${typeSlug}"><span>${stFormatName(s.selected.name)}</span>${src}</div>`;
    }).join('');

  const hasConcurso = ST_POKE_CONTEST_META.some(m => +ctx.concurso?.[m.key] > 0);
  const contestBlock = hasConcurso
    ? `<div class="tabpokecontest">${ST_POKE_CONTEST_META.map(m => (
        `<div class="tabpokestat ${m.cls}"><i class="fas ${m.icon}"></i>` +
        `<span class="tabpokestatname">${m.label}</span><span class="tabpokestatvalue">${+ctx.concurso[m.key] || 0}</span></div>`
      )).join('')}</div>`
    : '';

  return [
    `<div class="tabpokecard">`,
    `<div class="tabpoketop">`,
    `<div class="tabpokeimage"><img src="${d.artwork || ''}" alt="${nick}"></div>`,
    `<div class="tabpokeinfo">`,
    `<h2>${nick}</h2>`,
    typeBadges,
    infoRow('Espécie', stFormatName(d.name)),
    infoRow('Nível', ctx.nivel),
    infoRow('EXP', `${ctx.expAtual} / ${ctx.expMax}`),
    infoRow('Habilidade', stFormatName(ctx.ability)),
    infoRow('Item', ctx.item || 'Nada'),
    infoRow('Pokébola', ballName),
    infoRow('Treinador', ctx.ot || '—'),
    `</div>`,
    `</div>`,
    ctx.particularidades ? `<div class="tabpokepart"><p>${ctx.particularidades}</p></div>` : '',
    `<div class="tabpokebottom">`,
    `<div class="tabpokesidelabel"><i class="fas fa-dragon"></i></div>`,
    `<div class="tabpoketraits">`,
    `<div class="tabpokemoves">${moveRows}</div>`,
    `<div class="tabpokestatus">${statRows}</div>`,
    contestBlock,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('');
}
