import { renderView } from '../ui/app-shell.js';
import { logInfo, logWarn } from '../sys/log.js';

export type RouteName = 'dashboard' | 'login' | 'register' | 'catalog';

type ViewName = 'home' | 'login' | 'register' | 'panel-gallery';

const routeToView: Record<RouteName, ViewName> = {
  dashboard: 'home',
  login: 'login',
  register: 'register',
  catalog: 'panel-gallery',
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
      renderView(targetView);
      logInfo('router.navigate', `Rota "${route}" já estava ativa. View recarregada.`);
      return;
    }

    renderView(targetView);
    this.#currentRoute = route;
    logInfo('router.navigate', `Navegação para "${route}" concluída.`);
  }
}

export const router = new Router();
