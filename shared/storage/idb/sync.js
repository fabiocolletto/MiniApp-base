import { openMarcoCore } from './databases.js';

const STORE_NAME = 'sync_state';
const STATE_KEY = 'google_drive_state';

export const DEFAULT_STATE = Object.freeze({
  enabled: false,
  status: 'disconnected',
  lastSyncAt: null,
  lastError: null,
  lastErrorAt: null,
  deviceId: null,
  files: {},
});

function cloneFiles(files = {}) {
  return Object.keys(files).reduce((acc, key) => {
    const value = files[key];
    acc[key] = value ? { ...value } : value;
    return acc;
  }, {});
}

function cloneState(state = DEFAULT_STATE) {
  return {
    enabled: Boolean(state.enabled),
    status: typeof state.status === 'string' ? state.status : 'disconnected',
    lastSyncAt: state.lastSyncAt ?? null,
    lastError: state.lastError ?? null,
    lastErrorAt: state.lastErrorAt ?? null,
    deviceId: state.deviceId ?? null,
    files: cloneFiles(state.files),
  };
}

function mergeStates(current, partial) {
  const next = {
    ...current,
    ...partial,
    files: cloneFiles(current.files),
  };
  if (partial && typeof partial === 'object' && partial.files) {
    for (const [key, value] of Object.entries(partial.files)) {
      next.files[key] = value ? { ...current.files?.[key], ...value } : value;
    }
  }
  return next;
}

async function readState(db) {
  const record = await db.get(STORE_NAME, STATE_KEY);
  if (!record || typeof record.value !== 'object') {
    return cloneState(DEFAULT_STATE);
  }
  return cloneState(record.value);
}

async function writeState(db, state) {
  const payload = {
    key: STATE_KEY,
    value: cloneState(state),
    updatedAt: new Date().toISOString(),
  };
  await db.put(STORE_NAME, payload);
  return cloneState(payload.value);
}

async function withState(updater) {
  const db = await openMarcoCore();
  try {
    const current = await readState(db);
    const next = cloneState(updater(current));
    return await writeState(db, next);
  } finally {
    db.close();
  }
}

export async function getSyncState() {
  const db = await openMarcoCore();
  try {
    return await readState(db);
  } finally {
    db.close();
  }
}

export async function setSyncState(partial) {
  return withState((current) => mergeStates(current, partial));
}

export async function updateSyncFile(miniappId, partial = {}) {
  if (!miniappId || typeof miniappId !== 'string') {
    throw new Error('O identificador do MiniApp é obrigatório para atualizar o estado de sincronização.');
  }
  return withState((current) => {
    const files = cloneFiles(current.files);
    const existing = files[miniappId] ?? {};
    files[miniappId] = { ...existing, ...partial };
    return {
      ...current,
      files,
    };
  });
}

export async function clearSyncFile(miniappId) {
  if (!miniappId || typeof miniappId !== 'string') {
    throw new Error('O identificador do MiniApp é obrigatório para limpar o estado de sincronização.');
  }
  return withState((current) => {
    const files = cloneFiles(current.files);
    delete files[miniappId];
    return {
      ...current,
      files,
    };
  });
}

export async function getSyncFile(miniappId) {
  const state = await getSyncState();
  return cloneFiles(state.files)[miniappId] ?? null;
}

function generateDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `device-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

export async function ensureDeviceId() {
  const state = await withState((current) => {
    if (current.deviceId) {
      return current;
    }
    return {
      ...current,
      deviceId: generateDeviceId(),
    };
  });
  return state.deviceId;
}

export async function resetSyncState() {
  return withState(() => cloneState(DEFAULT_STATE));
}
