// 1. Acesso Global aos Hooks do React (SEM IMPORT)
const { useState, useEffect, useCallback, useMemo } = React;

// --- Variáveis Globais de Ambiente (Não usadas, mas mantidas por convenção) ---
const APP_ID = 'miniapps-app-id'; 
const FIREBASE_CONFIG = {}; 
const INITIAL_AUTH_TOKEN = null; 

// --- DADOS DA APLICAÇÃO ---
const PORTFOLIO_ITEMS = [
    { id: 'education', titleKey: "menu_education", view: 'education-categories', color: "pink", icon: "cast_for_education" },
    { id: 'finance', titleKey: "menu_finance", view: 'finance-menu', color: "emerald", icon: "account_balance" },
    { id: 'health', titleKey: "menu_health", view: 'health-menu', color: "sky", icon: "health_and_safety" },
    { id: 'tasks', titleKey: "menu_tasks", view: 'tasks-menu', color: "amber", icon: "calendar_month" },
];

const EDUCATION_CATEGORIES = [
    { id: 'student', titleKey: "edu_students", view: 'student-menu', color: "sky", icon: "person" },
    { id: 'responsible', titleKey: "edu_responsible", view: 'responsible-menu', color: "violet", icon: "diversity_3", statusKey: "coming_soon", isComingSoon: true },
    { id: 'tutors', titleKey: "edu_tutors", view: 'tutor-menu', color: "amber", icon: "supervisor_account", statusKey: "coming_soon", isComingSoon: true },
    { id: 'institution', titleKey: "edu_institutions", view: 'institution-menu', color: "purple", icon: "apartment", statusKey: "coming_soon", isComingSoon: true },
];

