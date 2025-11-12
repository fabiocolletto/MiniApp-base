/**
 * Apps Script Web App para gerenciamento de usuários.
 *
 * Requisitos:
 * - Ativar o serviço avançado do Drive (Drive API v3) em `Recursos > Serviços Avançados do Google`.
 * - Publicar o script como Web App com as opções "Execute as me" e "Acesso: qualquer pessoa com conta Google".
 */

const FILE_NAME = 'usuarios.json';
const SCHEMA_VERSION = 1;
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEY_LENGTH = 32;
const TOKEN_EXPIRATION_MINUTES = 120;

let cachedUsersFileId = null;

function doGet(e) {
  return handleRequest('GET', e);
}

function doPost(e) {
  return handleRequest('POST', e);
}

function handleRequest(defaultMethod, e) {
  try {
    const override = (e?.headers?.['x-http-method-override']
      || e?.headers?.['X-HTTP-Method-Override']
      || e?.parameter?._method
      || e?.parameter?.method
      || '')
      .toString()
      .toUpperCase();
    const method = override || defaultMethod;
    const path = normalizePath(e?.pathInfo || '');
    const body = parseBody(e);

    if (method === 'GET' && path === 'users/bootstrap') {
      return jsonResponse({ adminMissing: isAdminMissing() });
    }

    if (method === 'POST' && path === 'users/init-admin') {
      return jsonResponse(initAdmin(body));
    }

    if (method === 'POST' && path === 'users/login') {
      return jsonResponse(loginUser(body));
    }

    if (method === 'GET' && path === 'users/list') {
      const actor = authenticateAdmin(e);
      return jsonResponse(listUsers(actor));
    }

    if (method === 'POST' && path === 'users') {
      const actor = authenticateAdmin(e);
      return jsonResponse(createUser(body, actor));
    }

    if (method === 'PATCH' && path.startsWith('users/')) {
      const actor = authenticateAdmin(e);
      const userId = path.split('/')[1];
      return jsonResponse(updateUser(userId, body, actor));
    }

    return jsonResponse({ message: 'Recurso não encontrado.' }, 404);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Erro interno.';
    return jsonResponse({ message }, status);
  }
}

function normalizePath(raw) {
  if (!raw) {
    return '';
  }
  return raw.replace(/^\/+|\/+$/g, '');
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw httpError(400, 'JSON inválido.');
  }
}

function jsonResponse(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload || {}));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Cache-Control', 'no-store');
  if (statusCode && statusCode !== 200) {
    output.setHeader('X-Status-Code', String(statusCode));
  }
  return output;
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isAdminMissing() {
  const store = loadUsersStore();
  return !store.users.some((user) => user.active !== false && user.role === 'admin');
}

function initAdmin(payload) {
  const store = loadUsersStore();
  const hasAdmin = store.users.some((user) => user.active !== false && user.role === 'admin');
  if (hasAdmin) {
    throw httpError(409, 'Já existe um administrador ativo.');
  }
  const name = sanitizeString(payload?.name);
  const email = normalizeEmail(payload?.email);
  const secret = payload?.secret ? String(payload.secret) : '';
  if (!name || !email || !secret) {
    throw httpError(400, 'Nome, e-mail e senha são obrigatórios.');
  }
  if (store.users.some((user) => user.email === email)) {
    throw httpError(409, 'E-mail já cadastrado.');
  }
  const salt = Utilities.getUuid();
  const hash = computeHash(secret, salt);
  const now = new Date().toISOString();
  const user = {
    id: `usr_${Utilities.getUuid()}`,
    name,
    email,
    role: 'admin',
    active: true,
    salt,
    hash,
    updatedAt: now,
    updatedBy: null,
  };
  user.updatedBy = user.id;
  store.users.push(user);
  saveUsersStore(store);
  return {
    user: redactUser(user),
  };
}

