import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { doc, getDoc, getFirestore, setDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

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
const sheetSubmitDefaultLabel = sheetSubmit ? sheetSubmit.textContent : '';

const defaultCatalogHeader = {
  title: 'Catálogo de MiniApps',
  subtitle: 'Escolha um MiniApp para abrir',
};

const viewMap = {
  setup: setupView,
  catalog: catalogView,
  app: appView,
};

if (catalogFrame) {
  catalogFrame.addEventListener('load', () => {
    notifyFrameTheme(catalogFrame);
  });
}

if (appFrame) {
  appFrame.addEventListener('load', () => {
    notifyFrameTheme(appFrame);
  });
}

const THEME_STORAGE_KEY = 'miniapp-shell.theme';
const THEME_META_COLORS = {
  light: '#f8fafc',
  dark: '#0f172a',
};

let currentTheme = 'light';

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
  const nextActionLabel = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';
  themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggleBtn.setAttribute('title', nextActionLabel);
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

function notifyFrames(theme = currentTheme) {
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
    notifyFrames(currentTheme);
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

function setHeader(meta = {}) {
  if (meta.title && headerTitle) {
    headerTitle.textContent = meta.title;
  }
  if (meta.subtitle && headerSubtitle) {
    headerSubtitle.textContent = meta.subtitle;
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
  setHeader(meta);
  changeView('catalog');
  notifyFrameTheme(catalogFrame);
}
window.openCatalogView = openCatalog;

function loadMiniApp(url, meta = {}) {
  if (meta && (meta.title || meta.subtitle)) {
    setHeader(meta);
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

function updateSheetStatus(message, tone = 'info') {
  if (!sheetStatus) return;
  sheetStatus.textContent = message;
  sheetStatus.dataset.tone = tone;
}

function setSheetFormDisabled(isDisabled) {
  if (sheetInput) {
    sheetInput.disabled = isDisabled;
  }
  if (sheetSubmit) {
    sheetSubmit.disabled = isDisabled;
    sheetSubmit.textContent = isDisabled ? 'Salvando…' : sheetSubmitDefaultLabel;
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
  setHeader({ subtitle: 'Verificando configuração do catálogo…' });
  let sheetId = await fetchSheetIdFromFirestore();
  let usingCache = false;

  if (!sheetId) {
    const cached = readCachedSheetId();
    if (cached) {
      sheetId = cached;
      usingCache = true;
    }
  }

  if (sheetId) {
    applySheetId(sheetId);
    if (usingCache) {
      updateSheetStatus('Sem conexão com o Firestore. Usando o ID da planilha em cache.', 'warning');
    }
    restoreLastMiniAppOrCatalog();
  } else {
    changeView('setup');
    setHeader({ title: 'Configurar planilha', subtitle: 'Informe o ID da planilha para habilitar o catálogo.' });
    updateSheetStatus('Informe o ID da planilha do catálogo para começar.', 'info');
  }
}

if (sheetForm) {
  sheetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!sheetInput) return;

    const value = sheetInput.value.trim();
    if (!value) {
      updateSheetStatus('Informe um ID de planilha válido.', 'error');
      return;
    }

    setSheetFormDisabled(true);
    updateSheetStatus('Salvando configuração…', 'info');

    try {
      const persistedRemotely = await persistSheetIdToFirestore(value);
      applySheetId(value);
      if (persistedRemotely) {
        updateSheetStatus('ID salvo com sucesso. Carregando catálogo…', 'success');
      } else {
        updateSheetStatus('ID salvo localmente. Carregando catálogo…', 'warning');
      }
      setHeader(defaultCatalogHeader);
      changeView('catalog');
      reloadCatalogFrame();
      restoreLastMiniAppOrCatalog();
    } catch (error) {
      console.error('Erro ao salvar o ID da planilha.', error);
      updateSheetStatus('Erro ao salvar o ID da planilha. Verifique sua conexão e tente novamente.', 'error');
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
    setHeader(data);
  } else if (data.action === 'miniapp-theme-ready') {
    const frames = [catalogFrame, appFrame];
    const targetFrame = frames.find((frame) => frame && frame.contentWindow === event.source);
    if (targetFrame) {
      notifyFrameTheme(targetFrame);
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
  navigator.serviceWorker.register('sw.js').catch((error) => {
    console.error('Falha ao registrar o Service Worker.', error);
  });
}

bootstrapSheetConfig();
