const STORAGE_KEY = 'miniapp:admin-subscriptions';

export const SUBSCRIPTION_PERIODICITY_OPTIONS = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];

const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'essential',
    name: 'Pacote Essencial',
    description:
      'Conjunto base com jornadas produtivas para equipes que precisam iniciar rapidamente com supervisão compartilhada.',
    startDate: '2025-01-01T03:00:00.000Z',
    endDate: '2025-06-30T03:00:00.000Z',
    price: 149.9,
    periodicity: 'monthly',
    miniApps: ['time-tracker', 'field-forms'],
    userCategory: 'colaborador',
    createdAt: '2025-10-10T14:30:00.000Z',
    updatedAt: '2025-10-18T10:20:00.000Z',
  },
  {
    id: 'insights-plus',
    name: 'Plano Insights Plus',
    description:
      'Pacote completo com analytics e integrações em tempo real para times que precisam acompanhar implantações intensivas.',
    startDate: '2025-02-01T03:00:00.000Z',
    endDate: '2025-12-31T03:00:00.000Z',
    price: 329.5,
    periodicity: 'quarterly',
    miniApps: ['time-tracker', 'insights-hub'],
    userCategory: 'administrador',
    createdAt: '2025-10-12T16:45:00.000Z',
    updatedAt: '2025-10-19T11:10:00.000Z',
  },
  {
    id: 'field-expansion',
    name: 'Pacote Expansão em Campo',
    description:
      'Coleção voltada a operações externas com suporte offline, checklists avançados e dashboards compartilhados.',
    startDate: '2025-03-15T03:00:00.000Z',
    endDate: '2026-03-14T03:00:00.000Z',
    price: 219.0,
    periodicity: 'yearly',
    miniApps: ['field-forms'],
    userCategory: 'usuario',
    createdAt: '2025-10-14T09:05:00.000Z',
    updatedAt: '2025-10-21T08:25:00.000Z',
  },
];

let subscriptionPlans = null;
const listeners = new Set();

function getLocalStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento local de assinaturas.', error);
    return null;
  }
}

function readPersistedPlans() {
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
    console.error('Não foi possível ler os pacotes de assinatura armazenados.', error);
    return null;
  }
}

function persistPlansSnapshot(snapshot) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Não foi possível salvar os pacotes de assinatura.', error);
  }
}

function toIsoDate(value, fallback) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return fallback instanceof Date
    ? fallback.toISOString()
    : typeof fallback === 'string'
    ? fallback
    : new Date().toISOString();
}

function normalizePeriodicity(value, fallback = SUBSCRIPTION_PERIODICITY_OPTIONS[0].value) {
  const validValues = new Set(SUBSCRIPTION_PERIODICITY_OPTIONS.map((option) => option.value));
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (validValues.has(normalized)) {
    return normalized;
  }

  if (typeof fallback === 'string' && validValues.has(fallback)) {
    return fallback;
  }

  return SUBSCRIPTION_PERIODICITY_OPTIONS[0].value;
}

function normalizeMiniApps(list, fallback = []) {
  if (!Array.isArray(list)) {
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  const values = [];
  list.forEach((value) => {
    const normalizedValue = typeof value === 'string' ? value.trim() : '';
    if (!normalizedValue) {
      return;
    }
    if (!values.includes(normalizedValue)) {
      values.push(normalizedValue);
    }
  });

  return values;
}

function normalizeUserCategory(value, fallback = 'usuario') {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized) {
    return normalized;
  }

  if (typeof fallback === 'string' && fallback.trim() !== '') {
    return fallback.trim().toLowerCase();
  }

  return 'usuario';
}

function normalizePrice(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value * 100) / 100);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseFloat(value.replace(',', '.'));
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed * 100) / 100);
    }
  }

  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return Math.max(0, Math.round(fallback * 100) / 100);
  }

  return 0;
}

