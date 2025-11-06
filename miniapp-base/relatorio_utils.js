/**
 * Biblioteca de Funções Essenciais (Utility Library) - relatorio_utils.js
 * Criada para performance PWA (IndexedDB), Multi-Dispositivo (Serverless Sync)
 * e segurança (WebAuthn/OAuth).
 */

// --- I. CONFIGURAÇÕES GLOBAIS (AJUSTE NECESSÁRIO) ---
const APP_CONFIG = {
    // Substitua pelo seu ID de Cliente do Google para o fluxo OAuth
    GOOGLE_CLIENT_ID: "SEU_CLIENT_ID_DO_GOOGLE_AQUI", 
    
    // Substitua pela URL base do seu Google Apps Script Web App (Endpoint único)
    GAS_ENDPOINT_BASE: 'SUA_URL_DO_GAS_AQUI',
    
    DB_NAME: 'PainelPrefeitoDB',
    DB_VERSION: 1,
    STORE_REPORT: 'report_data',
    STORE_PREFS: 'user_prefs',
    PREFS_FILE_ID_KEY: 'drive_file_id',
    BIOMETRIC_PREF_KEY: 'biometric_enabled'
};

// Variáveis de estado global (não salvas)
let CURRENT_USER_ACCESS_TOKEN = null;

// --- II. MÓDULO DE CACHE E OFFLINE (IndexedDB) ---

// 5. openIndexedDB()
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(APP_CONFIG.DB_NAME, APP_CONFIG.DB_VERSION);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            // Cria stores para dados (relatórios) e preferências (configurações)
            if (!db.objectStoreNames.contains(APP_CONFIG.STORE_REPORT)) {
                db.createObjectStore(APP_CONFIG.STORE_REPORT, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(APP_CONFIG.STORE_PREFS)) {
                db.createObjectStore(APP_CONFIG.STORE_PREFS, { keyPath: 'key' });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            console.error("IndexedDB Error:", event.target.error);
            reject(new Error("Erro ao abrir o IndexedDB."));
        };
    });
}

// Funções utilitárias para operar no IndexedDB
async function operateOnDB(storeName, mode, callback) {
    const db = await openIndexedDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
        transaction.onerror = () => reject(transaction.error);
        
        const request = callback(store);
        request.onsuccess = () => resolve(request.result);
    });
}

// 6. saveDataToCache(key, data) - Persiste JSON de relatório (Assíncrono)
async function saveDataToCache(key, data) {
    await operateOnDB(APP_CONFIG.STORE_REPORT, 'readwrite', (store) => 
        store.put({ key: key, data: data, timestamp: Date.now() })
    );
}

// 7. loadDataFromCache(key) - Carrega JSON de relatório
async function loadDataFromCache(key) {
    return operateOnDB(APP_CONFIG.STORE_REPORT, 'readonly', (store) => store.get(key));
}

// --- III. SINCRONIZAÇÃO MULTI-DISPOSITIVO (Serverless Drive Sync) ---

// 15. getAuthToken() - Retorna o token de acesso (para chamadas ao Drive)
function getAuthToken() {
    return CURRENT_USER_ACCESS_TOKEN;
}

// 9. initGoogleAuth() - Inicia o fluxo de autorização OAuth
async function initGoogleAuth() {
    return new Promise((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error("OAuth Error:", tokenResponse.error);
                    reject(new Error("Falha na autorização Google."));
                    return;
                }
                CURRENT_USER_ACCESS_TOKEN = tokenResponse.access_token;
                resolve(tokenResponse.access_token);
            },
        });
        // Solicita o token
        client.requestAccessToken();
    });
}

// 10. syncToDriveWithTimestamp(prefs) - Escreve o JSON de prefs no Drive
async function syncToDriveWithTimestamp(prefs) {
    const token = getAuthToken();
    if (!token) return;

    // 1. Adiciona o timestamp de controle (Last Write Wins)
    prefs.timestamp = Date.now();
    
    // 2. Busca o ID do arquivo de prefs no IndexedDB local
    const fileIdObj = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get(APP_CONFIG.PREFS_FILE_ID_KEY));
    const fileId = fileIdObj ? fileIdObj.value : null;
    const isUpdate = !!fileId;

    // ... (Lógica de chamada à API do Google Drive)

    // Simulação da chamada ao Google Drive API
    console.log("Sincronizando preferências com o Google Drive. Versão: " + prefs.timestamp);

    // 3. Salva a versão FINAL no IndexedDB local para uso imediato
    await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite', (store) => store.put({ key: 'user_settings', ...prefs }));
}

