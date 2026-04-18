/* ── Miscelânea ──────────────────────────────────────────────────────────
   ST_API        → endpoints JSON (pokemon e perks ainda não no Supabase)
   ST_GEN_LIMITS → offset e limite de cada geração no índice de pokémon
   ST_HIDDEN_IDS → IDs de pokémon ocultos da SeiraDex
   ST_ROTOM_SKINS → skins disponíveis para o Rotom Phone
──────────────────────────────────────────────────────────────────────── */

// TODO: remover quando rpg.pokemon e rpg.perks migrarem pro Supabase
const ST_API = {
  pokemon: 'https://raw.githubusercontent.com/gbavn/seira-database/refs/heads/main/database/pokemon.json',
  perks:   'https://raw.githubusercontent.com/gbavn/seira-database/main/database/perks.json',
};

const ST_GEN_LIMITS = {
  1: { offset: 0,   limit: 151 },
  2: { offset: 151, limit: 100 },
  3: { offset: 251, limit: 135 },
  4: { offset: 386, limit: 107 },
  5: { offset: 493, limit: 156 },
  6: { offset: 649, limit:  72 },
  7: { offset: 721, limit:  88 },
  8: { offset: 809, limit:  96 },
  9: { offset: 905, limit: 120 },
};

const ST_HIDDEN_IDS = [
  10072,10073,10074,10075,10076,10077,10078,10079,10080,10081,
  10082,10083,10084,10085,10086,10087,10088,10092,10093,10094,
  10551,10552,10553,12015,
];

const ST_ROTOM_SKINS = [
  { nome: 'Padrão',   imagem: 'https://www.serebii.net/scarletviolet/custom/1.png' },
  { nome: 'Black',    imagem: 'https://www.serebii.net/scarletviolet/custom/21.png' },
  { nome: 'Blue',     imagem: 'https://www.serebii.net/scarletviolet/custom/6.png' },
  { nome: 'Dark',     imagem: 'https://www.serebii.net/scarletviolet/custom/35.png' },
  { nome: 'Dragon',   imagem: 'https://www.serebii.net/scarletviolet/custom/39.png' },
  { nome: 'Electric', imagem: 'https://www.serebii.net/scarletviolet/custom/25.png' },
  { nome: 'Fairy',    imagem: 'https://www.serebii.net/scarletviolet/custom/36.png' },
  { nome: 'Fire',     imagem: 'https://www.serebii.net/scarletviolet/custom/24.png' },
  { nome: 'Ghost',    imagem: 'https://www.serebii.net/scarletviolet/custom/31.png' },
  { nome: 'Grass',    imagem: 'https://www.serebii.net/scarletviolet/custom/22.png' },
  { nome: 'Green',    imagem: 'https://www.serebii.net/scarletviolet/custom/3.png' },
  { nome: 'Ice',      imagem: 'https://www.serebii.net/scarletviolet/custom/34.png' },
  { nome: 'Normal',   imagem: 'https://www.serebii.net/scarletviolet/custom/26.png' },
  { nome: 'Pikachu',  imagem: 'https://www.serebii.net/scarletviolet/custom/47.png' },
  { nome: 'Pink',     imagem: 'https://www.serebii.net/scarletviolet/custom/5.png' },
  { nome: 'Poison',   imagem: 'https://www.serebii.net/scarletviolet/custom/37.png' },
  { nome: 'Psychic',  imagem: 'https://www.serebii.net/scarletviolet/custom/30.png' },
  { nome: 'Purple',   imagem: 'https://www.serebii.net/scarletviolet/custom/4.png' },
  { nome: 'Rock',     imagem: 'https://www.serebii.net/scarletviolet/custom/33.png' },
  { nome: 'Steel',    imagem: 'https://www.serebii.net/scarletviolet/custom/38.png' },
  { nome: 'Water',    imagem: 'https://www.serebii.net/scarletviolet/custom/23.png' },
  { nome: 'White',    imagem: 'https://www.serebii.net/scarletviolet/custom/20.png' },
  { nome: 'Yellow',   imagem: 'https://www.serebii.net/scarletviolet/custom/2.png' },
];
