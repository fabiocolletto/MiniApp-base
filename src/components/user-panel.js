// user-panel.js

// 1. Variáveis de Estado e Constantes (Internas ao Módulo)
// Acesso ao localStorage é mantido aqui para isolar a persistência do usuário.
const USER_KEY = "app5-user-data";
let userData = {}; 

// Estruturas de dados (copiadas do index.html para o módulo ser autônomo)
const TABS = [
    { id: 'data', label: 'Dados do Usuário', title: 'Central do Usuário', subtitle: 'Gerencie seus dados e o comportamento do sistema.', base: 'emerald-500', icon: 'badge' },
    { id: 'prefs', label: 'Preferências', title: 'Preferências', subtitle: 'Configurações que controlam a aparência do sistema.', base: 'sky-500', icon: 'settings' },
    { id: 'security', label: 'Segurança', title: 'Segurança', subtitle: 'Ações permanentes e críticas do sistema.', base: 'red-500', icon: 'lock' }
];

const USER_PERSONA_OPTIONS = [
    { id: 'aluno', label: 'Aluno' },
    { id: 'tutor', label: 'Tutor/Responsável' },
    { id: 'professor', label: 'Professor' },
    { id: 'instituicao', label: 'Instituição' },
    { id: 'administrador', label: 'Administrador' },
    { id: 'tecnico', label: 'Técnico' },
];

// 2. Funções de Estado e Persistência

function loadUserData() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        const data = raw ? JSON.parse(raw) : {};
        // Define valores padrão se não existirem
        userData = {
            themePref: 'light',
            showAccessibilityFab: true,
            showNotificationFab: true,
            persona: 'aluno',
            uniqueId: '',
            cep: '',
            birthDate: '',
            country: 'Brasil',
            hasSeenIntroToasts: false,
            confirmedAlertsIds: [],
            ...data
        };
        // Lógica específica para o Brasil
        if (userData.country === 'Brasil' && (!userData.phone || userData.phone.replace(/\D/g, '').length === 0)) {
            userData.phone = '55';
        }
    } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
    }
}

function saveUserData() {
    try {
        userData.updated = new Date().toISOString();
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
        console.error("Erro ao salvar dados do usuário:", e);
    }
}

/** * Atualiza um dado e persiste no storage. 
 * IMPORTANTE: No modelo Micro-Frontend, esta função 
 * DEVERIA retornar ou emitir um evento para o Host/App Principal
 * para que a tela seja renderizada (renderApp). 
 * Para simular isso, usamos um callback `onUpdate`.
 */
function updateUserData(key, value, onUpdate) {
    if (key === 'persona' && value !== 'aluno') return; // Bloqueia mudança de persona
    userData[key] = value;
    saveUserData();
    if (onUpdate) onUpdate(); // Chama a função de renderização do app principal
}

function clearUserData(onUpdate) {
    userData = {
        themePref: 'light',
        showAccessibilityFab: true,
        showNotificationFab: true,
        persona: 'aluno',
        uniqueId: '',
        cep: '',
        birthDate: '',
        country: 'Brasil',
        hasSeenIntroToasts: false,
        confirmedAlertsIds: []
    };
    try {
        localStorage.removeItem(USER_KEY);
    } catch (e) {
        console.error("Erro ao limpar dados:", e);
    }
    if (onUpdate) onUpdate(); // Chama a função de renderização do app principal
}

// 3. Funções de Máscara (Utilities)

const createPhoneMask = () => {
    let autoCC = false;
    return (value) => {
        let n = (value || "").replace(/\D/g, "");
        if (!autoCC && n.length >= 2 && !n.startsWith("55")) {
            n = "55" + n;
            autoCC = true;
        }
        if (n.length <= 2) return "+" + n;
        if (n.length <= 4) return "+" + n.slice(0, 2) + " " + n.slice(2);
        if (n.length <= 9) {
            let cc = n.slice(0, 2);
            let ddd = n.slice(2, 4);
            let f = n.slice(4);
            return "+" + cc + " " + ddd + " " + f;
        }
        let cc2 = n.slice(0, 2);
        let ddd2 = n.slice(2, 4);
        let first = n.length === 10 ? n.slice(4, 8) : n.slice(4, 9);
        let last = n.slice(-4);
        return "+" + cc2 + " " + ddd2 + " " + first + "-" + last;
    };
};

