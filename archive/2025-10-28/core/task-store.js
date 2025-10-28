import { logError, logInfo, logWarn } from '../sys/tools/log.js';

const DB_NAME = 'miniapp_tasks_v1';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const SEED_FLAG_STORAGE_KEY = `miniapp_tasks_seeded_v${DB_VERSION}`;

let seedFlagReadWarningLogged = false;
let seedFlagWriteWarningLogged = false;

const TASK_STATUS_VALUES = ['backlog', 'in-progress', 'review', 'blocked', 'done'];
const TASK_PRIORITY_VALUES = ['high', 'medium', 'low'];

function resolveSeedFlagStorage() {
  if (typeof globalThis !== 'object' || !globalThis) {
    return null;
  }

  const storage = globalThis.localStorage;
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    return null;
  }

  return storage;
}

function readPersistentSeedFlag() {
  const storage = resolveSeedFlagStorage();
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(SEED_FLAG_STORAGE_KEY) === '1';
  } catch (error) {
    if (!seedFlagReadWarningLogged) {
      seedFlagReadWarningLogged = true;
      logWarn('task-store.seed.flag.read', 'Não foi possível verificar o marcador persistente de seed.', error);
    }
    return false;
  }
}

function persistSeedFlag() {
  const storage = resolveSeedFlagStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(SEED_FLAG_STORAGE_KEY, '1');
  } catch (error) {
    if (!seedFlagWriteWarningLogged) {
      seedFlagWriteWarningLogged = true;
      logWarn('task-store.seed.flag.write', 'Não foi possível registrar o marcador persistente de seed.', error);
    }
  }
}

const useMemoryStore = typeof indexedDB === 'undefined';
const memoryTasks = [];
let openPromise;
let seededDefaults = readPersistentSeedFlag();
let cachedTasks = [];

const listeners = new Set();

function generateTaskId() {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeStatus(value, fallback = 'backlog') {
  const normalized = normalizeText(value, fallback).toLowerCase();
  return TASK_STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

function normalizePriority(value, fallback = 'medium') {
  const normalized = normalizeText(value, fallback).toLowerCase();
  return TASK_PRIORITY_VALUES.includes(normalized) ? normalized : fallback;
}

function normalizeDateOnly(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeDateTime(value, fallback = null) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
}

function normalizeChecklist(list, fallback = []) {
  if (!Array.isArray(list)) {
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  return list
    .map((item) => {
      const label = normalizeText(item?.label);
      if (!label) {
        return null;
      }

      return { label, done: Boolean(item?.done) };
    })
    .filter(Boolean);
}

function normalizeActivities(list, fallback = []) {
  if (!Array.isArray(list)) {
    return Array.isArray(fallback) ? fallback.slice() : [];
  }

  return list
    .map((item) => {
      const label = normalizeText(item?.label);
      if (!label) {
        return null;
      }

      const at = normalizeDateTime(item?.at);
      return at ? { label, at } : { label, at: null };
    })
    .filter(Boolean);
}

function normalizeTags(value, fallback = []) {
  if (Array.isArray(value)) {
    return value
      .map((tag) => normalizeText(tag))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => normalizeText(tag))
      .filter(Boolean);
  }

  return Array.isArray(fallback) ? fallback.slice() : [];
}

function cloneTask(task) {
  return {
    ...task,
    owner: task.owner
      ? {
          name: task.owner.name,
          role: task.owner.role,
        }
      : { name: '', role: '' },
    checklist: Array.isArray(task.checklist) ? task.checklist.map((item) => ({ ...item })) : [],
    activity: Array.isArray(task.activity) ? task.activity.map((item) => ({ ...item })) : [],
    tags: Array.isArray(task.tags) ? task.tags.slice() : [],
  };
}

function ensureObjectStore(db, name, options) {
  if (!db.objectStoreNames.contains(name)) {
    db.createObjectStore(name, options);
  }
}

function resetOpenPromise() {
  openPromise = undefined;
}

async function openTaskDatabase() {
  if (useMemoryStore) {
    return Promise.reject(new Error('IndexedDB indisponível no ambiente atual.'));
  }

  if (!openPromise) {
    openPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        ensureObjectStore(db, TASKS_STORE, { keyPath: 'id' });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao abrir IndexedDB de tarefas.');
        logError('task-store.open.error', 'Não foi possível abrir o banco de tarefas.', error);
        resetOpenPromise();
        reject(error);
      };

      request.onblocked = () => {
        logWarn('task-store.open.blocked', 'Abertura do banco de tarefas bloqueada por outra sessão.');
      };
    });
  }

  return openPromise;
}

function notifyListeners() {
  const snapshot = cachedTasks.map((task) => cloneTask(task));
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      logError('task-store.listener.error', 'Erro ao notificar alteração de tarefas.', error);
    }
  });
}

