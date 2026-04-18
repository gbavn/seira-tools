/**
 * inject.js — Carrega ../index.html e injeta no .teste do shell simulado
 * Arquivo LOCAL apenas — não commitar (listado no .gitignore)
 *
 * Correção principal: todos os hrefs/srcs extraídos de ../index.html são
 * resolvidos contra a URL base daquele documento (raiz do repo), não contra
 * a URL atual (simulator/). Isso evita os erros de MIME e ReferenceError.
 */
;(async function () {

  // ── Aguarda DOM pronto ─────────────────────────────────────────────────
  await new Promise(resolve =>
    document.readyState !== 'loading'
      ? resolve()
      : document.addEventListener('DOMContentLoaded', resolve)
  )

  const target = document.querySelector('.teste')
  if (!target) {
    console.error('[inject] .teste não encontrado no shell do fórum')
    return
  }

  target.innerHTML =
    '<p style="padding:28px;color:#aaa;font-family:Poppins,sans-serif;font-size:13px">Carregando ferramentas…</p>'

  // ── URL base do documento de ferramentas (raiz do repo) ───────────────
  // Ex: http://127.0.0.1:5500/simulator/ → base = http://127.0.0.1:5500/
  const TOOLS_URL = new URL('../index.html', window.location.href).href
  const BASE_URL  = new URL('../', window.location.href).href

  // ── Resolve um atributo (href/src) relativo contra a base do repo ─────
  function resolve (attr) {
    if (!attr) return attr
    // Já absoluto (http, https, //) — não mexe
    if (/^(https?:)?\/\//i.test(attr) || /^https?:/i.test(attr)) return attr
    // Relativo — resolve contra raiz do repo
    try { return new URL(attr, BASE_URL).href } catch { return attr }
  }

  // ── Fetch da página de ferramentas ────────────────────────────────────
  let doc
  try {
    const res = await fetch(TOOLS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`)
    doc = new DOMParser().parseFromString(await res.text(), 'text/html')
  } catch (err) {
    target.innerHTML = `
      <div style="padding:28px;font-family:Poppins,sans-serif;font-size:13px;line-height:1.8">
        <span style="color:#f85888;font-weight:600">Erro ao carregar ferramentas:</span>
        <code style="display:block;margin:8px 0;padding:10px;background:#1c2330;border-radius:6px;color:#e6edf3">${err.message}</code>
        Verifique se o Live Server está ativo e que <code>simulator/index.html</code>
        está sendo servido de dentro da pasta do repo.<br><br>
        URL tentada: <code style="color:#f8d030">${TOOLS_URL}</code>
      </div>`
    return
  }

  // ── Helper: carrega script externo por src ────────────────────────────
  function loadExtScript (src) {
    return new Promise(resolve => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const s = document.createElement('script')
      s.src = src
      s.onload  = resolve
      s.onerror = () => { console.warn('[inject] falhou ao carregar:', src); resolve() }
      document.head.appendChild(s)
    })
  }

  // ── CSS links — resolve hrefs e evita duplicatas ──────────────────────
  const existingHrefs = new Set(
    [...document.querySelectorAll('link[href]')].map(l => l.href)
  )
  for (const link of doc.querySelectorAll('head link[rel="stylesheet"]')) {
    const href = resolve(link.getAttribute('href'))
    if (href && !existingHrefs.has(href)) {
      const el = document.createElement('link')
      el.rel  = 'stylesheet'
      el.href = href
      document.head.appendChild(el)
      existingHrefs.add(href)
    }
  }

  // ── Separa Alpine dos demais scripts externos ─────────────────────────
  const isAlpine = el => /alpinejs/i.test(el.getAttribute('src') || '')
  const allExtScripts = [
    ...doc.querySelectorAll('head script[src]'),
    ...doc.querySelectorAll('body script[src]')
  ]
  const alpineEl     = allExtScripts.find(isAlpine)
  const otherScripts = allExtScripts.filter(s => !isAlpine(s))

  // ── Carrega scripts não-Alpine em sequência, com src resolvido ────────
  for (const s of otherScripts) {
    const src = resolve(s.getAttribute('src'))
    if (src) await loadExtScript(src)
  }

  // ── Scripts inline do <head> (alpine:init — registros de componentes) ─
  for (const s of doc.querySelectorAll('head script:not([src])')) {
    if (!s.textContent.trim()) continue
    const el = document.createElement('script')
    el.textContent = s.textContent
    document.head.appendChild(el)
  }

  // ── Injeta HTML do <body> (sem <script> — tratados separadamente) ─────
  const bodyClone = doc.body.cloneNode(true)
  bodyClone.querySelectorAll('script').forEach(s => s.remove())

  // Resolve srcs/hrefs dentro do HTML injetado
  bodyClone.querySelectorAll('[src]').forEach(el => {
    const src = resolve(el.getAttribute('src'))
    if (src) el.setAttribute('src', src)
  })
  bodyClone.querySelectorAll('[href]').forEach(el => {
    const href = el.getAttribute('href')
    // Não resolve âncoras (#) nem javascript:
    if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
      el.setAttribute('href', resolve(href))
    }
  })

  target.innerHTML = bodyClone.innerHTML

  // ── Scripts inline do <body> (exceto Alpine) ──────────────────────────
  for (const s of doc.querySelectorAll('body script:not([src])')) {
    if (!s.textContent.trim() || isAlpine(s)) continue
    const el = document.createElement('script')
    el.textContent = s.textContent
    document.body.appendChild(el)
  }

  // ── Alpine por último — escaneia o DOM e inicializa todos os x-data ──
  if (alpineEl) {
    const src = resolve(alpineEl.getAttribute('src'))
    if (src) await loadExtScript(src)
  }

  console.info('[inject] ✓ Injetado com sucesso. Base:', BASE_URL)

})()