const maskPhone = createPhoneMask();

const maskCEP = (value) => {
    const n = (value || "").replace(/\D/g, "").slice(0, 8);
    if (n.length > 5) {
        return n.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
    }
    return n;
};

const maskBirthDate = (value) => {
    const n = (value || "").replace(/\D/g, "").slice(0, 8);
    if (n.length > 4) {
        return n.replace(/^(\d{2})(\d{2})(\d{0,4})$/, '$1/$2/$3');
    } else if (n.length > 2) {
        return n.replace(/^(\d{2})(\d{0,2})$/, '$1/$2');
    }
    return n;
};

// 4. Funções de Lógica e Eventos

function getStatusText(isCleared = false) {
    if (isCleared) return { text: 'Dados removidos e tema redefinido.', tone: 'error' };
    const isDataFilled = !!userData.name || !!userData.email || !!userData.phone;
    return isDataFilled ? { text: '', tone: 'ok' } : { text: '', tone: 'warn' };
}

function handleToggle(key, event, onUpdate) {
    const newValue = event.target.checked;
    updateUserData(key, newValue, onUpdate);
}

// Lida com a mudança de campo no formulário
function handleFormChange(e, onUpdate, setAppTheme) {
    const { name, value } = e.target;
    let valueToSave = value;

    if (name === 'cep' || name === 'birthDate') {
        valueToSave = value.replace(/\D/g, '');
    } else if (name === 'phone') {
        valueToSave = value; // Mantém a máscara para a função de update
    }

    if (name === 'country') {
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
            // Força a atualização do campo com a máscara (apenas se o campo existir)
            phoneInput.value = maskPhone(currentPhoneDigits.substring(0, 13));
            updateUserData('phone', phoneInput.value.trim(), null);
        }
        updateUserData(name, valueToSave.trim(), onUpdate);
        return;
    }
    
    // Lógica de tema: se o campo é `themePref`, atualizamos o tema
    if(name === 'themePref' && setAppTheme) {
        setAppTheme(value);
    }
    
    updateUserData(name, valueToSave.trim(), onUpdate);
}

/**
 * Anexa os eventos de Input no formulário e os handlers de clique após a renderização.
 * @param {Function} onUpdate - Callback para notificar o app principal sobre a mudança de estado (para re-renderizar).
 * @param {Function} setAppTheme - Função do app principal para mudar o tema no HTML.
 * @param {Function} onClose - Função do app principal para fechar o modal.
 */
export function attachUserPanelEvents(onUpdate, setAppTheme, onClose) {
    // 1. Eventos do Formulário (Dados do Usuário)
    const formInputs = document.querySelectorAll('#user-form input, #user-form select');
    formInputs.forEach(input => {
        // Remove listeners para evitar duplicação (importante em renderizações dinâmicas)
        input.removeEventListener('input', handleInput);
        input.removeEventListener('change', handleChange);
        
        // Adiciona novos listeners
        input.addEventListener('input', handleInput);
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', handleChange);
        }
    });

    function handleInput(e) {
        if (e.target.name === 'phone') {
            e.target.value = maskPhone(e.target.value);
        } else if (e.target.name === 'cep') {
            e.target.value = maskCEP(e.target.value);
        } else if (e.target.name === 'birthDate') {
            e.target.value = maskBirthDate(e.target.value);
        }
        handleFormChange(e, onUpdate, setAppTheme);
    }

    function handleChange(e) {
        handleFormChange(e, onUpdate, setAppTheme);
    }

    // 2. Eventos de Botões (Tabs, Clear Data)
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.onclick = (e) => {
            // A mudança de aba deve ser tratada pelo app principal via um callback
            // Aqui simulamos a mudança de aba para fins de exemplo, mas em Micro-Frontend real
            // o Host/Shell app controlaria o estado 'currentPanelTab'.
            e.preventDefault();
            const tabId = btn.getAttribute('data-tab-id');
            onUpdate({ currentPanelTab: tabId });
        };
    });

    document.getElementById('user-delete-btn').onclick = () => {
        clearUserData(() => {
            onUpdate({ isUserPanelOpen: false, currentPanelTab: 'data' }); // Fechando e redefinindo o estado após limpar
        });
    };

    // 3. Eventos de Preferências (Tema, Toggles)
    document.getElementById('light-theme-btn').onclick = () => {
        setAppTheme('light');
        updateUserData('themePref', 'light', onUpdate);
    };
    document.getElementById('dark-theme-btn').onclick = () => {
        setAppTheme('dark');
        updateUserData('themePref', 'dark', onUpdate);
    };
    
    document.getElementById('alert-fab-toggle').onchange = (e) => handleToggle('showNotificationFab', e, onUpdate);
    document.getElementById('fab-toggle').onchange = (e) => handleToggle('showAccessibilityFab', e, onUpdate);

    // 4. Evento de Fechar Modal
    document.getElementById('user-close-btn').onclick = (e) => {
        e.stopPropagation();
        onClose(); // Chama a função de fechar o modal do app principal
    };
    
    // Fecha no overlay
    document.getElementById('user-panel-overlay').onclick = () => onClose();
}

