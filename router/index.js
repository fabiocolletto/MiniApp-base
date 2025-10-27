import { renderView } from '../ui/app-shell.js';
import { logInfo, logWarn } from '../sys/tools/log.js';

const routeToView = {
  dashboard: 'home',
  login: 'login',
  register: 'register',
};

function isRouteName(value) {
  return Object.prototype.hasOwnProperty.call(routeToView, value);
}

function sanitizeRouteName(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replace(/^#+/, '').replace(/^\/+/, '');

  if (!normalized) {
    return null;
  }

  return isRouteName(normalized) ? normalized : null;
}

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

function attachRouterToGlobalScope(instance) {
  if (typeof globalThis !== 'object' || !globalThis) {
    return;
  }

  const navigate = (route) => {
    const targetRoute = sanitizeRouteName(route);

    if (!targetRoute) {
      logWarn('router.navigate.invalid', `Rota "${String(route)}" é inválida.`);
      return;
    }

    instance.goTo(targetRoute);
  };

  const bridge = {
    navigate,
    get currentRoute() {
      return instance.currentRoute;
    },
  };

  globalThis.AppRouter = bridge;
  globalThis.navigateTo = navigate;
}

attachRouterToGlobalScope(router);