function normalizeDescription(value, fallback = '') {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  if (typeof fallback === 'string' && fallback.trim() !== '') {
    return fallback.trim();
  }

  return '';
}

function normalizePlan(entry, fallback = null) {
  if (!entry || typeof entry !== 'object') {
    return fallback;
  }

  const previous = fallback && typeof fallback === 'object' ? fallback : null;
  const idSource = entry.id ?? previous?.id;
  if (idSource == null) {
    return previous;
  }

  const id = String(idSource);
  const nameSource = typeof entry.name === 'string' && entry.name.trim() !== '' ? entry.name : previous?.name;
  const name = nameSource ? String(nameSource).trim() : 'Pacote sem nome';

  const description = normalizeDescription(entry.description, previous?.description ?? '');
  const startDate = toIsoDate(entry.startDate ?? previous?.startDate ?? new Date(), previous?.startDate);
  const endDate = toIsoDate(entry.endDate ?? previous?.endDate ?? new Date(), previous?.endDate ?? startDate);
  const price = normalizePrice(entry.price, previous?.price ?? 0);
  const periodicity = normalizePeriodicity(entry.periodicity, previous?.periodicity);
  const miniApps = normalizeMiniApps(entry.miniApps, previous?.miniApps ?? []);
  const userCategory = normalizeUserCategory(entry.userCategory, previous?.userCategory ?? 'usuario');
  const createdAt = toIsoDate(entry.createdAt ?? previous?.createdAt ?? new Date(), previous?.createdAt ?? new Date());
  const updatedAt = toIsoDate(entry.updatedAt ?? new Date(), new Date());

  return {
    id,
    name,
    description,
    startDate,
    endDate,
    price,
    periodicity,
    miniApps,
    userCategory,
    createdAt,
    updatedAt,
  };
}

function ensureSubscriptionPlans() {
  if (subscriptionPlans) {
    return subscriptionPlans;
  }

  const persisted = readPersistedPlans();
  if (Array.isArray(persisted) && persisted.length > 0) {
    subscriptionPlans = persisted
      .map((entry) => normalizePlan(entry))
      .filter((plan) => plan !== null);
  } else {
    subscriptionPlans = DEFAULT_SUBSCRIPTION_PLANS.map((entry) => normalizePlan(entry));
  }

  return subscriptionPlans;
}

function clonePlan(plan) {
  return plan ? { ...plan, miniApps: Array.isArray(plan.miniApps) ? plan.miniApps.slice() : [] } : null;
}

function notifyListeners() {
  const snapshot = ensureSubscriptionPlans().map((plan) => clonePlan(plan));
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante de pacotes de assinatura.', error);
    }
  });
}

export function getSubscriptionPlansSnapshot() {
  return ensureSubscriptionPlans().map((plan) => clonePlan(plan));
}

export function subscribeSubscriptionPlans(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);

  try {
    listener(getSubscriptionPlansSnapshot());
  } catch (error) {
    console.error('Erro ao inicializar assinante de pacotes de assinatura.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function updateSubscriptionPlan(id, updater) {
  if (id == null) {
    return null;
  }

  const plans = ensureSubscriptionPlans();
  const index = plans.findIndex((plan) => plan.id === String(id));
  if (index < 0) {
    return null;
  }

  const current = plans[index];
  const patch = typeof updater === 'function' ? updater(clonePlan(current)) : updater;

  if (!patch || typeof patch !== 'object') {
    return clonePlan(current);
  }

  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const normalized = normalizePlan(merged, current);
  plans[index] = normalized;

  persistPlansSnapshot(plans);
  notifyListeners();

  return clonePlan(normalized);
}

export function resetSubscriptionPlans(entries = DEFAULT_SUBSCRIPTION_PLANS) {
  subscriptionPlans = entries
    .map((entry) => normalizePlan(entry))
    .filter((entry) => entry !== null);

  persistPlansSnapshot(subscriptionPlans);
  notifyListeners();
}
