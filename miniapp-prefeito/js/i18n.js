(function (root) {
  const DEFAULT_LANG = 'pt-BR';
  const SUPPORTED = ['pt-BR', 'es-ES', 'en-US'];
  const NAMESPACES = ['system', 'common', 'kpi', 'charts', 'reports', 'miniapp_prefeito'];
  const STORAGE_KEY = 'miniapp-prefeito:lang';

  const inlineEl = document.getElementById('i18n-pt-BR');
  let inlineDict = {};
  if (inlineEl && inlineEl.textContent) {
    try { inlineDict = JSON.parse(inlineEl.textContent); } catch { inlineDict = {}; }
  }

  const cache = Object.create(null);
  if (Object.keys(inlineDict).length) {
    cache[DEFAULT_LANG] = Object.assign({}, inlineDict);
  }
  const listeners = new Set();
  let readyPromise = null;
  let languageChangedHooked = false;

  function clone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : {};
  }

  function deepMerge(target, source) {
    target = target || {};
    if (!source) return target;
    Object.keys(source).forEach(function (key) {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = deepMerge(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  function collectKeys(obj, prefix, bucket) {
    bucket = bucket || {};
    if (!obj) return bucket;
    Object.keys(obj).forEach(function (key) {
      const value = obj[key];
      const next = prefix ? prefix + '.' + key : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        collectKeys(value, next, bucket);
      } else {
        bucket[next] = true;
      }
    });
    return bucket;
  }

  async function auditTranslations(baseData) {
    const baseMap = collectKeys(baseData, '', {});
    const missingByLang = {};
    await Promise.all(SUPPORTED.map(async function (lang) {
      const data = lang === DEFAULT_LANG ? baseData : await fetchBundle(lang);
      const map = collectKeys(data, '', {});
      const missing = Object.keys(baseMap).filter(function (key) { return !map[key]; });
      if (missing.length) {
        missingByLang[lang] = missing;
      }
    }));
    if (Object.keys(missingByLang).length) {
      try {
        console.warn('[i18n] Missing translations detected', missingByLang);
      } catch (_) {
        /* eslint-disable-line no-empty */
      }
    }
    return missingByLang;
  }

  function applyInterpolation(str, options) {
    if (typeof str !== 'string' || !options) return str;
    return str.replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, token) {
      if (Object.prototype.hasOwnProperty.call(options, token)) {
        return options[token];
      }
      return '';
    });
  }

  function getNested(obj, path) {
    return path.split('.').reduce(function (acc, part) {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }

  function translate(key, options) {
    if (root.i18next && typeof root.i18next.t === 'function') {
      const out = root.i18next.t(key, options);
      if (typeof out === 'string' && out !== key) {
        return out;
      }
    }
    if (cache[DEFAULT_LANG] && typeof cache[DEFAULT_LANG][key] !== 'undefined') {
      return applyInterpolation(cache[DEFAULT_LANG][key], options);
    }
    const fallback = getNested(cache[DEFAULT_LANG], key);
    if (typeof fallback !== 'undefined') return applyInterpolation(fallback, options);
    if (typeof inlineDict[key] !== 'undefined') return applyInterpolation(inlineDict[key], options);
    return (options && options.defaultValue) || key;
  }

  function matchLanguage(input) {
    if (!input) return DEFAULT_LANG;
    if (SUPPORTED.includes(input)) return input;
    const base = input.split('-')[0];
    const candidate = SUPPORTED.find(function (lng) { return lng.split('-')[0] === base; });
    return candidate || DEFAULT_LANG;
  }

  async function fetchBundle(lang) {
    if (cache[lang]) return cache[lang];
    let data = {};
    for (const ns of NAMESPACES) {
      const url = `./i18n/locales/${lang}/${ns}.json`;
      try {
        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp.ok) continue;
        const json = await resp.json();
        data = deepMerge(data, json);
      } catch (_) {
        /* ignore fetch errors so we can rely on inline fallback */
      }
    }
    if (lang === DEFAULT_LANG) {
      data = deepMerge(clone(inlineDict), data);
    }
    cache[lang] = data;
    return data;
  }

  function markActiveLanguage() {
    const current = (root.i18next && root.i18next.language) || DEFAULT_LANG;
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      const lang = btn.getAttribute('data-lang');
      const isActive = lang === current;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      const key = node.getAttribute('data-i18n');
      if (!key) return;
      const txt = translate(key);
      if (typeof txt !== 'undefined') {
        node.textContent = txt;
      }
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (node) {
      const map = node.getAttribute('data-i18n-attr');
      if (!map) return;
      map.split(';').forEach(function (entry) {
        const parts = entry.split(':');
        if (parts.length !== 2) return;
        const attr = parts[0].trim();
        const key = parts[1].trim();
        if (!attr || !key) return;
        const value = translate(key);
        if (typeof value !== 'undefined') {
          node.setAttribute(attr, value);
        }
      });
    });
    document.documentElement.lang = (root.i18next && root.i18next.language) || DEFAULT_LANG;
    markActiveLanguage();
  }

  function hookLanguageChange() {
    if (!root.i18next || languageChangedHooked) return;
    if (typeof root.i18next.on === 'function') {
      root.i18next.on('languageChanged', function (lng) {
        applyTranslations();
        listeners.forEach(function (fn) {
          try { fn(lng); } catch (_) { /* noop */ }
        });
      });
      languageChangedHooked = true;
    }
  }

  async function ensureInit() {
    if (readyPromise) return readyPromise;
    readyPromise = (async function () {
      const stored = (() => {
        try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
      })();
      const preferred = matchLanguage(stored || navigator.language || DEFAULT_LANG);
      const fallbackData = await fetchBundle(DEFAULT_LANG);

      if (!root.i18next || typeof root.i18next.init !== 'function') {
        cache[DEFAULT_LANG] = fallbackData;
        applyTranslations();
        bindLanguageSwitcher();
        return { language: DEFAULT_LANG, t: translate };
      }

      cache[DEFAULT_LANG] = fallbackData;
      await auditTranslations(fallbackData);
      if (!root.i18next.isInitialized) {
        await root.i18next.init({
          lng: preferred,
          fallbackLng: DEFAULT_LANG,
          resources: {
            [DEFAULT_LANG]: { translation: fallbackData }
          },
          interpolation: { escapeValue: false }
        });
      } else if (!root.i18next.hasResourceBundle(DEFAULT_LANG, 'translation')) {
        root.i18next.addResourceBundle(DEFAULT_LANG, 'translation', fallbackData, true, true);
      }

      if (preferred !== DEFAULT_LANG) {
        const data = await fetchBundle(preferred);
        if (Object.keys(data).length) {
          root.i18next.addResourceBundle(preferred, 'translation', data, true, true);
        }
        await root.i18next.changeLanguage(preferred);
      } else {
        await root.i18next.changeLanguage(DEFAULT_LANG);
      }

      hookLanguageChange();
      applyTranslations();
      bindLanguageSwitcher();
      return { language: root.i18next.language, t: translate };
    })();
    return readyPromise;
  }

  async function changeLanguage(lang) {
    const target = matchLanguage(lang);
    const state = await ensureInit();
    if (!root.i18next || typeof root.i18next.changeLanguage !== 'function') {
      cache[DEFAULT_LANG] = cache[DEFAULT_LANG] || {};
      applyTranslations();
      return state.language;
    }

    let bundle = cache[target];
    if (!root.i18next.hasResourceBundle(target, 'translation')) {
      if (!bundle || !Object.keys(bundle).length) {
        bundle = await fetchBundle(target);
      }
      if (bundle && Object.keys(bundle).length) {
        cache[target] = bundle;
        root.i18next.addResourceBundle(target, 'translation', bundle, true, true);
      }
    }

    await root.i18next.changeLanguage(target);
    try { localStorage.setItem(STORAGE_KEY, target); } catch (_) { /* ignore */ }
    return target;
  }

  function bindLanguageSwitcher() {
    if (bindLanguageSwitcher.bound) return;
    bindLanguageSwitcher.bound = true;
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        const lang = btn.getAttribute('data-lang');
        changeLanguage(lang).then(function () {
          if (window.closeActiveModal && typeof window.closeActiveModal === 'function') {
            window.closeActiveModal();
          } else if (window.location && window.location.hash === '#language') {
            try {
              if (window.history && typeof window.history.replaceState === 'function') {
                const base = window.location.pathname + window.location.search;
                window.history.replaceState(null, '', base);
              } else {
                window.location.hash = '';
              }
              const evt = new Event('hashchange');
              window.dispatchEvent(evt);
            } catch (_) {
              /* ignore */
            }
          }
        });
      });
    });
  }

  function onChange(handler) {
    if (typeof handler === 'function') {
      listeners.add(handler);
    }
  }

  root.I18nManager = {
    ready: ensureInit,
    changeLanguage,
    onChange,
    apply: applyTranslations,
    t: translate
  };
})(window);
