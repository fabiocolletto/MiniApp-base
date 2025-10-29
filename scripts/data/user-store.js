import {
  loadUsers as loadUsersFromIndexedDb,
  saveUser as saveUserToIndexedDb,
  watchUsers as watchUsersFromIndexedDb,
  updateUser as updateUserInIndexedDb,
  deleteUser as deleteUserFromIndexedDb,
  clearAllUsers,
  resetIndexedDbMock,
  DUPLICATE_PHONE_ERROR_MESSAGE,
} from './indexed-user-store.js';
import eventBus from '../events/event-bus.js';
import { replaceAccounts } from '../../core/account-store.js';
import { sanitizeFooterIndicatorsPreference } from '../preferences/footer-indicators.js';

export { DUPLICATE_PHONE_ERROR_MESSAGE } from './indexed-user-store.js';

const listeners = new Set();
const statusListeners = new Set();
let users = [];
let initializationPromise = null;
let hasInitialized = false;
let storageError = null;
let unsubscribeFromIndexedDb = () => {};

const USER_TYPES = ['administrador', 'colaborador', 'usuario'];
const DEFAULT_USER_TYPE = 'usuario';

let accountsSyncPromise = null;

function scheduleAccountsSync() {
  if (accountsSyncPromise) {
    return accountsSyncPromise;
  }

  accountsSyncPromise = (async () => {
    const snapshot = users
      .map((user) => {
        const numericId = Number(user?.id);
        if (!Number.isFinite(numericId)) {
          return null;
        }

        const id = String(numericId);
        const name = typeof user?.name === 'string' ? user.name.trim() : '';
        const phone = typeof user?.phone === 'string' ? user.phone.trim() : '';
        const createdAtValue = user?.createdAt instanceof Date ? user.createdAt : new Date(user?.createdAt);
        const createdAt = Number.isNaN(createdAtValue?.getTime()) ? '' : createdAtValue.toISOString();
        const type = typeof user?.userType === 'string' ? user.userType.trim() : '';
        const kind = type ? `user:${type}` : 'user';
        const labelParts = [name, phone].filter(Boolean);

        return {
          id,
          label: labelParts.length > 0 ? labelParts.join(' · ') : undefined,
          kind,
          createdAt: createdAt || undefined,
        };
      })
      .filter((account) => account !== null);

    try {
      await replaceAccounts(snapshot);
    } catch (error) {
      console.error('Não foi possível sincronizar cadastros globais com o armazenamento principal.', error);
    } finally {
      accountsSyncPromise = null;
    }
  })();

  return accountsSyncPromise;
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

function createLoadingStatus() {
  return {
    state: 'loading',
    message: 'Memória carregando',
    details: 'Verificando disponibilidade do armazenamento local.',
  };
}

let storageStatus = createLoadingStatus();
let pendingStorageReadyReason = null;

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

function createStorageReadyStatus({ reason } = {}) {
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const hasUsers = totalUsers > 0;

  if (reason === 'update') {
    const availabilitySummary = hasUsers
      ? totalUsers === 1
        ? '1 cadastro disponível na memória local.'
        : `${totalUsers} cadastros disponíveis na memória local.`
      : 'Nenhum cadastro disponível na memória local.';

    return {
      state: hasUsers ? 'updated' : 'empty',
      message: hasUsers ? 'Memória atualizada' : 'Memória atualizada (vazia)',
      details: `Dados sincronizados com sucesso. ${availabilitySummary}`,
    };
  }

  const details = hasUsers
    ? totalUsers === 1
      ? 'Armazenamento local sincronizado com 1 cadastro.'
      : `Armazenamento local sincronizado com ${totalUsers} cadastros.`
    : 'Armazenamento local ativo, nenhum cadastro armazenado.';

  return {
    state: hasUsers ? 'ready' : 'empty',
    message: hasUsers ? 'Memória ativa' : 'Memória ativa (vazia)',
    details,
  };
}

function markStorageReady({ reason } = {}) {
  storageError = null;
  const effectiveReason =
    reason != null && reason !== '' ? reason : pendingStorageReadyReason ?? null;
  pendingStorageReadyReason = null;
  setStorageStatus(createStorageReadyStatus({ reason: effectiveReason }));
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

function clonePreferences(preferences) {
  return normalizePreferences(preferences);
}

function sanitizePreferencesUpdates(updates = {}) {
  if (!updates || typeof updates !== 'object') {
    return {};
  }

  const sanitized = {};

  if (Object.prototype.hasOwnProperty.call(updates, 'theme')) {
    sanitized.theme = sanitizeThemePreference(updates.theme);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'footerIndicators')) {
    sanitized.footerIndicators = sanitizeFooterIndicatorsPreference(updates.footerIndicators);
  }

  return sanitized;
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
    userType: sanitizeUserType(user.userType),
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    lastAccessAt: new Date(user.lastAccessAt ?? user.updatedAt ?? Date.now()),
    profile: cloneProfile(user.profile),
    preferences: clonePreferences(user.preferences),
  };
}

