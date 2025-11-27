import React, { useState, useEffect, useCallback, useMemo } from 'react';

const CSS_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200');

    :root, html {
        color-scheme: light;
        --page-bg: 248 250 252;
        --page-bg-alpha: 0.96;
        --page-fg: 15 23 42;
        --page-fg-muted: 71 85 105;
        --page-border: 15 23 42;
    }

    body {
        font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        min-height: 100vh;
        background-color: rgb(var(--page-bg) / var(--page-bg-alpha));
        color: rgb(var(--page-fg));
        transition: background-color 0.3s, color 0.3s;
    }

    .mini-app-portfolio { 
        --card-border-width: 2px;
    }
    
    .mini-app-card-base {
        width: 200px; 
        max-width: 200px;
        min-width: 180px;
        aspect-ratio: 4/3;
        border-style: solid;
        border-width: var(--card-border-width);
    }
    
    .status-pending {
        opacity: 0.45;
        cursor: default;
        pointer-events: none;
        transform: none !important;
        box-shadow: none !important;
    }
    .mini-app-card-base.selected {
        border-width: 3px !important;
        box-shadow: 0 0 0 4px rgb(var(--page-bg)), 0 0 0 6px var(--selection-color) !important;
    }
    #action-modal-content {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    }
    #action-modal.hidden #action-modal-content {
        transform: scale(0.95);
        opacity: 0;
    }
    #action-modal:not(.hidden) #action-modal-content {
        transform: scale(1);
        opacity: 1;
    }
    
    .mini-app-card-base .icon-large {
        font-size: 5rem;
    }
    
    .tab-content.hidden{display:none;}
    .tab-button {
        border-radius: 0.75rem;
        transition: all 150ms ease;
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        color: rgb(var(--page-fg-muted));
    }

    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 25px;
    }
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 25px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 21px;
        width: 21px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider {
        background-color: #8B5CF6;
    }
    input:checked + .slider:before {
        transform: translateX(25px);
    }
    
    @keyframes roll-in-up {
        0% { transform: translateY(100%); opacity: 0; }
        5% { opacity: 1; }
        100% { transform: translateY(0%); opacity: 1; }
    }

    .toast-message-roll-mask {
        height: 1.25rem;
        overflow: hidden;
    }

    .toast-message-roll-wrapper {
        display: inline-block;
        animation: roll-in-up 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transform-origin: bottom; 
    }
`;

const createPhoneMask = () => {
    let autoCC = false;
    return (value) => {
        let n = (value || "").replace(/\D/g, "");
        if (!autoCC && n.length >= 2 && !n.startsWith("55")) { n = "55" + n; autoCC = true; }
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

const USER_KEY = "app5-user-data";
const useUserData = () => {
    const [userData, setInternalUserData] = useState(() => {
        try {
            const raw = localStorage.getItem(USER_KEY);
            const data = raw ? JSON.parse(raw) : {};
            return { 
                ...data, 
                themePref: 'light', 
                showAccessibilityFab: data.showAccessibilityFab === undefined ? true : data.showAccessibilityFab,
                cep: data.cep || '',
                birthDate: data.birthDate || '',
                country: data.country || 'Brasil',
                hasSeenIntroToasts: data.hasSeenIntroToasts === undefined ? true : data.hasSeenIntroToasts, 
                confirmedAlertsIds: data.confirmedAlertsIds || [],
            }; 
        } catch (e) {
            return { themePref: 'light', showAccessibilityFab: true, cep: '', birthDate: '', country: 'Brasil', hasSeenIntroToasts: true, confirmedAlertsIds: [] };
        }
    });

    const updateData = useCallback((key, value) => {
        setInternalUserData(prev => {
            const newUserData = { ...prev, [key]: value, updated: new Date().toISOString() };
            try {
                const { themePref, ...dataToSave } = newUserData;
                localStorage.setItem(USER_KEY, JSON.stringify(dataToSave));
            } catch (e) { /* ignore */ }
            return newUserData;
        });
    }, []);
    
    const clearUserData = useCallback(() => {
         setInternalUserData({ themePref: 'light', showAccessibilityFab: true, cep: '', birthDate: '', country: 'Brasil', hasSeenIntroToasts: true, confirmedAlertsIds: [] }); 
         try {
            localStorage.removeItem(USER_KEY);
         } catch(e) { /* ignore */ }
    }, []);
    
    const confirmIntroToasts = useCallback(() => {
        updateData('hasSeenIntroToasts', true);
    }, [updateData]);
    
    const addConfirmedAlertId = useCallback((id) => {
        setInternalUserData(prev => {
            if (prev.confirmedAlertsIds.includes(id)) return prev;

            const newAlertsIds = [...prev.confirmedAlertsIds, id];
            const newUserData = { ...prev, confirmedAlertsIds: newAlertsIds, updated: new Date().toISOString() };
            
            try {
                const { themePref, ...dataToSave } = newUserData;
                localStorage.setItem(USER_KEY, JSON.stringify(dataToSave));
            } catch (e) { /* ignore */ }

            return newUserData;
        });
    }, []);


    return {
        data: userData,
        updateData,
        clearUserData,
        updatePersona: (persona) => updateData('persona', persona),
        updateTheme: (themePref) => updateData('themePref', themePref),
        toggleAccessibilityFab: () => updateData('showAccessibilityFab', !userData.showAccessibilityFab),
        confirmIntroToasts,
        addConfirmedAlertId
    };
};

const SCREENS = {
    CATALOG: 'catalog',
    PERSONA_SELECTION: 'persona-selection',
    STUDENT_MENU: 'student-menu',
};

const colorMap = {
    pink: { base: 'pink-500', rgb: '236 72 153', icon: 'pink-500/30', label: 'Rosa' },
    emerald: { base: 'emerald-500', rgb: '16 185 129', icon: 'emerald-500/30', label: 'Verde Esmeralda' },
    cyan: { base: 'cyan-500', rgb: '6 182 212', icon: 'cyan-500/30', label: 'Ciano' },
    amber: { base: 'amber-500', rgb: '245 158 11', icon: 'amber-500/30', label: 'Âmbar' },
    violet: { base: 'violet-500', rgb: '139 92 246', icon: 'violet-500/30', label: 'Violeta' },
    sky: { base: 'sky-500', rgb: '14 165 233', icon: 'sky-500/30', label: 'Sky' },
    red: { base: 'red-500', rgb: '239 68 68', icon: 'red-500/30', label: 'Vermelho' },
};

const MiniAppCard = ({ label, icon, color, status, onClick, dataAttr, selected }) => {
    const isPending = status !== 'Ativo';
    const colorStyle = colorMap[color] || colorMap.pink;

    const borderClass = `border-${colorStyle.base}/80`;
    const bgClass = `bg-${colorStyle.base}/10`;
    const textClass = `text-${colorStyle.base}/90`;
    const iconClass = `text-${colorStyle.icon}`;

    // Status: Reduzindo o badge
    const indicatorClasses = isPending ? 'opacity-100' : 'opacity-0 pointer-events-none';
    const indicatorBg = isPending ? 'bg-amber-500/70 border-amber-600/80 text-white' : '';

    const cardClasses = `mini-app-card-base backdrop-blur-sm ${borderClass} ${bgClass} 
                         p-5 rounded-3xl overflow-hidden flex flex-col relative
                         transition-all hover:translate-y-[-0.5rem] hover:shadow-lg
                         ${selected ? 'selected' : ''} ${isPending ? 'status-pending' : ''}`;

    const handleCardClick = (e) => {
        if (isPending) {
            e.preventDefault();
            return;
        }
        onClick && onClick(e);
    };

    const customStyle = {
        '--selection-color': `rgb(${colorStyle.rgb})`,
    };

    return (
        <a href="#" 
           className={cardClasses}
           style={customStyle}
           onClick={handleCardClick}
           data-label={label}
           {...dataAttr}>
            
            <div className={`absolute top-3 right-3 z-20 transition-opacity duration-300 ${indicatorClasses}`}>
                 <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold border-2 ${indicatorBg}`}>
                    {status}
                </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className={`material-symbols-rounded leading-none ${iconClass} icon-large`}>
                    {icon}
                </span>
            </div>

            <div className="mt-auto"></div> 

            <div className="relative z-10 flex items-center justify-start">
                <h2 className={`font-semibold text-lg leading-tight ${textClass}`}>{label}</h2>
            </div>
        </a>
    );
};

