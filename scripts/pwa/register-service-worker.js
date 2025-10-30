const SERVICE_WORKER_PATH = './service-worker.js';
const DEFAULT_VERSION_TAG = 'dev';
const CACHE_PREFIX = 'miniapp-base::pwa::';
const CACHE_POLL_ATTEMPTS = 6;
const CACHE_POLL_INTERVAL_MS = 500;

function normalizeVersion(versionTag) {
  return typeof versionTag === 'string' && versionTag.trim() ? versionTag.trim() : DEFAULT_VERSION_TAG;
}

export function buildServiceWorkerUrl(versionTag) {
  const normalizedVersion = normalizeVersion(versionTag);
  return `${SERVICE_WORKER_PATH}?v=${encodeURIComponent(normalizedVersion)}`;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function listCacheKeys(cachesRef) {
  if (!cachesRef || typeof cachesRef.keys !== 'function') {
    return [];
  }

  try {
    const keys = await cachesRef.keys();
    return Array.isArray(keys) ? keys : [];
  } catch (error) {
    console.warn('Não foi possível consultar os caches do PWA.', error);
    return [];
  }
}

async function waitForCacheProvision(cacheName, cachesRef) {
  if (!cacheName || !cachesRef) {
    return false;
  }

  for (let attempt = 0; attempt < CACHE_POLL_ATTEMPTS; attempt += 1) {
    const keys = await listCacheKeys(cachesRef);
    if (keys.includes(cacheName)) {
      return true;
    }
    await delay(CACHE_POLL_INTERVAL_MS);
  }

  return false;
}

let reloadListenerRegistered = false;

function requestReloadOnControllerChange(navigatorRef) {
  if (reloadListenerRegistered) {
    return;
  }

  const serviceWorkerController = navigatorRef?.serviceWorker;
  if (!serviceWorkerController || typeof serviceWorkerController.addEventListener !== 'function') {
    return;
  }

  reloadListenerRegistered = true;
  serviceWorkerController.addEventListener('controllerchange', () => {
    const locationRef = globalThis?.location;
    if (locationRef && typeof locationRef.reload === 'function') {
      locationRef.reload();
    }
  });
}

async function ensureLatestCacheVersion({ registration, versionTag, cachesRef, navigatorRef }) {
  if (!registration || !cachesRef) {
    return registration;
  }

  const normalizedVersion = normalizeVersion(versionTag);
  const expectedCacheName = `${CACHE_PREFIX}${normalizedVersion}`;
  const existingCaches = await listCacheKeys(cachesRef);

  if (existingCaches.includes(expectedCacheName)) {
    return registration;
  }

  if (typeof registration.update === 'function') {
    try {
      await registration.update();
    } catch (error) {
      console.warn('Falha ao atualizar o registro do Service Worker.', error);
    }
  }

  const readyPromise = navigatorRef?.serviceWorker?.ready;
  if (readyPromise && typeof readyPromise.then === 'function') {
    try {
      await readyPromise;
    } catch (error) {
      console.warn('Falha ao aguardar o Service Worker pronto após atualização.', error);
    }
  }

  const cacheProvisioned = await waitForCacheProvision(expectedCacheName, cachesRef);
  if (!cacheProvisioned) {
    console.warn(`Cache "${expectedCacheName}" não foi provisionado após atualizar o Service Worker.`);
    return registration;
  }

  requestReloadOnControllerChange(navigatorRef);
  return registration;
}

export async function registerServiceWorker(versionTag) {
  const navigatorRef = globalThis?.navigator;

  if (!navigatorRef || !('serviceWorker' in navigatorRef)) {
    return null;
  }

  const serviceWorkerUrl = buildServiceWorkerUrl(versionTag);

  try {
    const registration = await navigatorRef.serviceWorker.register(serviceWorkerUrl);
    const cachesRef = globalThis?.caches;
    await ensureLatestCacheVersion({
      registration,
      versionTag,
      cachesRef,
      navigatorRef,
    });
    return registration;
  } catch (error) {
    console.error('Não foi possível registrar o Service Worker.', error);
    return null;
  }
}
