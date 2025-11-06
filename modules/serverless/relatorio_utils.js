/**
 * Biblioteca de Funções Essenciais (Utility Library) - relatorio_utils.js
 * Versão: v1.1-hardening
 * Objetivo: PWA (IndexedDB), Multi-Dispositivo (Serverless Sync) e Segurança (OAuth/WebAuthn roadmap)
 * Produto: Painel Executivo 5 Horas P&A
 */
'use strict';

// -----------------------------------------------------------------------------
// I. CONFIGURAÇÕES GLOBAIS (EDITE AQUI)
// -----------------------------------------------------------------------------
const APP_CONFIG = {
  // OAuth (Google Identity Services)
  GOOGLE_CLIENT_ID: 'SEU_CLIENT_ID_DO_GOOGLE_AQUI',

  // Web App do Google Apps Script (fonte de dados)
  GAS_ENDPOINT_BASE: 'SUA_URL_DO_GAS_AQUI',

  // IndexedDB
  DB_NAME: 'PainelPrefeitoDB',
  DB_VERSION: 1,
  STORE_REPORT: 'report_data',   // datasets (relatórios)
  STORE_PREFS: 'user_prefs',     // preferências e metadados
  PREFS_FILE_ID_KEY: 'drive_file_id',     // mapeia o ID do arquivo de prefs no Drive
  BIOMETRIC_PREF_KEY: 'biometric_enabled',// toggle de biometria
  DEBUG: true
};

// Estado efêmero (não persistir token)
let CURRENT_USER_ACCESS_TOKEN = null;

// Utilitário de log (silencia em produção)
function log(...args) { if (APP_CONFIG.DEBUG) console.log('[relatorioUtils]', ...args); }
function warn(...args) { console.warn('[relatorioUtils]', ...args); }
function err(...args) { console.error('[relatorioUtils]', ...args); }

// -----------------------------------------------------------------------------
// II. CACHE & OFFLINE — IndexedDB
// -----------------------------------------------------------------------------
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(APP_CONFIG.DB_NAME, APP_CONFIG.DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(APP_CONFIG.STORE_REPORT)) {
        db.createObjectStore(APP_CONFIG.STORE_REPORT, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(APP_CONFIG.STORE_PREFS)) {
        db.createObjectStore(APP_CONFIG.STORE_PREFS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror   = (event) => reject(event.target.error || new Error('IndexedDB open error'));
  });
}

// Helper transacional — resolve somente em tx.oncomplete (evita condição de corrida)
function operateOnDB(storeName, mode, callback) {
  return openIndexedDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], mode);
    const store = tx.objectStore(storeName);

    let req;
    try { req = callback(store); }
    catch (e) { reject(e); return; }

    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror    = () => reject(tx.error || new Error('IndexedDB tx error'));
  }));
}

// Persiste JSON de relatório
async function saveDataToCache(key, data) {
  return operateOnDB(APP_CONFIG.STORE_REPORT, 'readwrite', (store) =>
    store.put({ key, data, timestamp: Date.now() })
  );
}

// Carrega JSON de relatório
async function loadDataFromCache(key) {
  return operateOnDB(APP_CONFIG.STORE_REPORT, 'readonly', (store) => store.get(key));
}

// -----------------------------------------------------------------------------
// III. CONEXÃO & RENDERIZAÇÃO
// -----------------------------------------------------------------------------
function getDataSourceUrl(type) {
  if (!APP_CONFIG.GAS_ENDPOINT_BASE) throw new Error('GAS_ENDPOINT_BASE não configurada.');
  return `${APP_CONFIG.GAS_ENDPOINT_BASE}?type=${encodeURIComponent(type)}`;
}

function isArray2D(a) {
  return Array.isArray(a) && a.length > 0 && Array.isArray(a[0]);
}

function getDataTable(jsonArray) {
  if (typeof google === 'undefined' || !google.visualization || !google.visualization.arrayToDataTable) {
    throw new Error('Google Charts não carregado.');
  }
  if (!isArray2D(jsonArray)) {
    throw new Error('Formato inválido: esperado Array<Array<any>> com cabeçalhos na linha 0.');
  }
  return google.visualization.arrayToDataTable(jsonArray);
}