const Container = ({ icon, label, color }) => {
    const colorStyle = colorMap[color] || colorMap.pink;
    return (
        <div className={`p-4 rounded-xl border-2 border-${colorStyle.base}/50 bg-${colorStyle.base}/10 text-center flex flex-col items-center justify-center min-h-[120px] cursor-pointer
                        transition duration-200 hover:shadow-lg hover:ring-2 hover:ring-${colorStyle.base}/50 hover:scale-[1.01]`}
             role="button" aria-label={label}>
            <span className={`material-symbols-rounded text-3xl text-${colorStyle.base}-400`}>{icon}</span>
            <p className={`font-medium text-base text-${colorStyle.base}-300 mt-2`}>{label}</p>
        </div>
    );
};

const ProductContent = ({ actionId }) => {
    

    if (actionId === 'simulados') {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[rgb(var(--page-fg))]">Menu Principal do Produto: Simulados e Provas</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border-2 border-white/10 bg-white/5 h-[200px]">
                    <Container icon="play_circle" label="Novo Simulado" color="pink" />
                    <Container icon="bar_chart" label="Resultados" color="cyan" />
                    <Container icon="assignment" label="Histórico de Provas" color="violet" />
                    <Container icon="trophy" label="Metas e Ranking" color="emerald" />
                </div>
            </div>
        );
    } 
    
    if (actionId === 'notas') {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[rgb(var(--page-fg))]">Menu Principal do Produto: Notas e Frequência</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border-2 border-white/10 bg-white/5 h-[200px]">
                    <Container icon="format_list_numbered" label="Boletim Completo" color="cyan" />
                    <Container icon="person_check" label="Taxa de Presença" color="pink" />
                    <Container icon="trending_up" label="Gráfico de Médias" color="amber" />
                    <Container icon="warning" label="Alertas de Notas" color="red" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 text-center">
            <p className="text-lg text-white/80 animate-pulse">O conteúdo para esta ação ({actionId}) ainda não foi implementado.</p>
        </div>
    );
};

const CatalogScreen = ({ onNavigate }) => {
    const apps = [
        { id: 'educacao', label: 'Educação', icon: 'cast_for_education', color: 'pink', status: 'Ativo' },
        { id: 'financeiro', label: 'Financeiro', icon: 'account_balance', color: 'emerald', status: 'Em breve' },
        { id: 'saude', label: 'Saúde', icon: 'health_and_safety', color: 'sky', status: 'Em breve' },
        { id: 'agenda', label: 'Agenda', icon: 'calendar_month', color: 'amber', status: 'Em breve' },
    ];

    return (
        <section id="screen-catalog" data-screen-id={SCREENS.CATALOG} 
                 className="flex justify-center mini-app-portfolio mt-8"> 
            <div className="grid grid-cols-2 gap-8">
                {apps.map(app => (
                    <MiniAppCard
                        key={app.id}
                        label={app.label}
                        icon={app.icon}
                        color={app.color}
                        status={app.status}
                        onClick={() => app.id === 'educacao' && onNavigate(SCREENS.PERSONA_SELECTION)}
                        dataAttr={{ 'data-app': app.id }}
                    />
                ))}
            </div>
        </section>
    );
};

const PersonaSelectionScreen = ({ onSelectPersona, selectedPersona, onNavigate }) => {
    const personas = [
        { id: 'aluno', label: 'Aluno', icon: 'school', color: 'pink', status: 'Ativo' },
        { id: 'tutor', label: 'Tutor/Responsável', icon: 'person_raised_hand', color: 'cyan', status: 'Em breve' },
        { id: 'professor', label: 'Professor', icon: 'local_library', color: 'violet', status: 'Em breve' },
        { id: 'instituicao', label: 'Instituição', icon: 'corporate_fare', color: 'emerald', status: 'Em breve' },
    ];

    const handleClick = (id, label) => {
        if (selectedPersona === id) {
            onSelectPersona(null);
        } else {
            onSelectPersona(id);
            if (id === 'aluno') {
                onNavigate(SCREENS.STUDENT_MENU, label);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            const isClickOnCard = e.target.closest('.mini-app-card-base');
            const isClickOnModal = e.target.closest('#user-panel');
            if (!isClickOnCard && !isClickOnModal && selectedPersona) {
                onSelectPersona(null);
            }
        };
        document.body.addEventListener('click', handleClickOutside);
        return () => document.body.removeEventListener('click', handleClickOutside);
    }, [selectedPersona, onSelectPersona]);


    return (
        <section id="screen-persona" data-screen-id={SCREENS.PERSONA_SELECTION} 
                 className="flex justify-center mini-app-portfolio mt-8">
             <div className="grid grid-cols-2 gap-8">
                {personas.map(p => (
                    <MiniAppCard
                        key={p.id}
                        label={p.label}
                        icon={p.icon}
                        color={p.color}
                        status={p.status}
                        selected={selectedPersona === p.id}
                        onClick={() => handleClick(p.id, p.label)}
                        dataAttr={{ 'data-persona': p.id }}
                    />
                ))}
            </div>
        </section>
    );
};

const StudentMenuScreen = ({ onOpenActionModal }) => {
    const studentActions = [
        { id: 'simulados', label: 'Simulados e Provas', icon: 'quiz', color: 'pink', status: 'Ativo' },
        { id: 'notas', label: 'Notas e Frequência', icon: 'rate_review', color: 'cyan', status: 'Ativo' },
        { id: 'agenda', label: 'Agenda e Tarefas', icon: 'calendar_today', color: 'amber', status: 'Em breve' },
        { id: 'conteudo', label: 'Conteúdo de Estudo', icon: 'book_4', color: 'violet', status: 'Em breve' },
    ];

    return (
        <section id="screen-aluno" data-screen-id={SCREENS.STUDENT_MENU} 
                 className="flex justify-center mini-app-portfolio mt-8">
            <div className="grid grid-cols-2 gap-8">
                {studentActions.map(action => (
                    <MiniAppCard
                        key={action.id}
                        label={action.label}
                        icon={action.icon}
                        color={action.color}
                        status={action.status}
                        onClick={() => onOpenActionModal(action)}
                        dataAttr={{ 'data-action': action.id, 'data-color': action.color }}
                    />
                ))}
            </div>
        </section>
    );
};

