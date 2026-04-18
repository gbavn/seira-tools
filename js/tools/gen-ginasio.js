/* ── Gerador de Ginásio ──────────────────────────────────────────────────
   Gera o código HTML da ficha de ginásio (arena, palco, banco de 12 Pokémon).
   Depende de: makePokemonSearchSlot (hooks/search-factories.js),
               ST_TYPES, ST_TYPE_ICONS, ST_TYPE_PT, ST_TYPE_INSIGNIAS (constants/pokemon-types.js),
               stFormatName (utils/format.js),
               stCopyText (utils/clipboard.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('genGinasio', () => ({
    tipoSelecionado: '',
    arenaImg:     '',
    arenaNome:    '',
    arenaDesc:    '',
    palcoImg:     '',
    palcoNome:    '',
    palcoDesc:    '',
    batalhaDesc:  '',
    concursoDesc: '',
    desafioDesc:  '',
    types:        ST_TYPES,
    typeIcons:    ST_TYPE_ICONS,
    typePT:       ST_TYPE_PT,
    // 12 slots independentes — gen adicionado após criação para preservar getters
    slots: Array.from({ length: 12 }, () => {
      const s = makePokemonSearchSlot({ maxResults: 8 });
      s.gen = '';
      return s;
    }),
    code:    '',
    copied:  false,
    _t:      null,

    init() {
      Alpine.store('api').load();
      document.addEventListener('click', e => {
        if (!this.$el.contains(e.target)) {
          this.slots.forEach(s => s.showList = false);
        }
      });
    },

    selectType(t) { this.tipoSelecionado = t; },

    onSlotGenChange(i) { this.slots[i].clear(); },

    slotArtwork(i) { return this.slots[i].artwork; },

    gerar() {
      const ins = ST_TYPE_INSIGNIAS[this.tipoSelecionado] || { badge: '', ribbon: '', medal: '' };

      const pkHtml = this.slots
        .filter(s => s.selected)
        .map(s => `<div class="pokemon-item"><img src="${s.artwork}" title="${stFormatName(s.selected.name)}" class="pokemon-img"></div>`)
        .join('\n');

      this.code = [
        `<div class="tabarena type-${this.tipoSelecionado}">`,
        `  <div class="tabharena"><h3><i class="gmi gmi-base-dome"></i>Instalações</h3></div>`,
        `  <div class="tabarenalocais">`,
        `    <div class="arenalocal">`,
        `      <div class="arenalocal-img" style="background-image:url('${this.arenaImg}');"></div>`,
        `      <div class="arenalocal-header"><i class="gmi gmi-crossed-swords"></i>`,
        `        <div class="arenalocal-titles"><h4>Arena de Batalha</h4><h5>${this.arenaNome}</h5></div>`,
        `      </div>`,
        `      <div class="arenatext">${this.arenaDesc}</div>`,
        `    </div>`,
        `    <div class="arenalocal">`,
        `      <div class="arenalocal-img" style="background-image:url('${this.palcoImg}');"></div>`,
        `      <div class="arenalocal-header"><i class="gmi gmi-microphone"></i>`,
        `        <div class="arenalocal-titles"><h4>Palco de Shows</h4><h5>${this.palcoNome}</h5></div>`,
        `      </div>`,
        `      <div class="arenatext">${this.palcoDesc}</div>`,
        `    </div>`,
        `  </div>`,
        `  <div class="tabrequisitos">`,
        `    <h3><i class="gmi gmi-trophy"></i>Prova de Valor</h3>`,
        `    <div class="prova-linha">`,
        `      <div class="insignia-item"><div class="insignia-img" style="background-image:url('${ins.badge}');"></div></div>`,
        `      <div class="prova-desc"><h4>Batalha de Ginásio</h4><div class="arenatext">${this.batalhaDesc}</div></div>`,
        `    </div>`,
        `    <div class="prova-linha reverse">`,
        `      <div class="prova-desc"><h4>Batalha de Concurso</h4><div class="arenatext">${this.concursoDesc}</div></div>`,
        `      <div class="insignia-item"><div class="insignia-img" style="background-image:url('${ins.ribbon}');"></div></div>`,
        `    </div>`,
        `    <div class="prova-linha">`,
        `      <div class="insignia-item"><div class="insignia-img" style="background-image:url('${ins.medal}');"></div></div>`,
        `      <div class="prova-desc"><h4>Desafio do Líder</h4><div class="arenatext">${this.desafioDesc}</div></div>`,
        `    </div>`,
        `  </div>`,
        `  <div class="tabbanco">`,
        `    <h3><i class="gmi gmi-pokecog"></i>Banco do Ginásio</h3>`,
        `    <div class="pokemon-grid">\n${pkHtml}</div>`,
        `  </div>`,
        `</div>`,
      ].join('\n');
    },

    copy() {
      if (!this.code) return;
      stCopyText(this.code);
      this.copied = true;
      clearTimeout(this._t);
      this._t = setTimeout(() => this.copied = false, 2000);
    },
  }));

});
