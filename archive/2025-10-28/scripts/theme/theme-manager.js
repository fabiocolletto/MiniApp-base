import eventBus from '../events/event-bus.js';

const THEME_STORAGE_KEY = 'miniapp:theme-preference';
const VALID_THEME_PREFERENCES = ['light', 'dark', 'system'];

let currentPreference = 'system';
let resolvedTheme = 'light';
const subscribers = new Set();
let systemMediaQuery = null;
let initialized = false;

function getDocumentRoot() {
  if (typeof document === 'undefined') {
    return null;
  }

  const { documentElement } = document;
  if (documentElement && documentElement instanceof HTMLElement) {
    return documentElement;
  }

  return document.body instanceof HTMLElement ? document.body : null;
}

function sanitizeThemePreference(value) {
  if (typeof value !== 'string') {
    return 'system';
  }

  const normalized = value.trim().toLowerCase();
  return VALID_THEME_PREFERENCES.includes(normalized) ? normalized : 'system';
}

function getSystemMediaQuery() {
  if (systemMediaQuery) {
    return systemMediaQuery;
  }

  if (typeof window !== 'object' || !window || typeof window.matchMedia !== 'function') {
    return null;
  }

  systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return systemMediaQuery;
}

function detectSystemTheme() {
  const mediaQuery = getSystemMediaQuery();
  if (!mediaQuery) {
    return 'light';
  }

  try {
    return mediaQuery.matches ? 'dark' : 'light';
  } catch (error) {
    console.error('Não foi possível determinar o tema do sistema.', error);
    return 'light';
  }
}

function applyTheme(theme) {
  const root = getDocumentRoot();
  if (!root) {
    return;
  }

  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  if (root.dataset.theme !== normalizedTheme) {
    root.dataset.theme = normalizedTheme;
  }

  if (root.style?.setProperty) {
    root.style.setProperty('color-scheme', normalizedTheme);
  }
}

function notifySubscribers() {
  const payload = Object.freeze({
    preference: currentPreference,
    theme: resolvedTheme,
  });

  subscribers.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error('Erro ao notificar assinante de tema.', error);
    }
  });

  eventBus.emit('theme:changed', payload);
}

function updateResolvedTheme() {
  resolvedTheme = currentPreference === 'system' ? detectSystemTheme() : currentPreference;
  applyTheme(resolvedTheme);
  notifySubscribers();
}

function persistPreference(preference) {
  if (typeof window !== 'object' || !window) {
    return;
  }

  try {
    const storage = window.localStorage;
    if (!storage) {
      return;
    }

    if (preference === 'system') {
      storage.removeItem(THEME_STORAGE_KEY);
      return;
    }

    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch (error) {
    console.error('Não foi possível persistir a preferência de tema.', error);
  }
}

function readPersistedPreference() {
  if (typeof window !== 'object' || !window) {
    return 'system';
  }

  try {
    const storage = window.localStorage;
    if (!storage) {
      return 'system';
    }

    const storedValue = storage.getItem(THEME_STORAGE_KEY);
    return sanitizeThemePreference(storedValue);
  } catch (error) {
    console.error('Não foi possível ler a preferência de tema armazenada.', error);
    return 'system';
  }
}

function handleSystemChange() {
  if (currentPreference !== 'system') {
    return;
  }

  updateResolvedTheme();
}

function watchSystemPreference() {
  const mediaQuery = getSystemMediaQuery();
  if (!mediaQuery) {
    return () => {};
  }

  const listener = () => handleSystemChange();

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }

  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }

  return () => {};
}

let unsubscribeSystemListener = () => {};

function applyPreference(preference, { persist = true } = {}) {
  const sanitizedPreference = sanitizeThemePreference(preference);
  currentPreference = sanitizedPreference;

  if (unsubscribeSystemListener) {
    unsubscribeSystemListener();
    unsubscribeSystemListener = () => {};
  }

  if (sanitizedPreference === 'system') {
    unsubscribeSystemListener = watchSystemPreference();
  }

  if (persist) {
    persistPreference(sanitizedPreference);
  }

  updateResolvedTheme();
}

export function initializeTheme({ preference } = {}) {
  if (initialized) {
    return { preference: currentPreference, theme: resolvedTheme };
  }

  initialized = true;
  const initialPreference = sanitizeThemePreference(preference ?? readPersistedPreference());
  applyPreference(initialPreference, { persist: false });
  return { preference: currentPreference, theme: resolvedTheme };
}

export function setThemePreference(preference) {
  applyPreference(preference, { persist: true });
  return { preference: currentPreference, theme: resolvedTheme };
}

export function getThemePreference() {
  return currentPreference;
}

export function getResolvedTheme() {
  return resolvedTheme;
}

export function subscribeThemeChange(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  subscribers.add(listener);

  return () => {
    subscribers.delete(listener);
  };
}

export function resetThemeManagerForTests() {
  initialized = false;
  currentPreference = 'system';
  resolvedTheme = 'light';
  if (unsubscribeSystemListener) {
    unsubscribeSystemListener();
  }
  unsubscribeSystemListener = () => {};
  subscribers.clear();
}

