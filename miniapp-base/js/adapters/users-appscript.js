const STORAGE_BASE_KEY = 'miniapp.usersApi.base';
const LOCAL_STATE_KEY = 'miniapp.users.local.state';
let configuredBaseUrl = null;
let authToken = null;
let localMode = false;

function isBrowserContext() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function encodeBase64(input) {
  if (!input) {
    return '';
  }
  if (typeof btoa === 'function') {
    try {
      return btoa(input);
    } catch (error) {
      // browsers antigos podem falhar com unicode; último recurso abaixo
    }
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
  return input;
}

async function hashSecret(secret) {
  if (!secret) {
    return '';
  }
  try {
    if (isBrowserContext() && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      const bytes = new Uint8Array(digest);
      const binary = String.fromCharCode(...bytes);
      return encodeBase64(binary);
    }
  } catch (error) {
    console.warn('Falha ao gerar hash seguro do segredo. Usando fallback simples.', error);
  }
  return encodeBase64(secret);
}

function readLocalState() {
  const defaultState = { version: 1, users: [] };
  if (!isBrowserContext()) {
    return defaultState;
  }
  try {
    const stored = window.localStorage.getItem(LOCAL_STATE_KEY);
    if (!stored) {
      return defaultState;
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return defaultState;
    }
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    return { version: 1, users };
  } catch (error) {
    console.warn('Não foi possível recuperar o estado local de usuários.', error);
    return defaultState;
  }
}

function writeLocalState(state) {
  if (!isBrowserContext()) {
    return;
  }
  try {
    const payload = JSON.stringify(state);
    window.localStorage.setItem(LOCAL_STATE_KEY, payload);
  } catch (error) {
    console.warn('Não foi possível persistir o estado local de usuários.', error);
  }
}

function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

function findLocalUserByEmail(state, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }
  return state.users.find((user) => normalizeEmail(user.email) === normalized) || null;
}

function sanitizeBaseUrl(baseUrl) {

function sanitizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== 'string') {
    return '';
  }
  return baseUrl.trim().replace(/\/$/, '');
}

function readStoredBaseUrl() {
  if (!isBrowserContext()) {
    return '';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_BASE_KEY);
    return sanitizeBaseUrl(stored);
  } catch (error) {
    console.warn('Não foi possível recuperar a URL do backend de usuários.', error);
    return '';
  }
}

