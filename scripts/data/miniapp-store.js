import eventBus from '../events/event-bus.js';
import {
  getMiniappsCatalog as getMiniappsCatalogFromIndexedDB,
  syncMiniappsCatalog as syncMiniappsCatalogToIndexedDB,
} from '../../shared/storage/idb/marcocore.js';

const STORAGE_KEY = 'miniapp:admin-miniapps';

export const MINI_APP_STATUS_OPTIONS = [
  { value: 'deployment', label: 'Em implantação' },
  { value: 'testing', label: 'Em teste' },
  { value: 'active', label: 'Em uso' },
];

export const MINI_APP_BILLING_OPTIONS = [
  { value: 'free', label: 'Grátis' },
  { value: 'subscription', label: 'Assinatura' },
  { value: 'product', label: 'Produto' },
];

export const ACCESS_LEVEL_OPTIONS = [
  { value: 'administrador', label: 'Administradores' },
  { value: 'colaborador', label: 'Colaboradores' },
  { value: 'usuario', label: 'Usuários finais' },
];

const DEFAULT_MINI_APPS = [
  {
    id: 'task-manager',
    name: 'Gestão de Trabalho',
    category: 'Produtividade',
    description:
      'Organize o backlog, acompanhe indicadores de execução e detalhe cada entrega com checklists contextualizados.',
    status: 'active',
    updatedAt: '2025-10-25T15:03:00-03:00',
    access: ['administrador', 'colaborador', 'usuario'],
    billing: 'subscription',
    version: '0.1.234',
    downloads: 3280,
    favorites: 2840,
    releaseDate: '2025-10-25T15:03:00-03:00',
    featuredCategories: ['Produtividade', 'Gestão de trabalho'],
    icon: null,
    route: '/miniapps/task-manager',
  },
  {
    id: 'exam-planner',
    name: 'Criador de Provas',
    category: 'Educação',
    description:
      'Monte provas alinhadas à BNCC com banco de questões por competência, controle de turmas e indicadores de preparação.',
    status: 'active',
    updatedAt: '2025-10-26T15:10:00-03:00',
    access: ['administrador', 'colaborador', 'usuario'],
    billing: 'free',
    version: '0.1.254',
    downloads: 1620,
    favorites: 1180,
    releaseDate: '2025-10-26T15:10:00-03:00',
    featuredCategories: ['Educação', 'Avaliações escolares'],
    icon: null,
    route: '/miniapps/exam-planner',
  },
];

export const REMOVED_LEGACY_MINI_APP_IDS = Object.freeze(['time-tracker', 'field-forms', 'insights-hub']);

const REMOVED_LEGACY_MINI_APP_IDS_SET = new Set(REMOVED_LEGACY_MINI_APP_IDS);
const LEGACY_TASK_MANAGER_NAMES = new Set(['gestor de tarefas']);

const listeners = new Set();
let miniApps = null;
const MINI_APP_STATUS_LABELS = new Map(
  MINI_APP_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);
const MINI_APP_BILLING_LABELS = new Map(
  MINI_APP_BILLING_OPTIONS.map((option) => [option.value, option.label]),
);
const MINI_APP_BILLING_VALUES = new Set(MINI_APP_BILLING_OPTIONS.map((option) => option.value));

let suppressIndexedDBSync = false;
let hydrateCatalogPromise = null;

function getLocalStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento local dos mini-apps.', error);
    return null;
  }
}

function scheduleSyncWithIndexedDB(snapshot) {
  if (!Array.isArray(snapshot)) {
    return;
  }

  if (suppressIndexedDBSync) {
    return;
  }

  Promise.resolve()
    .then(() => syncMiniappsCatalogToIndexedDB(snapshot).catch((error) => {
      console.error('Não foi possível sincronizar o catálogo com IndexedDB.', error);
    }))
    .catch((error) => {
      console.error('Falha inesperada ao agendar sincronização com IndexedDB.', error);
    });
}

function readPersistedMiniApps() {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== 'string' || raw.trim() === '') {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Não foi possível ler a lista de mini-apps armazenada.', error);
    return null;
  }
}