/**
 * Motor principal: cache → (render) → fetch → (cache+render)
 * drawFn(dataTable, elId, fromCache:boolean)
 */
async function fetchAndRender(type, drawFn, elId) {
  const key = `report_data_${type}`;
  let cachedObject;

  try {
    cachedObject = await loadDataFromCache(key);
    if (cachedObject && cachedObject.data) {
      // Renderiza imediatamente do cache (offline-first)
      try {
        drawFn(getDataTable(cachedObject.data), elId, true);
        log(`Renderizou ${type} a partir do cache.`);
      } catch (e) {
        warn('Falha ao renderizar cache:', e);
      }
    }
  } catch (e) {
    warn('Falha ao tentar ler cache:', e);
  }

  // Busca online para atualizar
  try {
    const response = await fetch(getDataSourceUrl(type), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dataArray = await response.json();

    if (!isArray2D(dataArray)) {
      throw new Error('Fonte retornou formato inválido (esperado Array2D).');
    }

    await saveDataToCache(key, dataArray);
    drawFn(getDataTable(dataArray), elId, false);
    log(`Renderizou ${type} (fresh) e atualizou cache.`);
  } catch (e) {
    if (!cachedObject || !cachedObject.data) {
      err(`Sem dados de cache e falha no fetch para ${type}:`, e);
    } else {
      warn(`Falha no fetch para ${type}, mantendo render do cache.`, e);
    }
  }
}

// -----------------------------------------------------------------------------
// IV. SINCRONIZAÇÃO MULTI-DISPOSITIVO (OAuth GIS + Google Drive) — *stubs úteis*
// -----------------------------------------------------------------------------
function getAuthToken() {
  return CURRENT_USER_ACCESS_TOKEN;
}

/**
 * Inicia fluxo OAuth (Google Identity Services)
 * Escopo Drive.file — acesso somente a arquivos criados/abertos pelo app
 */
async function initGoogleAuth() {
  return new Promise((resolve, reject) => {
    if (!window.google || !google.accounts || !google.accounts.oauth2) {
      reject(new Error('Google Identity Services não disponível.'));
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          CURRENT_USER_ACCESS_TOKEN = tokenResponse.access_token;
          log('OAuth OK.');
          resolve(tokenResponse.access_token);
        } else {
          reject(new Error('Falha no OAuth (sem access_token).'));
        }
      }
    });
    client.requestAccessToken();
  });
}

/** Garante que exista/esteja salvo o ID de arquivo de prefs no IndexedDB (Drive bootstrap) */
async function ensurePrefsFileId() {
  const obj = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly',
    s => s.get(APP_CONFIG.PREFS_FILE_ID_KEY)
  );
  if (obj && obj.value) return obj.value;

  // TODO: Procurar/criar arquivo no Drive e obter fileId real.
  // Por ora, guardamos um placeholder para completar depois.
  const placeholderId = 'DRIVE_FILE_ID_A_DEFINIR';
  await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite',
    s => s.put({ key: APP_CONFIG.PREFS_FILE_ID_KEY, value: placeholderId })
  );
  return placeholderId;
}

/** Escreve prefs com timestamp (Last-Write-Wins) — stub sem chamada real ao Drive */
async function syncToDriveWithTimestamp(prefs) {
  const token = getAuthToken();
  if (!token) { warn('syncToDriveWithTimestamp: sem token OAuth.'); return; }

  prefs.timestamp = Date.now();
  const fileId = await ensurePrefsFileId();

  // TODO: Implementar upload (Drive Files API: files.update/media ou drive v3 upload)
  log('Simulação de sync Drive', { fileId, timestamp: prefs.timestamp });

  // Também salva localmente a versão final
  await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite',
    s => s.put({ key: 'user_settings', ...prefs })
  );
}