function loginUser(payload) {
  const email = normalizeEmail(payload?.email);
  const secret = payload?.secret ? String(payload.secret) : '';
  if (!email || !secret) {
    throw httpError(400, 'Credenciais obrigatórias.');
  }
  const store = loadUsersStore();
  const user = store.users.find((item) => item.email === email);
  if (!user || user.active === false) {
    throw httpError(401, 'Credenciais inválidas.');
  }
  const computed = computeHash(secret, user.salt);
  if (!constantTimeEquals(computed, user.hash)) {
    throw httpError(401, 'Credenciais inválidas.');
  }
  const token = createToken(user);
  return {
    token,
    role: user.role,
    user: redactUser(user),
  };
}

function listUsers(actor) {
  const store = loadUsersStore();
  return store.users.map((user) => redactUser(user));
}

function createUser(payload, actor) {
  const name = sanitizeString(payload?.name);
  const email = normalizeEmail(payload?.email);
  const role = normalizeRole(payload?.role || 'leitor');
  if (!name || !email) {
    throw httpError(400, 'Nome e e-mail são obrigatórios.');
  }
  if (!role) {
    throw httpError(400, 'Papel inválido.');
  }
  const store = loadUsersStore();
  if (store.users.some((user) => user.email === email)) {
    throw httpError(409, 'E-mail já cadastrado.');
  }
  const newUser = {
    id: `usr_${Utilities.getUuid()}`,
    name,
    email,
    role,
    active: true,
    salt: null,
    hash: null,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.sub,
  };
  validateAdminSingleton([...store.users, newUser]);
  store.users.push(newUser);
  saveUsersStore(store);
  return {
    user: redactUser(newUser),
  };
}

function updateUser(userId, updates, actor) {
  if (!userId) {
    throw httpError(400, 'ID obrigatório.');
  }
  const store = loadUsersStore();
  const index = store.users.findIndex((user) => user.id === userId);
  if (index === -1) {
    throw httpError(404, 'Usuário não encontrado.');
  }
  const user = store.users[index];
  const next = Object.assign({}, user);
  if (updates.hasOwnProperty('role')) {
    const normalized = normalizeRole(updates.role);
    if (!normalized) {
      throw httpError(400, 'Papel inválido.');
    }
    next.role = normalized;
  }
  if (updates.hasOwnProperty('active')) {
    next.active = Boolean(updates.active);
  }
  next.updatedAt = new Date().toISOString();
  next.updatedBy = actor.sub;
  validateAdminSingleton(store.users.map((item) => (item.id === userId ? next : item)));
  store.users[index] = next;
  saveUsersStore(store);
  return {
    user: redactUser(next),
  };
}

function redactUser(user) {
  const { hash, salt, ...rest } = user;
  return rest;
}

function normalizeEmail(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
}

function sanitizeString(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return '';
  }
  const normalized = role.trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  if (['admin', 'operador', 'leitor'].indexOf(normalized) === -1) {
    return '';
  }
  return normalized;
}

function validateAdminSingleton(users) {
  const activeAdmins = users.filter((user) => user.active !== false && user.role === 'admin');
  if (activeAdmins.length !== 1) {
    throw httpError(400, 'É necessário manter exatamente um administrador ativo.');
  }
}

function authenticateAdmin(e) {
  const token = extractToken(e);
  if (!token) {
    throw httpError(401, 'Token ausente.');
  }
  const payload = verifyToken(token);
  if (!payload) {
    throw httpError(401, 'Token inválido ou expirado.');
  }
  if (payload.role !== 'admin') {
    throw httpError(403, 'Somente administradores podem acessar este recurso.');
  }
  return payload;
}

function extractToken(e) {
  const headers = e?.headers || {};
  const authorization = headers.Authorization || headers.authorization || '';
  if (!authorization) {
    return '';
  }
  const parts = authorization.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return '';
}

function createToken(user) {
  const issuedAt = Date.now();
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: issuedAt + TOKEN_EXPIRATION_MINUTES * 60 * 1000,
    iat: issuedAt,
  };
  const payloadBase64 = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payloadBase64, getSigningKeyBytes()));
  return `${payloadBase64}.${signature}`;
}

