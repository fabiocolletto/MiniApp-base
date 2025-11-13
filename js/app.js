import {
  DEFAULT_LOCALE,
  getAvailableLocales,
  getDirection,
  getLanguageName,
  getShellMessages,
} from './i18n.js';
import { createCatalogApp } from './catalog-app.js';

const headerTitle = document.querySelector('[data-header-title]');
const headerSubtitle = document.querySelector('[data-header-subtitle]');
const openCatalogBtn = document.getElementById('openCatalog');
const downloadMiniAppBtn = document.getElementById('downloadMiniApp');
const downloadMiniAppLabel = downloadMiniAppBtn
  ? downloadMiniAppBtn.querySelector('[data-download-label]')
  : null;
let themeToggleBtn = document.getElementById('themeToggle');
let themeToggleLabel = themeToggleBtn ? themeToggleBtn.querySelector('[data-theme-toggle-label]') : null;
const languageToggleBtn = document.getElementById('languageToggle');
const languageToggleLabel = languageToggleBtn
  ? languageToggleBtn.querySelector('[data-language-toggle-label]')
  : null;
const installBtn = document.getElementById('installPWA');
const appFrame = document.getElementById('miniapp-panel');
const catalogRoot = document.getElementById('catalog-app');
const catalogView = document.getElementById('catalog-view');
const appView = document.getElementById('app-view');
const miniAppRoot = document.getElementById('miniapp-root');
const themeMetaTag = document.querySelector('meta[name="theme-color"]');
const themeIconElements = Array.from(
  document.querySelectorAll('link[data-icon-light], link[data-icon-dark]'),
);
const themeIcons = themeIconElements.map((element) => {
  const { iconLight, iconDark } = element.dataset;
  const fallbackHref = element.getAttribute('href');
  return {
    element,
    lightHref: iconLight || fallbackHref,
    darkHref: iconDark || iconLight || fallbackHref,
  };
});

const catalogApp = catalogRoot ? createCatalogApp(catalogRoot) : null;
const catalogEvents = catalogApp ? catalogApp.events : null;

const viewMap = {
  catalog: catalogView,
  app: appView,
};

const LANGUAGE_STORAGE_KEY = 'miniapp-shell.language';
const THEME_STORAGE_KEY = 'miniapp-shell.theme';
const LAST_MINIAPP_STORAGE_KEY = 'miniapp-shell.last';
const THEME_META_COLORS = {
  light: '#ffffff',
  dark: '#0b1220',
};

const availableLocales = getAvailableLocales();
let currentLanguage = DEFAULT_LOCALE;
let shellMessages = getShellMessages(DEFAULT_LOCALE);
let currentTheme = 'light';
let defaultCatalogHeader = {
  title: shellMessages.header.title,
  subtitle: shellMessages.header.subtitle,
};
let currentHeaderSource = 'shell';
let currentHeaderKey = 'catalog-default';
let currentHeaderMeta = {
  title: headerTitle ? headerTitle.textContent : defaultCatalogHeader.title,
  subtitle: headerSubtitle ? headerSubtitle.textContent : defaultCatalogHeader.subtitle,
};
let currentMiniAppDownloadUrl = null;
let deferredPrompt = null;

function formatTemplate(template, context = {}) {
  if (typeof template !== 'string') {
    return '';
  }
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const trimmed = rawKey.trim();
    return Object.prototype.hasOwnProperty.call(context, trimmed) ? context[trimmed] : '';
  });
}

function setHeader(meta = {}, { source = currentHeaderSource, key = currentHeaderKey } = {}) {
  const nextTitle = typeof meta.title === 'string' ? meta.title : currentHeaderMeta.title;
  const nextSubtitle = typeof meta.subtitle === 'string' ? meta.subtitle : currentHeaderMeta.subtitle;

  if (headerTitle && typeof nextTitle === 'string') {
    headerTitle.textContent = nextTitle;
  }

  if (headerSubtitle && typeof nextSubtitle === 'string') {
    headerSubtitle.textContent = nextSubtitle;
  }

  currentHeaderSource = source;
  currentHeaderKey = key;
  currentHeaderMeta = {
    title: headerTitle ? headerTitle.textContent : nextTitle,
    subtitle: headerSubtitle ? headerSubtitle.textContent : nextSubtitle,
  };
}

