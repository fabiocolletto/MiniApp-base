import { ensureToken, listByName, getJSON, upsertJSON, remove } from '../miniapp-base/js/adapters/drive-appdata.js';

const root = document.querySelector('.ma');
const authButton = document.querySelector('#btnAuthorize');
const authStatusEl = document.querySelector('#authStatus');
const backupStatusEl = document.querySelector('#backupStatus');
const backupUpdatedAtEl = document.querySelector('#backupUpdatedAt');
const backupSizeEl = document.querySelector('#backupSize');
const exportButton = document.querySelector('#btnExport');
const restoreButton = document.querySelector('#btnRestore');
const removeBackupButton = document.querySelector('#btnRemoveBackup');
const tabs = Array.from(document.querySelectorAll('.tabs .tab'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const prefsForm = document.querySelector('#prefsForm');
const prefsStatusEl = document.querySelector('#prefsStatus');
const prefThemeEl = document.querySelector('#prefTheme');
const prefLanguageEl = document.querySelector('#prefLanguage');
const prefNotificationsEl = document.querySelector('#prefNotifications');
const resetPrefsButton = document.querySelector('#btnResetPrefs');

let isAuthorized = false;

const DEFAULT_PREFS = Object.freeze({
  theme: 'system',
  language: 'pt-BR',
  notifications: false,
});

function postMessageToParent(payload) {
  if (!window.parent || typeof window.parent.postMessage !== 'function') {
    return;
  }
  window.parent.postMessage(payload, '*');
}

function applyTheme(theme) {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', normalized);
  if (root) {
    root.setAttribute('data-theme', normalized);
  }
  postMessageToParent({ action: 'miniapp-theme-applied', theme: normalized });
}

function setupThemeBridge() {
  window.addEventListener('message', (event) => {
    const { data } = event;
    if (!data || data.action !== 'shell-theme') {
      return;
    }
    applyTheme(data.theme);
  });

  postMessageToParent({ action: 'miniapp-theme-ready' });
}

function announceHeader() {
  postMessageToParent({
    action: 'miniapp-header',
    title: 'Minha Conta',
    subtitle: 'Gestão de dados e preferências salvas no seu appDataFolder',
  });
}

function announceLanguageReady() {
  postMessageToParent({ action: 'miniapp-language-ready' });
}

function setStatus(element, message, variant = 'muted') {
  if (!element) return;
  element.textContent = message || '';
  element.classList.remove('status', 'is-success', 'is-error', 'is-warning');
  if (!message) {
    return;
  }

  element.classList.add('status');
  if (variant === 'success') {
    element.classList.add('is-success');
  } else if (variant === 'error') {
    element.classList.add('is-error');
  } else if (variant === 'warning') {
    element.classList.add('is-warning');
  }
}

function updateAuthStatus(message, variant = 'muted') {
  setStatus(authStatusEl, message, variant);
}

function toggleAuthDependentElements(enabled) {
  const targets = document.querySelectorAll('[data-requires-auth]');
  targets.forEach((element) => {
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      element.disabled = !enabled;
    } else {
      element.classList.toggle('is-disabled', !enabled);
      element.setAttribute('aria-disabled', String(!enabled));
    }
  });
}

function switchTab(targetId) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tabTarget === targetId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === `tab-${targetId}`;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

function bindTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const { tabTarget } = tab.dataset;
      if (!tabTarget) return;
      switchTab(tabTarget);
    });
  });
}

function toHumanSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '—';
  }
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function refreshBackupMetadata() {
  if (!isAuthorized) {
    backupUpdatedAtEl.textContent = '—';
    backupSizeEl.textContent = '—';
    setStatus(backupStatusEl, 'Autorize sua conta para consultar backups.');
    return;
  }

  setStatus(backupStatusEl, 'Consultando appDataFolder...', 'warning');
  try {
    const files = await listByName('backup.json');
    if (!files.length) {
      backupUpdatedAtEl.textContent = '—';
      backupSizeEl.textContent = '—';
      setStatus(backupStatusEl, 'Nenhum backup encontrado. Faça o primeiro export.', 'warning');
      return;
    }

    const [file] = files;
    backupUpdatedAtEl.textContent = file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : '—';
    backupSizeEl.textContent = toHumanSize(Number(file.size));
    setStatus(backupStatusEl, 'Backup localizado no appDataFolder.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(backupStatusEl, 'Não foi possível consultar os backups. Tente novamente.', 'error');
  }
}

async function collectAppData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    payload: {},
  };
}

async function applyAppData(data) {
  console.info('Restaurando dados do backup (stub).', data);
}

async function handleExport() {
  if (!isAuthorized) return;
  setStatus(backupStatusEl, 'Gerando backup...', 'warning');

  try {
    const data = await collectAppData();
    await upsertJSON('backup.json', data);
    setStatus(backupStatusEl, 'Backup salvo no appDataFolder.', 'success');
    await refreshBackupMetadata();
  } catch (error) {
    console.error(error);
    setStatus(backupStatusEl, 'Não foi possível salvar o backup. Revise a autorização e tente novamente.', 'error');
  }
}

