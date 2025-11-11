(() => {
  const panel = document.getElementById('miniapp-panel');
  const headerTitle = document.querySelector('[data-header-title]');
  const headerSubtitle = document.querySelector('[data-header-subtitle]');
  const openCatalogBtn = document.getElementById('openCatalog');
  const installBtn = document.getElementById('installPWA');

  function loadMiniApp(url, meta = {}) {
    if (meta.title) headerTitle.textContent = meta.title;
    if (meta.subtitle) headerSubtitle.textContent = meta.subtitle;
    panel.src = url;
    try { localStorage.setItem('miniapp-shell.last', url); } catch {}
  }
  window.loadMiniApp = loadMiniApp;

  // Restaurar último miniapp
  try {
    const last = localStorage.getItem('miniapp-shell.last');
    if (last) panel.src = last;
  } catch {}

  // Botão do catálogo
  openCatalogBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadMiniApp('miniapp-catalogo/index.html', { title: 'Catálogo de MiniApps', subtitle: 'Escolha um MiniApp para abrir' });
  });

  // Mensagens dos miniapps
  window.addEventListener('message', (ev) => {
    const data = ev.data;
    if (!data) return;
    if (data === 'open-catalog') {
      loadMiniApp('miniapp-catalogo/index.html', { title: 'Catálogo de MiniApps', subtitle: 'Escolha um MiniApp para abrir' });
    } else if (data.action === 'load-miniapp') {
      loadMiniApp(data.url, data.metadata || {});
    } else if (data.action === 'miniapp-header') {
      if (data.title) headerTitle.textContent = data.title;
      if (data.subtitle) headerSubtitle.textContent = data.subtitle;
    }
  });

  // PWA — instalar
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
})();
