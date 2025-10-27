import { sanitizeFooterIndicatorsPreference } from '../preferences/footer-indicators.js';

export const DUPLICATE_PHONE_ERROR_MESSAGE = 'Telefone já cadastrado.';

const DB_NAME = 'miniapp-user-store';
const DB_VERSION = 2;
const STORE_NAME = 'users';

export function getIndexedUserDbMetadata() {
  return {
    name: DB_NAME,
    version: DB_VERSION,
    stores: [STORE_NAME],
  };
}

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

const VALID_THEME_PREFERENCES = ['light', 'dark', 'system'];
const DEFAULT_THEME_PREFERENCE = 'system';
const DEFAULT_FOOTER_INDICATORS_PREFERENCE = 'visible';

function sanitizeThemePreference(value) {
  if (typeof value !== 'string') {
    return DEFAULT_THEME_PREFERENCE;
  }

  const normalized = value.trim().toLowerCase();
  return VALID_THEME_PREFERENCES.includes(normalized) ? normalized : DEFAULT_THEME_PREFERENCE;
}

function createEmptyPreferences() {
  return {
    theme: DEFAULT_THEME_PREFERENCE,
    footerIndicators: DEFAULT_FOOTER_INDICATORS_PREFERENCE,
  };
}

function createDuplicatePhoneError() {
  return new Error(DUPLICATE_PHONE_ERROR_MESSAGE);
}

function isConstraintError(error) {
  return (error && typeof error === 'object' && error.name === 'ConstraintError') === true;
}

function normalizePhoneValue(phone) {
  return typeof phone === 'string' ? phone.trim() : '';
}

function normalizePreferences(rawPreferences) {
  if (!rawPreferences || typeof rawPreferences !== 'object') {
    return createEmptyPreferences();
  }

  const normalized = createEmptyPreferences();

  if (Object.prototype.hasOwnProperty.call(rawPreferences, 'theme')) {
    normalized.theme = sanitizeThemePreference(rawPreferences.theme);
  }

  if (Object.prototype.hasOwnProperty.call(rawPreferences, 'footerIndicators')) {
    normalized.footerIndicators = sanitizeFooterIndicatorsPreference(rawPreferences.footerIndicators);
  }

  return normalized;
}

function mergePreferences(existingPreferences, updates = {}) {
  const basePreferences = normalizePreferences(existingPreferences);

  if (!updates || typeof updates !== 'object') {
    return basePreferences;
  }

  const merged = { ...basePreferences };

  if (Object.prototype.hasOwnProperty.call(updates, 'theme')) {
    merged.theme = sanitizeThemePreference(updates.theme);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'footerIndicators')) {
    merged.footerIndicators = sanitizeFooterIndicatorsPreference(updates.footerIndicators);
  }

  return merged;
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

function normalizeTimestamp(value, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const fromNumber = new Date(value);
    if (!Number.isNaN(fromNumber.getTime())) {
      return fromNumber.toISOString();
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const fromString = new Date(value);
    if (!Number.isNaN(fromString.getTime())) {
      return fromString.toISOString();
    }
  }

  const fallbackDate =
    fallback instanceof Date && !Number.isNaN(fallback.getTime())
      ? fallback
      : new Date(typeof fallback === 'string' || typeof fallback === 'number' ? fallback : Date.now());

  if (!Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toISOString();
  }

  return new Date().toISOString();
}

function createMemoryRecord({ name, phone, password, device, profile, userType, preferences }) {
  const now = new Date();
  const timestamp = now.toISOString();
  return {
    id: memoryAutoIncrement++,
    name,
    phone,
    password,
    device,
    userType: sanitizeUserType(userType),
    profile: normalizeProfile(profile),
    preferences: normalizePreferences(preferences),
    createdAt: timestamp,
    updatedAt: timestamp,
    lastAccessAt: timestamp,
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

function ensurePhoneIndex(store) {
  if (!store || typeof store.createIndex !== 'function') {
    return;
  }

  if (!store.indexNames?.contains?.('phone')) {
    store.createIndex('phone', 'phone', { unique: true });
  }
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
        let store;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        } else {
          store = request.transaction?.objectStore(STORE_NAME);
        }

        ensurePhoneIndex(store);
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
      lastAccessAt: new Date(),
      profile: createEmptyProfile(),
      preferences: createEmptyPreferences(),
    };
  }

  const createdAtValue = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt);
  const updatedAtValue = record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt);
  const lastAccessAtValue =
    record.lastAccessAt instanceof Date ? record.lastAccessAt : new Date(record.lastAccessAt ?? record.updatedAt);

  return {
    id: Number(record.id),
    name: typeof record.name === 'string' ? record.name : '',
    phone: typeof record.phone === 'string' ? record.phone : '',
    password: typeof record.password === 'string' ? record.password : '',
    device: typeof record.device === 'string' ? record.device : '',
    userType: sanitizeUserType(record.userType),
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
    updatedAt: Number.isNaN(updatedAtValue?.getTime()) ? new Date() : updatedAtValue,
    lastAccessAt: Number.isNaN(lastAccessAtValue?.getTime()) ? new Date() : lastAccessAtValue,
    profile: normalizeProfile(record.profile),
    preferences: normalizePreferences(record.preferences),
  };
}

