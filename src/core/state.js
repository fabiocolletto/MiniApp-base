// src/core/state.js

/**
 * Constantes de Telas (para padronizar a navegação).
 * Qualquer componente que muda de tela deve usar estas constantes.
 */
export const SCREENS = {
    CATALOG: 'catalog',
    PERSONA_SELECTION: 'persona_selection',
    STUDENT_MENU: 'student_menu',
};

/**
 * Estado Global da Aplicação.
 * O Host Application (index.html) usa estas propriedades para decidir o que renderizar.
 */
export let appState = {
    // UI e Modais
    currentScreen: SCREENS.CATALOG, // Tela atual
    isUserPanelOpen: false,         // Se o modal do painel do usuário está aberto
    currentPanelTab: 'data',        // Aba ativa no painel do usuário ('data', 'prefs', 'security')
    isActionModalOpen: false,       // Se o modal de ações (ex: Gemini) está aberto
    isAccessibilityPanelOpen: false, // Se o modal de acessibilidade está aberto
    isNotificationPanelOpen: false, // Se o modal de notificações está aberto
    
    // Dados de Contexto (O mini-app ativo)
    activeProduct: null, // Produto ou mini-app selecionado no catálogo
    
    // Configurações do Gemini/IA
    geminiResult: null,
    geminiIsLoading: false,
};

/**
 * Força uma re-renderização completa da aplicação
 * (Esta função deve ser definida no Host, mas é referenciada aqui).
 */
let forceRenderCallback = () => console.warn("Render callback not initialized in Host Application.");

/**
 * Define a função de renderização a ser usada quando o estado muda.
 * Esta função DEVE ser chamada uma vez no Host Application (index.html/init).
 * @param {Function} callback - A função principal de renderização (renderApp).
 */
export function initializeRenderCallback(callback) {
    forceRenderCallback = callback;
}

/**
 * Atualiza o estado da aplicação e dispara uma re-renderização.
 * @param {Object} newState - Objeto contendo as chaves e valores a serem atualizados.
 */
export function setAppState(newState) {
    Object.assign(appState, newState);
    
    // Lógica para fechar todos os modais se a tela mudar
    if (newState.currentScreen !== undefined && newState.currentScreen !== appState.currentScreen) {
        appState.isUserPanelOpen = false;
        appState.isActionModalOpen = false;
        appState.isAccessibilityPanelOpen = false;
        appState.isNotificationPanelOpen = false;
    }
    
    // Força a re-renderização do Host
    forceRenderCallback();
}
