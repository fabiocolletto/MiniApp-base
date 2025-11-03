const DEFAULT_LANG = 'pt-BR';
const SUPPORTED_LANGS = ['pt-BR', 'en', 'es'];

const MESSAGES = {
  'pt-BR': {
    auth: {
      hint: 'Use o menu principal para abrir o MiniApp da sua marca e ajustar preferências.',
      subtitle: 'Ajuste tema, idioma e tamanho do texto antes de começar sua jornada.',
      miniapp: {
        loading: 'Carregando MiniApp configurado…',
      },
    },
    menu: {
      title: 'Menu principal',
      caption: 'Escolha como acessar e personalize a experiência do MiniApp.',
      activeViewPrefix: 'Painel atual:',
      buttonOpen: 'Abrir menu principal',
      tabs: {
        experience: 'Experiência',
        interfaces: 'Interfaces',
        settings: 'Configurações',
      },
      sections: {
        experience: 'Experiência',
        interfaces: 'Interfaces',
        settings: 'Configurações',
      },
      actions: {
        guest: 'Painel principal',
        openMiniApp: 'Abrir MiniApp',
        theme: 'Tema',
        font: 'Tamanho do texto',
        language: 'Idioma',
        themeControl: 'Escolher tema',
        fontControl: 'Ajustar tamanho do texto',
        languageControl: 'Escolher idioma',
        themeMetaPrefix: 'Tema atual:',
        fontMetaPrefix: 'Escala:',
        languageMetaPrefix: 'Idioma:',
      },
      language: {
        title: 'Selecione o idioma preferido',
        groupLabel: 'Idiomas disponíveis',
        option: {
          'pt-BR': 'Português (Brasil)',
          en: 'Inglês',
          es: 'Espanhol',
        },
      },
    },
    theme: {
      option: {
        auto: 'Automático',
        light: 'Claro',
        dark: 'Escuro',
      },
    },
    fontScale: {
      option: {
        '-2': 'Muito pequeno',
        '-1': 'Pequeno',
        0: 'Padrão',
        1: 'Grande',
        2: 'Muito grande',
      },
    },
    language: {
      label: {
        'pt-BR': 'Português (Brasil)',
        en: 'Inglês',
        es: 'Espanhol',
      },
    },
    footer: {
      toggle: {
        expand: 'Mostrar detalhes do rodapé',
        collapse: 'Ocultar detalhes do rodapé',
      },
    },
    views: {
      guest: {
        hint: 'Bem-vindo ao shell white label. Tudo está liberado sem cadastro e os dados ficam no seu dispositivo.',
      },
    },
    storage: {
      status: {
        checking: 'Armazenamento: verificando…',
        persistent: 'Armazenamento: persistente',
        temporary: 'Armazenamento: temporário',
        unavailable: 'Armazenamento: indisponível',
      },
      usage: {
        label: 'Uso:',
        of: 'de',
        percent: '({percent}%)',
      },
    },
  },
  en: {
    auth: {
      hint: 'Use the main menu to open your brand\'s MiniApp and adjust preferences.',
      subtitle: 'Pick theme, language, and text size before starting your journey.',
      miniapp: {
        loading: 'Loading configured MiniApp…',
      },
    },
    menu: {
      title: 'Main menu',
      caption: 'Choose how to access and personalise the MiniApp experience.',
      activeViewPrefix: 'Current view:',
      buttonOpen: 'Open main menu',
      tabs: {
        experience: 'Experience',
        interfaces: 'Interfaces',
        settings: 'Settings',
      },
      sections: {
        experience: 'Experience',
        interfaces: 'Interfaces',
        settings: 'Settings',
      },
      actions: {
        guest: 'Home panel',
        openMiniApp: 'Open MiniApp',
        theme: 'Theme',
        font: 'Text size',
        language: 'Language',
        themeControl: 'Choose theme',
        fontControl: 'Adjust text size',
        languageControl: 'Choose language',
        themeMetaPrefix: 'Theme:',
        fontMetaPrefix: 'Scale:',
        languageMetaPrefix: 'Language:',
      },
      language: {
        title: 'Choose your preferred language',
        groupLabel: 'Available languages',
        option: {
          'pt-BR': 'Portuguese (Brazil)',
          en: 'English',
          es: 'Spanish',
        },
      },
    },
    theme: {
      option: {
        auto: 'Auto',
        light: 'Light',
        dark: 'Dark',
      },
    },
    fontScale: {
      option: {
        '-2': 'Very small',
        '-1': 'Small',
        0: 'Default',
        1: 'Large',
        2: 'Very large',
      },
    },
    language: {
      label: {
        'pt-BR': 'Portuguese (Brazil)',
        en: 'English',
        es: 'Spanish',
      },
    },
    footer: {
      toggle: {
        expand: 'Show footer details',
        collapse: 'Hide footer details',
      },
    },
    views: {
      guest: {
        hint: 'Welcome to the white-label shell. Everything is unlocked without sign-up and stays on this device.',
      },
    },
    storage: {
      status: {
        checking: 'Storage: checking…',
        persistent: 'Storage: persistent',
        temporary: 'Storage: temporary',
        unavailable: 'Storage: unavailable',
      },
      usage: {
        label: 'Usage:',
        of: 'of',
        percent: '({percent}%)',
      },
    },
  },
  es: {
    auth: {
      hint: 'Usa el menú principal para abrir el MiniApp de tu marca y ajustar las preferencias.',
      subtitle: 'Elige tema, idioma y tamaño del texto antes de comenzar tu jornada.',
      miniapp: {
        loading: 'Cargando MiniApp configurado…',
      },
    },
    menu: {
      title: 'Menú principal',
      caption: 'Elige cómo acceder y personaliza la experiencia del MiniApp.',
      activeViewPrefix: 'Panel actual:',
      buttonOpen: 'Abrir menú principal',
      tabs: {
        experience: 'Experiencia',
        interfaces: 'Interfaces',
        settings: 'Configuraciones',
      },
      sections: {
        experience: 'Experiencia',
        interfaces: 'Interfaces',
        settings: 'Configuraciones',
      },
      actions: {
        guest: 'Panel principal',
        openMiniApp: 'Abrir MiniApp',
        theme: 'Tema',
        font: 'Tamaño del texto',
        language: 'Idioma',
        themeControl: 'Elegir tema',
        fontControl: 'Ajustar tamaño del texto',
        languageControl: 'Elegir idioma',
        themeMetaPrefix: 'Tema:',
        fontMetaPrefix: 'Escala:',
        languageMetaPrefix: 'Idioma:',
      },
      language: {
        title: 'Selecciona el idioma preferido',
        groupLabel: 'Idiomas disponibles',
        option: {
          'pt-BR': 'Portugués (Brasil)',
          en: 'Inglés',
          es: 'Español',
        },
      },
    },
    theme: {
      option: {
        auto: 'Automático',
        light: 'Claro',
        dark: 'Oscuro',
      },
    },
    fontScale: {
      option: {
        '-2': 'Muy pequeño',
        '-1': 'Pequeño',
        0: 'Predeterminado',
        1: 'Grande',
        2: 'Muy grande',
      },
    },
    language: {
      label: {
        'pt-BR': 'Portugués (Brasil)',
        en: 'Inglés',
        es: 'Español',
      },
    },
    footer: {
      toggle: {
        expand: 'Mostrar detalles del pie de página',
        collapse: 'Ocultar detalles del pie de página',
      },
    },
    views: {
      guest: {
        hint: 'Bienvenido al shell white label. Todo está liberado sin registro y los datos permanecen en este dispositivo.',
      },
    },
    storage: {
      status: {
        checking: 'Almacenamiento: verificando…',
        persistent: 'Almacenamiento: persistente',
        temporary: 'Almacenamiento: temporal',
        unavailable: 'Almacenamiento: no disponible',
      },
      usage: {
        label: 'Uso:',
        of: 'de',
        percent: '({percent}%)',
      },
    },
  },
};

