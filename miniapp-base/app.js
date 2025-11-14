import { applyTranslations, getTranslation, formatDate } from './i18n.js';
import {
  listMiniApps,
  getMiniAppById,
  getMiniAppLabel,
  getMiniAppDescription,
  getMiniAppShortLabel,
} from './miniapps.js';
import { checkStorageStatus } from './storage.js';
import { sdk } from './sdk.js';
import { SYNC_STATUSES } from './sync.js';

const state = {
  prefs: null,
  miniapps: listMiniApps(),
  currentView: 'miniapps',
  activeMiniApp: null,
  storageStatus: null,
  version: null,
  updatedAtRaw: null,
  syncState: {
    enabled: false,
    status: SYNC_STATUSES.DISCONNECTED,
    lastSyncAt: null,
    lastError: null,
  },
};

const {
  loadPreferences,
  applyPreferences,
  savePreferences,
  getCurrentPreferences,
  getFontMultiplier,
} = sdk.preferences;

const prefsBus = sdk.events.createPrefsBus();
const storeBus = sdk.events.createStoreBus();
const autosaveController = sdk.autosave.createAutosaveController({ bus: storeBus, source: 'shell' });
const syncController = sdk.sync.initSync({ storeBus });

autosaveController.subscribe(handleAutosaveStateChange);
syncController.ready.then(() => {
  handleSyncStateChange(syncController.getState());
});
syncController.subscribe(handleSyncStateChange);

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
  syncToggle: document.querySelector('[data-sync-toggle]'),
  syncDelete: document.querySelector('[data-sync-delete]'),
  syncStatus: document.querySelector('[data-sync-status]'),
  syncLastSync: document.querySelector('[data-sync-last-sync]'),
  syncErrorRow: document.querySelector('[data-sync-error-row]'),
  syncError: document.querySelector('[data-sync-error]'),
  syncFooter: document.querySelector('[data-sync-label]'),
  menuVisibilityToggle: document.querySelector('[data-toggle-main-menu]'),
  menuVisibilityToggleLabel: document.querySelector('[data-menu-toggle-label]'),
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
  const navToggle = elements.settingsForm.querySelector('[data-setting-input="navCollapsed"]');
  if (themeSelect) themeSelect.value = prefs.theme;
  if (langSelect) langSelect.value = prefs.lang;
  if (fontRange) {
    fontRange.value = String(prefs.fontScale);
    updateFontPreview(prefs.fontScale);
  }
  if (navToggle) {
    navToggle.checked = Boolean(prefs.navCollapsed);
  }
}

function renderMiniAppCard(miniapp, lang) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'miniapp-launcher';
  button.dataset.appId = miniapp.id;
  button.addEventListener('click', () => {
    openMiniApp(miniapp.id);
  });
  button.setAttribute('aria-label', getMiniAppLabel(miniapp, lang));

  const icon = document.createElement('span');
  icon.className = 'miniapp-launcher__icon';
  const img = document.createElement('img');
  img.src = miniapp.icon;
  img.alt = '';
  img.decoding = 'async';
  img.loading = 'lazy';
  icon.appendChild(img);

  const label = document.createElement('span');
  label.className = 'miniapp-launcher__label';
  label.textContent = getMiniAppShortLabel(miniapp, lang);

  button.appendChild(icon);
  button.appendChild(label);
  return button;
}

const AUTOSAVE_TRANSLATIONS = {
  synced: 'status.synced',
  dirty: 'status.dirty',
  saving: 'status.saving',
  saved: 'status.saved',
  error: 'status.error',
};

function handleAutosaveStateChange(nextState) {
  const lang = state.prefs?.lang ?? 'pt-BR';
  const translationKey = AUTOSAVE_TRANSLATIONS[nextState] ?? AUTOSAVE_TRANSLATIONS.synced;
  if (elements.autosaveLabel) {
    elements.autosaveLabel.textContent = getTranslation(lang, translationKey);
  }
}

const SYNC_STATUS_TRANSLATIONS = {
  [SYNC_STATUSES.DISCONNECTED]: 'sync.status.disconnected',
  [SYNC_STATUSES.AUTHORIZING]: 'sync.status.authorizing',
  [SYNC_STATUSES.SYNCING]: 'sync.status.syncing',
  [SYNC_STATUSES.SYNCED]: 'sync.status.synced',
  [SYNC_STATUSES.ERROR]: 'sync.status.error',
};

