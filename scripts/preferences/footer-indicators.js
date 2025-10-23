import eventBus from '../events/event-bus.js';

const STORAGE_KEY = 'miniapp:footer-indicators';
const VALID_PREFERENCES = ['visible', 'hidden'];
const DEFAULT_PREFERENCE = 'visible';

let currentPreference = DEFAULT_PREFERENCE;
let initialized = false;
const subscribers = new Set();

function sanitizePreference(value) {
  if (typeof value !== 'string') {
    return DEFAULT_PREFERENCE;
  }

  const normalized = value.trim().toLowerCase();
  return VALID_PREFERENCES.includes(normalized) ? normalized : DEFAULT_PREFERENCE;
}

export function sanitizeFooterIndicatorsPreference(value) {
  return sanitizePreference(value);
}

function notifySubscribers() {
  const payload = Object.freeze({ preference: currentPreference });

  subscribers.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error('Erro ao notificar assinante de indicadores do rodapé.', error);
    }
  });

  eventBus.emit('footer:indicators', payload);
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

    if (preference === DEFAULT_PREFERENCE) {
      storage.removeItem(STORAGE_KEY);
      return;
    }

    storage.setItem(STORAGE_KEY, preference);
  } catch (error) {
    console.error('Não foi possível persistir a preferência de indicadores do rodapé.', error);
  }
}

function readPersistedPreference() {
  if (typeof window !== 'object' || !window) {
    return DEFAULT_PREFERENCE;
  }

  try {
    const storage = window.localStorage;
    if (!storage) {
      return DEFAULT_PREFERENCE;
    }

    const storedValue = storage.getItem(STORAGE_KEY);
    if (typeof storedValue !== 'string') {
      return DEFAULT_PREFERENCE;
    }

    return sanitizePreference(storedValue);
  } catch (error) {
    console.error('Não foi possível ler a preferência de indicadores do rodapé.', error);
    return DEFAULT_PREFERENCE;
  }
}

function applyPreference(preference, { persist = true, notify = true } = {}) {
  const sanitized = sanitizePreference(preference);
  const hasChanged = sanitized !== currentPreference;
  currentPreference = sanitized;

  if (persist) {
    persistPreference(currentPreference);
  }

  if (notify && hasChanged) {
    notifySubscribers();
  }

  return currentPreference;
}

export function initializeFooterIndicatorsPreference({ preference } = {}) {
  if (initialized) {
    return { preference: currentPreference };
  }

  initialized = true;
  const initialPreference = sanitizePreference(preference ?? readPersistedPreference());
  currentPreference = initialPreference;
  persistPreference(currentPreference);
  return { preference: currentPreference };
}

export function setFooterIndicatorsPreference(preference) {
  return applyPreference(preference);
}

export function getFooterIndicatorsPreference() {
  return currentPreference;
}

export function subscribeFooterIndicatorsChange(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  subscribers.add(listener);

  try {
    listener(Object.freeze({ preference: currentPreference }));
  } catch (error) {
    console.error('Erro ao inicializar assinante de indicadores do rodapé.', error);
  }

  return () => {
    subscribers.delete(listener);
  };
}
