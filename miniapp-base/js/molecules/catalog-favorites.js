(function (window) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});
  var molecules = root.molecules || (root.molecules = {});

  var safeGetItem = atoms.safeGetItem || function () { return null; };
  var safeSetItem = atoms.safeSetItem || function () { return false; };
  var normalizeLocale = atoms.normalizeLocale || function (locale, supported, fallback) {
    if (Array.isArray(supported) && supported.indexOf(locale) !== -1) {
      return locale;
    }
    return fallback || (supported && supported[0]) || 'pt-BR';
  };

  function sanitizeIds(ids, validIds) {
    if (!Array.isArray(ids)) {
      return [];
    }

    var seen = new Set();
    return ids.filter(function (id) {
      if (typeof id !== 'string' || !validIds.has(id) || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  }

  function parseStoredIds(raw, validIds) {
    if (!raw) {
      return [];
    }

    try {
      var parsed = JSON.parse(raw);
      return sanitizeIds(parsed, validIds);
    } catch (_error) {
      return [];
    }
  }

  function createFavoriteManager(options) {
    var storageKey = options.storageKey;
    var apps = Array.isArray(options.apps) ? options.apps : [];
    var defaultFavorites = Array.isArray(options.defaultFavorites)
      ? options.defaultFavorites
      : [];
    var supportedLocales = Array.isArray(options.supportedLocales)
      ? options.supportedLocales
      : ['pt-BR'];
    var copy = options.copy || {};

    var validIds = new Set(
      apps
        .filter(function (app) {
          return app && typeof app.id === 'string';
        })
        .map(function (app) {
          return app.id;
        }),
    );

    var stored = parseStoredIds(safeGetItem(storageKey), validIds);
    var initial = stored.length ? stored : sanitizeIds(defaultFavorites, validIds);
    var favorites = new Set(initial);

    function persist() {
      safeSetItem(storageKey, JSON.stringify(Array.from(favorites)));
    }

    function getIds() {
      return Array.from(favorites);
    }

    function isFavorite(id) {
      return favorites.has(id);
    }

    function toggle(id) {
      if (!validIds.has(id)) {
        return false;
      }

      if (favorites.has(id)) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }

      persist();
      return true;
    }

    function getActionCopy(locale, isActive) {
      var normalized = normalizeLocale(locale, supportedLocales, supportedLocales[0]);
      var dictionary = copy[normalized] || copy[supportedLocales[0]] || {};
      return isActive ? dictionary.remove || '' : dictionary.add || '';
    }

    return {
      getIds: getIds,
      isFavorite: isFavorite,
      toggle: toggle,
      getActionCopy: getActionCopy,
    };
  }

  molecules.createFavoriteManager = createFavoriteManager;
})(window);
