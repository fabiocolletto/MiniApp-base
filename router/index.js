import { renderView } from '../ui/app-shell.js';
import { logInfo, logWarn } from '../sys/log.js';

const routeToView = {
  dashboard: 'home',
  login: 'login',
  register: 'register',
};

class Router {
  #currentRoute = null;

  get currentRoute() {
    return this.#currentRoute;
  }

  goTo(route) {
    const targetView = routeToView[route];

    if (!targetView) {
      logWarn('router.unknown', `Rota "${route}" não está registrada.`);
      return;
    }

    if (this.#currentRoute === route) {
      return;
    }

    renderView(targetView);
    this.#currentRoute = route;
    logInfo('router.navigate', `Navegação para "${route}" concluída.`);
  }
}

export const router = new Router();
