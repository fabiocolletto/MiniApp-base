(function() {
        const SUPPORTED_LANGS = ['pt-BR', 'en-US', 'es-ES'];
        const DEFAULT_LANG = 'pt-BR';
        const I18N = {
            'pt-BR': {
                'meta.title': 'Ferramenta de Importação de Pesquisas',
                'app.title': 'Importação de Pesquisas',
                'app.subtitle': 'Importar arquivos, revisar resultados e sincronizar dados.',
                'app.db.loading': 'Carregando DB...',
                'storage.title': 'Visão Geral do Armazenamento Local',
                'storage.loading': 'Carregando...',
                'storage.subtitle': 'Pesquisas Salvas Localmente:',
                'storage.none': 'Nenhuma pesquisa salva',
                'storage.count': '{{count}} pesquisa(s) salva(s)',
                'storage.table.empty': 'Nenhuma pesquisa salva localmente.',
                'actions.add': '+ Adicionar Pesquisas',
                'actions.clearLocal': 'Limpar Tudo Local',
                'actions.syncToggle.on': 'Sincronização Online ATIVA',
                'actions.syncToggle.off': 'Ativar Sincronização Online',
                'actions.openCatalog': 'Catálogo',
                'online.title': 'Gestão de Pesquisas Online (Firestore Simulado)',
                'online.counter': 'Atualmente, existem <strong>{{count}}</strong> pesquisas salvas na nuvem.',
                'online.syncAll': 'Sincronizar Todas as Pesquisas Locais (Upload)',
                'online.clearAll': 'Excluir Todas as Pesquisas Online',
                'upload.title': '1. Carregar Dados',
                'upload.file.hint': 'Aguardando upload de arquivo JSON...',
                'upload.test': 'Carregar Dados de Teste',
                'selection.title': '2. Selecione as Pesquisas para Importar',
                'table.header.name': 'Nome da Pesquisa',
                'table.header.sector': 'Setor',
                'table.header.date': 'Data da Pesquisa',
                'table.header.participants': 'Participantes',
                'table.header.status': 'Status',
                'table.header.checkbox': 'Selecionar todas',
                'action.status.none': '0 pesquisas selecionadas.',
                'action.import.default': 'Importar Pesquisas Selecionadas',
                'action.import.label': 'Importar {{count}} Pesquisa(s)',
                'footer.meta': 'Ferramenta de Importação v1.1',
                'modal.ok': 'OK',
                'modal.cancel': 'Cancelar',
                'modal.title.default': 'Aviso',
                'modal.message.default': 'Mensagem',
                'status.tag.new': 'NOVA',
                'status.tag.update': 'ATUALIZAÇÃO',
                'status.tag.old': 'Antiga',
                'status.tag.na': 'N/A',
                'status.file.success': 'Arquivo carregado com sucesso! ({{count}})',
                'status.file.error': 'Erro ao carregar JSON: {{message}}',
                'status.file.readError': 'Erro de leitura de arquivo.',
                'status.import.error': 'ERRO: Por favor, selecione pelo menos uma pesquisa para continuar.',
                'status.import.loading': 'Importando...',
                'status.import.simulated': 'Simulação de Sucesso',
                'status.import.simulatedMessage': 'Simulação: {{count}} pesquisa(s) seriam salvas/atualizadas no IndexedDB.',
                'status.import.success': 'SUCESSO! {{count}} importada(s) localmente.',
                'status.import.failure': 'Erro na Importação Local: {{message}}',
                'status.db.unsupported': 'IndexedDB não suportado.',
                'status.db.openError': 'Falha ao abrir IndexedDB.',
                'status.db.loading': 'Iniciando DB local...',
                'status.db.ready': 'DB OK. {{count}} pesquisas.',
                'status.db.cleared': 'Base local apagada com sucesso.',
                'status.db.clearing': 'Limpando armazenamento local...',
                'status.db.syncAll': 'Sincronizando todas as pesquisas (Local -> Online)...',
                'status.db.syncFailure': 'Falha na sincronização online: {{message}}',
                'status.db.syncReady': 'Sincronização concluída! {{count}} pesquisas salvas online.',
                'status.db.onlineError': 'Erro ao carregar status online simulado.',
                'status.db.onlineCleared': 'Todas as pesquisas online foram removidas.',
                'status.db.onlineClearing': 'Removendo pesquisas da nuvem...',
                'status.db.onlineEmpty': 'Não há pesquisas locais para sincronizar.',
                'status.db.confirmSyncAllTitle': 'Sincronizar Tudo',
                'status.db.confirmSyncAllMessage': 'Você irá sincronizar {{count}} pesquisas locais para a nuvem. Pesquisas existentes serão ATUALIZADAS. Confirmar?',
                'status.db.confirmClearOnlineTitle': 'Excluir Tudo Online',
                'status.db.confirmClearOnlineMessage': 'Tem certeza que deseja remover todas as pesquisas salvas na nuvem? Esta ação não pode ser desfeita.',
                'status.action.deleteTitle': 'Excluir Pesquisa Local',
                'status.action.deleteMessage': 'Excluir a pesquisa "{{name}}" do armazenamento local?',
                'status.action.deleteSuccess': 'Pesquisa removida com sucesso.',
                'status.action.deleteFailure': 'Erro ao remover a pesquisa: {{message}}',
                'status.action.selectCount': '{{count}} pesquisa(s) selecionada(s).',
                'status.online.loading': 'Carregando...',
                'status.online.error': 'ERRO',
                'status.db.clearOnlineNone': 'Nenhuma pesquisa online para remover.',
                'status.db.clearLocalConfirmTitle': 'Limpar Base Local',
                'status.db.clearLocalConfirmMessage': 'Deseja remover todas as pesquisas salvas localmente? Esta ação não pode ser desfeita.',
                'status.db.clearedEmpty': 'Nenhuma pesquisa salva localmente.'
            },
            'en-US': {
                'meta.title': 'Survey Import Tool',
                'app.title': 'Survey Importer',
                'app.subtitle': 'Import files, review results, and sync data.',
                'app.db.loading': 'Loading DB...',
                'storage.title': 'Local Storage Overview',
                'storage.loading': 'Loading...',
                'storage.subtitle': 'Surveys Saved Locally:',
                'storage.none': 'No surveys saved',
                'storage.count': '{{count}} survey(s) saved',
                'storage.table.empty': 'No surveys stored locally.',
                'actions.add': '+ Add Surveys',
                'actions.clearLocal': 'Clear Local Storage',
                'actions.syncToggle.on': 'Online Sync ENABLED',
                'actions.syncToggle.off': 'Enable Online Sync',
                'actions.openCatalog': 'Catalog',
                'online.title': 'Online Survey Management (Simulated Firestore)',
                'online.counter': 'There are currently <strong>{{count}}</strong> surveys stored in the cloud.',
                'online.syncAll': 'Sync All Local Surveys (Upload)',
                'online.clearAll': 'Delete All Online Surveys',
                'upload.title': '1. Upload Data',
                'upload.file.hint': 'Waiting for JSON upload...',
                'upload.test': 'Load Test Data',
                'selection.title': '2. Select Surveys to Import',
                'table.header.name': 'Survey Name',
                'table.header.sector': 'Sector',
                'table.header.date': 'Survey Date',
                'table.header.participants': 'Participants',
                'table.header.status': 'Status',
                'table.header.checkbox': 'Select all',
                'action.status.none': '0 surveys selected.',
                'action.import.default': 'Import Selected Surveys',
                'action.import.label': 'Import {{count}} Survey(s)',
                'footer.meta': 'Survey Import Tool v1.1',
                'modal.ok': 'OK',
                'modal.cancel': 'Cancel',
                'modal.title.default': 'Notice',
                'modal.message.default': 'Message',
                'status.tag.new': 'NEW',
                'status.tag.update': 'UPDATE',
                'status.tag.old': 'Old',
                'status.tag.na': 'N/A',
                'status.file.success': 'File loaded successfully! ({{count}})',
                'status.file.error': 'Error loading JSON: {{message}}',
                'status.file.readError': 'File read error.',
                'status.import.error': 'ERROR: Please select at least one survey to continue.',
                'status.import.loading': 'Importing...',
                'status.import.simulated': 'Simulation Result',
                'status.import.simulatedMessage': 'Simulation: {{count}} survey(s) would be saved/updated in IndexedDB.',
                'status.import.success': 'SUCCESS! {{count}} imported locally.',
                'status.import.failure': 'Local Import Error: {{message}}',
                'status.db.unsupported': 'IndexedDB not supported.',
                'status.db.openError': 'Failed to open IndexedDB.',
                'status.db.loading': 'Starting local DB...',
                'status.db.ready': 'DB OK. {{count}} surveys.',
                'status.db.cleared': 'Local storage cleared successfully.',
                'status.db.clearing': 'Clearing local storage...',
                'status.db.syncAll': 'Syncing all surveys (Local -> Online)...',
                'status.db.syncFailure': 'Online sync failed: {{message}}',
                'status.db.syncReady': 'Sync complete! {{count}} surveys stored online.',
                'status.db.onlineError': 'Error loading simulated online status.',
                'status.db.onlineCleared': 'All online surveys were removed.',
                'status.db.onlineClearing': 'Removing surveys from the cloud...',
                'status.db.onlineEmpty': 'There are no local surveys to sync.',
                'status.db.confirmSyncAllTitle': 'Sync Everything',
                'status.db.confirmSyncAllMessage': 'You are about to sync {{count}} local surveys to the cloud. Existing surveys will be UPDATED. Proceed?',
                'status.db.confirmClearOnlineTitle': 'Delete Online Data',
                'status.db.confirmClearOnlineMessage': 'Are you sure you want to remove every survey stored in the cloud? This action cannot be undone.',
                'status.action.deleteTitle': 'Delete Local Survey',
                'status.action.deleteMessage': 'Delete survey "{{name}}" from local storage?',
                'status.action.deleteSuccess': 'Survey removed successfully.',
                'status.action.deleteFailure': 'Failed to remove survey: {{message}}',
                'status.action.selectCount': '{{count}} survey(s) selected.',
                'status.online.loading': 'Loading...',
                'status.online.error': 'ERROR',
                'status.db.clearOnlineNone': 'No online surveys to remove.',
                'status.db.clearLocalConfirmTitle': 'Clear Local Data',
                'status.db.clearLocalConfirmMessage': 'Remove every survey saved locally? This action cannot be undone.',
                'status.db.clearedEmpty': 'No surveys stored locally.'
            },
            'es-ES': {
                'meta.title': 'Herramienta de Importación de Encuestas',
                'app.title': 'Importador de Encuestas',
                'app.subtitle': 'Importar archivos, revisar resultados y sincronizar datos.',
                'app.db.loading': 'Cargando BD...',
                'storage.title': 'Resumen del Almacenamiento Local',
                'storage.loading': 'Cargando...',
                'storage.subtitle': 'Encuestas guardadas localmente:',
                'storage.none': 'No hay encuestas guardadas',
                'storage.count': '{{count}} encuesta(s) guardada(s)',
                'storage.table.empty': 'No hay encuestas guardadas localmente.',
                'actions.add': '+ Agregar encuestas',
                'actions.clearLocal': 'Limpiar almacenamiento local',
                'actions.syncToggle.on': 'Sincronización en línea ACTIVADA',
                'actions.syncToggle.off': 'Activar sincronización en línea',
                'actions.openCatalog': 'Catálogo',
                'online.title': 'Gestión de encuestas en línea (Firestore simulado)',
                'online.counter': 'Actualmente hay <strong>{{count}}</strong> encuestas guardadas en la nube.',
                'online.syncAll': 'Sincronizar todas las encuestas locales (Subir)',
                'online.clearAll': 'Eliminar todas las encuestas en línea',
                'upload.title': '1. Cargar datos',
                'upload.file.hint': 'Esperando cargar un JSON...',
                'upload.test': 'Cargar datos de prueba',
                'selection.title': '2. Selecciona las encuestas a importar',
                'table.header.name': 'Nombre de la encuesta',
                'table.header.sector': 'Sector',
                'table.header.date': 'Fecha de la encuesta',
                'table.header.participants': 'Participantes',
                'table.header.status': 'Estado',
                'table.header.checkbox': 'Seleccionar todo',
                'action.status.none': '0 encuestas seleccionadas.',
                'action.import.default': 'Importar encuestas seleccionadas',
                'action.import.label': 'Importar {{count}} encuesta(s)',
                'footer.meta': 'Herramienta de Importación v1.1',
                'modal.ok': 'Aceptar',
                'modal.cancel': 'Cancelar',
                'modal.title.default': 'Aviso',
                'modal.message.default': 'Mensaje',
                'status.tag.new': 'NUEVA',
                'status.tag.update': 'ACTUALIZACIÓN',
                'status.tag.old': 'Antigua',
                'status.tag.na': 'N/D',
                'status.file.success': '¡Archivo cargado correctamente! ({{count}})',
                'status.file.error': 'Error al cargar el JSON: {{message}}',
                'status.file.readError': 'Error al leer el archivo.',
                'status.import.error': 'ERROR: Selecciona al menos una encuesta para continuar.',
                'status.import.loading': 'Importando...',
                'status.import.simulated': 'Resultado simulado',
                'status.import.simulatedMessage': 'Simulación: se guardarían/actualizarían {{count}} encuesta(s) en IndexedDB.',
                'status.import.success': '¡ÉXITO! {{count}} importada(s) localmente.',
                'status.import.failure': 'Error al importar localmente: {{message}}',
                'status.db.unsupported': 'IndexedDB no es compatible.',
                'status.db.openError': 'Error al abrir IndexedDB.',
                'status.db.loading': 'Iniciando base local...',
                'status.db.ready': 'BD OK. {{count}} encuestas.',
                'status.db.cleared': 'Almacenamiento local limpiado correctamente.',
                'status.db.clearing': 'Limpiando almacenamiento local...',
                'status.db.syncAll': 'Sincronizando todas las encuestas (Local -> Online)...',
                'status.db.syncFailure': 'Error al sincronizar en línea: {{message}}',
                'status.db.syncReady': '¡Sincronización completada! {{count}} encuestas guardadas en la nube.',
                'status.db.onlineError': 'Error al cargar el estado en línea simulado.',
                'status.db.onlineCleared': 'Se eliminaron todas las encuestas en línea.',
                'status.db.onlineClearing': 'Eliminando encuestas de la nube...',
                'status.db.onlineEmpty': 'No hay encuestas locales para sincronizar.',
                'status.db.confirmSyncAllTitle': 'Sincronizar todo',
                'status.db.confirmSyncAllMessage': 'Sincronizarás {{count}} encuestas locales con la nube. Las encuestas existentes se ACTUALIZARÁN. ¿Confirmas?',
                'status.db.confirmClearOnlineTitle': 'Eliminar datos en línea',
                'status.db.confirmClearOnlineMessage': '¿Seguro que deseas eliminar todas las encuestas guardadas en la nube? Esta acción no se puede deshacer.',
                'status.action.deleteTitle': 'Eliminar encuesta local',
                'status.action.deleteMessage': '¿Eliminar la encuesta "{{name}}" del almacenamiento local?',
                'status.action.deleteSuccess': 'Encuesta eliminada correctamente.',
                'status.action.deleteFailure': 'Error al eliminar la encuesta: {{message}}',
                'status.action.selectCount': '{{count}} encuesta(s) seleccionada(s).',
                'status.online.loading': 'Cargando...',
                'status.online.error': 'ERROR',
                'status.db.clearOnlineNone': 'No hay encuestas en línea para eliminar.',
                'status.db.clearLocalConfirmTitle': 'Limpiar base local',
                'status.db.clearLocalConfirmMessage': '¿Eliminar todas las encuestas guardadas localmente? Esta acción no se puede deshacer.',
                'status.db.clearedEmpty': 'No hay encuestas guardadas localmente.'
            }
        };

        function normalizeLanguageCode(lang) {
            return typeof lang === 'string' ? lang.trim() : '';
        }

        function resolveLanguage(lang) {
            const normalized = normalizeLanguageCode(lang).toLowerCase();
            if (!normalized) return null;
            return SUPPORTED_LANGS.find(code => normalized.startsWith(code.toLowerCase())) || null;
        }

        function detectLanguage() {
            const documentLang = normalizeLanguageCode(document.documentElement.getAttribute('lang'));
            const supportedFromDocument = resolveLanguage(documentLang);
            return supportedFromDocument || DEFAULT_LANG;
        }

        function translate(key, vars = {}) {
            const bundle = I18N[currentLanguage] || I18N[DEFAULT_LANG];
            let template = (bundle && bundle[key]) || (I18N[DEFAULT_LANG] && I18N[DEFAULT_LANG][key]) || key;
            return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
                return Object.prototype.hasOwnProperty.call(vars, token) ? vars[token] : `{{${token}}}`;
            });
        }

        function applyTranslations(root = document) {
            root.querySelectorAll('[data-i18n]').forEach(node => {
                const key = node.getAttribute('data-i18n');
                if (!key) return;
                const html = translate(key);
                if (node instanceof HTMLElement) {
                    node.innerHTML = html;
                } else {
                    node.textContent = html;
                }
            });
        }

        function formatTimestamp(timestamp) {
            if (!timestamp) return translate('status.tag.na');
            const date = new Date(Number(timestamp));
            if (Number.isNaN(date.getTime())) return translate('status.tag.na');
            return date.toLocaleDateString(currentLanguage, { year: 'numeric', month: 'short', day: '2-digit' });
        }

        let currentLanguage = detectLanguage();
        const initialDocumentLanguage = normalizeLanguageCode(document.documentElement.getAttribute('lang'));
        const shouldRequestLocaleFromShell = !resolveLanguage(initialDocumentLanguage);
        let lastDbStatusPayload = null;
        let fileStatusState = { type: 'hint' };
        let isAppInitialized = false;
        const isEmbeddedInShell = window.parent && window.parent !== window;

        // =======================================================
        // ESTADO GLOBAL
        // =======================================================
        let loadedResearchData = [];
        let existingResearchMap = new Map();
        let db;
        let isOnlineSyncEnabled = false;
        let onlineResearchesMap = new Map();
        let sortState = { column: 'savedAt', direction: 'desc' };

        const selectionArea = document.getElementById('selectionArea');
        const actionArea = document.getElementById('actionArea');
        const importButton = document.getElementById('importButton');
        const actionStatusMessage = document.getElementById('actionStatusMessage');
        const fileStatus = document.getElementById('fileStatus');
        const jsonFileInput = document.getElementById('jsonFileInput');
        const globalStatus = document.getElementById('globalStatus');
        const headerDbStatus = document.getElementById('headerDbStatus');
        const headerDbStatusText = document.getElementById('headerDbStatusText');
        const memoryStatusDisplay = document.getElementById('memoryStatusDisplay');
        const uploadSection = document.getElementById('uploadSection');
        const savedResearchesDetails = document.getElementById('savedResearchesDetails');
        const savedResearchesTableBody = document.getElementById('savedResearchesTableBody');
        const onlineManagementSection = document.getElementById('onlineManagementSection');
        const onlineCountWrapper = document.getElementById('onlineCountWrapper');
        const toggleSyncButton = document.getElementById('toggleSyncButton');
        const syncAllButton = document.getElementById('syncAllButton');
        const clearAllOnlineButton = document.getElementById('clearAllOnlineButton');
        const showUploadButton = document.getElementById('showUploadButton');
        const clearDbButton = document.getElementById('clearDbButton');
        const loadTestDataButton = document.getElementById('loadTestDataButton');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');

        const customModal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirmButton = document.getElementById('modalConfirmButton');
        const modalCancelButton = document.getElementById('modalCancelButton');

        const DB_NAME = 'ResearchDB';
        const DB_VERSION = 1;
        const STORE_NAME = 'researches';
        const KEY_PATH = 'researchId';

        applyLanguage(currentLanguage);

        if (shouldRequestLocaleFromShell) {
            requestShellLocale();
        }

        if (isEmbeddedInShell) {
            window.addEventListener('message', handleShellMessage);
        }

        const MOCK_DATA = [
            { "researchId": "RES-NEW-001", "researchName": "Nova Pesquisa de Mercado", "sector": "Varejo", "participants": [{},{},{}], "researchDate": Date.parse('2025-11-05T10:00:00Z') },
            { "researchId": "RES-TCH-002", "researchName": "Versão Nova de Tecnologia", "sector": "Tecnologia", "participants": [{},{},{},{}], "researchDate": Date.parse('2025-11-08T15:00:00Z') },
            { "researchId": "RES-TCH-003", "researchName": "Versão Antiga de Inovação", "sector": "Tecnologia", "participants": [{}], "researchDate": Date.parse('2025-10-01T10:00:00Z') },
            { "researchId": "RES-FIN-004", "researchName": "Análise Financeira Q4", "sector": "Finanças", "participants": [{},{}], "researchDate": Date.parse('2025-11-06T12:00:00Z') }
        ];

        const SIMULATED_DB_DATA = [
            { "researchId": "RES-TCH-002", "researchName": "Tecnologia V1", "sector": "Tecnologia", "participants": [{},{},{}], "researchDate": Date.parse('2025-10-25T10:00:00Z'), "savedAt": Date.parse('2025-10-25T10:30:00Z') },
            { "researchId": "RES-TCH-003", "researchName": "Inovação V2", "sector": "Tecnologia", "participants": [{},{}], "researchDate": Date.parse('2025-10-30T10:00:00Z'), "savedAt": Date.parse('2025-10-31T11:00:00Z') },
            { "researchId": "RES-FIN-005", "researchName": "Financeiro Existente", "sector": "Finanças", "participants": [{},{},{},{},{}], "researchDate": Date.parse('2025-10-15T10:00:00Z'), "savedAt": Date.parse('2025-11-01T12:00:00Z') }
        ];

        function setStatusMessage(target, message, variant = 'info') {
            if (!target) return;
            target.textContent = '';
            if (typeof message === 'string') {
                target.innerHTML = message;
            } else {
                target.innerHTML = '';
            }
            target.classList.remove('status-message--error', 'status-message--success');
            if (variant === 'error') {
                target.classList.add('status-message--error');
            } else if (variant === 'success') {
                target.classList.add('status-message--success');
            }
        }

        function normalizeStatusDescriptor(message) {
            if (!message) {
                return null;
            }

            if (message.type === 'raw' || message.type === 'i18n') {
                return {
                    type: message.type,
                    value: message.value,
                    key: message.key,
                    vars: message.vars ? { ...message.vars } : {}
                };
            }

            if (typeof message === 'string') {
                return { type: 'raw', value: message };
            }

            if (typeof message === 'object' && typeof message.key === 'string') {
                return { type: 'i18n', key: message.key, vars: { ...(message.vars || {}) } };
            }

            return null;
        }

        function resolveStatusDescriptor(descriptor) {
            if (!descriptor) {
                return '';
            }

            if (descriptor.type === 'raw') {
                return descriptor.value || '';
            }

            if (descriptor.type === 'i18n') {
                return translate(descriptor.key, descriptor.vars || {});
            }

            return '';
        }

        function applyDbStatus(payload) {
            if (!payload) return;

            const { state, descriptor } = payload;
            const messageText = resolveStatusDescriptor(descriptor);

            if (state === 'loading') {
                headerDbStatus.dataset.state = 'loading';
            } else if (state === 'ok') {
                headerDbStatus.dataset.state = 'ok';
            } else if (state === 'error') {
                headerDbStatus.dataset.state = 'error';
            } else if (state === 'sync') {
                headerDbStatus.dataset.state = 'sync';
            }

            headerDbStatusText.textContent = messageText;
            headerDbStatus.setAttribute('aria-label', messageText);

            if (globalStatus) {
                if (messageText) {
                    globalStatus.classList.remove('is-hidden');
                    setStatusMessage(globalStatus, messageText, state === 'error' ? 'error' : state === 'ok' ? 'success' : 'info');
                } else {
                    globalStatus.classList.add('is-hidden');
                }
            }
        }

        function updateDbStatus(state, message) {
            lastDbStatusPayload = {
                state,
                descriptor: normalizeStatusDescriptor(message)
            };

            applyDbStatus(lastDbStatusPayload);
        }

        function renderFileStatus() {
            if (!fileStatus) return;

            const state = fileStatusState?.type || 'hint';

            if (state === 'success') {
                const count = typeof fileStatusState.count === 'number' ? fileStatusState.count : 0;
                fileStatus.innerHTML = translate('status.file.success', { count });
            } else if (state === 'error') {
                fileStatus.textContent = translate('status.file.error', { message: fileStatusState.message || '' });
            } else if (state === 'read-error') {
                fileStatus.textContent = translate('status.file.readError');
            } else {
                fileStatus.textContent = translate('upload.file.hint');
            }
        }

        function emitLanguageChange() {
            const detail = {
                language: currentLanguage,
                headerTitle: translate('app.title'),
                headerSubtitle: translate('app.subtitle'),
                catalogLabel: translate('actions.openCatalog')
            };

            window.dispatchEvent(new CustomEvent('miniapp:language-changed', { detail }));
        }

        function applyLanguage(language) {
            const resolved = resolveLanguage(language) || DEFAULT_LANG;
            currentLanguage = resolved;

            document.documentElement.lang = currentLanguage;
            document.title = translate('meta.title');
            applyTranslations();
            renderFileStatus();

            if (isAppInitialized) {
                updateImportButton();

                if (loadedResearchData.length > 0) {
                    renderTable();
                }

                loadAllResearches().catch(console.error);
                updateOnlineStatus();

                if (lastDbStatusPayload) {
                    applyDbStatus(lastDbStatusPayload);
                }

                emitLanguageChange();
            }
        }

        function requestShellLocale() {
            if (!isEmbeddedInShell) return;

            try {
                window.parent.postMessage({ action: 'request-locale' }, window.location.origin);
            } catch (error) {
                console.error('Não foi possível solicitar o idioma ao shell.', error);
            }
        }

        function handleShellMessage(event) {
            if (!event || typeof event.data !== 'object') {
                return;
            }

            if (event.origin && event.origin !== window.location.origin && event.origin !== 'null') {
                return;
            }

            const { action, locale } = event.data;
            if (action !== 'set-locale' || typeof locale !== 'string') {
                return;
            }

            applyLanguage(locale);
        }

        function showCustomModal(title, message, showCancel) {
            return new Promise(resolve => {
                modalTitle.textContent = title || translate('modal.title.default');
                if (typeof message === 'string') {
                    modalMessage.textContent = message;
                } else {
                    modalMessage.innerHTML = '';
                }
                modalCancelButton.classList.toggle('is-hidden', !showCancel);

                function cleanup(result) {
                    modalConfirmButton.removeEventListener('click', confirmHandler);
                    modalCancelButton.removeEventListener('click', cancelHandler);
                    customModal.classList.add('is-hidden');
                    resolve(result);
                }

                function confirmHandler() {
                    cleanup(true);
                }

                function cancelHandler() {
                    cleanup(false);
                }

                modalConfirmButton.addEventListener('click', confirmHandler);
                modalCancelButton.addEventListener('click', cancelHandler);

                customModal.classList.remove('is-hidden');
                modalConfirmButton.focus();
            });
        }

        function updateSortUI() {
            const sortableHeaders = document.querySelectorAll('.sortable-header');
            sortableHeaders.forEach(header => header.classList.remove('sort-asc', 'sort-desc'));
        }

        function showUploadSection() {
            uploadSection.classList.toggle('is-hidden');
        }

        function renderMemoryStatus() {
            const count = existingResearchMap.size;
            const clearButton = clearDbButton;

            if (count === 0) {
                memoryStatusDisplay.textContent = translate('storage.none');
                clearButton.disabled = true;
                savedResearchesDetails.classList.add('is-hidden');
            } else {
                memoryStatusDisplay.innerHTML = translate('storage.count', { count });
                clearButton.disabled = false;
                savedResearchesDetails.classList.remove('is-hidden');
            }
            updateSortUI();
            if (isOnlineSyncEnabled) {
                updateOnlineStatus();
            }
        }

        function renderSavedResearchesTable(researches) {
            savedResearchesTableBody.innerHTML = '';

            if (researches.length === 0) {
                const emptyRow = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 6;
                cell.textContent = translate('storage.table.empty');
                emptyRow.appendChild(cell);
                savedResearchesTableBody.appendChild(emptyRow);
                return;
            }

            researches.sort((a, b) => {
                const aValue = a[sortState.column] || '';
                const bValue = b[sortState.column] || '';
                let result = 0;
                if (sortState.column === 'participantsCount') {
                    result = a.participantsCount - b.participantsCount;
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    result = aValue - bValue;
                } else {
                    result = aValue.toString().localeCompare(bValue.toString(), currentLanguage, { sensitivity: 'base' });
                }
                return sortState.direction === 'asc' ? result : -result;
            });

            researches.forEach(research => {
                const row = document.createElement('tr');
                const formattedSavedAt = formatTimestamp(research.savedAt || research.researchDate);
                const participantCount = Array.isArray(research.participants) ? research.participants.length : 0;

                const nameCell = document.createElement('td');
                nameCell.textContent = research.researchName;

                const sectorCell = document.createElement('td');
                sectorCell.dataset.align = 'center';
                sectorCell.textContent = research.sector || translate('status.tag.na');

                const participantsCell = document.createElement('td');
                participantsCell.dataset.align = 'right';
                participantsCell.textContent = participantCount;

                const dateCell = document.createElement('td');
                dateCell.dataset.align = 'center';
                dateCell.textContent = formattedSavedAt;

                const actionCell = document.createElement('td');
                actionCell.dataset.align = 'center';
                const actionButton = document.createElement('button');
                actionButton.className = 'table-action';
                actionButton.type = 'button';
                actionButton.setAttribute('aria-label', translate('status.action.deleteTitle'));
                actionButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
                actionButton.addEventListener('click', () => confirmDelete(research.researchId, research.researchName));
                actionCell.appendChild(actionButton);

                const statusCell = document.createElement('td');
                statusCell.dataset.align = 'center';
                statusCell.textContent = translate('status.tag.new');

                row.appendChild(nameCell);
                row.appendChild(sectorCell);
                row.appendChild(participantsCell);
                row.appendChild(dateCell);
                row.appendChild(actionCell);
                row.appendChild(statusCell);

                savedResearchesTableBody.appendChild(row);
            });
        }

        function loadOnlineResearches() {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(Array.from(onlineResearchesMap.values()));
                }, 500);
            });
        }

        function saveOnlineResearches(researches) {
            return new Promise(resolve => {
                setTimeout(() => {
                    researches.forEach(research => {
                        onlineResearchesMap.set(research.researchId, research);
                    });
                    resolve();
                }, 1500);
            });
        }

        function clearOnlineDatabase() {
            return new Promise(resolve => {
                setTimeout(() => {
                    onlineResearchesMap.clear();
                    resolve();
                }, 1500);
            });
        }

        async function toggleOnlineSync() {
            isOnlineSyncEnabled = !isOnlineSyncEnabled;
            if (isOnlineSyncEnabled) {
                toggleSyncButton.classList.remove('ghost');
                toggleSyncButton.classList.add('success');
                toggleSyncButton.textContent = translate('actions.syncToggle.on');
                onlineManagementSection.classList.remove('is-hidden');
                await updateOnlineStatus();
            } else {
                toggleSyncButton.classList.remove('success');
                toggleSyncButton.classList.add('ghost');
                toggleSyncButton.textContent = translate('actions.syncToggle.off');
                onlineManagementSection.classList.add('is-hidden');
            }
        }

        async function updateOnlineStatus() {
            syncAllButton.disabled = true;
            clearAllOnlineButton.disabled = true;
            onlineCountWrapper.innerHTML = translate('online.counter', { count: translate('status.online.loading') });
            try {
                const onlineResearches = await loadOnlineResearches();
                const count = onlineResearches.length;
                onlineCountWrapper.innerHTML = translate('online.counter', { count });
                if (existingResearchMap.size > 0) {
                    syncAllButton.disabled = false;
                }
                if (count > 0) {
                    clearAllOnlineButton.disabled = false;
                }
            } catch (error) {
                console.error('Erro ao carregar status online simulado:', error);
                onlineCountWrapper.innerHTML = translate('online.counter', { count: `<strong>${translate('status.online.error')}</strong>` });
            }
        }

        async function syncAllToOnline() {
            if (existingResearchMap.size === 0) {
                await showCustomModal(translate('status.db.confirmSyncAllTitle'), translate('status.db.onlineEmpty'), false);
                return;
            }

            const confirmed = await showCustomModal(
                translate('status.db.confirmSyncAllTitle'),
                translate('status.db.confirmSyncAllMessage', { count: existingResearchMap.size }),
                true
            );

            if (!confirmed) return;

            syncAllButton.disabled = true;
            clearAllOnlineButton.disabled = true;
            updateDbStatus('loading', { key: 'status.db.syncAll' });

            try {
                const allLocalResearches = await getAllLocalResearches();
                await saveOnlineResearches(allLocalResearches);
                updateDbStatus('ok', { key: 'status.db.syncReady', vars: { count: allLocalResearches.length } });
                await updateOnlineStatus();
            } catch (error) {
                updateDbStatus('error', { key: 'status.db.syncFailure', vars: { message: error.message } });
            } finally {
                setTimeout(() => {
                    updateDbStatus('ok', { key: 'status.db.ready', vars: { count: existingResearchMap.size } });
                    syncAllButton.disabled = (existingResearchMap.size === 0);
                    updateOnlineStatus();
                }, 2000);
            }
        }

        async function confirmClearOnline() {
            const hasData = onlineResearchesMap.size > 0;
            if (!hasData) {
                updateDbStatus('sync', { key: 'status.db.clearOnlineNone' });
                return;
            }

            const confirmed = await showCustomModal(
                translate('status.db.confirmClearOnlineTitle'),
                translate('status.db.confirmClearOnlineMessage'),
                true
            );
            if (!confirmed) return;

            updateDbStatus('loading', { key: 'status.db.onlineClearing' });
            syncAllButton.disabled = true;
            clearAllOnlineButton.disabled = true;

            try {
                await clearOnlineDatabase();
                updateDbStatus('ok', { key: 'status.db.onlineCleared' });
                await updateOnlineStatus();
            } catch (error) {
                updateDbStatus('error', { key: 'status.db.syncFailure', vars: { message: error.message } });
            }
        }

        function openDB() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    updateDbStatus('error', { key: 'status.db.unsupported' });
                    renderMemoryStatus();
                    reject(new Error('IndexedDB not supported'));
                    return;
                }

                updateDbStatus('loading', { key: 'status.db.loading' });

                const request = window.indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = (event) => {
                    updateDbStatus('error', { key: 'status.db.openError' });
                    renderMemoryStatus();
                    reject(event.target.error);
                };

                request.onsuccess = async (event) => {
                    db = event.target.result;
                    try {
                        await loadAllResearches();
                        updateDbStatus('ok', { key: 'status.db.ready', vars: { count: existingResearchMap.size } });
                        renderMemoryStatus();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };

                request.onupgradeneeded = (event) => {
                    db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: KEY_PATH });
                    }
                };
            });
        }

        function getAllLocalResearches() {
            return new Promise((resolve, reject) => {
                if (!db) {
                    if (SIMULATED_DB_DATA.length > 0) {
                        resolve(SIMULATED_DB_DATA);
                        return;
                    }
                    resolve([]);
                    return;
                }

                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        }

        async function loadAllResearches() {
            existingResearchMap.clear();
            const savedResearches = [];

            try {
                const results = await getAllLocalResearches();
                results.forEach(research => {
                    existingResearchMap.set(research.researchId, {
                        researchDate: research.researchDate,
                        savedAt: research.savedAt || research.researchDate
                    });
                    savedResearches.push({
                        ...research,
                        participantsCount: Array.isArray(research.participants) ? research.participants.length : 0
                    });
                });
                renderSavedResearchesTable(savedResearches);
                renderMemoryStatus();
            } catch (error) {
                console.error('Erro ao carregar dados existentes:', error);
            }
        }

        function saveResearches(researches) {
            return new Promise((resolve, reject) => {
                if (!db) {
                    resolve();
                    return;
                }

                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const currentTimestamp = Date.now();

                researches.forEach(research => {
                    const researchToSave = {
                        ...research,
                        researchDate: research.researchDate || currentTimestamp,
                        savedAt: currentTimestamp
                    };
                    store.put(researchToSave);
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = (event) => reject(event.target.error);
            });
        }

        async function confirmDelete(researchId, researchName) {
            const confirmed = await showCustomModal(
                translate('status.action.deleteTitle'),
                translate('status.action.deleteMessage', { name: researchName }),
                true
            );
            if (!confirmed) return;

            if (!db) {
                existingResearchMap.delete(researchId);
                renderMemoryStatus();
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(researchId);

            request.onsuccess = () => {
                existingResearchMap.delete(researchId);
                updateDbStatus('ok', { key: 'status.action.deleteSuccess' });
                loadAllResearches();
            };

            request.onerror = (event) => {
                updateDbStatus('error', { key: 'status.action.deleteFailure', vars: { message: event.target.error?.message || '?' } });
            };
        }

        async function clearDatabaseAndReload() {
            const confirmed = await showCustomModal(
                translate('status.db.clearLocalConfirmTitle'),
                translate('status.db.clearLocalConfirmMessage'),
                true
            );
            if (!confirmed) return;

            updateDbStatus('loading', { key: 'status.db.clearing' });

            if (!db) {
                existingResearchMap.clear();
                renderMemoryStatus();
                updateDbStatus('ok', { key: 'status.db.clearedEmpty' });
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                existingResearchMap.clear();
                updateDbStatus('ok', { key: 'status.db.cleared' });
                loadAllResearches();
            };

            request.onerror = (event) => {
                updateDbStatus('error', { key: 'status.action.deleteFailure', vars: { message: event.target.error?.message || '?' } });
            };
        }

        function handleFileUpload() {
            const file = jsonFileInput.files?.[0];
            if (!file) {
                fileStatusState = { type: 'hint' };
                renderFileStatus();
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    loadedResearchData = Array.isArray(data) ? data : [];
                    fileStatusState = { type: 'success', count: loadedResearchData.length };
                    renderFileStatus();
                    selectionArea.classList.remove('is-hidden');
                    actionArea.classList.remove('is-hidden');
                    renderTable();
                } catch (error) {
                    fileStatusState = { type: 'error', message: error.message };
                    renderFileStatus();
                    loadedResearchData = [];
                    selectionArea.classList.add('is-hidden');
                    actionArea.classList.add('is-hidden');
                    updateImportButton();
                }
            };

            reader.onerror = function() {
                fileStatusState = { type: 'read-error' };
                renderFileStatus();
                loadedResearchData = [];
                selectionArea.classList.add('is-hidden');
                actionArea.classList.add('is-hidden');
                updateImportButton();
            };

            reader.readAsText(file);
        }

        function loadTestData() {
            loadedResearchData = JSON.parse(JSON.stringify(MOCK_DATA));
            fileStatusState = { type: 'success', count: loadedResearchData.length };
            renderFileStatus();
            selectionArea.classList.remove('is-hidden');
            actionArea.classList.remove('is-hidden');
            renderTable();
        }

        function renderTable() {
            const tbody = document.getElementById('researchTableBody');
            tbody.innerHTML = '';
            selectAllCheckbox.checked = false;

            loadedResearchData.forEach(research => {
                const participantCount = Array.isArray(research.participants) ? research.participants.length : 0;
                const newResearchDate = research.researchDate;
                const existingResearch = existingResearchMap.get(research.researchId);
                const existingResearchDate = existingResearch ? existingResearch.researchDate : null;

                let isSelectable = true;
                let statusVariant = 'new';
                let statusLabel = translate('status.tag.new');

                if (existingResearchDate) {
                    if (newResearchDate > existingResearchDate) {
                        statusVariant = 'update';
                        statusLabel = translate('status.tag.update');
                    } else {
                        isSelectable = false;
                        statusVariant = 'old';
                        statusLabel = translate('status.tag.old');
                    }
                }

                const formattedDate = formatTimestamp(newResearchDate);
                const row = document.createElement('tr');
                if (!isSelectable) {
                    row.classList.add('is-disabled');
                }

                const checkboxCell = document.createElement('td');
                checkboxCell.dataset.align = 'center';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'research-checkbox';
                checkbox.dataset.id = research.researchId;
                checkbox.disabled = !isSelectable;
                checkbox.addEventListener('change', () => toggleRowSelection(checkbox, row));
                checkboxCell.appendChild(checkbox);

                const nameCell = document.createElement('td');
                nameCell.textContent = research.researchName;

                const sectorCell = document.createElement('td');
                sectorCell.dataset.align = 'center';
                sectorCell.textContent = research.sector || translate('status.tag.na');

                const dateCell = document.createElement('td');
                dateCell.dataset.align = 'center';
                dateCell.textContent = formattedDate;

                const participantCell = document.createElement('td');
                participantCell.dataset.align = 'right';
                participantCell.textContent = participantCount;

                const statusCell = document.createElement('td');
                statusCell.dataset.align = 'center';
                const statusTag = document.createElement('span');
                statusTag.className = 'survey-table__status';
                statusTag.dataset.variant = statusVariant;
                statusTag.textContent = statusLabel;
                statusCell.appendChild(statusTag);

                row.appendChild(checkboxCell);
                row.appendChild(nameCell);
                row.appendChild(sectorCell);
                row.appendChild(dateCell);
                row.appendChild(participantCell);
                row.appendChild(statusCell);

                if (isSelectable) {
                    row.addEventListener('click', (event) => {
                        if (event.target instanceof HTMLInputElement) return;
                        checkbox.checked = !checkbox.checked;
                        toggleRowSelection(checkbox, row);
                    });
                }

                tbody.appendChild(row);
            });

            updateImportButton();
        }

        function toggleRowSelection(checkbox, row) {
            if (checkbox.disabled) return;
            if (checkbox.checked) {
                row.classList.add('is-row-selected');
            } else {
                row.classList.remove('is-row-selected');
                selectAllCheckbox.checked = false;
            }
            updateImportButton();
        }

        function toggleSelectAll(checked) {
            document.querySelectorAll('.research-checkbox').forEach(checkbox => {
                if (!checkbox.disabled) {
                    checkbox.checked = checked;
                    const row = checkbox.closest('tr');
                    if (row) {
                        row.classList.toggle('is-row-selected', checked);
                    }
                }
            });
            updateImportButton();
        }

        function updateImportButton() {
            const selectedCheckboxes = document.querySelectorAll('.research-checkbox:checked');
            const count = selectedCheckboxes.length;
            actionStatusMessage.classList.remove('status-message--error');
            actionStatusMessage.textContent = translate('status.action.selectCount', { count });

            if (count > 0) {
                importButton.disabled = false;
                importButton.textContent = translate('action.import.label', { count });
            } else {
                importButton.disabled = true;
                importButton.textContent = translate('action.import.default');
            }
        }

        function resetUI() {
            loadedResearchData = [];
            jsonFileInput.value = '';
            uploadSection.classList.add('is-hidden');
            selectionArea.classList.add('is-hidden');
            actionArea.classList.add('is-hidden');
            document.getElementById('researchTableBody').innerHTML = '';
            fileStatusState = { type: 'hint' };
            renderFileStatus();
            updateImportButton();
            actionStatusMessage.textContent = translate('action.status.none');
            loadAllResearches().then(() => renderMemoryStatus());
        }

        async function continueImport() {
            const selectedCheckboxes = document.querySelectorAll('.research-checkbox:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));

            if (selectedIds.length === 0) {
                actionStatusMessage.textContent = translate('status.import.error');
                actionStatusMessage.classList.add('status-message--error');
                return;
            }

            const researchesToImport = loadedResearchData.filter(r => selectedIds.includes(r.researchId));
            importButton.textContent = translate('status.import.loading');
            importButton.disabled = true;
            updateDbStatus('loading', { key: 'status.import.loading' });

            try {
                if (!db) {
                    await showCustomModal(
                        translate('status.import.simulated'),
                        translate('status.import.simulatedMessage', { count: researchesToImport.length }),
                        false
                    );
                } else {
                    await saveResearches(researchesToImport);
                    updateDbStatus('ok', { key: 'status.import.success', vars: { count: researchesToImport.length } });
                }
            } catch (error) {
                updateDbStatus('error', { key: 'status.import.failure', vars: { message: error.message } });
            } finally {
                setTimeout(() => {
                    resetUI();
                }, 3000);
            }
        }

        function registerEventListeners() {
            showUploadButton.addEventListener('click', showUploadSection);
            clearDbButton.addEventListener('click', clearDatabaseAndReload);
            toggleSyncButton.addEventListener('click', toggleOnlineSync);
            syncAllButton.addEventListener('click', syncAllToOnline);
            clearAllOnlineButton.addEventListener('click', confirmClearOnline);
            jsonFileInput.addEventListener('change', handleFileUpload);
            loadTestDataButton.addEventListener('click', loadTestData);
            selectAllCheckbox.addEventListener('change', () => toggleSelectAll(selectAllCheckbox.checked));
            importButton.addEventListener('click', continueImport);
        }

        async function init() {
            registerEventListeners();
            await openDB().catch(console.error);
            updateImportButton();
            await updateOnlineStatus();
            isAppInitialized = true;
            applyLanguage(currentLanguage);
        }

        document.addEventListener('DOMContentLoaded', init);
    })();
