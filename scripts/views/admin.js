import { getUsers, subscribeUsers } from '../data/user-store.js';
import {
  ACCESS_LEVEL_OPTIONS,
  MINI_APP_STATUS_OPTIONS,
  getMiniAppsSnapshot,
  subscribeMiniApps,
  updateMiniApp as persistMiniAppUpdate,
} from '../data/miniapp-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import {
  createSystemUsersWidget,
  formatDateTime,
} from './shared/system-users-widget.js';

const BASE_CLASSES = 'card view dashboard-view view--admin admin-dashboard';

const countFormatter = new Intl.NumberFormat('pt-BR');
const USER_REGISTRATION_GOAL = 120;
const DEPLOYMENT_STATUSES = new Set(['deployment', 'testing']);

function formatCount(value) {
  const numericValue = Number.isFinite(value) ? value : 0;
  return countFormatter.format(Math.max(0, Math.trunc(numericValue)));
}

function formatMiniAppStatus(status) {
  const option = MINI_APP_STATUS_OPTIONS.find((entry) => entry.value === status);
  return option ? option.label : 'Status desconhecido';
}

function createHighlightCard({ title, variant }) {
  const card = document.createElement('article');
  card.className = `admin-dashboard__highlight admin-dashboard__highlight--${variant}`;

  const titleElement = document.createElement('h3');
  titleElement.className = 'admin-dashboard__highlight-title';
  titleElement.textContent = title;

  const valueElement = document.createElement('p');
  valueElement.className = 'admin-dashboard__highlight-value';
  valueElement.textContent = formatCount(0);

  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'admin-dashboard__highlight-progress-wrapper';

  const progress = document.createElement('div');
  progress.className = 'admin-dashboard__highlight-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.setAttribute('aria-valuenow', '0');

  const progressBar = document.createElement('div');
  progressBar.className = 'admin-dashboard__highlight-progress-bar';
  progressBar.style.width = '0%';
  if (progressBar?.style && typeof progressBar.style.setProperty === 'function') {
    progressBar.style.setProperty('inline-size', '0%');
  }
  progress.append(progressBar);

  const percentageElement = document.createElement('span');
  percentageElement.className = 'admin-dashboard__highlight-percentage';
  percentageElement.textContent = '0%';

  progressWrapper.append(progress, percentageElement);

  const helperElement = document.createElement('p');
  helperElement.className = 'admin-dashboard__highlight-helper';
  helperElement.textContent = '—';

  card.append(titleElement, valueElement, progressWrapper, helperElement);

  function setData({ value = 0, total = 0, helper = '—' } = {}) {
    const numericValue = Number.isFinite(value) ? value : 0;
    const numericTotal = Number.isFinite(total) ? total : 0;
    const denominator = numericTotal > 0 ? numericTotal : 0;
    const ratio = denominator > 0 ? numericValue / denominator : numericValue > 0 ? 1 : 0;
    const safeRatio = Math.min(Math.max(ratio, 0), 1);
    const percentage = Math.round(safeRatio * 100);

    valueElement.textContent = formatCount(numericValue);
    percentageElement.textContent = `${percentage}%`;
    const percentageValue = `${percentage}%`;
    progressBar.style.width = percentageValue;
    if (progressBar?.style && typeof progressBar.style.setProperty === 'function') {
      progressBar.style.setProperty('inline-size', percentageValue);
    }
    progress.setAttribute('aria-valuenow', String(percentage));
    helperElement.textContent = helper;
  }

  function reset() {
    setData({ value: 0, total: 0, helper: '—' });
  }

  reset();

  return { element: card, setData, reset };
}

