import { subscribeUsers, deleteUser, getUsers } from '../data/user-store.js';
import { subscribeSession, clearActiveUser } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { formatPhoneNumberForDisplay } from './shared/validation.js';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const VIEW_ROOT_CLEANUP_KEY = '__viewCleanup';

function setStatusHint(message) {
  if (typeof message !== 'string' || !message) {
    return;
  }

  const target = document.getElementById('statusHint');
  if (target instanceof HTMLElement) {
    target.textContent = message;
  }
}

function focusElement(element) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }
}

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '—';
  }

  return DATE_TIME_FORMATTER.format(date);
}

function formatPhone(phone) {
  const formatted = formatPhoneNumberForDisplay(phone);
  if (formatted) {
    return formatted;
  }

  if (typeof phone === 'string' && phone.trim()) {
    return phone.trim();
  }

  return 'Não informado';
}

function getUserDisplayName(user) {
  if (!user) {
    return '';
  }

  const name = typeof user.name === 'string' ? user.name.trim() : '';
  if (name) {
    return name;
  }

  const phone = typeof user.phone === 'string' ? user.phone.trim() : '';
  if (phone) {
    return formatPhone(phone);
  }

  const id = user.id != null ? String(user.id) : '';
  return id ? `Cadastro #${id}` : 'Cadastro sem nome';
}

function createMetaRow(label, value) {
  const dt = document.createElement('dt');
  dt.className = 'account-dashboard__meta-label';
  dt.textContent = label;

  const dd = document.createElement('dd');
  dd.className = 'account-dashboard__meta-value';
  dd.textContent = value;

  return [dt, dd];
}

function formatUserType(userType) {
  const normalized = typeof userType === 'string' ? userType.trim().toLowerCase() : '';

  switch (normalized) {
    case 'administrador':
      return 'Administrador';
    case 'colaborador':
      return 'Colaborador';
    case 'usuario':
      return 'Usuário padrão';
    default:
      return 'Perfil não informado';
  }
}

function formatThemePreference(preference) {
  const normalized = typeof preference === 'string' ? preference.trim().toLowerCase() : '';

  switch (normalized) {
    case 'light':
      return 'Tema claro';
    case 'dark':
      return 'Tema escuro';
    case 'system':
      return 'Tema do sistema';
    default:
      return 'Tema padrão';
  }
}

function formatFooterIndicators(preference) {
  const normalized = typeof preference === 'string' ? preference.trim().toLowerCase() : '';

  switch (normalized) {
    case 'hidden':
      return 'Indicadores ocultos';
    case 'visible':
      return 'Indicadores visíveis';
    default:
      return 'Indicadores padrão';
  }
}

function createDetailsContent(user) {
  const container = document.createElement('div');
  container.className = 'account-dashboard__details-content';

  const list = document.createElement('dl');
  list.className = 'account-dashboard__details-list';

  list.append(...createMetaRow('Identificador', user?.id != null ? String(user.id) : '—'));
  list.append(...createMetaRow('Tipo de acesso', formatUserType(user?.userType)));

  const preferences = user?.preferences ?? {};
  list.append(...createMetaRow('Preferência de tema', formatThemePreference(preferences.theme)));
  list.append(
    ...createMetaRow('Indicadores no rodapé', formatFooterIndicators(preferences.footerIndicators))
  );

  const deviceInfo = typeof user?.device === 'string' ? user.device.trim() : '';
  list.append(...createMetaRow('Dispositivo', deviceInfo || 'Não registrado'));

  container.append(list);
  return container;
}

function clearLocalSnapshotCaches() {
  if (typeof window !== 'object' || !window) {
    return;
  }

  try {
    const storage = window.localStorage;
    if (!storage) {
      return;
    }

    storage.removeItem('miniapp:admin-miniapps');
    storage.removeItem('miniapp:footer-indicators');
    storage.removeItem('miniapp-active-user-id');
  } catch (error) {
    console.warn('Não foi possível limpar as preferências locais do MiniApp.', error);
  }
}