function formatSyncDate(timestamp, lang) {
  if (!timestamp) return getTranslation(lang, 'sync.lastSync.never');
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return getTranslation(lang, 'sync.lastSync.never');
  }
  return formatDate(date, lang);
}

function updateSyncUi(syncState) {
  if (!syncState) return;
  state.syncState = {
    ...state.syncState,
    ...syncState,
  };
  const lang = state.prefs?.lang ?? 'pt-BR';
  const statusKey = SYNC_STATUS_TRANSLATIONS[state.syncState.status] ?? SYNC_STATUS_TRANSLATIONS[SYNC_STATUSES.DISCONNECTED];
  const statusLabel = getTranslation(lang, statusKey);
  if (elements.syncStatus) {
    if (elements.syncStatus.dataset) {
      elements.syncStatus.dataset.i18n = statusKey;
    }
    elements.syncStatus.textContent = statusLabel;
  }
  if (elements.syncFooter) {
    if (elements.syncFooter.dataset) {
      elements.syncFooter.dataset.i18n = statusKey;
    }
    elements.syncFooter.textContent = statusLabel;
  }
  if (elements.syncToggle) {
    const actionKey = state.syncState.enabled ? 'settings.sync.disable' : 'settings.sync.enable';
    const toggleLabel = elements.syncToggle.querySelector('[data-i18n]');
    const target = toggleLabel ?? elements.syncToggle;
    if (toggleLabel?.dataset) {
      toggleLabel.dataset.i18n = actionKey;
    } else if (elements.syncToggle.dataset) {
      elements.syncToggle.dataset.i18n = actionKey;
    }
    target.textContent = getTranslation(lang, actionKey);
    elements.syncToggle.dataset.state = state.syncState.enabled ? 'on' : 'off';
    elements.syncToggle.setAttribute('aria-pressed', state.syncState.enabled ? 'true' : 'false');
    const busy =
      state.syncState.status === SYNC_STATUSES.AUTHORIZING || state.syncState.status === SYNC_STATUSES.SYNCING;
    elements.syncToggle.disabled = busy;
  }
  if (elements.syncDelete) {
    const busy =
      state.syncState.status === SYNC_STATUSES.AUTHORIZING || state.syncState.status === SYNC_STATUSES.SYNCING;
    elements.syncDelete.disabled = busy;
  }
  if (elements.syncLastSync) {
    if (state.syncState.lastSyncAt) {
      if (elements.syncLastSync.dataset) {
        delete elements.syncLastSync.dataset.i18n;
      }
      elements.syncLastSync.textContent = formatSyncDate(state.syncState.lastSyncAt, lang);
    } else {
      if (elements.syncLastSync.dataset) {
        elements.syncLastSync.dataset.i18n = 'sync.lastSync.never';
      }
      elements.syncLastSync.textContent = getTranslation(lang, 'sync.lastSync.never');
    }
  }
  if (elements.syncErrorRow && elements.syncError) {
    if (state.syncState.lastError) {
      elements.syncError.textContent = state.syncState.lastError;
      elements.syncErrorRow.hidden = false;
    } else {
      elements.syncError.textContent = '';
      elements.syncErrorRow.hidden = true;
    }
  }
}

function updateMenuToggleUi() {
  if (!elements.menuVisibilityToggle) return;
  const lang = state.prefs?.lang ?? 'pt-BR';
  const collapsed = Boolean(state.prefs?.navCollapsed);
  const labelKey = collapsed ? 'miniapp.menuShow' : 'miniapp.menuHide';
  if (elements.menuVisibilityToggleLabel) {
    if (elements.menuVisibilityToggleLabel.dataset) {
      elements.menuVisibilityToggleLabel.dataset.i18n = labelKey;
    }
    elements.menuVisibilityToggleLabel.textContent = getTranslation(lang, labelKey);
  } else {
    if (elements.menuVisibilityToggle.dataset) {
      elements.menuVisibilityToggle.dataset.i18n = labelKey;
    }
    elements.menuVisibilityToggle.textContent = getTranslation(lang, labelKey);
  }
  elements.menuVisibilityToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
}

