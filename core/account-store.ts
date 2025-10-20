import { logError, logInfo, logWarn } from '../sys/log.js';

export type Account = {
  id: string;
  label?: string;
  kind?: string;
  createdAt?: string;
};

export type SessionState = {
  activeAccountId?: string;
};

type AccountInput = Partial<Account> & { id?: unknown };

function normalizeAccountInput(account: AccountInput | null | undefined): Account | null {
  const rawId = account?.id;
  const id =
    typeof rawId === 'string'
      ? rawId.trim()
      : typeof rawId === 'number' && Number.isFinite(rawId)
        ? String(rawId)
        : rawId != null
          ? String(rawId).trim()
          : '';

  if (!id) {
    return null;
  }

  const normalized: Account = { id };

  if (typeof account?.label === 'string') {
    const trimmedLabel = account.label.trim();
    if (trimmedLabel) {
      normalized.label = trimmedLabel.slice(0, 120);
    }
  }

  if (typeof account?.kind === 'string') {
    const trimmedKind = account.kind.trim();
    if (trimmedKind) {
      normalized.kind = trimmedKind.slice(0, 80);
    }
  }

  if (typeof account?.createdAt === 'string') {
    const trimmedCreatedAt = account.createdAt.trim();
    if (trimmedCreatedAt) {
      normalized.createdAt = trimmedCreatedAt;
    }
  }

  return normalized;
}

const GLOBAL_DB_NAME = 'miniapp_global_v1';
const GLOBAL_DB_VERSION = 1;
const ACCOUNTS_STORE = 'accounts';
const SESSION_STORE = 'session';
const SESSION_KEY = 'active';

const useMemoryStore = typeof indexedDB === 'undefined';

const memoryState: { accounts: Account[]; session: SessionState } = {
  accounts: [],
  session: {},
};

let openPromise: Promise<IDBDatabase> | undefined;

function ensureObjectStore(db: IDBDatabase, name: string, options?: IDBObjectStoreParameters) {
  if (!db.objectStoreNames.contains(name)) {
    db.createObjectStore(name, options);
  }
}

function resetOpenPromise(): void {
  openPromise = undefined;
}

async function deleteDatabase(): Promise<void> {
  if (useMemoryStore) {
    memoryState.accounts = [];
    memoryState.session = {};
    return;
  }

  resetOpenPromise();

  await new Promise<void>((resolve, reject) => {
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

export async function openGlobalDB(): Promise<IDBDatabase> {
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

function isValidAccount(record: unknown): record is Account {
  return Boolean(record && typeof (record as Account).id === 'string');
}

export async function getAllAccounts(): Promise<Account[]> {
  if (useMemoryStore) {
    return [...memoryState.accounts];
  }

  try {
    const db = await openGlobalDB();

    return await new Promise<Account[]>((resolve, reject) => {
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

export async function getSession(): Promise<SessionState> {
  if (useMemoryStore) {
    return { ...memoryState.session };
  }

  try {
    const db = await openGlobalDB();

    return await new Promise<SessionState>((resolve, reject) => {
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

export async function replaceAccounts(accounts: AccountInput[]): Promise<void> {
  const normalized = accounts
    .map((account) => normalizeAccountInput(account))
    .filter((account): account is Account => account !== null);

  if (useMemoryStore) {
    memoryState.accounts = normalized.map((account) => ({ ...account }));
    return;
  }

  try {
    const db = await openGlobalDB();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(ACCOUNTS_STORE, 'readwrite');
      const store = transaction.objectStore(ACCOUNTS_STORE);
      let settled = false;

      const finalize = (error?: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      transaction.oncomplete = () => finalize();
      transaction.onabort = () => finalize(transaction.error || new Error('Transação abortada ao sincronizar cadastros.'));
      transaction.onerror = () => finalize(transaction.error || new Error('Erro ao sincronizar cadastros.'));

      const clearRequest = store.clear();
      clearRequest.onerror = () => {
        finalize(clearRequest.error || new Error('Erro ao limpar cadastros anteriores.'));
      };

      clearRequest.onsuccess = () => {
        normalized.forEach((account) => {
          const putRequest = store.put(account);
          putRequest.onerror = () => {
            finalize(putRequest.error || new Error('Erro ao registrar cadastro global.'));
          };
        });
      };
    });
  } catch (error) {
    logError('account-store.accounts.sync', 'Falha ao sincronizar cadastros globais.', error);
    throw error;
  }
}

export async function setSessionState(session: SessionState | null | undefined): Promise<void> {
  const activeAccountId =
    typeof session?.activeAccountId === 'string' && session.activeAccountId.trim()
      ? session.activeAccountId.trim()
      : '';

  if (useMemoryStore) {
    memoryState.session = activeAccountId ? { activeAccountId } : {};
    return;
  }

  try {
    const db = await openGlobalDB();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(SESSION_STORE, 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      let settled = false;

      const finalize = (error?: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      transaction.oncomplete = () => finalize();
      transaction.onabort = () => finalize(transaction.error || new Error('Transação abortada ao sincronizar sessão.'));
      transaction.onerror = () => finalize(transaction.error || new Error('Erro ao sincronizar sessão.'));

      if (activeAccountId) {
        const putRequest = store.put({ id: SESSION_KEY, activeAccountId });
        putRequest.onerror = () => {
          finalize(putRequest.error || new Error('Erro ao registrar sessão ativa.'));
        };
        return;
      }

      const deleteRequest = store.delete(SESSION_KEY);
      deleteRequest.onerror = () => {
        finalize(deleteRequest.error || new Error('Erro ao limpar sessão ativa.'));
      };
    });
  } catch (error) {
    logError('account-store.session.sync', 'Falha ao sincronizar sessão global.', error);
    throw error;
  }
}

export async function clearSession(): Promise<void> {
  if (useMemoryStore) {
    memoryState.session = {};
    return;
  }

  try {
    const db = await openGlobalDB();

    await new Promise<void>((resolve, reject) => {
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

export async function validateSchemaOrReset(): Promise<'ok' | 'reset'> {
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

export function __setMemoryState(accounts: Account[], session: SessionState): void {
  if (!useMemoryStore) {
    return;
  }

  memoryState.accounts = [...accounts];
  memoryState.session = { ...session };
}
