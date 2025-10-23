import { getUsers, subscribeUsers } from './user-store.js';
import { setSessionState as persistGlobalSessionState } from '../../core/account-store.js';
import eventBus from '../events/event-bus.js';
import { sanitizeFooterIndicatorsPreference } from '../preferences/footer-indicators.js';

const SESSION_STORAGE_KEY = 'miniapp-active-user-id';
const sessionListeners = new Set();
const sessionStatusListeners = new Set();

const VALID_THEME_PREFERENCES = ['light', 'dark', 'system'];
const USER_TYPES = ['administrador', 'colaborador', 'usuario'];
const DEFAULT_USER_TYPE = 'usuario';

function normalizeThemePreference(value) {
  if (typeof value !== 'string') {
    return 'system';
  }

  const normalized = value.trim().toLowerCase();
  return VALID_THEME_PREFERENCES.includes(normalized) ? normalized : 'system';
}

function clonePreferences(preferences) {
  if (!preferences || typeof preferences !== 'object') {
    return { theme: 'system', footerIndicators: 'visible' };
  }

  const cloned = { theme: 'system', footerIndicators: 'visible' };

  if (Object.prototype.hasOwnProperty.call(preferences, 'theme')) {
    cloned.theme = normalizeThemePreference(preferences.theme);
  }

  if (Object.prototype.hasOwnProperty.call(preferences, 'footerIndicators')) {
    cloned.footerIndicators = sanitizeFooterIndicatorsPreference(preferences.footerIndicators);
  }

  return cloned;
}

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

function createSessionLoadingStatus() {
  return {
    state: 'loading',
    message: 'Sessão sincronizando',
    details: 'Aguardando leitura dos cadastros e da sessão ativa.',
  };
}

let sessionStatus = createSessionLoadingStatus();

function cloneSessionStatus() {
  return {
    state: sessionStatus.state,
    message: sessionStatus.message,
    details: sessionStatus.details,
  };
}

function notifySessionStatus() {
  const snapshot = cloneSessionStatus();
  sessionStatusListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante do status da sessão.', error);
    }
  });
  eventBus.emit('session:status', snapshot);
}

function setSessionStatus(nextStatus) {
  const state = typeof nextStatus?.state === 'string' ? nextStatus.state : sessionStatus.state;
  const message = typeof nextStatus?.message === 'string' ? nextStatus.message : sessionStatus.message;
  const details = typeof nextStatus?.details === 'string' ? nextStatus.details : sessionStatus.details;

  const hasChanged =
    state !== sessionStatus.state || message !== sessionStatus.message || details !== sessionStatus.details;

  sessionStatus = { state, message, details };

  if (hasChanged) {
    notifySessionStatus();
  }
}
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

function persistGlobalSession(accountId) {
  const normalizedId =
    accountId == null ? '' : typeof accountId === 'string' ? accountId.trim() : String(accountId).trim();

  try {
    const promise = persistGlobalSessionState(normalizedId ? { activeAccountId: normalizedId } : {});
    if (promise && typeof promise.then === 'function') {
      promise.catch((error) => {
        console.error('Não foi possível sincronizar a sessão global.', error);
      });
    }
  } catch (error) {
    console.error('Não foi possível sincronizar a sessão global.', error);
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
    userType: sanitizeUserType(user.userType),
    createdAt: user.createdAt instanceof Date ? new Date(user.createdAt) : new Date(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? new Date(user.updatedAt) : new Date(user.updatedAt),
    profile: user.profile ? { ...user.profile } : {},
    preferences: clonePreferences(user.preferences),
  };
}

function findActiveUser() {
  if (activeUserId == null) {
    return null;
  }

  return usersSnapshot.find((user) => user.id === activeUserId) ?? null;
}

function applySessionStatus(activeUserOverride) {
  if (!hasSyncedUsers) {
    setSessionStatus(createSessionLoadingStatus());
    return;
  }

  const activeUser =
    activeUserOverride && typeof activeUserOverride === 'object' ? activeUserOverride : findActiveUser() ?? null;

  if (activeUser) {
    const displayName = typeof activeUser.name === 'string' ? activeUser.name.trim() : '';
    const [firstName = ''] = displayName ? displayName.split(/\s+/).filter(Boolean) : [''];
    const displayPhone = typeof activeUser.phone === 'string' ? activeUser.phone.trim() : '';
    const identifier = displayName || displayPhone ? [displayName, displayPhone].filter(Boolean).join(' · ') : '';

    setSessionStatus({
      state: 'connected',
      message: firstName ? `Usuário ${firstName} logado` : 'Usuário conectado',
      details: identifier ? `Sessão ativa para ${identifier}.` : 'Sessão ativa para o usuário conectado.',
    });
    return;
  }

  if (usersSnapshot.length === 0) {
    setSessionStatus({
      state: 'empty',
      message: 'Nenhum usuário',
      details: 'Cadastre um usuário para iniciar uma sessão.',
    });
    return;
  }

  const totalUsers = usersSnapshot.length;
  const pluralSuffix = totalUsers === 1 ? '' : 's';
  setSessionStatus({
    state: 'idle',
    message: 'Usuário desconectado',
    details: `Sessão encerrada. ${totalUsers} cadastro${pluralSuffix} disponível${pluralSuffix}.`,
  });
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
  applySessionStatus(activeUser);
}

function updateActiveUserId(newId) {
  if (newId == null) {
    activeUserId = null;
    writePersistedUserId(null);
    persistGlobalSession(null);
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
  persistGlobalSession(numericId);
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

export function getSessionStatus() {
  return cloneSessionStatus();
}

export function subscribeSessionStatus(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  sessionStatusListeners.add(listener);

  try {
    listener(getSessionStatus());
  } catch (error) {
    console.error('Erro ao inicializar assinante do status da sessão.', error);
  }

  return () => {
    sessionStatusListeners.delete(listener);
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

notifySessionStatus();