function persistMiniAppsSnapshot(snapshot) {
  const storage = getLocalStorage();
  if (!storage) {
    scheduleSyncWithIndexedDB(snapshot);
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    scheduleSyncWithIndexedDB(snapshot);
  } catch (error) {
    console.error('Não foi possível salvar os mini-apps no armazenamento local.', error);
    scheduleSyncWithIndexedDB(snapshot);
  }
}

function normalizeUpdatedAt(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function normalizeAccessLevels(access) {
  if (!Array.isArray(access)) {
    return [];
  }

  const validValues = new Set(ACCESS_LEVEL_OPTIONS.map((option) => option.value));
  const normalized = [];

  access.forEach((value) => {
    const normalizedValue = String(value ?? '')
      .trim()
      .toLowerCase();
    if (validValues.has(normalizedValue) && !normalized.includes(normalizedValue)) {
      normalized.push(normalizedValue);
    }
  });

  return normalized;
}

function normalizeVersion(value) {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '1.0.0';
}

function normalizePositiveInteger(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = Math.max(0, Math.round(value));
    return normalized;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return fallback;
}

function normalizeMiniAppBilling(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (MINI_APP_BILLING_VALUES.has(normalized)) {
      return normalized;
    }
  }

  return 'free';
}

function normalizeReleaseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

function normalizeFeaturedCategories(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const normalized = [];
  values.forEach((value) => {
    const normalizedValue = String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    if (!normalizedValue) {
      return;
    }

    if (!normalized.includes(normalizedValue)) {
      normalized.push(normalizedValue);
    }
  });

  return normalized;
}

function normalizeMiniAppIcon(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isPngDataUrl = /^data:image\/png;base64,/i.test(trimmed);
  return isPngDataUrl ? trimmed : null;
}

function normalizeMiniAppEntry(app) {
  if (!app || typeof app !== 'object') {
    return null;
  }

  const id = typeof app.id === 'string' && app.id.trim() ? app.id.trim() : null;
  if (!id) {
    return null;
  }

  const name = typeof app.name === 'string' && app.name.trim() ? app.name.trim() : 'Mini-app sem nome';
  const category = typeof app.category === 'string' && app.category.trim() ? app.category.trim() : 'Sem categoria';
  const description = typeof app.description === 'string' && app.description.trim()
    ? app.description.trim()
    : 'Nenhuma descrição cadastrada ainda.';

  const status = MINI_APP_STATUS_OPTIONS.some((option) => option.value === app.status)
    ? app.status
    : 'deployment';

  const updatedAt = normalizeUpdatedAt(app.updatedAt);
  const access = normalizeAccessLevels(app.access);
  const version = normalizeVersion(app.version);
  const downloads = normalizePositiveInteger(app.downloads);
  const favorites = normalizePositiveInteger(app.favorites);
  const releaseDate = normalizeReleaseDate(app.releaseDate);
  const featuredCategories = normalizeFeaturedCategories(app.featuredCategories);
  const icon = normalizeMiniAppIcon(app.icon);
  const route = typeof app.route === 'string' && app.route.trim() ? app.route.trim() : `/miniapps/${id}`;
  const billing = normalizeMiniAppBilling(app.billing);

  return {
    id,
    name,
    category,
    description,
    status,
    updatedAt,
    access,
    version,
    downloads,
    favorites,
    releaseDate,
    featuredCategories,
    icon,
    route,
    billing,
    billingLabel: MINI_APP_BILLING_LABELS.get(billing) ?? 'Grátis',
  };
}

function cloneMiniAppEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.description,
    status: entry.status,
    updatedAt: entry.updatedAt,
    access: Array.isArray(entry.access) ? [...entry.access] : [],
    version: entry.version,
    downloads: entry.downloads,
    favorites: entry.favorites,
    releaseDate: entry.releaseDate,
    featuredCategories: Array.isArray(entry.featuredCategories)
      ? [...entry.featuredCategories]
      : [],
    icon: entry.icon ?? null,
    route: entry.route,
    billing: entry.billing,
    billingLabel: entry.billingLabel,
  };
}

const DEFAULT_MINI_APPS_NORMALIZED = DEFAULT_MINI_APPS.map((entry) => normalizeMiniAppEntry(entry)).filter(
  (entry) => entry !== null,
);

