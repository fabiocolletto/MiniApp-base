const DB_NAME = 'miniapp-user-store';
const DB_VERSION = 1;
const STORE_NAME = 'users';

const PROFILE_FIELDS = ['email', 'secondaryPhone', 'document', 'address', 'notes'];

function createEmptyProfile() {
  return PROFILE_FIELDS.reduce((accumulator, field) => {
    accumulator[field] = '';
    return accumulator;
  }, {});
}

function normalizeProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return createEmptyProfile();
  }

  const normalized = createEmptyProfile();

  PROFILE_FIELDS.forEach((field) => {
    const value = rawProfile[field];

    if (typeof value === 'string') {
      const trimmed = value.trim();
      normalized[field] = trimmed.slice(0, 240);
      return;
    }

    if (value == null) {
      normalized[field] = '';
    }
  });

  return normalized;
}

function sanitizeProfileUpdates(updates = {}) {
  if (!updates || typeof updates !== 'object') {
    return {};
  }

  const sanitized = {};

  PROFILE_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(updates, field)) {
      return;
    }

    const value = updates[field];

    if (typeof value === 'string') {
      sanitized[field] = value.trim().slice(0, 240);
      return;
    }

    if (value == null) {
      sanitized[field] = '';
    }
  });

  return sanitized;
}

function mergeProfile(existingProfile, updates = {}) {
  const baseProfile = normalizeProfile(existingProfile);
  const sanitizedUpdates = sanitizeProfileUpdates(updates);

  return {
    ...baseProfile,
    ...sanitizedUpdates,
  };
}

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
      name: '',
      phone: '',
      password: '',
      device: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: createEmptyProfile(),
    };
  }

  const createdAtValue = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt);
  const updatedAtValue = record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt);

  return {
    id: Number(record.id),
    name: typeof record.name === 'string' ? record.name : '',
    phone: typeof record.phone === 'string' ? record.phone : '',
    password: typeof record.password === 'string' ? record.password : '',
    device: typeof record.device === 'string' ? record.device : '',
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
    updatedAt: Number.isNaN(updatedAtValue?.getTime()) ? new Date() : updatedAtValue,
    profile: normalizeProfile(record.profile),
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

export async function saveUser({ name, phone, password, device, profile }) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      name,
      phone,
      password,
      device,
      profile: normalizeProfile(profile),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

export async function updateUser(id, updates = {}) {
  const db = await openDatabase();
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return Promise.reject(new Error('Identificador de usuário inválido.'));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    let updatedUser;

    const getRequest = store.get(numericId);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;

      if (!existing) {
        reject(new Error('Usuário não encontrado para atualização.'));
        transaction.abort();
        return;
      }

      const now = new Date().toISOString();

      const record = {
        ...existing,
        ...(Object.prototype.hasOwnProperty.call(updates, 'name') ? { name: updates.name } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'phone') ? { phone: updates.phone } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'password') ? { password: updates.password } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'device') ? { device: updates.device } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'profile')
          ? { profile: mergeProfile(existing.profile, updates.profile) }
          : {}),
        updatedAt: now,
      };

      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        updatedUser = deserializeUser(record);
        resolve(updatedUser);
      };

      putRequest.onerror = () => {
        reject(putRequest.error || new Error('Erro ao atualizar o usuário no IndexedDB.'));
      };
    };

    getRequest.onerror = () => {
      reject(getRequest.error || new Error('Erro ao carregar usuário para atualização.'));
    };

    transaction.oncomplete = () => {
      if (updatedUser) {
        notifyListeners();
      }
    };

    transaction.onabort = () => {
      if (!updatedUser) {
        reject(transaction.error || new Error('Transação abortada ao atualizar usuário.'));
      }
    };

    transaction.onerror = () => {
      if (!updatedUser) {
        reject(transaction.error || new Error('Erro na transação ao atualizar usuário.'));
      }
    };
  });
}

export async function deleteUser(id) {
  const db = await openDatabase();
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return Promise.reject(new Error('Identificador de usuário inválido.'));
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(numericId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao remover usuário do IndexedDB.'));
    };

    transaction.oncomplete = () => {
      notifyListeners();
    };

    transaction.onabort = () => {
      reject(transaction.error || new Error('Transação abortada ao remover usuário.'));
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error('Erro na transação ao remover usuário.'));
    };
  });
}
