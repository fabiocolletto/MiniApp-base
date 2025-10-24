import { determineInitialRoute } from '../core/bootstrap.js';
import { router } from '../router/index.js';
import {
  getPersistedViewName,
  initializeAppShell,
  renderView,
  showSplash,
} from '../ui/app-shell.js';
import { logError, logInfo } from '../sys/log.js';

const ROUTE_BY_VIEW = {
  home: 'dashboard',
  login: 'login',
  register: 'register',
};

function restorePersistedView(persistedView) {
  if (typeof persistedView !== 'string' || !persistedView) {
    return;
  }

  const viewRoot = document.getElementById('view-root');
  const activeView = viewRoot instanceof HTMLElement ? viewRoot.dataset.view ?? null : null;
  if (activeView === persistedView) {
    return;
  }

  if (persistedView === 'panel-gallery') {
    router.goTo('dashboard');
    logInfo('app.bootstrap.restore', 'View "panel-gallery" removida. Painel inicial aberto no lugar da galeria.');
    return;
  }

  const targetRoute = ROUTE_BY_VIEW[persistedView];
  if (targetRoute) {
    router.goTo(targetRoute);
    logInfo(
      'app.bootstrap.restore',
      `View "${persistedView}" restaurada pela rota "${targetRoute}" após recarregamento.`,
    );
    return;
  }

  renderView(persistedView);
  logInfo('app.bootstrap.restore', `View "${persistedView}" restaurada após recarregamento.`);
}

export async function bootstrapApp() {
  showSplash();

  try {
    const persistedView = getPersistedViewName();
    const route = await determineInitialRoute();
    router.goTo(route);
    initializeAppShell(router);
    restorePersistedView(persistedView);
    logInfo('app.bootstrap.ready', `Aplicação inicializada na rota "${route}".`);
  } catch (error) {
    logError('app.bootstrap.failed', 'Falha ao inicializar aplicação. Direcionando para cadastro.', error);
    router.goTo('register');
    initializeAppShell(router);
  }
}