function createHighlightsWidget() {
  let users = [];
  let miniApps = [];

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--highlights';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Indicadores gerais';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = 'Acompanhe o pulso dos mini-apps e dos acessos ao painel.';

  const grid = document.createElement('div');
  grid.className = 'admin-dashboard__highlight-grid';

  const cards = {
    activeMiniApps: createHighlightCard({
      title: 'Mini-apps ativos',
      variant: 'miniapps-active',
    }),
    deployingMiniApps: createHighlightCard({
      title: 'Implantações em andamento',
      variant: 'miniapps-deploying',
    }),
    registeredUsers: createHighlightCard({
      title: 'Usuários cadastrados',
      variant: 'users-registered',
    }),
    activeAdmins: createHighlightCard({
      title: 'Administradores ativos',
      variant: 'users-admins',
    }),
  };

  Object.values(cards).forEach((card) => {
    grid.append(card.element);
  });

  widget.append(title, description, grid);

  function normalizeUsers(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.filter((user) => user && typeof user === 'object');
  }

  function normalizeMiniApps(entries) {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.filter((entry) => entry && typeof entry === 'object');
  }

  function updateHighlights() {
    const totalMiniApps = miniApps.length;
    const activeMiniApps = miniApps.filter((app) => app && app.status === 'active').length;
    const deployingMiniApps = miniApps.filter((app) => DEPLOYMENT_STATUSES.has(app?.status)).length;
    const hasMiniApps = totalMiniApps > 0;

    const totalUsers = users.length;
    const adminUsers = users.filter((user) => {
      const userType = String(user?.userType ?? '')
        .trim()
        .toLowerCase();
      return userType === 'administrador';
    }).length;

    const activeHelper = hasMiniApps
      ? activeMiniApps > 0
        ? `${formatCount(activeMiniApps)} de ${formatCount(totalMiniApps)} mini-apps estão ativos.`
        : 'Nenhum mini-app ativo até o momento.'
      : 'Nenhum mini-app cadastrado no momento.';

    const deploymentLabel = deployingMiniApps === 1 ? 'implantação segue' : 'implantações seguem';

    const deploymentsHelper = hasMiniApps
      ? deployingMiniApps > 0
        ? `${formatCount(deployingMiniApps)} ${deploymentLabel} em preparação.`
        : 'Todas as implantações estão concluídas.'
      : 'Nenhum mini-app cadastrado no momento.';

    cards.activeMiniApps.setData({
      value: activeMiniApps,
      total: totalMiniApps,
      helper: activeHelper,
    });

    cards.deployingMiniApps.setData({
      value: deployingMiniApps,
      total: totalMiniApps,
      helper: deploymentsHelper,
    });

    cards.registeredUsers.setData({
      value: totalUsers,
      total: USER_REGISTRATION_GOAL,
      helper:
        totalUsers > 0
          ? `${formatCount(totalUsers)} de ${formatCount(USER_REGISTRATION_GOAL)} cadastros planejados.`
          : 'Aguardando primeiros cadastros.',
    });

    const usersBase = totalUsers > 0 ? totalUsers : 1;
    const adminLabel = adminUsers === 1 ? 'administrador ativo' : 'administradores ativos';
    const userLabel = totalUsers === 1 ? 'usuário' : 'usuários';
    cards.activeAdmins.setData({
      value: adminUsers,
      total: usersBase,
      helper:
        totalUsers > 0
          ? `${formatCount(adminUsers)} ${adminLabel} para ${formatCount(totalUsers)} ${userLabel}.`
          : 'Cadastre administradores para liberar acessos.',
    });
  }

  function setUsers(nextUsers) {
    users = normalizeUsers(nextUsers);
    updateHighlights();
  }

  function setMiniApps(nextMiniApps) {
    miniApps = normalizeMiniApps(nextMiniApps);
    updateHighlights();
  }

  function teardown() {
    users = [];
    miniApps = [];
    Object.values(cards).forEach((card) => card.reset());
  }

  updateHighlights();

  return { widget, setUsers, setMiniApps, teardown };
}

