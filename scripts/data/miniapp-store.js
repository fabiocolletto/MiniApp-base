const STORAGE_KEY = 'miniapp:admin-miniapps';

export const MINI_APP_STATUS_OPTIONS = [
  { value: 'deployment', label: 'Em implantação' },
  { value: 'testing', label: 'Em teste' },
  { value: 'active', label: 'Em uso' },
];

export const ACCESS_LEVEL_OPTIONS = [
  { value: 'administrador', label: 'Administradores' },
  { value: 'colaborador', label: 'Colaboradores' },
  { value: 'usuario', label: 'Usuários finais' },
];

const DEFAULT_MINI_APPS = [
  {
    id: 'time-tracker',
    name: 'Time Tracker',
    category: 'Produtividade',
    description:
      'Monitore jornadas, exporte relatórios completos e mantenha a equipe sincronizada com as regras do painel administrativo.',
    status: 'active',
    updatedAt: '2025-10-12T18:00:00-03:00',
    access: ['administrador', 'colaborador'],
    version: '1.8.0',
    downloads: 12840,
    favorites: 9420,
    releaseDate: '2024-05-10T09:00:00-03:00',
    featuredCategories: ['Produtividade', 'Gestão de tempo'],
    icon: null,
  },
  {
    id: 'field-forms',
    name: 'Field Forms',
    category: 'Operações',
    description:
      'Colete dados em campo mesmo offline, centralize anexos e acompanhe revisões em tempo real a partir do painel.',
    status: 'testing',
    updatedAt: '2025-10-18T09:30:00-03:00',
    access: ['administrador'],
    version: '3.2.1',
    downloads: 8640,
    favorites: 5120,
    releaseDate: '2023-11-03T11:30:00-03:00',
    featuredCategories: ['Operações', 'Coleta em campo'],
    icon: null,
  },
  {
    id: 'insights-hub',
    name: 'Insights Hub',
    category: 'Analytics',
    description:
      'Combine métricas de diferentes mini-apps, configure alertas inteligentes e acompanhe o avanço da implantação.',
    status: 'deployment',
    updatedAt: '2025-10-20T14:45:00-03:00',
    access: ['administrador', 'colaborador', 'usuario'],
    version: '0.9.5',
    downloads: 4760,
    favorites: 3980,
    releaseDate: '2024-07-22T15:15:00-03:00',
    featuredCategories: ['Analytics', 'Gestão'],
    icon: null,
  },
  {
    id: 'task-manager',
    name: 'Gestor de tarefas',
    category: 'Produtividade',
    description:
      'Organize o backlog, acompanhe indicadores de execução e detalhe cada entrega com checklists contextualizados.',
    status: 'active',
    updatedAt: '2025-10-25T15:03:00-03:00',
    access: ['administrador', 'colaborador', 'usuario'],
    version: '0.1.234',
    downloads: 3280,
    favorites: 2840,
    releaseDate: '2025-10-25T15:03:00-03:00',
    featuredCategories: ['Produtividade', 'Gestão de tarefas'],
    icon: null,
  },
];

const listeners = new Set();
let miniApps = null;
const MINI_APP_STATUS_LABELS = new Map(
  MINI_APP_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

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
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Não foi possível salvar os mini-apps no armazenamento local.', error);
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
  };
}

function ensureInitialized() {
  if (Array.isArray(miniApps)) {
    return;
  }

  const persisted = readPersistedMiniApps();
  const source = Array.isArray(persisted) ? persisted : DEFAULT_MINI_APPS;

  miniApps = source
    .map((entry) => normalizeMiniAppEntry(entry))
    .filter((entry) => entry !== null);

  if (!Array.isArray(persisted)) {
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
  miniApps = entries
    .map((entry) => normalizeMiniAppEntry(entry))
    .filter((entry) => entry !== null);

  persistMiniAppsSnapshot(miniApps);
  notifyListeners();
}