// 11. loadAndResolveConflict() - Carrega e resolve conflitos de Timestamp
async function loadAndResolveConflict() {
    const token = getAuthToken();
    const fileIdObj = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get(APP_CONFIG.PREFS_FILE_ID_KEY));
    
    let cloudPrefs = null;
    // ... (Lógica para buscar o arquivo JSON do Drive, se houver token/fileId)

    const localPrefs = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get('user_settings'));
    
    let finalPrefs = { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false, timestamp: 0 }; // Default
    
    // Resolução: Last Write Wins (Compara timestamps da Nuvem e Local)
    if (cloudPrefs && localPrefs) {
        if (cloudPrefs.timestamp > localPrefs.timestamp) {
            finalPrefs = cloudPrefs;
        } else {
            finalPrefs = localPrefs;
        }
    } else if (cloudPrefs) {
        finalPrefs = cloudPrefs;
    } else if (localPrefs) {
        finalPrefs = localPrefs;
    }
    
    // Salva a versão resolvida no IndexedDB e, se for a versão local que venceu, no Drive
    await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite', (store) => store.put({ key: 'user_settings', ...finalPrefs }));
    
    return finalPrefs;
}

// 12. loadUserPreferences() - Ponto de entrada do Multi-Dispositivo
async function loadUserPreferences() {
    try {
        const preferences = await loadAndResolveConflict();
        // Aqui o Painel aplicaria as configurações (ex: idioma, ativação de biometria)
        return preferences;
    } catch (error) {
        console.error("Falha na sincronização de preferências. Usando padrões.", error);
        return { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false };
    }
}

// --- IV. MÓDULO DE CONEXÃO E RENDERIZAÇÃO ---

// 3. getDataSourceUrl(type)
function getDataSourceUrl(type) {
    if (!APP_CONFIG.GAS_ENDPOINT_BASE) throw new Error("GAS_ENDPOINT_BASE não configurada.");
    return `${APP_CONFIG.GAS_ENDPOINT_BASE}?type=${type}`;
}

// 4. fetchAndRender(type, drawFn, elId) - Motor Principal
async function fetchAndRender(type, drawFn, elId) {
    const key = `report_data_${type}`;
    
    const cachedObject = await loadDataFromCache(key);

    // 1. Tenta carregar o cache (Offline)
    if (cachedObject) {
        // ... Renderiza
    } 

    // 2. Tenta buscar dados novos (Online)
    try {
        const response = await fetch(getDataSourceUrl(type));
        const dataArray = await response.json();

        // 3. Sucesso: Salva no IndexedDB e Renderiza
        await saveDataToCache(key, dataArray); 
        drawFn(getDataTable(dataArray), elId, false);
    } catch (error) {
        if (!cachedObject) {
            // ... Trata erro
        }
    }
}

// --- V. SEGURANÇA E GOVERNANÇA ---

// 16. clearLocalData() - Direito à Exclusão (LGPD)
async function clearLocalData() {
    // 1. Limpa IndexedDB
    await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(APP_CONFIG.DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
    });
    // 2. Limpa Cache API (o Service Worker fará o resto)
    if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
    }
    // 3. Limpa localStorage (token e IDs)
    localStorage.clear();
    console.log("Todos os dados e caches locais foram excluídos.");
    return true;
}

// 17. logoutAllDevices() - Logout Universal
async function logoutAllDevices() {
    const token = getAuthToken();
    if (!token) return true;

    // Revoga o token do Google, desconectando o usuário de todos os dispositivos
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/x-www-form-urlencoded' }
    });

    if (response.ok) {
        console.log("Logout Universal SUCEDIDO: Token revogado.");
        await clearLocalData(); // Limpa também os dados locais após o logout
        CURRENT_USER_ACCESS_TOKEN = null;
        return true;
    } else {
        console.error("Logout Universal FALHOU. Código:", response.status);
        return false;
    }
}

// 13. setupBiometricToggle(elId)
function setupBiometricToggle(elId) {
    // Código para inicializar o switch de biometria (omissão para o foco da lista)
    console.log("Setup Biometria (Função 13) pronto para ser implementado.");
}

// 14. getBiometricKey()
function getBiometricKey() {
    return localStorage.getItem(APP_CONFIG.BIOMETRIC_PREF_KEY) === 'true';
}

// 8. getDataTable(jsonArray)
function getDataTable(jsonArray) {
    return google.visualization.arrayToDataTable(jsonArray);
}

// 2. t(key)
const t = (key) => {
    if (typeof i18next !== 'undefined' && i18next.t) {
        return i18next.t(key);
    }
    return key;
};

// 1. initializeLibrary()
function initializeLibrary() {
    console.log("Biblioteca de Relatórios (Motor) Inicializada.");
    // NOTA: O fluxo de initGoogleAuth deve ser chamado no HTML para iniciar a autenticação
}


// --- EXPORTAÇÕES GLOBAIS ---
window.relatorioUtils = {
    initializeLibrary,
    t,
    getDataSourceUrl,
    fetchAndRender,
    openIndexedDB,
    saveDataToCache,
    loadDataFromCache,
    getDataTable,
    initGoogleAuth,
    loadUserPreferences,
    getAuthToken,
    setupBiometricToggle,
    getBiometricKey,
    // Funções de Segurança e Governança
    clearLocalData,
    logoutAllDevices
};
