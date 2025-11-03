const { location: swLocation } = self;
const swUrl = new URL(swLocation);
const swVersion = swUrl.searchParams.get('v')?.trim() || 'dev';
const CACHE_PREFIX = 'miniapp-white-label::pwa::';
const CACHE_NAME = `${CACHE_PREFIX}${swVersion}`;
const OFFLINE_FALLBACK = './public/offline.html';
const OFFLINE_FALLBACK_URL = new URL(OFFLINE_FALLBACK, swUrl.origin).toString();

const CORE_ASSETS = [
  './index.html',
  './miniapp-base/styles.css',
  './miniapp-base/app.js',
  './miniapp-base/i18n.js',
  './miniapp-base/miniapps.js',
  './miniapp-base/preferences.js',
  './miniapp-base/event-bus.js',
  './miniapp-base/storage.js',
  './miniapps/pesquisas-cidades/index.html',
  './miniapps/pesquisas-cidades/styles.css',
  './miniapps/pesquisas-cidades/app.js',
  './manifest.webmanifest',
  './public/offline.html',
  './public/meta/app-version.json',
  './shared/storage/idb/prefs.js',
  './shared/storage/idb/databases.js',
  './shared/storage/idb/persistence.js',
  './shared/vendor/idb.min.js'
];

const NETWORK_FIRST_PATHS = [];

function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_PATHS.some((path) => url.pathname.endsWith(path));
}

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
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
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
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  event.respondWith(handleAssetRequest(request));
});

async function handleNavigationRequest(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);

  const preloadResponse = await event.preloadResponse;
  if (preloadResponse) {
    cache.put(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    const networkResponse = await fetch(request, { cache: 'no-store' });

    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error(`Navigation response not ok: ${networkResponse?.status}`);
  } catch (error) {
    const offlineFallback = await getOfflineFallback(cache);
    if (offlineFallback) {
      return offlineFallback;
    }

    const cachedNavigation = await cache.match(request);
    if (cachedNavigation) {
      return cachedNavigation;
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
  const requestUrl = new URL(request.url);

  if (shouldUseNetworkFirst(requestUrl)) {
    try {
      const networkResponse = await fetch(request, { cache: 'no-store' });
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      console.warn('Network-first falhou para', requestUrl.pathname, error);
    }

    const fallbackCached = await cache.match(request);
    if (fallbackCached) {
      return fallbackCached;
    }

    return new Response('Conteúdo temporariamente indisponível.', {
      status: 503,
      statusText: 'Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

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
    const offlineFallback = await getOfflineFallback(cache);
    if (offlineFallback && request.destination === 'document') {
      return offlineFallback;
    }
    return new Response('Conteúdo indisponível offline.', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function getOfflineFallback(cache) {
  return (
    (await cache.match(OFFLINE_FALLBACK_URL)) ??
    (await cache.match(OFFLINE_FALLBACK)) ??
    null
  );
}
