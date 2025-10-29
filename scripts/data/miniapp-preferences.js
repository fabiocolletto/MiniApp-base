import { updateUser } from './user-store.js';
import { getActiveUserId, getActiveUser } from './session-store.js';
import {
  MINIAPP_FAVORITE_LIMIT,
  MINIAPP_SAVED_LIMIT,
  normalizeMiniAppPreferenceRecord,
  sanitizeMiniAppId,
} from './miniapp-preferences-helpers.js';

function createInactiveSessionError() {
  const error = new Error('Faça login para gerenciar seus MiniApps.');
  error.reason = 'inactive-session';
  return error;
}

function createFavoriteLimitError() {
  const error = new Error(`Você atingiu o limite de ${MINIAPP_FAVORITE_LIMIT} MiniApps favoritos.`);
  error.reason = 'favorite-limit-exceeded';
  error.details = { limit: MINIAPP_FAVORITE_LIMIT };
  return error;
}

async function persistPreferences(userId, preferences) {
  const updatedUser = await updateUser(userId, {
    preferences: {
      miniApps: {
        saved: preferences.saved,
        favorites: preferences.favorites,
      },
    },
  });

  return normalizeMiniAppPreferenceRecord(updatedUser?.preferences ?? {});
}

function buildNormalizedSnapshot(saved, favorites) {
  return normalizeMiniAppPreferenceRecord({
    miniApps: {
      saved,
      favorites,
    },
  });
}

export function getActiveMiniAppPreferences() {
  const activeUserId = getActiveUserId();
  const activeUser = getActiveUser();

  if (activeUserId == null || !activeUser) {
    return { userId: null, saved: [], favorites: [] };
  }

  const normalized = normalizeMiniAppPreferenceRecord(activeUser?.preferences ?? {});
  return {
    userId: Number(activeUserId),
    saved: normalized.saved,
    favorites: normalized.favorites,
  };
}

export async function toggleMiniAppSaved(miniAppId, { targetState } = {}) {
  const normalizedId = sanitizeMiniAppId(miniAppId);

  if (!normalizedId) {
    const error = new Error('MiniApp inválido.');
    error.reason = 'invalid-miniapp-id';
    throw error;
  }

  const snapshot = getActiveMiniAppPreferences();

  if (snapshot.userId == null) {
    throw createInactiveSessionError();
  }

  const savedSet = new Set(snapshot.saved);
  const favoritesSet = new Set(snapshot.favorites);

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

  const updatedPreferences = await persistPreferences(snapshot.userId, normalized);
  return {
    saved: updatedPreferences.saved.includes(normalizedId),
    preferences: updatedPreferences,
  };
}

export async function toggleMiniAppFavorite(miniAppId, { targetState } = {}) {
  const normalizedId = sanitizeMiniAppId(miniAppId);

  if (!normalizedId) {
    const error = new Error('MiniApp inválido.');
    error.reason = 'invalid-miniapp-id';
    throw error;
  }

  const snapshot = getActiveMiniAppPreferences();

  if (snapshot.userId == null) {
    throw createInactiveSessionError();
  }

  const savedSet = new Set(snapshot.saved);
  const favoritesSet = new Set(snapshot.favorites);

  const desiredState =
    typeof targetState === 'boolean' ? targetState : favoritesSet.has(normalizedId) === false;

  if (desiredState && !favoritesSet.has(normalizedId)) {
    if (favoritesSet.size >= MINIAPP_FAVORITE_LIMIT) {
      throw createFavoriteLimitError();
    }

    favoritesSet.add(normalizedId);
    savedSet.add(normalizedId);
  } else if (!desiredState && favoritesSet.has(normalizedId)) {
    favoritesSet.delete(normalizedId);
  } else if (!desiredState && !savedSet.has(normalizedId)) {
    // nothing to change
  }

  const filteredFavorites = Array.from(favoritesSet).filter((id) => savedSet.has(id));
  const nextFavorites = filteredFavorites.slice(0, MINIAPP_FAVORITE_LIMIT);
  const nextSaved = Array.from(savedSet).slice(0, MINIAPP_SAVED_LIMIT);

  const normalized = buildNormalizedSnapshot(nextSaved, nextFavorites);

  const favoritesChanged =
    snapshot.favorites.length !== normalized.favorites.length ||
    snapshot.favorites.some((id, index) => normalized.favorites[index] !== id);
  const savedChanged =
    snapshot.saved.length !== normalized.saved.length ||
    snapshot.saved.some((id, index) => normalized.saved[index] !== id);

  if (!favoritesChanged && !savedChanged) {
    return {
      favorite: normalized.favorites.includes(normalizedId),
      preferences: normalized,
    };
  }

  const updatedPreferences = await persistPreferences(snapshot.userId, normalized);
  return {
    favorite: updatedPreferences.favorites.includes(normalizedId),
    preferences: updatedPreferences,
  };
}

export { MINIAPP_FAVORITE_LIMIT, MINIAPP_SAVED_LIMIT };
