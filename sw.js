const CACHE = 'miniapp-shell-v5-demo';

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
  '/miniapp-base/icons/icon-512.png'
];

const RUNTIME_ALLOW = [
  self.location.origin,
  'https://5horas.com.br',
  'https://docs.google.com'
];

const WORDPRESS_ORIGIN = 'https://5horas.com.br';

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const ok = response && (response.ok || response.type === 'opaque');
  if (ok && RUNTIME_ALLOW.includes(new URL(request.url).origin)) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    const ok = response && (response.ok || response.type === 'opaque');
    if (ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

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

self.addEventListener('message', (event) => {
  if (event?.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

  if (url.origin === WORDPRESS_ORIGIN) {
    e.respondWith((async () => {
      try {
        return await networkFirst(e.request);
      } catch {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return Response.error();
      }
    })());
    return;
  }

  // Demais assets: cache-first + runtime fill para origens permitidas
  e.respondWith((async () => {
    try {
      return await cacheFirst(e.request);
    } catch {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      if (e.request.destination === 'image') {
        const fallback = await cache.match('/miniapp-base/icons/icon-192.png');
        if (fallback) return fallback;
      }
      return cached || Response.error();
    }
  })());
});