async function handleRestore() {
  if (!isAuthorized) return;
  setStatus(backupStatusEl, 'Carregando backup...', 'warning');

  try {
    const data = await getJSON('backup.json');
    if (!data) {
      setStatus(backupStatusEl, 'Nenhum backup disponível para restaurar.', 'warning');
      return;
    }

    await applyAppData(data);
    setStatus(backupStatusEl, 'Backup restaurado com sucesso.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(backupStatusEl, 'Falha ao restaurar o backup. Confirme a autorização e tente novamente.', 'error');
  }
}

async function handleRemoveBackup() {
  if (!isAuthorized) return;
  setStatus(backupStatusEl, 'Removendo backup...', 'warning');

  try {
    const removed = await remove('backup.json');
    if (removed) {
      setStatus(backupStatusEl, 'Backup removido.', 'success');
    } else {
      setStatus(backupStatusEl, 'Nenhum backup para remover.', 'warning');
    }
    await refreshBackupMetadata();
  } catch (error) {
    console.error(error);
    setStatus(backupStatusEl, 'Não foi possível remover o backup.', 'error');
  }
}

function readFormPreferences() {
  return {
    theme: prefThemeEl.value || DEFAULT_PREFS.theme,
    language: prefLanguageEl.value || DEFAULT_PREFS.language,
    notifications: prefNotificationsEl.checked,
    updatedAt: new Date().toISOString(),
  };
}

function applyPreferencesToForm(prefs = DEFAULT_PREFS) {
  prefThemeEl.value = prefs.theme || DEFAULT_PREFS.theme;
  prefLanguageEl.value = prefs.language || DEFAULT_PREFS.language;
  prefNotificationsEl.checked = Boolean(prefs.notifications);
}

function resetPreferencesForm() {
  applyPreferencesToForm(DEFAULT_PREFS);
  setStatus(prefsStatusEl, 'Preferências padrão restauradas. Salve para persistir a alteração.', 'warning');
}

async function loadPreferences() {
  if (!isAuthorized) return;
  setStatus(prefsStatusEl, 'Buscando preferências...', 'warning');
  try {
    const prefs = await getJSON('prefs.json');
    if (!prefs) {
      applyPreferencesToForm(DEFAULT_PREFS);
      setStatus(prefsStatusEl, 'Nenhuma preferência encontrada. Usando valores padrão.', 'warning');
      return;
    }

    applyPreferencesToForm(prefs);
    setStatus(prefsStatusEl, 'Preferências carregadas do appDataFolder.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(prefsStatusEl, 'Não foi possível carregar as preferências.', 'error');
  }
}

async function savePreferences(event) {
  event.preventDefault();
  if (!isAuthorized) return;

  setStatus(prefsStatusEl, 'Salvando preferências...', 'warning');
  try {
    const prefs = readFormPreferences();
    await upsertJSON('prefs.json', prefs);
    setStatus(prefsStatusEl, 'Preferências salvas no appDataFolder.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(prefsStatusEl, 'Não foi possível salvar as preferências.', 'error');
  }
}

function bindPreferencesForm() {
  if (prefsForm) {
    prefsForm.addEventListener('submit', savePreferences);
  }

  if (resetPrefsButton) {
    resetPrefsButton.addEventListener('click', resetPreferencesForm);
  }
}

async function requestAuthorization() {
  updateAuthStatus('Solicitando autorização ao Google...', 'warning');
  try {
    await ensureToken({ force: true });
    isAuthorized = true;
    toggleAuthDependentElements(true);
    updateAuthStatus('Autorização concluída. Você pode gerenciar seus dados.', 'success');
    await Promise.all([refreshBackupMetadata(), loadPreferences()]);
  } catch (error) {
    console.error(error);
    isAuthorized = false;
    toggleAuthDependentElements(false);
    updateAuthStatus('Não foi possível concluir a autorização. Tente novamente.', 'error');
  }
}

function bindAuthorizeButton() {
  if (!authButton) return;
  authButton.addEventListener('click', () => {
    requestAuthorization();
  });
}

function initializeAuthorizationState() {
  toggleAuthDependentElements(false);
  updateAuthStatus('Conecte sua conta Google para habilitar os recursos.');
}

function bindBackupActions() {
  if (exportButton) {
    exportButton.addEventListener('click', handleExport);
  }
  if (restoreButton) {
    restoreButton.addEventListener('click', handleRestore);
  }
  if (removeBackupButton) {
    removeBackupButton.addEventListener('click', handleRemoveBackup);
  }
}

function bootstrap() {
  initializeAuthorizationState();
  bindAuthorizeButton();
  bindBackupActions();
  bindPreferencesForm();
  bindTabs();
  setupThemeBridge();
  announceHeader();
  announceLanguageReady();
}

bootstrap();
