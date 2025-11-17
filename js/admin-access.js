import { openDatabase, saveRecord, getByKey, deleteRecord } from './indexeddb-store.js';

const DEFAULT_ADMIN_VERIFY_URL = "https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec";
const globalScope = typeof window !== 'undefined' ? window : undefined;
const ADMIN_VERIFY_URL = globalScope?.MINIAPP_ADMIN_VERIFY_URL || DEFAULT_ADMIN_VERIFY_URL;
const ADMIN_CONFIG_KEY = 'adm_sheet_config';
const ADMIN_PANEL_ID = 'adminControlPanel';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_READY_EVENT = 'admin:ready';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function ensureDatabaseReady() {
  try {
    await openDatabase();
  } catch (error) {
    console.error('Erro ao abrir o banco IndexedDB para configuração admin.', error);
  }
}

async function loadAdminConfig() {
  try {
    await ensureDatabaseReady();
    const record = await getByKey('userSettings', ADMIN_CONFIG_KEY);
    if (record && typeof record.value === 'object') {
      return record.value;
    }
    return record || null;
  } catch (error) {
    console.error('Não foi possível carregar a configuração admin salva.', error);
    return null;
  }
}

async function saveAdminConfig(config) {
  try {
    await ensureDatabaseReady();
    await saveRecord('userSettings', {
      key: ADMIN_CONFIG_KEY,
      value: config,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Não foi possível salvar a configuração admin.', error);
  }
}

async function deleteAdminConfig() {
  try {
    await ensureDatabaseReady();
    await deleteRecord('userSettings', ADMIN_CONFIG_KEY);
  } catch (error) {
    console.error('Não foi possível excluir a configuração admin.', error);
  }
}

function extractSheetId(input) {
  const match = (input || '').match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

function revealAdminIcon() {
  const showIcon = () => {
    const adminConfigIcon = document.getElementById('footer-config-icon');
    if (!adminConfigIcon) {
      return false;
    }

    adminConfigIcon.classList.remove('hidden');
    adminConfigIcon.setAttribute('aria-hidden', 'false');
    adminConfigIcon.tabIndex = 0;
    return true;
  };

  if (showIcon()) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (showIcon()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => observer.disconnect(), 3000);
}

async function postAdminAction(payload) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };

  const response = await fetch(ADMIN_VERIFY_URL, options);
  if (!response.ok) {
    throw new Error(`Requisição Apps Script falhou: ${response.status}`);
  }
  return response.json();
}

function ensureAdminPanelContainer() {
  let panel = document.getElementById(ADMIN_PANEL_ID);
  if (!panel) {
    panel = document.createElement('aside');
    panel.id = ADMIN_PANEL_ID;
    panel.className = 'admin-control-panel';
    panel.innerHTML = '<div class="admin-panel-content"></div>';
    document.body.appendChild(panel);
  }
  return panel;
}

function setAdminPanelContent(content) {
  const panel = ensureAdminPanelContainer();
  let contentContainer = panel.querySelector('.admin-panel-content');
  if (!contentContainer) {
    panel.innerHTML = '<div class="admin-panel-content"></div>';
    contentContainer = panel.querySelector('.admin-panel-content');
  }
  contentContainer.innerHTML = content;
}

function buildLoadingState() {
  return `
    <h3>Painel de Controles</h3>
    <p class="admin-panel-status">Carregando…</p>
  `;
}

function buildCatalogHeaderContent(value) {
  const safeValue = escapeHtml(value || '—');
  return `
    <h3>Painel de Controles</h3>
    <p class="admin-panel-status">Cabeçalho do catálogo (A1):</p>
    <p class="admin-panel-value">${safeValue}</p>
  `;
}

function buildErrorContent() {
  return `
    <h3>Painel de Controles</h3>
    <p class="admin-panel-status admin-panel-error">Não foi possível carregar a célula A1 da aba catalogo.</p>
  `;
}

function buildUnauthorizedContent() {
  return `
    <h3>Painel de Controles</h3>
    <p class="admin-panel-status admin-panel-error">Sua conta Google não está autorizada ou o ID da planilha é inválido.</p>
  `;
}

async function getValidSavedSheetConfig(now = Date.now()) {
  let savedConfig = null;
  try {
    savedConfig = await loadAdminConfig();
  } catch (error) {
    console.error('Erro ao tentar ler configuração admin salva.', error);
  }

  if (savedConfig?.expiresAt && savedConfig.expiresAt <= now) {
    await deleteAdminConfig();
    return null;
  }

  return savedConfig || null;
}

async function verifyAdminAccess(sheetId) {
  if (!sheetId) {
    return { ok: false, message: 'Sheet ID ausente' };
  }

  try {
    const verification = await postAdminAction({ action: 'verifyAdmin', sheetId });
    if (verification?.ok) {
      revealAdminIcon();
      document.dispatchEvent(new CustomEvent(ADMIN_READY_EVENT, { detail: { sheetId } }));
      return { ok: true };
    }

    return { ok: false, message: verification?.message || 'Não autorizado' };
  } catch (error) {
    console.error('Erro ao verificar administrador.', error);
    return { ok: false, message: 'Falha ao validar com Apps Script' };
  }
}

function requestSheetIdFromUser() {
  const input = window.prompt('Cole o ID ou link da planilha de administração do MiniApp.');
  const normalizedInput = (input || '').trim();
  if (!normalizedInput) {
    return null;
  }
  const sheetId = extractSheetId(normalizedInput);
  if (!sheetId) {
    window.alert('ID de planilha não reconhecido.');
    return null;
  }
  return sheetId;
}

async function persistSheetId(sheetId, now = Date.now()) {
  const expiresAt = now + THIRTY_DAYS_MS;
  await saveAdminConfig({ sheetId, expiresAt });
}

async function enableAdminMode(sheetId) {
  setAdminPanelContent(buildLoadingState());

  try {
    const response = await postAdminAction({ action: 'getCatalogHeader', sheetId });
    if (response?.ok && typeof response.value !== 'undefined') {
      setAdminPanelContent(buildCatalogHeaderContent(response.value));
      return;
    }

    console.error('Erro ao carregar A1 do catálogo.', response?.message);
    setAdminPanelContent(buildErrorContent());
  } catch (error) {
    console.error('Falha na leitura da célula A1.', error);
    setAdminPanelContent(buildErrorContent());
  }
}

async function startAdminFlow({ triggeredByClick = false, allowPrompt = true } = {}) {
  if (!navigator.onLine) {
    if (triggeredByClick) {
      window.alert('Conecte-se à internet e ao Google para validar o painel.');
    }
    return false;
  }

  const now = Date.now();
  const savedConfig = await getValidSavedSheetConfig(now);
  let sheetId = savedConfig?.sheetId || null;

  if (sheetId) {
    const verification = await verifyAdminAccess(sheetId);
    if (verification.ok) {
      await persistSheetId(sheetId, now);
      await enableAdminMode(sheetId);
      return true;
    }

    await deleteAdminConfig();
    sheetId = null;
  }

  if (!allowPrompt) {
    return false;
  }

  const requestedSheetId = requestSheetIdFromUser();
  if (!requestedSheetId) {
    return false;
  }

  const verification = await verifyAdminAccess(requestedSheetId);
  if (!verification.ok) {
    window.alert('ID inválido ou usuário não autorizado. Confira a conta Google ativa.');
    setAdminPanelContent(buildUnauthorizedContent());
    return false;
  }

  await persistSheetId(requestedSheetId, now);
  await enableAdminMode(requestedSheetId);
  return true;
}

async function onAdminIconClick() {
  await startAdminFlow({ triggeredByClick: true, allowPrompt: true });
}

function setupAdminAccess() {
  document.addEventListener('click', (event) => {
    const icon = event.target.closest('#footer-config-icon');
    if (!icon) {
      return;
    }

    event.preventDefault();
    onAdminIconClick();
  });
}

if (typeof window !== 'undefined') {
  window.enableAdminMode = enableAdminMode;
  window.addEventListener('DOMContentLoaded', () => {
    setupAdminAccess();
    startAdminFlow({ allowPrompt: true });
  });
}
