/* ── Tipos de Pokémon ────────────────────────────────────────────────────
   ST_TYPES         → lista de slugs em inglês (ordem alfabética)
   ST_TYPE_PT       → slug → nome em português
   ST_TYPE_ICONS    → slug → URL do ícone SVG
   ST_TYPE_INSIGNIAS → slug → { badge, ribbon, medal }
──────────────────────────────────────────────────────────────────────── */

const ST_TYPES = [
  'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice',
  'normal', 'poison', 'psychic', 'rock', 'steel', 'water',
];

const ST_TYPE_PT = {
  bug:      'Inseto',
  dark:     'Sombrio',
  dragon:   'Dragão',
  electric: 'Elétrico',
  fairy:    'Fada',
  fighting: 'Lutador',
  fire:     'Fogo',
  flying:   'Voador',
  ghost:    'Fantasma',
  grass:    'Planta',
  ground:   'Terrestre',
  ice:      'Gelo',
  normal:   'Normal',
  poison:   'Venenoso',
  psychic:  'Psíquico',
  rock:     'Pedra',
  steel:    'Aço',
  water:    'Água',
};

const _ICONS_BASE = 'https://raw.githubusercontent.com/gbavn/Seira-Icons/main/Type%20Icons/';
const ST_TYPE_ICONS = {
  bug:      _ICONS_BASE + 'Bug.svg',
  dark:     _ICONS_BASE + 'Dark.svg',
  dragon:   _ICONS_BASE + 'Dragon.svg',
  electric: _ICONS_BASE + 'Electric.svg',
  fairy:    _ICONS_BASE + 'Fairy.svg',
  fighting: _ICONS_BASE + 'Fighting.svg',
  fire:     _ICONS_BASE + 'Fire.svg',
  flying:   _ICONS_BASE + 'Flying.svg',
  ghost:    _ICONS_BASE + 'Ghost.svg',
  grass:    _ICONS_BASE + 'Grass.svg',
  ground:   _ICONS_BASE + 'Ground.svg',
  ice:      _ICONS_BASE + 'Ice.svg',
  normal:   _ICONS_BASE + 'Normal.svg',
  poison:   _ICONS_BASE + 'Poison.svg',
  psychic:  _ICONS_BASE + 'Psychic.svg',
  rock:     _ICONS_BASE + 'Rock.svg',
  steel:    _ICONS_BASE + 'Steel.svg',
  water:    _ICONS_BASE + 'Water.svg',
};

const _GO = 'https://www.serebii.net/pokemongo/medals/';
const _RB = 'https://www.serebii.net/games/ribbons/';
const _BG = 'https://archives.bulbagarden.net/media/upload/';
const ST_TYPE_INSIGNIAS = {
  bug:      { badge: _GO + 'bugcatcher.png',  ribbon: _RB + 'relaxribbon.png',    medal: _BG + '8/8f/GO_Bug_Catcher_Gold_Medal.png' },
  dark:     { badge: _GO + 'delinquent.png',  ribbon: _RB + 'carelessribbon.png', medal: _BG + '6/66/GO_Delinquent_Gold_Medal.png' },
  dragon:   { badge: _GO + 'dragontamer.png', ribbon: _RB + 'downcastribbon.png', medal: _BG + 'e/ed/GO_Dragon_Tamer_Gold_Medal.png' },
  electric: { badge: _GO + 'rocker.png',      ribbon: _RB + 'alertribbon.png',    medal: _BG + '6/66/GO_Rocker_Gold_Medal.png' },
  fairy:    { badge: _GO + 'fairytalegirl.png', ribbon: _RB + 'smileribbon.png',  medal: _BG + 'e/e5/GO_Fairy_Tale_Girl_Gold_Medal.png' },
  fighting: { badge: _GO + 'blackbelt.png',   ribbon: _RB + 'shockribbon.png',    medal: _BG + '1/13/GO_Black_Belt_Gold_Medal.png' },
  fire:     { badge: _GO + 'kindler.png',     ribbon: _RB + 'shockribbon.png',    medal: _BG + '1/15/GO_Kindler_Gold_Medal.png' },
  flying:   { badge: _GO + 'birdkeeper.png',  ribbon: _RB + 'downcastribbon.png', medal: _BG + 'a/a4/GO_Bird_Keeper_Gold_Medal.png' },
  ghost:    { badge: _GO + 'hexmaniac.png',   ribbon: _RB + 'snoozeribbon.png',   medal: _BG + 'e/e2/GO_Hex_Maniac_Gold_Medal.png' },
  grass:    { badge: _GO + 'gardener.png',    ribbon: _RB + 'relaxribbon.png',    medal: _BG + '9/99/GO_Gardener_Gold_Medal.png' },
  ground:   { badge: _GO + 'ruinmaniac.png',  ribbon: _RB + 'alertribbon.png',    medal: _BG + 'e/ed/GO_Ruin_Maniac_Gold_Medal.png' },
  ice:      { badge: _GO + 'skier.png',       ribbon: _RB + 'carelessribbon.png', medal: _BG + '9/99/GO_Skier_Gold_Medal.png' },
  normal:   { badge: _GO + 'schoolkid.png',   ribbon: _RB + 'carelessribbon.png', medal: _BG + '9/9c/GO_Schoolkid_Gold_Medal.png' },
  poison:   { badge: _GO + 'punkgirl.png',    ribbon: _RB + 'snoozeribbon.png',   medal: _BG + '9/99/GO_Punk_Girl_Gold_Medal.png' },
  psychic:  { badge: _GO + 'psychic.png',     ribbon: _RB + 'smileribbon.png',    medal: _BG + 'd/df/GO_Psychic_Gold_Medal.png' },
  rock:     { badge: _GO + 'hiker.png',       ribbon: _RB + 'alertribbon.png',    medal: _BG + '3/3a/GO_Hiker_Gold_Medal.png' },
  steel:    { badge: _GO + 'depotagent.png',  ribbon: _RB + 'carelessribbon.png', medal: _BG + '3/35/GO_Depot_Agent_Gold_Medal.png' },
  water:    { badge: _GO + 'swimmer.png',     ribbon: _RB + 'downcastribbon.png', medal: _BG + '5/51/GO_Swimmer_Gold_Medal.png' },
};
