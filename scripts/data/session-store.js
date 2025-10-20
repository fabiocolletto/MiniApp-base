import { getUsers, subscribeUsers } from './user-store.js';
import eventBus from '../events/event-bus.js';

const SESSION_STORAGE_KEY = 'miniapp-active-user-id';
const sessionListeners = new Set();
let activeUserId = null;
let usersSnapshot = getUsers();
let hasLoadedFromStorage = false;
let hasSyncedUsers = false;

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error('Armazenamento local indisponível para sessão.', error);
    return null;
  }
}

function readPersistedUserId() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(SESSION_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsedValue = Number.parseInt(storedValue, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  } catch (error) {
    console.error('Não foi possível ler a sessão do armazenamento local.', error);
    return null;
  }
}

function writePersistedUserId(id) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (id == null) {
      storage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    storage.setItem(SESSION_STORAGE_KEY, String(id));
  } catch (error) {
    console.error('Não foi possível atualizar a sessão no armazenamento local.', error);
  }
}

function cloneUser(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    password: user.password,
    device: user.device,
    createdAt: user.createdAt instanceof Date ? new Date(user.createdAt) : new Date(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? new Date(user.updatedAt) : new Date(user.updatedAt),
    profile: user.profile ? { ...user.profile } : {},
  };
}

function findActiveUser() {
  if (activeUserId == null) {
    return null;
  }

  return usersSnapshot.find((user) => user.id === activeUserId) ?? null;
}

function notifySessionListeners() {
  const activeUser = getActiveUser();
  sessionListeners.forEach((listener) => {
    try {
      listener(activeUser);
    } catch (error) {
      console.error('Erro ao notificar assinante da sessão ativa.', error);
    }
  });
  eventBus.emit('session:changed', activeUser);
}

function updateActiveUserId(newId) {
  if (newId == null) {
    activeUserId = null;
    writePersistedUserId(null);
    notifySessionListeners();
    return;
  }

  const numericId = Number.parseInt(newId, 10);
  if (Number.isNaN(numericId)) {
    console.warn('Identificador de sessão inválido, limpando sessão atual.');
    updateActiveUserId(null);
    return;
  }

  if (hasSyncedUsers) {
    const userExists = usersSnapshot.some((user) => user.id === numericId);
    if (!userExists) {
      console.warn('Usuário ativo não encontrado, limpando sessão.');
      updateActiveUserId(null);
      return;
    }
  }

  activeUserId = numericId;
  writePersistedUserId(numericId);
  notifySessionListeners();
}

export function getActiveUserId() {
  return activeUserId;
}

export function getActiveUser() {
  const activeUser = findActiveUser();
  return activeUser ? cloneUser(activeUser) : null;
}

export function setActiveUser(userId) {
  updateActiveUserId(userId);
}

export function clearActiveUser() {
  updateActiveUserId(null);
}

export function subscribeSession(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  sessionListeners.add(listener);

  try {
    listener(getActiveUser());
  } catch (error) {
    console.error('Erro ao inicializar assinante da sessão ativa.', error);
  }

  return () => {
    sessionListeners.delete(listener);
  };
}

function syncUsersSnapshot(latestUsers) {
  usersSnapshot = Array.isArray(latestUsers) ? latestUsers : [];
  hasSyncedUsers = true;

  if (activeUserId != null) {
    const hasActiveUser = usersSnapshot.some((user) => user.id === activeUserId);
    if (!hasActiveUser) {
      updateActiveUserId(null);
      return;
    }
  }

  notifySessionListeners();
}

subscribeUsers((users) => {
  syncUsersSnapshot(users);
});

if (!hasLoadedFromStorage) {
  hasLoadedFromStorage = true;
  const storedUserId = readPersistedUserId();
  if (storedUserId != null) {
    updateActiveUserId(storedUserId);
  }
}

Promise.resolve().then(() => {
  eventBus.emit('session:changed', getActiveUser());
});
