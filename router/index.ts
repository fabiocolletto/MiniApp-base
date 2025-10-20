import { renderView } from '../ui/app-shell.js';
import { logInfo, logWarn } from '../sys/log.js';

export type RouteName = 'dashboard' | 'login' | 'register';

type ViewName = 'home' | 'login' | 'register';

const routeToView: Record<RouteName, ViewName> = {
  dashboard: 'home',
  login: 'login',
  register: 'register',
};

class Router {
  #currentRoute: RouteName | null = null;

  get currentRoute(): RouteName | null {
    return this.#currentRoute;
  }

  goTo(route: RouteName): void {
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
