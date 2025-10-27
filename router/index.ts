import { renderView } from '../ui/app-shell.js';
import { logInfo, logWarn } from '../sys/tools/log.js';

export type RouteName = 'dashboard' | 'login' | 'register';

type ViewName = 'home' | 'login' | 'register';

const routeToView: Record<RouteName, ViewName> = {
  dashboard: 'home',
  login: 'login',
  register: 'register',
};

function isRouteName(value: string): value is RouteName {
  return value in routeToView;
}

function sanitizeRouteName(value: unknown): RouteName | null {
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

type RouterGlobal = {
  navigate: (route: RouteName | string) => void;
  readonly currentRoute: RouteName | null;
};

function attachRouterToGlobalScope(instance: Router): void {
  const globalObject = typeof globalThis === 'object' && globalThis ? (globalThis as Partial<
    Record<'AppRouter' | 'navigateTo', unknown>
  >) : null;

  if (!globalObject) {
    return;
  }

  const navigate = (route: RouteName | string): void => {
    const targetRoute = sanitizeRouteName(route);

    if (!targetRoute) {
      logWarn('router.navigate.invalid', `Rota "${String(route)}" é inválida.`);
      return;
    }

    instance.goTo(targetRoute);
  };

  const bridge: RouterGlobal = {
    navigate,
    get currentRoute(): RouteName | null {
      return instance.currentRoute;
    },
  };

  globalObject.AppRouter = bridge;
  globalObject.navigateTo = navigate;
}

attachRouterToGlobalScope(router);

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    AppRouter?: RouterGlobal;
    navigateTo?: (route: RouteName | string) => void;
  }

  // eslint-disable-next-line no-var
  var AppRouter: RouterGlobal | undefined;
  // eslint-disable-next-line no-var
  var navigateTo: ((route: RouteName | string) => void) | undefined;
}
