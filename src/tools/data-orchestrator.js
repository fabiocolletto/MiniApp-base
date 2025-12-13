// src/tools/data-orchestrator.js
// DataOrchestrator unificado com camada de persistência (Dexie + fallback)
// Este arquivo é o ÚNICO ponto de entrada, manutenção e persistência de dados do app

import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@4.0.8/dist/dexie.mjs';

/* =============================
   STORAGE ENGINE (interna)
   ============================= */
const StorageEngine = {
  db: null,

  init() {
    if (this.db) return this.db;

    this.db = new Dexie('pwao_db');
    this.db.version(1).stores({
      store: '&key'
    });

    return this.db;
  },

  async load() {
    try {
      this.init();
      const row = await this.db.store.get('main');
      return row?.value || null;
    } catch (e) {
      console.warn('[StorageEngine] Falha Dexie, tentando localStorage', e);
      const raw = localStorage.getItem('pwao_store');
      return raw ? JSON.parse(raw) : null;
    }
  },

  async save(store) {
    try {
      this.init();
      await this.db.store.put({ key: 'main', value: store });
    } catch (e) {
      console.warn('[StorageEngine] Falha Dexie, salvando em localStorage', e);
      localStorage.setItem('pwao_store', JSON.stringify(store));
    }
  }
};

/* =============================
   DATA ORCHESTRATOR
   ============================= */
export const DataOrchestrator = {

  SCHEMA_VERSION: 1,
  initialized: false,

  store: {
    meta: {
      schemaVersion: 1,
      createdAt: null,
      updatedAt: null
    },
    device: {
      deviceId: null,
      firstSeenAt: null,
      lastSeenAt: null
    },
    user: {},
    finance: {
      expense: { single: [], recurring: [] },
      income: { single: [], recurring: [] }
    },
    health: {},
    education: {}
  },

  async init() {
    if (this.initialized) return;

    const loaded = await StorageEngine.load();
    if (loaded) this.migrate(loaded);

    this.initDevice();
    this.initialized = true;
  },

  initDevice() {
    let id = localStorage.getItem('pwao_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('pwao_device_id', id);
      this.store.device.firstSeenAt = Date.now();
    }
    this.store.device.deviceId = id;
    this.store.device.lastSeenAt = Date.now();
  },

  migrate(oldStore) {
    const from = oldStore?.meta?.schemaVersion || 0;

    if (from < 1) {
      oldStore.device ||= { deviceId: null, firstSeenAt: null, lastSeenAt: null };
    }

    oldStore.meta.schemaVersion = this.SCHEMA_VERSION;
    this.store = oldStore;
  },

  persist() {
    this.store.meta.updatedAt = Date.now();
    StorageEngine.save(this.store);
  },

  dispatch({ action, collection, payload, recordId, meta }) {
    this.apply(action, collection, payload, recordId);
    this.persist();
  },

  apply(action, collection, payload, recordId) {
    const path = collection.split('.');
    let target = this.store;
    path.forEach(p => target = target[p]);

    if (!Array.isArray(target)) return;

    if (action === 'create') {
      target.push({ id: Date.now(), ...payload });
    }

    if (action === 'update') {
      const item = target.find(i => i.id === recordId);
      if (item) Object.assign(item, payload);
    }

    if (action === 'delete') {
      const index = target.findIndex(i => i.id === recordId);
      if (index > -1) target.splice(index, 1);
    }
  }
};

// Inicialização automática
DataOrchestrator.init();

/* =============================
   CONTRATO DE USO
   ============================= */
// DataOrchestrator.dispatch({
//   action: 'create',
//   collection: 'finance.expense.single',
//   payload: { value: 120, category: 'Alimentação' }
// })
