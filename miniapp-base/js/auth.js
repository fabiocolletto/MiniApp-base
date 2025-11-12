import { UsersApi } from './adapters/users-appscript.js';

const SESSION_STORAGE_KEY = 'miniapp.session';
const ROLE_RANK = {
  admin: 3,
  operador: 2,
  leitor: 1,
};
const ROLE_ALIASES = {
  administrador: 'admin',
  administrator: 'admin',
  admin: 'admin',
  operator: 'operador',
  operador: 'operador',
  operadora: 'operador',
  reader: 'leitor',
  leitor: 'leitor',
  leitura: 'leitor',
  viewer: 'leitor',
};

let internalSession = null;
let internalToken = null;

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return '';
  }
  const trimmed = role.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(ROLE_RANK, trimmed)) {
    return trimmed;
  }
  return ROLE_ALIASES[trimmed] || '';
}

function getRoleRank(role) {
  const normalized = normalizeRole(role);
  return ROLE_RANK[normalized] || 0;
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

function serializeSession(session) {
  if (!session) {
    return null;
  }
  return {
    token: internalToken,
    userId: session.userId || null,
    email: sanitizeEmail(session.email),
    role: normalizeRole(session.role),
    storedAt: new Date().toISOString(),
  };
}

function persistSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    const payload = serializeSession(session);
    if (!payload) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Não foi possível persistir a sessão.', error);
  }
}

function restoreSessionFromStorage(force = false) {
  if (!force && internalSession && internalSession.userId) {
    return internalSession;
  }
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      if (force) {
        internalSession = null;
        internalToken = null;
        UsersApi.setAuthToken(null);
      }
      return null;
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const normalizedRole = normalizeRole(parsed.role);
    const restoredSession = {
      userId: parsed.userId || null,
      email: sanitizeEmail(parsed.email),
      role: normalizedRole,
    };
    internalSession = restoredSession;
    internalToken = typeof parsed.token === 'string' ? parsed.token : null;
    if (internalToken) {
      UsersApi.setAuthToken(internalToken);
    }
    return internalSession;
  } catch (error) {
    console.warn('Não foi possível restaurar a sessão do armazenamento local.', error);
    return null;
  }
}

function broadcastSessionChange() {
  const publicSession = Auth.getSession();
  try {
    window.dispatchEvent(new CustomEvent('auth:session-changed', { detail: publicSession }));
  } catch (error) {
    console.warn('Não foi possível emitir o evento local de sessão.', error);
  }
  try {
    if (window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') {
      window.parent.postMessage({ action: 'auth-session-changed', session: publicSession }, '*');
    }
  } catch (error) {
    console.warn('Não foi possível notificar o shell sobre a sessão.', error);
  }
}

function applySessionPayload(payload) {
  if (!payload) {
    internalSession = null;
    internalToken = null;
    UsersApi.setAuthToken(null);
    persistSession(null);
    broadcastSessionChange();
    return null;
  }
  const normalizedRole = normalizeRole(payload.role || payload.user?.role);
  internalToken = typeof payload.token === 'string' ? payload.token : null;
  UsersApi.setAuthToken(internalToken);
  internalSession = {
    userId: payload.userId || payload.user?.id || null,
    email: sanitizeEmail(payload.email || payload.user?.email),
    role: normalizedRole,
  };
  persistSession(internalSession);
  broadcastSessionChange();
  return internalSession;
}

const Auth = {
  async bootstrap(options = {}) {
    restoreSessionFromStorage(Boolean(options.force));
    try {
      const response = await UsersApi.bootstrap(options);
      if (response && typeof response === 'object') {
        return { adminMissing: Boolean(response.adminMissing) };
      }
    } catch (error) {
      console.warn('Falha ao consultar estado de bootstrap de usuários.', error);
      return { adminMissing: false, error: error.message };
    }
    return { adminMissing: false };
  },
  async login(email, secret, options = {}) {
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !secret) {
      throw new Error('Credenciais inválidas.');
    }
    const payload = { email: sanitizedEmail, secret };
    const response = await UsersApi.login(payload, options);
    if (!response || typeof response !== 'object' || !response.token) {
      throw new Error('Resposta inválida do serviço de autenticação.');
    }
    applySessionPayload({
      token: response.token,
      role: response.role || response.user?.role,
      user: response.user,
      userId: response.user?.id,
      email: response.user?.email || sanitizedEmail,
    });
    return Auth.getSession();
  },
  logout({ notify = true } = {}) {
    internalSession = null;
    internalToken = null;
    UsersApi.setAuthToken(null);
    persistSession(null);
    if (notify) {
      broadcastSessionChange();
    }
  },
  require(requiredRole) {
    if (!requiredRole) {
      return Boolean(Auth.getSession());
    }
    const session = Auth.getSession();
    const userRole = session?.role;
    if (!userRole) {
      return false;
    }
    const userRank = getRoleRank(userRole);
    const requirements = Array.isArray(requiredRole)
      ? requiredRole
      : String(requiredRole).split(',');
    return requirements.some((role) => {
      const normalized = normalizeRole(role);
      if (!normalized) {
        return true;
      }
      return userRank >= getRoleRank(normalized);
    });
  },
  getSession() {
    if (!internalSession) {
      return null;
    }
    return {
      userId: internalSession.userId || null,
      email: internalSession.email || '',
      role: internalSession.role || '',
    };
  },
  getToken() {
    return internalToken;
  },
  refreshSession() {
    const previous = internalSession
      ? { email: internalSession.email, role: internalSession.role, userId: internalSession.userId }
      : null;
    const restored = restoreSessionFromStorage(true);
    const current = restored
      ? { email: restored.email, role: restored.role, userId: restored.userId }
      : null;
    const changed = JSON.stringify(previous) !== JSON.stringify(current);
    if (changed) {
      broadcastSessionChange();
    }
    return Auth.getSession();
  },
};

restoreSessionFromStorage();

export { Auth };