function isLegacyPlaceholderMiniApp(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  if (REMOVED_LEGACY_MINI_APP_IDS_SET.has(entry.id)) {
    return true;
  }

  if (entry.id === 'task-manager') {
    const normalizedName = typeof entry.name === 'string' ? entry.name.trim().toLowerCase() : '';
    if (normalizedName && LEGACY_TASK_MANAGER_NAMES.has(normalizedName)) {
      return true;
    }
  }

  return false;
}

function removeDeprecatedMiniApps(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { entries: [], removed: false };
  }

  const filtered = [];
  let removed = false;

  entries.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    if (isLegacyPlaceholderMiniApp(entry)) {
      removed = true;
      return;
    }

    filtered.push(entry);
  });

  return {
    entries: removed ? filtered : entries.slice(),
    removed,
  };
}

function mergeWithDefaultMiniApps(entries) {
  const normalizedEntries = Array.isArray(entries) ? entries.slice() : [];
  const indexById = new Map(normalizedEntries.map((entry) => [entry.id, entry]));
  let hasChanges = false;

  DEFAULT_MINI_APPS_NORMALIZED.forEach((defaultEntry) => {
    if (!indexById.has(defaultEntry.id)) {
      const cloned = cloneMiniAppEntry(defaultEntry);
      normalizedEntries.push(cloned);
      indexById.set(cloned.id, cloned);
      hasChanges = true;
    }
  });

  return { entries: normalizedEntries, hasChanges };
}

function ensureInitialized() {
  if (Array.isArray(miniApps)) {
    const { entries: sanitizedEntries, removed } = removeDeprecatedMiniApps(miniApps);
    const { entries: mergedEntries, hasChanges } = mergeWithDefaultMiniApps(sanitizedEntries);

    if (removed || hasChanges) {
      miniApps = mergedEntries;
      persistMiniAppsSnapshot(miniApps);
      notifyListeners();
    }
    return;
  }

  const persisted = readPersistedMiniApps();
  const source = Array.isArray(persisted) ? persisted : DEFAULT_MINI_APPS;

  const normalized = source.map((entry) => normalizeMiniAppEntry(entry)).filter((entry) => entry !== null);
  const { entries: sanitizedEntries, removed } = removeDeprecatedMiniApps(normalized);
  const { entries, hasChanges } = mergeWithDefaultMiniApps(sanitizedEntries);

  miniApps = entries;

  if (!Array.isArray(persisted) || removed || hasChanges) {
    persistMiniAppsSnapshot(miniApps);
  }
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(getMiniAppsSnapshot());
    } catch (error) {
      console.error('Erro ao notificar assinante das atualizações de mini-apps.', error);
    }
  });
}

async function hydrateCatalogFromIndexedDB() {
  if (!hydrateCatalogPromise) {
    hydrateCatalogPromise = (async () => {
      try {
        const entries = await getMiniappsCatalogFromIndexedDB();
        if (Array.isArray(entries) && entries.length > 0) {
          suppressIndexedDBSync = true;
          try {
            resetMiniApps(entries);
          } finally {
            suppressIndexedDBSync = false;
          }
        }
      } catch (error) {
        console.warn('Não foi possível carregar o catálogo de MiniApps a partir do IndexedDB.', error);
      } finally {
        hydrateCatalogPromise = null;
      }
    })();
  }

  return hydrateCatalogPromise;
}

export function getMiniAppsSnapshot() {
  ensureInitialized();
  return Array.isArray(miniApps) ? miniApps.map((entry) => cloneMiniAppEntry(entry)) : [];
}

function sortMiniAppsByMetric(metric, limit = 10) {
  const apps = getMiniAppsSnapshot();
  return apps
    .slice()
    .sort((a, b) => {
      const aValue = typeof a?.[metric] === 'number' ? a[metric] : 0;
      const bValue = typeof b?.[metric] === 'number' ? b[metric] : 0;
      return bValue - aValue;
    })
    .slice(0, Math.max(0, limit));
}

function sortMiniAppsByDate(field, limit = 10, direction = 'desc', fallbackField = null) {
  const apps = getMiniAppsSnapshot();
  const multiplier = direction === 'asc' ? 1 : -1;

  return apps
    .slice()
    .sort((a, b) => {
      const getDateValue = (entry) => {
        const primaryValue = entry?.[field];
        const fallbackValue = fallbackField ? entry?.[fallbackField] : null;
        const candidate = primaryValue ?? fallbackValue;
        if (!candidate) {
          return 0;
        }

        const parsed = new Date(candidate);
        if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
          return parsed.getTime();
        }

        return 0;
      };

      const aTime = getDateValue(a);
      const bTime = getDateValue(b);

      if (aTime === bTime) {
        return 0;
      }

      return aTime > bTime ? multiplier : -multiplier;
    })
    .slice(0, Math.max(0, limit));
}

