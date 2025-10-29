import {
  appendAuditLog,
  getMiniappsCatalog,
  kvCache,
  setSetting,
  syncMiniappsCatalog,
  upsertUserMaster,
} from './marcocore.js';

const LEGACY_KEYS = {
  settings: 'marco:settings',
  userMaster: 'marco:user_master',
  catalog: 'marco:miniapps_catalog',
  auditLog: 'marco:audit_log',
  kvCache: 'marco:kv_cache',
};

function getLocalStorage(customWindow) {
  const runtimeWindow = customWindow ?? (typeof window !== 'undefined' ? window : undefined);
  if (!runtimeWindow || !runtimeWindow.localStorage) {
    return null;
  }

  try {
    return runtimeWindow.localStorage;
  } catch (error) {
    console.warn('IndexedDB migrate: acesso ao localStorage bloqueado.', error);
    return null;
  }
}

function parseJson(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('IndexedDB migrate: falha ao fazer parse de JSON legado.', error);
    return null;
  }
}

async function migrateSettings(storage) {
  const raw = storage.getItem(LEGACY_KEYS.settings);
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    return false;
  }

  const entries = Object.entries(parsed);
  if (entries.length === 0) {
    return false;
  }

  await Promise.all(entries.map(([key, value]) => setSetting(key, value)));
  storage.removeItem(LEGACY_KEYS.settings);
  return true;
}

async function migrateUserMaster(storage) {
  const raw = storage.getItem(LEGACY_KEYS.userMaster);
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    return false;
  }

  await upsertUserMaster(parsed);
  storage.removeItem(LEGACY_KEYS.userMaster);
  return true;
}

async function migrateCatalog(storage) {
  const raw = storage.getItem(LEGACY_KEYS.catalog);
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { migrated: false, entries: [] };
  }

  const entries = await syncMiniappsCatalog(parsed);
  storage.removeItem(LEGACY_KEYS.catalog);
  return { migrated: entries.length > 0, entries };
}

async function migrateAuditLog(storage) {
  const raw = storage.getItem(LEGACY_KEYS.auditLog);
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return false;
  }

  await Promise.all(parsed.map((entry) => appendAuditLog({ ...entry, source: entry?.source ?? 'legacy-localstorage' })));
  storage.removeItem(LEGACY_KEYS.auditLog);
  return true;
}

async function migrateKvCache(storage) {
  const raw = storage.getItem(LEGACY_KEYS.kvCache);
  const parsed = parseJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    return false;
  }

  const entries = Object.entries(parsed);
  if (entries.length === 0) {
    return false;
  }

  await Promise.all(
    entries.map(([key, value]) => {
      if (!value || typeof value !== 'object') {
        return Promise.resolve();
      }

      const ttl = typeof value.expiresAt === 'number' ? Math.max(0, value.expiresAt - Date.now()) : 0;
      return kvCache.set(key, value.value, ttl);
    }),
  );

  storage.removeItem(LEGACY_KEYS.kvCache);
  return true;
}

export async function migrateLegacyStorage(options = {}) {
  const storage = getLocalStorage(options.window);
  if (!storage) {
    return {
      migrated: false,
      reason: 'storage-unavailable',
      catalog: [],
    };
  }

  const results = {
    settings: false,
    userMaster: false,
    catalog: false,
    auditLog: false,
    kvCache: false,
    errors: [],
    catalogEntries: [],
  };

  try {
    results.settings = await migrateSettings(storage);
  } catch (error) {
    results.errors.push({ key: LEGACY_KEYS.settings, error: error?.message ?? String(error) });
  }

  try {
    results.userMaster = await migrateUserMaster(storage);
  } catch (error) {
    results.errors.push({ key: LEGACY_KEYS.userMaster, error: error?.message ?? String(error) });
  }

  try {
    const catalogResult = await migrateCatalog(storage);
    results.catalog = catalogResult.migrated;
    results.catalogEntries = catalogResult.entries;
  } catch (error) {
    results.errors.push({ key: LEGACY_KEYS.catalog, error: error?.message ?? String(error) });
  }

  try {
    results.auditLog = await migrateAuditLog(storage);
  } catch (error) {
    results.errors.push({ key: LEGACY_KEYS.auditLog, error: error?.message ?? String(error) });
  }

  try {
    results.kvCache = await migrateKvCache(storage);
  } catch (error) {
    results.errors.push({ key: LEGACY_KEYS.kvCache, error: error?.message ?? String(error) });
  }

  const migrated =
    results.settings || results.userMaster || results.catalog || results.auditLog || results.kvCache;

  try {
    await appendAuditLog({
      miniappId: 'marco_core',
      action: 'migration-localstorage-indexeddb',
      status: migrated ? 'completed' : 'skipped',
      details: {
        migratedKeys: Object.keys(results).filter((key) => results[key] === true),
        errorCount: results.errors.length,
      },
    });
  } catch (error) {
    console.warn('IndexedDB migrate: falha ao registrar auditoria da migração.', error);
  }

  return {
    migrated,
    errors: results.errors,
    catalog: results.catalogEntries,
  };
}

export async function ensureCatalogSeed(entries = []) {
  const current = await getMiniappsCatalog();
  if (current.length > 0) {
    return current;
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return current;
  }

  await syncMiniappsCatalog(entries);
  return entries;
}