function setDownloadTarget(url) {
  currentMiniAppDownloadUrl = typeof url === 'string' && url.trim() ? url : null;
  if (!downloadMiniAppBtn) {
    return;
  }
  const hasUrl = Boolean(currentMiniAppDownloadUrl);
  downloadMiniAppBtn.hidden = !hasUrl;
  downloadMiniAppBtn.disabled = !hasUrl;
  if (hasUrl) {
    downloadMiniAppBtn.removeAttribute('aria-disabled');
    downloadMiniAppBtn.dataset.downloadAvailable = 'true';
    downloadMiniAppBtn.dataset.downloadUrl = currentMiniAppDownloadUrl;
  } else {
    downloadMiniAppBtn.setAttribute('aria-disabled', 'true');
    downloadMiniAppBtn.dataset.downloadAvailable = 'false';
    delete downloadMiniAppBtn.dataset.downloadUrl;
  }
}

function changeView(target) {
  Object.entries(viewMap).forEach(([name, element]) => {
    if (!element) return;
    if (name === target) {
      element.hidden = false;
      element.dataset.active = 'true';
    } else {
      element.hidden = true;
      delete element.dataset.active;
    }
  });

  const isCatalogActive = target === 'catalog';
  const isAppActive = target === 'app';

  if (catalogRoot) {
    if (isCatalogActive) {
      catalogRoot.removeAttribute('inert');
    } else {
      catalogRoot.setAttribute('inert', '');
    }
  }

  if (appFrame) {
    appFrame.hidden = !isAppActive;
    if (isAppActive) {
      appFrame.removeAttribute('inert');
    } else {
      appFrame.setAttribute('inert', '');
    }
  }
}
window.changeView = changeView;

function openCatalog(meta = defaultCatalogHeader) {
  setHeader(meta, { source: 'shell', key: 'catalog-default' });
  setDownloadTarget(null);
  changeView('catalog');
  if (appFrame) {
    appFrame.src = 'about:blank';
  }
  try {
    localStorage.removeItem(LAST_MINIAPP_STORAGE_KEY);
  } catch (error) {
    console.warn('Não foi possível limpar o histórico do MiniApp.', error);
  }
  notifyThemeFrames();
  notifyLanguages();
  notifySessions();
}
window.openCatalogView = openCatalog;

function resolveDownloadUrlValue(value) {
  if (value instanceof URL) {
    return value.href;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const base = typeof window !== 'undefined' ? window.location.href : undefined;
    return new URL(trimmed, base).href;
  } catch (error) {
    if (typeof document !== 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = trimmed;
      return anchor.href;
    }
    return trimmed;
  }
}

function extractDownloadUrl(source) {
  if (typeof source !== 'object' || source === null) {
    return { hasValue: false, value: null };
  }
  const candidateKeys = ['downloadUrl', 'download_url', 'download', 'packageUrl', 'package_url'];
  for (const key of candidateKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return { hasValue: true, value: resolveDownloadUrlValue(source[key]) };
    }
  }
  return { hasValue: false, value: null };
}

function loadMiniApp(url, meta = {}, options = {}) {
  if (!url) {
    return;
  }

  const config = typeof options === 'object' && options !== null ? options : {};

  if (meta && (meta.title || meta.subtitle)) {
    setHeader(meta, { source: 'miniapp', key: 'miniapp' });
  }

  let downloadUrlToApply = null;
  const metaDownload = extractDownloadUrl(meta);
  if (metaDownload.hasValue) {
    downloadUrlToApply = metaDownload.value;
  } else {
    const optionsDownload = extractDownloadUrl(config);
    if (optionsDownload.hasValue) {
      downloadUrlToApply = optionsDownload.value;
    }
  }
  setDownloadTarget(downloadUrlToApply);

  if (appFrame) {
    appFrame.src = url;
  }

  if (config.persistHistory !== false) {
    try {
      localStorage.setItem(LAST_MINIAPP_STORAGE_KEY, url);
    } catch (error) {
      console.warn('Não foi possível armazenar o último MiniApp carregado.', error);
    }
  } else {
    try {
      localStorage.removeItem(LAST_MINIAPP_STORAGE_KEY);
    } catch (error) {
      console.warn('Não foi possível limpar o histórico do MiniApp.', error);
    }
  }

  changeView('app');
  notifyThemeFrames();
  notifyLanguages();
  notifySessions();
}
window.loadMiniApp = loadMiniApp;

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && availableLocales.includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Não foi possível recuperar o idioma salvo.', error);
  }
  return null;
}