export function getTopMiniAppsByDownloads(limit = 10) {
  return sortMiniAppsByMetric('downloads', limit);
}

export function getTopMiniAppsByFavorites(limit = 10) {
  return sortMiniAppsByMetric('favorites', limit);
}

export function getLatestMiniApps(limit = 10) {
  return sortMiniAppsByDate('releaseDate', limit, 'desc', 'updatedAt');
}

export function getMiniAppsByFeaturedCategories({ limit = 12 } = {}) {
  const apps = getMiniAppsSnapshot();
  const grouped = new Map();

  apps.forEach((app) => {
    const featured = Array.isArray(app.featuredCategories) && app.featuredCategories.length > 0
      ? app.featuredCategories
      : [app.category];

    featured
      .map((category) => String(category ?? '').trim())
      .filter((category) => category.length > 0)
      .forEach((category) => {
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }

        grouped.get(category).push(app);
      });
  });

  const orderedCategories = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const result = [];

  orderedCategories.forEach((category) => {
    if (result.length >= limit) {
      return;
    }

    const appsInCategory = grouped.get(category) ?? [];
    appsInCategory
      .slice()
      .sort((a, b) => {
        const aDownloads = typeof a?.downloads === 'number' ? a.downloads : 0;
        const bDownloads = typeof b?.downloads === 'number' ? b.downloads : 0;
        return bDownloads - aDownloads;
      })
      .forEach((app) => {
        if (result.length < limit) {
          result.push(app);
        }
      });
  });

  return result.slice(0, Math.max(0, limit));
}

export function getMiniAppStatusLabel(status) {
  return MINI_APP_STATUS_LABELS.get(status) ?? MINI_APP_STATUS_LABELS.get('deployment') ?? 'Em implantação';
}

export function subscribeMiniApps(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  ensureInitialized();
  listeners.add(listener);

  try {
    listener(getMiniAppsSnapshot());
  } catch (error) {
    console.error('Erro ao inicializar assinante dos mini-apps.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function updateMiniApp(id, updater) {
  ensureInitialized();

  if (!Array.isArray(miniApps) || typeof id !== 'string' || id.trim() === '') {
    return null;
  }

  const index = miniApps.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return null;
  }

  const current = miniApps[index];
  const reference = cloneMiniAppEntry(current);
  const patch = typeof updater === 'function' ? updater(reference) : updater;

  if (!patch || typeof patch !== 'object') {
    return cloneMiniAppEntry(current);
  }

  const normalized = normalizeMiniAppEntry({ ...reference, ...patch });
  if (!normalized) {
    return cloneMiniAppEntry(current);
  }

  miniApps[index] = normalized;
  persistMiniAppsSnapshot(miniApps);
  notifyListeners();
  return cloneMiniAppEntry(normalized);
}

export function resetMiniApps(entries = DEFAULT_MINI_APPS) {
  const normalized = entries.map((entry) => normalizeMiniAppEntry(entry)).filter((entry) => entry !== null);
  const { entries: sanitizedEntries } = removeDeprecatedMiniApps(normalized);
  const { entries: mergedEntries } = mergeWithDefaultMiniApps(sanitizedEntries);

  miniApps = mergedEntries;

  persistMiniAppsSnapshot(miniApps);
  notifyListeners();
}

if (typeof window !== 'undefined') {
  eventBus.on('storage:ready', () => {
    hydrateCatalogFromIndexedDB();
  });

  eventBus.on('storage:migrated', (payload) => {
    const catalog = payload && Array.isArray(payload.catalog) ? payload.catalog : null;
    if (catalog && catalog.length > 0) {
      suppressIndexedDBSync = true;
      try {
        resetMiniApps(catalog);
      } finally {
        suppressIndexedDBSync = false;
      }
      return;
    }

    hydrateCatalogFromIndexedDB();
  });
}

export function __resetMiniAppStoreStateForTests() {
  miniApps = null;
}

