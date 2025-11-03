import { applyTranslations, getTranslation, formatDate } from './i18n.js';
import {
  loadPreferences,
  applyPreferences,
  savePreferences,
  getCurrentPreferences,
  getFontMultiplier,
} from './preferences.js';
import { listMiniApps, getMiniAppById, getMiniAppLabel, getMiniAppDescription } from './miniapps.js';
import { createPrefsBus, createStoreBus } from './event-bus.js';
import { checkStorageStatus } from './storage.js';

const state = {
  prefs: null,
  miniapps: listMiniApps(),
  currentView: 'home',
  activeMiniApp: null,
  autosaveState: 'synced',
  autosaveTimer: null,
  storageStatus: null,
  version: null,
  updatedAtRaw: null,
};

const prefsBus = createPrefsBus();
const storeBus = createStoreBus();

const elements = {
  navButtons: Array.from(document.querySelectorAll('[data-nav]')),
  views: new Map(),
  primaryGrid: document.querySelector('[data-miniapp-grid]'),
  secondaryGrid: document.querySelector('[data-miniapp-grid-secondary]'),
  settingsForm: document.querySelector('[data-settings-form]'),
  fontPreview: document.querySelector('[data-font-preview]'),
  autosaveLabel: document.querySelector('[data-autosave-label]'),
  toast: document.querySelector('.toast'),
  toastMessage: document.querySelector('[data-toast-message]'),
  footerVersion: document.querySelector('[data-footer-version]'),
  mobileMenu: document.querySelector('[data-mobile-menu]'),
  nav: document.getElementById('appPrimaryNav'),
  miniappFrame: document.querySelector('[data-miniapp-frame]'),
  miniappTitle: document.querySelector('[data-miniapp-title]'),
  miniappDescription: document.querySelector('[data-miniapp-description]'),
  closeMiniapp: document.querySelector('[data-close-miniapp]'),
  externalMiniapp: document.querySelector('[data-open-miniapp-external]'),
  storagePersisted: document.querySelector('[data-storage-persisted]'),
  storageQuota: document.querySelector('[data-storage-quota]'),
  storageUsage: document.querySelector('[data-storage-usage]'),
  storageUpdated: document.querySelector('[data-storage-updated]'),
};

document.querySelectorAll('[data-view-section]').forEach((section) => {
  elements.views.set(section.dataset.viewSection, section);
});

