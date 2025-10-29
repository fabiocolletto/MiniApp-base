import { getMiniAppsSnapshot } from '../data/miniapp-store.js';

export const APP_DOC_BASE_PATH = './docs/miniapps';

export function normalizeMiniAppId(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

export function buildMiniAppDocPath(id) {
  const normalized = normalizeMiniAppId(id);
  return normalized ? `${APP_DOC_BASE_PATH}/${normalized}.md` : '';
}

function getNodeDefaultView(node) {
  if (!node) {
    return null;
  }

  const WindowRef = typeof Window === 'undefined' ? null : Window;
  if (WindowRef && node instanceof WindowRef) {
    return node;
  }

  if (typeof node !== 'object' || node === null) {
    return null;
  }

  const DocumentRef = typeof Document === 'undefined' ? null : Document;
  const ownerDocument = node.ownerDocument;

  if (DocumentRef && ownerDocument instanceof DocumentRef) {
    return ownerDocument.defaultView ?? null;
  }

  if (ownerDocument && typeof ownerDocument === 'object' && ownerDocument.defaultView) {
    return ownerDocument.defaultView;
  }

  return null;
}

function resolveToggleResult(result, { targetState }) {
  if (result && typeof result === 'object') {
    const hasSuccess = Object.prototype.hasOwnProperty.call(result, 'success');
    if (hasSuccess && result.success === false) {
      const error = new Error(result.message || 'A operação não pôde ser concluída.');
      if (Object.prototype.hasOwnProperty.call(result, 'reason')) {
        error.reason = result.reason;
      }
      error.details = result;
      throw error;
    }

    if (Object.prototype.hasOwnProperty.call(result, 'added')) {
      return Boolean(result.added);
    }

    if (Object.prototype.hasOwnProperty.call(result, 'saved')) {
      return Boolean(result.saved);
    }

    if (Object.prototype.hasOwnProperty.call(result, 'favorite')) {
      return Boolean(result.favorite);
    }

    if (Object.prototype.hasOwnProperty.call(result, 'state')) {
      return Boolean(result.state);
    }
  }

  if (typeof result === 'boolean') {
    return result;
  }

  return Boolean(targetState);
}

function notifyToggleError(target, fallbackMessage, error, reasonMessages = {}) {
  const reason =
    error?.reason ??
    error?.details?.reason ??
    (typeof error?.details === 'object' ? error.details?.reason : undefined);

  let message = fallbackMessage;

  if (reason && Object.prototype.hasOwnProperty.call(reasonMessages, reason)) {
    const resolver = reasonMessages[reason];
    try {
      message = typeof resolver === 'function' ? resolver(error?.details ?? error) : resolver;
    } catch (resolverError) {
      console.error('Falha ao resolver mensagem de erro da ação.', resolverError);
    }
  } else if (typeof error?.message === 'string' && error.message.trim() && error.message !== 'Error') {
    message = error.message.trim();
  }

  const HTMLElementRef = typeof HTMLElement === 'undefined' ? null : HTMLElement;
  if (HTMLElementRef && target instanceof HTMLElementRef) {
    target.dataset.feedback = message;
  }

  const win = getNodeDefaultView(target);
  if (win && typeof win.alert === 'function') {
    try {
      win.alert(message);
    } catch (alertError) {
      console.warn('Não foi possível exibir alerta de erro.', alertError);
    }
  }

  console.error(message, error);
  return message;
}

function setElementBusy(element, busy) {
  const HTMLElementRef = typeof HTMLElement === 'undefined' ? null : HTMLElement;
  if (!HTMLElementRef || !(element instanceof HTMLElementRef)) {
    return;
  }

  const isBusy = Boolean(busy);

  if ('disabled' in element) {
    element.disabled = isBusy;
  }

  if (isBusy) {
    element.dataset.busy = 'true';
    element.setAttribute('aria-busy', 'true');
  } else {
    element.removeAttribute('data-busy');
    element.removeAttribute('aria-busy');
  }
}

export function createMiniAppCard(
  app,
  { highlightId, onHighlight, isSaved = false, isFavorite = false, onToggleSaved, onToggleFavorite } = {},
) {
  const normalizedId = normalizeMiniAppId(app.id);

  const item = document.createElement('li');
  item.className = 'miniapp-store__item';
  item.dataset.appId = normalizedId;

  const card = document.createElement('article');
  card.className = 'miniapp-store__card surface-card';

  const title = document.createElement('h3');
  title.className = 'miniapp-store__title';
  title.textContent = app.name;

  const actions = document.createElement('div');
  actions.className = 'miniapp-store__actions';

  const appName = typeof app.name === 'string' && app.name.trim() ? app.name.trim() : 'MiniApp';

  const openLink = document.createElement('a');
  openLink.className = 'miniapp-store__action miniapp-store__action--open';
  openLink.href = buildMiniAppDocPath(app.id) || '#';
  openLink.textContent = 'Abrir';
  const openTitle = `Abrir documentação de ${appName}`;
  openLink.title = openTitle;
  openLink.setAttribute('aria-label', openTitle);

  const savedButton = document.createElement('button');
  savedButton.type = 'button';
  savedButton.className = 'miniapp-store__action miniapp-store__action--toggle miniapp-store__action--save';
  savedButton.dataset.action = 'save';

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className =
    'miniapp-store__action miniapp-store__action--toggle miniapp-store__action--favorite';
  favoriteButton.dataset.action = 'favorite';

  const applySavedState = (state) => {
    const active = Boolean(state);
    const label = active ? 'Salvo' : 'Salvar';
    const accessibleLabel = active
      ? `Remover ${appName} dos MiniApps salvos`
      : `Salvar ${appName} para acessar rapidamente depois`;

    savedButton.textContent = label;
    savedButton.setAttribute('aria-pressed', String(active));
    savedButton.dataset.state = active ? 'active' : 'inactive';
    savedButton.classList.toggle('miniapp-store__action--active', active);
    savedButton.setAttribute('aria-label', accessibleLabel);
    savedButton.title = accessibleLabel;
    savedButton.removeAttribute('data-feedback');
  };

  const applyFavoriteState = (state) => {
    const active = Boolean(state);
    const label = active ? 'Favorito' : 'Favoritar';
    const accessibleLabel = active
      ? `Remover ${appName} dos MiniApps favoritos`
      : `Adicionar ${appName} à lista de favoritos`;

    favoriteButton.textContent = label;
    favoriteButton.setAttribute('aria-pressed', String(active));
    favoriteButton.dataset.state = active ? 'active' : 'inactive';
    favoriteButton.classList.toggle('miniapp-store__action--active', active);
    favoriteButton.setAttribute('aria-label', accessibleLabel);
    favoriteButton.title = accessibleLabel;
    favoriteButton.removeAttribute('data-feedback');
  };

  let savedState = Boolean(isSaved);
  let favoriteState = Boolean(isFavorite);

  applySavedState(savedState);
  applyFavoriteState(favoriteState);

  const favoriteReasonMessages = {
    'favorite-limit-exceeded': (details) => {
      const limit =
        typeof details?.limit === 'number' && Number.isFinite(details.limit)
          ? details.limit
          : typeof details?.details?.limit === 'number' && Number.isFinite(details.details.limit)
            ? details.details.limit
            : null;
      return limit
        ? `Você atingiu o limite de ${limit} MiniApps favoritados. Remova um favorito antes de continuar.`
        : 'Você atingiu o limite de MiniApps favoritados. Remova um favorito antes de tentar novamente.';
    },
  };

  const handleSavedClick = () => {
    const previousState = savedState;
    const targetState = !previousState;

    savedState = targetState;
    applySavedState(savedState);

    if (typeof onToggleSaved !== 'function') {
      return;
    }

    setElementBusy(savedButton, true);

    let toggleResult;
    try {
      toggleResult = onToggleSaved({
        app,
        id: normalizedId,
        nextState: targetState,
        previousState,
        element: savedButton,
      });
    } catch (error) {
      savedState = previousState;
      applySavedState(savedState);
      setElementBusy(savedButton, false);
      notifyToggleError(
        savedButton,
        'Não foi possível atualizar os MiniApps salvos. Tente novamente em instantes.',
        error,
      );
      return;
    }

    Promise.resolve(toggleResult)
      .then((result) => {
        savedState = resolveToggleResult(result, { targetState });
        applySavedState(savedState);
      })
      .catch((error) => {
        savedState = previousState;
        applySavedState(savedState);
        notifyToggleError(
          savedButton,
          'Não foi possível atualizar os MiniApps salvos. Tente novamente em instantes.',
          error,
        );
      })
      .finally(() => {
        setElementBusy(savedButton, false);
      });
  };

  const handleFavoriteClick = () => {
    const previousState = favoriteState;
    const targetState = !previousState;

    favoriteState = targetState;
    applyFavoriteState(favoriteState);

    if (typeof onToggleFavorite !== 'function') {
      return;
    }

    setElementBusy(favoriteButton, true);

    let toggleResult;
    try {
      toggleResult = onToggleFavorite({
        app,
        id: normalizedId,
        nextState: targetState,
        previousState,
        element: favoriteButton,
      });
    } catch (error) {
      favoriteState = previousState;
      applyFavoriteState(favoriteState);
      setElementBusy(favoriteButton, false);
      notifyToggleError(
        favoriteButton,
        'Não foi possível atualizar seus MiniApps favoritos. Tente novamente em instantes.',
        error,
        favoriteReasonMessages,
      );
      return;
    }

    Promise.resolve(toggleResult)
      .then((result) => {
        favoriteState = resolveToggleResult(result, { targetState });
        applyFavoriteState(favoriteState);
      })
      .catch((error) => {
        favoriteState = previousState;
        applyFavoriteState(favoriteState);
        notifyToggleError(
          favoriteButton,
          'Não foi possível atualizar seus MiniApps favoritos. Tente novamente em instantes.',
          error,
          favoriteReasonMessages,
        );
      })
      .finally(() => {
        setElementBusy(favoriteButton, false);
      });
  };

  savedButton.addEventListener('click', handleSavedClick);
  favoriteButton.addEventListener('click', handleFavoriteClick);

  actions.append(openLink, savedButton, favoriteButton);

  card.append(title, actions);
  item.append(card);

  const isHighlighted = normalizedId && normalizedId === highlightId;

  if (isHighlighted) {
    item.classList.add('miniapp-store__item--highlight');
    queueMicrotask(() => {
      try {
        openLink.focus();
      } catch (error) {
        console.warn('Não foi possível focar o miniapp destacado.', error);
      }
    });

    if (typeof onHighlight === 'function') {
      onHighlight({
        app,
        id: normalizedId,
        link: openLink,
        controls: {
          open: openLink,
          save: savedButton,
          favorite: favoriteButton,
        },
      });
    }
  }

  return item;
}

export function mapMiniAppToEntry(app) {
  const normalizedId = normalizeMiniAppId(app?.id);

  if (
    !app ||
    !normalizedId ||
    !Array.isArray(app.access) ||
    !app.access.includes('usuario') ||
    String(app.status ?? '').trim().toLowerCase() !== 'active'
  ) {
    return null;
  }

  const name = typeof app.name === 'string' && app.name.trim() ? app.name.trim() : 'MiniApp sem nome';
  const description =
    typeof app.description === 'string' && app.description.trim()
      ? app.description.trim()
      : 'Nenhuma descrição cadastrada ainda.';
  const category = typeof app.category === 'string' && app.category.trim()
    ? app.category.trim()
    : 'Sem categoria';

  return {
    id: normalizedId,
    name,
    description,
    category,
    status: app.status,
    updatedAt: app.updatedAt,
    releaseDate: app.releaseDate,
  };
}

export function renderMiniAppStore(viewRoot, options = {}) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const highlightId = normalizeMiniAppId(options.highlightAppId);
  const toNormalizedId = (value) => {
    if (typeof value === 'string') {
      return normalizeMiniAppId(value);
    }

    if (value && typeof value === 'object' && typeof value.id === 'string') {
      return normalizeMiniAppId(value.id);
    }

    return '';
  };

  const savedInput = Array.isArray(options.savedMiniAppIds)
    ? options.savedMiniAppIds
    : Array.isArray(options.savedMiniApps)
      ? options.savedMiniApps
      : [];
  const favoriteInput = Array.isArray(options.favoriteMiniAppIds)
    ? options.favoriteMiniAppIds
    : Array.isArray(options.favoriteMiniApps)
      ? options.favoriteMiniApps
      : [];

  const savedSet = new Set(savedInput.map(toNormalizedId).filter(Boolean));
  const favoriteSet = new Set(favoriteInput.map(toNormalizedId).filter(Boolean));

  const toggleSavedHandler = typeof options.onToggleSaved === 'function' ? options.onToggleSaved : null;
  const toggleFavoriteHandler =
    typeof options.onToggleFavorite === 'function' ? options.onToggleFavorite : null;

  viewRoot.className = 'card view auth-view view--miniapps';
  viewRoot.dataset.view = 'miniapps';

  const container = document.createElement('section');
  container.className = 'miniapp-store';

  const header = document.createElement('header');
  header.className = 'miniapp-store__header';

  const title = document.createElement('h2');
  title.className = 'miniapp-store__heading';
  title.textContent = 'MiniApp Store';

  const intro = document.createElement('p');
  intro.className = 'miniapp-store__intro';
  intro.textContent =
    'Acesse os MiniApps publicados para sua conta, explore funcionalidades e abra a documentação oficial de cada solução.';

  header.append(title, intro);

  const list = document.createElement('ul');
  list.className = 'miniapp-store__list';

  const apps = getMiniAppsSnapshot()
    .map(mapMiniAppToEntry)
    .filter((entry) => entry !== null)
    .filter((entry) => entry && entry.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  if (apps.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'miniapp-store__empty';
    emptyState.textContent =
      'Ainda não há MiniApps publicados para sua conta. Volte em breve para descobrir novas soluções.';

    container.append(header, emptyState);
    viewRoot.replaceChildren(container);
    return;
  }

  apps.forEach((app) => {
    const item = createMiniAppCard(app, {
      highlightId,
      onHighlight: options.onHighlight,
      isSaved: savedSet.has(app.id),
      isFavorite: favoriteSet.has(app.id),
      onToggleSaved: toggleSavedHandler,
      onToggleFavorite: toggleFavoriteHandler,
    });
    list.append(item);
  });

  container.append(header, list);
  viewRoot.replaceChildren(container);
}

export default renderMiniAppStore;
