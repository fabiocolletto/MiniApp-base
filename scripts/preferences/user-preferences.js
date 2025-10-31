import { DEFAULTS, getPrefs as readPrefs, setPrefs as writePrefs } from '../../shared/storage/idb/prefs.js';

const FONT_SCALE_MAP = new Map([
  [-2, 0.9],
  [-1, 0.95],
  [0, 1],
  [1, 1.1],
  [2, 1.25],
]);

const FONT_SCALE_LABELS = new Map([
  [-2, 'Muito pequeno'],
  [-1, 'Pequeno'],
  [0, 'Padrão'],
  [1, 'Grande'],
  [2, 'Muito grande'],
]);

const LANGUAGE_ALIASES = new Map([
  ['pt', 'pt-BR'],
  ['pt-br', 'pt-BR'],
  ['pt_br', 'pt-BR'],
  ['pt-br-utf8', 'pt-BR'],
  ['en', 'en'],
  ['en-us', 'en'],
  ['en_us', 'en'],
  ['es', 'es'],
  ['es-es', 'es'],
  ['es_es', 'es'],
]);

let currentPrefs = { ...DEFAULTS };
let initialized = false;
const subscribers = new Set();
let themeMediaQuery;
let reduceMotionMediaQuery;

function resolveWindow(customWindow) {
  if (customWindow && typeof customWindow === 'object') {
    return customWindow;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  return undefined;
}

function resolveDocument(customDocument, runtimeWindow = resolveWindow()) {
  if (customDocument && typeof customDocument === 'object') {
    return customDocument;
  }

  if (runtimeWindow && typeof runtimeWindow.document === 'object') {
    return runtimeWindow.document;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  return undefined;
}

function getThemeMediaQuery(runtimeWindow = resolveWindow()) {
  if (!runtimeWindow || typeof runtimeWindow.matchMedia !== 'function') {
    return undefined;
  }

  if (!themeMediaQuery) {
    themeMediaQuery = runtimeWindow.matchMedia('(prefers-color-scheme: dark)');
  }

  return themeMediaQuery;
}

function getReduceMotionMediaQuery(runtimeWindow = resolveWindow()) {
  if (!runtimeWindow || typeof runtimeWindow.matchMedia !== 'function') {
    return undefined;
  }

  if (!reduceMotionMediaQuery) {
    reduceMotionMediaQuery = runtimeWindow.matchMedia('(prefers-reduced-motion: reduce)');
  }

  return reduceMotionMediaQuery;
}

function notifySubscribers() {
  const snapshot = { ...currentPrefs };
  subscribers.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Preferências: falha ao notificar assinante.', error);
    }
  });
}

function sanitizeTheme(value) {
  if (value === 'dark' || value === 'light' || value === 'auto') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'dark' || normalized === 'light') {
      return normalized;
    }
  }

  return 'auto';
}

function sanitizeLang(value) {
  if (typeof value !== 'string') {
    return DEFAULTS.lang;
  }

  const normalized = value.trim();
  if (!normalized) {
    return DEFAULTS.lang;
  }

  const lookupKey = normalized.toLowerCase();
  if (LANGUAGE_ALIASES.has(lookupKey)) {
    return LANGUAGE_ALIASES.get(lookupKey);
  }

  if (LANGUAGE_ALIASES.has(normalized)) {
    return LANGUAGE_ALIASES.get(normalized);
  }

  if (normalized === 'pt-BR' || normalized === 'en' || normalized === 'es') {
    return normalized;
  }

  return DEFAULTS.lang;
}

function sanitizeFontScale(value) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULTS.fontScale;
  }

  return Math.min(2, Math.max(-2, Math.round(parsed)));
}

function sanitizeDensity(value) {
  if (value === 'compact' || value === 'comfort') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'compact' || normalized === 'comfort') {
      return normalized;
    }
  }

  return DEFAULTS.density;
}

function sanitizeReduceMotion(value) {
  if (value === true || value === 'true') {
    return true;
  }

  if (value === 'auto') {
    return 'auto';
  }

  return false;
}

