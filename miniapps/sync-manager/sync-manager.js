/**
 * MiniAppSyncManager
 * Gerenciador de Sincronização Autossuficiente.
 * Contém a lógica de IndexedDB e o Google Adapter em um único arquivo
 * para reusabilidade. Expõe a API pública em window.MiniAppSyncManager.
 */

// #region 1. CONSTANTES E LÓGICA DE PERSISTÊNCIA (IndexedDB - Self-Contained)

const DB_NAME = 'miniapp-db';
const DB_VERSION = 2;
const STORES = {
  userSettings: { keyPath: 'key' },
  pendingSync: { keyPath: 'id', autoIncrement: true },
  favorites: { keyPath: 'miniAppTitle' }
};

let dbPromise;

function openDatabase() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      Object.entries(STORES).forEach(([name, options]) => {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name, options);
        }
      });
    };

    request.onsuccess = () => { resolve(request.result); };
    request.onerror = () => { reject(request.error); };
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      transaction.oncomplete = () => resolve(request?.result ?? true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    } catch (error) {
      reject(error);
    }
  });
}

// Funções de CRUD Essenciais
async function saveRecord(storeName, data, key) {
  return withStore(storeName, 'readwrite', (store) => store.put(data, key));
}
async function addRecord(storeName, data) {
  return withStore(storeName, 'readwrite', (store) => store.add(data));
}
async function getAll(storeName) {
  return withStore(storeName, 'readonly', (store) => store.getAll());
}
async function getByKey(storeName, key) {
  return withStore(storeName, 'readonly', (store) => store.get(key));
}
async function deleteRecord(storeName, key) {
  return withStore(storeName, 'readwrite', (store) => store.delete(key));
}

// Funções da Fila de Sincronização
async function addToPendingSync(payload) {
  const record = {
    payload,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending'
  };
  return addRecord('pendingSync', record);
}
async function getPendingItems() {
  return getAll('pendingSync');
}
async function markPendingAsSynced(id, extra = {}) {
  const record = await getByKey('pendingSync', id);
  if (!record) return false;
  const updated = {
    ...record,
    id,
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    ...extra
  };
  await saveRecord('pendingSync', updated, id);
  return true;
}
async function removePending(id) {
  return deleteRecord('pendingSync', id);
}

// Funções de Configuração de Usuário
async function saveUserSetting(key, value) {
  return saveRecord('userSettings', { key, value, updatedAt: new Date().toISOString() }, key);
}
async function getUserSetting(key) {
  const record = await getByKey('userSettings', key);
  return record || null;
}

// #endregion

// #region 2. CORE STATUS E UTILIDADES
const globalScope = typeof window !== 'undefined' ? window : undefined;
const statusListeners = new Set();
let currentStatus = {
  online: globalScope ? navigator.onLine : true,
  syncState: 'init',
  message: 'Inicializando o gerenciador de sincronização...',
  authenticated: false,
  userId: null,
  activeProvider: null,
  pending: 0
};

function notifyStatus(partialUpdate = {}) {
  currentStatus = { ...currentStatus, ...partialUpdate };
  statusListeners.forEach((listener) => {
    try {
      listener(currentStatus);
    } catch (error) {
      console.error('Erro ao notificar listener de status', error);
    }
  });
}

// Event Listeners de Conectividade
if (globalScope) {
  globalScope.addEventListener('online', () => {
    notifyStatus({ online: true });
    MiniAppSyncManager.syncPendingChanges(); // Tenta sincronizar ao voltar online
  });
  globalScope.addEventListener('offline', () => notifyStatus({ online: false, syncState: 'offline', message: 'Modo offline' }));
}

// #endregion