function handleSyncStateChange(next) {
  const previousError = state.syncState?.lastError ?? null;
  updateSyncUi(next);
  if (next?.lastError && next.lastError !== previousError && next.status === SYNC_STATUSES.ERROR) {
    const lang = state.prefs?.lang ?? 'pt-BR';
    showToast(getTranslation(lang, 'settings.sync.errorToast'));
  }
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

async function persistPreferences(partial, { broadcast = true } = {}) {
  try {
    autosaveController.markSaving();
    const saved = await savePreferences(partial);
    state.prefs = saved;
    applyPreferences(saved);
    applyTranslations(document, saved.lang);
    renderMiniAppGrids();
    updateSettingsForm(saved);
    updateFontPreview(saved.fontScale);
    updateVersionDisplay();
    refreshStorageStatus();
    updateSyncUi(state.syncState);
    updateMenuToggleUi();
    autosaveController.markSaved();
    if (broadcast) {
      prefsBus.post({ type: 'preferences', prefs: saved });
    }
  } catch (error) {
    console.error('Erro ao salvar preferências', error);
    autosaveController.markError();
    throw error;
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
      navCollapsed: formData.get('navCollapsed') === 'on' || formData.get('navCollapsed') === 'true',
    };
    await persistPreferences(next);
  });

  elements.settingsForm.addEventListener('input', (event) => {
    const control = event.target;
    if (control?.dataset?.settingInput === 'fontScale') {
      updateFontPreview(control.value);
    }
  });
}

function attachSyncListeners() {
  if (elements.syncToggle) {
    elements.syncToggle.addEventListener('click', async () => {
      const lang = state.prefs?.lang ?? 'pt-BR';
      try {
        if (!state.syncState.enabled) {
          await syncController.enable();
        } else {
          await syncController.disable();
        }
      } catch (error) {
        console.error('Erro ao alternar sincronização', error);
        showToast(getTranslation(lang, 'settings.sync.toggleError'));
      }
    });
  }

  if (elements.syncDelete) {
    elements.syncDelete.addEventListener('click', async () => {
      const lang = state.prefs?.lang ?? 'pt-BR';
      const confirmation = getTranslation(lang, 'settings.sync.deleteConfirm');
      const confirmed = typeof window !== 'undefined' ? window.confirm(confirmation) : true;
      if (!confirmed) return;
      try {
        await syncController.deleteBackups();
        showToast(getTranslation(lang, 'settings.sync.deleteSuccess'));
      } catch (error) {
        console.error('Erro ao excluir backups', error);
        showToast(getTranslation(lang, 'settings.sync.deleteError'));
      }
    });
  }
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

function attachMenuVisibilityToggle() {
  if (!elements.menuVisibilityToggle) return;
  elements.menuVisibilityToggle.addEventListener('click', async () => {
    const next = !Boolean(state.prefs?.navCollapsed);
    await persistPreferences({ navCollapsed: next });
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
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.miniappActive = 'true';
  }
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
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.miniappActive = 'false';
  }
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
  if (
    message.type === 'status' &&
    typeof message.state === 'string' &&
    message.state === 'saved' &&
    state.syncState.enabled
  ) {
    syncController.syncNow({ reason: 'autosave' }).catch(() => {});
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
    updateFontPreview(message.prefs.fontScale);
    updateMenuToggleUi();
    handleAutosaveStateChange(autosaveController.getState());
    updateSyncUi(state.syncState);
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
    setView('miniapps', { navTarget: 'miniapps' });
  }
}

async function bootstrap() {
  attachNavListeners();
  attachSettingsListeners();
  attachMenuToggle();
  attachMenuVisibilityToggle();
  attachSyncListeners();
  attachMiniAppActions();
  setupEventBuses();

  state.prefs = await loadPreferences();
  applyPreferences(state.prefs);
  applyTranslations(document, state.prefs.lang);
  renderMiniAppGrids();
  updateSettingsForm(state.prefs);
  updateFontPreview(state.prefs.fontScale);
  updateMenuToggleUi();
  handleAutosaveStateChange(autosaveController.getState());
  updateSyncUi(state.syncState);
  updateVersionDisplay();
  loadVersionMetadata();
  refreshStorageStatus();

  prefsBus.post({ type: 'preferences', prefs: getCurrentPreferences() });

  const params = new URLSearchParams(window.location.search);
  const initialMiniApp = params.get('app');
  if (initialMiniApp) {
    openMiniApp(initialMiniApp, { updateHistory: false });
  } else {
    setView('miniapps', { navTarget: 'miniapps' });
  }

  window.addEventListener('popstate', handlePopState);
}

bootstrap();
