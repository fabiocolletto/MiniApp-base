// src/tools/data-orchestrator.js
// DataOrchestrator unificado com camada de persistência (Dexie + fallback)
// Este arquivo é o ÚNICO ponto de entrada, manutenção e persistência de dados do app

import Dexie from '../vendor/dexie.mjs';

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
      if (row?.value) return row.value;
      const raw = localStorage.getItem('pwao_store');
      return raw ? JSON.parse(raw) : null;
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

const DEFAULT_DATA = {
  user: {
    profile: [
      {
        id: 'profile-anon',
        name: 'Convidado',
        role: 'anonymous'
      }
    ]
  },
  finance: {
    income: {
      single: [
        {
          id: 'income-sample',
          value: 500,
          category: 'Receita inicial',
          description: 'Exemplo de entrada',
          createdAt: null
        }
      ],
      recurring: []
    },
    expense: {
      single: [
        {
          id: 'expense-sample',
          value: 120,
          category: 'Alimentação',
          description: 'Exemplo de saída',
          createdAt: null
        }
      ],
      recurring: []
    }
  },
  education: {},
  health: {}
};

/* =============================
   DATA ORCHESTRATOR
   ============================= */
export const DataOrchestrator = {

  SCHEMA_VERSION: 1,
  initialized: false,
  initPromise: null,
  isFreshInstall: false,

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
    user: { profile: [] },
    finance: {
      expense: { single: [], recurring: [] },
      income: { single: [], recurring: [] }
    },
    health: {},
    education: {}
  },

  async init({ seedIfFresh = false } = {}) {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const loaded = await StorageEngine.load();
      this.isFreshInstall = !loaded;
      if (loaded) this.migrate(loaded);

      this.store.meta.createdAt ||= Date.now();
      this.initDevice();

      if (seedIfFresh && this.isFreshInstall) {
        this.seedDefaults();
        await this.persist();
      }

      this.initialized = true;
    })();

    return this.initPromise;
  },

  getPrimaryProfile() {
    return this.store?.user?.profile?.[0] || null;
  },

  isProfileMissingName() {
    const profile = this.getPrimaryProfile();
    return !!profile?.id && (!profile?.name || profile.name.trim() === '');
  },

  async upsertProfile({ recordId, data } = {}) {
    await this.init();

    const profiles = this.resolveCollection('user.profile', { createIfMissing: true });
    const now = Date.now();
    const id = recordId || profiles[0]?.id || this.store.device?.deviceId || crypto.randomUUID();
    const existing = profiles.find((entry) => entry.id === id) || profiles[0];

    if (existing) {
      Object.assign(existing, data, { id, updatedAt: now });
      await this.persist();
      return existing;
    }

    const entry = { id, createdAt: now, ...data };
    profiles.unshift(entry);
    await this.persist();
    return entry;
  },

  async hasLocalData() {
    const stored = await StorageEngine.load();
    return !!stored;
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

    oldStore.user ||= {};
    oldStore.user.profile ||= [];

    oldStore.meta.schemaVersion = this.SCHEMA_VERSION;
    this.store = oldStore;
  },

  seedDefaults() {
    const now = Date.now();

    if (!this.store.meta.createdAt) this.store.meta.createdAt = now;
    this.store.meta.updatedAt ||= now;

    if (!this.store.device.firstSeenAt) this.store.device.firstSeenAt = now;

    if (!this.store.user.profile?.length) {
      this.store.user.profile = DEFAULT_DATA.user.profile.map(entry => ({
        ...entry,
        createdAt: now
      }));
    }

    if (!this.store.finance.income.single.length) {
      this.store.finance.income.single = DEFAULT_DATA.finance.income.single.map(entry => ({
        ...entry,
        createdAt: entry.createdAt || now
      }));
    }

    if (!this.store.finance.expense.single.length) {
      this.store.finance.expense.single = DEFAULT_DATA.finance.expense.single.map(entry => ({
        ...entry,
        createdAt: entry.createdAt || now
      }));
    }
  },

  async persist() {
    this.store.meta.updatedAt = Date.now();
    await StorageEngine.save(this.store);
  },

  resolveCollection(collection, { createIfMissing = false } = {}) {
    const path = collection.split('.');
    let target = this.store;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];

      if (target[key] === undefined) {
        if (!createIfMissing) return undefined;
        target[key] = i === path.length - 1 ? [] : {};
      }

      target = target[key];
    }

    return target;
  },

  getCollection(collection) {
    return this.resolveCollection(collection, { createIfMissing: false });
  },

  async getPersistedCollection(collection) {
    const stored = await StorageEngine.load();
    const source = stored || this.store;
    return collection.split('.').reduce((acc, key) => acc?.[key], source);
  },

  async dispatch({ action, collection, payload, recordId, meta }) {
    await this.init();
    const result = this.apply(action, collection, payload, recordId, meta);
    await this.persist();
    return result;
  },

  apply(action, collection, payload, recordId) {
    const target = this.resolveCollection(collection, { createIfMissing: action === 'create' });

    if (!Array.isArray(target)) return null;

    if (action === 'create') {
      const id = recordId || crypto.randomUUID();
      const entry = { id, ...payload };
      target.push(entry);
      return entry;
    }

    if (action === 'update') {
      const item = target.find(i => i.id === recordId);
      if (item) Object.assign(item, payload);
      return item || null;
    }

    if (action === 'delete') {
      const index = target.findIndex(i => i.id === recordId);
      if (index > -1) target.splice(index, 1);
      return index > -1;
    }

    return null;
  }
};

/* =============================
   CONTRATO DE USO
   ============================= */
// DataOrchestrator.dispatch({
//   action: 'create',
//   collection: 'finance.expense.single',
//   payload: { value: 120, category: 'Alimentação' }
// })
