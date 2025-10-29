import { openMarcoCore } from './databases.js';

const STORE_NAME = 'prefs';
const PREFS_KEY = 'ui_prefs';

export const DEFAULTS = Object.freeze({
  theme: 'auto',
  lang: 'pt-BR',
  fontScale: 0,
  density: 'comfort',
  reduceMotion: false,
});

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS));

function normalizeStoredPrefs(value) {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULTS };
  }

  const normalized = { ...DEFAULTS };
  for (const key of Object.keys(value)) {
    if (ALLOWED_KEYS.has(key)) {
      normalized[key] = value[key];
    }
  }

  return normalized;
}

function sanitizePartialPrefs(partial) {
  if (!partial || typeof partial !== 'object') {
    return {};
  }

  const sanitized = {};
  for (const key of Object.keys(partial)) {
    if (ALLOWED_KEYS.has(key)) {
      sanitized[key] = partial[key];
    }
  }
  return sanitized;
}

async function readPrefs(db) {
  const stored = await db.get(STORE_NAME, PREFS_KEY);
  return normalizeStoredPrefs(stored);
}

export async function getPrefs() {
  const db = await openMarcoCore();
  return readPrefs(db);
}

export async function setPrefs(partial) {
  const db = await openMarcoCore();
  const current = await readPrefs(db);
  const next = { ...current, ...sanitizePartialPrefs(partial) };
  await db.put(STORE_NAME, next, PREFS_KEY);
  return next;
}
