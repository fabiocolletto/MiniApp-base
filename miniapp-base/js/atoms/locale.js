(function (window, document) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});

  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(',').map(function (item) {
        return item.trim();
      });
    }

    return [];
  }

  function normalizeLocale(locale, supported, fallback) {
    var normalizedSupported = toArray(supported);
    var defaultLocale = typeof fallback === 'string' && fallback ? fallback : 'pt-BR';

    if (!normalizedSupported.length) {
      return defaultLocale;
    }

    if (typeof locale !== 'string') {
      return normalizedSupported.indexOf(defaultLocale) !== -1
        ? defaultLocale
        : normalizedSupported[0];
    }

    var trimmed = locale.trim();
    if (!trimmed) {
      return normalizedSupported[0];
    }

    var directMatch = normalizedSupported.find(function (candidate) {
      return candidate.toLowerCase() === trimmed.toLowerCase();
    });

    if (directMatch) {
      return directMatch;
    }

    var base = trimmed.split('-')[0];
    var fuzzyMatch = normalizedSupported.find(function (candidate) {
      return candidate.toLowerCase().indexOf(base.toLowerCase()) === 0;
    });

    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    return normalizedSupported.indexOf(defaultLocale) !== -1
      ? defaultLocale
      : normalizedSupported[0];
  }

  function getDocumentLocale(supported, fallback) {
    var docLang = (document.documentElement && document.documentElement.lang) || '';
    return normalizeLocale(docLang, supported, fallback);
  }

  atoms.normalizeLocale = normalizeLocale;
  atoms.getDocumentLocale = getDocumentLocale;
})(window, document);
