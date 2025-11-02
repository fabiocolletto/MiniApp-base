const DEFAULT_REGISTRY_URL = './miniapps/registry.json';
const DEFAULT_TARGET_SELECTOR = '#content';

function resolveFetch(customFetch, runtimeWindow) {
  if (typeof customFetch === 'function') {
    if (runtimeWindow && customFetch === runtimeWindow.fetch) {
      return runtimeWindow.fetch.bind(runtimeWindow);
    }

    if (typeof fetch === 'function' && customFetch === fetch) {
      return fetch.bind(globalThis);
    }

    return customFetch;
  }

  if (runtimeWindow && typeof runtimeWindow.fetch === 'function') {
    return runtimeWindow.fetch.bind(runtimeWindow);
  }

  if (typeof fetch === 'function') {
    return fetch.bind(globalThis);
  }

  throw new Error('API fetch indisponível para carregar MiniApps.');
}

function resolveDocument(customDocument) {
  if (customDocument && typeof customDocument === 'object') {
    return customDocument;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  return undefined;
}

function normalizeId(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

export async function loadMiniApp(id, options = {}) {
  const normalizedId = normalizeId(id);
  if (!normalizedId) {
    throw new Error('É necessário informar o identificador do MiniApp.');
  }

  const runtimeDocument = resolveDocument(options.document);
  const runtimeWindow = runtimeDocument?.defaultView ?? (typeof window !== 'undefined' ? window : undefined);
  const runtimeFetch = resolveFetch(options.fetch, runtimeWindow);
  const response = await runtimeFetch(options.registryUrl ?? DEFAULT_REGISTRY_URL, { cache: 'no-store' });

  if (!response || !response.ok) {
    throw new Error(`Não foi possível carregar registry.json (HTTP ${response?.status ?? 'desconhecido'}).`);
  }

  const registry = await response.json();
  if (!Array.isArray(registry)) {
    throw new Error('Registro de MiniApps inválido.');
  }

  const entry = registry.find((item) => normalizeId(item?.id) === normalizedId);
  if (!entry || typeof entry.entry !== 'string') {
    throw new Error('MiniApp não encontrado');
  }

  const moduleUrl = new URL(
    entry.entry,
    runtimeDocument?.baseURI ?? runtimeWindow?.location?.href ?? import.meta.url,
  );

  const module = await import(moduleUrl.href);
  const mount = module?.mount ?? module?.default?.mount;
  if (typeof mount !== 'function') {
    throw new Error('Módulo de MiniApp não expõe função mount.');
  }

  const elementConstructor =
    runtimeDocument?.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);

  const providedTarget =
    elementConstructor && options.target instanceof elementConstructor ? options.target : null;

  const targetElement =
    providedTarget ??
    runtimeDocument?.querySelector(options.targetSelector ?? DEFAULT_TARGET_SELECTOR);

  if (!targetElement) {
    throw new Error('Elemento de destino para o MiniApp não foi encontrado.');
  }

  await mount(targetElement, options.context ?? {});
  return { module, entry };
}

export default loadMiniApp;
