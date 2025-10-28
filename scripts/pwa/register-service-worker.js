const SERVICE_WORKER_PATH = './service-worker.js';
const DEFAULT_VERSION_TAG = 'dev';

export function buildServiceWorkerUrl(versionTag) {
  const normalizedVersion =
    typeof versionTag === 'string' && versionTag.trim() ? versionTag.trim() : DEFAULT_VERSION_TAG;
  return `${SERVICE_WORKER_PATH}?v=${encodeURIComponent(normalizedVersion)}`;
}

export async function registerServiceWorker(versionTag) {
  const navigatorRef = globalThis?.navigator;

  if (!navigatorRef || !('serviceWorker' in navigatorRef)) {
    return null;
  }

  const serviceWorkerUrl = buildServiceWorkerUrl(versionTag);

  try {
    const registration = await navigatorRef.serviceWorker.register(serviceWorkerUrl);
    return registration;
  } catch (error) {
    console.error('Não foi possível registrar o Service Worker.', error);
    return null;
  }
}
