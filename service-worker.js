const { location: swLocation } = self;
const swUrl = new URL(swLocation);
const swVersion = swUrl.searchParams.get('v')?.trim() || 'dev';
const CACHE_PREFIX = 'miniapp-base::pwa::';
const CACHE_NAME = `${CACHE_PREFIX}${swVersion}`;
const OFFLINE_FALLBACK = './index.html';

const CORE_ASSETS = [
  './index.html',
  './styles/tokens.css',
  './styles/main.css',
  './package.json',
  './public/manifest.json',
  './public/icons/miniapp-icon-192.svg',
  './public/icons/miniapp-icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== swUrl.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  event.respondWith(handleAssetRequest(request));
});

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const fallback = await cache.match(OFFLINE_FALLBACK);
    if (fallback) {
      return fallback;
    }
    return new Response('Aplicativo indisponível offline.', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const fallback = await cache.match(OFFLINE_FALLBACK);
    if (fallback && request.destination === 'document') {
      return fallback;
    }
    return new Response('Conteúdo indisponível offline.', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
