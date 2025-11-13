import { Auth } from '../miniapp-base/js/auth.js';
import {
  DEFAULT_LOCALE,
  getAvailableLocales,
  getDirection,
  getLanguageName,
  getShellMessages,
} from './i18n.js';

function readAppConfigFlag(flagName) {
  if (typeof window === 'undefined') {
    return false;
  }
  const appConfig = window.__APP_CONFIG__;
  if (!appConfig || typeof appConfig !== 'object') {
    return false;
  }
  return Boolean(appConfig[flagName]);
}

function isAuthGuardDisabled() {
  if (typeof Auth.areGuardsDisabled === 'function') {
    return Boolean(Auth.areGuardsDisabled());
  }
  return readAppConfigFlag('DISABLE_AUTH_GUARDS');
}

const headerTitle = document.querySelector('[data-header-title]');
const headerSubtitle = document.querySelector('[data-header-subtitle]');
const openCatalogBtn = document.getElementById('openCatalog');
const downloadMiniAppBtn = document.getElementById('downloadMiniApp');
const downloadMiniAppLabel = downloadMiniAppBtn
  ? downloadMiniAppBtn.querySelector('[data-download-label]')
  : null;
let themeToggleBtn = document.getElementById('themeToggle');
let themeToggleLabel = themeToggleBtn ? themeToggleBtn.querySelector('[data-theme-toggle-label]') : null;
const installBtn = document.getElementById('installPWA');
const catalogFrame = document.getElementById('catalog-frame');
const appFrame = document.getElementById('miniapp-panel');
const CATALOG_APP_URL = 'miniapp-catalogo/index.html';
const setupView = document.getElementById('setup-sheet-view');
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
const sheetForm = document.getElementById('sheet-config-form');
const sheetInput = document.getElementById('sheetIdInput');
const sheetStatus = document.getElementById('sheet-setup-status');
const sheetSubmit = document.getElementById('sheetConfigSubmit');
const languageToggleBtn = document.getElementById('languageToggle');
const languageToggleLabel = languageToggleBtn ? languageToggleBtn.querySelector('[data-language-toggle-label]') : null;
const sheetSetupTitle = document.getElementById('sheet-setup-title');
const sheetInstructions = document.querySelector('[data-sheet-instructions]');
const sheetLabel = document.querySelector('[data-sheet-label]');
let sheetSubmitDefaultLabel = sheetSubmit ? sheetSubmit.textContent : '';

let defaultCatalogHeader = {
  title: 'Catálogo de MiniApps',
  subtitle: 'Escolha um MiniApp para abrir',
};
let currentHeaderSource = 'shell';
let currentHeaderMeta = {
  title: headerTitle ? headerTitle.textContent : '',
  subtitle: headerSubtitle ? headerSubtitle.textContent : '',
};
let currentMiniAppDownloadUrl = null;
let currentHeaderKey = 'catalog-default';
let currentSheetStatusKey = null;
let currentSheetStatusTone = 'info';

let hasBootstrappedSheet = false;
const ACCESS_ROLE_LABELS = {
  admin: 'administrador',
  operador: 'operador',
  leitor: 'leitor',
};

let firebaseApp = null;
let db = null;
let auth = null;
let sheetConfigDoc = null;
let authPromise = null;
let firebaseModulesPromise = null;

async function loadFirebaseModules() {
  if (firebaseModulesPromise) {
    return firebaseModulesPromise;
  }

  firebaseModulesPromise = (async () => {
    try {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'),
      ]);

      return {
        initializeApp: appModule.initializeApp,
        getAuth: authModule.getAuth,
        onAuthStateChanged: authModule.onAuthStateChanged,
        signInAnonymously: authModule.signInAnonymously,
        signInWithCustomToken: authModule.signInWithCustomToken,
        getFirestore: firestoreModule.getFirestore,
        doc: firestoreModule.doc,
        getDoc: firestoreModule.getDoc,
        setDoc: firestoreModule.setDoc,
      };
    } catch (error) {
      console.warn('Firebase indisponível; executando shell sem integrações remotas.', error);
      return null;
    }
  })();

  const modules = await firebaseModulesPromise;
  if (!modules) {
    firebaseModulesPromise = null;
  }
  return modules;
}

