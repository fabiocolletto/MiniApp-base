const STORAGE_KEY = 'miniapp:branding';

export const DEFAULT_BRANDING_LOGOS = {
  light: 'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Light-Transparente-2000x500px.webp',
  dark: 'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Dark-Transparente-2000x500px.webp',
};

const DEFAULT_BRANDING_STATE = {
  mode: 'individual',
  logos: {
    light: DEFAULT_BRANDING_LOGOS.light,
    dark: DEFAULT_BRANDING_LOGOS.dark,
    shared: DEFAULT_BRANDING_LOGOS.light,
  },
};

const listeners = new Set();
let brandingState = null;

function getLocalStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento de branding.', error);
    return null;
  }
}

function cloneBranding(state) {
  const source = state ?? DEFAULT_BRANDING_STATE;
  return {
    mode: source.mode,
    logos: {
      light: source.logos?.light ?? null,
      dark: source.logos?.dark ?? null,
      shared: source.logos?.shared ?? null,
    },
  };
}

function sanitizeMode(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  return normalized === 'shared' ? 'shared' : 'individual';
}

function sanitizeLogo(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed !== '' ? trimmed : null;
}

function loadBrandingFromStorage() {
  const storage = getLocalStorage();
  if (!storage) {
    return cloneBranding(DEFAULT_BRANDING_STATE);
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== 'string' || raw.trim() === '') {
      return cloneBranding(DEFAULT_BRANDING_STATE);
    }

    const parsed = JSON.parse(raw);
    const mode = sanitizeMode(parsed?.mode);
    const logos = parsed?.logos && typeof parsed.logos === 'object' ? parsed.logos : {};

    return {
      mode,
      logos: {
        light: sanitizeLogo(logos.light) ?? DEFAULT_BRANDING_STATE.logos.light,
        dark: sanitizeLogo(logos.dark) ?? DEFAULT_BRANDING_STATE.logos.dark,
        shared: sanitizeLogo(logos.shared) ?? DEFAULT_BRANDING_STATE.logos.shared,
      },
    };
  } catch (error) {
    console.error('Não foi possível carregar a configuração de branding.', error);
    return cloneBranding(DEFAULT_BRANDING_STATE);
  }
}

function persistBranding(state) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: state.mode,
        logos: {
          light: state.logos.light,
          dark: state.logos.dark,
          shared: state.logos.shared,
        },
      })
    );
  } catch (error) {
    console.error('Não foi possível salvar a configuração de branding.', error);
  }
}

function ensureBrandingState() {
  if (!brandingState) {
    brandingState = loadBrandingFromStorage();
  }

  return brandingState;
}

function applyBrandingState(nextState) {
  brandingState = cloneBranding(nextState);
  persistBranding(brandingState);

  const snapshot = cloneBranding(brandingState);
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar alteração de branding.', error);
    }
  });
}

export function getBrandingSnapshot() {
  const state = ensureBrandingState();
  return cloneBranding(state);
}

export function getDefaultBrandingSnapshot() {
  return cloneBranding(DEFAULT_BRANDING_STATE);
}

export function subscribeBranding(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);

  try {
    listener(getBrandingSnapshot());
  } catch (error) {
    console.error('Erro ao inicializar assinante de branding.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function updateBranding(partial = {}) {
  const current = ensureBrandingState();
  const next = cloneBranding(current);
  let changed = false;

  if (Object.prototype.hasOwnProperty.call(partial, 'mode')) {
    const mode = sanitizeMode(partial.mode);
    if (mode !== next.mode) {
      next.mode = mode;
      changed = true;
    }
  }

  if (partial.logos && typeof partial.logos === 'object') {
    ['light', 'dark', 'shared'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(partial.logos, key)) {
        const sanitized = sanitizeLogo(partial.logos[key]);
        if (sanitized !== next.logos[key]) {
          next.logos[key] = sanitized ?? DEFAULT_BRANDING_STATE.logos[key];
          changed = true;
        }
      }
    });
  }

  if (!changed) {
    return;
  }

  applyBrandingState(next);
}

export function resetBranding() {
  applyBrandingState(DEFAULT_BRANDING_STATE);
}
