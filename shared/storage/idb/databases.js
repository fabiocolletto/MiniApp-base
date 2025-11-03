import { openDB } from '../../vendor/idb.min.js';

const MARCO_CORE_DB_NAME = 'marco_core';
const MARCO_CORE_DB_VERSION = 3;
const PESQUISA_STUDIO_DB_NAME = 'pesquisa_studio';
const PESQUISA_STUDIO_DB_VERSION = 1;

function ensureStore(db, tx, name, options, indexes = []) {
  let store;
  if (db.objectStoreNames.contains(name)) {
    store = tx.objectStore(name);
  } else {
    store = db.createObjectStore(name, options);
  }

  indexes.forEach(({ name: indexName, keyPath, options: indexOptions }) => {
    if (!store.indexNames.contains(indexName)) {
      store.createIndex(indexName, keyPath, indexOptions);
    }
  });

  return store;
}

function setupMarcoCore(db, tx) {
  ensureStore(
    db,
    tx,
    'settings',
    { keyPath: 'key' },
    [{ name: 'by_updated_at', keyPath: 'updatedAt' }],
  );

  ensureStore(
    db,
    tx,
    'user_master',
    { keyPath: 'id' },
    [
      { name: 'by_email', keyPath: 'email', options: { unique: true } },
      { name: 'by_updated_at', keyPath: 'updatedAt' },
    ],
  );

  ensureStore(
    db,
    tx,
    'miniapps_catalog',
    { keyPath: 'id' },
    [{ name: 'by_route', keyPath: 'route', options: { unique: true } }],
  );

  ensureStore(
    db,
    tx,
    'audit_log',
    { keyPath: 'id', autoIncrement: true },
    [
      { name: 'by_ts', keyPath: 'timestamp' },
      { name: 'by_app', keyPath: 'miniappId' },
    ],
  );

  ensureStore(
    db,
    tx,
    'kv_cache',
    { keyPath: 'key' },
    [{ name: 'by_ttl', keyPath: 'expiresAt' }],
  );

  ensureStore(db, tx, 'prefs');

  ensureStore(
    db,
    tx,
    'sync_state',
    { keyPath: 'key' },
    [{ name: 'by_updated_at', keyPath: 'updatedAt' }],
  );
}

function setupPesquisaStudio(db, tx) {
  ensureStore(
    db,
    tx,
    'surveys',
    { keyPath: 'surveyId' },
    [
      { name: 'by_name', keyPath: 'name' },
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_updated', keyPath: 'updatedAt' },
    ],
  );

  ensureStore(
    db,
    tx,
    'flows',
    { keyPath: 'flowId' },
    [
      { name: 'by_survey', keyPath: 'surveyId' },
      { name: 'by_version', keyPath: 'version' },
    ],
  );

  ensureStore(
    db,
    tx,
    'templates',
    { keyPath: 'templateName' },
    [
      { name: 'by_survey', keyPath: 'surveyId' },
      { name: 'by_terminal', keyPath: 'terminalCode' },
    ],
  );

  ensureStore(
    db,
    tx,
    'variants',
    { keyPath: ['surveyId', 'variantId'] },
    [
      { name: 'by_terminal', keyPath: 'terminalCode' },
      { name: 'by_status', keyPath: 'status' },
    ],
  );

  ensureStore(
    db,
    tx,
    'terminals',
    { keyPath: 'terminalCode' },
    [{ name: 'by_city', keyPath: 'cityCode' }],
  );

  ensureStore(
    db,
    tx,
    'presets',
    { keyPath: 'presetId' },
    [{ name: 'by_type', keyPath: 'type' }],
  );

  ensureStore(
    db,
    tx,
    'drafts',
    { keyPath: 'draftId' },
    [{ name: 'by_survey', keyPath: 'surveyId' }],
  );

  ensureStore(
    db,
    tx,
    'exports',
    { keyPath: 'exportId' },
    [
      { name: 'by_survey', keyPath: 'surveyId' },
      { name: 'by_kind', keyPath: 'kind' },
    ],
  );

  ensureStore(
    db,
    tx,
    'runs',
    { keyPath: 'runId' },
    [
      { name: 'by_survey', keyPath: 'surveyId' },
      { name: 'by_terminal', keyPath: 'terminalCode' },
      { name: 'by_ts', keyPath: 'startedAt' },
    ],
  );

  ensureStore(
    db,
    tx,
    'tags',
    { keyPath: 'tag' },
    [{ name: 'surveys_multi', keyPath: 'surveys', options: { multiEntry: true } }],
  );
}

export function openMarcoCore() {
  return openDB(MARCO_CORE_DB_NAME, MARCO_CORE_DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
      setupMarcoCore(db, tx);
    },
  });
}

export function openPesquisaStudio() {
  return openDB(PESQUISA_STUDIO_DB_NAME, PESQUISA_STUDIO_DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
      setupPesquisaStudio(db, tx);
    },
  });
}