function setNavActive(target) {
  elements.navButtons.forEach((button) => {
    const isActive = button.dataset.nav === target;
    button.classList.toggle('is-active', isActive);
    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function setView(view, { navTarget } = {}) {
  state.currentView = view;
  elements.views.forEach((section, key) => {
    const isActive = key === view;
    section.classList.toggle('is-active', isActive);
    section.hidden = !isActive;
  });
  if (navTarget) {
    setNavActive(navTarget);
  }
}

function showToast(message, duration = 4000) {
  if (!elements.toast || !elements.toastMessage) return;
  elements.toastMessage.textContent = message;
  elements.toast.hidden = false;
  elements.toast.removeAttribute('hidden');
  elements.toast.setAttribute('aria-hidden', 'false');
  elements.toast.classList.add('is-visible');
  setTimeout(() => {
    if (!elements.toast) return;
    elements.toast.classList.remove('is-visible');
    elements.toast.setAttribute('aria-hidden', 'true');
    elements.toast.hidden = true;
  }, duration);
}

function updateFontPreview(fontScale) {
  const multiplier = getFontMultiplier(fontScale);
  if (elements.fontPreview) {
    elements.fontPreview.textContent = `${Math.round(multiplier * 100)}%`;
  }
}

function updateSettingsForm(prefs) {
  if (!elements.settingsForm || !prefs) return;
  const themeSelect = elements.settingsForm.querySelector('[data-setting-input="theme"]');
  const langSelect = elements.settingsForm.querySelector('[data-setting-input="lang"]');
  const fontRange = elements.settingsForm.querySelector('[data-setting-input="fontScale"]');
  if (themeSelect) themeSelect.value = prefs.theme;
  if (langSelect) langSelect.value = prefs.lang;
  if (fontRange) {
    fontRange.value = String(prefs.fontScale);
    updateFontPreview(prefs.fontScale);
  }
}

function clearAutosaveTimer() {
  if (state.autosaveTimer) {
    clearTimeout(state.autosaveTimer);
    state.autosaveTimer = null;
  }
}

function updateAutosaveState(nextState, { broadcast = false, source = 'shell' } = {}) {
  state.autosaveState = nextState;
  clearAutosaveTimer();
  const translationKey = {
    synced: 'status.synced',
    dirty: 'status.dirty',
    saving: 'status.saving',
    saved: 'status.saved',
    error: 'status.error',
  }[nextState] || 'status.synced';
  const lang = state.prefs?.lang ?? 'pt-BR';
  if (elements.autosaveLabel) {
    elements.autosaveLabel.textContent = getTranslation(lang, translationKey);
  }
  if (broadcast) {
    storeBus.post({ type: 'status', state: nextState, source });
  }
  if (nextState === 'saved') {
    state.autosaveTimer = setTimeout(() => {
      updateAutosaveState('synced', { broadcast: broadcast, source });
    }, 1800);
  }
}

function renderMiniAppCard(miniapp, lang) {
  const card = document.createElement('article');
  card.className = 'app-card';
  card.setAttribute('role', 'listitem');

  const icon = document.createElement('div');
  icon.className = 'app-card__icon';
  const img = document.createElement('img');
  img.src = miniapp.icon;
  img.alt = '';
  img.decoding = 'async';
  img.loading = 'lazy';
  icon.appendChild(img);

  const title = document.createElement('h3');
  title.className = 'app-card__title';
  title.textContent = getMiniAppLabel(miniapp, lang);

  const description = document.createElement('p');
  description.className = 'app-card__description';
  description.textContent = getMiniAppDescription(miniapp, lang);

  const footer = document.createElement('div');
  footer.className = 'app-card__footer';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'app-card__button';
  button.dataset.appId = miniapp.id;
  button.textContent = getTranslation(lang, 'miniapp.open');
  button.addEventListener('click', () => {
    openMiniApp(miniapp.id);
  });

  footer.appendChild(button);

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(footer);
  return card;
}

function renderMiniAppGrids() {
  const lang = state.prefs?.lang ?? 'pt-BR';
  if (elements.primaryGrid) {
    elements.primaryGrid.innerHTML = '';
    state.miniapps.forEach((miniapp) => {
      elements.primaryGrid.appendChild(renderMiniAppCard(miniapp, lang));
    });
  }
  if (elements.secondaryGrid) {
    elements.secondaryGrid.innerHTML = '';
    state.miniapps.forEach((miniapp) => {
      elements.secondaryGrid.appendChild(renderMiniAppCard(miniapp, lang));
    });
  }
}

function attachNavListeners() {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.nav;
      if (!target) return;
      if (target === 'miniapps' && state.activeMiniApp) {
        setView('miniapp-host', { navTarget: 'miniapps' });
        return;
      }
      setView(target, { navTarget: target });
      if (target === 'diagnostics') {
        refreshStorageStatus();
      }
    });
  });
}

