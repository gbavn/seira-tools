/* ── Editor de Mochila ───────────────────────────────────────────────────
   Gerencia itens e dinheiro da mochila e gera o código HTML da ficha.
   Depende de: makeItemSearchSlot (hooks/search-factories.js),
               ST_CATEGORY_MAP, ST_CATEGORY_LABELS, ST_CATEGORY_ORDER,
               ST_CATEGORY_ICONS, ST_FIXED_MEDICINAIS (constants/items-meta.js),
               ST_ROTOM_SKINS (constants/misc.js),
               stCopyText (utils/clipboard.js)

   Opções recebidas em Alpine.data('bagEditor', opts):
     allowedCategories  → string[]|null  — filtra categorias visíveis
     fixedMedicinais    → boolean        — trava a aba de medicinais como fixa
     tabPrefix          → string         — prefixo dos IDs de radio das abas
──────────────────────────────────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('bagEditor', (opts = {}) => ({
    items:            Object.fromEntries(ST_CATEGORY_ORDER.map(c => [c, []])),
    allowedCategories: opts.allowedCategories ?? null,
    fixedMedicinais:   opts.fixedMedicinais   ?? false,
    tabPrefix:         opts.tabPrefix         ?? '',
    pokedollars:  5000,
    fichas:       0,
    adjustPd:     100,
    adjustFichas: 10,
    search:       makeItemSearchSlot(),
    rotomSkins:   ST_ROTOM_SKINS,
    importCode:   '',
    code:         '',
    copied:       false,
    _t:           null,

    /* ── Getters ── */
    get pdFormatted()    { return this.pokedollars.toLocaleString('pt-BR'); },
    get fichasFormatted(){ return this.fichas.toLocaleString('pt-BR'); },
    get orderCategoria() { return this.allowedCategories ?? ST_CATEGORY_ORDER; },
    labelFor(cat) { return ST_CATEGORY_LABELS[cat] || cat; },
    iconFor(cat)  { return ST_CATEGORY_ICONS[cat]  || 'gmi-bag'; },

    /* ── Init ── */
    init() {
      Alpine.store('api').load();
      if (this.fixedMedicinais) {
        this.items['itens-medicinais'] = ST_FIXED_MEDICINAIS.map(i => ({
          ...i, quantidade: 'Único', is_unique: true,
        }));
      }
      document.addEventListener('click', e => {
        if (!this.$el.contains(e.target)) this.search.showList = false;
      });
    },

    /* ── Dinheiro ── */
    adjustMoney(field, isAdd) {
      const amt = field === 'pd' ? +this.adjustPd : +this.adjustFichas;
      if (field === 'pd') {
        this.pokedollars = isAdd ? this.pokedollars + amt : Math.max(0, this.pokedollars - amt);
      } else {
        this.fichas = isAdd ? this.fichas + amt : Math.max(0, this.fichas - amt);
      }
    },

    /* ── Adicionar item ── */
    addItem() {
      const sel = this.search.selected;
      if (!sel) { alert('Selecione um item primeiro.'); return; }

      const cat = ST_CATEGORY_MAP[sel.category] || 'outros-itens';
      const allowed = this.allowedCategories;
      if (allowed && !allowed.includes(cat) && !allowed.includes(sel.category)) {
        alert('Categoria não permitida.'); return;
      }
      if (this.fixedMedicinais && cat === 'itens-medicinais') {
        alert('Itens medicinais são fixos.'); return;
      }

      const sprite   = this.search.sprite;
      const qty      = this.search.isUnique ? 'Único' : this.search.qty;
      const existing = this.items[cat]?.findIndex(i => i.name === sel.name && i.sprite === sprite) ?? -1;

      if (existing !== -1 && !this.search.isUnique) {
        const cur = parseInt(this.items[cat][existing].quantidade) || 0;
        this.items[cat][existing].quantidade = (cur + (parseInt(this.search.qty) || 0)).toString();
      } else if (existing === -1) {
        if (!this.items[cat]) this.items[cat] = [];
        this.items[cat].push({ name: sel.name, sprite, quantidade: qty, is_unique: this.search.isUnique });
      } else {
        alert('Item único já existe!');
      }

      this.search.clear();
    },

    removeItem(cat, idx) {
      if (this.fixedMedicinais && cat === 'itens-medicinais') return;
      this.items[cat].splice(idx, 1);
    },

    changeQty(cat, idx) {
      const n = prompt('Nova quantidade:', this.items[cat][idx].quantidade);
      if (n !== null && n !== '') this.items[cat][idx].quantidade = n;
    },

    /* ── Ficha inicial ── */
    loadStarter() {
      this.items = Object.fromEntries(ST_CATEGORY_ORDER.map(c => [c, []]));
      this.items['itens-chave'] = [
        { name: 'Rotom Phone', sprite: 'https://www.serebii.net/scarletviolet/custom/1.png', quantidade: 'Único', is_unique: true },
        { name: 'Fishing Rod', sprite: 'https://2img.net/i.imgur.com/h5wxBk4.png',           quantidade: 'Único', is_unique: true },
      ];
      this.items['itens-medicinais'] = [
        { name: 'Potion',    sprite: 'https://www.serebii.net/itemdex/sprites/sv/potion.png',   quantidade: '5', is_unique: false },
      ];
      this.items['pokebolas'] = [
        { name: 'Poké Ball', sprite: 'https://www.serebii.net/itemdex/sprites/sv/pokeball.png', quantidade: '5', is_unique: false },
      ];
      this.pokedollars = 5000;
      this.fichas      = 0;
    },

    /* ── Importar código ──────────────────────────────────────────────
       Parseia o HTML gerado pelo próprio editor e repopula o estado.
       Cada item é cruzado com o banco (rpg.items) pelo nome: se houver
       correspondência, categoria/sprite/is_unique vêm do banco; senão,
       cai no fallback derivado do próprio HTML. */
    importar() {
      const raw = (this.importCode || '').trim();
      if (!raw) { alert('Cole o código da mochila primeiro.'); return; }

      let doc;
      try {
        doc = new DOMParser().parseFromString(raw, 'text/html');
      } catch (e) {
        alert('Não foi possível ler o código. Verifique se está completo.');
        return;
      }

      if (!doc.querySelector('.mochila-container')) {
        alert('Código inválido: não parece ser uma mochila gerada por esta ferramenta.');
        return;
      }

      const api    = Alpine.store('api');
      const byName = new Map();
      if (api?.ready) api.items.forEach(it => byName.set(it.name.toLowerCase(), it));

      // Reseta o estado (preserva medicinais fixos se aplicável)
      const fresh = Object.fromEntries(ST_CATEGORY_ORDER.map(c => [c, []]));

      // Dinheiro
      const moneySpans = doc.querySelectorAll('.mochila-dinheiro .tabmoney span');
      if (moneySpans[0]) this.pokedollars = parseInt(moneySpans[0].textContent.replace(/[^\d]/g, ''), 10) || 0;
      if (moneySpans[1]) this.fichas      = parseInt(moneySpans[1].textContent.replace(/[^\d]/g, ''), 10) || 0;

      // Itens, por aba de conteúdo
      doc.querySelectorAll('.mochila-tabcontent').forEach(content => {
        // id = `${pref}${cat}-content` → remove sufixo e qualquer prefixo de tab
        let catFromId = (content.id || '').replace(/-content$/, '');
        const known = ST_CATEGORY_ORDER.find(c => catFromId === c || catFromId.endsWith(c));
        catFromId = known || 'outros-itens';

        content.querySelectorAll('.mochila-item').forEach(itemEl => {
          const img = itemEl.querySelector('img');
          if (!img) return; // slot vazio

          // Nome = texto do item sem img e sem span
          const clone = itemEl.cloneNode(true);
          clone.querySelectorAll('img, span').forEach(n => n.remove());
          const nome = clone.textContent.trim();
          if (!nome) return;

          const spanTxt    = itemEl.querySelector('span')?.textContent.trim() || '';
          const htmlUnique = !/\d/.test(spanTxt); // "Único" não tem dígito
          const htmlQty    = htmlUnique ? 'Único' : spanTxt.replace(/x$/i, '').trim();

          // Cruzamento com o banco pelo nome
          const dbItem = byName.get(nome.toLowerCase());
          let cat, sprite, isUnique;
          if (dbItem) {
            cat      = ST_CATEGORY_MAP[dbItem.category] || catFromId;
            sprite   = dbItem.sprite || img.src;
            isUnique = dbItem.is_unique ?? htmlUnique;
          } else {
            cat      = catFromId;
            sprite   = img.src;
            isUnique = htmlUnique;
          }

          // Rotom Phone preserva a skin do código (sprite do HTML, não do banco)
          if (/rotom\s*phone/i.test(nome)) { sprite = img.src; isUnique = true; }

          if (!fresh[cat]) fresh[cat] = [];
          const qty = isUnique ? 'Único' : (htmlQty || '1');
          const dup = fresh[cat].findIndex(i => i.name === nome && i.sprite === sprite);
          if (dup !== -1 && !isUnique) {
            const cur = parseInt(fresh[cat][dup].quantidade, 10) || 0;
            fresh[cat][dup].quantidade = (cur + (parseInt(qty, 10) || 0)).toString();
          } else if (dup === -1) {
            fresh[cat].push({ name: nome, sprite, quantidade: qty, is_unique: isUnique });
          }
        });
      });

      // Medicinais fixos têm precedência sobre o que veio do código
      if (this.fixedMedicinais) {
        fresh['itens-medicinais'] = ST_FIXED_MEDICINAIS.map(i => ({
          ...i, quantidade: 'Único', is_unique: true,
        }));
      }

      this.items = fresh;
      this.gerar();
      this.importCode = '';
    },

    /* ── Geração de código ── */
    gerar() {
      const cats = this.orderCategoria.filter(c => this.items[c]?.length);
      const pd   = this.pokedollars.toLocaleString('pt-BR');
      const pref = this.tabPrefix;

      let code = `<div class="mochila-container"><h4><i class="gmi gmi-backpack"></i> Mochila</h4>`;

      cats.forEach((cat, i) => {
        code += `<input type="radio" name="mochila${pref}-tabs" id="${pref}${cat}" class="mochila-input"${i === 0 ? ' checked' : ''}>`;
      });

      code += `<div class="mochila-dinheiro">` +
        `<div class="tabmoney"><i class="gmi gmi-wallet"></i> Pokedollars: <span>${pd}$</span></div>` +
        `<div class="tabmoney"><i class="gmi gmi-crown-coin"></i> Fichas: <span>${this.fichas}</span></div>` +
        `</div>`;

      code += `<div class="mochila-tabs">`;
      cats.forEach(cat => {
        code += `<label for="${pref}${cat}"><i class="gmi ${this.iconFor(cat)}"></i>${this.labelFor(cat)}</label>`;
      });
      code += `</div><div class="mochila-items">`;

      cats.forEach(cat => {
        const its   = this.items[cat] || [];
        const slots = Math.max(8, its.length);
        code += `<div id="${pref}${cat}-content" class="mochila-tabcontent">`;
        for (let i = 0; i < slots; i++) {
          if (i < its.length) {
            const it  = its[i];
            const qty = it.is_unique ? 'Único' : `${it.quantidade}x`;
            code += `<div class="mochila-item"><img src="${it.sprite}">${it.name}<span>${qty}</span></div>`;
          } else {
            code += `<div class="mochila-item"></div>`;
          }
        }
        code += `</div>`;
      });

      code += `</div></div>`;
      this.code = code;
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