export function renderAccountDashboard(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  if (typeof viewRoot[VIEW_ROOT_CLEANUP_KEY] === 'function') {
    try {
      viewRoot[VIEW_ROOT_CLEANUP_KEY]();
    } catch (error) {
      console.error('Falha ao encerrar view anterior antes de renderizar o painel da conta.', error);
    }
    viewRoot[VIEW_ROOT_CLEANUP_KEY] = null;
  }

  viewRoot.className = 'card view auth-view view--account-dashboard';
  viewRoot.dataset.view = 'account-dashboard';

  const dashboard = document.createElement('section');
  dashboard.className = 'account-dashboard';

  const title = document.createElement('h2');
  title.className = 'account-dashboard__title';
  title.textContent = 'Painel da conta';
  title.tabIndex = -1;

  const description = document.createElement('p');
  description.className = 'account-dashboard__description';
  description.textContent =
    'Gerencie os cadastros salvos neste dispositivo, revise os metadados disponíveis e mantenha sua sessão segura.';

  const quickActions = document.createElement('section');
  quickActions.className = 'account-dashboard__quick-actions surface-card';

  const quickTitle = document.createElement('h3');
  quickTitle.className = 'account-dashboard__quick-title';
  quickTitle.textContent = 'Ações rápidas';
  quickTitle.tabIndex = -1;

  const quickSummary = document.createElement('p');
  quickSummary.className = 'account-dashboard__quick-summary';

  const quickButtons = document.createElement('div');
  quickButtons.className = 'account-dashboard__quick-buttons';

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className =
    'button button--secondary button--pill account-dashboard__quick-button account-dashboard__quick-button--logout';
  logoutButton.textContent = 'Deslogar';

  const openStoreButton = document.createElement('button');
  openStoreButton.type = 'button';
  openStoreButton.className =
    'button button--secondary button--pill account-dashboard__quick-button account-dashboard__quick-button--store';
  openStoreButton.textContent = 'Ir para MiniApp Store';

  const eraseDeviceButton = document.createElement('button');
  eraseDeviceButton.type = 'button';
  eraseDeviceButton.className =
    'button button--secondary button--pill account-dashboard__quick-button account-dashboard__quick-button--erase';
  eraseDeviceButton.textContent = 'Excluir dados do dispositivo';

  quickButtons.append(logoutButton, openStoreButton, eraseDeviceButton);
  quickActions.append(quickTitle, quickSummary, quickButtons);

  const recordsSection = document.createElement('section');
  recordsSection.className = 'account-dashboard__records';

  const recordsTitle = document.createElement('h3');
  recordsTitle.className = 'account-dashboard__records-title';
  recordsTitle.textContent = 'Cadastros locais';

  const emptyState = document.createElement('p');
  emptyState.className = 'account-dashboard__empty';
  emptyState.textContent =
    'Nenhum cadastro foi encontrado neste dispositivo. Crie uma conta nova ou importe dados para começar.';

  const list = document.createElement('ul');
  list.className = 'account-dashboard__list';

  recordsSection.append(recordsTitle, emptyState, list);

  dashboard.append(title, description, quickActions, recordsSection);
  viewRoot.replaceChildren(dashboard);

  const state = {
    users: [],
    activeUser: null,
    expanded: new Set(),
  };
  let pendingFocusIndex = null;

  function updateQuickActions() {
    const activeUser = state.activeUser;
    if (activeUser) {
      const displayName = getUserDisplayName(activeUser);
      const phone = formatPhone(activeUser.phone);
      quickSummary.textContent = `${displayName} conectado • ${phone}`;
    } else if (state.users.length > 0) {
      quickSummary.textContent = 'Nenhum usuário ativo no momento.';
    } else {
      quickSummary.textContent = 'Os dados locais estão limpos. Nenhum cadastro permanece salvo.';
    }

    logoutButton.disabled = !activeUser;
    eraseDeviceButton.disabled = state.users.length === 0;
  }

  function renderUserList() {
    const sorted = [...state.users].sort((a, b) => {
      const nameA = typeof a?.name === 'string' ? a.name.trim() : '';
      const nameB = typeof b?.name === 'string' ? b.name.trim() : '';
      if (nameA && nameB) {
        return nameA.localeCompare(nameB, 'pt-BR');
      }
      if (nameA) {
        return -1;
      }
      if (nameB) {
        return 1;
      }
      return String(a?.id ?? '').localeCompare(String(b?.id ?? ''), 'pt-BR');
    });

    list.replaceChildren();

    if (sorted.length === 0) {
      list.hidden = true;
      emptyState.hidden = false;
      if (pendingFocusIndex !== null) {
        focusElement(title);
        pendingFocusIndex = null;
      }
      return;
    }

    list.hidden = false;
    emptyState.hidden = true;

    sorted.forEach((user, index) => {
      const itemKey = user?.id != null ? String(user.id) : `index-${index}`;
      const item = document.createElement('li');
      item.className = 'account-dashboard__item';
      item.dataset.userId = user?.id != null ? String(user.id) : '';
      item.dataset.userKey = itemKey;
      item.dataset.userIndex = String(index);

      if (state.activeUser && state.activeUser.id === user.id) {
        item.classList.add('account-dashboard__item--active');
      }

      const card = document.createElement('article');
      card.className = 'account-dashboard__card surface-card';

      const header = document.createElement('header');
      header.className = 'account-dashboard__header';

      const name = document.createElement('h4');
      name.className = 'account-dashboard__name';
      name.textContent = getUserDisplayName(user);

      const badge = document.createElement('span');
      badge.className = 'account-dashboard__badge';
      badge.textContent = 'Ativo neste dispositivo';
      badge.hidden = !(state.activeUser && state.activeUser.id === user.id);

      header.append(name, badge);

      const meta = document.createElement('dl');
      meta.className = 'account-dashboard__meta';
      meta.append(...createMetaRow('Telefone', formatPhone(user?.phone)));
      meta.append(...createMetaRow('Criado em', formatDateTime(user?.createdAt)));
      meta.append(...createMetaRow('Último acesso', formatDateTime(user?.lastAccessAt)));

      const actions = document.createElement('div');
      actions.className = 'account-dashboard__actions';

      const detailsId = `account-dashboard-details-${itemKey}`;

      const reviewButton = document.createElement('button');
      reviewButton.type = 'button';
      reviewButton.className =
        'button button--secondary button--pill account-dashboard__action account-dashboard__action--review';
      reviewButton.textContent = 'Revisar detalhes';
      reviewButton.dataset.action = 'review';
      reviewButton.setAttribute('aria-controls', detailsId);

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className =
        'button button--secondary button--pill account-dashboard__action account-dashboard__action--delete';
      deleteButton.textContent = 'Excluir cadastro';
      deleteButton.dataset.action = 'delete';

      const details = document.createElement('div');
      details.className = 'account-dashboard__details';
      details.id = detailsId;
      const isExpanded = state.expanded.has(itemKey);
      details.hidden = !isExpanded;
      details.tabIndex = -1;
      details.append(createDetailsContent(user));
      reviewButton.setAttribute('aria-expanded', String(!details.hidden));

      reviewButton.addEventListener('click', () => {
        const isExpanded = reviewButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          reviewButton.setAttribute('aria-expanded', 'false');
          details.hidden = true;
          state.expanded.delete(itemKey);
          setStatusHint(`Detalhes minimizados para ${getUserDisplayName(user)}.`);
          focusElement(reviewButton);
          return;
        }

        state.expanded.add(itemKey);
        reviewButton.setAttribute('aria-expanded', 'true');
        details.hidden = false;
        setStatusHint(`Detalhes em exibição para ${getUserDisplayName(user)}.`);
        focusElement(details);
      });

      deleteButton.addEventListener('click', async () => {
        if (user?.id == null) {
          setStatusHint('Não foi possível identificar o cadastro selecionado.');
          focusElement(deleteButton);
          return;
        }

        deleteButton.disabled = true;
        setStatusHint(`Removendo o cadastro ${getUserDisplayName(user)} deste dispositivo...`);
        const currentIndex = index;
        pendingFocusIndex = currentIndex;

        try {
          await deleteUser(user.id);
          setStatusHint('Cadastro removido com sucesso.');
        } catch (error) {
          console.error('Erro ao excluir cadastro local.', error);
          const message =
            error instanceof Error && error.message
              ? error.message
              : 'Não foi possível excluir o cadastro. Tente novamente.';
          setStatusHint(message);
          pendingFocusIndex = null;
          deleteButton.disabled = false;
          focusElement(deleteButton);
        }
      });

      actions.append(reviewButton, deleteButton);

      card.append(header, meta, actions, details);
      item.append(card);
      list.append(item);
    });

    if (pendingFocusIndex !== null) {
      const items = Array.from(list.querySelectorAll('.account-dashboard__item'));

      if (items.length > 0) {
        const normalizedIndex = Math.min(pendingFocusIndex, Math.max(items.length - 1, 0));
        const targetItem = items[normalizedIndex] ?? items[items.length - 1];
        const focusTarget =
          targetItem?.querySelector('.account-dashboard__action--review') ||
          targetItem?.querySelector('button');

        if (focusTarget instanceof HTMLElement) {
          focusElement(focusTarget);
        } else {
          focusElement(title);
        }
      } else {
        focusElement(title);
      }

      pendingFocusIndex = null;
    }
  }

  const unsubscribeUsers = subscribeUsers((users) => {
    state.users = Array.isArray(users) ? users : [];
    renderUserList();
    updateQuickActions();
  });

  const unsubscribeSession = subscribeSession((activeUser) => {
    state.activeUser = activeUser || null;
    renderUserList();
    updateQuickActions();
  });

  logoutButton.addEventListener('click', () => {
    if (!state.activeUser) {
      setStatusHint('Nenhuma sessão ativa para encerrar.');
      focusElement(openStoreButton);
      return;
    }

    try {
      clearActiveUser();
      setStatusHint('Sessão encerrada. Os cadastros permanecem disponíveis para novo acesso.');
      focusElement(openStoreButton);
    } catch (error) {
      console.error('Erro ao encerrar sessão ativa.', error);
      setStatusHint('Não foi possível encerrar a sessão ativa. Tente novamente.');
      focusElement(logoutButton);
    }
  });

  openStoreButton.addEventListener('click', () => {
    setStatusHint('MiniApp Store em foco. Use os atalhos para explorar os aplicativos disponíveis.');
    eventBus.emit('app:navigate', {
      view: 'miniapps',
      shouldFocus: true,
      source: 'account-dashboard:quick-actions',
    });
  });

  eraseDeviceButton.addEventListener('click', async () => {
    const hadUsers = state.users.length > 0;

    eraseDeviceButton.disabled = true;
    setStatusHint(
      hadUsers
        ? 'Excluindo dados locais deste dispositivo. Aguarde...'
        : 'Limpando preferências locais armazenadas neste dispositivo.'
    );

    try {
      if (hadUsers) {
        const snapshot = getUsers();
        for (const user of snapshot) {
          if (user?.id == null) {
            continue;
          }

          try {
            // eslint-disable-next-line no-await-in-loop
            await deleteUser(user.id);
          } catch (error) {
            throw error;
          }
        }
      }

      clearActiveUser();
      clearLocalSnapshotCaches();
      const message = hadUsers
        ? 'Dados do dispositivo excluídos com sucesso. Nenhum cadastro permanece salvo.'
        : 'Preferências locais removidas. Nenhum cadastro estava armazenado.';
      setStatusHint(message);
      focusElement(title);
    } catch (error) {
      console.error('Erro ao excluir dados locais do dispositivo.', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível excluir os dados do dispositivo. Tente novamente.';
      setStatusHint(message);
      focusElement(eraseDeviceButton);
    } finally {
      eraseDeviceButton.disabled = state.users.length === 0;
    }
  });

  updateQuickActions();
  renderUserList();

  viewRoot[VIEW_ROOT_CLEANUP_KEY] = () => {
    try {
      unsubscribeUsers();
    } catch (error) {
      console.error('Erro ao cancelar assinatura de cadastros.', error);
    }

    try {
      unsubscribeSession();
    } catch (error) {
      console.error('Erro ao cancelar assinatura da sessão.', error);
    }
  };
}

export default renderAccountDashboard;