function resolveLanguage(lang = DEFAULT_LANG) {
  if (typeof lang !== 'string') {
    return DEFAULT_LANG;
  }
  const normalized = lang.trim();
  return SUPPORTED_LANGS.includes(normalized) ? normalized : DEFAULT_LANG;
}

function getMessage(key, lang = DEFAULT_LANG) {
  const resolvedLang = resolveLanguage(lang);
  const segments = key.split('.');
  let node = MESSAGES[resolvedLang];
  for (const segment of segments) {
    if (!node || typeof node !== 'object' || !(segment in node)) {
      node = undefined;
      break;
    }
    node = node[segment];
  }
  if (typeof node === 'undefined') {
    if (resolvedLang === DEFAULT_LANG) {
      return undefined;
    }
    return getMessage(key, DEFAULT_LANG);
  }
  if (typeof node === 'string') {
    return node;
  }
  return undefined;
}

export function translate(key, lang = DEFAULT_LANG, options = {}) {
  if (typeof key !== 'string' || key.trim() === '') {
    return options?.fallback ?? '';
  }
  const params = options?.params && typeof options.params === 'object' ? options.params : {};
  const fallback = options?.fallback ?? '';
  const raw = getMessage(key, lang);
  const result = typeof raw === 'string' ? raw : fallback;
  return Object.keys(params).reduce((acc, paramKey) => {
    const token = `{${paramKey}}`;
    return acc.split(token).join(String(params[paramKey] ?? ''));
  }, result);
}

