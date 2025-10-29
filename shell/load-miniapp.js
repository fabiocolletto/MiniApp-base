const DEFAULT_REGISTRY_URL = './miniapps/registry.json';
const DEFAULT_TARGET_SELECTOR = '#content';

function resolveFetch(customFetch) {
  if (typeof customFetch === 'function') {
    return customFetch;
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

  const runtimeFetch = resolveFetch(options.fetch);
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

  const module = await import(entry.entry);
  const mount = module?.mount ?? module?.default?.mount;
  if (typeof mount !== 'function') {
    throw new Error('Módulo de MiniApp não expõe função mount.');
  }

  const runtimeDocument = resolveDocument(options.document);
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
