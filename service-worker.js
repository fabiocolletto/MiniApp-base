/* global workbox */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

const APP_VERSION = 'v3.4';
const PRECACHE_RESOURCES = [
  { url: './', revision: APP_VERSION },
  { url: './index.html', revision: APP_VERSION },
  { url: './pwa/manifest.webmanifest', revision: APP_VERSION },
  { url: './docs/miniapp-global.css', revision: APP_VERSION },
  { url: './docs/miniapp-card.css', revision: APP_VERSION },
  { url: './docs/miniapp-card.js', revision: APP_VERSION },
  { url: './docs/miniapp-data.js', revision: APP_VERSION },
  { url: './miniapps/catalog/index.html', revision: APP_VERSION },
  { url: './miniapps/catalog/app.js', revision: APP_VERSION },
  { url: './miniapps/favorites/index.html', revision: APP_VERSION },
  { url: './miniapps/recents/index.html', revision: APP_VERSION },
  { url: './miniapps/settings/index.html', revision: APP_VERSION },
  { url: './js/indexeddb-store.js', revision: APP_VERSION },
  { url: './js/googleSync.js', revision: APP_VERSION },
  { url: './assets/icons/icon-192.svg', revision: APP_VERSION },
  { url: './assets/icons/icon-512.svg', revision: APP_VERSION }
];

workbox.precaching.precacheAndRoute(PRECACHE_RESOURCES);

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'miniapp-html',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'miniapp-static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, purgeOnQuotaError: true })
    ]
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://cdn.tailwindcss.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'miniapp-cdn'
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'miniapp-images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, purgeOnQuotaError: true })
    ]
  })
);

const FALLBACK_URL = './index.html';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          return await fetch(event.request);
        } catch (error) {
          return await caches.match(FALLBACK_URL, { ignoreSearch: true });
        }
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
