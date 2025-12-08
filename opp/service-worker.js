// opp/service-worker.js – Versão atualizada para PWAO
// -------------------------------------------------------
// Este Service Worker segue o modelo orgânico do PWAO:
// • Cache inteligente das células e órgãos
// • Cache do Genoma
// • Página personalizada de falha (fail.html)
// • Atualização suave
// • Caminhos relativos compatíveis com GitHub Pages
// -------------------------------------------------------

const CACHE_NAME = "pwao-opp-v2";

// Arquivos essenciais para o organismo iniciar offline
const CORE_ASSETS = [
  "../index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./fail.html" // Página personalizada de erro
];

// Instalação do SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Estratégia de busca orgânica
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Ignorar chamadas externas para evitar riscos
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          if (resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return resp;
        })
        .catch(() => {
          // fallback automático ao fail.html quando houver falha de rede
          if (req.mode === "navigate") {
            return caches.match("./fail.html");
          }
        });
    })
  );
});
