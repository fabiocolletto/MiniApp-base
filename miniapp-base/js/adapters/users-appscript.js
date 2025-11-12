const STORAGE_BASE_KEY = 'miniapp.usersApi.base';
let configuredBaseUrl = null;
let authToken = null;

function sanitizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== 'string') {
    return '';
  }
  return baseUrl.trim().replace(/\/$/, '');
}

function readStoredBaseUrl() {
  try {
    const stored = localStorage.getItem(STORAGE_BASE_KEY);
    return sanitizeBaseUrl(stored);
  } catch (error) {
    console.warn('Não foi possível recuperar a URL do backend de usuários.', error);
    return '';
  }
}

function storeBaseUrl(baseUrl) {
  try {
    if (!baseUrl) {
      localStorage.removeItem(STORAGE_BASE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_BASE_KEY, baseUrl);
  } catch (error) {
    console.warn('Não foi possível salvar a URL do backend de usuários.', error);
  }
}

function resolveBaseUrl() {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  const hinted = sanitizeBaseUrl(
    typeof window !== 'undefined' ? window.MINIAPP_USERS_API_BASE || window.__MINIAPP_USERS_API_BASE : '',
  );
  if (hinted) {
    configuredBaseUrl = hinted;
    storeBaseUrl(hinted);
    return configuredBaseUrl;
  }
  const stored = readStoredBaseUrl();
  if (stored) {
    configuredBaseUrl = stored;
    return configuredBaseUrl;
  }
  return '';
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
    storeBaseUrl(configuredBaseUrl);
  }
}

export const UsersApi = {
  configure,
  setAuthToken,
  getBaseUrl: resolveBaseUrl,
  async bootstrap(options) {
    return request('/users/bootstrap', { method: 'GET', ...(options || {}) });
  },
  async initAdmin(payload, options) {
    return request('/users/init-admin', { method: 'POST', body: payload, ...(options || {}) });
  },
  async login(payload, options) {
    return request('/users/login', { method: 'POST', body: payload, ...(options || {}) });
  },
  async listUsers(options) {
    return request('/users/list', { method: 'GET', ...(options || {}) });
  },
  async createUser(payload, options) {
    return request('/users', { method: 'POST', body: payload, ...(options || {}) });
  },
  async updateUser(userId, payload, options) {
    if (!userId) {
      throw new Error('É necessário informar o identificador do usuário.');
    }
    const encodedId = encodeURIComponent(userId);
    const overrideHeaders = { 'X-HTTP-Method-Override': 'PATCH' };
    const customOptions = options && typeof options === 'object' ? options : {};
    const headers = Object.assign({}, overrideHeaders, customOptions.headers || {});
    return request(`/users/${encodedId}`, { method: 'POST', body: payload, headers, ...customOptions });
  },
};
