const CACHE_NAME = 'miniapp-base-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/miniapp-base/styles.css',
  '/miniapp-base/app.js',
  '/miniapp-base/autosave.js',
  '/miniapp-base/event-bus.js',
  '/miniapp-base/i18n.js',
  '/miniapp-base/miniapps.js',
  '/miniapp-base/preferences.js',
  '/miniapp-base/sdk.js',
  '/miniapp-base/storage.js',
  '/miniapp-base/sync.js',
  '/miniapp-base/components/carousel.js',
  '/miniapp-base/components/carousel.css',
  '/miniapp-base/assets/icons/prefeito.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const cacheStrategy = STATIC_ASSETS.includes(url.pathname) ? 'cache-first' : 'stale-while-revalidate';

  if (cacheStrategy === 'cache-first') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
