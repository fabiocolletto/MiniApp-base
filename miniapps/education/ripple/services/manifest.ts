export interface Manifest {
  schemaVersion: number;
  contentVersion: string;
  idioma?: string;
  disciplinas?: string[];
  rotas: Record<string, string>;
}

export interface ManifestUpdateDetail {
  previous: Manifest | null;
  current: Manifest;
}

const MANIFEST_URL = '/data/manifest.json';
const MANIFEST_UPDATE_EVENT = 'manifest:update';

const manifestEvents = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
let cachedManifest: Manifest | null = null;
let inFlight: Promise<Manifest> | null = null;

function ensureEventTarget(): EventTarget {
  if (!manifestEvents) {
    throw new Error('Eventos de manifesto indisponíveis no ambiente atual.');
  }

  return manifestEvents;
}

function dispatchUpdate(previous: Manifest | null, current: Manifest) {
  if (!manifestEvents || typeof CustomEvent === 'undefined') {
    return;
  }

  const detail: ManifestUpdateDetail = { previous, current };
  manifestEvents.dispatchEvent(new CustomEvent(MANIFEST_UPDATE_EVENT, { detail }));
}

async function fetchManifest(): Promise<Manifest> {
  const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar manifest.json (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as Manifest;
  if (!data || typeof data !== 'object' || !data.contentVersion || !data.rotas) {
    throw new Error('Manifesto de dados inválido.');
  }

  return data;
}

export async function loadManifest(force = false): Promise<Manifest> {
  if (!force && cachedManifest) {
    return cachedManifest;
  }

  if (!force && inFlight) {
    return inFlight;
  }

  const request = fetchManifest()
    .then((manifest) => {
      if (cachedManifest && manifest.contentVersion !== cachedManifest.contentVersion) {
        dispatchUpdate(cachedManifest, manifest);
      }

      cachedManifest = manifest;
      return manifest;
    })
    .finally(() => {
      inFlight = null;
    });

  inFlight = request;
  return request;
}

export function onManifestUpdate(listener: (detail: ManifestUpdateDetail) => void): () => void {
  const target = ensureEventTarget();

  const handler = (event: Event) => {
    if ('detail' in event) {
      listener((event as CustomEvent<ManifestUpdateDetail>).detail);
    }
  };

  target.addEventListener(MANIFEST_UPDATE_EVENT, handler as EventListener);
  return () => target.removeEventListener(MANIFEST_UPDATE_EVENT, handler as EventListener);
}

export function getCachedManifest(): Manifest | null {
  return cachedManifest;
}
