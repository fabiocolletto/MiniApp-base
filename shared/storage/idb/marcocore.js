import { openMarcoCore } from './databases.js';

const SETTINGS_STORE = 'settings';
const USER_MASTER_STORE = 'user_master';
const MINIAPPS_CATALOG_STORE = 'miniapps_catalog';
const AUDIT_LOG_STORE = 'audit_log';
const KV_CACHE_STORE = 'kv_cache';

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openMarcoCore();
  }
  return dbPromise;
}

function normalizeKey(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
}

function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

async function runStoreTransaction(storeName, mode, handler) {
  const db = await getDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await handler(store, tx);
  await tx.done.catch((error) => {
    throw error;
  });
  return result;
}

export async function getSetting(key) {
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) {
    return null;
  }

  const db = await getDb();
  const record = await db.get(SETTINGS_STORE, normalizedKey);
  return record ? record.value ?? null : null;
}

export async function setSetting(key, value) {
  const normalizedKey = normalizeKey(key);
  if (!normalizedKey) {
    throw new Error('A chave da configuração não pode ser vazia.');
  }

  const payload = {
    key: normalizedKey,
    value,
    updatedAt: new Date().toISOString(),
  };

  await runStoreTransaction(SETTINGS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function getUserMaster({ id, email } = {}) {
  const db = await getDb();

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail) {
      const record = await db.getFromIndex(USER_MASTER_STORE, 'by_email', normalizedEmail);
      return record ?? null;
    }
  }

  const normalizedId = id != null ? String(id).trim() : '';
  if (normalizedId) {
    const record = await db.get(USER_MASTER_STORE, normalizedId);
    return record ?? null;
  }

  const all = await db.getAll(USER_MASTER_STORE);
  return Array.isArray(all) && all.length > 0 ? all[0] : null;
}

export async function upsertUserMaster(user) {
  if (!user || typeof user !== 'object') {
    throw new Error('Dados de usuário inválidos para upsert.');
  }

  const id = user.id != null ? String(user.id).trim() : '';
  if (!id) {
    throw new Error('O usuário mestre precisa de um identificador.');
  }

  const email = normalizeEmail(user.email ?? '');
  const now = new Date().toISOString();
  const payload = {
    ...user,
    id,
    email: email || undefined,
    updatedAt: now,
  };

  await runStoreTransaction(USER_MASTER_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function getMiniappsCatalog() {
  const db = await getDb();
  const entries = await db.getAll(MINIAPPS_CATALOG_STORE);
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .slice()
    .sort((a, b) => {
      const nameA = typeof a?.name === 'string' ? a.name.trim() : '';
      const nameB = typeof b?.name === 'string' ? b.name.trim() : '';
      return nameA.localeCompare(nameB, 'pt-BR');
    });
}

function normalizeCatalogEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : null;
  if (!id) {
    return null;
  }

  const route = typeof entry.route === 'string' && entry.route.trim() ? entry.route.trim() : `/${id}`;
  const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : id;

  return {
    ...entry,
    id,
    route,
    name,
    syncedAt: new Date().toISOString(),
  };
}

export async function syncMiniappsCatalog(entries = []) {
  const normalizedEntries = Array.isArray(entries)
    ? entries.map((entry) => normalizeCatalogEntry(entry)).filter((entry) => entry !== null)
    : [];

  await runStoreTransaction(MINIAPPS_CATALOG_STORE, 'readwrite', async (store) => {
    await store.clear();
    await Promise.all(normalizedEntries.map((entry) => store.put(entry)));
  });

  return normalizedEntries;
}

export async function appendAuditLog(entry) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Entrada de auditoria inválida.');
  }

  const timestamp = typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp)
    ? entry.timestamp
    : Date.now();

  const payload = {
    ...entry,
    timestamp,
    createdAt: new Date(timestamp).toISOString(),
  };

  await runStoreTransaction(AUDIT_LOG_STORE, 'readwrite', (store) => store.add(payload));
  return payload;
}

export async function listAuditLog({ limit = 50, miniappId } = {}) {
  const db = await getDb();
  let records;

  if (miniappId) {
    records = await db.getAllFromIndex(AUDIT_LOG_STORE, 'by_app', miniappId);
  } else {
    records = await db.getAllFromIndex(AUDIT_LOG_STORE, 'by_ts');
  }

  if (!Array.isArray(records)) {
    return [];
  }

  const sorted = records
    .slice()
    .sort((a, b) => {
      const tsA = typeof a?.timestamp === 'number' ? a.timestamp : 0;
      const tsB = typeof b?.timestamp === 'number' ? b.timestamp : 0;
      return tsB - tsA;
    });

  return sorted.slice(0, Math.max(0, limit));
}

async function purgeExpiredCache(now = Date.now()) {
  if (typeof IDBKeyRange === 'undefined') {
    return;
  }

  await runStoreTransaction(KV_CACHE_STORE, 'readwrite', async (store) => {
    const range = IDBKeyRange.upperBound(now);
    const index = store.index('by_ttl');
    const expired = await index.getAll(range);
    if (!Array.isArray(expired) || expired.length === 0) {
      return;
    }

    await Promise.all(
      expired
        .map((record) => record?.key)
        .filter((key) => typeof key === 'string' && key)
        .map((key) => store.delete(key)),
    );
  });
}

async function readCacheEntry(key) {
  const db = await getDb();
  return db.get(KV_CACHE_STORE, key);
}

export const kvCache = {
  async get(key) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
      return null;
    }

    await purgeExpiredCache();
    const record = await readCacheEntry(normalizedKey);

    if (!record) {
      return null;
    }

    if (typeof record.expiresAt === 'number' && record.expiresAt > 0 && record.expiresAt <= Date.now()) {
      await runStoreTransaction(KV_CACHE_STORE, 'readwrite', (store) => store.delete(normalizedKey));
      return null;
    }

    return record.value ?? null;
  },

  async set(key, value, ttlMs = 0) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
      throw new Error('A chave do cache não pode ser vazia.');
    }

    const safeTtl = Number.isFinite(ttlMs) ? Math.max(0, Math.floor(ttlMs)) : 0;
    const now = Date.now();
    const expiresAt = safeTtl > 0 ? now + safeTtl : null;

    const payload = {
      key: normalizedKey,
      value,
      storedAt: new Date(now).toISOString(),
      expiresAt,
    };

    await runStoreTransaction(KV_CACHE_STORE, 'readwrite', (store) => store.put(payload));
    return payload;
  },
};

export async function resetMarcoCore() {
  const db = await getDb();
  const tx = db.transaction(
    [SETTINGS_STORE, USER_MASTER_STORE, MINIAPPS_CATALOG_STORE, AUDIT_LOG_STORE, KV_CACHE_STORE],
    'readwrite',
  );

  const storeNames = Array.from(tx.raw.objectStoreNames ?? []);
  await Promise.all(storeNames.map((storeName) => tx.objectStore(storeName).clear()));
  await tx.done;
}
