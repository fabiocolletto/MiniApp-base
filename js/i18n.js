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
        noMatches: 'Nenhum MiniApp corresponde aos seus filtros de busca.',
        catalogLoaded: 'Catálogo carregado: {{count}} MiniApps disponíveis.',
        localFallbackExtra: ' + {{count}} MiniApp(s) locais.',
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
        noMatches: 'No MiniApps match your filters.',
        catalogLoaded: 'Catalog loaded: {{count}} MiniApps available.',
        localFallbackExtra: ' + {{count}} local MiniApp(s).',
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
