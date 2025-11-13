export const AVAILABLE_LOCALES = ['pt-BR', 'en-US'];
export const DEFAULT_LOCALE = 'pt-BR';

const TRANSLATIONS = {
  'pt-BR': {
    meta: {
      name: 'Português',
      nativeName: 'Português (Brasil)',
      direction: 'ltr',
    },
    languageNames: {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'Inglês',
    },
    shell: {
      header: {
        title: 'Catálogo de MiniApps',
        subtitle: 'Escolha um MiniApp para abrir',
      },
      actions: {
        openCatalog: 'Catálogo',
        install: 'Instalar',
        download: {
          label: 'Baixar MiniApp',
          title: 'Baixar o MiniApp atual',
          ariaLabel: 'Baixar o MiniApp atualmente aberto.',
        },
        theme: {
          toDark: 'Ativar tema escuro',
          toLight: 'Ativar tema claro',
        },
        language: {
          label: 'Português',
          changeTitle: 'Alterar idioma para {{nextLanguage}}',
          ariaLabel: 'Idioma atual: {{currentLanguage}}. Toque para alterar para {{nextLanguage}}.',
        },
      },
      setup: {
        title: 'Configurar planilha do catálogo',
        instructions:
          'Informe o ID da planilha do Google Sheets que centraliza os MiniApps. Use o trecho entre /d/ e /edit da URL compartilhada.',
        label: 'ID da planilha',
        placeholder: '1A2B3C…',
        submit: 'Salvar e carregar catálogo',
        savingButton: 'Salvando…',
        statuses: {
          verifying: 'Verificando configuração do catálogo…',
          prefilled: 'ID configurado automaticamente. Carregando catálogo…',
          usingCache: 'Sem conexão com o Firestore. Usando o ID da planilha em cache.',
          prompt: 'Informe o ID da planilha do catálogo para começar.',
          invalid: 'Informe um ID de planilha válido.',
          saving: 'Salvando configuração…',
          savedRemote: 'ID salvo com sucesso. Carregando catálogo…',
          savedLocal: 'ID salvo localmente. Carregando catálogo…',
          saveError: 'Erro ao salvar o ID da planilha. Verifique sua conexão e tente novamente.',
        },
        configureTitle: 'Configurar planilha',
        configureSubtitle: 'Informe o ID da planilha para habilitar o catálogo.',
      },
    },
    catalog: {
      documentTitle: 'Catálogo de MiniApps',
      headerTitle: 'Seu Catálogo de MiniApps',
      headerSubtitle: 'Explore os aplicativos disponíveis para uso.',
      searchPlaceholder: 'Buscar por nome, categoria ou descrição...',
      filterDefault: 'Todas as Categorias',
      status: {
        initializing: 'Inicializando...',
        loading: 'Carregando catálogo...',
        empty: 'Nenhum MiniApp disponível.',
        loadError: 'Erro ao carregar o catálogo. Tente novamente.',
        loadingEssentials: 'Nenhum MiniApp no catálogo. Carregando os essenciais...',
        noMatches: 'Nenhum MiniApp corresponde aos seus filtros de busca.',
        firebaseMissing: 'Configuração do Firebase ausente.',
        firebaseInitialized: 'Firebase inicializado. Autenticando...',
        authListening: 'Autenticação concluída. Ouvindo catálogo...',
        catalogLoaded: 'Catálogo carregado: {{count}} MiniApps disponíveis.',
        localFallbackImported: '{{reason}}Catálogo importado do dispositivo ({{count}} MiniApps{{extra}}).',
        localFallbackLoaded: '{{reason}}Catálogo local carregado ({{count}} MiniApps).',
        localFallbackEssentials: '{{reason}}Exibindo apenas os MiniApps essenciais.',
        localFallbackExtra: ' + {{count}} MiniApp(s) locais.',
        remoteCatalogEmpty: 'Nenhum MiniApp publicado no catálogo remoto.',
        remoteCatalogNoData: 'Nenhum dado encontrado no catálogo remoto.',
        remoteCatalogError: 'Erro ao carregar catálogo remoto: {{message}}.',
        firebaseInitError: 'Erro ao inicializar Firebase: {{message}}.',
      },
      card: {
        open: 'Abrir',
        statusByKey: {
          essential: 'Essencial',
          available: 'Disponível',
          beta: 'Beta',
          maintenance: 'Em manutenção',
          deprecated: 'Descontinuado',
        },
      },
    },
    manager: {
      documentTitle: 'Gestor de Catálogo de MiniApps (Admin)',
      headerTitle: 'Gestor de Catálogo de MiniApps',
      headerSubtitle: 'Importe dados de planilha, valide e publique seu catálogo ativo.',
      badge: 'Acesso Admin',
      status: {
        initializing: 'Inicializando gestor…',
        miniappSaveSuccess: 'MiniApp "{{name}}" (ID: {{id}}) teve suas edições salvas com sucesso no catálogo.',
        miniappForceUpdate: 'MiniApp "{{name}}" (ID: {{id}}) forçado a atualizar (simulação).',
        miniappRemoved: 'MiniApp "{{name}}" (ID: {{id}}) excluído da lista ativa.',
        invalidSheet: 'Erro: URL ou ID da Planilha inválido. Verifique o formato.',
        fetchingSheet: 'Buscando dados da planilha do ID: {{sheetId}} (GID: {{gid}})...',
        noValidMiniapps: "Planilha encontrada, mas sem MiniApps válidos (verifique se as colunas 'id' e 'name' existem).",
        previewReady:
          'Pré-visualização OK! {{count}} MiniApps encontrados. Selecione os itens e clique em "Importar e Carregar".',
        loadError:
          'Erro ao carregar: Verifique o link/ID e o status de compartilhamento. O erro foi: {{message}}',
        noSelection:
          "Erro: Nenhum MiniApp selecionado para importar. Primeiro, clique em 'Testar e Visualizar' com um link válido e selecione os MiniApps.",
        importing: 'Importando e Mesclando MiniApps Ativos...',
        importSummary:
          'Importação Completa! {{newCount}} novos MiniApps adicionados e {{updatedCount}} atualizados (de {{selectedCount}} selecionados). Total ativo: {{totalCount}}.',
        localRestored: 'Catálogo local restaurado ({{count}} MiniApps ativos).',
        linkChanged: "Link/ID alterado. Clique em '{{stepLabel}}' (Passo {{stepNumber}}).",
        sheetRestored:
          "ID da planilha recuperado. Clique em '{{stepLabel}}' (Passo {{stepNumber}}) para sincronizar.",
      },
      panel: {
        importSummary: {
          title: 'Configuração Finalizada!',
          description:
            '{{summary}} A lista gerenciável está na Seção {{sectionNumber}}, onde você pode editá-los diretamente.',
          reopen: 'Reabrir Configuração',
        },
      },
      steps: {
        preview: {
          number: '2',
          shortLabel: 'Testar e Visualizar',
        },
      },
    },
  },
  'en-US': {
    meta: {
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
    },
    languageNames: {
      'pt-BR': 'Portuguese (Brazil)',
      'en-US': 'English',
    },
    shell: {
      header: {
        title: 'MiniApps Catalog',
        subtitle: 'Choose a MiniApp to open',
      },
      actions: {
        openCatalog: 'Catalog',
        install: 'Install',
        download: {
          label: 'Download MiniApp',
          title: 'Download the current MiniApp',
          ariaLabel: 'Download the MiniApp that is currently open.',
        },
        theme: {
          toDark: 'Switch to dark theme',
          toLight: 'Switch to light theme',
        },
        language: {
          label: 'English',
          changeTitle: 'Switch language to {{nextLanguage}}',
          ariaLabel: 'Current language: {{currentLanguage}}. Tap to switch to {{nextLanguage}}.',
        },
      },
      setup: {
        title: 'Configure catalog spreadsheet',
        instructions:
          'Enter the Google Sheets ID that manages your MiniApps. Use the portion between /d/ and /edit of the shared URL.',
        label: 'Spreadsheet ID',
        placeholder: '1A2B3C…',
        submit: 'Save and load catalog',
        savingButton: 'Saving…',
        statuses: {
          verifying: 'Checking catalog configuration…',
          prefilled: 'Sheet ID applied automatically. Loading catalog…',
          usingCache: 'Firestore unavailable. Using cached spreadsheet ID.',
          prompt: 'Provide the catalog spreadsheet ID to continue.',
          invalid: 'Enter a valid spreadsheet ID.',
          saving: 'Saving configuration…',
          savedRemote: 'ID saved successfully. Loading catalog…',
          savedLocal: 'ID saved locally. Loading catalog…',
          saveError: 'Unable to save the spreadsheet ID. Check your connection and try again.',
        },
        configureTitle: 'Configure spreadsheet',
        configureSubtitle: 'Provide the spreadsheet ID to enable the catalog.',
      },
    },
    catalog: {
      documentTitle: 'MiniApps Catalog',
      headerTitle: 'Your MiniApps Catalog',
      headerSubtitle: 'Browse the applications available to you.',
      searchPlaceholder: 'Search by name, category, or description…',
      filterDefault: 'All categories',
      status: {
        initializing: 'Starting…',
        loading: 'Loading catalog…',
        empty: 'No MiniApps available.',
        loadError: 'Unable to load the catalog. Please try again.',
        loadingEssentials: 'No MiniApps in the catalog yet. Loading essentials…',
        noMatches: 'No MiniApps match your filters.',
        firebaseMissing: 'Firebase configuration missing.',
        firebaseInitialized: 'Firebase initialized. Authenticating...',
        authListening: 'Authentication complete. Listening for catalog...',
        catalogLoaded: 'Catalog loaded: {{count}} MiniApps available.',
        localFallbackImported: '{{reason}}Device catalog imported ({{count}} MiniApps{{extra}}).',
        localFallbackLoaded: '{{reason}}Local catalog loaded ({{count}} MiniApps).',
        localFallbackEssentials: '{{reason}}Showing only essential MiniApps.',
        localFallbackExtra: ' + {{count}} local MiniApp(s).',
        remoteCatalogEmpty: 'No MiniApps published in the remote catalog.',
        remoteCatalogNoData: 'No data found in the remote catalog.',
        remoteCatalogError: 'Unable to load the remote catalog: {{message}}.',
        firebaseInitError: 'Failed to initialize Firebase: {{message}}.',
      },
      card: {
        open: 'Open',
        statusByKey: {
          essential: 'Essential',
          available: 'Available',
          beta: 'Beta',
          maintenance: 'Under maintenance',
          deprecated: 'Deprecated',
        },
      },
    },
    manager: {
      documentTitle: 'MiniApp Catalog Manager (Admin)',
      headerTitle: 'MiniApp Catalog Manager',
      headerSubtitle: 'Import spreadsheet data, validate it, and publish your active catalog.',
      badge: 'Admin Access',
      status: {
        initializing: 'Bootstrapping manager…',
        miniappSaveSuccess: 'MiniApp "{{name}}" (ID: {{id}}) saved successfully to the catalog.',
        miniappForceUpdate: 'MiniApp "{{name}}" (ID: {{id}}) force-updated (simulation).',
        miniappRemoved: 'MiniApp "{{name}}" (ID: {{id}}) removed from the active list.',
        invalidSheet: 'Error: Invalid spreadsheet URL or ID. Check the format.',
        fetchingSheet: 'Fetching spreadsheet data for ID: {{sheetId}} (GID: {{gid}})…',
        noValidMiniapps: 'Spreadsheet found, but no valid MiniApps (ensure columns "id" and "name" exist).',
        previewReady:
          'Preview ready! {{count}} MiniApps found. Select them and click "Import & Load".',
        loadError:
          'Load failed: Check the link/ID and sharing status. Error: {{message}}',
        noSelection:
          'Error: No MiniApps selected to import. First run "Test & Preview" with a valid link and select the MiniApps.',
        importing: 'Importing and merging active MiniApps…',
        importSummary:
          'Import complete! {{newCount}} new MiniApps added and {{updatedCount}} updated (out of {{selectedCount}} selected). Total active: {{totalCount}}.',
        localRestored: 'Local catalog restored ({{count}} active MiniApps).',
        linkChanged: "Link/ID changed. Click '{{stepLabel}}' (Step {{stepNumber}}).",
        sheetRestored:
          "Spreadsheet ID restored. Click '{{stepLabel}}' (Step {{stepNumber}}) to sync.",
      },
      panel: {
        importSummary: {
          title: 'Setup complete!',
          description:
            '{{summary}} The manageable list is in Section {{sectionNumber}} where you can edit entries directly.',
          reopen: 'Reopen setup',
        },
      },
      steps: {
        preview: {
          number: '2',
          shortLabel: 'Test & Preview',
        },
      },
    },
  },
};

export function getAvailableLocales() {
  return [...AVAILABLE_LOCALES];
}

export function getLocaleData(locale) {
  return TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
}

export function getShellMessages(locale) {
  return getLocaleData(locale).shell;
}

export function getCatalogMessages(locale) {
  return getLocaleData(locale).catalog;
}

export function getManagerMessages(locale) {
  return getLocaleData(locale).manager;
}

export function getLanguageName(locale, targetLocale) {
  const localeData = getLocaleData(locale);
  return localeData.languageNames[targetLocale] || targetLocale;
}

export function getNativeLanguageName(locale) {
  const localeData = getLocaleData(locale);
  return localeData.meta.nativeName;
}

export function getDirection(locale) {
  const localeData = getLocaleData(locale);
  return localeData.meta.direction || 'ltr';
}
