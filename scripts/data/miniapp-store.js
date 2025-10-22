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
  },
];

const listeners = new Set();
let miniApps = null;

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

  return { id, name, category, description, status, updatedAt, access };
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