const STUDENT_MENU_ITEMS = [
    { titleKey: "edu_student_profile", action: 'modal', modalId: 'registration', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/educacao/student-registration.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/educacao/', color: "blue", icon: "app_registration" },
    { titleKey: "edu_simulados", action: 'modal', modalId: 'simulados', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/educacao/simulados.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/educacao/', color: "pink", icon: "edit_note", statusKey: "coming_soon", isComingSoon: true },
    { titleKey: "edu_agenda", action: 'placeholder', color: "teal", icon: "event", statusKey: "coming_soon", isComingSoon: true },
];

const TASKS_MENU_ITEMS = [
    { titleKey: "tasks_weekly_planner", action: 'modal', modalId: 'weekly-planner', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/weekly-planner.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/', color: "amber", icon: "event_note" },
    { titleKey: "tasks_list", action: 'modal', modalId: 'tasks', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/tasks.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/', color: "red", icon: "check_box" },
    { titleKey: "tasks_monthly_calendar", action: 'modal', modalId: 'monthly-calendar', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/monthly-calendar.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/', color: "blue", icon: "calendar_month" },
    { titleKey: "tasks_tracking", action: 'modal', modalId: 'tracking-dashboard', url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/tracking-dashboard.html', basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/products/tarefas/', color: "purple", icon: "timeline" },
];

const VIEW_MAP = {
    'portfolio': { titleKey: "portfolio_title_full", subtitleKey: "portfolio_subtitle", data: PORTFOLIO_ITEMS },
    'education-categories': { titleKey: "education_categories_title", subtitleKey: "education_categories_subtitle", data: EDUCATION_CATEGORIES, parent: 'portfolio' },
    'finance-menu': { titleKey: "finance_menu_title", subtitleKey: "finance_menu_subtitle", data: [], parent: 'portfolio' },
    'health-menu': { titleKey: "health_menu_title", subtitleKey: "health_menu_subtitle", data: [], parent: 'portfolio' },
    'tasks-menu': { titleKey: "tasks_menu_title", subtitleKey: "tasks_menu_subtitle", data: TASKS_MENU_ITEMS, parent: 'portfolio' },
    'student-menu': { titleKey: "student_area_title", subtitleKey: "student_area_subtitle", data: STUDENT_MENU_ITEMS, parent: 'education-categories' },
};

const AUTH_ITEM_CONFIG = {
    id: 'auth',
    titleKey: "auth_modal_cta",
    action: 'modal',
    modalId: 'auth-modal',
    url: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/src/components/auth-panel.html',
    basePath: 'https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@main/src/components/',
    color: "purple",
    icon: "lock_open"
};


// --- Componente de Card (120x120px Padronizado) ---
const AppCard = ({ item, onClick, t = (key) => key }) => {
    const isComingSoon = !!item.isComingSoon;
    const opacity = isComingSoon ? 'opacity-50 pointer-events-none' : '';
    const clickHandler = isComingSoon ? (e) => e.preventDefault() : onClick;
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const statusLabel = item.statusKey ? t(item.statusKey) : item.status;

    return (
        <div 
            onClick={clickHandler} 
            role="button" 
            className={`card-base border-${item.color}-500 bg-${item.color}-500/20 w-32 h-32 md:w-36 md:h-36 ${opacity} hover:ring-2 hover:ring-${item.color}-500 transition-all duration-300`}
        >
            {isComingSoon && (
                <div className="absolute top-1 right-1 z-20">
                    <span className="bg-gray-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                        {statusLabel}
                    </span>
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span 
                    style={{ fontSize: '6.5rem', transform: 'translateY(-0.75rem)' }} 
                    className={`material-symbols-rounded leading-none text-${item.color}-500 opacity-30`}
                >
                    {item.icon}
                </span>
            </div>
            <div className="relative z-10 flex flex-col justify-end h-full text-center pb-2">
                <h2 className={`text-sm text-${item.color}-700 font-semibold leading-tight`}>{title}</h2>
            </div>
        </div>
    );
};

// --- Componente de Modal com Iframe (Carregamento de MiniApp) ---
const MiniAppModal = ({ modalConfig, closeModal, loading, setLoading, appId, fbConfig, t }) => {
    const iframeRef = React.useRef(null);
    const { modalId, url, basePath } = modalConfig;
    const translate = t || ((key) => (window?.FALLBACK_I18N?.['pt-BR']?.[key] || key));

    // Função para carregar o MiniApp no iframe
    const loadMiniAppContent = useCallback(async () => {
        if (!url || !iframeRef.current) return;

        setLoading(true);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            let htmlContent = await response.text();

            // Limpeza e otimização do conteúdo injetado (como no original)
            htmlContent = htmlContent
                .replace(/<header[\s\S]*?<\/header>/gi, '') // Remove headers
                .replace(/data-theme="dark"/g, 'data-theme="light"'); // Força tema claro

            const baseTag = `<base href="${basePath}">`;

            // INJEÇÃO DE CONFIGS BÁSICAS
            const configScript = `
                <script>
                    window.__app_id = "${appId}"; 
                </script>
            `;

            // Estilos de limpeza e adaptação para o iframe
            const styleClean = `
            <style>
                /* Otimização CSS para o iframe */
                html, body {
                    padding-bottom: 120px !important; 
                    background: transparent !important; 
                }
                main {
                    box-shadow: none !important; border: none !important;
                    background-color: transparent !important;
                    padding: 1.5rem !important; margin: 0 !important;
                }
            </style>
            `;
            
            // Injeta a configuração ANTES do conteúdo do MiniApp
            iframeRef.current.srcdoc = htmlContent.replace('<head>', `<head>${configScript}${baseTag}${styleClean}`);

            iframeRef.current.onload = () => {
                setLoading(false);
            };

        } catch (error) {
            console.error(`Falha ao carregar MiniApp:`, error);
            const fileName = (url && url.split('/').pop()) || modalId || '';
            const errorMessage = translate('error_loading_file_failure').replace('{file}', fileName);
            const errorTitle = translate('error_loading_title');
            iframeRef.current.srcdoc = `<div style="text-align:center; padding:2rem; font-family:sans-serif;">
                <h3 style="color:#ef4444; margin:0;">${errorTitle}</h3>
                <p style="color:#9ca3af; font-size:0.9rem;">${errorMessage}</p>
            </div>`;
            setLoading(false);
        }
    }, [url, basePath, setLoading, appId]);

    useEffect(() => {
        loadMiniAppContent();
    }, [loadMiniAppContent]);

    return (
        <div id={`${modalId}-modal-overlay`} tabIndex="-1" aria-hidden="true" 
             className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-5xl h-full bg-white rounded-2xl shadow-2xl border border-indigo-500 flex flex-col overflow-hidden animate-fade-in-up">
                {/* Botão Fechar no canto superior direito do Modal */}
                <button onClick={closeModal}
                        className="absolute top-4 right-4 z-20 chip-button font-medium rounded-full text-sm px-4 py-2.5 inline-flex items-center shadow-md transition-transform hover:scale-105 bg-white border border-red-300 text-red-500">
                    <span className="material-symbols-rounded text-xl mr-2">close</span>
                    <span>{translate('action_close')}</span>
                </button>
                
                {/* Iframe que carrega o MiniApp */}
                <iframe 
                    ref={iframeRef} 
                    className="w-full h-full border-0" 
                    title={`App ${translate(modalConfig.titleKey || modalConfig.title || modalId)}`}
                ></iframe>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 z-30 flex justify-center items-center bg-white/80 backdrop-blur-sm">
                        <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9171 97.0079 33.5532C95.2932 28.8223 92.871 24.3692 89.8167 20.348C85.8318 15.352 80.8878 11.238 75.2124 7.95925C69.3789 4.47169 63.0454 2.19507 56.5135 1.07246C53.5136 0.514332 50.4131 0.473551 47.4653 0.999784C43.3421 1.77636 39.399 3.25708 35.8458 5.41995C33.454 6.94273 31.543 8.87895 30.0163 11.1397C28.4896 13.4005 27.3503 15.8996 26.6521 18.5273C25.9538 21.1551 25.6174 23.8821 25.6174 26.6346Z" fill="current-fill"/></svg>
                        <p className="ml-3 text-sm font-semibold text-gray-700">{translate('loading_miniapp')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componente Principal (Next.js Page/App Component) ---
// CORREÇÃO: Removido 'export default' para expor App globalmente
function App({ t: providedT }) {
    const defaultTranslator = (key) => (window?.FALLBACK_I18N?.['pt-BR']?.[key] || key);
    const t = providedT || defaultTranslator;
    // 1. Estados de Autenticação (SIMULADA)
    const [userPhone, setUserPhone] = useState(localStorage.getItem('user_phone') || null); // Inicializa com o valor salvo
    const isAuthReady = true; 
    
    // 2. Estados de Navegação
    const [currentView, setCurrentView] = useState('portfolio');
    const [history, setHistory] = useState([]);
    const [isNavMinimized, setIsNavMinimized] = useState(false);
    
    // 3. Estados de Modal
    const [modalConfig, setModalConfig] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [placeholderVisible, setPlaceholderVisible] = useState(false);

    // --- Lógica de Minimização (Timer de Inatividade) ---
    useEffect(() => {
        const MINIMIZE_DELAY = 5000; 
        let timer;

        const startTimer = () => {
            timer = setTimeout(() => {
                setIsNavMinimized(true);
            }, MINIMIZE_DELAY);
        };

        const resetTimer = () => {
            clearTimeout(timer);
            setIsNavMinimized(false);
            startTimer();
        };
        
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);
        
        // CORREÇÃO: Usa o estado inicial (userPhone) para iniciar o timer
        startTimer();
        
        // --- Comunicação com o MiniApp de Autenticação (Login) ---
        const handleAuthMessage = (event) => {
            if (event.data && event.data.type === 'AUTH_SUCCESS' && event.data.phone) {
                setUserPhone(event.data.phone);
                closeModal(); // Fecha o modal após o login
            }
        };

        window.addEventListener('message', handleAuthMessage);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            window.removeEventListener('message', handleAuthMessage);
        };
    }, [currentView, modalConfig]); 

    // --- 2. Lógica de Navegação (Views) ---
    
    // Função para navegar para uma nova view
    const navigateTo = (newView, pushToHistory = true) => {
        if (currentView !== newView && pushToHistory) {
            setHistory(prev => [...prev, currentView]);
        }
        setCurrentView(newView);
    };

    // Função para voltar
    const goBack = () => {
        if (history.length > 0) {
            const previousView = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1)); // Remove o último item
            setCurrentView(previousView);
        } else {
            setCurrentView('portfolio');
        }
    };
    
    // --- 3. Lógica de Modal/MiniApp ---
    
    const handleCardClick = (item) => {
        if (item.isComingSoon) return;

        if (item.action === 'modal') {
            setModalConfig(item);
            setModalLoading(true);
        } else if (item.action === 'placeholder') {
            setPlaceholderVisible(true);
        } else if (item.view) {
            navigateTo(item.view);
        }
    };

    const closeModal = () => {
        setModalConfig(null);
        setPlaceholderVisible(false);
    };
    
    // Função para abrir o modal de autenticação (usada pelo botão flutuante)
    const openAuthModal = () => {
        handleCardClick(AUTH_ITEM_CONFIG);
    };


    // --- 4. Renderização Condicional da View Atual ---
    const currentViewData = VIEW_MAP[currentView] || VIEW_MAP['portfolio'];
    const renderedItems = useMemo(() => currentViewData.data || [], [currentViewData.data]);
    
    const RenderedView = ({ titleKey, subtitleKey, title, subtitle, items, t }) => {
        const resolvedTitle = titleKey ? t(titleKey) : title;
        const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;
        return (
            <div className="flex flex-col items-center">
                <section className="mt-4 text-center w-full">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-800">{resolvedTitle}</h1>
                    <p className="mt-1 text-sm text-gray-500">{resolvedSubtitle}</p>
                </section>
                <div className="app-grid-container w-full max-w-5xl">
                    <section className="mt-6 app-grid-base-flexible mx-auto">
                        {items.map((item, index) => (
                            <AppCard
                                key={item.id || index}
                                item={item}
                                onClick={() => handleCardClick(item)}
                                t={t}
                            />
                        ))}
                    </section>
                </div>
            </div>
        );
    };
    
    // O Painel de Alertas é um placeholder
    const AlertPanel = () => {
        const currentUserLabel = userPhone || t('status_not_logged');
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-amber-600">{t('alerts_title')}</h2>
                <span className="material-symbols-rounded text-6xl text-amber-400">info</span>
                <p className="text-gray-600 mt-4">{t('alert_panel_description')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('alerts_current_user')} {currentUserLabel}</p>
                <button onClick={closeModal} className="mt-6 bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 font-medium rounded-full text-sm px-4 py-2.5 inline-flex items-center mx-auto transition">
                    {t('action_close')}
                </button>
            </div>
        );
    };
    
    // Classes de minimização
    const minimizationClasses = isNavMinimized 
        ? 'w-12 h-12 p-0 flex items-center justify-center transform scale-95'
        : 'w-auto px-4 py-2.5'; 
    
    const textClasses = isNavMinimized ? 'hidden' : 'inline';

    return (
        <div className="min-h-screen antialiased flex flex-col">
            {/* INJEÇÃO DE ESTILOS CSS GLOBAIS */}
            <style dangerouslySetInnerHTML={{ __html: `
                /* Fontes (Simulação da importação do Next.js) */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200');

                body {
                    font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                    background-color: #f8fafc;
                    color: #0f172a;
                }
                .card-base {
                    position: relative;
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    transition: all 300ms;
                    border-width: 1px;
                    cursor: pointer;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    /* PADRONIZAÇÃO 120x120px */
                    width: 8rem; /* 128px */
                    height: 8rem; /* 128px */
                    /* REVERTIDO para 0.5rem (8px) para uniformidade */
                    padding: 0.5rem; 
                }
                .card-base:hover {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    transform: translateY(-0.25rem);
                }
                /* Grid Flexível (2+ colunas em mobile, ajusta-se a 128px) */
                .app-grid-base-flexible { 
                    display: grid; 
                    gap: 2.5rem; /* 40px (2.5rem) */
                    width: 100%; 
                    max-width: 1008px;
                    /* CORREÇÃO: Forçar o tamanho do track para o tamanho do cartão (8rem) e centralizar o grid */
                    grid-template-columns: repeat(auto-fit, 8rem); 
                    justify-content: center; /* NOVO: Centraliza o grid inteiro na linha */
                    justify-items: center; /* Centraliza os itens dentro de seus tracks */
                    padding: 0 1rem;
                }
                /* Estilo dos Botões Chips Flutuantes */
                .chip-button {
                    /* REMOVIDO background-color da regra global para o Tailwind assumir */
                    border-width: 1px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* Sombra média para destacar */
                    transition: all 0.3s ease-in-out; /* Aumenta a transição para o efeito de minimização */
                }
                .chip-button:hover {
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); 
                }
            `}} />
            
            {/* BOTÕES DE NAVEGAÇÃO FLUTUANTES (ESQUERDA) */}
            <div className="fixed top-4 left-4 z-40 flex flex-col space-y-2">
                {history.length > 0 && (
                    <button onClick={goBack} 
                            className={`chip-button bg-teal-100 shadow-xl font-medium rounded-full text-sm inline-flex items-center transition-all duration-300 hover:scale-105 border-teal-300 text-teal-600 ${minimizationClasses}`}>
                        <span className={`material-symbols-rounded text-xl ${isNavMinimized ? 'm-0' : 'mr-2'}`}>arrow_back</span>
                        <span className={textClasses}>{t('action_back')}</span>
                    </button>
                )}
                <button onClick={() => navigateTo('portfolio', false)} 
                        className={`chip-button bg-indigo-100 shadow-xl font-medium rounded-full text-sm inline-flex items-center transition-all duration-300 hover:scale-105 border-indigo-500 text-indigo-600 ${minimizationClasses}`}>
                    <span className={`material-symbols-rounded text-xl ${isNavMinimized ? 'm-0' : 'mr-2'}`}>home</span>
                    <span className={`hidden sm:${textClasses}`}>{t('action_home')}</span>
                </button>
                <button onClick={() => handleCardClick({ action: 'modal', modalId: 'alerts', titleKey: 'alerts_title', url: 'ALERT_PANEL_PLACEHOLDER', basePath: '' })}
                        className={`chip-button bg-amber-100 shadow-xl font-medium rounded-full text-sm inline-flex items-center transition-all duration-300 hover:scale-105 border-amber-500 text-amber-600 ${minimizationClasses}`}>
                    <span className={`material-symbols-rounded text-xl ${isNavMinimized ? 'm-0' : 'mr-2'}`}>notifications</span>
                    <span className={`hidden sm:${textClasses}`}>{t('menu_alerts')}</span>
                </button>
            </div>
            
            {/* BOTÃO DE ACESSO AO PAINEL DO USUÁRIO (DIREITA) */}
            <div className="fixed top-4 right-4 z-40">
                <button onClick={openAuthModal} 
                        className={`chip-button bg-purple-100 shadow-xl font-medium rounded-full text-sm inline-flex items-center transition-all duration-300 hover:scale-105 border-purple-500 text-purple-600 ${isNavMinimized ? 'w-12 h-12 p-0 flex items-center justify-center transform scale-95' : 'w-auto px-4 py-2.5'}`}>
                    
                    <span className={`material-symbols-rounded text-xl ${isNavMinimized ? 'm-0' : (userPhone ? 'mr-2' : 'mr-2')}`}>
                        {userPhone ? 'account_circle' : 'login'}
                    </span>
                    
                    <span className={`hidden sm:${isNavMinimized ? 'hidden' : 'inline'}`}>
                        {userPhone ? userPhone : t('auth_modal_cta')}
                    </span>
                    
                </button>
            </div>


            {/* CONTEÚDO PRINCIPAL (COM CENTRALIZAÇÃO VERTICAL) */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-8 min-h-screen flex flex-col w-full justify-center">
                <RenderedView
                    titleKey={currentViewData.titleKey}
                    subtitleKey={currentViewData.subtitleKey}
                    title={currentViewData.title}
                    subtitle={currentViewData.subtitle}
                    items={renderedItems}
                    t={t}
                />
            </main>
            
            {/* MODAL PLACEHOLDER ESTÁTICO */}
            {placeholderVisible && (
                <div id="placeholder-modal-overlay" className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/60 backdrop-blur-sm p-4">
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden p-8 text-center">
                            <span className="material-symbols-rounded text-6xl text-gray-500 mx-auto mb-4">construction</span>
                            <h3 className="text-xl font-bold text-gray-800">{t('feature_in_development_title')}</h3>
                            <p className="text-gray-600 mt-2">{t('feature_in_development_body')}</p>
                            <button onClick={closeModal} className="chip-button mt-6 bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 font-medium rounded-full text-sm px-4 py-2.5 inline-flex items-center mx-auto transition">
                                <span className="material-symbols-rounded text-xl mr-2">check</span>
                                <span>{t('action_understood')}</span>
                            </button>
                        </div>
                    </div>
            )}
            
            {/* MODAL DE ALERTAS (AGORA USA O NOVO COMPONENTE) */}
            {modalConfig && modalConfig.modalId === 'alerts' && (
                <div id="alerts-modal-overlay" className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-xl h-full max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-amber-500 flex flex-col overflow-hidden">
                        <div className='flex justify-end p-2'>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-900">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <AlertPanel />
                    </div>
                </div>
            )}

            {/* MODAL GENÉRICO DE MINIAPP (EXCETO AUTH) */}
            {modalConfig && modalConfig.modalId !== 'alerts' && modalConfig.modalId !== 'placeholder' && modalConfig.modalId !== 'auth-modal' && (
                <MiniAppModal
                    modalConfig={modalConfig}
                    closeModal={closeModal}
                    loading={modalLoading}
                    setLoading={setModalLoading}
                    appId={APP_ID}
                    fbConfig={FIREBASE_CONFIG}
                    t={t}
                />
            )}

            {/* MODAL: CADASTRO/AUTENTICAÇÃO */}
            {modalConfig && modalConfig.modalId === 'auth-modal' && (
                <MiniAppModal
                    modalConfig={{
                        modalId: 'auth-modal',
                        titleKey: 'auth_modal_title',
                        url: AUTH_ITEM_CONFIG.url,
                        basePath: AUTH_ITEM_CONFIG.basePath
                    }}
                    closeModal={closeModal}
                    loading={modalLoading}
                    setLoading={setModalLoading}
                    appId={APP_ID}
                    fbConfig={FIREBASE_CONFIG}
                    t={t}
                />
            )}
        </div>
    );
}
