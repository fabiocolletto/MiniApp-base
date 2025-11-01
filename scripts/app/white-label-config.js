export const WHITE_LABEL_IDENTITY = Object.freeze({
  appName: 'MiniApp Base White Label',
  shortName: 'MiniApp Base',
  windowTitle: 'MiniApp Base • White Label',
  legalName: 'MiniApp Base White Label',
  welcomeMessage: 'Ajuste tema, idioma e tamanho do texto antes de começar sua jornada.',
  statusHint: 'Use o menu principal para criar uma conta ou abrir o MiniApp da sua marca.',
  miniAppLoadingMessage: 'Carregando MiniApp configurado…',
  guestHint: 'Bem-vindo ao shell white label. Esta área será preenchida com o MiniApp da sua marca.',
});

export const WHITE_LABEL_MINIAPP_CONTEXT = Object.freeze({
  brandName: 'sua marca',
  callToAction: 'Planejar integração',
  tagline:
    'Este módulo recebe o conteúdo definitivo da sua solução. Conecte APIs, widgets ou fluxos customizados aqui.',
  highlights: [
    'Personalize o tema com tokens compartilhados (`design/tokens.json`).',
    'Sincronize preferências utilizando `shared/storage/idb/prefs.js`.',
    'Exiba métricas, dashboards ou jornadas específicas da marca.',
  ],
  ctaHref: '#',
});

export function resolveMiniAppContext(overrides = {}) {
  if (!overrides || typeof overrides !== 'object') {
    return { ...WHITE_LABEL_MINIAPP_CONTEXT };
  }

  return { ...WHITE_LABEL_MINIAPP_CONTEXT, ...overrides };
}