if (typeof window !== 'undefined' && typeof window.__catalogDisabled__ !== 'boolean') {
  window.__catalogDisabled__ = false;
}

const viewMap = {
  setup: setupView,
  catalog: catalogView,
  app: appView,
};

const LANGUAGE_STORAGE_KEY = 'miniapp-shell.language';
const availableLocales = getAvailableLocales();
let currentLanguage = DEFAULT_LOCALE;
let shellMessages = getShellMessages(currentLanguage);

function getNextLocale(locale) {
  const index = availableLocales.indexOf(locale);
  if (index === -1) {
    return availableLocales[0];
  }
  return availableLocales[(index + 1) % availableLocales.length];
}

function formatTemplate(template, context = {}) {
  if (typeof template !== 'string') {
    return '';
  }
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const trimmed = key.trim();
    return Object.prototype.hasOwnProperty.call(context, trimmed) ? context[trimmed] : '';
  });
}

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
  if (navigator.languages) {
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

function updateLanguageToggle(locale) {
  if (!languageToggleBtn) return;
  const nextLocale = getNextLocale(locale);
  const nextLanguageLabel = getLanguageName(locale, nextLocale);
  const currentLanguageLabel = getLanguageName(locale, locale);
  languageToggleBtn.setAttribute('title', formatTemplate(shellMessages.actions.language.changeTitle, { nextLanguage: nextLanguageLabel }));
  languageToggleBtn.setAttribute('aria-label', formatTemplate(shellMessages.actions.language.ariaLabel, {
    currentLanguage: currentLanguageLabel,
    nextLanguage: nextLanguageLabel,
  }));
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
  notifyFrameLanguage(catalogFrame, locale);
  notifyFrameLanguage(appFrame, locale);
}

function formatRoleLabel(role) {
  if (typeof role !== 'string') {
    return 'adequado';
  }
  const normalized = role.trim().toLowerCase();
  if (!normalized) {
    return 'adequado';
  }
  return ACCESS_ROLE_LABELS[normalized] || normalized;
}

function notifyFrameSession(frame) {
  if (!frame) return;
  try {
    frame.contentWindow?.postMessage(
      { action: 'shell-session', session: Auth.getSession(), guardsDisabled: isAuthGuardDisabled() },
      '*',
    );
  } catch (error) {
    console.warn('Não foi possível enviar a sessão para um iframe.', error);
  }
}

function broadcastSessionToFrames() {
  notifyFrameSession(catalogFrame);
  notifyFrameSession(appFrame);
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
    if (currentHeaderKey === 'catalog-default') {
      setHeader(defaultCatalogHeader, { source: 'shell', key: 'catalog-default' });
    } else if (currentHeaderKey === 'verifying') {
      setHeader({ subtitle: shellMessages.setup.statuses.verifying }, { source: 'shell', key: 'verifying' });
    } else if (currentHeaderKey === 'configure') {
      setHeader(
        { title: shellMessages.setup.configureTitle, subtitle: shellMessages.setup.configureSubtitle },
        { source: 'shell', key: 'configure' },
      );
    } else {
      setHeader(defaultCatalogHeader, { source: 'shell', key: 'catalog-default' });
    }
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

  if (sheetSetupTitle) {
    sheetSetupTitle.textContent = shellMessages.setup.title;
  }

  if (sheetInstructions) {
    const instructions = shellMessages.setup.instructions
      .replace(/\/d\//g, '<code>/d/</code>')
      .replace(/\/edit/g, '<code>/edit</code>');
    sheetInstructions.innerHTML = instructions;
  }

  if (sheetLabel) {
    sheetLabel.textContent = shellMessages.setup.label;
  }

  if (sheetInput) {
    sheetInput.placeholder = shellMessages.setup.placeholder;
  }

  if (sheetSubmit) {
    sheetSubmit.textContent = shellMessages.setup.submit;
    sheetSubmitDefaultLabel = shellMessages.setup.submit;
  }

  if (sheetStatus && currentSheetStatusKey) {
    const statuses = shellMessages.setup.statuses;
    const statusMessage = statuses[currentSheetStatusKey];
    if (statusMessage) {
      sheetStatus.textContent = statusMessage;
    }
    sheetStatus.dataset.tone = currentSheetStatusTone || 'info';
  }

  if (persist) {
    storeLanguage(currentLanguage);
  }

  if (notify) {
    notifyLanguages(currentLanguage);
  }
}

window.__applyShellLanguage = (locale, options = {}) =>
  applyLanguage(locale, { persist: true, notify: true, ...options });

if (catalogFrame) {
  catalogFrame.addEventListener('load', () => {
    notifyFrameTheme(catalogFrame);
    notifyFrameLanguage(catalogFrame);
  });
}

if (appFrame) {
  appFrame.addEventListener('load', () => {
    notifyFrameTheme(appFrame);
    notifyFrameLanguage(appFrame);
  });
}

const THEME_STORAGE_KEY = 'miniapp-shell.theme';
const THEME_META_COLORS = {
  light: '#ffffff',
  dark: '#0b1220',
};

let currentTheme = 'light';

const storedLanguage = readStoredLanguage();
const initialLanguage = resolveInitialLanguage(storedLanguage);
applyLanguage(initialLanguage, { persist: Boolean(storedLanguage), notify: false });

const storedTheme = readStoredTheme();
const initialTheme = resolveInitialTheme(storedTheme);
applyTheme(initialTheme, { persist: Boolean(storedTheme) });

if (window.matchMedia) {
  const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const handlePrefersChange = (event) => {
    const savedTheme = readStoredTheme();
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return;
    }
    applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  };

  if (prefersDarkMedia) {
    if (typeof prefersDarkMedia.addEventListener === 'function') {
      prefersDarkMedia.addEventListener('change', handlePrefersChange);
    } else if (typeof prefersDarkMedia.addListener === 'function') {
      prefersDarkMedia.addListener(handlePrefersChange);
    }
  }
}

const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : null;
const initialAuthToken = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
const appConfig = typeof window.__APP_CONFIG__ === 'object' && window.__APP_CONFIG__ !== null
  ? window.__APP_CONFIG__
  : null;
const initialSheetId = (() => {
  const candidates = [
    appConfig && appConfig.INITIAL_CATALOG_SHEET_ID,
    window.__initial_sheet_id,
    window.__catalog_sheet_id,
    window.__catalog_google_sheet_id,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'undefined' || candidate === null) continue;
    const value = String(candidate).trim();
    if (value) {
      return value;
    }
  }
  return null;
})();