function storeBaseUrl(baseUrl) {
  if (!isBrowserContext()) {
    return;
  }
  try {
    if (!baseUrl) {
      window.localStorage.removeItem(STORAGE_BASE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_BASE_KEY, baseUrl);
  } catch (error) {
    console.warn('Não foi possível salvar a URL do backend de usuários.', error);
  }
}

function resolveBaseUrl() {
  if (configuredBaseUrl !== null) {
    localMode = !configuredBaseUrl;
    return configuredBaseUrl;
  }
  const hinted = sanitizeBaseUrl(
    typeof window !== 'undefined' ? window.MINIAPP_USERS_API_BASE || window.__MINIAPP_USERS_API_BASE : '',
  );
  if (hinted) {
    configuredBaseUrl = hinted;
    localMode = false;
    storeBaseUrl(hinted);
    return configuredBaseUrl;
  }
  const stored = readStoredBaseUrl();
  if (stored) {
    configuredBaseUrl = stored;
    localMode = false;
    return configuredBaseUrl;
  }
  configuredBaseUrl = '';
  localMode = true;
  return configuredBaseUrl;
}

function getAdapterMode() {
  resolveBaseUrl();
  return localMode ? 'local' : 'remote';
}

function buildUrl(path) {
  const base = resolveBaseUrl();
  if (!base) {
    throw new Error('A URL base do serviço de usuários não foi configurada.');
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function ensureLocalState() {
  const state = readLocalState();
  if (!Array.isArray(state.users)) {
    state.users = [];
  }
  return state;
}

function sanitizeUserForClient(user) {
  if (!user) {
    return null;
  }
  const { secretHash, ...rest } = user;
  return rest;
}

function createLocalUser(payload) {
  const now = new Date().toISOString();
  return {
    id: payload.id || `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    name: payload.name || '',
    email: payload.email || '',
    role: payload.role || 'leitor',
    active: payload.active !== false,
    secretHash: payload.secretHash || '',
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  };
}

async function localInitAdmin(payload = {}) {
  const state = ensureLocalState();
  const adminExists = state.users.some((user) => user.role === 'admin' && user.active !== false);
  if (adminExists) {
    const error = new Error('Já existe um administrador configurado.');
    error.status = 409;
    throw error;
  }
  const name = (payload.name || '').toString().trim();
  const email = normalizeEmail(payload.email);
  const secret = (payload.secret || '').toString();
  if (!name || !email || !secret) {
    throw new Error('Dados inválidos para criar administrador.');
  }
  const secretHash = await hashSecret(secret);
  const adminUser = createLocalUser({ name, email, role: 'admin', secretHash });
  state.users.push(adminUser);
  writeLocalState(state);
  return sanitizeUserForClient(adminUser);
}

async function localLogin(payload = {}) {
  const state = ensureLocalState();
  const email = normalizeEmail(payload.email);
  const secret = (payload.secret || '').toString();
  if (!email || !secret) {
    throw new Error('Credenciais inválidas.');
  }
  const user = findLocalUserByEmail(state, email);
  if (!user || user.active === false) {
    throw new Error('Usuário não encontrado ou inativo.');
  }
  const providedHash = await hashSecret(secret);
  if (user.secretHash !== providedHash) {
    throw new Error('Credenciais inválidas.');
  }
  const token = `local-${encodeBase64(`${user.id}:${Date.now()}`)}`;
  return {
    token,
    role: user.role,
    user: sanitizeUserForClient(user),
  };
}

function localBootstrap() {
  const state = ensureLocalState();
  const adminExists = state.users.some((user) => user.role === 'admin' && user.active !== false);
  return { adminMissing: !adminExists };
}

function localListUsers() {
  const state = ensureLocalState();
  return state.users.map((user) => sanitizeUserForClient(user));
}

async function localCreateUser(payload = {}) {
  const state = ensureLocalState();
  const email = normalizeEmail(payload.email);
  if (!payload.name || !email || !payload.role) {
    throw new Error('Dados inválidos para criar usuário.');
  }
  if (findLocalUserByEmail(state, email)) {
    throw new Error('Já existe usuário com este e-mail.');
  }
  const secretHash = payload.secret ? await hashSecret(payload.secret) : '';
  const user = createLocalUser({
    name: payload.name,
    email,
    role: payload.role,
    active: payload.active !== false,
    secretHash,
  });
  state.users.push(user);
  writeLocalState(state);
  return sanitizeUserForClient(user);
}

async function localUpdateUser(userId, payload = {}) {
  if (!userId) {
    throw new Error('É necessário informar o identificador do usuário.');
  }
  const state = ensureLocalState();
  const index = state.users.findIndex((user) => user.id === userId);
  if (index < 0) {
    throw new Error('Usuário não encontrado.');
  }
  const user = { ...state.users[index] };
  if (typeof payload.role === 'string') {
    user.role = payload.role;
  }
  if (typeof payload.active === 'boolean') {
    user.active = payload.active;
  }
  if (payload.secret) {
    user.secretHash = await hashSecret(payload.secret);
  }
  user.updatedAt = new Date().toISOString();
  state.users[index] = user;
  writeLocalState(state);
  return sanitizeUserForClient(user);
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const url = buildUrl(path);
  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has('Content-Type') && method !== 'GET' && method !== 'HEAD') {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (authToken && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body && method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
    redirect: 'follow',
    credentials: 'omit',
    signal,
  });

  if (!response.ok) {
    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch (error) {
      // ignora parse
    }
    const error = new Error(errorPayload?.message || `Falha HTTP ${response.status}`);
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function setAuthToken(token) {
  authToken = typeof token === 'string' && token.trim() ? token.trim() : null;
}

function configure({ baseUrl } = {}) {
  if (baseUrl) {
    configuredBaseUrl = sanitizeBaseUrl(baseUrl);
    localMode = !configuredBaseUrl;
    storeBaseUrl(configuredBaseUrl);
  } else if (baseUrl === '') {
    configuredBaseUrl = '';
    localMode = true;
    storeBaseUrl('');
  }
}

async function runRemoteRequest(path, init) {
  return request(path, init);
}

export const UsersApi = {
  configure,
  setAuthToken,
  getBaseUrl: resolveBaseUrl,
  getMode: getAdapterMode,
  isLocalMode: () => getAdapterMode() === 'local',
  async bootstrap(options) {
    if (getAdapterMode() === 'local') {
      return localBootstrap();
    }
    return runRemoteRequest('/users/bootstrap', { method: 'GET', ...(options || {}) });
  },
  async initAdmin(payload, options) {
    if (getAdapterMode() === 'local') {
      return localInitAdmin(payload, options);
    }
    return runRemoteRequest('/users/init-admin', { method: 'POST', body: payload, ...(options || {}) });
  },
  async login(payload, options) {
    if (getAdapterMode() === 'local') {
      return localLogin(payload, options);
    }
    return runRemoteRequest('/users/login', { method: 'POST', body: payload, ...(options || {}) });
  },
  async listUsers(options) {
    if (getAdapterMode() === 'local') {
      return localListUsers(options);
    }
    return runRemoteRequest('/users/list', { method: 'GET', ...(options || {}) });
  },
  async createUser(payload, options) {
    if (getAdapterMode() === 'local') {
      return localCreateUser(payload, options);
    }
    return runRemoteRequest('/users', { method: 'POST', body: payload, ...(options || {}) });
  },
  async updateUser(userId, payload, options) {
    if (getAdapterMode() === 'local') {
      return localUpdateUser(userId, payload, options);
    }
    if (!userId) {
      throw new Error('É necessário informar o identificador do usuário.');
    }
    const encodedId = encodeURIComponent(userId);
    const overrideHeaders = { 'X-HTTP-Method-Override': 'PATCH' };
    const customOptions = options && typeof options === 'object' ? options : {};
    const headers = Object.assign({}, overrideHeaders, customOptions.headers || {});
    return runRemoteRequest(`/users/${encodedId}`, { method: 'POST', body: payload, headers, ...customOptions });
  },
};