// #region 3. ADAPTER GOOGLE
let googleAuthInstance;
let gapiLoaded = false;
let appsScriptWebAppUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
let googleApiConfig = {
  apiKey: 'YOUR_GOOGLE_API_KEY',
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

// Sobrescrita de Configurações Globais
if (globalScope) {
  if (globalScope.MINIAPP_GOOGLE_CONFIG) {
    googleApiConfig = { ...googleApiConfig, ...globalScope.MINIAPP_GOOGLE_CONFIG };
  }
  if (globalScope.MINIAPP_APPS_SCRIPT_URL) {
    appsScriptWebAppUrl = globalScope.MINIAPP_APPS_SCRIPT_URL;
  }
}

function resolveCurrentUserId() {
  if (!googleAuthInstance) return null;
  const currentUser = typeof googleAuthInstance.currentUser?.get === 'function'
    ? googleAuthInstance.currentUser.get()
    : null;
  
  if (!currentUser) return null;
  const profile = typeof currentUser.getBasicProfile === 'function'
    ? currentUser.getBasicProfile() : null;

  return profile?.getId?.() || profile?.getEmail?.() || null;
}

async function initClient() {
  if (!globalScope || !globalScope.gapi) return;
  try {
    await globalScope.gapi.client.init(googleApiConfig);
    googleAuthInstance = globalScope.gapi.auth2.getAuthInstance();

    googleAuthInstance.isSignedIn.listen((isSignedIn) => {
      const userId = isSignedIn ? resolveCurrentUserId() : null;
      notifyStatus({
        message: isSignedIn ? 'Google Conectado' : 'Conecte sua conta Google.',
        authenticated: isSignedIn,
        userId,
        syncState: isSignedIn ? 'online' : 'auth-required',
      });
      if (isSignedIn) {
        MiniAppSyncManager.syncPendingChanges();
      }
    });

    const isSignedIn = googleAuthInstance.isSignedIn.get();
    const userId = isSignedIn ? resolveCurrentUserId() : null;
    notifyStatus({
      message: isSignedIn ? 'Google Conectado' : 'Conecte sua conta Google.',
      authenticated: isSignedIn,
      userId,
      syncState: isSignedIn ? 'online' : 'auth-required',
    });
    if (isSignedIn) {
        MiniAppSyncManager.syncPendingChanges();
    }
  } catch (error) {
    console.error('Erro ao inicializar gapi', error);
    notifyStatus({ message: 'Erro GAPI', syncState: 'error' });
  }
}

// Handler GAPI (para ser chamado pelo onload do script api.js)
if (globalScope) {
  globalScope.handleGapiLoad = () => {
    if (!globalScope.gapi) {
      console.error('Script gapi carregado, mas objeto gapi indisponível.');
      return;
    }
    globalScope.gapi.load('client:auth2', async () => {
      gapiLoaded = true;
      if (currentStatus.activeProvider === 'google') {
          await initClient();
      }
    });
  };
}

const GoogleAdapter = {
  key: 'google',
  requiresAuth: true,
  signIn: () => {
    if (!gapiLoaded || !googleAuthInstance) throw new Error('Google API não pronta.');
    return googleAuthInstance.signIn();
  },
  signOut: () => {
    if (googleAuthInstance) googleAuthInstance.signOut();
    notifyStatus({ message: 'Sessão Google encerrada', authenticated: false, userId: null, syncState: 'auth-required' });
  },
  
  async uploadPendingChanges(record) {
    const target = (await getUserSetting('SYNC_TARGET'))?.value || 'appsScript';

    if (target === 'gapi') {
        if (!globalScope.gapi || !googleAuthInstance || !googleAuthInstance.isSignedIn.get()) {
            throw new Error('Usuário não autenticado no GAPI.');
        }
        // Lógica de envio multipart para Google Drive
        const fileMetadata = { name: `miniapp-sync-${Date.now()}.json`, mimeType: 'application/json' };
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;
        const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(record.payload))));
        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: application/json\r\n' +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            base64Data +
            closeDelimiter;

        const response = await globalScope.gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` },
            body: multipartRequestBody
        });
        return response.result?.id;
    } else { // target === 'appsScript'
        const response = await fetch(appsScriptWebAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record.payload)
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Apps Script retornou erro: ${message}`);
        }
        const result = await response.json().catch(() => ({}));
        if (result.error) {
            throw new Error(result.error);
        }
        return result.id || true;
    }
  },

  async downloadChanges() {
    // LÓGICA CHAVE PARA O MULTI-DISPOSITIVO - Mockada para o teste
    console.warn('Google Adapter: Lógica de Download/Merge ainda não implementada. Mockando sucesso.');
    return { merged: 0, downloaded: 0 };
  }
};

// #endregion

// #region 4. MAPA DE ADAPTERS E CORE SYNC MANAGER

const Adapters = {
  google: GoogleAdapter,
  // onedrive: OneDriveAdapter // Ponto de Extensão Futuro
};

