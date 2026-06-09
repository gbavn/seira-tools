# Seira Tools — Contexto do Projeto

> Última atualização: 2026-06
> Repositório: github.com/gbavn/seira-tools (público)
> CDN de produção: jsDelivr (`https://cdn.jsdelivr.net/gh/gbavn/seira-tools@latest/...`)

---

## Visão Geral

**Seira Tools** é o conjunto de ferramentas auxiliares do **Seira RPG** (comunidade Pokémon RPG no fórum Forumeiros). É um app **Alpine.js + HTML + CSS** sem build step — todos os scripts são carregados via `<script>` puro e o estado vive em `Alpine.data` / `Alpine.store`.

As ferramentas servem para calcular experiência, gerar BBcode/HTML de fichas (Pokémon, propriedades, líderes, ginásios) e editar a mochila do personagem. O resultado de cada ferramenta é um bloco de código que o jogador copia e cola no fórum.

Não confundir com o **Helix OS** (`github.com/gbavn/hxOS`), que é o app React/Vite principal da comunidade. O Seira Tools é independente e roda como página standalone dentro do fórum.

---

## Dois Modos de Execução

O mesmo conjunto de ferramentas roda em dois contextos, e isso define como os assets são referenciados:

| Arquivo | Contexto | CSS | Scripts |
|---|---|---|---|
| `index.html` | **Desenvolvimento local** | `./seira-tools-base.css` + `./forum.css` | `./js/...` (caminhos relativos) |
| `ferramentas.html` | **Produção no fórum** | `https://cdn.jsdelivr.net/.../seira-tools-base.css` (CDN) | `https://cdn.jsdelivr.net/.../js/...` (CDN) |

**Por que dois arquivos:**

- `index.html` é aberto direto no disco/servidor de dev. Usa caminhos relativos para iterar sem depender do CDN, e carrega o `forum.css` localmente para simular o ambiente do fórum.
- `ferramentas.html` é o que se **cola como uma página no fórum**. O fórum já injeta o próprio início/fim de página e o seu CSS global, então:
  - **`forum.css` NÃO é incluído** na versão de produção — o fórum já fornece esse estilo.
  - Só o `seira-tools-base.css` (estilos específicos da ferramenta) é puxado via CDN.
  - Todos os scripts vêm do jsDelivr apontando para `@latest`.
- O `<style>` inline da página (no `<head>`) é idêntico nos dois arquivos — são as regras `.st-*` específicas desta tela que não pertencem ao CSS base.

> Ao editar o markup das ferramentas, alterar **ambos** os HTML (ou editar `index.html` e regenerar `ferramentas.html` trocando os paths locais por CDN e removendo o `<link>` do `forum.css`).

---

## Estrutura de Arquivos

```
seira-tools/
├── index.html               → versão DEV (paths locais)
├── ferramentas.html         → versão FÓRUM (paths CDN, sem forum.css)
├── seira-tools-base.css      → estilos específicos das ferramentas (.st-*)
├── forum.css                 → cópia local do CSS do fórum (só p/ dev)
├── README.md
├── seira-tools-context.md    → este arquivo
├── js/
│   ├── supabase.js           → cria o client global `stDb`
│   ├── constants/
│   │   ├── exp-tables.js      → ST_EXP_TABLE, ST_EXP_PERSONAGEM
│   │   ├── pokemon-types.js   → ST_TYPES, ST_TYPE_PT, ST_TYPE_ICONS, ST_TYPE_INSIGNIAS
│   │   ├── items-meta.js      → ST_CATEGORY_MAP/LABELS/ORDER/ICONS, ST_FIXED_MEDICINAIS
│   │   ├── property-data.js   → ST_PROP_* (construções, custos, expansões), ST_MESES
│   │   └── misc.js            → ST_API, ST_GEN_LIMITS, ST_HIDDEN_IDS, ST_ROTOM_SKINS
│   ├── utils/
│   │   ├── format.js          → stFormatName, stSlugifyBall
│   │   ├── exp.js             → stCalcNivelPokemon, stMakeSlotBatalha, stMakeSlotRP
│   │   └── clipboard.js       → stCopyText
│   ├── stores/
│   │   └── api.store.js       → Alpine.store('api') — cache central de dados do RPG
│   ├── hooks/
│   │   └── search-factories.js → makePokemonSearchSlot, makeItemSearchSlot, makeMoveSearchSlot
│   └── tools/
│       ├── nav.js             → Alpine.data('toolNav') — navegação entre ferramentas
│       ├── calc-rp.js         → Calculadora de Roleplay
│       ├── calc-batalha.js    → Calculadora de Batalha
│       ├── calc-personagem.js → Calculadora de Personagem
│       ├── gen-pokemon.js     → Gerador de Pokémon
│       ├── gen-propriedade.js → Gerador de Propriedades
│       ├── gen-lider.js       → Gerador de Líder
│       ├── gen-ginasio.js     → Gerador de Ginásio
│       └── bag-editor.js      → Editor de Mochila
└── simulator/                → utilitário separado (injeção/preview + purge de CDN)
```