/** Carrega prefs da nuvem e resolve conflito com local — stub usando somente local */
async function loadAndResolveConflict() {
  const token = getAuthToken();
  if (token) await ensurePrefsFileId();

  // TODO: Buscar cloudPrefs no Drive (se existir)
  const cloudPrefs = null;

  const localPrefs = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly',
    s => s.get('user_settings')
  );

  let finalPrefs = { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false, timestamp: 0 };

  if (cloudPrefs && localPrefs) {
    finalPrefs = (cloudPrefs.timestamp > localPrefs.timestamp) ? cloudPrefs : localPrefs;
  } else if (cloudPrefs) {
    finalPrefs = cloudPrefs;
  } else if (localPrefs) {
    finalPrefs = localPrefs;
  }

  await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite',
    s => s.put({ key: 'user_settings', ...finalPrefs })
  );

  return finalPrefs;
}

/** Ponto de entrada para carregar prefs */
async function loadUserPreferences() {
  try {
    const prefs = await loadAndResolveConflict();
    return prefs;
  } catch (e) {
    warn('Falha na sync de prefs, usando default.', e);
    return { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false, timestamp: 0 };
  }
}

// -----------------------------------------------------------------------------
// V. GOVERNANÇA & SEGURANÇA
// -----------------------------------------------------------------------------
async function clearLocalData() {
  // 1) IndexedDB
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(APP_CONFIG.DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });

  // 2) Cache API
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }

  // 3) Storage
  localStorage.clear();
  sessionStorage.clear();

  log('Todos os dados locais foram excluídos.');
  return true;
}

/** Revoga token no Google e limpa dados locais */
async function logoutAllDevices() {
  const token = getAuthToken();
  if (!token) {
    log('Sem token para revogar. Limpando dados locais.');
    CURRENT_USER_ACCESS_TOKEN = null;
    await clearLocalData();
    return true;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${encodeURIComponent(token)}`
    });

    if (!response.ok) throw new Error(`Revogação HTTP ${response.status}`);

    log('Token revogado com sucesso.');
  } catch (e) {
    warn('Falha ao revogar token:', e);
  } finally {
    CURRENT_USER_ACCESS_TOKEN = null;
    await clearLocalData();
  }
  return true;
}

// -----------------------------------------------------------------------------
// VI. I18N & BIOMETRIA
// -----------------------------------------------------------------------------
const t = (key) => {
  try {
    if (typeof i18next !== 'undefined' && i18next.t) {
      return i18next.t(key);
    }
  } catch { /* noop */ }
  return key;
};

function setupBiometricToggle(elId) {
  const el = document.getElementById(elId);
  if (!el) return;

  // Exemplo simples (ajuste conforme seu HTML/CSS/UX)
  const current = localStorage.getItem(APP_CONFIG.BIOMETRIC_PREF_KEY) === 'true';
  el.checked = current;

  el.addEventListener('change', async () => {
    const enabled = !!el.checked;
    localStorage.setItem(APP_CONFIG.BIOMETRIC_PREF_KEY, String(enabled));

    // opcional: persistir nas prefs multi-dispositivo
    const prefs = await loadUserPreferences();
    prefs[APP_CONFIG.BIOMETRIC_PREF_KEY] = enabled;
    await syncToDriveWithTimestamp(prefs);

    log('Biometria alterada para:', enabled);
  });
}

function getBiometricKey() {
  return localStorage.getItem(APP_CONFIG.BIOMETRIC_PREF_KEY) === 'true';
}

// -----------------------------------------------------------------------------
// VII. INICIALIZAÇÃO
// -----------------------------------------------------------------------------
function initializeLibrary() {
  log('Biblioteca do Relatório inicializada.');
  try {
    // Se a app possuir um "gancho" global, chamamos aqui.
    if (typeof window.startAppLogic === 'function') {
      window.startAppLogic();
    }
  } catch (e) {
    warn('Falha ao executar startAppLogic:', e);
  }
}

// -----------------------------------------------------------------------------
// VIII. EXPORT PÚBLICO
// -----------------------------------------------------------------------------
window.relatorioUtils = {
  // Inicialização
  initializeLibrary,

  // i18n
  t,

  // Dados e render
  getDataSourceUrl,
  fetchAndRender,
  getDataTable,

  // IndexedDB
  openIndexedDB,
  saveDataToCache,
  loadDataFromCache,

  // OAuth/Sync
  initGoogleAuth,
  loadUserPreferences,
  getAuthToken,

  // Biometria
  setupBiometricToggle,
  getBiometricKey,

  // Governança
  clearLocalData,
  logoutAllDevices
};
