const DB_NAME = 'miniapp-user-store';
const DB_VERSION = 1;
const STORE_NAME = 'users';

const PROFILE_FIELDS = [
  'email',
  'secondaryPhone',
  'document',
  'address',
  'addressNumber',
  'addressComplement',
  'addressDistrict',
  'addressCity',
  'addressState',
  'addressZip',
  'addressCountry',
  'website',
  'socialLinkedin',
  'socialInstagram',
  'socialFacebook',
  'socialTwitter',
  'socialYoutube',
  'birthDate',
  'pronouns',
  'profession',
  'company',
  'bio',
  'notes',
];

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

const useMemoryStore =
  (typeof process !== 'undefined' && process?.env?.MINIAPP_USE_MEMORY_STORE === '1') === true ||
  typeof indexedDB === 'undefined';

const memoryStore = [];
let memoryAutoIncrement = 1;

function createMemoryRecord({ name, phone, password, device, profile, userType }) {
  const now = new Date().toISOString();
  return {
    id: memoryAutoIncrement++,
    name,
    phone,
    password,
    device,
    userType: sanitizeUserType(userType),
    profile: normalizeProfile(profile),
    createdAt: now,
    updatedAt: now,
  };
}

const changeListeners = new Set();
let databasePromise;

const USER_TYPES = ['administrador', 'colaborador', 'usuario'];
const DEFAULT_USER_TYPE = 'usuario';

function sanitizeUserType(value) {
  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (USER_TYPES.includes(normalized)) {
    return normalized;
  }

  if (normalized === 'admin' || normalized === 'administradora') {
    return 'administrador';
  }

  if (normalized === 'colaboradora') {
    return 'colaborador';
  }

  if (normalized === 'user' || normalized === 'usuarios') {
    return 'usuario';
  }

  return DEFAULT_USER_TYPE;
}

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
        const error = new Error(
          'IndexedDB bloqueado por outra aba ou janela. Feche outras sessões da aplicação e tente novamente.'
        );
        console.warn(
          'A abertura do banco IndexedDB foi bloqueada. Feche outras abas da aplicação para liberar o acesso.',
          error
        );
        databasePromise = undefined;
        reject(error);
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
    userType: sanitizeUserType(record.userType),
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
    updatedAt: Number.isNaN(updatedAtValue?.getTime()) ? new Date() : updatedAtValue,
    profile: normalizeProfile(record.profile),
  };
}

async function loadUsersFromMemory() {
  return memoryStore.map(deserializeUser);
}

async function saveUserToMemory({ name, phone, password, device, profile, userType }) {
  const record = createMemoryRecord({ name, phone, password, device, profile, userType });
  memoryStore.push(record);
  await notifyListeners();
  return deserializeUser(record);
}

async function updateUserInMemory(id, updates = {}) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error('Identificador de usuário inválido.');
  }

  const index = memoryStore.findIndex((record) => record.id === numericId);
  if (index === -1) {
    throw new Error('Usuário não encontrado para atualização.');
  }

  const existingRecord = memoryStore[index];
  const now = new Date().toISOString();
  const nextRecord = {
    ...existingRecord,
    ...(Object.prototype.hasOwnProperty.call(updates, 'name') ? { name: updates.name } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'phone') ? { phone: updates.phone } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'password') ? { password: updates.password } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'device') ? { device: updates.device } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'userType')
      ? { userType: sanitizeUserType(updates.userType) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'profile')
      ? { profile: mergeProfile(existingRecord.profile, updates.profile) }
      : {}),
    updatedAt: now,
  };

  memoryStore[index] = nextRecord;
  await notifyListeners();
  return deserializeUser(nextRecord);
}

async function deleteUserFromMemory(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error('Identificador de usuário inválido.');
  }

  const index = memoryStore.findIndex((record) => record.id === numericId);
  if (index === -1) {
    return;
  }

  memoryStore.splice(index, 1);
  await notifyListeners();
}

function resetMemoryStore() {
  memoryStore.length = 0;
  memoryAutoIncrement = 1;
  changeListeners.clear();
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
  if (useMemoryStore) {
    return loadUsersFromMemory();
  }

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

export async function saveUser({ name, phone, password, device, profile, userType }) {
  if (useMemoryStore) {
    return saveUserToMemory({ name, phone, password, device, profile, userType });
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      name,
      phone,
      password,
      device,
      userType: sanitizeUserType(userType),
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

  changeListeners.add(listener);

  if (!useMemoryStore && !isIndexedDbSupported()) {
    throw new Error('IndexedDB não é suportado neste navegador.');
  }

  Promise.resolve()
    .then(() => loadUsers())
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
  if (useMemoryStore) {
    return updateUserInMemory(id, updates);
  }

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
        ...(Object.prototype.hasOwnProperty.call(updates, 'userType')
          ? { userType: sanitizeUserType(updates.userType) }
          : {}),
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
  if (useMemoryStore) {
    return deleteUserFromMemory(id);
  }

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

export function resetIndexedDbMock() {
  if (!useMemoryStore) {
    return;
  }

  resetMemoryStore();
}
