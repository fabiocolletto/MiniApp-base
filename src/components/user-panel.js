// src/components/user-panel.js

// 1. IMPORTAÇÃO DO MÓDULO DE DADOS (NOVO)
import { loadUser, updateUser, clearUser, getUserState } from '../core/user.js'; 

// 2. Variáveis de Estado e Constantes (SÓ DE UI)
// REMOVIDAS: const USER_KEY, let userData, loadUserData, saveUserData, updateUserData, clearUserData

// Estruturas de dados (mantidas por serem de UI/Configuração do Painel)
const TABS = [ /* ... */ ];
const USER_PERSONA_OPTIONS = [ /* ... */ ];

// 3. Funções de Máscara (Utilities - mantidas por serem específicas do FORMULÁRIO)
// ... createPhoneMask, maskPhone, maskCEP, maskBirthDate (Conteúdo mantido)

// 4. Funções de Lógica e Eventos (ADAPTADAS)

function getStatusText(isCleared = false) {
    const userData = getUserState(); // <<< Acesso via Módulo de Serviço
    if (isCleared) return { text: 'Dados removidos e tema redefinido.', tone: 'error' };
    const isDataFilled = !!userData.name || !!userData.email || !!userData.phone;
    return isDataFilled ? { text: '', tone: 'ok' } : { text: '', tone: 'warn' };
}

function handleToggle(key, event, onUpdate) {
    const newValue = event.target.checked;
    updateUser(key, newValue); // <<< Chama a função de Serviço
    if (onUpdate) onUpdate(); 
}

// Lida com a mudança de campo no formulário
function handleFormChange(e, onUpdate, setAppTheme) {
    const { name, value } = e.target;
    let valueToSave = value;
    // const userData = getUserState(); REMOVIDO: não precisa pegar o estado aqui, pois o updateUser fará isso.

    if (name === 'cep' || name === 'birthDate') {
        valueToSave = value.replace(/\D/g, '');
    } else if (name === 'phone') {
        valueToSave = value;
    }

    if (name === 'country') {
        // Lógica de manipulação de DDD/Country (mantida por ser regra de INPUT/UI)
        const phoneInput = document.getElementById('user-phone');
        if (phoneInput) {
            let currentPhoneDigits = phoneInput.value.replace(/\D/g, '');
            if (value === 'Brasil') {
                if (!currentPhoneDigits.startsWith('55')) {
                    let localNumber = currentPhoneDigits.length > 2 && !currentPhoneDigits.startsWith('55') ? currentPhoneDigits.substring(2) : currentPhoneDigits;
                    currentPhoneDigits = '55' + localNumber.substring(0, 11);
                }
            } else {
                if (currentPhoneDigits.startsWith('55')) {
                    currentPhoneDigits = currentPhoneDigits.substring(2);
                }
            }
            phoneInput.value = maskPhone(currentPhoneDigits.substring(0, 13));
            updateUser('phone', phoneInput.value.trim()); // <<< Chama a função de Serviço
        }
        updateUser(name, valueToSave.trim()); // <<< Chama a função de Serviço
        if (onUpdate) onUpdate(); 
        return;
    }
    
    // Lógica de tema:
    if(name === 'themePref' && setAppTheme) {
        setAppTheme(value);
    }
    
    updateUser(name, valueToSave.trim()); // <<< Chama a função de Serviço
    if (onUpdate) onUpdate(); 
}

/**
 * Anexa os eventos de Input no formulário e os handlers de clique após a renderização.
 */
export function attachUserPanelEvents(onUpdate, setAppTheme, onClose) {
    // 1. Eventos do Formulário (Dados do Usuário)
    // ... (Mantido, apenas chama handleFormChange)

    document.getElementById('user-delete-btn').onclick = () => {
        clearUser(); // <<< Chama a função de Serviço
        onUpdate({ isUserPanelOpen: false, currentPanelTab: 'data' }); // Fechando e redefinindo o estado após limpar
    };

    // 3. Eventos de Preferências (Tema, Toggles)
    document.getElementById('light-theme-btn').onclick = () => {
        setAppTheme('light');
        updateUser('themePref', 'light'); // <<< Chama a função de Serviço
        if (onUpdate) onUpdate();
    };
    document.getElementById('dark-theme-btn').onclick = () => {
        setAppTheme('dark');
        updateUser('themePref', 'dark'); // <<< Chama a função de Serviço
        if (onUpdate) onUpdate();
    };
    
    document.getElementById('alert-fab-toggle').onchange = (e) => handleToggle('showNotificationFab', e, onUpdate);
    document.getElementById('fab-toggle').onchange = (e) => handleToggle('showAccessibilityFab', e, onUpdate);

    // 4. Evento de Fechar Modal
    document.getElementById('user-close-btn').onclick = (e) => {
        e.stopPropagation();
        onClose();
    };
    
    document.getElementById('user-panel-overlay').onclick = () => onClose();
}

/**
 * 5. Renderiza o modal completo do painel do usuário.
 */
export function renderUserPanelModal(appState, getColorStyle) {
    if (!appState.isUserPanelOpen) return '';

    const userData = getUserState(); // <<< Acesso aos dados do módulo

    const activeTab = TABS.find(t => t.id === appState.currentPanelTab) || TABS[0];
    const activeColorClasses = activeTab ? { base: activeTab.base, border: `border-${activeTab.base}/70`, bg: `bg-${activeTab.base}/15` } : {};
    const statusMessage = getStatusText();
    const showFab = userData.showAccessibilityFab ?? true;
    const showAlertFab = userData.showNotificationFab ?? true;

    // ... restante da renderização usa userData
    // Exemplo: value="${userData.name || ''}"
    
    // ... (Conteúdo HTML Mantido, apenas as variáveis de dados vêm de userData)
    
    // --- HTML do Modal Principal (Shell) ---
    return `
        <div id="user-panel-overlay" class="fixed inset-0 z-40 items-center justify-center bg-black/60 backdrop-blur-sm flex mobile-modal-overlay" aria-modal="true" role="dialog">
            </div>
    `;
}

// 6. Exporta a função de Renderização e Eventos (ADAPTADA)
export const userPanelExports = {
    renderUserPanelModal,
    attachUserPanelEvents,
    loadUserData: loadUser, // Exporta a função do core para o Host usar no init
    get userState() { return getUserState(); }, // Getter que usa a função do core
};