function storeLanguage(locale) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Não foi possível armazenar o idioma escolhido.', error);
  }
}

function resolveInitialLanguage(stored) {
  if (stored && availableLocales.includes(stored)) {
    return stored;
  }
  if (Array.isArray(navigator.languages)) {
    const preferred = navigator.languages.find((locale) => availableLocales.includes(locale));
    if (preferred) {
      return preferred;
    }
  }
  if (availableLocales.includes(navigator.language)) {
    return navigator.language;
  }
  return DEFAULT_LOCALE;
}

function getNextLocale(locale) {
  const index = availableLocales.indexOf(locale);
  if (index === -1) {
    return availableLocales[0];
  }
  return availableLocales[(index + 1) % availableLocales.length];
}

function updateLanguageToggle(locale) {
  if (!languageToggleBtn) return;
  const nextLocale = getNextLocale(locale);
  const nextLanguageLabel = getLanguageName(locale, nextLocale);
  const currentLanguageLabel = getLanguageName(locale, locale);
  languageToggleBtn.setAttribute(
    'title',
    formatTemplate(shellMessages.actions.language.changeTitle, { nextLanguage: nextLanguageLabel }),
  );
  languageToggleBtn.setAttribute(
    'aria-label',
    formatTemplate(shellMessages.actions.language.ariaLabel, {
      currentLanguage: currentLanguageLabel,
      nextLanguage: nextLanguageLabel,
    }),
  );
  languageToggleBtn.setAttribute('aria-expanded', 'false');
  if (languageToggleLabel) {
    languageToggleLabel.textContent = shellMessages.actions.language.label;
  }
}

function notifyFrameLanguage(frame, locale = currentLanguage) {
  if (!frame) return;
  try {
    frame.contentWindow?.postMessage({ action: 'shell-language', locale }, '*');
  } catch (error) {
    console.warn('Não foi possível enviar idioma para um iframe.', error);
  }
}

function notifyLanguages(locale = currentLanguage) {
  if (catalogApp) {
    catalogApp.setLanguage(locale, { notify: false });
  }
  notifyFrameLanguage(appFrame, locale);
}

function updateDownloadButtonLabel() {
  if (!downloadMiniAppBtn) {
    return;
  }
  const downloadMessages = shellMessages?.actions?.download || {};
  const label = downloadMessages.label || 'Baixar MiniApp';
  const title = downloadMessages.title || label;
  const ariaLabel = downloadMessages.ariaLabel || title;
  if (downloadMiniAppLabel) {
    downloadMiniAppLabel.textContent = label;
  } else {
    downloadMiniAppBtn.textContent = label;
  }
  downloadMiniAppBtn.setAttribute('title', title);
  downloadMiniAppBtn.setAttribute('aria-label', ariaLabel);
}

function applyLanguage(locale, { persist = true, notify = true } = {}) {
  const normalized = availableLocales.includes(locale) ? locale : DEFAULT_LOCALE;
  currentLanguage = normalized;
  shellMessages = getShellMessages(currentLanguage);

  const direction = getDirection(currentLanguage);
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = direction;

  defaultCatalogHeader = {
    title: shellMessages.header.title,
    subtitle: shellMessages.header.subtitle,
  };

  if (currentHeaderSource === 'shell') {
    setHeader(defaultCatalogHeader, { source: 'shell', key: currentHeaderKey });
  }

  if (openCatalogBtn) {
    openCatalogBtn.textContent = shellMessages.actions.openCatalog;
    openCatalogBtn.setAttribute('title', shellMessages.actions.openCatalog);
  }

  if (installBtn) {
    installBtn.textContent = shellMessages.actions.install;
  }

  updateDownloadButtonLabel();
  updateLanguageToggle(currentLanguage);
  updateThemeToggle(currentTheme);

  if (persist) {
    storeLanguage(currentLanguage);
  }

  if (notify) {
    notifyLanguages(currentLanguage);
  }
}
window.__applyShellLanguage = (locale, options = {}) =>
  applyLanguage(locale, { persist: true, notify: true, ...options });

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Não foi possível recuperar o tema salvo.', error);
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Não foi possível armazenar o tema escolhido.', error);
  }
}

