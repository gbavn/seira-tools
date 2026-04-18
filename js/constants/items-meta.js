/* ── Metadados de Itens ───────────────────────────────────────────────────
   ST_CATEGORY_MAP    → categoria DB → slug interno
   ST_CATEGORY_LABELS → slug interno → label em português
   ST_CATEGORY_ORDER  → ordem de exibição das abas na mochila
   ST_CATEGORY_ICONS  → slug interno → classe de ícone (gmi)
   ST_FIXED_MEDICINAIS → itens medicinais fixos da ficha inicial
──────────────────────────────────────────────────────────────────────── */

const ST_CATEGORY_MAP = {
  'key-item':      'itens-chave',
  'medicine':      'itens-medicinais',
  'pokeball':      'pokebolas',
  'battle-item':   'itens-batalha',
  'berry':         'berries',
  'craft-material':'itens-craft',
  'tm':            'tms',
  'other':         'outros-itens',
};

const ST_CATEGORY_LABELS = {
  'itens-chave':     'Itens Chave',
  'itens-medicinais':'Consumíveis',
  'pokebolas':       'Pokébolas',
  'itens-batalha':   'Itens de Batalha',
  'berries':         'Berries',
  'itens-craft':     'Itens de Craft',
  'tms':             "TM's",
  'outros-itens':    'Outros Itens',
};

const ST_CATEGORY_ORDER = [
  'itens-chave', 'itens-medicinais', 'pokebolas',
  'itens-batalha', 'berries', 'itens-craft', 'tms', 'outros-itens',
];

const ST_CATEGORY_ICONS = {
  'itens-chave':     'gmi-key',
  'itens-medicinais':'gmi-potion-ball',
  'pokebolas':       'gmi-moon-orbit',
  'itens-batalha':   'gmi-belt',
  'berries':         'gmi-peach',
  'itens-craft':     'gmi-stone-block',
  'tms':             'gmi-compact-disc',
  'outros-itens':    'gmi-cake-slice',
};

const ST_FIXED_MEDICINAIS = [
  { name: 'Potion',       sprite: 'https://www.serebii.net/itemdex/sprites/sv/potion.png' },
  { name: 'Super Potion', sprite: 'https://www.serebii.net/itemdex/sprites/sv/superpotion.png' },
  { name: 'Hyper Potion', sprite: 'https://www.serebii.net/itemdex/sprites/sv/hyperpotion.png' },
  { name: 'Max Potion',   sprite: 'https://www.serebii.net/itemdex/sprites/sv/maxpotion.png' },
  { name: 'Full Restore', sprite: 'https://www.serebii.net/itemdex/sprites/sv/fullrestore.png' },
  { name: 'Full Heal',    sprite: 'https://www.serebii.net/itemdex/sprites/sv/fullheal.png' },
];