// 5. Função de Renderização (O que será exportado e chamado pelo App Host)

/**
 * Renderiza o modal completo do painel do usuário.
 * @param {Object} appState - Estado atual do App principal (necessário para currentPanelTab e cores).
 * @param {Function} getColorStyle - Função utilitária para obter estilos de cor (do app principal).
 * @returns {string} HTML completo do modal.
 */
export function renderUserPanelModal(appState, getColorStyle) {
    if (!appState.isUserPanelOpen) return '';

    // Garante que os dados mais recentes estejam carregados
    loadUserData(); 

    const activeTab = TABS.find(t => t.id === appState.currentPanelTab) || TABS[0];
    const activeColorClasses = activeTab ? { base: activeTab.base, border: `border-${activeTab.base}/70`, bg: `bg-${activeTab.base}/15` } : {};
    const statusMessage = getStatusText();
    const showFab = userData.showAccessibilityFab ?? true;
    const showAlertFab = userData.showNotificationFab ?? true;

    // Classes de Estilo (simplificadas para o módulo)
    const closeButtonBase = "inline-flex h-10 items-center gap-1 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    const closeIconClasses = "material-symbols-rounded text-lg text-cyan-500 group-hover:text-cyan-700";

    // --- Conteúdo das Abas ---

    const tabDataContent = `
        <form id="user-form" class="space-y-4 text-sm">
            <div>
                <label for="user-name" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">person</span>Nome completo</label>
                <input id="user-name" name="name" type="text" value="${userData.name || ''}" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" placeholder="Seu nome e sobrenome" required/>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="user-birthDate" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">cake</span>Data de Nascimento</label>
                    <input id="user-birthDate" name="birthDate" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="10" value="${maskBirthDate(userData.birthDate)}" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" placeholder="DD/MM/AAAA" required/>
                </div>
                <div>
                    <label for="user-country" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">public</span>País</label>
                    <select id="user-country" name="country" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" required>
                        <option value="Brasil" ${userData.country === 'Brasil' ? 'selected' : ''}>Brasil</option>
                        <option value="Outro" ${userData.country !== 'Brasil' ? 'selected' : ''}>Outro (Especifique)</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="user-persona" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">badge</span>Categoria</label>
                    <select id="user-persona" name="persona" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" required>
                        ${USER_PERSONA_OPTIONS.map(p => `<option value="${p.id}" ${userData.persona === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="user-id" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">key</span>ID Único</label>
                    <input id="user-id" name="uniqueId" type="text" value="${userData.uniqueId || ''}" readonly class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))] bg-gray-100/50 cursor-default" placeholder="A ser definido" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="user-phone" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">phone</span>Telefone (WhatsApp)</label>
                    <input id="user-phone" name="phone" type="tel" inputmode="tel" value="${maskPhone(userData.phone)}" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" placeholder="+55 DDD número" required/>
                </div>
                <div>
                    <label for="user-cep" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">location_on</span>CEP</label>
                    <input id="user-cep" name="cep" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9" value="${maskCEP(userData.cep)}" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" placeholder="00000-000" required/>
                </div>
            </div>
            <div>
                <label for="user-email" class="block text-xs font-medium mb-1 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base} mr-1">mail</span>E-mail</label>
                <input id="user-email" name="email" type="email" value="${userData.email || ''}" class="w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]" placeholder="seuemail@exemplo.com" required/>
            </div>
        </form>`;

    const tabPrefsContent = `
        <div class="space-y-4 pt-1">
            <div class="p-3 rounded-xl border border-sky-300/70 bg-sky-500/5 transition duration-150 ease-in-out hover:shadow-md">
                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <h3 class="font-semibold text-base text-sky-700 flex items-center"><span class="material-symbols-rounded text-lg text-sky-500 align-middle mr-2">contrast</span>Customização de Tema</h3>
                        <p class="mt-1 text-xs text-[rgb(var(--page-fg))] opacity-80">Alterne entre o modo Claro e Escuro.</p>
                    </div>
                    <div class="flex gap-2">
                        <button id="light-theme-btn" type="button" class="px-3 py-1 rounded-full text-sm font-medium transition ${userData.themePref === 'light' ? 'bg-sky-500 text-white' : 'bg-white text-sky-700 hover:bg-sky-100'}" aria-pressed="${userData.themePref === 'light'}"><span class="material-symbols-rounded text-base">light_mode</span> Claro</button>
                        <button id="dark-theme-btn" type="button" class="px-3 py-1 rounded-full text-sm font-medium transition ${userData.themePref === 'dark' ? 'bg-sky-700 text-white' : 'bg-white text-sky-700 hover:bg-sky-100'}" aria-pressed="${userData.themePref === 'dark'}"><span class="material-symbols-rounded text-base">dark_mode</span> Escuro</button>
                    </div>
                </div>
            </div>
            <div class="p-3 rounded-xl border border-amber-300/70 bg-amber-500/5 transition duration-150 ease-in-out hover:shadow-md">
                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <h3 class="font-semibold text-base text-amber-700 flex items-center"><span class="material-symbols-rounded text-lg text-amber-500 align-middle mr-2">notifications</span>Botão de Avisos (FAB)</h3>
                        <p class="mt-1 text-xs text-[rgb(var(--page-fg))] opacity-80">Exibe o botão flutuante de Avisos no canto inferior esquerdo.</p>
                    </div>
                    <label class="toggle-switch ml-4 flex-shrink-0">
                        <input type="checkbox" id="alert-fab-toggle" ${showAlertFab ? 'checked' : ''} aria-label="Ativar/desativar botão de avisos"/>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="p-3 rounded-xl border border-violet-300/70 bg-violet-500/5 transition duration-150 ease-in-out hover:shadow-md">
                <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                        <h3 class="font-semibold text-base text-violet-700 flex items-center"><span class="material-symbols-rounded text-lg text-violet-500 align-middle mr-2">accessibility_new</span>Botão de Acessibilidade (FAB)</h3>
                        <p class="mt-1 text-xs text-[rgb(var(--page-fg))] opacity-80">Exibe o botão flutuante de Acessibilidade no canto inferior esquerdo.</p>
                    </div>
                    <label class="toggle-switch ml-4 flex-shrink-0">
                        <input type="checkbox" id="fab-toggle" ${showFab ? 'checked' : ''} aria-label="Ativar/desativar botão de acessibilidade"/>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>`;

    const tabSecurityContent = `
        <div class="space-y-4">
            <h3 class="text-sm font-semibold text-${activeColorClasses.base}/90 flex items-center"><span class="material-symbols-rounded text-base text-${activeColorClasses.base}/90 mr-1">warning</span>Exclusão de Dados</h3 >
            <p class="text-sm text-[rgb(var(--page-fg))] opacity-90">Esta ação removerá todos os seus dados (Nome, E-mail, Telefone, e Preferências de Tema) salvos **apenas neste dispositivo** (memória local). Esta ação é permanente e irreversível.</p>
            <div class="mt-6 flex justify-end">
                <button id="user-delete-btn" type="button" class="inline-flex h-10 items-center gap-2 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-red-300/40 hover:bg-red-500/10 group" aria-label="Remover dados">
                    <span class="material-symbols-rounded text-lg text-red-500 group-hover:text-red-700">delete</span>
                    <span class="text-red-500 group-hover:text-red-700 text-sm font-medium">Remover dados permanentemente</span>
                </button>
            </div>
        </div>`;

    let tabContents = '';
    TABS.forEach(tab => {
        let content = '';
        if (tab.id === 'data') content = tabDataContent;
        if (tab.id === 'prefs') content = tabPrefsContent;
        if (tab.id === 'security') content = tabSecurityContent;

        const hiddenClass = appState.currentPanelTab !== tab.id ? 'hidden' : '';
        tabContents += `<div id="tab-${tab.id}" class="tab-content border-2 ${activeColorClasses.border} bg-${activeColorClasses.base}/10 rounded-2xl p-4 absolute top-0 left-0 w-full ${hiddenClass}">${content}</div>`;
    });

    // --- HTML do Modal Principal (Shell) ---

    return `
        <div id="user-panel-overlay" class="fixed inset-0 z-40 items-center justify-center bg-black/60 backdrop-blur-sm flex mobile-modal-overlay" aria-modal="true" role="dialog">
            <div class="mx-4 w-full max-w-md max-h-full overflow-y-auto rounded-3xl border-2 ${activeColorClasses.border} bg-[rgb(var(--page-bg))] bg-opacity-95 p-5 shadow-xl mobile-modal-content" onclick="event.stopPropagation()">
                <div class="flex items-start justify-between gap-3">
                    <div id="panel-title-container">
                        <h2 id="panel-title" class="text-base sm:text-lg font-semibold">${activeTab.title}</h2>
                        <p id="panel-subtitle" class="mt-1 text-xs sm:text-[0.75rem] text-[rgb(var(--page-fg-muted))]">${activeTab.subtitle}</p>
                    </div>
                    <button id="user-close-btn" type="button" class="${closeButtonBase} px-3" aria-label="Fechar painel do usuário">
                        <span class="${closeIconClasses}">close</span><span class="hidden sm:inline">Fechar</span>
                    </button>
                </div>
                
                <div id="tab-header" class="flex gap-2 mt-4 mb-4 pb-1 border-b border-[rgb(var(--page-fg-muted)/0.3)]">
                    ${TABS.map(tab => {
                        const isCurrent = appState.currentPanelTab === tab.id;
                        const tabBase = tab.base;
                        const activeClasses = isCurrent ? `border-b-2 text-${tabBase}/90 bg-${tabBase}/10 font-bold` : 'border-b-2 border-transparent hover:border-[rgb(var(--page-fg-muted))] hover:hover:text-[rgb(var(--page-fg))]';
                        const iconColorClass = `text-${tabBase}/80`;
                        return `<button key="${tab.id}" data-tab-id="${tab.id}" class="tab-button inline-flex items-center px-3 text-sm transition focus:outline-none gap-1 ${activeClasses} pt-2" aria-selected="${isCurrent}">
                                    <span class="material-symbols-rounded text-base ${iconColorClass}">${tab.icon}</span>${tab.label}
                                </button>`;
                    }).join('')}
                </div>
                
                <div class="relative mt-3 min-h-[420px]">
                    ${tabContents}
                </div>
                
                <div id="panel-status-footer" class="mt-4 pt-3">
                    <p id="user-status-text" class="text-[0.8rem] text-center ${statusMessage.tone === 'ok' ? 'text-emerald-600' : statusMessage.tone === 'error' ? 'text-red-500' : 'text-amber-500'}">
                        ${statusMessage.text}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// 6. Exporta a função de Renderização e Eventos
// Isso permite que o app principal (Host) use o mini-app.
export const userPanelExports = {
    renderUserPanelModal,
    attachUserPanelEvents,
    loadUserData, // Permite que o Host use os dados iniciais do usuário
    get userState() { return userData; }, // Getter para obter o estado atual
};
