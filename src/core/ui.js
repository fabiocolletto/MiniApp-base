// src/core/ui.js

/**
 * Aplica a preferência de tema (light ou dark) ao elemento <html>.
 * Esta é uma utilidade crucial do Host.
 * @param {string} theme - 'light' ou 'dark'.
 */
export function setAppTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
    }
}

/**
 * Retorna classes de cor Tailwind baseadas no tema ou cor de referência.
 * @param {string} baseColor - Ex: 'emerald', 'blue', 'red'.
 * @returns {string} Classes CSS base.
 */
export function getColorStyle(baseColor) {
    // Exemplo simplificado. No seu código real, esta função faria o mapeamento.
    const colorMap = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/40' },
        sky: { bg: 'bg-sky-500/10', text: 'text-sky-700', border: 'border-sky-500/40' },
        red: { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/40' },
        default: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500/40' }
    };
    return colorMap[baseColor] || colorMap.default;
}

// Funções placeholder para evitar erros de importação nos componentes:
export function getPersonaLabel(personaId) { return personaId; }
export function renderMiniAppCard() { return '<div class="h-40 bg-gray-200 rounded-xl animate-pulse">Placeholder Card</div>'; }
export function renderContainer() { return '<div>Container Placeholder</div>'; }
