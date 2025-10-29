const MINIAPP_SAVED_LIMIT = 100;
const MINIAPP_FAVORITE_LIMIT = 12;

function createEmptyMiniAppPreferences() {
  return {
    saved: [],
    favorites: [],
  };
}

function sanitizeMiniAppId(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (value && typeof value === 'object') {
    if (typeof value.id === 'string') {
      return sanitizeMiniAppId(value.id);
    }

    if (typeof value.value === 'string') {
      return sanitizeMiniAppId(value.value);
    }

    if (Array.isArray(value.ids)) {
      return sanitizeMiniAppId(value.ids[0]);
    }

    if (typeof value[Symbol.iterator] === 'function') {
      try {
        for (const entry of value) {
          const sanitized = sanitizeMiniAppId(entry);
          if (sanitized) {
            return sanitized;
          }
        }
      } catch (error) {
        console.warn('Não foi possível sanitizar MiniApp iterable.', error);
      }
    }
  }

  return '';
}

function collectMiniAppCandidates(values) {
  const collected = [];

  values.forEach((value) => {
    if (value == null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        collected.push(entry);
      });
      return;
    }

    if (typeof value === 'string') {
      collected.push(value);
      return;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      collected.push(String(value));
      return;
    }

    if (value && typeof value === 'object') {
      if (typeof value.id === 'string') {
        collected.push(value.id);
        return;
      }

      if (typeof value.value === 'string') {
        collected.push(value.value);
        return;
      }

      if (Array.isArray(value.ids)) {
        value.ids.forEach((entry) => {
          collected.push(entry);
        });
        return;
      }

      if (typeof value[Symbol.iterator] === 'function') {
        try {
          for (const entry of value) {
            collected.push(entry);
          }
        } catch (error) {
          console.warn('Não foi possível coletar ids de MiniApp do iterável fornecido.', error);
        }
        return;
      }
    }
  });

  return collected;
}

function dedupeMiniAppIds(items, limit) {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const sanitized = sanitizeMiniAppId(item);
    if (!sanitized || seen.has(sanitized)) {
      return;
    }

    seen.add(sanitized);
    result.push(sanitized);
  });

  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    return result.slice(0, limit);
  }

  return result;
}

function ensureFavoritesIncluded(saved, favorites) {
  const savedSet = new Set(saved);
  const merged = saved.slice();

  favorites.forEach((id) => {
    if (!savedSet.has(id)) {
      savedSet.add(id);
      merged.push(id);
    }
  });

  return merged;
}

function normalizeMiniAppPreferenceRecord(raw) {
  const base = createEmptyMiniAppPreferences();

  if (!raw || typeof raw !== 'object') {
    return base;
  }

  const container = typeof raw.miniApps === 'object' && raw.miniApps !== null ? raw.miniApps : null;

  const savedCandidates = collectMiniAppCandidates([
    container?.saved,
    container?.savedMiniApps,
    container?.savedMiniAppIds,
    container?.miniAppsSaved,
    raw.savedMiniApps,
    raw.savedMiniAppIds,
    raw.miniAppsSaved,
    raw.miniAppSaved,
    raw.saved,
  ]);

  const favoritesCandidates = collectMiniAppCandidates([
    container?.favorites,
    container?.favoriteMiniApps,
    container?.favoriteMiniAppIds,
    container?.miniAppsFavorites,
    raw.favoriteMiniApps,
    raw.favoriteMiniAppIds,
    raw.miniAppsFavorites,
    raw.miniAppFavorites,
    raw.favorites,
  ]);

  const normalizedSaved = dedupeMiniAppIds(savedCandidates, MINIAPP_SAVED_LIMIT);
  const normalizedFavorites = dedupeMiniAppIds(favoritesCandidates, MINIAPP_FAVORITE_LIMIT);

  const savedWithFavorites = ensureFavoritesIncluded(normalizedSaved, normalizedFavorites).slice(
    0,
    MINIAPP_SAVED_LIMIT,
  );

  return {
    saved: savedWithFavorites,
    favorites: normalizedFavorites,
  };
}

function combineExtractions(...extractions) {
  const combined = { provided: false, values: [] };

  extractions.forEach((extraction) => {
    if (!extraction) {
      return;
    }

    if (extraction.provided) {
      combined.provided = true;
    }

    if (Array.isArray(extraction.values)) {
      combined.values.push(...extraction.values);
    }
  });

  return combined;
}

function extractUpdates(container, keys) {
  if (!container || typeof container !== 'object') {
    return { provided: false, values: [] };
  }

  let provided = false;
  const collected = [];

  keys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(container, key)) {
      return;
    }

    provided = true;
    collected.push(container[key]);
  });

  return {
    provided,
    values: collectMiniAppCandidates(collected),
  };
}

function sanitizeMiniAppPreferencesUpdates(source) {
  if (!source || typeof source !== 'object') {
    return { hasUpdates: false, updates: {} };
  }

  const container = typeof source.miniApps === 'object' && source.miniApps !== null ? source.miniApps : null;

  const savedExtraction = combineExtractions(
    extractUpdates(container, ['saved', 'savedMiniApps', 'savedMiniAppIds', 'miniAppsSaved']),
    extractUpdates(source, ['savedMiniApps', 'savedMiniAppIds', 'miniAppsSaved', 'miniAppSaved']),
  );

  const favoritesExtraction = combineExtractions(
    extractUpdates(container, ['favorites', 'favoriteMiniApps', 'favoriteMiniAppIds', 'miniAppsFavorites']),
    extractUpdates(source, ['favoriteMiniApps', 'favoriteMiniAppIds', 'miniAppsFavorites', 'miniAppFavorites']),
  );

  const updates = {};
  let hasUpdates = false;

  if (savedExtraction.provided) {
    updates.saved = dedupeMiniAppIds(savedExtraction.values, MINIAPP_SAVED_LIMIT);
    hasUpdates = true;
  }

  if (favoritesExtraction.provided) {
    updates.favorites = dedupeMiniAppIds(favoritesExtraction.values, MINIAPP_FAVORITE_LIMIT);
    hasUpdates = true;
  }

  return { hasUpdates, updates };
}

function cloneMiniAppPreferences(preferences) {
  if (!preferences || typeof preferences !== 'object') {
    return createEmptyMiniAppPreferences();
  }

  return {
    saved: Array.isArray(preferences.saved) ? preferences.saved.slice() : [],
    favorites: Array.isArray(preferences.favorites) ? preferences.favorites.slice() : [],
  };
}

export {
  MINIAPP_SAVED_LIMIT,
  MINIAPP_FAVORITE_LIMIT,
  createEmptyMiniAppPreferences,
  sanitizeMiniAppId,
  normalizeMiniAppPreferenceRecord,
  sanitizeMiniAppPreferencesUpdates,
  cloneMiniAppPreferences,
};
