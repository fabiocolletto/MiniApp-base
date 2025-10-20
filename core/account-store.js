import { logError, logInfo, logWarn } from '../sys/log.js';

const GLOBAL_DB_NAME = 'miniapp_global_v1';
const GLOBAL_DB_VERSION = 1;
const ACCOUNTS_STORE = 'accounts';
const SESSION_STORE = 'session';
const SESSION_KEY = 'active';

const useMemoryStore = typeof indexedDB === 'undefined';

const memoryState = {
  accounts: [],
  session: {},
};

let openPromise;

function ensureObjectStore(db, name, options) {
  if (!db.objectStoreNames.contains(name)) {
    db.createObjectStore(name, options);
  }
}

function resetOpenPromise() {
  openPromise = undefined;
}

async function deleteDatabase() {
  if (useMemoryStore) {
    memoryState.accounts = [];
    memoryState.session = {};
    return;
  }

  resetOpenPromise();

  await new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(GLOBAL_DB_NAME);

    deleteRequest.onsuccess = () => {
      logInfo('account-store.reset', 'Banco global removido com sucesso.');
      resolve();
    };

    deleteRequest.onerror = () => {
      const error = deleteRequest.error || new Error('Falha ao remover o banco global.');
      logError('account-store.reset.error', 'Erro ao remover banco global.', error);
      reject(error);
    };

    deleteRequest.onblocked = () => {
      logWarn('account-store.reset.blocked', 'Remoção do banco global bloqueada por outra aba.');
    };
  });
}

export async function openGlobalDB() {
  if (useMemoryStore) {
    return Promise.reject(new Error('IndexedDB indisponível no ambiente atual.'));
  }

  if (!openPromise) {
    openPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(GLOBAL_DB_NAME, GLOBAL_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        ensureObjectStore(db, ACCOUNTS_STORE, { keyPath: 'id' });
        ensureObjectStore(db, SESSION_STORE, { keyPath: 'id' });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao abrir o banco global.');
        logError('account-store.open.error', 'Falha ao abrir IndexedDB global.', error);
        resetOpenPromise();
        reject(error);
      };

      request.onblocked = () => {
        logWarn('account-store.open.blocked', 'Abertura do banco global bloqueada por outra sessão.');
      };
    });
  }

  return openPromise;
}

function isValidAccount(record) {
  return Boolean(record && typeof record.id === 'string');
}

export async function getAllAccounts() {
  if (useMemoryStore) {
    return [...memoryState.accounts];
  }

  try {
    const db = await openGlobalDB();

    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(ACCOUNTS_STORE, 'readonly');
      const store = transaction.objectStore(ACCOUNTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = Array.isArray(request.result) ? request.result : [];
        const accounts = records.filter(isValidAccount);
        resolve(accounts);
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao carregar cadastros.');
        logError('account-store.accounts.error', 'Falha ao listar cadastros.', error);
        reject(error);
      };
    });
  } catch (error) {
    logError('account-store.accounts.fallback', 'Erro inesperado ao listar cadastros.', error);
    return [];
  }
}

export async function getSession() {
  if (useMemoryStore) {
    return { ...memoryState.session };
  }

  try {
    const db = await openGlobalDB();

    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(SESSION_STORE, 'readonly');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.get(SESSION_KEY);

      request.onsuccess = () => {
        const result = request.result;
        if (result && typeof result === 'object' && typeof result.activeAccountId === 'string') {
          resolve({ activeAccountId: result.activeAccountId });
          return;
        }

        resolve({});
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao carregar sessão ativa.');
        logError('account-store.session.error', 'Falha ao carregar sessão ativa.', error);
        reject(error);
      };
    });
  } catch (error) {
    logError('account-store.session.fallback', 'Erro inesperado ao carregar sessão.', error);
    return {};
  }
}

export async function clearSession() {
  if (useMemoryStore) {
    memoryState.session = {};
    return;
  }

  try {
    const db = await openGlobalDB();

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(SESSION_STORE, 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.delete(SESSION_KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao limpar sessão.');
        logError('account-store.session.clear.error', 'Falha ao limpar sessão ativa.', error);
        reject(error);
      };
    });
  } catch (error) {
    logError('account-store.session.clear.fallback', 'Erro inesperado ao limpar sessão.', error);
  }
}

export async function validateSchemaOrReset() {
  if (useMemoryStore) {
    memoryState.accounts = [];
    memoryState.session = {};
    logWarn('account-store.schema.memory', 'IndexedDB indisponível, utilizando memória volátil.');
    return 'reset';
  }

  try {
    const db = await openGlobalDB();
    const hasAccounts = db.objectStoreNames.contains(ACCOUNTS_STORE);
    const hasSession = db.objectStoreNames.contains(SESSION_STORE);

    if (!hasAccounts || !hasSession || db.version !== GLOBAL_DB_VERSION) {
      db.close();
      await deleteDatabase();
      return 'reset';
    }

    return 'ok';
  } catch (error) {
    logError('account-store.schema.error', 'Falha ao validar schema do banco global.', error);
    await deleteDatabase().catch(() => {
      // Ignora erros adicionais durante a remoção.
    });
    return 'reset';
  }
}

export function __setMemoryState(accounts, session) {
  if (!useMemoryStore) {
    return;
  }

  memoryState.accounts = [...accounts];
  memoryState.session = { ...session };
}
