// Nome da cache e lista de arquivos a serem cacheados (App Shell)
const CACHE_NAME = 'miniapp-5horas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pwa/manifest.json',
  'https://cdn.tailwindcss.com' 
  // Nota: Imagens dos produtos (placeholders) não serão cacheadas,
  // apenas o shell principal.
];

// Instalação do Service Worker e cache dos arquivos estáticos
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando e cacheadando App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta requisições: Cache First (servir do cache se disponível)
self.addEventListener('fetch', event => {
  // Ignora requisições que não sejam GET (ex: POST, PUT)
  if (event.request.method !== 'GET') {
    return;
  }

  // Intercepta a requisição e tenta encontrar a resposta na cache
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se a resposta estiver na cache, retorna ela
        if (response) {
          console.log(`[Service Worker] Servindo do cache: ${event.request.url}`);
          return response;
        }
        
        // Se não estiver na cache, faz a requisição normal à rede
        console.log(`[Service Worker] Buscando na rede: ${event.request.url}`);
        return fetch(event.request);
      })
  );
});

// Limpeza de caches antigas para evitar lixo
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deletando cache antiga: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
