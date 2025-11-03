export const SUPPORTED_LANGS = ['pt-BR', 'en-US', 'es-ES'];

const TEXTS = {
  'pt-BR': {
    'brand.title': 'MiniApp Base',
    'brand.subtitle': 'Shell pronto para MiniApps internos',
    'nav.toggle': 'Alternar menu',
    'nav.home': 'Início',
    'nav.miniapps': 'MiniApps',
    'nav.settings': 'Ajustes',
    'nav.help': 'Ajuda',
    'nav.diagnostics': 'Diagnóstico',
    'home.title': 'MiniApp Base',
    'home.caption': 'Ajuste tema, idioma e tamanho do texto antes de começar.',
    'home.gridTitle': 'MiniApps configurados',
    'miniapps.title': 'MiniApps',
    'miniapps.caption': 'Escolha um MiniApp interno para abrir no painel.',
    'settings.title': 'Ajustes globais',
    'settings.caption': 'Preferências compartilhadas com todos os MiniApps internos.',
    'settings.theme': 'Tema',
    'settings.theme.auto': 'Automático',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Escuro',
    'settings.language': 'Idioma',
    'settings.font': 'Escala da fonte',
    'help.title': 'Ajuda e suporte',
    'help.caption': 'Documentação essencial do MiniApp Base.',
    'about.title': 'Sobre o MiniApp Base',
    'about.version': 'Versão <span data-app-version></span> — última atualização em <span data-app-updated></span>.',
    'about.owner.label': 'Proprietário',
    'about.owner.value': '5 Horas Tecnologia e Consultoria LTDA.',
    'about.privacy.label': 'Privacidade e termos',
    'about.privacy.value': 'Política de Privacidade',
    'about.contact.label': 'Contato',
    'about.contact.value': 'contato@5horas.com.br',
    'about.tech.label': 'Tecnologias',
    'about.tech.value': 'HTML5, CSS, JavaScript, IndexedDB, BroadcastChannel.',
    'help.resources.title': 'Recursos rápidos',
    'help.resources.guide': 'Guia de integração de MiniApps internos',
    'help.resources.elementor': 'Integração via Elementor',
    'diagnostics.title': 'Diagnóstico',
    'diagnostics.caption': 'Status do armazenamento e sincronização.',
    'diagnostics.storage.persisted': 'Armazenamento persistente',
    'diagnostics.storage.quota': 'Quota disponível',
    'diagnostics.storage.usage': 'Uso atual',
    'diagnostics.storage.updated': 'Última atualização',
    'diagnostics.persisted.yes': 'Sim (persistente)',
    'diagnostics.persisted.no': 'Não (volátil)',
    'diagnostics.storage.unit': 'MB',
    'miniapp.close': 'Voltar ao Início',
    'miniapp.external': 'Abrir em nova aba',
    'miniapp.open': 'Abrir MiniApp',
    'miniapp.notFound': 'MiniApp não encontrado.',
    'footer.product': 'MiniApp Base',
    'status.synced': 'Sincronizado',
    'status.dirty': 'Desatualizado',
    'status.saving': 'Salvando…',
    'status.saved': 'Salvo',
    'status.error': 'Erro ao salvar',
    'toast.externalBlocked': 'Conteúdo externo bloqueado. Abrimos em nova aba.',
  },
  'en-US': {
    'brand.title': 'MiniApp Base',
    'brand.subtitle': 'Shell ready for internal MiniApps',
    'nav.toggle': 'Toggle menu',
    'nav.home': 'Home',
    'nav.miniapps': 'MiniApps',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.diagnostics': 'Diagnostics',
    'home.title': 'MiniApp Base',
    'home.caption': 'Adjust theme, language and type scale before you start.',
    'home.gridTitle': 'Configured MiniApps',
    'miniapps.title': 'MiniApps',
    'miniapps.caption': 'Choose an internal MiniApp to open inside the panel.',
    'settings.title': 'Global preferences',
    'settings.caption': 'Shared preferences for every internal MiniApp.',
    'settings.theme': 'Theme',
    'settings.theme.auto': 'Automatic',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.language': 'Language',
    'settings.font': 'Font scale',
    'help.title': 'Help & support',
    'help.caption': 'Essential documentation for MiniApp Base.',
    'about.title': 'About MiniApp Base',
    'about.version': 'Version <span data-app-version></span> — last updated on <span data-app-updated></span>.',
    'about.owner.label': 'Owner',
    'about.owner.value': '5 Horas Tecnologia e Consultoria LTDA.',
    'about.privacy.label': 'Privacy & terms',
    'about.privacy.value': 'Privacy Policy',
    'about.contact.label': 'Contact',
    'about.contact.value': 'contato@5horas.com.br',
    'about.tech.label': 'Technologies',
    'about.tech.value': 'HTML5, CSS, JavaScript, IndexedDB, BroadcastChannel.',
    'help.resources.title': 'Quick resources',
    'help.resources.guide': 'Internal MiniApp integration guide',
    'help.resources.elementor': 'Elementor integration',
    'diagnostics.title': 'Diagnostics',
    'diagnostics.caption': 'Storage and synchronisation status.',
    'diagnostics.storage.persisted': 'Persistent storage',
    'diagnostics.storage.quota': 'Available quota',
    'diagnostics.storage.usage': 'Current usage',
    'diagnostics.storage.updated': 'Last update',
    'diagnostics.persisted.yes': 'Yes (persistent)',
    'diagnostics.persisted.no': 'No (volatile)',
    'diagnostics.storage.unit': 'MB',
    'miniapp.close': 'Back to Home',
    'miniapp.external': 'Open in new tab',
    'miniapp.open': 'Open MiniApp',
    'miniapp.notFound': 'MiniApp not found.',
    'footer.product': 'MiniApp Base',
    'status.synced': 'Synced',
    'status.dirty': 'Out of date',
    'status.saving': 'Saving…',
    'status.saved': 'Saved',
    'status.error': 'Save failed',
    'toast.externalBlocked': 'External content blocked. We opened it in a new tab.',
  },
  'es-ES': {
    'brand.title': 'MiniApp Base',
    'brand.subtitle': 'Shell listo para MiniApps internos',
    'nav.toggle': 'Alternar menú',
    'nav.home': 'Inicio',
    'nav.miniapps': 'MiniApps',
    'nav.settings': 'Ajustes',
    'nav.help': 'Ayuda',
    'nav.diagnostics': 'Diagnóstico',
    'home.title': 'MiniApp Base',
    'home.caption': 'Ajusta tema, idioma y tamaño de fuente antes de comenzar.',
    'home.gridTitle': 'MiniApps configurados',
    'miniapps.title': 'MiniApps',
    'miniapps.caption': 'Elige un MiniApp interno para abrir en el panel.',
    'settings.title': 'Ajustes globales',
    'settings.caption': 'Preferencias compartidas con todos los MiniApps internos.',
    'settings.theme': 'Tema',
    'settings.theme.auto': 'Automático',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.language': 'Idioma',
    'settings.font': 'Escala de fuente',
    'help.title': 'Ayuda y soporte',
    'help.caption': 'Documentación esencial del MiniApp Base.',
    'about.title': 'Acerca de MiniApp Base',
    'about.version': 'Versión <span data-app-version></span> — última actualización <span data-app-updated></span>.',
    'about.owner.label': 'Propietario',
    'about.owner.value': '5 Horas Tecnologia e Consultoria LTDA.',
    'about.privacy.label': 'Privacidad y términos',
    'about.privacy.value': 'Política de Privacidad',
    'about.contact.label': 'Contacto',
    'about.contact.value': 'contato@5horas.com.br',
    'about.tech.label': 'Tecnologías',
    'about.tech.value': 'HTML5, CSS, JavaScript, IndexedDB, BroadcastChannel.',
    'help.resources.title': 'Recursos rápidos',
    'help.resources.guide': 'Guía de integración de MiniApps internos',
    'help.resources.elementor': 'Integración con Elementor',
    'diagnostics.title': 'Diagnóstico',
    'diagnostics.caption': 'Estado del almacenamiento y la sincronización.',
    'diagnostics.storage.persisted': 'Almacenamiento persistente',
    'diagnostics.storage.quota': 'Cuota disponible',
    'diagnostics.storage.usage': 'Uso actual',
    'diagnostics.storage.updated': 'Última actualización',
    'diagnostics.persisted.yes': 'Sí (persistente)',
    'diagnostics.persisted.no': 'No (volátil)',
    'diagnostics.storage.unit': 'MB',
    'miniapp.close': 'Volver al inicio',
    'miniapp.external': 'Abrir en nueva pestaña',
    'miniapp.open': 'Abrir MiniApp',
    'miniapp.notFound': 'MiniApp no encontrado.',
    'footer.product': 'MiniApp Base',
    'status.synced': 'Sincronizado',
    'status.dirty': 'Desactualizado',
    'status.saving': 'Guardando…',
    'status.saved': 'Guardado',
    'status.error': 'Error al guardar',
    'toast.externalBlocked': 'Contenido externo bloqueado. Lo abrimos en una pestaña nueva.',
  },
};

function normalizeLang(lang) {
  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return 'pt-BR';
  }
  return lang;
}

export function getTranslation(lang, key) {
  const normalized = normalizeLang(lang);
  return TEXTS[normalized]?.[key] ?? TEXTS['pt-BR']?.[key] ?? key;
}

export function applyTranslations(root, lang) {
  if (!root) return;
  const normalized = normalizeLang(lang);
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.dataset.i18n;
    if (!key) return;
    const value = getTranslation(normalized, key);
    if (value.includes('<span')) {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  });
}

export function formatNumber(value, lang, options = {}) {
  try {
    return new Intl.NumberFormat(lang, options).format(value);
  } catch (error) {
    return String(value);
  }
}

export function formatDate(value, lang) {
  try {
    const formatter = new Intl.DateTimeFormat(lang, {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    return formatter.format(value);
  } catch (error) {
    return value instanceof Date ? value.toISOString() : String(value);
  }
}