function sanitizePreferences(payload) {
  const base = { ...DEFAULTS };
  if (!payload || typeof payload !== 'object') {
    return base;
  }

  if ('theme' in payload) {
    base.theme = sanitizeTheme(payload.theme);
  }

  if ('lang' in payload) {
    base.lang = sanitizeLang(payload.lang);
  }

  if ('fontScale' in payload) {
    base.fontScale = sanitizeFontScale(payload.fontScale);
  }

  if ('density' in payload) {
    base.density = sanitizeDensity(payload.density);
  }

  if ('reduceMotion' in payload) {
    base.reduceMotion = sanitizeReduceMotion(payload.reduceMotion);
  }

  return base;
}

function sanitizePartialPreferences(payload) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const sanitized = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'theme')) {
    sanitized.theme = sanitizeTheme(payload.theme);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'lang')) {
    sanitized.lang = sanitizeLang(payload.lang);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'fontScale')) {
    sanitized.fontScale = sanitizeFontScale(payload.fontScale);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'density')) {
    sanitized.density = sanitizeDensity(payload.density);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'reduceMotion')) {
    sanitized.reduceMotion = sanitizeReduceMotion(payload.reduceMotion);
  }

  return sanitized;
}

function updateThemeColorMeta(doc) {
  if (!doc || typeof doc.querySelector !== 'function') {
    return;
  }

  const meta = doc.querySelector('meta[name="theme-color"]');
  if (!meta) {
    return;
  }

  const win = doc.defaultView ?? resolveWindow();
  if (!win || typeof win.getComputedStyle !== 'function') {
    return;
  }

  try {
    const styles = win.getComputedStyle(doc.documentElement);
    const background = styles.getPropertyValue('--ac-bg');
    if (background && background.trim()) {
      meta.setAttribute('content', background.trim());
    }
  } catch (error) {
    console.warn('Preferências: não foi possível atualizar a meta theme-color.', error);
  }
}

function applyTheme(prefs, { doc, win }) {
  const runtimeDoc = resolveDocument(doc, win);
  if (!runtimeDoc) {
    return;
  }

  const root = runtimeDoc.documentElement;
  if (!root) {
    return;
  }

  const themePreference = sanitizeTheme(prefs.theme);
  if (themePreference === 'light' || themePreference === 'dark') {
    root.dataset.theme = themePreference;
  } else {
    delete root.dataset.theme;
  }

  updateThemeColorMeta(runtimeDoc);
}

function applyFontScale(prefs, { doc, win }) {
  const runtimeDoc = resolveDocument(doc, win);
  if (!runtimeDoc) {
    return;
  }

  const root = runtimeDoc.documentElement;
  if (!root) {
    return;
  }

  const normalized = sanitizeFontScale(prefs.fontScale);
  const scale = FONT_SCALE_MAP.get(normalized) ?? FONT_SCALE_MAP.get(DEFAULTS.fontScale);
  const token = '--ac-font-scale';
  const style = root.style;

  if (style && typeof style.setProperty === 'function') {
    style.setProperty(token, String(scale));
    return;
  }

  if (style && typeof style === 'object') {
    style[token] = String(scale);
    return;
  }

  if (typeof root.getAttribute === 'function' && typeof root.setAttribute === 'function') {
    const existing = root.getAttribute('style') ?? '';
    const filtered = existing
      .split(';')
      .map((entry) => entry.trim())
      .filter((entry) => entry && !entry.startsWith(`${token}:`));
    filtered.push(`${token}: ${String(scale)}`);
    root.setAttribute('style', `${filtered.join('; ')};`);
  }
}

function applyDensity(prefs, { doc, win }) {
  const runtimeDoc = resolveDocument(doc, win);
  if (!runtimeDoc) {
    return;
  }

  const body = runtimeDoc.body;
  if (!body) {
    return;
  }

  const density = sanitizeDensity(prefs.density);
  body.classList.toggle('density-compact', density === 'compact');
  if (density === 'compact') {
    body.dataset.density = 'compact';
  } else {
    delete body.dataset.density;
  }
}

function resolveReduceMotionPreference(prefs, win) {
  const runtimeWin = resolveWindow(win);
  const mql = getReduceMotionMediaQuery(runtimeWin);
  const systemPrefersReduce = Boolean(mql?.matches);
  const preference = sanitizeReduceMotion(prefs.reduceMotion);

  if (preference === true) {
    return true;
  }

  if (preference === 'auto') {
    return systemPrefersReduce;
  }

  return systemPrefersReduce;
}

