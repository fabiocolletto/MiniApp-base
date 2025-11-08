(function (root) {
  const STORAGE_KEY = 'miniapp-prefeito:theme';
  const THEMES = ['light', 'dark', 'auto'];

  let currentPreference = 'auto';
  let mediaQuery;

  function normalize(value) {
    if (typeof value !== 'string') return 'auto';
    return THEMES.includes(value) ? value : 'auto';
  }

  function readStoredPreference() {
    try {
      return root.localStorage ? root.localStorage.getItem(STORAGE_KEY) : null;
    } catch (_) {
      return null;
    }
  }

  function persistPreference(value) {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, value);
      }
    } catch (_) {
      /* ignore persistence errors */
    }
  }

  function ensureMediaListener() {
    if (!root || typeof root.matchMedia !== 'function') {
      return null;
    }
    if (!mediaQuery) {
      try {
        mediaQuery = root.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery) {
          const handler = function () {
            if (currentPreference === 'auto') {
              applyPreference('auto');
            }
          };
          if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handler);
          } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handler);
          }
        }
      } catch (_) {
        mediaQuery = null;
      }
    }
    return mediaQuery;
  }

  function resolveTheme(preference) {
    const normalized = normalize(preference);
    const mq = ensureMediaListener();
    if (normalized === 'auto') {
      if (mq) {
        return mq.matches ? 'dark' : 'light';
      }
      try {
        return root.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch (_) {
        return 'light';
      }
    }
    return normalized;
  }

  function markActiveButton(preference) {
    if (!root.document) return;
    const buttons = root.document.querySelectorAll('#theme .chipbtn[data-theme]');
    buttons.forEach(function (btn) {
      const value = btn.getAttribute('data-theme');
      const isActive = value === preference;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyPreference(preference) {
    const normalized = normalize(preference);
    currentPreference = normalized;
    const rootEl = root.document ? root.document.documentElement : null;
    if (rootEl) {
      const resolved = resolveTheme(normalized);
      rootEl.setAttribute('data-pref-theme', normalized);
      rootEl.setAttribute('data-theme', resolved);
    }
    markActiveButton(normalized);
    return normalized;
  }

  function setPreference(preference) {
    const normalized = applyPreference(preference);
    persistPreference(normalized);
    return normalized;
  }

  function closeThemeModalFallback() {
    if (!root || !root.location || root.location.hash !== '#theme') return;
    try {
      if (root.history && typeof root.history.replaceState === 'function') {
        const base = root.location.pathname + root.location.search;
        root.history.replaceState(null, '', base);
      } else {
        root.location.hash = '';
      }
      const evt = new Event('hashchange');
      root.dispatchEvent(evt);
    } catch (_) {
      /* ignore navigation errors */
    }
  }

  function bindThemeButtons() {
    if (!root.document) return;
    const buttons = root.document.querySelectorAll('#theme .chipbtn[data-theme]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        const value = btn.getAttribute('data-theme');
        setPreference(value);
        if (typeof root.closeActiveModal === 'function') {
          root.closeActiveModal();
        } else {
          closeThemeModalFallback();
        }
      });
    });
  }

  const stored = normalize(readStoredPreference() || 'auto');
  applyPreference(stored);

  if (root.document) {
    const ready = function () {
      markActiveButton(currentPreference);
      bindThemeButtons();
    };
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  }

  root.ThemeManager = {
    apply: applyPreference,
    set: setPreference,
    getPreference: function () {
      return currentPreference;
    },
  };
})(window);
