import { getSetting, setSetting } from '../../shared/storage/idb/marcocore.js';
import {
  MINIAPP_FAVORITE_LIMIT,
  MINIAPP_SAVED_LIMIT,
  createEmptyMiniAppPreferences,
  cloneMiniAppPreferences,
  normalizeMiniAppPreferenceRecord,
  sanitizeMiniAppId,
} from './miniapp-preferences-helpers.js';

const STORAGE_KEY = 'miniapp-device-preferences';

let cachedPreferences = createEmptyMiniAppPreferences();
let loadPromise = null;
let useMemoryFallback = false;
let memoryPreferences = createEmptyMiniAppPreferences();
let hasLoggedFallback = false;

function logFallbackOnce(error, context) {
  if (hasLoggedFallback) {
    return;
  }

  console.warn(`Preferências de MiniApp: usando fallback em memória (${context}).`, error);
  hasLoggedFallback = true;
}

async function readFromStorage() {
  try {
    const stored = await getSetting(STORAGE_KEY);
    if (!stored) {
      return createEmptyMiniAppPreferences();
    }

    return normalizeMiniAppPreferenceRecord(stored);
  } catch (error) {
    useMemoryFallback = true;
    logFallbackOnce(error, 'leitura');
    return cloneMiniAppPreferences(memoryPreferences);
  }
}

async function writeToStorage(preferences) {
  if (useMemoryFallback) {
    memoryPreferences = cloneMiniAppPreferences(preferences);
    return cloneMiniAppPreferences(preferences);
  }

  try {
    await setSetting(STORAGE_KEY, { miniApps: preferences });
    return cloneMiniAppPreferences(preferences);
  } catch (error) {
    useMemoryFallback = true;
    memoryPreferences = cloneMiniAppPreferences(preferences);
    logFallbackOnce(error, 'gravação');
    return cloneMiniAppPreferences(preferences);
  }
}

async function ensureLoaded() {
  if (!loadPromise) {
    loadPromise = (async () => {
      const stored = await readFromStorage();
      cachedPreferences = cloneMiniAppPreferences(stored);
      memoryPreferences = cloneMiniAppPreferences(stored);
      return cachedPreferences;
    })().catch((error) => {
      console.error('Preferências de MiniApp: falha ao carregar, iniciando com dados vazios.', error);
      useMemoryFallback = true;
      cachedPreferences = cloneMiniAppPreferences(memoryPreferences);
      return cachedPreferences;
    });
  }

  return loadPromise;
}

function buildNormalizedSnapshot(saved, favorites) {
  return normalizeMiniAppPreferenceRecord({
    miniApps: {
      saved,
      favorites,
    },
  });
}

async function persistDevicePreferences(preferences) {
  const normalized = normalizeMiniAppPreferenceRecord({ miniApps: preferences });
  const persisted = await writeToStorage(normalized);
  cachedPreferences = cloneMiniAppPreferences(persisted);
  return cloneMiniAppPreferences(cachedPreferences);
}

export function getActiveMiniAppPreferences() {
  return {
    userId: null,
    saved: cachedPreferences.saved.slice(),
    favorites: cachedPreferences.favorites.slice(),
  };
}

