(function (window) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});

  function canUseLocalStorage() {
    try {
      return typeof window.localStorage !== 'undefined';
    } catch (_error) {
      return false;
    }
  }

  function safeGetItem(key) {
    if (!canUseLocalStorage()) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeSetItem(key, value) {
    if (!canUseLocalStorage()) {
      return false;
    }

    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function safeRemoveItem(key) {
    if (!canUseLocalStorage()) {
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (_error) {
      return false;
    }
  }

  atoms.safeGetItem = safeGetItem;
  atoms.safeSetItem = safeSetItem;
  atoms.safeRemoveItem = safeRemoveItem;
})(window);