export function getThemeLabel(theme, lang = DEFAULT_LANG) {
  const fallback = theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Automático';
  return translate(`theme.option.${theme}`, lang, { fallback });
}

export function getThemeMetaPrefix(lang = DEFAULT_LANG) {
  return translate('menu.actions.themeMetaPrefix', lang, { fallback: 'Tema atual:' });
}

export function getFontScaleLabel(scale, lang = DEFAULT_LANG) {
  const key = `fontScale.option.${scale}`;
  return translate(key, lang, { fallback: translate('fontScale.option.0', lang, { fallback: 'Padrão' }) });
}

export function getFontMetaPrefix(lang = DEFAULT_LANG) {
  return translate('menu.actions.fontMetaPrefix', lang, { fallback: 'Escala:' });
}

export function getLanguageMetaPrefix(lang = DEFAULT_LANG) {
  return translate('menu.actions.languageMetaPrefix', lang, { fallback: 'Idioma:' });
}

export function getLanguageDisplayName(language, lang = DEFAULT_LANG) {
  return translate(`language.label.${language}`, lang, { fallback: language });
}

export function getLanguageOptionLabel(language, lang = DEFAULT_LANG) {
  return translate(`menu.language.option.${language}`, lang, { fallback: getLanguageDisplayName(language, lang) });
}

export function getFooterToggleLabel(state, lang = DEFAULT_LANG) {
  const key = state === 'collapse' ? 'footer.toggle.collapse' : 'footer.toggle.expand';
  const fallback = state === 'collapse' ? 'Ocultar detalhes do rodapé' : 'Mostrar detalhes do rodapé';
  return translate(key, lang, { fallback });
}

export function getStorageStatusLabel(state, lang = DEFAULT_LANG) {
  const key = `storage.status.${state}`;
  const fallbackMap = {
    checking: 'Armazenamento: verificando…',
    persistent: 'Armazenamento: persistente',
    temporary: 'Armazenamento: temporário',
    unavailable: 'Armazenamento: indisponível',
  };
  return translate(key, lang, { fallback: fallbackMap[state] ?? '' });
}

export function getStorageUsageLabels(lang = DEFAULT_LANG) {
  return {
    label: translate('storage.usage.label', lang, { fallback: 'Uso:' }),
    of: translate('storage.usage.of', lang, { fallback: 'de' }),
    percent: translate('storage.usage.percent', lang, { fallback: '({percent}%)' }),
  };
}

export function applyTranslations(doc, lang = DEFAULT_LANG) {
  if (!doc || typeof doc.querySelectorAll !== 'function') {
    return;
  }

  const elements = doc.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) {
      return;
    }
    const fallback = element.textContent ? element.textContent.trim() : '';
    const text = translate(key, lang, { fallback });
    if (typeof text === 'string') {
      element.textContent = text;
    }
  });

  const attrElements = doc.querySelectorAll('[data-i18n-attr]');
  attrElements.forEach((element) => {
    const instructions = element.getAttribute('data-i18n-attr');
    if (!instructions) {
      return;
    }
    instructions
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((instruction) => {
        const [attribute, key] = instruction.split(':').map((part) => part.trim());
        if (!attribute || !key) {
          return;
        }
        const fallback = element.getAttribute(attribute) ?? '';
        const text = translate(key, lang, { fallback });
        element.setAttribute(attribute, text);
      });
  });
}

export { DEFAULT_LANG, SUPPORTED_LANGS };
