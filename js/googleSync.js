import {
  addToPendingSync,
  getPendingItems,
  markPendingAsSynced,
  removePending,
  saveRecord,
  getByKey
} from './indexeddb-store.js';

const DEFAULT_GOOGLE_API_CONFIG = {
  apiKey: 'YOUR_GOOGLE_API_KEY',
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

const AVAILABLE_SYNC_TARGETS = Object.freeze(['gapi', 'appsScript']);

let googleApiConfig = { ...DEFAULT_GOOGLE_API_CONFIG };
let appsScriptWebAppUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
let syncTarget = 'appsScript';

const globalScope = typeof window !== 'undefined' ? window : undefined;

if (globalScope) {
  if (globalScope.MINIAPP_GOOGLE_CONFIG) {
    googleApiConfig = { ...googleApiConfig, ...globalScope.MINIAPP_GOOGLE_CONFIG };
  }
  if (globalScope.MINIAPP_APPS_SCRIPT_URL) {
    appsScriptWebAppUrl = globalScope.MINIAPP_APPS_SCRIPT_URL;
  }
  if (globalScope.MINIAPP_SYNC_TARGET && AVAILABLE_SYNC_TARGETS.includes(globalScope.MINIAPP_SYNC_TARGET)) {
    syncTarget = globalScope.MINIAPP_SYNC_TARGET;
  }
}

const isBrowser = typeof navigator !== 'undefined';
const initialOnline = isBrowser ? navigator.onLine : true;

let googleAuthInstance;
let gapiLoaded = false;
const statusListeners = new Set();
let currentStatus = {
  online: initialOnline,
  syncState: initialOnline ? (syncTarget === 'gapi' ? 'auth-required' : 'online') : 'offline',
  message: initialOnline ? 'Aguardando sincronização' : 'Modo offline',
  authenticated: false,
  needsAuth: syncTarget === 'gapi',
  userId: null,
  syncTarget,
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

  if (globalScope) {
    globalScope.currentUserId = currentStatus.userId || null;
    globalScope.miniappAuthStatus = currentStatus;
  }
}

export function registerStatusListener(listener) {
  if (typeof listener === 'function') {
    statusListeners.add(listener);
    listener(currentStatus);
    return () => statusListeners.delete(listener);
  }
  return () => {};
}

function updateOnlineStatus() {
  if (!isBrowser) {
    return;
  }
  const online = navigator.onLine;
  const needsAuth = currentStatus.needsAuth;
  const authenticated = currentStatus.authenticated;
  const syncState = online
    ? needsAuth && !authenticated
      ? 'auth-required'
      : 'online'
    : 'offline';
  const message = online
    ? needsAuth && !authenticated
      ? 'Conecte sua conta Google para sincronizar.'
      : 'Conectado'
    : 'Modo offline';

  notifyStatus({ online, syncState, message });

  if (online && (!needsAuth || authenticated)) {
    syncPendingChanges();
  }
}

if (globalScope) {
  globalScope.addEventListener('online', updateOnlineStatus);
  globalScope.addEventListener('offline', updateOnlineStatus);
}

function ensureGapiLoaded() {
  if (syncTarget !== 'gapi') {
    return true;
  }
  if (!globalScope || !globalScope.gapi) {
    console.warn('Biblioteca gapi ainda não carregada. Verifique se o script api.js foi incluído.');
    return false;
  }
  if (!gapiLoaded) {
    console.warn('gapi.load ainda não inicializou. Aguarde o evento de carregamento.');
    return false;
  }
  return true;
}

function resolveCurrentUserId() {
  if (!googleAuthInstance || syncTarget !== 'gapi') {
    return null;
  }

  const currentUser = typeof googleAuthInstance.currentUser?.get === 'function'
    ? googleAuthInstance.currentUser.get()
    : null;

  if (!currentUser) {
    return null;
  }

  const profile = typeof currentUser.getBasicProfile === 'function'
    ? currentUser.getBasicProfile()
    : null;

  if (profile) {
    return (
      (typeof profile.getId === 'function' && profile.getId()) ||
      (typeof profile.getEmail === 'function' && profile.getEmail()) ||
      null
    );
  }

  if (typeof currentUser.getId === 'function') {
    return currentUser.getId();
  }

  return null;
}

async function initClient() {
  if (syncTarget !== 'gapi' || !globalScope || !globalScope.gapi) {
    return;
  }
  try {
    await globalScope.gapi.client.init({
      apiKey: googleApiConfig.apiKey,
      clientId: googleApiConfig.clientId,
      scope: googleApiConfig.scope,
      discoveryDocs: googleApiConfig.discoveryDocs
    });
    googleAuthInstance = globalScope.gapi.auth2.getAuthInstance();

    googleAuthInstance.isSignedIn.listen((isSignedIn) => {
      const userId = isSignedIn ? resolveCurrentUserId() : null;
      notifyStatus({
        message: isSignedIn ? 'Conectado à Google' : 'Conecte sua conta Google para sincronizar.',
        syncState: isSignedIn ? 'online' : 'auth-required',
        authenticated: isSignedIn,
        userId
      });
      if (isSignedIn) {
        syncPendingChanges();
      }
    });

    const isSignedIn = googleAuthInstance.isSignedIn.get();
    const userId = isSignedIn ? resolveCurrentUserId() : null;
    notifyStatus({
      message: isSignedIn ? 'Conectado à Google' : 'Conecte sua conta Google para sincronizar.',
      syncState: isSignedIn ? 'online' : 'auth-required',
      authenticated: isSignedIn,
      userId
    });
    if (isSignedIn) {
      syncPendingChanges();
    }
  } catch (error) {
    console.error('Erro ao inicializar gapi', error);
    notifyStatus({ message: 'Erro ao inicializar Google API', syncState: 'error' });
  }
}

async function sendRecordViaGapi(record) {
  if (syncTarget !== 'gapi') {
    throw new Error('Canal de sincronização atual não utiliza gapi.');
  }
  if (!ensureGapiLoaded()) {
    throw new Error('gapi não carregado');
  }
  if (!googleAuthInstance || !googleAuthInstance.isSignedIn.get()) {
    throw new Error('Usuário não autenticado');
  }

  const fileMetadata = {
    name: `miniapp-sync-${Date.now()}.json`,
    mimeType: 'application/json'
  };

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
    headers: {
      'Content-Type': `multipart/related; boundary="${boundary}"`
    },
    body: multipartRequestBody
  });

  return response.result?.id;
}