function createMiniAppsWidget() {
  let expandedMiniAppId = null;
  const state = new Map();

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--miniapps';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Gestão de mini-apps';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent =
    'Defina quais níveis de acesso podem utilizar cada mini-app e acompanhe o estágio de implantação ou uso.';

  const tableContainer = document.createElement('div');
  tableContainer.className = 'admin-miniapp-table-container';

  const table = document.createElement('table');
  table.className = 'admin-user-table admin-miniapp-table';

  const thead = document.createElement('thead');
  thead.className = 'admin-user-table__head';

  const headRow = document.createElement('tr');

  [
    { label: 'Mini-app', className: 'admin-user-table__head-cell admin-miniapp-table__head-cell--app' },
    { label: 'Acesso liberado', className: 'admin-user-table__head-cell' },
    { label: 'Status', className: 'admin-user-table__head-cell' },
    { label: 'Ações', className: 'admin-user-table__head-cell admin-user-table__head-cell--actions' },
  ].forEach((column) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = column.className;
    cell.textContent = column.label;
    headRow.append(cell);
  });

  thead.append(headRow);

  const tbody = document.createElement('tbody');
  tbody.className = 'admin-user-table__body';

  table.append(thead, tbody);
  tableContainer.append(table);
  widget.append(title, description, tableContainer);

  const unsubscribe = subscribeMiniApps((entries) => {
    setMiniApps(Array.isArray(entries) ? entries : []);
  });

  function applyMiniAppUpdate(id, updater) {
    if (!state.has(id)) {
      return;
    }

    persistMiniAppUpdate(id, (current) => {
      const reference = current ?? state.get(id);
      if (!reference) {
        return current;
      }

      const patch = typeof updater === 'function' ? updater(reference) : updater;
      if (!patch || typeof patch !== 'object') {
        return reference;
      }

      return { ...reference, ...patch };
    });
  }

  function setMiniApps(entries) {
    if (!Array.isArray(entries)) {
      state.clear();
      expandedMiniAppId = null;
      renderRows();
      return;
    }

    const previousExpanded = expandedMiniAppId;
    state.clear();

    entries.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : null;
      if (!id) {
        return;
      }

      const access = Array.isArray(entry.access) ? [...entry.access] : [];
      state.set(id, { ...entry, id, access });
    });

    if (previousExpanded && !state.has(previousExpanded)) {
      expandedMiniAppId = null;
    }

    renderRows();
  }

  function renderRows() {
    tbody.replaceChildren();

    const apps = Array.from(state.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    );

    if (apps.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'admin-user-table__empty-row';

      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 4;
      emptyCell.className = 'admin-user-table__empty-cell';
      emptyCell.textContent = 'Nenhum mini-app cadastrado.';

      emptyRow.append(emptyCell);
      tbody.append(emptyRow);
      return;
    }

    apps.forEach((app) => {
      const isExpanded = expandedMiniAppId === app.id;

      const row = document.createElement('tr');
      row.className = 'admin-user-table__row admin-miniapp-table__row';
      row.dataset.appId = app.id;
      row.dataset.state = isExpanded ? 'expanded' : 'collapsed';

      const appCell = document.createElement('td');
      appCell.className = 'admin-user-table__cell admin-miniapp-table__cell admin-miniapp-table__cell--app';

      const appName = document.createElement('span');
      appName.className = 'admin-miniapp-table__app-name';
      appName.textContent = app.name;

      const appMeta = document.createElement('span');
      appMeta.className = 'admin-miniapp-table__app-meta';
      appMeta.textContent = `${app.category} · Atualizado ${formatDateTime(app.updatedAt)}`;

      appCell.append(appName, appMeta);

      const accessCell = document.createElement('td');
      accessCell.className = 'admin-user-table__cell admin-miniapp-table__cell admin-miniapp-table__cell--access';

      const accessSummary = document.createElement('div');
      accessSummary.className = 'admin-miniapp-table__access-summary';

      const accessLabels = ACCESS_LEVEL_OPTIONS.filter((option) => app.access.includes(option.value));

      if (accessLabels.length === 0) {
        const emptyMessage = document.createElement('span');
        emptyMessage.className = 'admin-miniapp-table__access-empty';
        emptyMessage.textContent = 'Nenhum nível liberado';
        accessSummary.append(emptyMessage);
      } else {
        accessLabels.forEach((option) => {
          const chip = document.createElement('span');
          chip.className = 'admin-miniapp-table__access-chip';
          chip.textContent = option.label;
          accessSummary.append(chip);
        });
      }

      accessCell.append(accessSummary);

      const statusCell = document.createElement('td');
      statusCell.className = 'admin-user-table__cell admin-miniapp-table__cell admin-miniapp-table__cell--status';

      const statusBadge = document.createElement('span');
      statusBadge.className = 'admin-miniapp-table__status-badge';
      statusBadge.textContent = formatMiniAppStatus(app.status);

      statusCell.append(statusBadge);

      const actionCell = document.createElement('td');
      actionCell.className = 'admin-user-table__cell admin-user-table__cell--actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'button panel-action-tile panel-action-tile--icon admin-user-table__toggle';
      toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      toggleButton.setAttribute(
        'aria-label',
        isExpanded ? `Recolher configurações de ${app.name}` : `Expandir configurações de ${app.name}`,
      );

      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'admin-user-table__toggle-icon';
      toggleButton.append(toggleIcon);

      toggleButton.addEventListener('click', () => {
        expandedMiniAppId = isExpanded ? null : app.id;
        renderRows();
      });

      actionCell.append(toggleButton);

      row.append(appCell, accessCell, statusCell, actionCell);

      const detailsRow = document.createElement('tr');
      detailsRow.className = 'admin-user-table__details-row admin-miniapp-table__details-row';
      detailsRow.dataset.appId = app.id;
      detailsRow.hidden = !isExpanded;

      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 4;
      detailsCell.className = 'admin-user-table__details-cell admin-miniapp-table__details-cell';

      const detailsPanel = document.createElement('div');
      detailsPanel.className = 'admin-miniapp-table__details';

      const detailsHeader = document.createElement('header');
      detailsHeader.className = 'admin-miniapp-table__details-header';

      const detailsTitle = document.createElement('h3');
      detailsTitle.className = 'admin-miniapp-table__details-title';
      detailsTitle.textContent = app.name;

      const detailsSubtitle = document.createElement('p');
      detailsSubtitle.className = 'admin-miniapp-table__details-subtitle';
      detailsSubtitle.textContent = `${app.category} · Última atualização ${formatDateTime(app.updatedAt)}`;

      detailsHeader.append(detailsTitle, detailsSubtitle);

      const detailsDescription = document.createElement('p');
      detailsDescription.className = 'admin-miniapp-table__details-description';
      detailsDescription.textContent = app.description;

      const controls = document.createElement('div');
      controls.className = 'admin-miniapp-table__controls';

      const accessFieldset = document.createElement('fieldset');
      accessFieldset.className = 'admin-miniapp-table__access-fieldset';

      const accessLegend = document.createElement('legend');
      accessLegend.className = 'admin-miniapp-table__legend';
      accessLegend.textContent = 'Níveis com acesso liberado';
      accessFieldset.append(accessLegend);

      ACCESS_LEVEL_OPTIONS.forEach((option) => {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'admin-miniapp-table__access-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'admin-miniapp-table__access-checkbox';
        checkbox.value = option.value;
        checkbox.checked = app.access.includes(option.value);

        checkbox.addEventListener('change', () => {
          applyMiniAppUpdate(app.id, (current) => {
            const nextAccess = new Set(current.access);
            if (checkbox.checked) {
              nextAccess.add(option.value);
            } else {
              nextAccess.delete(option.value);
            }

            return {
              ...current,
              access: Array.from(nextAccess),
              updatedAt: new Date().toISOString(),
            };
          });
        });

        const optionText = document.createElement('span');
        optionText.className = 'admin-miniapp-table__access-label';
        optionText.textContent = option.label;

        optionLabel.append(checkbox, optionText);
        accessFieldset.append(optionLabel);
      });

      const statusField = document.createElement('label');
      statusField.className = 'admin-miniapp-table__status-field';

      const statusLabel = document.createElement('span');
      statusLabel.className = 'admin-miniapp-table__status-label';
      statusLabel.textContent = 'Status de implantação';

      const statusSelect = document.createElement('select');
      statusSelect.className = 'admin-miniapp-table__status-select';

      MINI_APP_STATUS_OPTIONS.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        statusSelect.append(optionElement);
      });

      statusSelect.value = app.status;

      statusSelect.addEventListener('change', () => {
        applyMiniAppUpdate(app.id, (current) => ({
          ...current,
          status: statusSelect.value,
          updatedAt: new Date().toISOString(),
        }));
      });

      statusField.append(statusLabel, statusSelect);

      controls.append(accessFieldset, statusField);

      detailsPanel.append(detailsHeader, detailsDescription, controls);
      detailsCell.append(detailsPanel);
      detailsRow.append(detailsCell);

      tbody.append(row, detailsRow);
    });
  }

  renderRows();

  function teardown() {
    state.clear();
    expandedMiniAppId = null;
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  }

  return { widget, teardown };
}

