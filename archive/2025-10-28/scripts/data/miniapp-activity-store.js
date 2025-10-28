const STORAGE_KEY = 'miniapp:activity';
const MAX_RECENT_ITEMS = 12;

const listeners = new Set();
let activityByUserId = null;

function normalizeUserId(userId) {
  if (typeof userId === 'number' && Number.isFinite(userId)) {
    return String(userId);
  }

  if (typeof userId === 'string') {
    const trimmed = userId.trim();
    return trimmed !== '' ? trimmed : null;
  }

  return null;
}

function normalizeMiniAppId(appId) {
  if (typeof appId !== 'string') {
    return null;
  }

  const trimmed = appId.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeTimestamp(value) {
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

  return new Date().toISOString();
}

function getLocalStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento local de atividade de mini-apps.', error);
    return null;
  }
}

function sanitizeActivityEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const appId = normalizeMiniAppId(entry.appId ?? entry.id ?? entry.miniAppId);
  if (!appId) {
    return null;
  }

  const lastAccessedAt = normalizeTimestamp(entry.lastAccessedAt ?? entry.timestamp ?? entry.accessedAt);
  return { appId, lastAccessedAt };
}

function cloneActivityEntryList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const entries = [];
  const seen = new Set();

  list.forEach((entry) => {
    const sanitized = sanitizeActivityEntry(entry);
    if (!sanitized) {
      return;
    }

    if (seen.has(sanitized.appId)) {
      return;
    }

    seen.add(sanitized.appId);
    entries.push(sanitized);
  });

  entries.sort((a, b) => {
    const aTime = new Date(a.lastAccessedAt).getTime();
    const bTime = new Date(b.lastAccessedAt).getTime();
    return Number.isNaN(bTime) || Number.isNaN(aTime) ? 0 : bTime - aTime;
  });

  return entries.slice(0, MAX_RECENT_ITEMS);
}

function readPersistedActivity() {
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
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return Object.entries(parsed).reduce((accumulator, [userId, entryList]) => {
      const normalizedId = normalizeUserId(userId);
      if (!normalizedId) {
        return accumulator;
      }

      accumulator[normalizedId] = cloneActivityEntryList(entryList);
      return accumulator;
    }, {});
  } catch (error) {
    console.error('Não foi possível ler a atividade de mini-apps armazenada.', error);
    return null;
  }
}

function persistActivity(snapshot) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Não foi possível salvar a atividade de mini-apps no armazenamento local.', error);
  }
}

function ensureInitialized() {
  if (activityByUserId) {
    return;
  }

  const persisted = readPersistedActivity();
  activityByUserId = persisted ?? {};

  if (!persisted) {
    persistActivity(activityByUserId);
  }
}

function commitActivity(userId) {
  persistActivity(activityByUserId);
  notifyListeners(userId);
}

function notifyListeners(userId) {
  const payload = {
    userId: normalizeUserId(userId),
    activity: getMiniAppActivitySnapshot(),
  };

  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error('Erro ao notificar assinante de atividade de mini-apps.', error);
    }
  });
}

function ensureUserEntry(userId) {
  ensureInitialized();

  const normalizedId = normalizeUserId(userId);
  if (!normalizedId) {
    return null;
  }

  if (!activityByUserId[normalizedId]) {
    activityByUserId[normalizedId] = [];
  }

  return activityByUserId[normalizedId];
}

export function getMiniAppActivitySnapshot() {
  ensureInitialized();

  return Object.entries(activityByUserId).reduce((accumulator, [userId, entryList]) => {
    accumulator[userId] = cloneActivityEntryList(entryList);
    return accumulator;
  }, {});
}

export function getUserMiniAppActivity(userId, limit = MAX_RECENT_ITEMS) {
  ensureInitialized();

  const normalizedId = normalizeUserId(userId);
  if (!normalizedId) {
    return [];
  }

  const entryList = activityByUserId[normalizedId];
  const snapshot = cloneActivityEntryList(entryList);

  if (Number.isFinite(limit) && limit > 0) {
    return snapshot.slice(0, limit);
  }

  return snapshot;
}

export function subscribeMiniAppActivity(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  ensureInitialized();

  listeners.add(listener);

  try {
    listener({ userId: null, activity: getMiniAppActivitySnapshot() });
  } catch (error) {
    console.error('Erro ao notificar assinante inicial de atividade de mini-apps.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function recordMiniAppAccess(userId, appId, timestamp = new Date()) {
  const normalizedId = normalizeUserId(userId);
  const normalizedAppId = normalizeMiniAppId(appId);

  if (!normalizedId || !normalizedAppId) {
    return { success: false, reason: 'invalid-input' };
  }

  const entryList = ensureUserEntry(normalizedId);
  if (!entryList) {
    return { success: false, reason: 'invalid-input' };
  }

  const filtered = entryList.filter((entry) => normalizeMiniAppId(entry.appId) !== normalizedAppId);
  filtered.unshift({ appId: normalizedAppId, lastAccessedAt: normalizeTimestamp(timestamp) });
  activityByUserId[normalizedId] = filtered.slice(0, MAX_RECENT_ITEMS);

  commitActivity(normalizedId);

  return { success: true };
}

export function resetMiniAppActivity(snapshot = {}) {
  ensureInitialized();

  if (!snapshot || typeof snapshot !== 'object') {
    activityByUserId = {};
    persistActivity(activityByUserId);
    notifyListeners(null);
    return;
  }

  activityByUserId = Object.entries(snapshot).reduce((accumulator, [userId, entryList]) => {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) {
      return accumulator;
    }

    accumulator[normalizedId] = cloneActivityEntryList(entryList);
    return accumulator;
  }, {});

  persistActivity(activityByUserId);
  notifyListeners(null);
}
