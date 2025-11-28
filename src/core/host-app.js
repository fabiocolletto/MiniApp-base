// Localização no repositório: src/core/host-app.js
// ===============================================
// 1. DADOS e ESTADO CORE (Substitui src/core/user.js e src/core/state.js)
// ===============================================

export const SCREENS = {
    CATALOG: 'catalog',
    PERSONA_SELECTION: 'persona_selection',
    STUDENT_MENU: 'student_menu',
};

// Estado Global da Aplicação
export const appState = {
    currentScreen: SCREENS.CATALOG, 
    isUserPanelOpen: false,        
    currentPanelTab: 'data',       
    isActionModalOpen: false,      
    isAccessibilityPanelOpen: false,
    isNotificationPanelOpen: false,
};

// Estado Mínimo do Usuário (Usando localStorage para persistência)
const USER_KEY = "app5-user-data";
let userData = {};

// Função de re-renderização (será conectada ao renderApp no final)
let forceRenderCallback = () => console.warn("Render callback not initialized.");

// --- Funções de Usuário (Antigo src/core/user.js) ---
export function loadUser() {
    const DEFAULT_USER_STATE = { themePref: 'light', persona: 'aluno', showAccessibilityFab: true, showNotificationFab: true };
    try {
        const raw = localStorage.getItem(USER_KEY);
        const data = raw ? JSON.parse(raw) : {};
        userData = { ...DEFAULT_USER_STATE, ...data };
        if (userData.country === 'Brasil' && (!userData.phone || userData.phone.replace(/\D/g, '').length === 0)) {
            userData.phone = '55';
        }
    } catch (e) {
        userData = { ...DEFAULT_USER_STATE };
    }
    return userData;
}

export function getUserState() {
    return userData;
}

export function updateUser(key, value) {
    if (key === 'persona' && value !== 'aluno') return; 
    userData[key] = value;
    try {
        userData.updated = new Date().toISOString();
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) { console.error("Erro ao salvar dados."); }
}
// --------------------------------------------------------

// --- Funções de Estado (Antigo src/core/state.js) ---
export function setAppState(newState) {
    Object.assign(appState, newState);
    
    // Lógica para fechar modais
    if (newState.currentScreen !== undefined && newState.currentScreen !== appState.currentScreen) {
        appState.isUserPanelOpen = false;
        // ... (outros modais fechados)
    }
    
    forceRenderCallback(); // Chama a função de renderização
}

export function initializeRenderCallback(callback) {
    forceRenderCallback = callback;
}
// --------------------------------------------------------


// ===============================================
// 2. UTILIDADES DE UI (Antigo src/core/ui.js)
// ===============================================

export function setAppTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
    }
}

export function getColorStyle(baseColor) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/40' },
        sky: { bg: 'bg-sky-500/10', text: 'text-sky-700', border: 'border-sky-500/40' },
        red: { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/40' },
        default: { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500/40' }
    };
    return colorMap[baseColor] || colorMap.default;
}

export function getPersonaLabel(personaId) {
    const labels = { aluno: 'Aluno', professor: 'Professor', instituicao: 'Instituição' };
    return labels[personaId] || personaId;
}

export function renderMiniAppCard({ id, title, icon, color }) {
    const styles = getColorStyle(color);
    return `<a href="#" data-app-id="${id}" class="mini-app-card-base rounded-2xl p-4 flex flex-col justify-center items-center ${styles.bg} ${styles.border} border-2 hover:shadow-xl transition duration-300 transform hover:scale-[1.02] active:scale-100" style="--selection-color: rgb(var(--page-fg-muted));">
        <span class="material-symbols-rounded icon-large ${styles.text} opacity-80">${icon}</span>
        <div class="mt-4 text-center">
            <h3 class="font-semibold text-lg ${styles.text}">${title}</h3>
        </div>
    </a>`;
}

export function renderContainer(content) { return `<div class="p-4 bg-gray-50/50 rounded-xl">${content}</div>`; }
// ... (Outras utilidades omitidas para brevidade)

// ===============================================
// 3. FUNÇÕES PLACEHOLDER DE COMPONENTES (Para não quebrar a importação do Host)
// ===============================================

// Funções de Componentes Fictícios
export function renderHeader(state, getUserState, handleBack, getPersonaLabel, setAppState) {
    const user = getUserState();
    return `<header class="bg-indigo-600 shadow-lg fixed top-0 w-full z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <h1 class="text-white text-xl font-bold">Host App</h1>
            <button onclick="window.hostApp.setAppState({isUserPanelOpen: true})" class="text-white hover:text-indigo-200 transition">
                <span class="material-symbols-rounded">account_circle</span>
            </button>
        </div>
    </header>`;
}
export function renderCatalogScreen(state, getUserState, getColorStyle, renderMiniAppCard) {
    const cards = [
        { id: 'simulados', title: 'Simulados', icon: 'quiz', color: 'emerald' },
        { id: 'tarefas', title: 'Tarefas', icon: 'assignment', color: 'sky' },
    ];
    const cardHtml = cards.map(c => renderMiniAppCard(c)).join('');
    return `<h2 class="text-2xl font-bold mb-6">Catálogo de Mini-Apps</h2><div class="card-grid-container flex flex-wrap gap-6 justify-center sm:justify-start">${cardHtml}</div>`;
}
// Placeholders para evitar quebra no Host
export const handleBack = () => setAppState({ currentScreen: SCREENS.CATALOG });
export const handleAppCardClick = (e, setAppState, SCREENS) => {
    e.preventDefault();
    const app = e.currentTarget.getAttribute('data-app-id');
    console.log(`Mini-app ${app} clicado!`);
};
export function renderPersonaSelectionScreen() { return '<div>Tela de Seleção de Persona (Placeholder)</div>'; }
export function renderStudentMenuScreen() { return '<div>Menu do Aluno (Placeholder)</div>'; }
export function renderActionModal() { return ''; }
export function renderProductContent() { return ''; }
export function handleGeminiBrainstorm() { return ''; }
export function renderAlertFAB() { return ''; }
export function renderAccessibilityFAB() { return ''; }
export function renderNotificationPanelModal() { return ''; }
export function renderAccessibilityPanelModal() { return ''; }
export function confirmAlert() { return ''; }
export function handleToggle() { return ''; }


// ===============================================
// 4. INICIALIZAÇÃO E EXPOSIÇÃO GLOBAL (Para o painel do usuário)
// ===============================================
// Expor funções essenciais para que o DOM possa chamá-las (ex: onclick) e para o Painel do Usuário
window.hostApp = { 
    setAppState, 
    renderApp: () => forceRenderCallback(),
    updateUser,
};
