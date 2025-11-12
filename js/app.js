import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { doc, getDoc, getFirestore, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import {
  DEFAULT_LOCALE,
  getAvailableLocales,
  getDirection,
  getLanguageName,
  getShellMessages,
} from './i18n.js';

const headerTitle = document.querySelector('[data-header-title]');
const headerSubtitle = document.querySelector('[data-header-subtitle]');
const openCatalogBtn = document.getElementById('openCatalog');
let themeToggleBtn = document.getElementById('themeToggle');
let themeToggleLabel = themeToggleBtn ? themeToggleBtn.querySelector('[data-theme-toggle-label]') : null;
const installBtn = document.getElementById('installPWA');
const catalogFrame = document.getElementById('catalog-frame');
const appFrame = document.getElementById('miniapp-panel');
const setupView = document.getElementById('setup-sheet-view');
const catalogView = document.getElementById('catalog-view');
const appView = document.getElementById('app-view');
const miniAppRoot = document.getElementById('miniapp-root');
const themeMetaTag = document.querySelector('meta[name="theme-color"]');
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
let currentHeaderKey = 'catalog-default';
let currentSheetStatusKey = null;
let currentSheetStatusTone = 'info';

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
  light: '#f8fafc',
  dark: '#0f172a',
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
const initialSheetId = (() => {
  const candidates = [
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

let firebaseApp;
let db;
let auth;
let sheetConfigDoc;
let authPromise;
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

function applyTheme(theme, { persist = true, notify = true } = {}) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';

  if (miniAppRoot) {
    if (currentTheme === 'dark') {
      miniAppRoot.setAttribute('data-theme', 'dark');
    } else {
      miniAppRoot.removeAttribute('data-theme');
    }
  }

  if (themeMetaTag) {
    const color = THEME_META_COLORS[currentTheme] || THEME_META_COLORS.light;
    themeMetaTag.setAttribute('content', color);
  }

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
  changeView('catalog');
  notifyFrameTheme(catalogFrame);
  notifyFrameLanguage(catalogFrame);
}
window.openCatalogView = openCatalog;

function loadMiniApp(url, meta = {}) {
  if (meta && (meta.title || meta.subtitle)) {
    setHeader(meta, { source: 'miniapp', key: 'miniapp' });
  }
  if (url) {
    appFrame.src = url;
    try {
      localStorage.setItem('miniapp-shell.last', url);
    } catch (error) {
      console.warn('Não foi possível armazenar o último MiniApp carregado.', error);
    }
  }
  changeView('app');
  notifyFrameTheme(appFrame);
  notifyFrameLanguage(appFrame);
}
window.loadMiniApp = loadMiniApp;

function restoreLastMiniAppOrCatalog() {
  let lastUrl = null;
  try {
    lastUrl = localStorage.getItem('miniapp-shell.last');
  } catch (error) {
    console.warn('Não foi possível recuperar o último MiniApp carregado.', error);
  }

  if (lastUrl) {
    loadMiniApp(lastUrl);
  } else {
    openCatalog();
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
  catalogFrame.src = 'miniapp-catalogo/index.html';
}

async function ensureFirebase() {
  if (!firebaseConfig) {
    return null;
  }
  if (db && auth) {
    return { db, auth };
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    sheetConfigDoc = doc(db, 'artifacts', appId, 'admin', 'sheet_config');
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
    authPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
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
        signInWithCustomToken(auth, initialAuthToken).catch((error) => {
          console.warn('Falha com token customizado; tentando login anônimo.', error);
          signInAnonymously(auth).catch(handleFailure);
        });
      } else {
        signInAnonymously(auth).catch(handleFailure);
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
  try {
    await ensureAuth();
    const snapshot = await getDoc(sheetConfigDoc);
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
  await ensureAuth();
  await setDoc(sheetConfigDoc, {
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
    loadMiniApp(data.url, data.metadata || {});
  } else if (data.action === 'miniapp-header') {
    setHeader(data, { source: 'miniapp', key: 'miniapp' });
  } else if (data.action === 'miniapp-theme-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameTheme(targetFrame);
      notifyFrameLanguage(targetFrame);
    }
  } else if (data.action === 'miniapp-language-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameLanguage(targetFrame);
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

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register('sw.js')
    .then((registration) => {
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

bootstrapSheetConfig();