async function readAllTasks() {
  if (useMemoryStore) {
    cachedTasks = memoryTasks.map((task) => cloneTask(task));
    return cachedTasks;
  }

  try {
    const db = await openTaskDatabase();

    const records = await new Promise((resolve, reject) => {
      const transaction = db.transaction(TASKS_STORE, 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = Array.isArray(request.result) ? request.result : [];
        resolve(result);
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao carregar tarefas.');
        logError('task-store.read.error', 'Falha ao listar tarefas salvas.', error);
        reject(error);
      };
    });

    cachedTasks = records
      .filter((record) => record && typeof record.id === 'string')
      .map((record) => ({
        ...record,
        owner: record.owner
          ? {
              name: normalizeText(record.owner.name),
              role: normalizeText(record.owner.role),
            }
          : { name: '', role: '' },
        checklist: normalizeChecklist(record.checklist),
        activity: normalizeActivities(record.activity),
        tags: normalizeTags(record.tags),
      }));

    return cachedTasks;
  } catch (error) {
    logError('task-store.read.fallback', 'Erro inesperado ao listar tarefas.', error);
    cachedTasks = [];
    return cachedTasks;
  }
}

function buildOwner(input, fallback) {
  const name = normalizeText(input?.name, fallback?.name ?? '');
  const role = normalizeText(input?.role, fallback?.role ?? '');

  if (!name && !role) {
    return { name: fallback?.name ?? '', role: fallback?.role ?? '' };
  }

  return { name, role };
}

function sanitizeTaskForCreate(input, options = {}) {
  const now = new Date();
  const nowIso = now.toISOString();

  const id = normalizeText(input?.id) || generateTaskId();
  const dueDate = normalizeDateOnly(input?.dueDate);
  const lastUpdate = options.useProvidedLastUpdate
    ? normalizeDateTime(input?.lastUpdate, nowIso)
    : nowIso;

  const createdAt = options.createdAt ? normalizeDateTime(options.createdAt, nowIso) : nowIso;

  return {
    id,
    title: normalizeText(input?.title, 'Tarefa sem título'),
    status: normalizeStatus(input?.status),
    priority: normalizePriority(input?.priority),
    dueDate,
    lastUpdate,
    owner: buildOwner(input?.owner, {}),
    summary: normalizeText(input?.summary),
    description: normalizeText(input?.description),
    checklist: normalizeChecklist(input?.checklist),
    activity: normalizeActivities(input?.activity),
    tags: normalizeTags(input?.tags),
    focus: normalizeText(input?.focus),
    progress: Number.isFinite(input?.progress) ? Math.min(100, Math.max(0, Math.round(input.progress))) : 0,
    createdAt,
    updatedAt: nowIso,
  };
}

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

function sanitizeTaskForUpdate(existing, updates) {
  if (!existing || typeof existing !== 'object' || typeof existing.id !== 'string') {
    throw new Error('Registro de tarefa inválido para atualização.');
  }

  const nowIso = new Date().toISOString();
  const hasTitle = hasOwnProperty(updates, 'title');
  const hasStatus = hasOwnProperty(updates, 'status');
  const hasPriority = hasOwnProperty(updates, 'priority');
  const hasDueDate = hasOwnProperty(updates, 'dueDate');
  const hasOwner = hasOwnProperty(updates, 'owner');
  const hasSummary = hasOwnProperty(updates, 'summary');
  const hasDescription = hasOwnProperty(updates, 'description');
  const hasChecklist = hasOwnProperty(updates, 'checklist');
  const hasActivity = hasOwnProperty(updates, 'activity');
  const hasTags = hasOwnProperty(updates, 'tags');
  const hasFocus = hasOwnProperty(updates, 'focus');
  const hasProgress = hasOwnProperty(updates, 'progress');

  return {
    ...existing,
    title: hasTitle ? normalizeText(updates?.title, 'Tarefa sem título') : existing.title,
    status: hasStatus ? normalizeStatus(updates?.status, existing.status) : existing.status,
    priority: hasPriority ? normalizePriority(updates?.priority, existing.priority) : existing.priority,
    dueDate: hasDueDate ? normalizeDateOnly(updates?.dueDate) : existing.dueDate ?? null,
    lastUpdate: nowIso,
    owner: hasOwner ? buildOwner(updates?.owner, existing.owner) : existing.owner,
    summary: hasSummary ? normalizeText(updates?.summary) : existing.summary,
    description: hasDescription ? normalizeText(updates?.description) : existing.description,
    checklist: hasChecklist
      ? normalizeChecklist(updates?.checklist, existing.checklist)
      : existing.checklist,
    activity: hasActivity
      ? normalizeActivities(updates?.activity, existing.activity)
      : existing.activity,
    tags: hasTags ? normalizeTags(updates?.tags, existing.tags) : existing.tags,
    focus: hasFocus ? normalizeText(updates?.focus) : existing.focus,
    progress: hasProgress
      ? Math.min(100, Math.max(0, Math.round(Number(updates?.progress))))
      : existing.progress ?? 0,
    updatedAt: nowIso,
  };
}

