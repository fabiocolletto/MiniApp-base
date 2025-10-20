import { determineInitialRoute } from '../core/bootstrap.js';
import { router } from '../router/index.js';
import { initializeAppShell, showSplash } from '../ui/app-shell.js';
import { logError } from '../sys/log.js';

(async () => {
  showSplash();

  try {
    const route = await determineInitialRoute();
    router.goTo(route);
    initializeAppShell(router);
  } catch (error) {
    logError('app.entry.fallback', 'Falha ao definir rota inicial. Redirecionando para cadastro.', error);
    router.goTo('register');
    initializeAppShell(router);
  }
})();
