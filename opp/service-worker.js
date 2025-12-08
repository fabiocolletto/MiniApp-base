// =============================================================
// SERVICE-WORKER.JS – OPP (Organic Progressive Package)
// =============================================================
// Este service worker foi projetado para o PWAO.
// Ele sabe lidar com:
//  - cache do Genoma
//  - cache de Células
//  - cache de Órgãos
//  - cache de Datasets externos
//  - atualização orgânica
// =============================================================

const CACHE_NAME = "opp-cache-v1";

// LISTA INICIAL DE ARQUIVOS QUE DEVEM SER SEMPRE CACHEADOS
const FILES_TO_CACHE = [
  "/index.html",            // Genoma
  "/opp/manifest.webmanifest",
  "/opp/icon-192.png",
  "/opp/icon-512.png"
];

// =============================================================
// INSTALAÇÃO – PREPARA O AMBIENTE
// =============================================================
self.addEventListener("install", (event) => {
  console.log("📦 OPP Service Worker: instalado");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// =============================================================
// ATIVAÇÃO – LIMPA CACHES ANTIGOS
// =============================================================
self.addEventListener("activate", (event) => {
  console.log("🔄 OPP Service Worker: ativado");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removendo cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// =============================================================
// ESTRATÉGIA DE BUSCA – CACHE DINÂMICO ORGÂNICO
// =============================================================
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Ignora chamadas externas (Google, CDN etc.)
  const mesmaOrigem = url.startsWith(self.location.origin);
  if (!mesmaOrigem) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // ✔ Encontrado no cache – retorna rápido
        console.log("📚 Cache hit:", url);
        return cachedResponse;
      }

      // ❌ Não está em cache – busca na rede e salva
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Só cacheia respostas válidas
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // ❗ Caso offline e não esteja no cache
          return new Response(
            "<h1>Offline</h1><p>O conteúdo ainda não foi sincronizado.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        });
    })
  );
});