const MiniAppSyncManager = {
  // Métodos Públicos

  registerStatusListener: (listener) => {
    if (typeof listener === 'function') {
      statusListeners.add(listener);
      listener(currentStatus);
      return () => statusListeners.delete(listener);
    }
    return () => {};
  },

  async setProvider(providerKey) {
    if (!Adapters[providerKey]) {
      console.error(`Provedor inválido: ${providerKey}`);
      return;
    }
    await saveUserSetting('ACTIVE_PROVIDER', providerKey);
    notifyStatus({ activeProvider: providerKey, syncState: 'init' });

    if (providerKey === 'google' && gapiLoaded) {
      await initClient();
    }
    this.syncPendingChanges();
  },

  async signIn() {
    const provider = Adapters[currentStatus.activeProvider];
    if (provider?.signIn) {
      return provider.signIn();
    }
    throw new Error('Provedor ativo não suporta autenticação ou não está configurado.');
  },

  async signOut() {
    const provider = Adapters[currentStatus.activeProvider];
    if (provider?.signOut) {
      return provider.signOut();
    }
    throw new Error('Provedor ativo não suporta logout.');
  },

  queueForSync: addToPendingSync,
  saveUserSetting,
  getUserSetting,
  getAuthStatus: () => ({ ...currentStatus }),

  // O Orchestrator Principal
  async syncPendingChanges() {
    const pendingItems = await getPendingItems();
    const activeProviderKey = (await getUserSetting('ACTIVE_PROVIDER'))?.value;
    const provider = Adapters[activeProviderKey];
    
    // 1. VERIFICAÇÃO DE PRÉ-REQUISITOS
    if (!currentStatus.online) {
      notifyStatus({ syncState: 'offline', message: 'Sem conexão. Mantendo dados locais.', pending: pendingItems.length });
      return { synced: 0, remaining: pendingItems.length };
    }
    if (!provider) {
      notifyStatus({ syncState: 'disabled', message: 'Nenhum provedor de sincronização ativo.', pending: pendingItems.length });
      return { synced: 0, remaining: pendingItems.length };
    }
    if (provider.requiresAuth && !currentStatus.authenticated) {
      notifyStatus({ syncState: 'auth-required', message: `Conecte sua conta ${activeProviderKey}.`, pending: pendingItems.length });
      return { synced: 0, remaining: pendingItems.length };
    }

    const [backupSetting, syncSetting] = await Promise.all([
      getUserSetting('BACKUP_ENABLED'),
      getUserSetting('SYNC_ENABLED')
    ]);
    const isBackupEnabled = backupSetting?.value === true;
    const isSyncEnabled = syncSetting?.value === true;

    // 2. LÓGICA DE DOWNLOAD (Multi-Dispositivo)
    if (isSyncEnabled && provider.downloadChanges) {
        notifyStatus({ syncState: 'syncing', message: `Verificando alterações de ${activeProviderKey}...` });
        try {
            await provider.downloadChanges();
        } catch (error) {
            console.error(`Falha no Download do ${activeProviderKey}`, error);
            notifyStatus({ syncState: 'error', message: `Erro ao baixar: ${error.message}` });
            return { synced: 0, remaining: pendingItems.length };
        }
    }
    
    // 3. LÓGICA DE UPLOAD (Backup)
    if (!isBackupEnabled && !isSyncEnabled) {
      notifyStatus({ syncState: 'disabled', message: 'Sincronização desativada.', pending: pendingItems.length });
      return { synced: 0, remaining: pendingItems.length };
    }

    if (!pendingItems.length) {
      notifyStatus({ syncState: 'synced', message: 'Tudo sincronizado.', pending: 0 });
      return { synced: 0, remaining: 0 };
    }

    notifyStatus({ syncState: 'syncing', message: `Sincronizando ${pendingItems.length} itens...`, pending: pendingItems.length });

    let successCount = 0;
    for (const [index, record] of pendingItems.entries()) {
      try {
        await provider.uploadPendingChanges(record);
        await markPendingAsSynced(record.id);
        await removePending(record.id);
        successCount += 1;
        notifyStatus({
          syncState: 'syncing',
          message: `Item ${index + 1}/${pendingItems.length} sincronizado.`,
          pending: pendingItems.length - (index + 1)
        });
      } catch (error) {
        console.error('Falha ao sincronizar registro', error);
        notifyStatus({ syncState: 'error', message: `Erro ao sincronizar: ${error.message}` });
        return { synced: successCount, remaining: pendingItems.length - successCount };
      }
    }

    notifyStatus({ syncState: 'synced', message: 'Sincronização concluída.', pending: 0 });
    return { synced: successCount, remaining: 0 };
  }
};

// #endregion

// 5. EXPOSIÇÃO GLOBAL
if (globalScope) {
  globalScope.MiniAppSyncManager = MiniAppSyncManager;
  // Define o provedor inicial como Google, se não houver um ativo
  getUserSetting('ACTIVE_PROVIDER').then(setting => {
    if (!setting?.value) {
      MiniAppSyncManager.setProvider('google');
    } else {
       notifyStatus({ activeProvider: setting.value });
       if (setting.value === 'google' && gapiLoaded) {
           initClient();
       }
    }
  });
}