function verifyToken(token) {
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const payloadBytes = Utilities.base64DecodeWebSafe(parts[0]);
  const signatureBytes = Utilities.base64DecodeWebSafe(parts[1]);
  const expectedSignature = Utilities.computeHmacSha256Signature(parts[0], getSigningKeyBytes());
  if (!byteArrayEquals(signatureBytes, expectedSignature)) {
    return null;
  }
  const payloadText = Utilities.newBlob(payloadBytes).getDataAsString('UTF-8');
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch (error) {
    return null;
  }
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  if (Date.now() > Number(payload.exp || 0)) {
    return null;
  }
  return payload;
}

function getSigningKeyBytes() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('USERS_APP_SECRET');
  if (!secret) {
    secret = Utilities.base64EncodeWebSafe(Utilities.newBlob(Utilities.getUuid()).getBytes());
    props.setProperty('USERS_APP_SECRET', secret);
  }
  return Utilities.base64DecodeWebSafe(secret);
}

function computeHash(secret, salt) {
  const passwordBytes = Utilities.newBlob(secret, 'application/octet-stream').getBytes();
  const saltBytes = Utilities.newBlob(salt, 'application/octet-stream').getBytes();
  const blocks = Math.ceil(PBKDF2_KEY_LENGTH / 32);
  const derived = [];
  for (let blockIndex = 1; blockIndex <= blocks; blockIndex += 1) {
    const blockSalt = saltBytes.concat([
      (blockIndex >> 24) & 0xff,
      (blockIndex >> 16) & 0xff,
      (blockIndex >> 8) & 0xff,
      blockIndex & 0xff,
    ]);
    let u = Utilities.computeHmacSha256Signature(blockSalt, passwordBytes);
    let output = u.slice();
    for (let i = 1; i < PBKDF2_ITERATIONS; i += 1) {
      u = Utilities.computeHmacSha256Signature(u, passwordBytes);
      for (let j = 0; j < output.length; j += 1) {
        output[j] ^= u[j];
      }
    }
    derived.push.apply(derived, output);
  }
  return Utilities.base64EncodeWebSafe(derived.slice(0, PBKDF2_KEY_LENGTH));
}

function constantTimeEquals(value, expected) {
  if (typeof value === 'string' && typeof expected === 'string') {
    return constantTimeEquals(Utilities.base64DecodeWebSafe(value), Utilities.base64DecodeWebSafe(expected));
  }
  if (!value || !expected || value.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < value.length; i += 1) {
    diff |= value[i] ^ expected[i];
  }
  return diff === 0;
}

function byteArrayEquals(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function loadUsersStore() {
  const fileId = getUsersFileId();
  if (!fileId) {
    return { version: SCHEMA_VERSION, users: [] };
  }
  try {
    const blob = Drive.Files.get(fileId, { alt: 'media' });
    let content = '';
    if (typeof blob === 'string') {
      content = blob;
    } else if (blob && typeof blob.getDataAsString === 'function') {
      content = blob.getDataAsString('UTF-8');
    } else {
      content = '';
    }
    const parsed = JSON.parse(content);
    if (!parsed.version) {
      parsed.version = SCHEMA_VERSION;
    }
    if (!Array.isArray(parsed.users)) {
      parsed.users = [];
    }
    return parsed;
  } catch (error) {
    console.error('Falha ao ler usuarios.json', error);
    return { version: SCHEMA_VERSION, users: [] };
  }
}

function saveUsersStore(store) {
  const payload = JSON.stringify(store, null, 2);
  const blob = Utilities.newBlob(payload, 'application/json');
  const fileId = getUsersFileId();
  if (fileId) {
    Drive.Files.update({ name: FILE_NAME }, fileId, blob);
  } else {
    const created = Drive.Files.create({
      name: FILE_NAME,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    }, blob);
    cachedUsersFileId = created.id;
  }
}

function getUsersFileId() {
  if (cachedUsersFileId) {
    return cachedUsersFileId;
  }
  const response = Drive.Files.list({
    q: `name='${FILE_NAME}'`,
    spaces: 'appDataFolder',
    fields: 'files(id,name)',
    pageSize: 1,
  });
  if (response.files && response.files.length > 0) {
    cachedUsersFileId = response.files[0].id;
  }
  return cachedUsersFileId;
}
