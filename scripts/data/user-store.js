import {
  loadUsers as loadUsersFromIndexedDb,
  saveUser as saveUserToIndexedDb,
  watchUsers as watchUsersFromIndexedDb,
  updateUser as updateUserInIndexedDb,
  deleteUser as deleteUserFromIndexedDb,
  resetIndexedDbMock,
} from './indexed-user-store.js';
import eventBus from '../events/event-bus.js';

const listeners = new Set();
const statusListeners = new Set();
let users = [];
let initializationPromise = null;
let hasInitialized = false;
let storageError = null;
let unsubscribeFromIndexedDb = () => {};

function createLoadingStatus() {
  return {
    state: 'loading',
    message: 'Memória carregando',
    details: 'Verificando disponibilidade do armazenamento local.',
  };
}

let storageStatus = createLoadingStatus();

function cloneStorageStatus() {
  return {
    state: storageStatus.state,
    message: storageStatus.message,
    details: storageStatus.details,
  };
}

function notifyStorageStatus() {
  const snapshot = cloneStorageStatus();
  eventBus.emit('storage:status', snapshot);
  statusListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante do status do armazenamento.', error);
    }
  });
}

function setStorageStatus(nextStatus) {
  storageStatus = {
    state: nextStatus?.state ?? storageStatus.state,
    message: nextStatus?.message ?? storageStatus.message,
    details: nextStatus?.details ?? storageStatus.details,
  };
  notifyStorageStatus();
}

function markStorageLoading() {
  setStorageStatus(createLoadingStatus());
}

function markStorageReady() {
  storageError = null;
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const hasUsers = totalUsers > 0;

  const details = hasUsers
    ? totalUsers === 1
      ? 'Armazenamento local sincronizado com 1 cadastro.'
      : `Armazenamento local sincronizado com ${totalUsers} cadastros.`
    : 'Armazenamento local ativo, nenhum cadastro armazenado.';

  setStorageStatus({
    state: hasUsers ? 'ready' : 'empty',
    message: hasUsers ? 'Memória ativa' : 'Memória ativa (vazia)',
    details,
  });
}

function markStorageError(error, { persistent = false } = {}) {
  if (persistent) {
    storageError = error;
  }

  const details =
    error instanceof Error && typeof error.message === 'string' && error.message.trim()
      ? error.message.trim()
      : 'Armazenamento local indisponível ou falha ao acessar o armazenamento persistente.';

  setStorageStatus({
    state: 'error',
    message: 'Memória indisponível',
    details,
  });
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

function cloneProfile(profile) {
  return normalizeProfile(profile);
}

function normalizeProfile(profile) {
  const normalized = createEmptyProfile();

  if (!profile || typeof profile !== 'object') {
    return normalized;
  }

  PROFILE_FIELDS.forEach((field) => {
    const value = profile[field];

    if (typeof value === 'string') {
      normalized[field] = value.trim().slice(0, 240);
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

function cloneUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    password: user.password,
    device: user.device,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    profile: cloneProfile(user.profile),
  };
}

function normalizeUser(user) {
  const createdAtValue = user?.createdAt instanceof Date ? user.createdAt : new Date(user?.createdAt);
  const updatedAtValue = user?.updatedAt instanceof Date ? user.updatedAt : new Date(user?.updatedAt);
  const sanitizedDevice = typeof user?.device === 'string' ? user.device.trim() : '';

  return {
    id: Number(user?.id),
    name: typeof user?.name === 'string' ? user.name.trim() : '',
    phone: typeof user?.phone === 'string' ? user.phone : '',
    password: typeof user?.password === 'string' ? user.password : '',
    device: sanitizedDevice,
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
    updatedAt: Number.isNaN(updatedAtValue?.getTime()) ? new Date() : updatedAtValue,
    profile: normalizeProfile(user?.profile),
  };
}

function notify() {
  if (!hasInitialized) {
    return;
  }

  const snapshot = users.map(cloneUser);
  eventBus.emit('users:updated', snapshot);
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante da lista de usuários.', error);
    }
  });
}

function setUsers(newUsers) {
  users = Array.isArray(newUsers) ? newUsers.map(normalizeUser) : [];
  hasInitialized = true;
  if (!storageError) {
    markStorageReady();
  }
  notify();
}

async function initializeUserStore() {
  markStorageLoading();
  try {
    const persistedUsers = await loadUsersFromIndexedDb();
    storageError = null;
    setUsers(persistedUsers);

    try {
      unsubscribeFromIndexedDb = watchUsersFromIndexedDb((indexedUsers) => {
        setUsers(indexedUsers);
      });
    } catch (watchError) {
      console.error('Erro ao monitorar alterações no IndexedDB.', watchError);
      unsubscribeFromIndexedDb = () => {};
    }
  } catch (error) {
    markStorageError(error, { persistent: true });
    hasInitialized = true;
    console.error('Erro ao carregar usuários do IndexedDB.', error);
    notify();
  }
}

initializationPromise = initializeUserStore();

export function getUsers() {
  return users.map(cloneUser);
}

export function getStorageStatus() {
  return cloneStorageStatus();
}