---

## Ordem de Carregamento dos Scripts (OBRIGATÓRIA)

A ordem importa porque não há módulos ES — tudo é global e depende do que foi definido antes:

```
1. supabase-js (CDN UMD)        → expõe `supabase`
2. js/supabase.js               → cria `stDb` usando `supabase`
3. js/constants/*               → todas as constantes ST_*
4. js/utils/*                   → funções puras st*
5. js/stores/api.store.js       → registra Alpine.store('api')
6. js/hooks/search-factories.js → fábricas de slots de busca
7. js/tools/*                   → cada ferramenta (Alpine.data)
8. alpinejs (CDN, com defer)    → SEMPRE por último
```

Alpine entra por último com `defer` para que todos os `Alpine.data(...)` e `Alpine.store(...)` já estejam registrados nos listeners `alpine:init` quando ele inicializar.

---

## Convenções

- **Prefixo `st`/`ST_`** em tudo que é global, para não colidir com o escopo do fórum: constantes em `ST_MAIUSCULAS`, funções utilitárias em `stCamelCase`, classes CSS em `.st-*`, IDs/atributos da ferramenta com prefixo `st-`.
- **`x-cloak`** em todos os blocos de ferramenta, escondidos até o Alpine montar (`[x-cloak] { display: none !important; }`).
- **Sem build step**: nada de bundler, nada de import/export. Editar um `.js` e dar push já atualiza (após o CDN propagar — ver "Cache do CDN" abaixo).
- **Idioma**: PT-BR na UI; slugs de tipo e nomes de Pokémon/itens/moves em inglês (como vêm do banco).

---

## Dados (Store `api`)

`Alpine.store('api')` é o cache central, carregado sob demanda (`.load()` é chamado ao selecionar uma ferramenta no `toolNav`). Origem mista hoje:

| Dado | Origem atual | Observação |
|---|---|---|
| `items` | Supabase `rpg.items` | |
| `moves` | Supabase `rpg.moves` | |
| `config` | Supabase `rpg.config` | usado p/ IDs ocultos extras |
| `pokemon` | JSON no GitHub (`seira-database`) | **TODO**: migrar p/ `rpg.pokemon` |
| `perks` | JSON no GitHub (`seira-database`) | **TODO**: migrar p/ `rpg.perks` |

**Client Supabase** (`js/supabase.js`): expõe `stDb`, usando a anon key do projeto `mbxvigdckqosjnwuwdej`. Consultas usam `.schema('rpg')` explicitamente.

**Helpers do store:** `pokemonBase()`, `pokemonByGen(gen)`, `formsOf(baseId)`, `allPerks()`.

> Enquanto `pokemon` vier do JSON, o campo de forma é `form_of` (não `base_pokemon_id`) e a geração é derivada por `ST_GEN_LIMITS` (offset/limit). Ao migrar para Supabase, trocar para `base_pokemon_id === null`.

---

## Hooks de Busca (`search-factories.js`)

Fábricas que criam um slot de autocomplete com estado próprio, reutilizadas dentro das ferramentas para não duplicar lógica:

- **`makePokemonSearchSlot({ maxResults })`** — busca por geração; ao selecionar, popula `forms` (exclui formas de gênero); getter `artwork` respeita forma selecionada.
- **`makeItemSearchSlot({ allowedCategories, maxResults })`** — busca em `items`, filtrável por categoria; trata Rotom Phone (skins) e itens únicos (`isUnique`).
- **`makeMoveSearchSlot({ maxResults })`** — busca em `moves`, com `tag` (`normal`/`tm`/`em`).

---

## As Ferramentas

Navegação gerida por `Alpine.data('toolNav')` (`active` define a tela; default `calc-batalha`). Cada ferramenta é um `Alpine.data` próprio.

### Calculadoras

- **`calcRP` — Calculadora de Roleplay**
  EXP por Pokémon = `(70 × rank × nível × 0.25) × MET / participantes`, onde `rank = 1 + (nívelTreinador − 1) × 0.1`. MET aplica bônus de Domador (cap 35%) e multiplicador de evento. Valor fixo sobrescreve o cálculo. Usa `stCalcNivelPokemon` para projetar nível/EXP resultantes.