async function loadUsersFromMemory() {
  return memoryStore.map(deserializeUser);
}

async function saveUserToMemory({ name, phone, password, device, profile, userType, preferences }) {
  const normalizedPhone = normalizePhoneValue(phone);
  const hasDuplicate = memoryStore.some((record) => record.phone === normalizedPhone);

  if (hasDuplicate) {
    throw createDuplicatePhoneError();
  }

  const record = createMemoryRecord({
    name,
    phone: normalizedPhone,
    password,
    device,
    profile,
    userType,
    preferences,
  });
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
  let sanitizedPhoneUpdate;
  if (Object.prototype.hasOwnProperty.call(updates, 'phone')) {
    sanitizedPhoneUpdate = normalizePhoneValue(updates.phone);
    const hasDuplicate = memoryStore.some(
      (record, recordIndex) => recordIndex !== index && record.phone === sanitizedPhoneUpdate,
    );

    if (hasDuplicate) {
      throw createDuplicatePhoneError();
    }
  }

  const structuralUpdates = {
    ...(Object.prototype.hasOwnProperty.call(updates, 'name') ? { name: updates.name } : {}),
    ...(sanitizedPhoneUpdate !== undefined ? { phone: sanitizedPhoneUpdate } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'password') ? { password: updates.password } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'device') ? { device: updates.device } : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'userType')
      ? { userType: sanitizeUserType(updates.userType) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'profile')
      ? { profile: mergeProfile(existingRecord.profile, updates.profile) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(updates, 'preferences')
      ? { preferences: mergePreferences(existingRecord.preferences, updates.preferences) }
      : {}),
  };

  const hasStructuralUpdates = Object.keys(structuralUpdates).length > 0;
  const lastAccessUpdate = Object.prototype.hasOwnProperty.call(updates, 'lastAccessAt')
    ? { lastAccessAt: normalizeTimestamp(updates.lastAccessAt, existingRecord.lastAccessAt) }
    : {};

  const nextRecord = {
    ...existingRecord,
    ...structuralUpdates,
    ...lastAccessUpdate,
    updatedAt: hasStructuralUpdates ? now : existingRecord.updatedAt,
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

export async function saveUser({ name, phone, password, device, profile, userType, preferences }) {
  if (useMemoryStore) {
    return saveUserToMemory({ name, phone, password, device, profile, userType, preferences });
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const nowIso = new Date().toISOString();
    const normalizedPhone = normalizePhoneValue(phone);
    const record = {
      name,
      phone: normalizedPhone,
      password,
      device,
      userType: sanitizeUserType(userType),
      profile: normalizeProfile(profile),
      preferences: normalizePreferences(preferences),
      createdAt: nowIso,
      updatedAt: nowIso,
      lastAccessAt: nowIso,
    };

    let savedUser;
    let hasErrored = false;

    const request = store.add(record);

    request.onsuccess = () => {
      const id = Number(request.result);
      savedUser = deserializeUser({ ...record, id });
      resolve(savedUser);
    };

    request.onerror = () => {
      hasErrored = true;
      if (isConstraintError(request.error)) {
        reject(createDuplicatePhoneError());
        return;
      }
      reject(request.error || new Error('Erro ao salvar o usuário no IndexedDB.'));
    };

    transaction.oncomplete = () => {
      if (savedUser) {
        notifyListeners();
      }
    };

    transaction.onabort = () => {
      if (hasErrored) {
        return;
      }

      if (isConstraintError(transaction.error)) {
        reject(createDuplicatePhoneError());
        return;
      }

      reject(transaction.error || new Error('Transação abortada ao salvar o usuário no IndexedDB.'));
    };

    transaction.onerror = () => {
      if (hasErrored) {
        return;
      }

      if (isConstraintError(transaction.error)) {
        reject(createDuplicatePhoneError());
        return;
      }

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

      const structuralUpdates = {
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
        ...(Object.prototype.hasOwnProperty.call(updates, 'preferences')
          ? { preferences: mergePreferences(existing.preferences, updates.preferences) }
          : {}),
      };

      const hasStructuralUpdates = Object.keys(structuralUpdates).length > 0;
      const lastAccessUpdate = Object.prototype.hasOwnProperty.call(updates, 'lastAccessAt')
        ? { lastAccessAt: normalizeTimestamp(updates.lastAccessAt, existing.lastAccessAt) }
        : {};

      const record = {
        ...existing,
        ...structuralUpdates,
        ...lastAccessUpdate,
        updatedAt: hasStructuralUpdates ? now : existing.updatedAt,
      };

      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        updatedUser = deserializeUser(record);
        resolve(updatedUser);
      };

      putRequest.onerror = () => {
        if (isConstraintError(putRequest.error)) {
          reject(createDuplicatePhoneError());
          return;
        }
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
      if (updatedUser) {
        return;
      }

      if (isConstraintError(transaction.error)) {
        reject(createDuplicatePhoneError());
        return;
      }

      reject(transaction.error || new Error('Transação abortada ao atualizar usuário.'));
    };

    transaction.onerror = () => {
      if (updatedUser) {
        return;
      }

      if (isConstraintError(transaction.error)) {
        reject(createDuplicatePhoneError());
        return;
      }

      reject(transaction.error || new Error('Erro na transação ao atualizar usuário.'));
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
