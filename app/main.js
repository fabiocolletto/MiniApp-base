import { determineInitialRoute } from '../core/bootstrap.js';
import { router } from '../router/index.js';
import { initializeAppShell, showSplash } from '../ui/app-shell.js';
import { logError, logInfo } from '../sys/log.js';

export async function bootstrapApp() {
  showSplash();

  try {
    const route = await determineInitialRoute();
    router.goTo(route);
    initializeAppShell(router);
    logInfo('app.bootstrap.ready', `Aplicação inicializada na rota "${route}".`);
  } catch (error) {
    logError('app.bootstrap.failed', 'Falha ao inicializar aplicação. Direcionando para cadastro.', error);
    router.goTo('register');
    initializeAppShell(router);
  }
}