function resolveInitialTheme(storedTheme) {
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function updateThemeToggle(theme) {
  if (!themeToggleBtn) return;
  const isDark = theme === 'dark';
  const nextActionLabel = isDark ? shellMessages.actions.theme.toLight : shellMessages.actions.theme.toDark;
  themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggleBtn.setAttribute('title', nextActionLabel);
  themeToggleBtn.setAttribute('aria-label', nextActionLabel);
  if (themeToggleLabel) {
    themeToggleLabel.textContent = nextActionLabel;
  }
}

function updateThemeIcons(theme) {
  if (!themeIcons.length) return;
  const preferredKey = theme === 'dark' ? 'darkHref' : 'lightHref';
  const fallbackKey = theme === 'dark' ? 'lightHref' : 'darkHref';
  themeIcons.forEach((icon) => {
    const nextHref = icon[preferredKey] || icon[fallbackKey];
    if (!nextHref) return;
    if (icon.element.getAttribute('href') !== nextHref) {
      icon.element.setAttribute('href', nextHref);
    }
  });
}

function setElementTheme(element, theme) {
  if (!element) return;
  const normalized = theme === 'dark' ? 'dark' : 'light';
  element.setAttribute('data-theme', normalized);
}

function notifyFrameTheme(frame, theme = currentTheme) {
  if (!frame) return;
  try {
    frame.contentWindow?.postMessage({ action: 'shell-theme', theme }, '*');
  } catch (error) {
    console.warn('Não foi possível enviar tema para um iframe.', error);
  }
}

function notifyThemeFrames(theme = currentTheme) {
  if (catalogApp) {
    catalogApp.setTheme(theme);
  }
  notifyFrameTheme(appFrame, theme);
}

function applyTheme(theme, { persist = true, notify = true } = {}) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';

  setElementTheme(miniAppRoot, currentTheme);
  setElementTheme(document.body, currentTheme);

  if (themeMetaTag) {
    const color = THEME_META_COLORS[currentTheme] || THEME_META_COLORS.light;
    themeMetaTag.setAttribute('content', color);
  }

  updateThemeIcons(currentTheme);
  updateThemeToggle(currentTheme);

  if (persist) {
    storeTheme(currentTheme);
  }

  if (notify) {
    notifyThemeFrames(currentTheme);
  }
}
window.__applyShellTheme = (theme, options = {}) =>
  applyTheme(theme, { persist: true, notify: true, ...options });

function notifyFrameSession(frame) {
  if (!frame) return;
  try {
    frame.contentWindow?.postMessage({ action: 'shell-session', session: null, guardsDisabled: true }, '*');
  } catch (error) {
    console.warn('Não foi possível enviar sessão para um iframe.', error);
  }
}

function notifySessions() {
  if (catalogApp) {
    catalogApp.setSession(null, { guardsDisabled: true });
  }
  notifyFrameSession(appFrame);
}

function restoreLastMiniAppOrCatalog() {
  let lastUrl = null;
  try {
    lastUrl = localStorage.getItem(LAST_MINIAPP_STORAGE_KEY);
  } catch (error) {
    console.warn('Não foi possível recuperar o último MiniApp carregado.', error);
  }

  if (lastUrl) {
    loadMiniApp(lastUrl);
  } else {
    openCatalog();
  }
}

if (appFrame) {
  appFrame.addEventListener('load', () => {
    notifyThemeFrames();
    notifyLanguages();
    notifySessions();
  });
}

