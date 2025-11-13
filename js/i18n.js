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
