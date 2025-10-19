import {
  loadUsers as loadUsersFromIndexedDb,
  saveUser as saveUserToIndexedDb,
  watchUsers as watchUsersFromIndexedDb,
} from './indexed-user-store.js';

const listeners = new Set();
let users = [];
let initializationPromise = null;
let hasInitialized = false;
let storageError = null;
let unsubscribeFromIndexedDb = () => {};

function cloneUser(user) {
  return {
    id: user.id,
    phone: user.phone,
    password: user.password,
    device: user.device,
    createdAt: new Date(user.createdAt),
  };
}

function normalizeUser(user) {
  const createdAtValue = user?.createdAt instanceof Date ? user.createdAt : new Date(user?.createdAt);
  const sanitizedDevice = typeof user?.device === 'string' ? user.device.trim() : '';

  return {
    id: Number(user?.id),
    phone: typeof user?.phone === 'string' ? user.phone : '',
    password: typeof user?.password === 'string' ? user.password : '',
    device: sanitizedDevice,
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
  };
}

function notify() {
  if (!hasInitialized) {
    return;
  }

  const snapshot = users.map(cloneUser);
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
  notify();
}

async function initializeUserStore() {
  try {
    const persistedUsers = await loadUsersFromIndexedDb();
    setUsers(persistedUsers);
    storageError = null;

    try {
      unsubscribeFromIndexedDb = watchUsersFromIndexedDb((indexedUsers) => {
        setUsers(indexedUsers);
      });
    } catch (watchError) {
      console.error('Erro ao monitorar alterações no IndexedDB.', watchError);
      unsubscribeFromIndexedDb = () => {};
    }
  } catch (error) {
    storageError = error;
    hasInitialized = true;
    console.error('Erro ao carregar usuários do IndexedDB.', error);
    notify();
  }
}

initializationPromise = initializeUserStore();

export function getUsers() {
  return users.map(cloneUser);
}

export async function addUser({ phone, password, device }) {
  const sanitizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const sanitizedPassword = typeof password === 'string' ? password : '';
  const sanitizedDevice = typeof device === 'string' ? device.trim().slice(0, 512) : '';

  if (!sanitizedPhone || !sanitizedPassword) {
    throw new Error('Telefone e senha são obrigatórios para cadastrar um usuário.');
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    const savedUser = await saveUserToIndexedDb({
      phone: sanitizedPhone,
      password: sanitizedPassword,
      device: sanitizedDevice,
    });

    const normalized = normalizeUser(savedUser);
    const existingIndex = users.findIndex((user) => user.id === normalized.id);

    if (existingIndex >= 0) {
      users[existingIndex] = normalized;
    } else {
      users.push(normalized);
    }

    notify();
    return cloneUser(normalized);
  } catch (error) {
    console.error('Erro ao salvar usuário no IndexedDB.', error);
    throw new Error('Não foi possível salvar o cadastro no armazenamento local. Tente novamente.');
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
  listeners.clear();
  users = [];
  hasInitialized = false;
  storageError = null;
}