async function sendRecordViaAppsScript(record) {
  const response = await fetch(appsScriptWebAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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

async function sendRecord(record) {
  if (syncTarget === 'gapi') {
    return sendRecordViaGapi(record);
  }
  return sendRecordViaAppsScript(record);
}

export async function queueForSync(payload) {
  return addToPendingSync(payload);
}

export async function syncPendingChanges() {
  const pendingItems = await getPendingItems();

  if (!isBrowser || !navigator.onLine) {
    notifyStatus({
      syncState: 'offline',
      message: 'Sem conexão. Mantendo dados locais.',
      pending: pendingItems.length
    });
    return { synced: 0, remaining: pendingItems.length };
  }

  if (currentStatus.needsAuth && !currentStatus.authenticated) {
    notifyStatus({
      syncState: 'auth-required',
      message: 'Conecte sua conta Google para sincronizar.',
      pending: pendingItems.length
    });
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
      await sendRecord(record);
      await markPendingAsSynced(record.id, { remoteId: record.payload?.id ?? undefined });
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

export async function signInWithGoogle() {
  if (syncTarget !== 'gapi') {
    throw new Error('Canal de sincronização atual não exige autenticação Google.');
  }
  if (!ensureGapiLoaded()) {
    throw new Error('Google API não disponível');
  }
  if (!googleAuthInstance) {
    throw new Error('gapi não inicializado');
  }
  return googleAuthInstance.signIn();
}

export async function signOutFromGoogle() {
  if (syncTarget !== 'gapi') {
    return;
  }
  if (!ensureGapiLoaded()) {
    return;
  }
  if (!googleAuthInstance) {
    return;
  }
  await googleAuthInstance.signOut();
  notifyStatus({ message: 'Sessão Google encerrada', syncState: 'auth-required', authenticated: false, userId: null });
}

export function getCurrentUserId() {
  return currentStatus.userId || null;
}

export function isUserAuthenticated() {
  return Boolean(currentStatus.authenticated && currentStatus.userId);
}

export function getAuthStatus() {
  return { ...currentStatus };
}

export async function saveUserSetting(key, value) {
  return saveRecord('userSettings', { key, value, updatedAt: new Date().toISOString() });
}

export async function getUserSetting(key) {
  return getByKey('userSettings', key);
}

export function setSyncTarget(target) {
  if (!AVAILABLE_SYNC_TARGETS.includes(target)) {
    console.warn(`Canal de sincronização inválido: ${target}`);
    return currentStatus.syncTarget;
  }

  syncTarget = target;
  const needsAuth = syncTarget === 'gapi';
  notifyStatus({
    syncTarget,
    needsAuth,
    syncState: needsAuth && !currentStatus.authenticated ? 'auth-required' : currentStatus.syncState,
    message: needsAuth
      ? 'Conecte sua conta Google para sincronizar.'
      : 'Sincronização configurada via Apps Script.'
  });

  if (needsAuth && gapiLoaded) {
    initClient();
  }

  if (!needsAuth) {
    syncPendingChanges();
  }

  return syncTarget;
}

export function configureGoogleSync(options = {}) {
  if (options.googleConfig) {
    googleApiConfig = { ...googleApiConfig, ...options.googleConfig };
  }
  if (options.appsScriptUrl) {
    appsScriptWebAppUrl = options.appsScriptUrl;
  }
  if (options.syncTarget) {
    setSyncTarget(options.syncTarget);
  }
}

if (globalScope) {
  globalScope.handleGapiLoad = () => {
    if (!globalScope.gapi) {
      console.error('Script gapi carregado, mas objeto gapi indisponível.');
      return;
    }
    globalScope.gapi.load('client:auth2', async () => {
      gapiLoaded = true;
      if (syncTarget === 'gapi') {
        notifyStatus({ message: 'Google API carregada', syncState: 'online' });
        await initClient();
      } else {
        notifyStatus({ message: 'Google API carregada', syncState: currentStatus.syncState });
      }
    });
  };
}

notifyStatus({
  message: initialOnline ? 'Aguardando sincronização' : 'Modo offline',
  syncState: initialOnline ? (currentStatus.needsAuth ? 'auth-required' : 'online') : 'offline'
});

export const miniappSync = {
  registerStatusListener,
  queueForSync,
  syncPendingChanges,
  signInWithGoogle,
  signOutFromGoogle,
  saveUserSetting,
  getUserSetting,
  setSyncTarget,
  configureGoogleSync,
  getCurrentUserId,
  isUserAuthenticated,
  getAuthStatus
};

if (globalScope) {
  globalScope.miniappSync = miniappSync;
}