export async function toggleMiniAppSaved(miniAppId, { targetState } = {}) {
  await ensureLoaded();

  const normalizedId = sanitizeMiniAppId(miniAppId);

  if (!normalizedId) {
    const error = new Error('MiniApp inválido.');
    error.reason = 'invalid-miniapp-id';
    throw error;
  }

  const savedSet = new Set(cachedPreferences.saved);
  const favoritesSet = new Set(cachedPreferences.favorites);

  const desiredState =
    typeof targetState === 'boolean' ? targetState : savedSet.has(normalizedId) === false;

  let hasChanges = false;

  if (desiredState) {
    if (!savedSet.has(normalizedId)) {
      savedSet.add(normalizedId);
      hasChanges = true;
    }
  } else {
    if (savedSet.delete(normalizedId)) {
      hasChanges = true;
    }

    if (favoritesSet.delete(normalizedId)) {
      hasChanges = true;
    }
  }

  const nextSaved = Array.from(savedSet).slice(0, MINIAPP_SAVED_LIMIT);
  const nextFavorites = Array.from(favoritesSet)
    .filter((id) => savedSet.has(id))
    .slice(0, MINIAPP_FAVORITE_LIMIT);

  const normalized = buildNormalizedSnapshot(nextSaved, nextFavorites);

  if (!hasChanges) {
    return {
      saved: normalized.saved.includes(normalizedId),
      preferences: normalized,
    };
  }

  const updatedPreferences = await persistDevicePreferences(normalized);
  return {
    saved: updatedPreferences.saved.includes(normalizedId),
    preferences: updatedPreferences,
  };
}

export async function toggleMiniAppFavorite(miniAppId, { targetState } = {}) {
  await ensureLoaded();

  const normalizedId = sanitizeMiniAppId(miniAppId);

  if (!normalizedId) {
    const error = new Error('MiniApp inválido.');
    error.reason = 'invalid-miniapp-id';
    throw error;
  }

  const savedSet = new Set(cachedPreferences.saved);
  const favoritesSet = new Set(cachedPreferences.favorites);

  const desiredState =
    typeof targetState === 'boolean' ? targetState : favoritesSet.has(normalizedId) === false;

  if (desiredState && !favoritesSet.has(normalizedId)) {
    if (favoritesSet.size >= MINIAPP_FAVORITE_LIMIT) {
      const error = new Error(`Você atingiu o limite de ${MINIAPP_FAVORITE_LIMIT} MiniApps favoritos.`);
      error.reason = 'favorite-limit-exceeded';
      error.details = { limit: MINIAPP_FAVORITE_LIMIT };
      throw error;
    }

    favoritesSet.add(normalizedId);
    savedSet.add(normalizedId);
  } else if (!desiredState && favoritesSet.has(normalizedId)) {
    favoritesSet.delete(normalizedId);
  }

  const filteredFavorites = Array.from(favoritesSet).filter((id) => savedSet.has(id));
  const nextFavorites = filteredFavorites.slice(0, MINIAPP_FAVORITE_LIMIT);
  const nextSaved = Array.from(savedSet).slice(0, MINIAPP_SAVED_LIMIT);

  const normalized = buildNormalizedSnapshot(nextSaved, nextFavorites);

  const favoritesChanged =
    cachedPreferences.favorites.length !== normalized.favorites.length ||
    cachedPreferences.favorites.some((id, index) => normalized.favorites[index] !== id);
  const savedChanged =
    cachedPreferences.saved.length !== normalized.saved.length ||
    cachedPreferences.saved.some((id, index) => normalized.saved[index] !== id);

  if (!favoritesChanged && !savedChanged) {
    return {
      favorite: normalized.favorites.includes(normalizedId),
      preferences: normalized,
    };
  }

  const updatedPreferences = await persistDevicePreferences(normalized);
  return {
    favorite: updatedPreferences.favorites.includes(normalizedId),
    preferences: updatedPreferences,
  };
}

export async function resetMiniAppPreferencesForTests() {
  cachedPreferences = createEmptyMiniAppPreferences();
  memoryPreferences = createEmptyMiniAppPreferences();
  loadPromise = Promise.resolve(cloneMiniAppPreferences(cachedPreferences));

  if (!useMemoryFallback) {
    try {
      await setSetting(STORAGE_KEY, { miniApps: cachedPreferences });
    } catch (error) {
      useMemoryFallback = true;
      memoryPreferences = cloneMiniAppPreferences(cachedPreferences);
      logFallbackOnce(error, 'reset');
    }
  }

  return cloneMiniAppPreferences(cachedPreferences);
}

export { MINIAPP_FAVORITE_LIMIT, MINIAPP_SAVED_LIMIT };

ensureLoaded();