const App = () => {
    const { 
        data: userData, 
        updatePersona, 
        updateTheme, 
        clearUserData, 
        updateData, 
        confirmIntroToasts, 
        addConfirmedAlertId
    } = useUserData();
    
    const [currentScreen, setCurrentScreen] = useState(SCREENS.CATALOG);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', id: '', color: 'pink' });
    
    const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
    const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false); 
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

    const [showAccessibilityToast, setShowAccessibilityToast] = useState(false);
    const [showUserStatusToast, setShowUserStatusToast] = useState(false);
    
    const personaLabel = useMemo(() => {
        const personaId = userData.persona;
        if (!personaId) return '';
        const labels = {
            'aluno': 'Aluno', 'tutor': 'Tutor/Responsável', 'professor': 'Professor', 'instituicao': 'Instituição'
        };
        return labels[personaId] || ''; 
    }, [userData.persona]);

    const toastSequence = useMemo(() => {
        if (currentScreen !== SCREENS.CATALOG) return [];
        
        const messages = [];
        
        const statusMessage = userData.persona ? 
               `Perfil '${personaLabel}' carregado. Clique para entrar no Dashboard.` : 
               'Dica: Clique em Educação para iniciar sua jornada.';
               
        messages.push({ id: 'status', message: statusMessage });

        messages.push({
            id: 'app5horas',
            message: 'Aviso da Empresa: Produto desenvolvido pela App 5 Horas - Soluções Digitais.',
            linkUrl: 'https://app5horas.com.br/' 
        });

        return messages;
    }, [currentScreen, userData.persona, personaLabel]);

    const openUserPanel = useCallback(() => {
        setIsUserPanelOpen(true);
        setShowUserStatusToast(true);
    }, []);
    const closeUserPanel = useCallback(() => setIsUserPanelOpen(false), []);
    
    const openAccessibilityPanel = useCallback(() => { 
        setIsAccessibilityPanelOpen(true);
    }, []); 
    const closeAccessibilityPanel = useCallback(() => setIsAccessibilityPanelOpen(false), []); 
    
    const openNotificationPanel = useCallback(() => { 
        setIsNotificationPanelOpen(true);
    }, []); 
    const closeNotificationPanel = useCallback(() => setIsNotificationPanelOpen(false), []);

    const navigate = useCallback((screen, label = '') => {
        setCurrentScreen(screen);
        if (screen === SCREENS.PERSONA_SELECTION) {
            updatePersona(null);
        }
    }, [updatePersona]);

    const handleBack = useCallback(() => {
        if (currentScreen === SCREENS.STUDENT_MENU) {
            updatePersona(null); 
            setCurrentScreen(SCREENS.PERSONA_SELECTION);
        } else if (currentScreen === SCREENS.PERSONA_SELECTION) {
            updatePersona(null); 
            setCurrentScreen(SCREENS.CATALOG);
        } else if (currentScreen === SCREENS.CATALOG) {
            window.history.back();
        }
    }, [currentScreen, updatePersona]);

    const { title, subtitle, backText, showBackButton } = useMemo(() => {
        const commonBackText = "Voltar"; 
        let currentTitle = "Catálogo de Aplicações";
        let currentSubtitle = "Selecione o sistema que deseja acessar:";
        let currentShowBackButton = false;

        if (currentScreen === SCREENS.PERSONA_SELECTION) {
            currentTitle = "MiniApp: Educação";
            currentSubtitle = "Selecione seu perfil de acesso para customizar a experiência.";
            currentShowBackButton = true;
        } else if (currentScreen === SCREENS.STUDENT_MENU) {
            currentTitle = `Dashboard - ${personaLabel}`;
            currentSubtitle = "Selecione a funcionalidade que deseja acessar.";
            currentShowBackButton = true;
        }

        return { 
            title: currentTitle, 
            subtitle: currentSubtitle, 
            backText: commonBackText, 
            showBackButton: currentShowBackButton,
        };
    }, [currentScreen, personaLabel]);

    const openActionModal = useCallback((action) => {
        setModalContent({
            title: action.label,
            id: action.id,
            color: action.color,
        });
        setIsModalOpen(true);
    }, []);

    const closeActionModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const renderScreen = () => {
        if (currentScreen === SCREENS.CATALOG) {
            return <CatalogScreen onNavigate={navigate} />;
        } else if (currentScreen === SCREENS.PERSONA_SELECTION) {
            return <PersonaSelectionScreen 
                        onSelectPersona={updatePersona} 
                        selectedPersona={userData.persona}
                        onNavigate={navigate}
                    />;
        } else if (currentScreen === SCREENS.STUDENT_MENU) {
            return <StudentMenuScreen onOpenActionModal={openActionModal} />;
        }
        return null;
    };

    const presentationText = `Esta é a Central de Avisos. Aqui você pode revisar as notificações e o status de desenvolvimento da aplicação. (Confirme para desativar a sequência de alertas iniciais)`;
    
    const allAlerts = useMemo(() => {
        const persistentConfirmedIds = userData.confirmedAlertsIds || [];
        
        const alerts = [
            { 
                id: 'intro', 
                icon: 'history_edu', 
                title: 'Sobre este Painel', 
                message: presentationText, 
                isSpecial: true, 
                color: 'amber'
            },
            { 
                id: 'dica_educacao', 
                icon: 'info', 
                title: 'Alerta de Status', 
                message: 'Dica: Clique em Educação para iniciar sua jornada. (Confirme para ocultar)', 
                isSpecial: false, 
                color: 'amber'
            },
            { 
                id: 'aviso_empresa', 
                icon: 'rocket_launch', 
                title: 'Aviso da Empresa', 
                message: 'Produto desenvolvido pela App 5 Horas - Soluções Digitais.', 
                isSpecial: false, 
                color: 'cyan', 
                linkUrl: 'https://app5horas.com.br/' 
            },
            { 
                id: 'beta_test', 
                icon: 'bug_report', 
                title: 'Beta: Feedback', 
                message: 'Este app está em fase Beta. Envie feedback para ajudar no desenvolvimento.', 
                isSpecial: false, 
                color: 'red'
            },
        ];
        
        return alerts.map(alert => ({
            ...alert,
            status: (persistentConfirmedIds.includes(alert.id)) ? 'removed' : 'active',
        }));
    }, [userData.confirmedAlertsIds]);
    
    const unreadAlertCount = useMemo(() => {
        return allAlerts.filter(alert => alert.status === 'active').length;
    }, [allAlerts]);
    
    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{ __html: CSS_STYLES }} />

            <Header 
                onBack={handleBack} 
                backButtonText={backText} 
                showBackButton={showBackButton} 
                onOpenUserPanel={openUserPanel}
                title={title}
                subtitle={subtitle}
                personaLabel={personaLabel}
            />
            
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24"> 
                <React.Fragment>
                    {renderScreen()}
                </React.Fragment>
            </main>
            
            <UserPanelModal
                isOpen={isUserPanelOpen}
                onClose={closeUserPanel}
                userData={userData}
                updateTheme={updateTheme}
                updateData={updateData}
                clearUserData={clearUserData}
            />
            
            <AccessibilityPanelModal 
                isOpen={isAccessibilityPanelOpen}
                onClose={closeAccessibilityPanel}
            />
            
            <NotificationPanelModal 
                isOpen={isNotificationPanelOpen}
                onClose={closeNotificationPanel}
                onConfirmIntroToasts={confirmIntroToasts}
                onAddConfirmedAlertId={addConfirmedAlertId}
                initialAlerts={allAlerts}
                userData={userData}
            />

            <ActionModal 
                isOpen={isModalOpen} 
                onClose={closeActionModal} 
                title={modalContent.title} 
                color={modalContent.color}
            >
                <ProductContent actionId={modalContent.id} />
            </ActionModal>

            <GlobalOverlays
                toastSequence={toastSequence}
                onOpenAccessibilityPanel={openAccessibilityPanel}
                showAccessibilityFab={userData.showAccessibilityFab}
                showAccessibilityToast={showAccessibilityToast}
                setShowAccessibilityToast={setShowAccessibilityToast}
                showUserStatusToast={showUserStatusToast}
                setShowUserStatusToast={setShowUserStatusToast}
                userData={userData}
                onOpenNotificationPanel={openNotificationPanel}
                hasSeenIntroToasts={userData.hasSeenIntroToasts}
                unreadAlertCount={unreadAlertCount}
            />
            
        </React.Fragment>
    );
};


