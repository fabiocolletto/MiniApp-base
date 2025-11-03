import { DEFAULTS as DB_DEFAULTS, getPrefs, setPrefs } from '../shared/storage/idb/prefs.js';
import { SUPPORTED_LANGS } from './i18n.js';

export const DEFAULT_PREFS = {
  theme: 'auto',
  lang: 'pt-BR',
  fontScale: 0,
};

const FONT_SCALE_MAP = {
  '-2': 0.875,
  '-1': 0.9375,
  '0': 1,
  '1': 1.125,
  '2': 1.25,
};

let currentPrefs = { ...DEFAULT_PREFS };
let systemThemeMedia;

function normalizeTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }
  return 'auto';
}

function normalizeLang(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    return lang;
  }
  return 'pt-BR';
}

function normalizeFontScale(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.min(2, Math.max(-2, parsed));
}

function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  if (!systemThemeMedia) {
    systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeMedia.addEventListener('change', () => {
      if (currentPrefs.theme === 'auto') {
        applyTheme(currentPrefs.theme);
      }
    });
  }
  return systemThemeMedia.matches ? 'dark' : 'light';
}

function resolveTheme(themePreference) {
  const normalized = normalizeTheme(themePreference);
  if (normalized === 'auto') {
    return getSystemTheme();
  }
  return normalized;
}

export function applyTheme(themePreference) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  const resolvedTheme = resolveTheme(themePreference);
  root.dataset.theme = resolvedTheme;
  root.dataset.prefTheme = themePreference;
}

export function applyLanguage(lang) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  const normalized = normalizeLang(lang);
  root.lang = normalized;
}

export function applyFontScale(fontScale) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  const normalized = normalizeFontScale(fontScale);
  const multiplier = FONT_SCALE_MAP[String(normalized)] ?? 1;
  const percentage = Math.round(multiplier * 100);
  root.style.setProperty('--font-scale', String(multiplier));
  root.style.setProperty('font-size', `${percentage}%`);
}

export function applyPreferences(prefs) {
  if (!prefs) return;
  currentPrefs = {
    theme: normalizeTheme(prefs.theme ?? DEFAULT_PREFS.theme),
    lang: normalizeLang(prefs.lang ?? DEFAULT_PREFS.lang),
    fontScale: normalizeFontScale(prefs.fontScale ?? DEFAULT_PREFS.fontScale),
  };
  applyTheme(currentPrefs.theme);
  applyLanguage(currentPrefs.lang);
  applyFontScale(currentPrefs.fontScale);
}

export function getCurrentPreferences() {
  return { ...currentPrefs };
}

export async function loadPreferences() {
  try {
    const stored = await getPrefs();
    const normalized = {
      theme: normalizeTheme(stored.theme ?? DB_DEFAULTS.theme ?? DEFAULT_PREFS.theme),
      lang: normalizeLang(stored.lang ?? DB_DEFAULTS.lang ?? DEFAULT_PREFS.lang),
      fontScale: normalizeFontScale(stored.fontScale ?? DB_DEFAULTS.fontScale ?? DEFAULT_PREFS.fontScale),
    };
    currentPrefs = normalized;
    return normalized;
  } catch (error) {
    console.warn('Preferências: falha ao carregar IndexedDB, usando padrão.', error);
    currentPrefs = { ...DEFAULT_PREFS };
    return getCurrentPreferences();
  }
}

export async function savePreferences(partial) {
  const payload = {
    ...currentPrefs,
    ...partial,
  };
  payload.theme = normalizeTheme(payload.theme);
  payload.lang = normalizeLang(payload.lang);
  payload.fontScale = normalizeFontScale(payload.fontScale);
  try {
    const result = await setPrefs(payload);
    currentPrefs = {
      theme: normalizeTheme(result.theme),
      lang: normalizeLang(result.lang),
      fontScale: normalizeFontScale(result.fontScale),
    };
    return getCurrentPreferences();
  } catch (error) {
    console.error('Preferências: falha ao salvar no IndexedDB.', error);
    throw error;
  }
}

export function getFontMultiplier(fontScale = 0) {
  const normalized = normalizeFontScale(fontScale);
  return FONT_SCALE_MAP[String(normalized)] ?? 1;
}