function attachSettingsListeners() {
  if (!elements.settingsForm) return;
  elements.settingsForm.addEventListener('change', async (event) => {
    const control = event.target;
    const key = control?.dataset?.settingInput;
    if (!key) return;
    const formData = new FormData(elements.settingsForm);
    const next = {
      theme: formData.get('theme'),
      lang: formData.get('language') ?? formData.get('lang'),
      fontScale: Number.parseInt(formData.get('fontScale'), 10),
    };
    try {
      updateAutosaveState('saving', { broadcast: true, source: 'shell:prefs' });
      const saved = await savePreferences(next);
      state.prefs = saved;
      applyPreferences(saved);
      applyTranslations(document, saved.lang);
      renderMiniAppGrids();
      updateSettingsForm(saved);
      updateVersionDisplay();
      refreshStorageStatus();
      updateAutosaveState('saved', { broadcast: true, source: 'shell:prefs' });
      prefsBus.post({ type: 'preferences', prefs: saved });
    } catch (error) {
      console.error('Erro ao salvar preferências', error);
      updateAutosaveState('error', { broadcast: true, source: 'shell:prefs' });
    }
  });

  elements.settingsForm.addEventListener('input', (event) => {
    const control = event.target;
    if (control?.dataset?.settingInput === 'fontScale') {
      updateFontPreview(control.value);
    }
  });
}

function attachMenuToggle() {
  if (!elements.mobileMenu) return;
  elements.mobileMenu.addEventListener('click', () => {
    const expanded = elements.mobileMenu.getAttribute('aria-expanded') === 'true';
    elements.mobileMenu.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    const firstButton = elements.nav?.querySelector('button');
    firstButton?.focus();
  });
}

function removeFrameListeners() {
  if (!elements.miniappFrame) return;
  elements.miniappFrame.onload = null;
  elements.miniappFrame.onerror = null;
}

function handleMiniAppLoad(miniapp) {
  if (!elements.miniappFrame) return;
  let blocked = false;
  try {
    const doc = elements.miniappFrame.contentDocument;
    blocked = !doc || doc.body?.childElementCount === 0;
  } catch (error) {
    blocked = true;
  }
  if (blocked) {
    handleMiniAppBlocked(miniapp);
  } else {
    elements.externalMiniapp?.setAttribute('hidden', '');
  }
}

function handleMiniAppBlocked(miniapp) {
  if (!miniapp || !elements.miniappFrame) return;
  elements.miniappFrame.src = 'about:blank';
  if (elements.externalMiniapp) {
    elements.externalMiniapp.href = miniapp.entry;
    elements.externalMiniapp.hidden = false;
  }
  const lang = state.prefs?.lang ?? 'pt-BR';
  showToast(getTranslation(lang, 'toast.externalBlocked'));
  window.open(miniapp.entry, '_blank', 'noopener');
}

function openMiniApp(id, { updateHistory = true } = {}) {
  const miniapp = getMiniAppById(id);
  const lang = state.prefs?.lang ?? 'pt-BR';
  if (!miniapp) {
    showToast(getTranslation(lang, 'miniapp.notFound'));
    return;
  }
  state.activeMiniApp = miniapp;
  setView('miniapp-host', { navTarget: 'miniapps' });
  if (elements.miniappTitle) {
    elements.miniappTitle.textContent = getMiniAppLabel(miniapp, lang);
  }
  if (elements.miniappDescription) {
    elements.miniappDescription.textContent = getMiniAppDescription(miniapp, lang);
  }
  if (elements.miniappFrame) {
    removeFrameListeners();
    elements.miniappFrame.title = getMiniAppLabel(miniapp, lang);
    elements.miniappFrame.src = miniapp.entry;
    elements.miniappFrame.onload = () => handleMiniAppLoad(miniapp);
    elements.miniappFrame.onerror = () => handleMiniAppBlocked(miniapp);
  }
  if (elements.externalMiniapp) {
    elements.externalMiniapp.href = miniapp.entry;
    elements.externalMiniapp.hidden = true;
  }
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set('app', miniapp.id);
    window.history.pushState({ app: miniapp.id }, '', url);
  }
}

function closeMiniApp({ updateHistory = true } = {}) {
  state.activeMiniApp = null;
  removeFrameListeners();
  if (elements.miniappFrame) {
    elements.miniappFrame.src = 'about:blank';
  }
  if (elements.externalMiniapp) {
    elements.externalMiniapp.hidden = true;
  }
  setView('home', { navTarget: 'home' });
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.delete('app');
    window.history.replaceState({ app: null }, '', url);
  }
}

