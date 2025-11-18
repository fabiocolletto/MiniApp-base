import { openDatabase, saveRecord, getByKey } from './indexeddb-store.js';

const ADMIN_CONFIG_KEY = 'adm_sheet_config';

const globalScope = typeof window !== 'undefined' ? window : undefined;

function dispatchFooterAlert(message, isError = false) {
  if (!message || !globalScope) {
    return;
  }
  globalScope.dispatchEvent(
    new CustomEvent('app:notify', {
      detail: { message, isError },
    })
  );
}

async function ensureDatabaseReady() {
  try {
    await openDatabase();
  } catch (error) {
    console.error('Erro ao abrir o banco IndexedDB para configuração admin.', error);
  }
}

async function getSavedSheetId() {
  try {
    await ensureDatabaseReady();
    const record = await getByKey('userSettings', ADMIN_CONFIG_KEY);
    if (record?.value?.sheetId) {
      return record.value.sheetId;
    }
    if (record?.sheetId) {
      return record.sheetId;
    }
  } catch (error) {
    console.error('Não foi possível carregar a configuração admin salva.', error);
  }
  return null;
}

async function saveSheetId(sheetId) {
  try {
    await ensureDatabaseReady();
    await saveRecord('userSettings', {
      key: ADMIN_CONFIG_KEY,
      value: { sheetId, savedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Não foi possível salvar a configuração admin.', error);
  }
}

function extractSheetId(input) {
  const match = (input || '').match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

async function promptForSheetId() {
  if (!globalScope) {
    return null;
  }
  const input = globalScope.prompt('Cole o ID ou link da planilha de administração do MiniApp.');
  const normalizedInput = (input || '').trim();
  if (!normalizedInput) {
    dispatchFooterAlert('ID da planilha não informado.', true);
    return null;
  }
  const sheetId = extractSheetId(normalizedInput);
  if (!sheetId) {
    dispatchFooterAlert('ID de planilha não reconhecido.', true);
    return null;
  }
  await saveSheetId(sheetId);
  dispatchFooterAlert('ID da planilha salvo para o painel de configurações.', false);
  return sheetId;
}

async function ensureAdminSheetId({ promptIfMissing = false } = {}) {
  const saved = await getSavedSheetId();
  if (saved) {
    return saved;
  }
  if (!promptIfMissing) {
    return null;
  }
  return promptForSheetId();
}

export {
  dispatchFooterAlert,
  ensureAdminSheetId,
  getSavedSheetId,
  promptForSheetId,
};

if (globalScope) {
  globalScope.ensureAdminSheetId = ensureAdminSheetId;
  globalScope.promptForAdminSheetId = promptForSheetId;
}
