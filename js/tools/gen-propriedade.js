/* ── Gerador de Propriedade ──────────────────────────────────────────────
   Gera o código HTML de ficha de propriedade do personagem.
   Depende de: ST_PROP_* (constants/property-data.js),
               stCopyText (utils/clipboard.js)
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('genPropriedade', () => ({
    nome:        '',
    endereco:    '',
    dono:        '',
    data:        '',
    descricao:   '',
    capa:        '',
    avatar:      '',
    classe:      '',
    construcaoId:'',
    selecionadas: new Set(),
    meses:       Array(12).fill('pe'), // 'pe' = pendente | 'pp' = pago | 'pa' = atrasado
    code:        '',
    copied:      false,
    _t:          null,

    /* ── Getters computados ── */
    get construcoesDisponiveis() {
      return ST_PROP_CONSTRUCOES.filter(c => c.classes.includes(this.classe));
    },
    get construcaoAtual() {
      return ST_PROP_CONSTRUCOES.find(c => c.id === this.construcaoId) || null;
    },
    get allExpansoes() {
      return [
        ...ST_PROP_EXPANSOES.simples,
        ...ST_PROP_EXPANSOES.complexa,
        ...ST_PROP_EXPANSOES.monumental,
      ];
    },
    get expansoes()       { return ST_PROP_EXPANSOES; },
    get mesesNomes()      { return ST_MESES; },
    get custoTerreno()    { return ST_PROP_CUSTO_TERRENO[this.classe]    || 0; },
    get custoConstrucao() { return this.construcaoAtual?.custo            || 0; },
    get custoExpansoes()  { return this.selecionadas.size * (ST_PROP_CUSTO_EXPANSAO[this.classe] || 0); },
    get total()           { return this.custoTerreno + this.custoConstrucao + this.custoExpansoes; },
    get taxa()            { return Math.round(this.total * 0.1); },
    get limite()          { return this.construcaoAtual?.limite           || 0; },
    get temComplexas()    { return this.construcaoAtual?.complexa         || false; },

    /* ── Handlers ── */
    onClasseChange()     { this.construcaoId = ''; this.selecionadas = new Set(); },
    onConstrucaoChange() { this.selecionadas = new Set(); },

    isSel(id)      { return this.selecionadas.has(id); },
    isDisabled(id) { return !this.selecionadas.has(id) && this.selecionadas.size >= this.limite; },

    toggleExp(id) {
      const s = new Set(this.selecionadas);
      if (s.has(id)) s.delete(id);
      else if (s.size < this.limite) s.add(id);
      this.selecionadas = s;
    },

    /* ── Builders de HTML parcial ── */
    buildExpHtml() {
      let h = '';
      this.selecionadas.forEach(id => {
        const e = this.allExpansoes.find(x => x.id === id);
        if (e) h += `<li class="on"><i class="fas ${e.icon}"></i><div><small>Ativo</small><span>${e.nome}</span></div></li>`;
      });
      for (let i = 0; i < this.limite - this.selecionadas.size; i++) {
        h += `<li><i class="fas fa-plus"></i><div><small>Disponível</small><span>Slot Vazio</span></div></li>`;
      }
      return h;
    },

    buildMesesHtml() {
      return ST_MESES.map((mes, i) => {
        const st    = this.meses[i];
        const icon  = st === 'pp' ? 'fas fa-check' : st === 'pa' ? 'fas fa-triangle-exclamation' : 'far fa-clock';
        const label = st === 'pp' ? 'Pago' : st === 'pa' ? 'Atrasado' : 'Pendente';
        return `<li><em>${mes}</em><b>₽ ${this.taxa.toLocaleString('pt-BR')}</b><span class="prop-st ${st}"><i class="${icon}"></i> ${label}</span></li>`;
      }).join('');
    },

    gerar() {
      const bc = this.classe ? `classe-${this.classe.toLowerCase()}` : '';
      const bt = this.classe ? `Classe ${this.classe}` : '—';
      const tt = this.construcaoAtual?.nome || '—';
      const capaEl   = this.capa   ? `<img src="${this.capa}">` : '';
      const avatarEl = this.avatar ? `<img src="${this.avatar}">` : '';

      this.code = `<div class="prop-wrap">` +
        `<div class="prop-cover">${capaEl}<span class="prop-badge ${bc}">${bt}</span>` +
        `<div class="prop-namelay"><h2>${this.nome}</h2><div class="prop-addr"><i class="fas fa-location-dot"></i> ${this.endereco}</div></div></div>` +
        `<div class="prop-desc-blk"><div class="prop-sec"><i class="fas fa-scroll"></i> Descrição</div><p>${this.descricao}</p></div>` +
        `<div class="prop-owner-bar"><div class="prop-ob-left"><div class="prop-ava">${avatarEl}</div>` +
        `<div class="prop-ob-info"><small>Proprietário</small><strong>${this.dono}</strong></div></div>` +
        `<div class="prop-tipo-tag"><i class="fas fa-building"></i> ${tt}</div></div>` +
        `<div class="prop-body"><div class="prop-sec"><i class="fas fa-circle-info"></i> Informações</div>` +
        `<ul class="prop-grid6">` +
        `<li><small>Data de Compra</small><span>${this.data || '—'}</span></li>` +
        `<li class="phi"><small>Valor Pago</small><span>₽ ${this.total.toLocaleString('pt-BR')}</span></li>` +
        `<li><small>Classe do Terreno</small><span>${bt}</span></li>` +
        `<li><small>Tipo</small><span>${tt}</span></li>` +
        `<li><small>Localização</small><span>${this.endereco}</span></li>` +
        `<li class="phi"><small>Taxa Mensal</small><span>₽ ${this.taxa.toLocaleString('pt-BR')}</span></li></ul>` +
        `<div class="prop-sec"><i class="fas fa-puzzle-piece"></i> Expansões <span class="pcnt">${this.selecionadas.size} / ${this.limite}</span></div>` +
        `<ul class="prop-exp-grid">${this.buildExpHtml()}</ul>` +
        `[spoiler=Taxa de Manutenção]<ul class="prop-mt-wrap">${this.buildMesesHtml()}</ul>[/spoiler]` +
        `</div></div>`;
    },

    copy() {
      if (!this.code) return;
      stCopyText(this.code);
      this.copied = true;
      clearTimeout(this._t);
      this._t = setTimeout(() => this.copied = false, 2000);
    },

    limpar() {
      Object.assign(this, {
        nome: '', endereco: '', dono: '', data: '', descricao: '',
        capa: '', avatar: '', classe: '', construcaoId: '',
        selecionadas: new Set(), meses: Array(12).fill('pe'), code: '',
      });
    },
  }));

});
