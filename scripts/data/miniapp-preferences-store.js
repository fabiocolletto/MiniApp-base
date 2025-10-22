const STORAGE_KEY = 'miniapp:preferences';
export const MAX_FAVORITE_MINI_APPS = 4;

const listeners = new Set();
let preferencesByUserId = null;

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

function getLocalStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento local de preferências de mini-apps.', error);
    return null;
  }
}

function clonePreferencesEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return { favorites: [], saved: [] };
  }

  const favorites = Array.isArray(entry.favorites) ? entry.favorites.filter((value) => typeof value === 'string') : [];
  const saved = Array.isArray(entry.saved) ? entry.saved.filter((value) => typeof value === 'string') : [];

  return {
    favorites: Array.from(new Set(favorites.map((value) => value.trim()).filter(Boolean))),
    saved: Array.from(new Set(saved.map((value) => value.trim()).filter(Boolean))),
  };
}

function readPersistedPreferences() {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(STORAGE_KEY);
    if (typeof rawValue !== 'string' || rawValue.trim() === '') {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return Object.entries(parsed).reduce((accumulator, [userId, entry]) => {
      const normalizedId = normalizeUserId(userId);
      if (!normalizedId) {
        return accumulator;
      }

      accumulator[normalizedId] = clonePreferencesEntry(entry);
      return accumulator;
    }, {});
  } catch (error) {
    console.error('Não foi possível ler as preferências de mini-apps armazenadas.', error);
    return null;
  }
}

function persistPreferences(snapshot) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error('Não foi possível salvar as preferências de mini-apps no armazenamento local.', error);
  }
}

function ensureInitialized() {
  if (preferencesByUserId) {
    return;
  }

  const persisted = readPersistedPreferences();
  preferencesByUserId = persisted ?? {};

  if (!persisted) {
    persistPreferences(preferencesByUserId);
  }
}

function notifyListeners(userId) {
  const payload = {
    userId: normalizeUserId(userId),
    preferences: getMiniAppPreferencesSnapshot(),
  };

  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error('Erro ao notificar assinante de preferências de mini-apps.', error);
    }
  });
}

export function getMiniAppPreferencesSnapshot() {
  ensureInitialized();

  return Object.entries(preferencesByUserId).reduce((accumulator, [userId, entry]) => {
    accumulator[userId] = clonePreferencesEntry(entry);
    return accumulator;
  }, {});
}

export function getUserMiniAppPreferences(userId) {
  ensureInitialized();

  const normalizedId = normalizeUserId(userId);
  if (!normalizedId) {
    return { favorites: [], saved: [] };
  }

  const entry = preferencesByUserId[normalizedId];
  return clonePreferencesEntry(entry);
}

export function subscribeMiniAppPreferences(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  ensureInitialized();

  listeners.add(listener);

  try {
    listener({ userId: null, preferences: getMiniAppPreferencesSnapshot() });
  } catch (error) {
    console.error('Erro ao notificar assinante inicial de preferências de mini-apps.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}

function ensureUserEntry(userId) {
  ensureInitialized();

  const normalizedId = normalizeUserId(userId);
  if (!normalizedId) {
    return null;
  }

  if (!preferencesByUserId[normalizedId]) {
    preferencesByUserId[normalizedId] = { favorites: [], saved: [] };
  }

  return preferencesByUserId[normalizedId];
}

function commitPreferences(userId) {
  persistPreferences(preferencesByUserId);
  notifyListeners(userId);
}

export function toggleMiniAppFavorite(userId, appId) {
  const normalizedId = normalizeUserId(userId);
  const normalizedAppId = normalizeMiniAppId(appId);

  if (!normalizedId || !normalizedAppId) {
    return { success: false, reason: 'invalid-input' };
  }

  const entry = ensureUserEntry(normalizedId);
  if (!entry) {
    return { success: false, reason: 'invalid-input' };
  }

  const favorites = new Set(entry.favorites);

  if (favorites.has(normalizedAppId)) {
    favorites.delete(normalizedAppId);
    entry.favorites = Array.from(favorites);
    commitPreferences(normalizedId);
    return { success: true, added: false };
  }

  if (favorites.size >= MAX_FAVORITE_MINI_APPS) {
    return { success: false, reason: 'favorite-limit-exceeded', limit: MAX_FAVORITE_MINI_APPS };
  }

  favorites.add(normalizedAppId);
  entry.favorites = Array.from(favorites);
  commitPreferences(normalizedId);
  return { success: true, added: true };
}

export function toggleMiniAppSaved(userId, appId) {
  const normalizedId = normalizeUserId(userId);
  const normalizedAppId = normalizeMiniAppId(appId);

  if (!normalizedId || !normalizedAppId) {
    return { success: false, reason: 'invalid-input' };
  }

  const entry = ensureUserEntry(normalizedId);
  if (!entry) {
    return { success: false, reason: 'invalid-input' };
  }

  const saved = new Set(entry.saved);

  if (saved.has(normalizedAppId)) {
    saved.delete(normalizedAppId);
    entry.saved = Array.from(saved);
    commitPreferences(normalizedId);
    return { success: true, added: false };
  }

  saved.add(normalizedAppId);
  entry.saved = Array.from(saved);
  commitPreferences(normalizedId);
  return { success: true, added: true };
}

export function resetMiniAppPreferences(snapshot = {}) {
  preferencesByUserId = Object.entries(snapshot).reduce((accumulator, [userId, entry]) => {
    const normalizedId = normalizeUserId(userId);
    if (!normalizedId) {
      return accumulator;
    }

    accumulator[normalizedId] = clonePreferencesEntry(entry);
    return accumulator;
  }, {});

  persistPreferences(preferencesByUserId);
  notifyListeners(null);
}
