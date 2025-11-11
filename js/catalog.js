(async () => {
  const el = document.getElementById('catalog');
  const items = await loadItems();
  render(items);

  async function loadItems() {
    // 1) Google Sheets (opcional)
    if (window.CATALOG_GOOGLE_SHEET_CSV) {
      try {
        const res = await fetch(window.CATALOG_GOOGLE_SHEET_CSV, { cache: 'no-store' });
        const csv = await res.text();
        const rows = csv.split(/\r?\n/).filter(Boolean).map(r => r.split(','));
        const [header, ...data] = rows;
        const idx = (k) => header.indexOf(k);
        const map = data.map(r => ({
          name: r[idx('name')],
          description: r[idx('description')],
          url: r[idx('url')],
          iconSymbol: r[idx('iconSymbol')] || 'apps',
          iconTheme: r[idx('iconTheme')] || 'brand'
        })).filter(x => x.name && x.url);
        if (map.length) return map;
      } catch (e) { /* continua */ }
    }
    // 2) JSON local
    try {
      const res = await fetch('../catalog.json');
      if (res.ok) return await res.json();
    } catch (e) { /* continua */ }
    // 3) Fallback embutido
    return (window.CATALOG_FALLBACK || []);
  }

  function render(list) {
    if (!Array.isArray(list) || !list.length) {
      el.innerHTML = '<p class="muted">Nenhum MiniApp disponível.</p>';
      return;
    }
    el.innerHTML = list.map(item => card(item)).join('');
    el.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-url]');
      if (!a) return;
      ev.preventDefault();
      const url = a.getAttribute('data-url');
      window.parent.loadMiniApp(url, { title: a.dataset.name, subtitle: a.dataset.description });
    });
  }

  function card({ name, description, url }) {
    return `
      <article class="card">
        <div class="card__body">
          <h3>${escapeHtml(name)}</h3>
          <p class="muted">${escapeHtml(description||'')}</p>
        </div>
        <div class="card__footer cluster">
          <a href="#" class="btn" data-url="${encodeURI(url)}" data-name="${escapeHtml(name)}" data-description="${escapeHtml(description||'')}">Abrir</a>
        </div>
      </article>`;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c]));
  }
})();