const calculateToastDuration = (message) => {
    const MIN_DURATION = 3000;
    const BASE_DURATION_MS = 1000;
    const READING_RATE_MS_PER_WORD = 180;

    if (!message) return MIN_DURATION;

    const wordCount = message.split(/\s+/).filter(Boolean).length;
    
    const calculatedDuration = (wordCount * READING_RATE_MS_PER_WORD) + BASE_DURATION_MS;

    return Math.max(calculatedDuration, MIN_DURATION);
};

const GlobalOverlays = ({ 
    toastSequence, 
    onOpenAccessibilityPanel, 
    showAccessibilityFab, 
    showAccessibilityToast, 
    setShowAccessibilityToast,
    showUserStatusToast,
    setShowUserStatusToast,
    userData,
    onOpenNotificationPanel, 
    hasSeenIntroToasts,
    unreadAlertCount
}) => {
    
    const isToastActive = showAccessibilityToast || showUserStatusToast;
    
    return (
        <React.Fragment>
            <ToastSequenceManager 
                toastSequence={toastSequence}
                isOverridden={isToastActive} 
                hasSeenIntroToasts={hasSeenIntroToasts}
            />
            
            <AccessibilityInstructionToast
                isVisible={showAccessibilityToast}
                onClose={() => setShowAccessibilityToast(false)}
            />
            
            <UserStatusToast
                isVisible={showUserStatusToast}
                onClose={() => setShowUserStatusToast(false)}
                userData={userData}
            />

            <AlertFAB onOpen={onOpenNotificationPanel} unreadAlertCount={unreadAlertCount} />

            {showAccessibilityFab && (
                <AccessibilityFAB 
                    onOpen={onOpenAccessibilityPanel}
                />
            )}
        </React.Fragment>
    );
};

const FloatingToast = ({ message, icon, colorBase, linkUrl, duration, isVisible, onClose, positioning = 'center', opaque = false }) => { 
    
    const colorClasses = {
        border: `border-${colorBase}-600/50`, 
        bg: opaque ? 'bg-[rgb(var(--page-bg)/0.9)] backdrop-blur-md' : `bg-${colorBase}-500/10 backdrop-blur-md`,
        text: `text-${colorBase}-700`,
        hoverBorder: `hover:border-${colorBase}-700`,
        shadow: opaque ? 'shadow-xl' : 'shadow-lg',
    };
    
    const finalDuration = duration || calculateToastDuration(message); 
    
    const [show, setShow] = useState(false);
    
    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onClose && onClose();
            }, finalDuration); 
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isVisible, finalDuration, onClose]);
    
    if (!message) return null;

    const content = (
        <div className={`flex items-center gap-2 rounded-full border-2 ${colorClasses.border} ${colorClasses.bg} px-4 py-2 text-sm font-semibold ${colorClasses.shadow} ${colorClasses.text} ${linkUrl ? colorClasses.hoverBorder + ' transition-colors' : ''}`}>
            <span className="material-symbols-rounded text-lg">{icon}</span>
            
            <div className="toast-message-roll-mask">
                <span key={message} className="toast-message-roll-wrapper">
                    {message}
                </span>
            </div>
            
        </div>
    );
    
    const positionClasses = positioning === 'left'
        ? 'bottom-16 left-4 right-auto max-w-[calc(100%-60px)] transform-none'
        : 'bottom-14 left-1/2 transform -translate-x-1/2';

    const toastClasses = `fixed z-50 transition-all duration-300 ${positionClasses} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`;
    
    return (
        <div className={toastClasses} role="status" aria-live="polite">
            {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                </a>
            ) : (
                content
            )}
        </div>
    );
};

