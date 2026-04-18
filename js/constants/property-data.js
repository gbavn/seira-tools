/* ── Sistema de Propriedades ─────────────────────────────────────────────
   ST_PROP_CONSTRUCOES   → tipos de construção disponíveis
   ST_PROP_CUSTO_TERRENO → custo do terreno por classe
   ST_PROP_CUSTO_EXPANSAO → custo por expansão por classe
   ST_PROP_EXPANSOES     → expansões disponíveis (simples / complexa / monumental)
   ST_MESES              → nomes dos meses em português
──────────────────────────────────────────────────────────────────────── */

const ST_PROP_CONSTRUCOES = [
  { id: 'studio',  nome: 'Studio / Chalé / Loft',  custo:  5000, limite:  2, complexa: false, classes: ['D','C','B','A','S'] },
  { id: 'pequena', nome: 'Construção Pequena',       custo:  7000, limite:  5, complexa: false, classes: ['C','B','A','S'] },
  { id: 'media',   nome: 'Construção Média',          custo: 15000, limite:  7, complexa: true,  classes: ['C','B','A','S'] },
  { id: 'grande',  nome: 'Construção Grande',         custo: 50000, limite: 10, complexa: true,  classes: ['C','B','A','S'] },
  { id: 'fazenda', nome: 'Fazenda',                   custo: 10000, limite:  2, complexa: false, classes: ['C','B'] },
];

const ST_PROP_CUSTO_TERRENO = {
  D:  5000,
  C:  7000,
  B: 10000,
  A: 25000,
  S: 50000,
};

const ST_PROP_CUSTO_EXPANSAO = {
  D:  1000,
  C:  1400,
  B:  2000,
  A:  5000,
  S: 10000,
};

const ST_PROP_EXPANSOES = {
  simples: [
    { id: 'seg-simples',   nome: 'Sistema de Segurança', icon: 'fa-shield-halved' },
    { id: 'sala-treino',   nome: 'Sala de Treinamento',  icon: 'fa-dumbbell' },
    { id: 'enfermaria',    nome: 'Enfermaria',            icon: 'fa-kit-medical' },
    { id: 'computador',    nome: 'Computador',            icon: 'fa-computer' },
    { id: 'cozinha',       nome: 'Cozinha Gourmet',       icon: 'fa-utensils' },
    { id: 'pomar',         nome: 'Pomar de Berries',      icon: 'fa-apple-whole' },
    { id: 'jardim',        nome: 'Jardim de Apricorns',   icon: 'fa-seedling' },
    { id: 'sala-jogos',    nome: 'Sala de Jogos',         icon: 'fa-gamepad' },
    { id: 'biblioteca',    nome: 'Biblioteca',            icon: 'fa-book' },
    { id: 'comodo-prof',   nome: 'Cômodo Profissional',   icon: 'fa-briefcase' },
    { id: 'energia-solar', nome: 'Placa Solar',           icon: 'fa-solar-panel' },
    { id: 'berry-crusher', nome: 'Berry Crusher',         icon: 'fa-blender' },
  ],
  complexa: [
    { id: 'heliporto',     nome: 'Heliporto',            icon: 'fa-helicopter' },
    { id: 'seg-robusto',   nome: 'Seg. Robusta',         icon: 'fa-shield' },
    { id: 'baia-rep',      nome: 'Baia de Reprodução',   icon: 'fa-heart' },
    { id: 'armazem',       nome: 'Armazém',               icon: 'fa-warehouse' },
    { id: 'estufa',        nome: 'Estufa',                icon: 'fa-leaf' },
    { id: 'lago',          nome: 'Lago',                  icon: 'fa-water' },
    { id: 'trigo',         nome: 'Plantação de Trigo',   icon: 'fa-wheat-awn' },
    { id: 'canavial',      nome: 'Canavial',              icon: 'fa-seedling' },
    { id: 'arroz',         nome: 'Plantação de Arroz',   icon: 'fa-bowl-rice' },
    { id: 'poco',          nome: 'Poço Artesiano',        icon: 'fa-droplet' },
    { id: 'turbina',       nome: 'Turbina Eólica',        icon: 'fa-wind' },
    { id: 'campo-batalha', nome: 'Campo de Batalha',     icon: 'fa-swords' },
  ],
  monumental: [
    { id: 'criadouro',   nome: 'Criadouro de Luxo',    icon: 'fa-star' },
    { id: 'taxi-aereo',  nome: 'Táxi Aéreo',            icon: 'fa-plane' },
    { id: 'santuario',   nome: 'Santuário Lendário',    icon: 'fa-place-of-worship' },
  ],
};

const ST_MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