- **`calcBatalha` — Calculadora de Batalha**
  EXP = `(BaseEXP × nível / 4.5 / participantes) × MC × MET`. `BaseEXP` vem do `base_experience` do Pokémon inimigo (selecionado por busca); `MC` é o tipo de confronto (selvagem 1×, treinador 1.5×, líder 1.8×); MET aplica Lucky Egg (×1.5), Domador e evento.

- **`calcPersonagem` — Calculadora de Personagem**
  Avanço do treinador por postagem: base **3 EXP** + bônus. Usa `ST_EXP_PERSONAGEM` (níveis 1–25, cap em 25).

### Geradores (saída = código p/ colar no fórum)

- **`genPokemon` — Gerador de Pokémon**: ficha completa em BBcode. Modos `normal` / `starter` / `ovo` / `selvagem` (starter e ovo travam nível/EXP/itens). Espécie, forma regional, gênero, habilidade, pokébola, movimentos (6 slots com tag normal/TM/EM), status treinados, OT, particularidades.
- **`genPropriedade` — Gerador de Propriedades**: ficha HTML de propriedade. Classe do terreno (D–S), tipo de construção, expansões (simples/complexa/monumental) limitadas por slots, custo calculado (terreno + construção + expansões) e controle mensal de manutenção (pendente/pago/atrasado).
- **`genLider` — Gerador de Líder**: ficha HTML de líder de ginásio. Dados pessoais, tipo do ginásio (ícone), até 4 perícias (de `allPerks()`), resumo e história.
- **`genGinasio` — Gerador de Ginásio**: ficha HTML do ginásio. Tipo, arena de batalha, palco de shows, provas de valor e banco de 12 Pokémon (cada slot com geração + busca + forma).

### Editores

- **`bagEditor` — Editor de Mochila**: gerencia dinheiro (Pokédollars e Fichas) e itens por categoria, gerando o HTML da mochila. Opções: `allowedCategories`, `fixedMedicinais` (trava aba de consumíveis com os itens de `ST_FIXED_MEDICINAIS`), `tabPrefix`. Suporta skin do Rotom Phone e itens únicos.

> Itens marcados como **"em breve"** na navegação: Gerador de NPC e Editor de NPC.

---

## Constantes de Referência

- **EXP**: `ST_EXP_TABLE` (EXP por nível de Pokémon, índice = nível, até 100) e `ST_EXP_PERSONAGEM` (acumulada por nível de treinador, até 25).
- **Tipos**: `ST_TYPES` (18 slugs EN), `ST_TYPE_PT` (tradução), `ST_TYPE_ICONS` (SVGs do repo `gbavn/Seira-Icons`), `ST_TYPE_INSIGNIAS` (badge/ribbon/medal por tipo).
- **Itens**: `ST_CATEGORY_MAP` (categoria DB → slug interno), `ST_CATEGORY_LABELS`, `ST_CATEGORY_ORDER`, `ST_CATEGORY_ICONS` (ícones `gmi-*`), `ST_FIXED_MEDICINAIS`.
- **Propriedades**: `ST_PROP_CONSTRUCOES` (id, custo, limite de slots, se tem expansão complexa, classes válidas), `ST_PROP_CUSTO_TERRENO`, `ST_PROP_CUSTO_EXPANSAO`, `ST_PROP_EXPANSOES` (simples/complexa/monumental), `ST_MESES`.
- **Misc**: `ST_API` (endpoints JSON temporários de pokemon/perks), `ST_GEN_LIMITS` (offset/limit por geração), `ST_HIDDEN_IDS` (Pokémon ocultos da dex), `ST_ROTOM_SKINS`.

---

## Cache do CDN (jsDelivr)

A versão de produção (`ferramentas.html`) aponta para `@latest` no jsDelivr, que tem cache agressivo. Após dar push num `.js` ou no CSS, a mudança **não aparece instantaneamente** no fórum — é preciso purgar o cache do jsDelivr para os arquivos alterados. A pasta `simulator/` inclui `purge-cdn.yml` (workflow) para isso.

---

## TODOs Conhecidos

- Migrar `pokemon` e `perks` do JSON (`seira-database`) para o Supabase (`rpg.pokemon`, `rpg.perks`) e ajustar `pokemonBase()` para `base_pokemon_id === null`.
- Implementar Gerador de NPC e Editor de NPC (marcados como "em breve").
