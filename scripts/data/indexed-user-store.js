const DB_NAME = 'miniapp-user-store';
const DB_VERSION = 1;
const STORE_NAME = 'users';

const changeListeners = new Set();
let databasePromise;

function isIndexedDbSupported() {
  return typeof indexedDB !== 'undefined';
}

function openDatabase() {
  if (!isIndexedDbSupported()) {
    return Promise.reject(new Error('IndexedDB não é suportado neste navegador.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        databasePromise = undefined;
        reject(request.error || new Error('Erro ao abrir o banco de dados IndexedDB.'));
      };

      request.onblocked = () => {
        console.warn('A abertura do banco IndexedDB foi bloqueada. Feche outras abas da aplicação.');
      };
    });
  }

  return databasePromise;
}

function deserializeUser(record) {
  if (!record || typeof record !== 'object') {
    return {
      id: 0,
      phone: '',
      password: '',
      device: '',
      createdAt: new Date(),
    };
  }

  const createdAtValue = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt);

  return {
    id: Number(record.id),
    phone: typeof record.phone === 'string' ? record.phone : '',
    password: typeof record.password === 'string' ? record.password : '',
    device: typeof record.device === 'string' ? record.device : '',
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
  };
}

async function notifyListeners() {
  try {
    const users = await loadUsers();
    changeListeners.forEach((listener) => {
      try {
        listener(users.slice());
      } catch (error) {
        console.error('Erro ao notificar assinante do IndexedDB.', error);
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar assinantes após alteração no IndexedDB.', error);
  }
}

export async function loadUsers() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const result = Array.isArray(request.result) ? request.result : [];
      resolve(result.map(deserializeUser));
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao carregar os usuários do IndexedDB.'));
    };

    transaction.onabort = () => {
      reject(transaction.error || new Error('Leitura abortada ao carregar usuários do IndexedDB.'));
    };
  });
}

export async function saveUser({ phone, password, device }) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      phone,
      password,
      device,
      createdAt: new Date().toISOString(),
    };

    let savedUser;

    const request = store.add(record);

    request.onsuccess = () => {
      const id = Number(request.result);
      savedUser = deserializeUser({ ...record, id });
      resolve(savedUser);
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao salvar o usuário no IndexedDB.'));
    };

    transaction.oncomplete = () => {
      if (savedUser) {
        notifyListeners();
      }
    };

    transaction.onabort = () => {
      reject(transaction.error || new Error('Transação abortada ao salvar o usuário no IndexedDB.'));
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error('Erro na transação ao salvar o usuário no IndexedDB.'));
    };
  });
}

export function watchUsers(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  if (!isIndexedDbSupported()) {
    throw new Error('IndexedDB não é suportado neste navegador.');
  }

  changeListeners.add(listener);

  loadUsers()
    .then((users) => {
      try {
        listener(users.slice());
      } catch (error) {
        console.error('Erro ao inicializar assinante do IndexedDB.', error);
      }
    })
    .catch((error) => {
      console.error('Erro ao carregar usuários ao registrar assinante do IndexedDB.', error);
    });

  return () => {
    changeListeners.delete(listener);
  };
}