let deferredPrompt;

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

function updateThemeToggle(theme) {
  if (!themeToggleBtn) return;
  const isDark = theme === 'dark';
  const nextActionLabel = isDark
    ? shellMessages.actions.theme.toLight
    : shellMessages.actions.theme.toDark;
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

function notifyFrameTheme(frame, theme = currentTheme) {
  if (!frame) return;
  try {
    frame.contentWindow?.postMessage({ action: 'shell-theme', theme }, '*');
  } catch (error) {
    console.warn('Não foi possível enviar tema para um iframe.', error);
  }
}

function notifyThemeFrames(theme = currentTheme) {
  notifyFrameTheme(catalogFrame, theme);
  notifyFrameTheme(appFrame, theme);
}

function setElementTheme(element, theme) {
  if (!element) return;
  const normalized = theme === 'dark' ? 'dark' : 'light';
  element.setAttribute('data-theme', normalized);
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
/**
 * Exposes theme application for automated flows (e.g., Playwright tests).
 * Consumers can override persistence/notification if needed via options.
 */
window.__applyShellTheme = (theme, options = {}) =>
  applyTheme(theme, { persist: true, notify: true, ...options });

function resolveInitialTheme(storedTheme) {
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
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

function changeView(target) {
  if (target !== 'app') {
    setDownloadTarget(null);
  }
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

  if (catalogFrame) {
    catalogFrame.hidden = !isCatalogActive;
    if (isCatalogActive) {
      catalogFrame.removeAttribute('inert');
    } else {
      catalogFrame.setAttribute('inert', '');
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
  notifyFrameTheme(catalogFrame);
  notifyFrameLanguage(catalogFrame);
  notifyFrameSession(catalogFrame);
}
window.openCatalogView = openCatalog;

function ensureSheetBootstrap() {
  if (hasBootstrappedSheet) {
    return;
  }
  hasBootstrappedSheet = true;
  bootstrapSheetConfig();
}

function handleAccessDenied(requiredRole) {
  const roleLabel = formatRoleLabel(requiredRole);
  setHeader(
    {
      title: defaultCatalogHeader.title,
      subtitle: `Acesso negado. É necessário o papel ${roleLabel}.`,
    },
    { source: 'shell', key: 'access-denied' },
  );
  changeView('catalog');
  if (catalogFrame && catalogFrame.contentWindow) {
    try {
      catalogFrame.contentWindow.postMessage(
        { action: 'shell-access-denied', requiredRole: requiredRole || null },
        '*',
      );
    } catch (error) {
      console.warn('Não foi possível avisar o catálogo sobre o bloqueio de acesso.', error);
    }
  }
}

function handleSessionChange(options = {}) {
  const guardsDisabled = isAuthGuardDisabled();
  const skipLogin = options.skipLogin !== false || guardsDisabled;
  const session = Auth.refreshSession();
  const hasSession = Boolean(session);

  broadcastSessionToFrames();

  window.__catalogDisabled__ = false;

  if (skipLogin || hasSession) {
    if (skipLogin && !hasSession) {
      openCatalog();
    }

    if (currentHeaderSource === 'shell' && currentHeaderKey === 'access-denied') {
      setHeader(defaultCatalogHeader, { source: 'shell', key: 'catalog-default' });
    }
    ensureSheetBootstrap();
    return;
  }

  handleAccessDenied('leitor');
}

function loadMiniApp(url, meta = {}, options = {}) {
  const config = typeof options === 'object' && options !== null ? options : {};
  const requiredRole = config.requiredRole ?? meta?.requiredRole ?? null;
  const bypassAuth = Boolean(config.bypassAuth);
  const persistHistory = config.persistHistory !== false;
  const targetUrl = url;

  if (!bypassAuth && !isAuthGuardDisabled()) {
    if (requiredRole && !Auth.require(requiredRole)) {
      handleAccessDenied(requiredRole);
      return;
    }
  }

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
  if (targetUrl) {
    appFrame.src = targetUrl;
    try {
      if (persistHistory) {
        localStorage.setItem('miniapp-shell.last', targetUrl);
      } else if (!persistHistory) {
        localStorage.removeItem('miniapp-shell.last');
      }
    } catch (error) {
      console.warn('Não foi possível armazenar o último MiniApp carregado.', error);
    }
  }
  changeView('app');
  notifyFrameTheme(appFrame);
  notifyFrameLanguage(appFrame);
  notifyFrameSession(appFrame);
}
window.loadMiniApp = loadMiniApp;

function loadCatalogMiniApp(options = {}) {
  const config = typeof options === 'object' && options !== null ? options : {};
  setHeader(defaultCatalogHeader, { source: 'shell', key: 'catalog-default' });
  loadMiniApp(CATALOG_APP_URL, null, { bypassAuth: true, persistHistory: false, ...config });
}

function restoreLastMiniAppOrCatalog() {
  if (window.__catalogDisabled__) {
    loadCatalogMiniApp();
    return;
  }
  let lastUrl = null;
  try {
    lastUrl = localStorage.getItem('miniapp-shell.last');
  } catch (error) {
    console.warn('Não foi possível recuperar o último MiniApp carregado.', error);
  }

  if (lastUrl) {
    loadMiniApp(lastUrl);
  } else {
    loadCatalogMiniApp();
  }
}

function updateSheetStatus(message, tone = 'info', key = null) {
  if (!sheetStatus) return;
  sheetStatus.textContent = message;
  sheetStatus.dataset.tone = tone;
  currentSheetStatusKey = key;
  currentSheetStatusTone = tone;
}

function clearSheetStatus() {
  if (!sheetStatus) return;
  sheetStatus.textContent = '';
  delete sheetStatus.dataset.tone;
  currentSheetStatusKey = null;
  currentSheetStatusTone = 'info';
}

function setSheetFormDisabled(isDisabled) {
  if (sheetInput) {
    sheetInput.disabled = isDisabled;
  }
  if (sheetSubmit) {
    sheetSubmit.disabled = isDisabled;
    const savingLabel = shellMessages.setup.savingButton || sheetSubmitDefaultLabel;
    sheetSubmit.textContent = isDisabled ? savingLabel : sheetSubmitDefaultLabel;
  }
}

function cacheSheetId(sheetId) {
  try {
    localStorage.setItem('miniapp-shell.sheetId', sheetId);
  } catch (error) {
    console.warn('Não foi possível cachear o ID da planilha localmente.', error);
  }
}

function readCachedSheetId() {
  try {
    return localStorage.getItem('miniapp-shell.sheetId');
  } catch (error) {
    console.warn('Não foi possível ler o ID da planilha em cache.', error);
    return null;
  }
}

function applySheetId(sheetId) {
  if (!sheetId) return;
  window.CATALOG_GOOGLE_SHEET_ID = sheetId;
  if (sheetInput) {
    sheetInput.value = sheetId;
  }
  cacheSheetId(sheetId);
}

function reloadCatalogFrame() {
  if (!catalogFrame) return;
  try {
    const frameWindow = catalogFrame.contentWindow;
    if (frameWindow && typeof frameWindow.location.reload === 'function') {
      frameWindow.location.reload();
      return;
    }
  } catch (error) {
    console.warn('Não foi possível recarregar o catálogo automaticamente.', error);
  }
  catalogFrame.src = CATALOG_APP_URL;
}

async function ensureFirebase() {
  if (!firebaseConfig) {
    return null;
  }
  if (db && auth) {
    return { db, auth };
  }

  const modules = await loadFirebaseModules();
  if (!modules) {
    return null;
  }

  try {
    firebaseApp = modules.initializeApp(firebaseConfig);
    db = modules.getFirestore(firebaseApp);
    auth = modules.getAuth(firebaseApp);
    sheetConfigDoc = modules.doc(db, 'artifacts', appId, 'admin', 'sheet_config');
    return { db, auth };
  } catch (error) {
    console.error('Erro ao inicializar o Firebase no shell.', error);
    return null;
  }
}

async function ensureAuth() {
  if (!auth) {
    return null;
  }
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (!authPromise) {
    const modules = await loadFirebaseModules();
    if (!modules) {
      return null;
    }

    authPromise = new Promise((resolve, reject) => {
      const unsubscribe = modules.onAuthStateChanged(auth, (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      }, (error) => {
        unsubscribe();
        authPromise = null;
        reject(error);
      });

      const handleFailure = (error) => {
        console.error('Erro na autenticação do shell.', error);
        unsubscribe();
        authPromise = null;
        reject(error);
      };

      if (initialAuthToken) {
        modules.signInWithCustomToken(auth, initialAuthToken).catch((error) => {
          console.warn('Falha com token customizado; tentando login anônimo.', error);
          modules.signInAnonymously(auth).catch(handleFailure);
        });
      } else {
        modules.signInAnonymously(auth).catch(handleFailure);
      }
    });
  }
  return authPromise;
}

async function fetchSheetIdFromFirestore() {
  const firebase = await ensureFirebase();
  if (!firebase || !sheetConfigDoc) {
    return null;
  }
  const modules = await loadFirebaseModules();
  if (!modules) {
    return null;
  }
  try {
    await ensureAuth();
    const snapshot = await modules.getDoc(sheetConfigDoc);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data?.GOOGLE_SHEET_ID || data?.googleSheetId || null;
    }
  } catch (error) {
    console.warn('Falha ao buscar o ID da planilha no Firestore.', error);
  }
  return null;
}

async function persistSheetIdToFirestore(sheetId) {
  const firebase = await ensureFirebase();
  if (!firebase || !sheetConfigDoc) {
    console.warn('Firebase não configurado; salvando o ID da planilha apenas localmente.');
    cacheSheetId(sheetId);
    return false;
  }
  const modules = await loadFirebaseModules();
  if (!modules) {
    console.warn('Firebase indisponível; salvando o ID da planilha apenas localmente.');
    cacheSheetId(sheetId);
    return false;
  }
  await ensureAuth();
  await modules.setDoc(sheetConfigDoc, {
    GOOGLE_SHEET_ID: sheetId,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return true;
}

async function bootstrapSheetConfig() {
  setHeader({ subtitle: shellMessages.setup.statuses.verifying }, { source: 'shell', key: 'verifying' });
  let sheetIdSource = null;
  let sheetId = await fetchSheetIdFromFirestore();

  if (sheetId) {
    sheetIdSource = 'firestore';
  } else if (initialSheetId) {
    sheetId = initialSheetId;
    sheetIdSource = 'initial';
  } else {
    const cached = readCachedSheetId();
    if (cached) {
      sheetId = cached;
      sheetIdSource = 'cache';
    }
  }

  if (sheetId) {
    applySheetId(sheetId);
    if (sheetIdSource === 'cache') {
      updateSheetStatus(shellMessages.setup.statuses.usingCache, 'warning', 'usingCache');
    } else if (sheetIdSource === 'initial') {
      updateSheetStatus(shellMessages.setup.statuses.prefilled, 'success', 'prefilled');
      persistSheetIdToFirestore(sheetId)
        .then((persistedRemotely) => {
          if (persistedRemotely) {
            updateSheetStatus(shellMessages.setup.statuses.savedRemote, 'success', 'savedRemote');
          } else {
            updateSheetStatus(shellMessages.setup.statuses.savedLocal, 'warning', 'savedLocal');
          }
        })
        .catch((error) => {
          console.error('Erro ao salvar o ID da planilha configurado automaticamente.', error);
          updateSheetStatus(shellMessages.setup.statuses.saveError, 'error', 'saveError');
        });
    } else {
      clearSheetStatus();
    }
    restoreLastMiniAppOrCatalog();
  } else {
    changeView('setup');
    setHeader(
      { title: shellMessages.setup.configureTitle, subtitle: shellMessages.setup.configureSubtitle },
      { source: 'shell', key: 'configure' },
    );
    updateSheetStatus(shellMessages.setup.statuses.prompt, 'info', 'prompt');
  }
}

if (sheetForm) {
  sheetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!sheetInput) return;

    const value = sheetInput.value.trim();
    if (!value) {
      updateSheetStatus(shellMessages.setup.statuses.invalid, 'error', 'invalid');
      return;
    }

    setSheetFormDisabled(true);
    updateSheetStatus(shellMessages.setup.statuses.saving, 'info', 'saving');

    try {
      const persistedRemotely = await persistSheetIdToFirestore(value);
      applySheetId(value);
      if (persistedRemotely) {
        updateSheetStatus(shellMessages.setup.statuses.savedRemote, 'success', 'savedRemote');
      } else {
        updateSheetStatus(shellMessages.setup.statuses.savedLocal, 'warning', 'savedLocal');
      }
      setHeader(defaultCatalogHeader, { source: 'shell', key: 'catalog-default' });
      changeView('catalog');
      reloadCatalogFrame();
      restoreLastMiniAppOrCatalog();
    } catch (error) {
      console.error('Erro ao salvar o ID da planilha.', error);
      updateSheetStatus(shellMessages.setup.statuses.saveError, 'error', 'saveError');
    } finally {
      setSheetFormDisabled(false);
    }
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
    if (data.metadata?.sheetId) {
      applySheetId(data.metadata.sheetId);
    }
    loadMiniApp(data.url, data.metadata || {}, { requiredRole: data.requiredRole || null });
  } else if (data.action === 'miniapp-header') {
    setHeader(data, { source: 'miniapp', key: 'miniapp' });
    const headerDownload = extractDownloadUrl(data);
    if (headerDownload.hasValue) {
      setDownloadTarget(headerDownload.value);
    }
  } else if (data.action === 'miniapp-theme-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameTheme(targetFrame);
      notifyFrameLanguage(targetFrame);
      notifyFrameSession(targetFrame);
    }
  } else if (data.action === 'miniapp-language-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameLanguage(targetFrame);
      notifyFrameSession(targetFrame);
    }
  } else if (data.action === 'miniapp-session-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameSession(targetFrame);
    }
  } else if (data.action === 'auth-session-changed') {
    handleSessionChange();
  } else if (data.action === 'miniapp-access-denied') {
    if (!isAuthGuardDisabled()) {
      handleAccessDenied(data.requiredRole || null);
    }
  }
});

window.addEventListener('beforeunload', () => {
  if (sheetStatus) {
    sheetStatus.textContent = '';
  }
});

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

window.addEventListener('storage', (event) => {
  if (event.key === 'miniapp.session') {
    handleSessionChange();
  }
});

async function initializeShell() {
  try {
    await Auth.bootstrap();
  } catch (error) {
    console.warn('Falha ao inicializar o módulo de autenticação; prosseguindo sem sessão.', error);
  }

  handleSessionChange({ skipLogin: true });
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