function attachMiniAppActions() {
  elements.closeMiniapp?.addEventListener('click', () => {
    closeMiniApp({ updateHistory: true });
  });
}

async function refreshStorageStatus() {
  const lang = state.prefs?.lang ?? 'pt-BR';
  state.storageStatus = await checkStorageStatus(lang);
  updateDiagnostics(state.storageStatus);
}

function updateDiagnostics(status) {
  if (!status) return;
  elements.storagePersisted.textContent = status.formatted.persisted ?? '—';
  elements.storageQuota.textContent = status.formatted.quota ?? '—';
  elements.storageUsage.textContent = status.formatted.usage ?? '—';
  elements.storageUpdated.textContent = status.formatted.timestamp ?? '—';
}

function updateVersionDisplay() {
  const lang = state.prefs?.lang ?? 'pt-BR';
  const versionText = state.version ? `v${state.version}` : 'v1.0.0';
  const footerVersion = document.querySelector('[data-footer-version]');
  if (footerVersion) {
    footerVersion.textContent = versionText;
  }
  const aboutVersion = document.querySelector('[data-app-version]');
  if (aboutVersion) {
    aboutVersion.textContent = state.version ?? '1.0.0';
  }
  const updatedEl = document.querySelector('[data-app-updated]');
  if (updatedEl) {
    if (state.updatedAtRaw) {
      const date = new Date(state.updatedAtRaw);
      updatedEl.textContent = formatDate(date, lang);
    } else {
      updatedEl.textContent = '—';
    }
  }
}

async function loadVersionMetadata() {
  try {
    const response = await fetch('./public/meta/app-version.json', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    state.version = payload.version ?? '1.0.0';
    state.updatedAtRaw = payload.updatedAt ?? new Date().toISOString();
    updateVersionDisplay();
  } catch (error) {
    console.warn('Falha ao carregar versão do app.', error);
  }
}

function handleStoreMessages(message) {
  if (!message || typeof message !== 'object') return;
  if (message.type === 'status' && typeof message.state === 'string') {
    updateAutosaveState(message.state, { broadcast: false, source: message.source ?? 'miniapp' });
  }
}

function handlePrefsMessages(message) {
  if (!message || typeof message !== 'object') return;
  if (message.type === 'preferences' && message.prefs) {
    state.prefs = message.prefs;
    applyPreferences(message.prefs);
    applyTranslations(document, message.prefs.lang);
    renderMiniAppGrids();
    updateSettingsForm(message.prefs);
    updateVersionDisplay();
    refreshStorageStatus();
  }
}

function setupEventBuses() {
  storeBus.subscribe(handleStoreMessages);
  prefsBus.subscribe(handlePrefsMessages);
}

function handlePopState() {
  const params = new URLSearchParams(window.location.search);
  const appId = params.get('app');
  if (appId) {
    openMiniApp(appId, { updateHistory: false });
  } else if (state.activeMiniApp) {
    closeMiniApp({ updateHistory: false });
  } else {
    setView('home', { navTarget: 'home' });
  }
}

async function bootstrap() {
  attachNavListeners();
  attachSettingsListeners();
  attachMenuToggle();
  attachMiniAppActions();
  setupEventBuses();

  state.prefs = await loadPreferences();
  applyPreferences(state.prefs);
  applyTranslations(document, state.prefs.lang);
  renderMiniAppGrids();
  updateSettingsForm(state.prefs);
  updateFontPreview(state.prefs.fontScale);
  updateAutosaveState('synced');
  updateVersionDisplay();
  loadVersionMetadata();
  refreshStorageStatus();

  prefsBus.post({ type: 'preferences', prefs: getCurrentPreferences() });

  const params = new URLSearchParams(window.location.search);
  const initialMiniApp = params.get('app');
  if (initialMiniApp) {
    openMiniApp(initialMiniApp, { updateHistory: false });
  } else {
    setView('home', { navTarget: 'home' });
  }

  window.addEventListener('popstate', handlePopState);
}

bootstrap();