async function writeTask(record) {
  if (useMemoryStore) {
    const index = memoryTasks.findIndex((task) => task.id === record.id);
    if (index === -1) {
      memoryTasks.push(cloneTask(record));
    } else {
      memoryTasks[index] = cloneTask(record);
    }
    cachedTasks = memoryTasks.map((task) => cloneTask(task));
    notifyListeners();
    return record.id;
  }

  const db = await openTaskDatabase();

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(TASKS_STORE, 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    const request = store.put(record);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      const error = request.error || new Error('Erro ao salvar tarefa.');
      reject(error);
    };
  });

  await readAllTasks();
  notifyListeners();
  return record.id;
}

async function removeTaskFromStore(id) {
  if (useMemoryStore) {
    const index = memoryTasks.findIndex((task) => task.id === id);
    if (index !== -1) {
      memoryTasks.splice(index, 1);
      cachedTasks = memoryTasks.map((task) => cloneTask(task));
    }
    notifyListeners();
    return;
  }

  const db = await openTaskDatabase();

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(TASKS_STORE, 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      const error = request.error || new Error('Erro ao remover tarefa.');
      reject(error);
    };
  });

  await readAllTasks();
  notifyListeners();
}

export async function listTasks() {
  const tasks = await readAllTasks();
  return tasks.map((task) => cloneTask(task));
}

export async function getTaskById(id) {
  const taskId = normalizeText(id);
  if (!taskId) {
    return null;
  }

  if (useMemoryStore) {
    const task = memoryTasks.find((record) => record.id === taskId);
    return task ? cloneTask(task) : null;
  }

  try {
    const db = await openTaskDatabase();

    const record = await new Promise((resolve, reject) => {
      const transaction = db.transaction(TASKS_STORE, 'readonly');
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.get(taskId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        const error = request.error || new Error('Erro ao localizar tarefa.');
        reject(error);
      };
    });

    if (!record || typeof record !== 'object') {
      return null;
    }

    return cloneTask(record);
  } catch (error) {
    logError('task-store.get.error', 'Falha ao carregar tarefa pelo identificador.', error);
    return null;
  }
}

export async function createTask(input) {
  const record = sanitizeTaskForCreate(input);
  await writeTask(record);
  logInfo('task-store.create', `Tarefa "${record.title}" criada.`);
  return record.id;
}

export async function updateTask(id, updates) {
  const taskId = normalizeText(id);
  if (!taskId) {
    throw new Error('Identificador da tarefa não informado.');
  }

  const existing = cachedTasks.find((task) => task.id === taskId) || (await getTaskById(taskId));
  if (!existing) {
    throw new Error('Tarefa não encontrada.');
  }

  const record = sanitizeTaskForUpdate(existing, updates);
  await writeTask(record);
  logInfo('task-store.update', `Tarefa "${record.title}" atualizada.`);
  return record.id;
}

export async function removeTask(id) {
  const taskId = normalizeText(id);
  if (!taskId) {
    throw new Error('Identificador da tarefa não informado.');
  }

  await removeTaskFromStore(taskId);
  logInfo('task-store.remove', `Tarefa "${taskId}" removida.`);
}

export async function seedTaskStore(defaultTasks = []) {
  if (seededDefaults) {
    return;
  }

  const existing = await listTasks();
  if (existing.length > 0) {
    seededDefaults = true;
    persistSeedFlag();
    return;
  }

  if (!Array.isArray(defaultTasks) || defaultTasks.length === 0) {
    seededDefaults = true;
    persistSeedFlag();
    return;
  }

  const normalized = defaultTasks
    .map((task) => {
      try {
        return sanitizeTaskForCreate(task, {
          useProvidedLastUpdate: true,
          createdAt: task?.createdAt ?? task?.lastUpdate,
        });
      } catch (error) {
        logWarn('task-store.seed.skip', 'Registro de tarefa padrão ignorado por dados inválidos.');
        return null;
      }
    })
    .filter(Boolean);

  for (const record of normalized) {
    await writeTask(record);
  }

  seededDefaults = true;
  persistSeedFlag();
  logInfo('task-store.seed', `Tarefas padrão carregadas (${normalized.length}).`);
}

export function subscribeTasks(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);

  if (cachedTasks.length > 0) {
    try {
      listener(cachedTasks.map((task) => cloneTask(task)));
    } catch (error) {
      logError('task-store.listener.initial', 'Erro ao entregar snapshot inicial de tarefas.', error);
    }
  }

  return () => {
    listeners.delete(listener);
  };
}

export function getTaskStoreMetadata() {
  return {
    name: DB_NAME,
    version: DB_VERSION,
    stores: [TASKS_STORE],
  };
}

export const TASK_STATUS_OPTIONS = TASK_STATUS_VALUES.slice();
export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY_VALUES.slice();
