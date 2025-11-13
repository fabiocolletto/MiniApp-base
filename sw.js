const CACHE = 'miniapp-shell-v4-demo';

const PRECACHE = [
  '/', '/index.html', '/manifest.webmanifest',
  '/js/app.js', '/js/i18n.js',
  '/miniapp-base/style/styles.css',
  '/miniapp-catalogo/index.html',
  '/miniapp-prefeito/index.html',
  '/miniapp-prefeito/js/config-source-simple.js',
  '/miniapp-prefeito/data/demo_fato_kpi_diario.csv',
  // ícones locais (fallback e PWA)
  '/miniapp-base/icons/icon-192.png',
  '/miniapp-base/icons/icon-512.png',
  // WordPress assets (logos/ícones)
  'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Light-Transparente-2000x500px.webp',
  'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Dark-Transparente-2000x500px.webp',
  'https://5horas.com.br/wp-content/uploads/2025/10/Icone-Light-Transparente-500x500px.webp',
  'https://5horas.com.br/wp-content/uploads/2025/10/Icone-Dark-Transparente-500x500px.webp'
];

const RUNTIME_ALLOW = [
  self.location.origin,
  'https://5horas.com.br',
  'https://docs.google.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Navegação: network-first com fallback ao index
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(e.request); }
      catch {
        const cache = await caches.open(CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Demais assets: cache-first + runtime fill para origens permitidas
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    if (cached) return cached;

    try {
      const res = await fetch(e.request);
      const ok = res && (res.ok || res.type === 'opaque');
      if (ok && RUNTIME_ALLOW.includes(url.origin)) {
        cache.put(e.request, res.clone());
      }
      return res;
    } catch {
      if (e.request.destination === 'image') {
        const fallback = await cache.match('/miniapp-base/icons/icon-192.png');
        if (fallback) return fallback;
      }
      return cached || Response.error();
    }
  })());
});
