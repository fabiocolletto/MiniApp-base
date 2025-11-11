;(() => {
  const KEY = 'prefeito.sourceUrl';
  // Opcional: limite de domínios permitidos (deixe [] para aceitar qualquer https)
  const WHITELIST = []; // ex.: ['docs.google.com','lookerstudio.google.com','api.seudominio.com']

  function isValidUrl(u) {
    try {
      const x = new URL(u);
      if (x.protocol !== 'https:') return false;
      if (WHITELIST.length && !WHITELIST.includes(x.hostname)) return false;
      return true;
    } catch { return false; }
  }

  async function testUrl(u, timeoutMs = 4000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
    try {
      const res = await fetch(u, { method: 'GET', cache: 'no-store', signal: ctrl.signal, mode: 'cors' });
      clearTimeout(t);
      return !!res.ok;
    } catch {
      clearTimeout(t);
      return false;
    }
  }

  function getSourceUrl() { return localStorage.getItem(KEY) || ''; }
  function setSourceUrl(u) {
    if (!isValidUrl(u)) throw new Error('URL inválida. Use HTTPS e verifique o domínio.');
    localStorage.setItem(KEY, u);
  }

  async function pickSourceUrl() {
    const current = getSourceUrl();
    const u = prompt('Cole a URL da fonte (HTTPS):', current || 'https://');
    if (!u) return null;
    if (!isValidUrl(u)) { alert('URL inválida.'); return null; }

    const ok = await testUrl(u);
    if (!ok) {
      const go = confirm('Não consegui testar a URL (CORS/offline). Salvar assim mesmo?');
      if (!go) return null;
    }
    setSourceUrl(u);
    alert('Fonte salva.');
    return u;
  }

  function isLikelyDataUrl(u) {
    return /\.json($|\?)/i.test(u) || /\.csv($|\?)/i.test(u);
  }

  window.PrefeitoConfig = {
    getSourceUrl, setSourceUrl, pickSourceUrl, testUrl, isValidUrl, isLikelyDataUrl
  };
})();