export function renderAdmin(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupHandlers = [];

  registerViewCleanup(viewRoot, () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar o painel administrativo.', error);
      }
    }
  });

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout';

  const highlightsWidget = createHighlightsWidget();
  cleanupHandlers.push(highlightsWidget.teardown);
  layout.append(highlightsWidget.widget);

  const usersWidget = createSystemUsersWidget();
  cleanupHandlers.push(usersWidget.teardown);
  layout.append(usersWidget.widget);

  const miniAppsWidget = createMiniAppsWidget();
  cleanupHandlers.push(miniAppsWidget.teardown);
  layout.append(miniAppsWidget.widget);

  viewRoot.setAttribute('aria-label', 'Painel administrativo');
  viewRoot.replaceChildren(layout);

  const unsubscribeUsers = subscribeUsers((snapshot) => {
    usersWidget.setUsers(snapshot);
    highlightsWidget.setUsers(snapshot);
  });

  if (typeof unsubscribeUsers === 'function') {
    cleanupHandlers.push(unsubscribeUsers);
  }

  const unsubscribeMiniApps = subscribeMiniApps((snapshot) => {
    highlightsWidget.setMiniApps(snapshot);
  });

  if (typeof unsubscribeMiniApps === 'function') {
    cleanupHandlers.push(unsubscribeMiniApps);
  }

  try {
    const initialUsers = getUsers();
    usersWidget.setUsers(initialUsers);
    highlightsWidget.setUsers(initialUsers);
  } catch (error) {
    console.error('Não foi possível carregar usuários iniciais para o painel administrativo.', error);
    usersWidget.setUsers([]);
    highlightsWidget.setUsers([]);
  }

  try {
    highlightsWidget.setMiniApps(getMiniAppsSnapshot());
  } catch (error) {
    console.error('Não foi possível carregar mini-apps iniciais para o painel administrativo.', error);
    highlightsWidget.setMiniApps([]);
  }
}
