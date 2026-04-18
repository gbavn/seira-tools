/* ── Gerador de Líder de Ginásio ─────────────────────────────────────────
   Gera o código HTML da ficha do líder de ginásio.
   Depende de: ST_TYPES, ST_TYPE_ICONS, ST_TYPE_PT (constants/pokemon-types.js),
               stCopyText (utils/clipboard.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('genLider', () => ({
    nome:            '',
    idade:           '',
    ocupacao:        'Líder de Ginásio',
    origem:          '',
    photoplayer:     '',
    foto:            '',
    tipoSelecionado: '',
    resumo:          '',
    historia:        '',
    pericias:        [
      { id: '', nome: '' },
      { id: '', nome: '' },
      { id: '', nome: '' },
      { id: '', nome: '' },
    ],
    periciaOptions:  [],
    types:           ST_TYPES,
    typeIcons:       ST_TYPE_ICONS,
    typePT:          ST_TYPE_PT,
    code:            '',
    copied:          false,
    _t:              null,

    init() {
      Alpine.store('api').load().then(() => {
        this.periciaOptions = Alpine.store('api').allPerks();
      });
    },

    selectType(t) { this.tipoSelecionado = t; },

    get tipoNome() { return ST_TYPE_PT[this.tipoSelecionado] || ''; },

    gerar() {
      if (!this.nome) { alert('Preencha o nome.'); return; }

      const perHtml = this.pericias
        .filter(p => p.nome)
        .map(p => `<div class="skill" data-pericia-id="${p.id}">${p.nome}</div>`)
        .join('\n');

      this.code = [
        `<div class="tabficha type-${this.tipoSelecionado}">`,
        `  <div class="tabhfi">`,
        `    <div class="tabhdatos">`,
        `      <dato>${this.idade} Anos</dato>`,
        `      <dato>${this.ocupacao}</dato>`,
        `      <dato>${this.origem}</dato>`,
        `      <dato>Líder (${this.tipoNome})</dato>`,
        `      <dato>${this.photoplayer}</dato>`,
        `    </div>`,
        `    <div class="tabhavi"><tabiavi style="background-image:url(${this.foto});"></tabiavi></div>`,
        `    <div class="tabhme"><h5>${this.nome}</h5><div class="fitext">${this.resumo}</div></div>`,
        `  </div>`,
        `  <div class="tabmfi">`,
        `    <h5><i class="gmi gmi-bookshelf"></i>História</h5>`,
        `    <div class="fitext">${this.historia}</div>`,
        `  </div>`,
        `  <div class="tabbfi">`,
        `    <div class="tabbhabi">`,
        `      <h5><i class="gmi gmi-polar-star"></i> Perícias</h5>`,
        `      <div class="tabskills">\n${perHtml}\n</div>`,
        `    </div>`,
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