const ToastSequenceManager = ({ toastSequence, isOverridden, hasSeenIntroToasts }) => {
    const [currentToastIndex, setCurrentToastIndex] = useState(0);
    const [isSequenceComplete, setIsSequenceComplete] = useState(false);
    
    const [isSequenceDelayed, setIsSequenceDelayed] = useState(true); 
    const INITIAL_DELAY_MS = 1000;

    useEffect(() => {
        if (toastSequence.length === 0) return;
        
        const delayTimer = setTimeout(() => {
            setIsSequenceDelayed(false);
        }, INITIAL_DELAY_MS);
        
        return () => clearTimeout(delayTimer);
    }, [toastSequence]);

    useEffect(() => {
        if (toastSequence.length > 0) {
            setCurrentToastIndex(0);
            setIsSequenceComplete(false);
            setIsSequenceDelayed(true);
        }
    }, [toastSequence, hasSeenIntroToasts]);

    useEffect(() => {
        if (isOverridden || isSequenceComplete || toastSequence.length === 0 || isSequenceDelayed || hasSeenIntroToasts) {
            return;
        }

        const currentToast = toastSequence[currentToastIndex];
        const duration = currentToast.duration || calculateToastDuration(currentToast.message);
        
        const timer = setTimeout(() => {
            if (currentToastIndex < toastSequence.length - 1) {
                setCurrentToastIndex(prev => prev + 1);
            } else {
                setIsSequenceComplete(true);
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [currentToastIndex, isSequenceComplete, isOverridden, isSequenceDelayed, toastSequence, hasSeenIntroToasts]);

    if (isSequenceComplete || isOverridden || toastSequence.length === 0 || isSequenceDelayed || hasSeenIntroToasts) {
        return null;
    }

    const currentToast = toastSequence[currentToastIndex];
    
    return (
        <FloatingToast 
            message={currentToast.message}
            icon="info" 
            colorBase="amber" 
            linkUrl={currentToast.linkUrl}
            isVisible={true}
            onClose={() => {}}
            positioning="left"
            opaque={true}
        />
    );
};

const AccessibilityInstructionToast = ({ isVisible, onClose }) => {
    
    const message = "Recursos de Acessibilidade em construção!";
    const icon = "accessibility_new";
    const colorBase = "amber";
    
    const duration = calculateToastDuration(message); 

    return (
        <FloatingToast 
            message={message}
            icon={icon}
            colorBase={colorBase}
            duration={duration}
            isVisible={isVisible}
            onClose={onClose}
            positioning="left" 
            opaque={true} 
        />
    );
};

const UserStatusToast = ({ isVisible, onClose, userData }) => {
    
    const isDataFilled = !!userData.name && !!userData.email && !!userData.phone;
    
    const message = isDataFilled
        ? `Bem-vindo(a), ${userData.name.split(' ')[0]}! Dados pessoais restaurados.`
        : 'Preencha seus dados na aba "Dados do Usuário" para salvá-los neste dispositivo.';

    const icon = isDataFilled ? "verified_user" : "contact_support";
    
    const colorBase = "amber";
    const duration = calculateToastDuration(message); 

    return (
        <FloatingToast 
            message={message}
            icon={icon}
            colorBase={colorBase}
            duration={duration} 
            isVisible={isVisible}
            onClose={onClose}
            positioning="left" 
            opaque={true} 
        />
    );
};

const AlertFAB = ({ onOpen, unreadAlertCount }) => {
    const isActive = unreadAlertCount > 0;
    
    const activeClasses = "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/50";
    
    const inactiveClasses = "bg-transparent hover:bg-amber-500/10 text-amber-500 border-2 border-amber-300/60 shadow-none";

    const fabClasses = `fixed bottom-20 left-4 z-40 w-10 h-10 rounded-full transition-all duration-300
                        flex items-center justify-center 
                        focus:outline-none focus:ring-4 focus:ring-amber-300/50
                        ${isActive ? activeClasses : inactiveClasses}`;
    
    const iconClass = isActive ? "text-white" : "text-amber-500";

    const ariaLabel = `Abrir Painel de Avisos. ${unreadAlertCount > 0 ? `Você tem ${unreadAlertCount} avisos novos.` : ''}`;

    return (
        <button 
            id="alert-fab"
            type="button" 
            onClick={onOpen}
            className={fabClasses}
            aria-label={ariaLabel}
        >
            <span className={`material-symbols-rounded text-xl ${iconClass}`}>
                notifications
            </span>
            
            {isActive && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 
                                 inline-flex items-center justify-center 
                                 w-5 h-5 text-xs font-bold leading-none 
                                 text-white bg-red-600 rounded-full border-2 border-[rgb(var(--page-bg))]">
                    {unreadAlertCount}
                </span>
            )}
        </button>
    );
};

const AccessibilityFAB = ({ onOpen }) => {
    const colorClass = "bg-violet-500 hover:bg-violet-600 text-white";
    const shadowClass = "shadow-lg shadow-violet-500/50";
    
    return (
        <button 
            id="accessibility-fab"
            type="button" 
            onClick={onOpen}
            className={`fixed bottom-4 left-4 z-40 w-10 h-10 rounded-full transition-all duration-200
                        flex items-center justify-center 
                        ${colorClass} ${shadowClass} 
                        focus:outline-none focus:ring-4 focus:ring-violet-300/50`}
            aria-label="Abrir Painel de Acessibilidade e Ajuda"
        >
            <span className="material-symbols-rounded text-xl">accessibility_new</span>
        </button>
    );
};

const NotificationPanelModal = ({ isOpen, onClose, onConfirmIntroToasts, onAddConfirmedAlertId, initialAlerts, userData }) => {
    
    const title = 'Avisos e Notificações';
    const subtitle = 'Central de status e alertas da aplicação.';
    const colorBase = 'amber-500';
    const icon = 'notifications';

    const colorClasses = {
        border: `border-${colorBase}/70`,
        bg: `bg-${colorBase}/15`,
    };
    
    const [activeAlerts, setActiveAlerts] = useState([]);
    
    useEffect(() => {
        if (isOpen) {
            setActiveAlerts(initialAlerts.filter(alert => alert.status !== 'removed'));
        }
    }, [isOpen, initialAlerts]);

    
    const CONFIRM_FEEDBACK_DURATION = 3000;


    const handleConfirmAlert = useCallback((id, isSpecial) => {
        if (isSpecial) {
            onConfirmIntroToasts();
        }
        onAddConfirmedAlertId(id);

        setActiveAlerts(prev => prev.map(alert => 
            alert.id === id ? { ...alert, status: 'confirmed' } : alert
        ));
        
        setTimeout(() => {
            setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
        }, CONFIRM_FEEDBACK_DURATION); 
        
    }, [onConfirmIntroToasts, onAddConfirmedAlertId]);


    const AlertCard = ({ alert }) => {
        const isConfirmedLocal = alert.status === 'confirmed';
        const alertColor = colorMap[alert.color] || colorMap.amber;
        
        const colorBase = isConfirmedLocal ? 'emerald-500' : alertColor.base;
        const icon = isConfirmedLocal ? 'check_circle' : alert.icon;
        const title = isConfirmedLocal ? `${alert.title} — LIDO e ARQUIVADO.` : alert.title;
        const message = isConfirmedLocal ? `Esta mensagem será arquivada em ${CONFIRM_FEEDBACK_DURATION/1000} segundos.` : alert.message;
        
        const titleTextClass = isConfirmedLocal ? 'text-emerald-800' : 'text-[rgb(var(--page-fg))]';
        const titleIconClass = isConfirmedLocal ? 'text-emerald-500' : `text-${alertColor.base}`;
        
        const cardBodyClasses = isConfirmedLocal 
            ? `p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-left transition duration-300`
            : `p-4 rounded-xl border-2 border-${alertColor.base}/50 bg-${alertColor.base}/10 text-left transition duration-300`;
        
        const contentClasses = isConfirmedLocal ? 'flex justify-start items-center gap-3' : 'flex justify-between items-start gap-4';

        return (
            <div key={alert.id} className="space-y-3">
                <h3 className={`text-base font-semibold ${titleTextClass} flex items-center gap-2`}>
                    <span className={`material-symbols-rounded text-lg ${titleIconClass}`}>{icon}</span>
                    {title}
                </h3>
                
                <div className={cardBodyClasses}>
                    <div className={contentClasses}>
                        <p className={`text-sm opacity-90 leading-relaxed ${isConfirmedLocal ? 'text-emerald-800' : 'text-[rgb(var(--page-fg))]'}`} aria-live="polite">
                            {message}
                            {alert.linkUrl && !isConfirmedLocal && ( 
                                <a href={alert.linkUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 ml-1 underline">
                                    [Acessar link]
                                </a>
                            )}
                        </p>
                        
                        {!isConfirmedLocal && (
                            <button
                                type="button"
                                onClick={() => handleConfirmAlert(alert.id, alert.isSpecial)}
                                className="flex-shrink-0 p-2 rounded-full transition-all duration-200 
                                           focus:outline-none focus:ring-4 focus:ring-emerald-300/50 
                                           hover:bg-emerald-100/50"
                                aria-label={`Confirmar que li o aviso ${alert.title}`}
                                title="Marcar como lido"
                            >
                                <span className="material-symbols-rounded text-xl text-emerald-600">done_all</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    
    const noticesToDisplay = activeAlerts;


    if (!isOpen) return null;
    
    const closeButtonBase = "inline-flex h-10 items-center gap-1 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    const closeIconClasses = "material-symbols-rounded text-lg text-cyan-500 group-hover:text-cyan-700";
    const closeTextClasses = "text-[rgb(var(--page-fg-muted))] text-sm font-medium";

    return (
        <div id="notification-panel" className="fixed inset-0 z-40 items-center justify-center bg-black/60 backdrop-blur-sm flex" aria-modal="true" role="dialog" onClick={onClose}>
            <div className={`mx-4 w-full max-w-md max-h-full overflow-y-auto rounded-3xl border-2 ${colorClasses.border} bg-[rgb(var(--page-bg))] bg-opacity-95 p-5 shadow-xl`} onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-start justify-between gap-3 pb-4 mb-4"> 
                    <div id="panel-title-container">
                        <div className="flex items-center mb-1">
                            <span className={`material-symbols-rounded text-lg text-${colorBase} mr-2`}>{icon}</span>
                            <h2 id="panel-title" className="text-base sm:text-lg font-semibold">{title}</h2>
                        </div>
                        <p id="panel-subtitle" className="mt-1 text-xs sm:text-[0.75rem] text-[rgb(var(--page-fg-muted))]">{subtitle}</p>
                    </div>
                    
                    <button id="alert-close" type="button" onClick={onClose} 
                        className={`${closeButtonBase} ${closeTextClasses} px-3`}
                        aria-label="Fechar painel de notificações"
                    >
                        <span className={`${closeIconClasses}`}>close</span>
                        <span className="hidden sm:inline">Fechar</span>
                    </button>
                </div>

                <div className="relative mt-3 space-y-6">
                    {noticesToDisplay.length > 0 ? (
                        noticesToDisplay.map(alert => (
                            <div key={alert.id} className="transition-all duration-500 ease-in-out">
                                <AlertCard alert={alert} />
                            </div>
                        ))
                    ) : (
                        <div className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-center">
                            <p className="text-sm text-emerald-800 font-medium">🎉 Parabéns! Sua caixa de entrada de avisos está vazia.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AccessibilityPanelModal = ({ isOpen, onClose }) => {
    
    const title = 'Acessibilidade e Ajuda';
    const subtitle = 'Painel de Configurações do App 5 Horas.';
    const colorBase = 'violet-500';
    const icon = 'accessibility_new';

    const colorClasses = {
        border: `border-${colorBase}/70`,
        bg: `bg-${colorBase}/15`,
    };
    
    const accessibilityActions = [
        { label: 'Alto Contraste', icon: 'contrast', color: 'cyan' },
        { label: 'Ajuste de Fonte', icon: 'text_fields', color: 'emerald' },
        { label: 'Leitura de Tela', icon: 'volume_up', color: 'pink' },
        { label: 'Comandos de Voz', icon: 'mic', color: 'amber' },
    ];
    

    if (!isOpen) return null;
    
    const closeButtonBase = "inline-flex h-10 items-center gap-1 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    const closeIconClasses = "material-symbols-rounded text-lg text-cyan-500 group-hover:text-cyan-700";
    const closeTextClasses = "text-[rgb(var(--page-fg-muted))] text-sm font-medium";

    return (
        <div id="accessibility-panel" className="fixed inset-0 z-40 items-center justify-center bg-black/60 backdrop-blur-sm flex" aria-modal="true" role="dialog" onClick={onClose}>
            <div className={`mx-4 w-full max-w-md max-h-full overflow-y-auto rounded-3xl border-2 ${colorClasses.border} bg-[rgb(var(--page-bg))] bg-opacity-95 p-5 shadow-xl`} onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-start justify-between gap-3 pb-4 mb-4">
                    <div id="panel-title-container">
                        <div className="flex items-center mb-1">
                            <span className={`material-symbols-rounded text-lg text-${colorBase} mr-2`}>{icon}</span>
                            <h2 id="panel-title" className="text-base sm:text-lg font-semibold">{title}</h2>
                        </div>
                        <p id="panel-subtitle" className="mt-1 text-xs sm:text-[0.75rem] text-[rgb(var(--page-fg-muted))]">{subtitle}</p>
                    </div>
                    
                    <button id="help-close" type="button" onClick={onClose} 
                        className={`${closeButtonBase} ${closeTextClasses} px-3`}
                        aria-label="Fechar painel de acessibilidade"
                    >
                        <span className={`${closeIconClasses}`}>close</span>
                        <span className="hidden sm:inline">Fechar</span>
                    </button>
                </div>

                <div className="relative mt-3 space-y-6">
                    
                    <div className="space-y-3">
                        <h3 className="text-base font-semibold text-[rgb(var(--page-fg))] flex items-center gap-2 mb-3">
                            <span className={`material-symbols-rounded text-lg text-violet-500`}>settings_accessibility</span>
                            Ferramentas de Customização (Em breve)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {accessibilityActions.map((action, index) => (
                                <Container key={index} 
                                    icon={action.icon} 
                                    label={action.label} 
                                    color={action.color} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserPanelModal = ({ isOpen, onClose, userData, updateTheme, updateData, clearUserData }) => {
    const [currentTab, setCurrentTab] = useState('data');
    const [formData, setFormData] = useState({
        name: userData.name || '',
        phone: maskPhone(userData.phone || ''),
        email: userData.email || '',
        cep: maskCEP(userData.cep || ''),
        birthDate: maskBirthDate(userData.birthDate || ''),
        country: userData.country || 'Brasil',
    });
    
    const showFab = userData.showAccessibilityFab ?? true;

    const getStatusText = (isCleared = false) => {
        if (isCleared) return { text: 'Dados removidos e tema redefinido.', tone: 'error' };

        const isDataFilled = !!userData.name || !!userData.email || !!userData.phone;
        return isDataFilled 
            ? { text: 'Dados restaurados.', tone: 'ok' }
            : { text: 'Preencha seus dados na aba "Dados do Usuário" para salvá-los neste dispositivo.', tone: 'warn' };
    };

    const [statusMessage, setStatusMessage] = useState(getStatusText());
    
    useEffect(() => {
        setFormData({
            name: userData.name || '',
            phone: maskPhone(userData.phone || ''),
            email: userData.email || '',
            cep: maskCEP(userData.cep || ''),
            birthDate: maskBirthDate(userData.birthDate || ''),
            country: userData.country || 'Brasil',
        });
        setStatusMessage(getStatusText());
    }, [userData.name, userData.phone, userData.email, userData.cep, userData.birthDate, userData.country, isOpen]);


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        
        let newValue = value;
        
        if (name === 'phone') {
            newValue = maskPhone(value);
        } else if (name === 'cep') {
            newValue = maskCEP(value);
        } else if (name === 'birthDate') {
            newValue = maskBirthDate(value);
        }

        setFormData(prev => {
            const newFormData = { ...prev, [name]: newValue };
            
            if (['name', 'phone', 'email', 'cep', 'birthDate', 'country'].includes(name)) {
                let valueToSave = newValue;
                if (name === 'cep' || name === 'birthDate') {
                    valueToSave = newValue.replace(/\D/g, ''); 
                }
                updateData(name, valueToSave.trim());
            }

            setStatusMessage({ text: 'Dados salvos automaticamente.', tone: 'ok' });
            return newFormData;
        });
    }
    
    const handleFabToggle = (e) => {
        const newValue = e.target.checked;
        updateData('showAccessibilityFab', newValue);
        setStatusMessage({ text: `Botão de Acessibilidade ${newValue ? 'ativado' : 'desativado'}.`, tone: 'ok' });
    };

    const handleClearData = () => {
        clearUserData();
        setFormData({ 
            name: '', 
            phone: '', 
            email: '', 
            cep: '', 
            birthDate: '', 
            country: 'Brasil'
        }); 
        setStatusMessage(getStatusText(true));
        setCurrentTab('data');
        setTimeout(onClose, 500);
    }
    
    
    const ThemeSelectionPlaceholder = () => (
        <div className="space-y-4 pt-1"> 
            
            <div className="p-3 rounded-xl border border-sky-300/70 bg-sky-500/5 transition duration-150 ease-in-out hover:shadow-md">
                <h3 className="font-semibold text-base text-sky-700 flex items-center">
                    <span className="material-symbols-rounded text-lg text-sky-500 align-middle mr-2">contrast</span>
                    Customização de Tema
                </h3>
                <p className="mt-1 text-sm text-[rgb(var(--page-fg))] opacity-90">
                    A alternância entre temas Claro e Escuro (Dark Mode) será implementada em breve.
                </p>
            </div>
            
            <div className="p-3 rounded-xl border border-violet-300/70 bg-violet-500/5 transition duration-150 ease-in-out hover:shadow-md">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-base text-violet-700 flex items-center">
                            <span className="material-symbols-rounded text-lg text-violet-500 align-middle mr-2">accessibility_new</span>
                            Botão de Acessibilidade (FAB)
                        </h3>
                        <p className="mt-1 text-xs text-[rgb(var(--page-fg))] opacity-80">
                            Exibe o botão flutuante de Acessibilidade no canto inferior esquerdo.
                        </p>
                    </div>
                    
                    <label className="toggle-switch ml-4 flex-shrink-0">
                        <input 
                            type="checkbox" 
                            checked={showFab} 
                            onChange={handleFabToggle} 
                            aria-label="Ativar/desativar botão de acessibilidade"
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'data', label: 'Dados do Usuário', title: 'Central do Usuário', subtitle: 'Gerencie seus dados e o comportamento do sistema.', base: 'emerald-500', icon: 'badge' },
        { id: 'prefs', label: 'Preferências', title: 'Preferências', subtitle: 'Configurações que controlam a aparência do sistema.', base: 'sky-500', icon: 'settings' },
        { id: 'security', label: 'Segurança', title: 'Segurança', subtitle: 'Ações permanentes e críticas do sistema.', base: 'red-500', icon: 'lock' },
    ];
    
    const activeTab = tabs.find(t => t.id === currentTab);

    const activeColorClasses = activeTab ? {
        base: activeTab.base,
        text: `text-${activeTab.base}/90`,
        border: `border-${activeTab.base}/70`,
        bg: `bg-${activeTab.base}/15`,
    } : {};

    const closeButtonBase = "inline-flex h-10 items-center gap-1 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    const closeIconClasses = "material-symbols-rounded text-lg text-cyan-500 group-hover:text-cyan-700";
    const closeTextClasses = "text-[rgb(var(--page-fg-muted))] text-sm font-medium";


    if (!isOpen) return null;

    return (
        <div id="user-panel" className="fixed inset-0 z-40 items-center justify-center bg-black/60 backdrop-blur-sm flex" aria-modal="true" role="dialog" onClick={onClose}>
            <div className={`mx-4 w-full max-w-md max-h-full overflow-y-auto rounded-3xl border-2 ${activeColorClasses.border} bg-[rgb(var(--page-bg))] bg-opacity-95 p-5 shadow-xl`} onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-start justify-between gap-3">
                    <div id="panel-title-container">
                        <h2 id="panel-title" className="text-base sm:text-lg font-semibold">{activeTab.title}</h2>
                        <p id="panel-subtitle" className="mt-1 text-xs sm:text-[0.75rem] text-[rgb(var(--page-fg-muted))]">{activeTab.subtitle}</p>
                    </div>
                    
                    <button id="user-close" type="button" onClick={onClose} 
                        className={`${closeButtonBase} ${closeTextClasses} px-3`}
                        aria-label="Fechar painel do usuário"
                    >
                        <span className={`${closeIconClasses}`}>close</span>
                        <span className="hidden sm:inline">Fechar</span>
                    </button>
                </div>

                <div id="tab-header" className="flex gap-2 border-b border-[rgb(var(--page-border)/0.18)] mt-4 mb-4 pb-1">
                    {tabs.map(tab => {
                        const isCurrent = currentTab === tab.id;
                        const tabBase = tab.base;
                        const activeClasses = isCurrent 
                            ? `border-b-2 text-${tabBase}/90 bg-${tabBase}/10 font-bold`
                            : 'border-b-2 border-transparent hover:border-[rgb(var(--page-fg-muted))] hover:text-[rgb(var(--page-fg))]';
                        
                        const iconColorClass = `text-${tabBase}/80`;

                        return (
                            <button key={tab.id} 
                                data-tab={tab.id} 
                                className={`tab-button inline-flex items-center px-3 text-sm transition focus:outline-none gap-1 ${activeClasses}`} 
                                onClick={() => setCurrentTab(tab.id)}>
                                <span className={`material-symbols-rounded text-base ${iconColorClass}`}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative mt-3 min-h-[420px]">
                    
                    {currentTab === 'data' && (
                        <div id="tab-data" className={`tab-content border-2 ${activeColorClasses.border} bg-${activeColorClasses.base}/10 rounded-2xl p-4 absolute top-0 left-0 w-full`}>
                            <form id="user-form" className="space-y-4 text-sm">
                                <div>
                                <label htmlFor="user-name" className="block text-xs font-medium mb-1 flex items-center">
                                    <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>person</span>
                                    Nome completo
                                </label>
                                <input id="user-name" name="name" type="text" value={formData.name} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} placeholder="Seu nome e sobrenome" required/>
                                </div>
                                
                                <div>
                                <label htmlFor="user-phone" className="block text-xs font-medium mb-1 flex items-center">
                                    <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>phone</span>
                                    Telefone (WhatsApp)
                                </label>
                                <input id="user-phone" name="phone" type="tel" inputMode="tel" value={formData.phone} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} placeholder="+55 DDD número" required/>
                                </div>
                                
                                <div>
                                <label htmlFor="user-email" className="block text-xs font-medium mb-1 flex items-center">
                                    <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>mail</span>
                                    E-mail
                                </label>
                                <input id="user-email" name="email" type="email" value={formData.email} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} placeholder="seuemail@exemplo.com" required/>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="user-cep" className="block text-xs font-medium mb-1 flex items-center">
                                            <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>location_on</span>
                                            CEP
                                        </label>
                                        <input id="user-cep" name="cep" type="text" inputMode="numeric" pattern="[0-9]*" maxLength="9" value={formData.cep} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} placeholder="00000-000" required/>
                                    </div>

                                    <div>
                                        <label htmlFor="user-birthDate" className="block text-xs font-medium mb-1 flex items-center">
                                            <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>cake</span>
                                            Data de Nascimento
                                        </label>
                                        <input id="user-birthDate" name="birthDate" type="text" inputMode="numeric" pattern="[0-9]*" maxLength="10" value={formData.birthDate} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} placeholder="DD/MM/AAAA" required/>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="user-country" className="block text-xs font-medium mb-1 flex items-center">
                                        <span className={`material-symbols-rounded text-base text-${activeColorClasses.base} mr-1`}>public</span>
                                        País
                                    </label>
                                    <select id="user-country" name="country" value={formData.country} onChange={handleFormChange} className={`w-full rounded-xl border-2 border-${activeColorClasses.base}/40 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${activeColorClasses.base}/80 focus:border-transparent text-[rgb(var(--page-fg))]`} required>
                                        <option value="Brasil">Brasil</option>
                                        <option value="Outro">Outro (Especifique)</option>
                                    </select>
                                </div>
                                
                            </form>
                        </div>
                    )}

                    {currentTab === 'prefs' && (
                        <div id="tab-prefs" className={`tab-content border-2 ${activeColorClasses.border} bg-${activeColorClasses.base}/10 rounded-2xl p-4 absolute top-0 left-0 w-full`}>
                            <ThemeSelectionPlaceholder />
                        </div>
                    )}
                    
                    {currentTab === 'security' && (
                        <div id="tab-security" className={`tab-content border-2 ${activeColorClasses.border} bg-${activeColorClasses.base}/10 rounded-2xl p-4 absolute top-0 left-0 w-full`}>
                            <div className="space-y-4">
                                <h3 className={`text-sm font-semibold text-${activeColorClasses.base}/90 flex items-center`}>
                                    <span className={`material-symbols-rounded text-base text-${activeColorClasses.base}/90 mr-1`}>warning</span>
                                    Exclusão de Dados
                                </h3>
                                <p className="text-sm text-[rgb(var(--page-fg))] opacity-90">
                                    Esta ação removerá todos os seus dados (Nome, E-mail, Telefone, e Preferências de Tema) salvos **apenas neste dispositivo** (memória local). Esta ação é permanente e irreversível.
                                </p>
                                <div className="mt-6 flex justify-end">
                                    <button id="user-delete" type="button" onClick={handleClearData} 
                                            className="inline-flex h-10 items-center gap-2 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-red-300/40 hover:bg-red-500/10 group" 
                                            aria-label="Remover dados">
                                        
                                        <span className="material-symbols-rounded text-lg text-red-500 group-hover:text-red-700">delete</span>
                                        <span className="text-red-500 group-hover:text-red-700 text-sm font-medium">Remover dados permanentemente</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                </div>
                
                <div id="panel-status-footer" className={`mt-4 pt-3 border-t-2 border-[rgb(var(--page-border)/0.18)]`}>
                    <p id="user-status-text" className={`text-[0.8rem] text-center ${statusMessage.tone === 'ok' ? 'text-emerald-600' : statusMessage.tone === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                        {statusMessage.text}
                    </p>
                </div>
                
            </div>
        </div>
    );
}


const ActionModal = ({ isOpen, onClose, title, color, children }) => {
    const colorRgb = colorMap[color]?.rgb || '255 255 255';
    const borderStyle = { borderColor: `rgb(${colorRgb} / 0.8)` };

    const closeButtonBase = "inline-flex h-10 items-center gap-1 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    const closeIconClasses = "material-symbols-rounded text-lg text-cyan-500 group-hover:text-cyan-700";


    return (
        <div 
            id="action-modal" 
            className={`${isOpen ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm`} 
            aria-modal="true" 
            role="dialog" 
            onClick={onClose}
        >
            <div 
                id="action-modal-content" 
                className="mx-4 w-full overflow-y-auto rounded-3xl border-2 p-6 shadow-xl bg-[rgb(var(--page-bg))] bg-opacity-95" 
                style={borderStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 pb-4"> 
                    <h2 id="action-modal-title" className="text-xl sm:text-2xl font-bold text-[rgb(var(--page-fg))]">{title}</h2>
                    <button type="button" onClick={onClose} 
                        className={`${closeButtonBase} h-7 w-7`} 
                        aria-label="Fechar janela">
                        <span className={`${closeIconClasses}`}>close</span>
                    </button>
                </div>

                <div id="action-modal-body" className="mt-4 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Header = ({ onBack, backButtonText, showBackButton, onOpenUserPanel, title, subtitle, personaLabel }) => {
    
    const iconClasses = "material-symbols-rounded text-2xl text-cyan-500"; 
    
    // Botão de ícone/texto - largura flexível e padding para texto
    const userButtonBase = "inline-flex h-10 items-center gap-1 rounded-full px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    
    // Botão Voltar: w-10 h-10 (Ícone Puro) -> ALTERADO para ser flexível com texto
    const backButtonBase = "inline-flex h-10 items-center gap-1 rounded-full px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 hover:bg-[rgb(var(--page-fg-muted)/0.1)] group";
    
    const iconHover = "group-hover:text-cyan-700";

    const userLabel = personaLabel || "Usuário";
    const userLabelClasses = "text-base font-medium text-[rgb(var(--page-fg))] group-hover:text-cyan-700 transition duration-200 hidden sm:inline";
    const backLabelClasses = "text-base font-medium text-[rgb(var(--page-fg))] group-hover:text-cyan-700 transition duration-200 hidden sm:inline";


    return (
        <header className="fixed top-0 inset-x-0 z-30 px-4 pt-3 pb-2">
            <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
                
                <div className="flex items-center gap-1">
                    <button 
                        id="back-btn" 
                        type="button" 
                        onClick={onBack}
                        // Usando a nova classe flexível para permitir o texto
                        className={`${backButtonBase} ${showBackButton ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
                        aria-label={backButtonText}
                    >
                        <span className={`${iconClasses} ${iconHover}`}>arrow_back</span>
                        {/* Adicionando a label de Voltar */}
                        <span className={backLabelClasses}>{backButtonText}</span>
                    </button>
                </div>
                
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full sm:max-w-xs transition-opacity duration-300">
                    <div className="inline-flex items-center justify-center gap-2">
                        <span className="material-symbols-rounded text-2xl text-cyan-500">apps</span>
                        <h1 className="text-2xl font-bold text-[rgb(var(--page-fg))] truncate max-w-full leading-none">{title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button 
                        id="user-btn" 
                        type="button" 
                        onClick={onOpenUserPanel} 
                        className={userButtonBase}
                        aria-label="Abrir painel do usuário"
                    >
                        <span className={`${iconClasses} ${iconHover}`}>account_circle</span>
                        <span className={userLabelClasses}>{userLabel}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default App;