function applyReduceMotion(prefs, { doc, win }) {
  const runtimeDoc = resolveDocument(doc, win);
  if (!runtimeDoc) {
    return;
  }

  const shouldReduce = resolveReduceMotionPreference(prefs, win);
  const root = runtimeDoc.documentElement;
  const body = runtimeDoc.body;

  if (root) {
    root.classList.toggle('reduce-motion', shouldReduce);
  }

  if (body) {
    body.classList.toggle('reduce-motion', shouldReduce);
  }
}

function applyLanguage(prefs, { doc, win }) {
  const runtimeDoc = resolveDocument(doc, win);
  if (!runtimeDoc) {
    return;
  }

  const lang = sanitizeLang(prefs.lang);
  runtimeDoc.documentElement.lang = lang;
  runtimeDoc.documentElement.setAttribute('data-lang', lang);
}

function applyPreferences(prefs, options = {}) {
  applyTheme(prefs, options);
  applyFontScale(prefs, options);
  applyDensity(prefs, options);
  applyReduceMotion(prefs, options);
  applyLanguage(prefs, options);
}

function handleSystemThemeChange() {
  if (currentPrefs.theme === 'auto') {
    applyTheme(currentPrefs, {});
    updateThemeColorMeta(resolveDocument());
  }
}

function handleSystemReduceMotionChange() {
  applyReduceMotion(currentPrefs, {});
}

function setupSystemObservers(win) {
  const runtimeWin = resolveWindow(win);
  if (!runtimeWin) {
    return;
  }

  const themeQuery = getThemeMediaQuery(runtimeWin);
  if (themeQuery) {
    const handler = handleSystemThemeChange;
    if (typeof themeQuery.addEventListener === 'function') {
      themeQuery.addEventListener('change', handler);
    } else if (typeof themeQuery.addListener === 'function') {
      themeQuery.addListener(handler);
    }
  }

  const reduceQuery = getReduceMotionMediaQuery(runtimeWin);
  if (reduceQuery) {
    const handler = handleSystemReduceMotionChange;
    if (typeof reduceQuery.addEventListener === 'function') {
      reduceQuery.addEventListener('change', handler);
    } else if (typeof reduceQuery.addListener === 'function') {
      reduceQuery.addListener(handler);
    }
  }
}

export function getCurrentPreferences() {
  return { ...currentPrefs };
}

export function getFontScaleLabel(value) {
  const sanitized = sanitizeFontScale(value);
  return FONT_SCALE_LABELS.get(sanitized) ?? FONT_SCALE_LABELS.get(DEFAULTS.fontScale);
}

export async function loadUserPreferences(options = {}) {
  const runtimeWin = resolveWindow(options.window);
  const runtimeDoc = resolveDocument(options.document, runtimeWin);

  if (!initialized) {
    currentPrefs = { ...DEFAULTS };
    applyPreferences(currentPrefs, { doc: runtimeDoc, win: runtimeWin });
    setupSystemObservers(runtimeWin);
    initialized = true;
  }

  try {
    const stored = await readPrefs();
    currentPrefs = sanitizePreferences(stored);
    applyPreferences(currentPrefs, { doc: runtimeDoc, win: runtimeWin });
    notifySubscribers();
  } catch (error) {
    console.error('Preferências: não foi possível carregar dados do IndexedDB.', error);
  }

  return { ...currentPrefs };
}

export async function updateUserPreferences(partial, options = {}) {
  const runtimeWin = resolveWindow(options.window);
  const runtimeDoc = resolveDocument(options.document, runtimeWin);

  const sanitizedPartial = sanitizePartialPreferences(partial);
  if (Object.keys(sanitizedPartial).length === 0) {
    return { ...currentPrefs };
  }

  const next = sanitizePreferences({ ...currentPrefs, ...sanitizedPartial });
  currentPrefs = next;
  applyPreferences(currentPrefs, { doc: runtimeDoc, win: runtimeWin });
  notifySubscribers();

  try {
    await writePrefs(sanitizedPartial);
  } catch (error) {
    console.error('Preferências: falha ao salvar no IndexedDB.', error);
  }

  return { ...currentPrefs };
}

export function subscribeUserPreferences(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  subscribers.add(listener);

  try {
    listener({ ...currentPrefs });
  } catch (error) {
    console.error('Preferências: falha ao inicializar assinante.', error);
  }

  return () => {
    subscribers.delete(listener);
  };
}
