import { openDatabase, saveRecord, getByKey, deleteRecord } from './indexeddb-store.js';

const ADMIN_VERIFY_URL = "https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec";
const ADMIN_CONFIG_KEY = 'adm_sheet_config';
const ADMIN_PANEL_ID = 'adminControlPanel';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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

async function onAdminIconClick() {
  const now = Date.now();
  let sheetId = null;
  let savedConfig = null;
  let usingValidSavedId = false;

  try {
    savedConfig = await loadAdminConfig();
  } catch (error) {
    console.error('Erro ao tentar ler configuração admin salva.', error);
  }

  if (savedConfig?.expiresAt && savedConfig.expiresAt <= now) {
    await deleteAdminConfig();
    savedConfig = null;
  }

  if (savedConfig?.sheetId && savedConfig.expiresAt > now) {
    const shouldUseSaved = window.confirm('Usar o ID salvo para acessar o Painel de Controles?');
    if (shouldUseSaved) {
      sheetId = savedConfig.sheetId;
      usingValidSavedId = true;
    }
  }

  if (!sheetId) {
    const input = window.prompt('Cole o ID ou link da planilha de administração do MiniApp.');
    const normalizedInput = (input || '').trim();
    if (!normalizedInput) {
      return;
    }
    sheetId = extractSheetId(normalizedInput);
    if (!sheetId) {
      window.alert('ID de planilha não reconhecido.');
      if (savedConfig?.sheetId && savedConfig.sheetId === normalizedInput) {
        await deleteAdminConfig();
      }
      return;
    }
  }

  let verification;
  try {
    verification = await postAdminAction({ action: 'verifyAdmin', sheetId });
  } catch (error) {
    console.error('Erro ao verificar administrador.', error);
    window.alert('Não foi possível validar o administrador. Tente novamente.');
    return;
  }

  if (!verification?.ok) {
    window.alert('ID inválido ou não autorizado.');
    if (savedConfig?.sheetId === sheetId) {
      await deleteAdminConfig();
    }
    return;
  }

  if (!usingValidSavedId) {
    const shouldPersist = window.confirm('Salvar este dispositivo por 30 dias?');
    if (shouldPersist) {
      const expiresAt = now + THIRTY_DAYS_MS;
      await saveAdminConfig({ sheetId, expiresAt });
    }
  }

  enableAdminMode(sheetId);
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
  window.addEventListener('DOMContentLoaded', setupAdminAccess);
}
