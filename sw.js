const CACHE = 'miniapp-shell-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/catalog.json',
  '/js/app.js',
  '/js/catalog.js',
  '/miniapp-base/style/styles.css',
  '/miniapp-catalogo/index.html',
  '/miniapp-prefeito/index.html',
  '/miniapp-prefeito/js/config-source.js',
  '/miniapp-prefeito/data/sample.json'
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
  if (e.request.mode === 'navigate') {
    // Navegações: tenta rede → cache fallback
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        return fresh;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }
  // Assets: cache-first
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    if (cached) return cached;
    try {
      const res = await fetch(e.request);
      if (res && res.ok && url.origin === location.origin) cache.put(e.request, res.clone());
      return res;
    } catch {
      return cached || Response.error();
    }
  })());
});
