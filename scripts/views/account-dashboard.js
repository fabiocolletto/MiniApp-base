import { subscribeUsers, deleteUser, purgeDeviceData } from '../data/user-store.js';
import { subscribeSession, clearActiveUser } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { listAuditLog } from '../../shared/storage/idb/marcocore.js';
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

  const quickSummary = document.createElement('div');
  quickSummary.className = 'account-dashboard__quick-summary';
  quickSummary.setAttribute('role', 'status');
  quickSummary.setAttribute('aria-live', 'polite');

  const quickSummaryUserItem = document.createElement('div');
  quickSummaryUserItem.className = 'account-dashboard__quick-summary-item';
  const quickSummaryUserLabel = document.createElement('span');
  quickSummaryUserLabel.className = 'account-dashboard__quick-summary-label';
  quickSummaryUserLabel.textContent = 'Usuário conectado';
  const quickSummaryUserValue = document.createElement('span');
  quickSummaryUserValue.className = 'account-dashboard__quick-summary-value';

  const quickSummaryPhoneItem = document.createElement('div');
  quickSummaryPhoneItem.className = 'account-dashboard__quick-summary-item';
  const quickSummaryPhoneLabel = document.createElement('span');
  quickSummaryPhoneLabel.className = 'account-dashboard__quick-summary-label';
  quickSummaryPhoneLabel.textContent = 'Telefone';
  const quickSummaryPhoneValue = document.createElement('span');
  quickSummaryPhoneValue.className = 'account-dashboard__quick-summary-value';

  quickSummaryUserItem.append(quickSummaryUserLabel, quickSummaryUserValue);
  quickSummaryPhoneItem.append(quickSummaryPhoneLabel, quickSummaryPhoneValue);
  quickSummary.append(quickSummaryUserItem, quickSummaryPhoneItem);

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
    'button button--danger button--pill account-dashboard__quick-button account-dashboard__quick-button--erase';
  eraseDeviceButton.textContent = 'Excluir dados do dispositivo';

  quickButtons.append(logoutButton, openStoreButton, eraseDeviceButton);
  quickActions.append(quickTitle, quickSummary, quickButtons);

  const storageSection = document.createElement('section');
  storageSection.className = 'account-dashboard__storage surface-card';

  const storageTitle = document.createElement('h3');
  storageTitle.className = 'account-dashboard__storage-title';
  storageTitle.textContent = 'Armazenamento local';

  const storageStatus = document.createElement('p');
  storageStatus.className = 'account-dashboard__storage-status';
  storageStatus.textContent = 'Verificando persistência do navegador...';

  const storageUsageList = document.createElement('dl');
  storageUsageList.className = 'account-dashboard__storage-metrics';

  const usageLabel = document.createElement('dt');
  usageLabel.textContent = 'Uso';
  usageLabel.className = 'account-dashboard__storage-metrics-label';
  const usageValue = document.createElement('dd');
  usageValue.className = 'account-dashboard__storage-metrics-value';
  usageValue.textContent = '—';

  const quotaLabel = document.createElement('dt');
  quotaLabel.textContent = 'Cota';
  quotaLabel.className = 'account-dashboard__storage-metrics-label';
  const quotaValue = document.createElement('dd');
  quotaValue.className = 'account-dashboard__storage-metrics-value';
  quotaValue.textContent = '—';

  storageUsageList.append(usageLabel, usageValue, quotaLabel, quotaValue);

  const storageActions = document.createElement('div');
  storageActions.className = 'account-dashboard__storage-actions';

  const refreshButton = document.createElement('button');
  refreshButton.type = 'button';
  refreshButton.className = 'button button--secondary button--pill account-dashboard__storage-refresh';
  refreshButton.textContent = 'Atualizar';

  const auditButton = document.createElement('button');
  auditButton.type = 'button';
  auditButton.className = 'button button--secondary button--pill account-dashboard__storage-audit-toggle';
  auditButton.textContent = 'Abrir auditoria local';

  storageActions.append(refreshButton, auditButton);

  const auditPanel = document.createElement('div');
  auditPanel.className = 'account-dashboard__storage-audit surface-card';
  auditPanel.hidden = true;

  const auditTitle = document.createElement('h4');
  auditTitle.className = 'account-dashboard__storage-audit-title';
  auditTitle.textContent = 'Últimos eventos (50)';

  const auditList = document.createElement('ol');
  auditList.className = 'account-dashboard__storage-audit-list';
  auditList.setAttribute('aria-live', 'polite');

  const auditEmpty = document.createElement('p');
  auditEmpty.className = 'account-dashboard__storage-audit-empty';
  auditEmpty.textContent = 'Nenhum evento registrado ainda.';

  auditPanel.append(auditTitle, auditEmpty, auditList);

  storageSection.append(storageTitle, storageStatus, storageUsageList, storageActions, auditPanel);

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

  dashboard.append(title, description, quickActions, storageSection, recordsSection);
  viewRoot.replaceChildren(dashboard);

  const state = {
    users: [],
    activeUser: null,
    expanded: new Set(),
  };
  let pendingFocusIndex = null;

  const storageState = {
    persistent: null,
    usage: null,
    quota: null,
    lastEstimateAt: null,
    refreshing: false,
    auditLoaded: false,
    auditLoading: false,
    auditVisible: false,
    auditEntries: [],
  };

  function formatBytes(bytes) {
    if (typeof bytes !== 'number' || !Number.isFinite(bytes)) {
      return '—';
    }

    if (bytes <= 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let value = bytes;

    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }

    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function updateStorageStatusView() {
    if (storageState.persistent === true) {
      storageStatus.textContent = 'Persistente: dados protegidos contra limpeza automática do navegador.';
    } else if (storageState.persistent === false) {
      storageStatus.textContent = 'Best-effort: o navegador pode limpar os dados em cenários de baixo espaço.';
    } else {
      storageStatus.textContent = 'Verificando persistência do navegador...';
    }
  }

  function updateStorageMetricsView() {
    if (storageState.usage != null) {
      usageValue.textContent = formatBytes(storageState.usage);
    } else {
      usageValue.textContent = '—';
    }

    if (storageState.quota != null) {
      quotaValue.textContent = formatBytes(storageState.quota);
    } else {
      quotaValue.textContent = '—';
    }

    refreshButton.disabled = storageState.refreshing;
  }

  function applyStorageEstimatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    if (payload.persisted !== null && payload.persisted !== undefined) {
      storageState.persistent = Boolean(payload.persisted);
    }

    if (typeof payload.usage === 'number') {
      storageState.usage = payload.usage;
    }

    if (typeof payload.quota === 'number') {
      storageState.quota = payload.quota;
    }

    storageState.refreshing = false;
    storageState.lastEstimateAt = payload.timestamp ?? Date.now();
    updateStorageStatusView();
    updateStorageMetricsView();
  }

  function requestStorageEstimate() {
    storageState.refreshing = true;
    updateStorageMetricsView();
    eventBus.emit('storage:estimate:request');
  }

  async function populateAuditLog() {
    if (storageState.auditLoading) {
      return;
    }

    storageState.auditLoading = true;
    auditButton.disabled = true;
    auditEmpty.hidden = false;
    auditEmpty.textContent = 'Carregando auditoria local...';
    auditList.replaceChildren();

    try {
      const entries = await listAuditLog({ limit: 50 });
      storageState.auditEntries = Array.isArray(entries) ? entries : [];
      storageState.auditLoaded = true;

      if (storageState.auditEntries.length === 0) {
        auditEmpty.hidden = false;
        auditEmpty.textContent = 'Nenhum evento registrado ainda.';
        return;
      }

      auditEmpty.hidden = true;
      const fragment = document.createDocumentFragment();

      storageState.auditEntries.forEach((entry) => {
        const item = document.createElement('li');
        item.className = 'account-dashboard__storage-audit-item';

        const timestamp = typeof entry?.timestamp === 'number' ? entry.timestamp : Date.now();
        const formattedDate = DATE_TIME_FORMATTER.format(new Date(timestamp));
        const actionLabel = typeof entry?.action === 'string' ? entry.action : 'evento';
        const statusLabel = typeof entry?.status === 'string' ? entry.status : '';
        const miniappLabel = typeof entry?.miniappId === 'string' ? entry.miniappId : 'marco_core';
        const summaryParts = [`[${formattedDate}]`, actionLabel];

        if (statusLabel) {
          summaryParts.push(`(${statusLabel})`);
        }

        if (miniappLabel) {
          summaryParts.push(`• ${miniappLabel}`);
        }

        const summary = document.createElement('p');
        summary.className = 'account-dashboard__storage-audit-summary';
        summary.textContent = summaryParts.join(' ');
        item.append(summary);

        const detailsValue = entry?.details ?? entry?.message ?? null;
        if (detailsValue) {
          const details = document.createElement('pre');
          details.className = 'account-dashboard__storage-audit-details';
          const detailText = typeof detailsValue === 'string'
            ? detailsValue
            : JSON.stringify(detailsValue, null, 2);
          details.textContent = detailText;
          item.append(details);
        }

        fragment.append(item);
      });

      auditList.replaceChildren(fragment);
    } catch (error) {
      console.error('Erro ao carregar auditoria local.', error);
      auditEmpty.hidden = false;
      auditEmpty.textContent = 'Falha ao carregar auditoria local.';
    } finally {
      storageState.auditLoading = false;
      auditButton.disabled = false;
    }
  }

  function updateQuickActions() {
    const activeUser = state.activeUser;
    if (activeUser) {
      const displayName = getUserDisplayName(activeUser);
      const phone = formatPhone(activeUser.phone);
      quickSummaryUserValue.textContent = displayName;
      quickSummaryPhoneValue.textContent = phone;
    } else if (state.users.length > 0) {
      quickSummaryUserValue.textContent = 'Nenhum usuário ativo no momento.';
      quickSummaryPhoneValue.textContent = 'Ative um cadastro para exibir o telefone.';
    } else {
      quickSummaryUserValue.textContent = 'Nenhum cadastro salvo no dispositivo.';
      quickSummaryPhoneValue.textContent = 'Cadastre ou importe um usuário para começar.';
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
    const shouldConfirmErase =
      typeof window === 'object' && window && typeof window.confirm === 'function'
        ? window.confirm(
            'Esta ação removerá todos os cadastros locais, preferências e encerrará a sessão ativa. Deseja continuar?'
          )
        : true;

    if (!shouldConfirmErase) {
      setStatusHint('A exclusão foi cancelada. Nenhum dado foi removido.');
      focusElement(eraseDeviceButton);
      return;
    }

    const hadUsers = state.users.length > 0;

    eraseDeviceButton.disabled = true;
    setStatusHint(
      hadUsers
        ? 'Excluindo cadastros e encerrando a sessão ativa neste dispositivo. Aguarde...'
        : 'Limpando preferências locais e encerrando a sessão ativa. Aguarde...'
    );

    try {
      await purgeDeviceData();
      clearActiveUser();
      clearLocalSnapshotCaches();

      const successMessage = hadUsers
        ? 'Todos os cadastros foram removidos e a sessão ativa foi encerrada.'
        : 'Nenhum cadastro estava salvo. Sessão ativa encerrada e preferências locais limpas.';

      setStatusHint(successMessage);
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
  updateStorageStatusView();
  updateStorageMetricsView();

  refreshButton.addEventListener('click', () => {
    requestStorageEstimate();
    setStatusHint('Solicitando atualização de uso do armazenamento local.');
  });

  auditButton.setAttribute('aria-expanded', 'false');
  auditButton.addEventListener('click', async () => {
    storageState.auditVisible = !storageState.auditVisible;
    auditButton.setAttribute('aria-expanded', String(storageState.auditVisible));
    auditPanel.hidden = !storageState.auditVisible;

    if (storageState.auditVisible) {
      setStatusHint('Auditoria local aberta.');
      if (!storageState.auditLoaded) {
        await populateAuditLog();
      }
    } else {
      setStatusHint('Auditoria local fechada.');
    }
  });

  const unsubscribeStorageReady = eventBus.on('storage:ready', (payload) => {
    if (payload && typeof payload === 'object' && 'persistent' in payload) {
      storageState.persistent = Boolean(payload.persistent);
      updateStorageStatusView();
    }
  });

  const unsubscribeStorageEstimate = eventBus.on('storage:estimate', (payload) => {
    applyStorageEstimatePayload(payload);
  });

  const unsubscribeStorageMigrated = eventBus.on('storage:migrated', () => {
    storageState.auditLoaded = false;
    if (storageState.auditVisible) {
      populateAuditLog();
    }
  });

  requestStorageEstimate();

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

    try {
      unsubscribeStorageReady();
    } catch (error) {
      console.error('Erro ao cancelar monitoramento de armazenamento (ready).', error);
    }

    try {
      unsubscribeStorageEstimate();
    } catch (error) {
      console.error('Erro ao cancelar monitoramento de armazenamento (estimate).', error);
    }

    try {
      unsubscribeStorageMigrated();
    } catch (error) {
      console.error('Erro ao cancelar monitoramento de armazenamento (migrated).', error);
    }
  };
}

export default renderAccountDashboard;
