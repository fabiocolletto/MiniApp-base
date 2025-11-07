(function (root) {
  const REL_BASE = './templates/';
  const MEMO = {};
  const IDX = (root.indexed && root.indexed) || null;

  async function getStore() {
    if (!IDX || !IDX.open) return null;
    if (!IDX.stores?.tpl) {
      await IDX.open('PainelPrefeitoDB', 1, (db, stores) => {
        IDX.stores = stores || IDX.stores || {};
        if (!IDX.stores.tpl) IDX.defineStore('tpl', { keyPath: 'key' });
      });
    }
    return IDX.stores?.tpl || null;
  }

  async function fromIndexed(key) { try { const s = await getStore(); if (!s) return null; const rec = await IDX.get(s, key); return rec?.value || null; } catch { return null; } }
  async function toIndexed(key, value) { try { const s = await getStore(); if (!s) return; await IDX.put(s, { key, value, ts: Date.now() }); } catch {} }

  async function fetchText(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  }

  async function loadTemplate(kind) {
    const file = (kind === 'kpi' ? 'kpi_detail.html' : 'chart_detail.html');
    const key = `tpl:${file}`;
    if (MEMO[key]) return MEMO[key];
    const cached = await fromIndexed(key);
    if (cached) { MEMO[key] = cached; return cached; }
    const txt = await fetchText(REL_BASE + file);
    MEMO[key] = txt;
    toIndexed(key, txt);
    return txt;
  }

  function renderString(tpl, data) {
    tpl = tpl.replace(/{{#each\s+([\w.]+)\s*}}([\s\S]*?){{\/each}}/g, (m, arrKey, inner) => {
      const arr = get(data, arrKey) || [];
      return arr.map(item => renderString(inner, Object.assign({}, data, { this: item }))).join('');
    });
    tpl = tpl.replace(/{{\s*([\w.]+)\s*}}/g, (m, key) => {
      const v = get(data, key);
      return (v === undefined || v === null) ? '' : String(v);
    });
    return tpl;
  }
  function get(obj, path) { return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj); }

  async function openInfo(kind, payload) {
    const host = document.getElementById('info-modal'); if (!host) return;
    const raw = await loadTemplate(kind);
    const html = renderString(raw, payload || {});
    host.innerHTML = `<a class="backdrop" href="#" aria-hidden="true"></a>${html}`;
    try {
      if (root.i18next && typeof root.i18next.t === 'function') {
        host.querySelectorAll('[data-i18n]').forEach(function(n){
          const k=n.getAttribute('data-i18n'); if(k) n.textContent = root.i18next.t(k, payload || {});
        });
      }
    } catch {}
    const close = host.querySelector('.close');
    if (close) close.addEventListener('click', e => { e.preventDefault(); location.hash = ''; });
    location.hash = '#info-modal';
  }

  root.TemplateLoader = { openInfo };
})(window);