export function subscribeStorageStatus(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  statusListeners.add(listener);

  try {
    listener(cloneStorageStatus());
  } catch (error) {
    console.error('Erro ao inicializar assinante do status do armazenamento.', error);
  }

  return () => {
    statusListeners.delete(listener);
  };
}

export async function addUser({ name, phone, password, device, profile }) {
  const sanitizedName = typeof name === 'string' ? name.trim().slice(0, 120) : '';
  const sanitizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const sanitizedPassword = typeof password === 'string' ? password : '';
  const sanitizedDevice = typeof device === 'string' ? device.trim().slice(0, 512) : '';
  const sanitizedProfile = normalizeProfile(profile);

  if (!sanitizedPhone || !sanitizedPassword) {
    throw new Error('Telefone e senha são obrigatórios para acessar o painel.');
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    const savedUser = await saveUserToIndexedDb({
      name: sanitizedName,
      phone: sanitizedPhone,
      password: sanitizedPassword,
      device: sanitizedDevice,
      profile: sanitizedProfile,
    });

    const normalized = normalizeUser(savedUser);
    const existingIndex = users.findIndex((user) => user.id === normalized.id);

    if (existingIndex >= 0) {
      users[existingIndex] = normalized;
    } else {
      users.push(normalized);
    }

    notify();
    markStorageReady();
    return cloneUser(normalized);
  } catch (error) {
    console.error('Erro ao salvar usuário no IndexedDB.', error);
    markStorageError(error);
    throw new Error('Não foi possível salvar o cadastro no armazenamento local. Tente novamente.');
  }
}

export async function authenticateUser({ phone, password }) {
  const sanitizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const sanitizedPassword = typeof password === 'string' ? password : '';

  if (!sanitizedPhone || !sanitizedPassword) {
    throw new Error('Informe telefone e senha para acessar o painel.');
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  const matchedUser = users.find(
    (user) => user.phone === sanitizedPhone && user.password === sanitizedPassword
  );

  if (!matchedUser) {
    throw new Error('Telefone ou senha inválidos. Verifique os dados e tente novamente.');
  }

  return cloneUser(matchedUser);
}

export async function updateUser(id, updates = {}) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error('Identificador de usuário inválido.');
  }

  const sanitizedUpdates = {};

  if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
    sanitizedUpdates.name = typeof updates.name === 'string' ? updates.name.trim().slice(0, 120) : '';
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'phone')) {
    sanitizedUpdates.phone = typeof updates.phone === 'string' ? updates.phone.trim() : '';
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'password')) {
    sanitizedUpdates.password = typeof updates.password === 'string' ? updates.password : '';
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'device')) {
    sanitizedUpdates.device = typeof updates.device === 'string' ? updates.device.trim().slice(0, 512) : '';
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'profile')) {
    const profileUpdates = sanitizeProfileUpdates(updates.profile);
    if (Object.keys(profileUpdates).length > 0) {
      sanitizedUpdates.profile = profileUpdates;
    }
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    const updatedUser = await updateUserInIndexedDb(numericId, sanitizedUpdates);
    const normalized = normalizeUser(updatedUser);
    const existingIndex = users.findIndex((user) => user.id === normalized.id);

    if (existingIndex >= 0) {
      users[existingIndex] = normalized;
    } else {
      users.push(normalized);
    }

    notify();
    markStorageReady();
    return cloneUser(normalized);
  } catch (error) {
    console.error('Erro ao atualizar usuário no IndexedDB.', error);
    markStorageError(error);
    throw new Error('Não foi possível atualizar o usuário. Tente novamente.');
  }
}

export async function deleteUser(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new Error('Identificador de usuário inválido.');
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    await deleteUserFromIndexedDb(numericId);
    users = users.filter((user) => user.id !== numericId);
    notify();
    markStorageReady();
  } catch (error) {
    console.error('Erro ao remover usuário do IndexedDB.', error);
    markStorageError(error);
    throw new Error('Não foi possível remover o usuário. Tente novamente.');
  }
}

export function subscribeUsers(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);

  const deliverSnapshot = () => {
    if (!listeners.has(listener)) {
      return;
    }

    try {
      listener(getUsers());
    } catch (error) {
      console.error('Erro ao inicializar assinante da lista de usuários.', error);
    }
  };

  if (hasInitialized) {
    deliverSnapshot();
  } else {
    initializationPromise
      ?.catch(() => {})
      .finally(() => {
        deliverSnapshot();
      });
  }

  return () => {
    listeners.delete(listener);
  };
}

export function teardownUserStore() {
  unsubscribeFromIndexedDb();
  unsubscribeFromIndexedDb = () => {};
  users = [];
  hasInitialized = false;
  storageError = null;
  markStorageLoading();
}

export async function resetUserStoreForTests() {
  try {
    resetIndexedDbMock();
  } catch (error) {
    console.warn('Falha ao limpar armazenamento em memória para testes.', error);
  }

  teardownUserStore();
  initializationPromise = initializeUserStore();

  try {
    await initializationPromise;
  } catch (error) {
    console.warn('Falha ao reinicializar o store de usuários em ambiente de teste.', error);
  }
}
