const REFRESH_INTERVAL = 30_000;
const GLOBAL_PREFERENCE_STORAGE_KEY = 'miniapp:settings:global-preferences';
const DEFAULT_GLOBAL_PREFERENCES = Object.freeze({
    theme: 'dark',
    language: 'pt-BR',
});
const THEME_LABELS = Object.freeze({
    light: Object.freeze({
        'pt-BR': 'Claro',
        'en-US': 'Light',
        'es-ES': 'Claro',
    }),
    dark: Object.freeze({
        'pt-BR': 'Escuro',
        'en-US': 'Dark',
        'es-ES': 'Oscuro',
    }),
});
const LANGUAGE_LABELS = Object.freeze({
    'pt-BR': Object.freeze({
        'pt-BR': 'Português',
        'en-US': 'Portuguese',
        'es-ES': 'Portugués',
    }),
    'en-US': Object.freeze({
        'pt-BR': 'Inglês',
        'en-US': 'English',
        'es-ES': 'Inglés',
    }),
    'es-ES': Object.freeze({
        'pt-BR': 'Espanhol',
        'en-US': 'Spanish',
        'es-ES': 'Español',
    }),
});

function resolveThemeLabel(themeKey, language) {
    const themeLabels = THEME_LABELS[themeKey];
    if (!themeLabels) {
        return themeKey;
    }
    return themeLabels[language] || themeLabels['pt-BR'] || themeKey;
}

function resolveLanguageLabel(languageKey, activeLanguage) {
    const labels = LANGUAGE_LABELS[languageKey];
    if (!labels) {
        return languageKey;
    }
    return labels[activeLanguage] || labels['pt-BR'] || languageKey;
}

function safeParsePreferences(rawValue) {
    if (!rawValue) return null;
    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn('Preferências globais inválidas foram descartadas.', error);
        return null;
    }
}

function getStoredPreferences() {
    const storedValue = globalThis?.localStorage?.getItem(GLOBAL_PREFERENCE_STORAGE_KEY);
    const parsed = safeParsePreferences(storedValue);
    return {
        ...DEFAULT_GLOBAL_PREFERENCES,
        ...(parsed || {}),
    };
}

function persistPreferences(preferences) {
    try {
        globalThis?.localStorage?.setItem(GLOBAL_PREFERENCE_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
        console.warn('Não foi possível salvar as preferências globais.', error);
    }
}

function applyThemePreference(theme) {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    const html = document.documentElement;
    html.setAttribute('data-theme', normalizedTheme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', normalizedTheme === 'light' ? '#f3f4f6' : '#020617');
    }
}

function applyLanguagePreference(language) {
    const normalizedLanguage = LANGUAGE_LABELS[language] ? language : DEFAULT_GLOBAL_PREFERENCES.language;
    document.documentElement.setAttribute('lang', normalizedLanguage);
}

function broadcastPreferences(preferences, { silent } = {}) {
    const detail = {
        source: 'miniapps/settings',
        scope: 'global-preferences',
        category: 'MiniSystems',
        preferences,
        timestamp: new Date().toISOString(),
    };

    try {
        window.dispatchEvent(new CustomEvent('miniapp:global-preferences', { detail }));
    } catch (error) {
        console.warn('Não foi possível disparar o evento interno de preferências.', error);
    }

    try {
        if (window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') {
            window.parent.postMessage({ type: 'miniapp:global-preferences', detail }, '*');
        }
    } catch (error) {
        console.warn('Não foi possível enviar preferências para o shell.', error);
    }

    if (!silent) {
        console.info('[MiniSystems] Preferências globais transmitidas.', detail);
    }
}

function applyPreferences(preferences, { silent } = {}) {
    applyThemePreference(preferences.theme);
    applyLanguagePreference(preferences.language);
    broadcastPreferences(preferences, { silent });
}

function syncPreferences(preferences, { silent = false } = {}) {
    persistPreferences(preferences);
    applyPreferences(preferences, { silent });
}

async function fetchStorageEstimate() {
    if (navigator?.storage?.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            return {
                quota: estimate.quota ?? 0,
                usage: estimate.usage ?? 0,
            };
        } catch (error) {
            console.warn('Falha ao consultar StorageManager.estimate()', error);
        }
    }
    return { quota: 0, usage: 0 };
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

function getMemoryStatus(usage, quota) {
    if (!quota) {
        return { key: 'collecting', label: 'Coletando dados...', variant: 'info', percentage: 0 };
    }
    const percentage = Math.min(100, Math.round((usage / quota) * 100));
    if (percentage >= 80) {
        return { key: 'critical', label: 'Crítico', variant: 'error', percentage };
    }
    if (percentage >= 60) {
        return { key: 'attention', label: 'Atenção', variant: 'warning', percentage };
    }
    return { key: 'stable', label: 'Estável', variant: 'success', percentage };
}

export {
    DEFAULT_GLOBAL_PREFERENCES,
    LANGUAGE_LABELS,
    resolveLanguageLabel,
    resolveThemeLabel,
    REFRESH_INTERVAL,
    THEME_LABELS,
    fetchStorageEstimate,
    formatBytes,
    getMemoryStatus,
    getStoredPreferences,
    syncPreferences,
};