function normalizeUser(user) {
  const createdAtValue = user?.createdAt instanceof Date ? user.createdAt : new Date(user?.createdAt);
  const updatedAtValue = user?.updatedAt instanceof Date ? user.updatedAt : new Date(user?.updatedAt);
  const lastAccessAtValue =
    user?.lastAccessAt instanceof Date
      ? user.lastAccessAt
      : new Date(user?.lastAccessAt ?? updatedAtValue ?? Date.now());
  const sanitizedDevice = typeof user?.device === 'string' ? user.device.trim() : '';

  return {
    id: Number(user?.id),
    name: typeof user?.name === 'string' ? user.name.trim() : '',
    phone: typeof user?.phone === 'string' ? user.phone : '',
    password: typeof user?.password === 'string' ? user.password : '',
    device: sanitizedDevice,
    userType: sanitizeUserType(user?.userType),
    createdAt: Number.isNaN(createdAtValue?.getTime()) ? new Date() : createdAtValue,
    updatedAt: Number.isNaN(updatedAtValue?.getTime()) ? new Date() : updatedAtValue,
    lastAccessAt: Number.isNaN(lastAccessAtValue?.getTime())
      ? Number.isNaN(updatedAtValue?.getTime())
        ? new Date()
        : updatedAtValue
      : lastAccessAtValue,
    profile: normalizeProfile(user?.profile),
    preferences: normalizePreferences(user?.preferences),
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
  scheduleAccountsSync();
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

export async function addUser({ name, phone, password, device, profile, userType, preferences }) {
  const sanitizedName = typeof name === 'string' ? name.trim().slice(0, 120) : '';
  const sanitizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const sanitizedPassword = typeof password === 'string' ? password : '';
  const sanitizedDevice = typeof device === 'string' ? device.trim().slice(0, 512) : '';
  const sanitizedProfile = normalizeProfile(profile);
  const sanitizedUserType = sanitizeUserType(userType);
  const sanitizedPreferences = normalizePreferences(preferences);

  if (!sanitizedPhone || !sanitizedPassword) {
    throw new Error('Telefone e senha são obrigatórios para acessar o painel.');
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  const phoneAlreadyRegistered = users.some((user) => user.phone === sanitizedPhone);
  if (phoneAlreadyRegistered) {
    throw new Error(DUPLICATE_PHONE_ERROR_MESSAGE);
  }

  try {
    const savedUser = await saveUserToIndexedDb({
      name: sanitizedName,
      phone: sanitizedPhone,
      password: sanitizedPassword,
      device: sanitizedDevice,
      profile: sanitizedProfile,
      userType: sanitizedUserType,
      preferences: sanitizedPreferences,
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
    scheduleAccountsSync();
    return cloneUser(normalized);
  } catch (error) {
    if (error instanceof Error && error.message === DUPLICATE_PHONE_ERROR_MESSAGE) {
      console.warn('Tentativa de cadastrar telefone já existente.', error);
      throw error;
    }

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

  if (Object.prototype.hasOwnProperty.call(updates, 'userType')) {
    sanitizedUpdates.userType = sanitizeUserType(updates.userType);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'profile')) {
    const profileUpdates = sanitizeProfileUpdates(updates.profile);
    if (Object.keys(profileUpdates).length > 0) {
      sanitizedUpdates.profile = profileUpdates;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'preferences')) {
    const preferencesUpdates = sanitizePreferencesUpdates(updates.preferences);
    if (Object.keys(preferencesUpdates).length > 0) {
      sanitizedUpdates.preferences = preferencesUpdates;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'lastAccessAt')) {
    const value = updates.lastAccessAt;
    let isoValue = '';

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      isoValue = value.toISOString();
    } else if (typeof value === 'string' && value.trim() !== '') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        isoValue = parsed.toISOString();
      }
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      const fromNumber = new Date(value);
      if (!Number.isNaN(fromNumber.getTime())) {
        isoValue = fromNumber.toISOString();
      }
    }

    if (isoValue) {
      sanitizedUpdates.lastAccessAt = isoValue;
    }
  }

  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    pendingStorageReadyReason = 'update';
    const updatedUser = await updateUserInIndexedDb(numericId, sanitizedUpdates);
    const normalized = normalizeUser(updatedUser);
    const existingIndex = users.findIndex((user) => user.id === normalized.id);

    if (existingIndex >= 0) {
      users[existingIndex] = normalized;
    } else {
      users.push(normalized);
    }

    notify();
    if (pendingStorageReadyReason === 'update') {
      markStorageReady({ reason: 'update' });
    }
    scheduleAccountsSync();
    return cloneUser(normalized);
  } catch (error) {
    pendingStorageReadyReason = null;
    if (error instanceof Error && error.message === DUPLICATE_PHONE_ERROR_MESSAGE) {
      console.warn('Tentativa de atualizar usuário com telefone já cadastrado.', error);
      throw error;
    }
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
    scheduleAccountsSync();
  } catch (error) {
    console.error('Erro ao remover usuário do IndexedDB.', error);
    markStorageError(error);
    throw new Error('Não foi possível remover o usuário. Tente novamente.');
  }
}

export async function purgeDeviceData() {
  await initializationPromise?.catch(() => {});

  if (storageError) {
    throw new Error('Armazenamento local indisponível. Verifique o suporte ao IndexedDB e tente novamente.');
  }

  try {
    await clearAllUsers();
    users = [];
    notify();
    markStorageReady({ reason: 'update' });
    await scheduleAccountsSync();
  } catch (error) {
    console.error('Erro ao limpar dados locais do IndexedDB.', error);
    markStorageError(error);
    throw new Error('Não foi possível limpar os dados locais do dispositivo. Tente novamente.');
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
  pendingStorageReadyReason = null;
  markStorageLoading();
  scheduleAccountsSync();
}

export function getDefaultUserPreferences() {
  return createEmptyPreferences();
}

export function normalizeUserPreferences(preferences) {
  return normalizePreferences(preferences);
}

export function sanitizeUserThemePreference(preference) {
  return sanitizeThemePreference(preference);
}

export function sanitizeUserFooterIndicatorsPreference(preference) {
  return sanitizeFooterIndicatorsPreference(preference);
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