if (downloadMiniAppBtn) {
  downloadMiniAppBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (!currentMiniAppDownloadUrl) {
      return;
    }
    try {
      const opened = window.open(currentMiniAppDownloadUrl, '_blank', 'noopener,noreferrer');
      if (!opened && typeof document !== 'undefined') {
        const tempLink = document.createElement('a');
        tempLink.href = currentMiniAppDownloadUrl;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        tempLink.download = '';
        tempLink.style.display = 'none';
        document.body?.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
      }
    } catch (error) {
      window.location.href = currentMiniAppDownloadUrl;
    }
  });
}

if (openCatalogBtn) {
  openCatalogBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openCatalog();
  });
}

if (languageToggleBtn) {
  languageToggleBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const nextLocale = getNextLocale(currentLanguage);
    applyLanguage(nextLocale);
  });
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest('#themeToggle');
  if (!target) return;
  event.preventDefault();
  if (!themeToggleBtn) {
    themeToggleBtn = target;
    themeToggleLabel = themeToggleBtn.querySelector('[data-theme-toggle-label]');
  }
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

window.addEventListener('message', (event) => {
  const { data } = event;
  if (!data) return;

  if (data === 'open-catalog' || data.action === 'open-catalog') {
    openCatalog();
  } else if (data.action === 'load-miniapp') {
    loadMiniApp(data.url, data.metadata || {}, { persistHistory: data.persistHistory !== false });
  } else if (data.action === 'miniapp-header') {
    setHeader(data, { source: 'miniapp', key: 'miniapp' });
    const headerDownload = extractDownloadUrl(data);
    if (headerDownload.hasValue) {
      setDownloadTarget(headerDownload.value);
    }
  } else if (data.action === 'miniapp-theme-ready') {
    if (appFrame && appFrame.contentWindow === event.source) {
      notifyThemeFrames();
      notifyLanguages();
      notifySessions();
    }
  } else if (data.action === 'miniapp-language-ready') {
    if (appFrame && appFrame.contentWindow === event.source) {
      notifyLanguages();
      notifySessions();
    }
  } else if (data.action === 'miniapp-session-ready') {
    if (appFrame && appFrame.contentWindow === event.source) {
      notifySessions();
    }
  }
});

if (catalogEvents) {
  catalogEvents.addEventListener('load-miniapp', (event) => {
    const detail = event.detail || {};
    if (!detail.url) {
      return;
    }
    loadMiniApp(detail.url, detail.metadata || {}, { persistHistory: detail.persistHistory !== false });
  });

  catalogEvents.addEventListener('miniapp-language-ready', () => {
    notifyLanguages();
    notifySessions();
  });

  catalogEvents.addEventListener('miniapp-session-ready', () => {
    notifySessions();
  });

  catalogEvents.addEventListener('miniapp-theme-ready', () => {
    notifyThemeFrames();
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installBtn) {
    installBtn.hidden = false;
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (installBtn) {
    installBtn.hidden = true;
  }
});

function initializeShell() {
  const storedLanguage = readStoredLanguage();
  const initialLanguage = resolveInitialLanguage(storedLanguage);
  applyLanguage(initialLanguage, { persist: Boolean(storedLanguage), notify: false });

  const storedTheme = readStoredTheme();
  const initialTheme = resolveInitialTheme(storedTheme);
  applyTheme(initialTheme, { persist: Boolean(storedTheme), notify: false });

  notifyThemeFrames();
  notifyLanguages();
  notifySessions();

  restoreLastMiniAppOrCatalog();
}

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  const requestSkipWaiting = (registration) => {
    if (!registration || !navigator.serviceWorker.controller) {
      return;
    }

    const sendMessage = (worker) => {
      if (!worker) return;
      worker.postMessage({ type: 'SKIP_WAITING' });
    };

    if (registration.waiting) {
      sendMessage(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const { installing } = registration;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && registration.waiting) {
          sendMessage(registration.waiting);
        }
      });
    });
  };

  navigator.serviceWorker
    .register('sw.js')
    .then((registration) => {
      requestSkipWaiting(registration);

      if (typeof registration.update === 'function') {
        registration.update().catch((error) => {
          console.warn('Não foi possível verificar atualizações do Service Worker.', error);
        });
      }
    })
    .catch((error) => {
      console.error('Falha ao registrar o Service Worker.', error);
    });
}

initializeShell();
