import { getUsers, subscribeUsers } from '../data/user-store.js';
import {
  ACCESS_LEVEL_OPTIONS,
  MINI_APP_STATUS_OPTIONS,
  getMiniAppsSnapshot,
  subscribeMiniApps,
  updateMiniApp as persistMiniAppUpdate,
} from '../data/miniapp-store.js';
import {
  SUBSCRIPTION_PERIODICITY_OPTIONS,
  getSubscriptionPlansSnapshot,
  subscribeSubscriptionPlans,
  updateSubscriptionPlan as persistSubscriptionPlanUpdate,
} from '../data/subscription-store.js';
import {
  DEFAULT_BRANDING_LOGOS,
  getBrandingSnapshot,
  subscribeBranding,
  updateBranding as persistBrandingUpdate,
} from '../data/branding-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import {
  createSystemUsersWidget,
  formatDateTime,
} from './shared/system-users-widget.js';
import { createAdminNavigation } from './shared/admin-navigation.js';
import { createSystemStorageWidget } from './shared/system-storage-widget.js';

const BASE_CLASSES = 'card view dashboard-view view--admin admin-dashboard';

const countFormatter = new Intl.NumberFormat('pt-BR');
const USER_REGISTRATION_GOAL = 120;
const DEPLOYMENT_STATUSES = new Set(['deployment', 'testing']);
const MINI_APP_AVATAR_REQUIREMENTS = {
  mimeType: 'image/png',
  width: 128,
  height: 128,
  maxBytes: 128 * 1024,
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const periodicityLabelMap = new Map(
  SUBSCRIPTION_PERIODICITY_OPTIONS.map((option) => [option.value, option.label]),
);
const accessLevelLabelMap = new Map(ACCESS_LEVEL_OPTIONS.map((option) => [option.value, option.label]));

const BRANDING_ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);
const BRANDING_MAX_FILE_SIZE = 1024 * 1024; // 1 MB
let brandingControlId = 0;

function formatCount(value) {
  const numericValue = Number.isFinite(value) ? value : 0;
  return countFormatter.format(Math.max(0, Math.trunc(numericValue)));
}

function formatMiniAppStatus(status) {
  const option = MINI_APP_STATUS_OPTIONS.find((entry) => entry.value === status);
  return option ? option.label : 'Status desconhecido';
}

function formatCurrency(value) {
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return currencyFormatter.format(numericValue);
}

function formatDateOnly(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dateFormatter.format(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return dateFormatter.format(date);
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return dateFormatter.format(parsed);
    }
  }

  return '—';
}

function formatPlanPeriod(start, end) {
  const startLabel = formatDateOnly(start);
  const endLabel = formatDateOnly(end);

  if (startLabel === '—' && endLabel === '—') {
    return 'Período não definido';
  }

  if (startLabel === '—') {
    return `Até ${endLabel}`;
  }

  if (endLabel === '—') {
    return `A partir de ${startLabel}`;
  }

  return `${startLabel} — ${endLabel}`;
}

function formatPeriodicityLabel(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return periodicityLabelMap.get(normalized) ?? 'Periodicidade não definida';
}

function formatUserCategoryLabel(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return accessLevelLabelMap.get(normalized) ?? 'Categoria não definida';
}

function toDateInputValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return toDateInputValue(new Date(value));
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return toDateInputValue(parsed);
    }
  }

  return '';
}

function fromDateInputValue(value, fallback = null) {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return fallback;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString();
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

function createProductPackagesWidget() {
  let plans = [];
  let miniApps = [];

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--packages';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Pacote de produtos';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent =
    'Acompanhe o portfólio comercial para cruzar vigências, cobertura e valores dos pacotes.';

  const statsList = document.createElement('dl');
  statsList.className = 'admin-dashboard__stat-list';

  function createStatItem(label) {
    const term = document.createElement('dt');
    term.className = 'admin-dashboard__stat-term';
    term.textContent = label;

    const definition = document.createElement('dd');
    definition.className = 'admin-dashboard__stat-definition';

    const valueElement = document.createElement('span');
    valueElement.className = 'admin-dashboard__stat-value';
    valueElement.textContent = formatCount(0);

    const helperElement = document.createElement('span');
    helperElement.className = 'admin-dashboard__stat-helper';
    helperElement.textContent = 'Aguardando dados.';

    definition.append(valueElement, helperElement);

    function setValue(value, helper) {
      if (typeof value === 'string' && value.trim() !== '') {
        valueElement.textContent = value.trim();
      } else {
        valueElement.textContent = formatCount(0);
      }

      if (typeof helper === 'string' && helper.trim() !== '') {
        helperElement.textContent = helper.trim();
      } else {
        helperElement.textContent = 'Aguardando dados.';
      }
    }

    function reset() {
      valueElement.textContent = formatCount(0);
      helperElement.textContent = 'Aguardando dados.';
    }

    return { term, definition, setValue, reset };
  }

  const stats = {
    activePackages: createStatItem('Pacotes ativos'),
    coveredMiniApps: createStatItem('Mini-apps cobertos'),
    averageTicket: createStatItem('Ticket médio'),
    nextRenewal: createStatItem('Renovação mais próxima'),
  };

  Object.values(stats).forEach((stat) => {
    statsList.append(stat.term, stat.definition);
  });

  widget.append(title, description, statsList);

  function toDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return new Date(value.getTime());
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  function isPlanActive(plan, referenceDate = new Date()) {
    const start = toDate(plan?.startDate) ?? toDate(plan?.createdAt);
    const end = toDate(plan?.endDate);
    const pivot = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime()) ? referenceDate : new Date();

    if (start && pivot < start) {
      return false;
    }

    if (end && pivot > end) {
      return false;
    }

    return true;
  }

  function updateStats() {
    const totalPlans = plans.length;
    const referenceDate = new Date();
    const activePlans = plans.filter((plan) => isPlanActive(plan, referenceDate)).length;

    if (totalPlans === 0) {
      stats.activePackages.setValue(formatCount(0), 'Cadastre pacotes para iniciar o acompanhamento.');
      stats.coveredMiniApps.setValue(formatCount(0), 'O portfólio ainda não cobre nenhum mini-app.');
      stats.averageTicket.setValue(formatCurrency(0), 'Defina valores para calcular o ticket médio.');
      stats.nextRenewal.setValue('—', 'Nenhum pacote possui vigência cadastrada.');
      return;
    }

    stats.activePackages.setValue(
      formatCount(activePlans),
      `${formatCount(activePlans)} de ${formatCount(totalPlans)} vigências em andamento.`,
    );

    const uniqueMiniApps = new Set();
    plans.forEach((plan) => {
      if (Array.isArray(plan?.miniApps)) {
        plan.miniApps.forEach((id) => {
          if (typeof id === 'string' && id.trim() !== '') {
            uniqueMiniApps.add(id.trim());
          }
        });
      }
    });

    const totalCatalogMiniApps = miniApps.length;
    const coveredCount = uniqueMiniApps.size;
    const coverageRatio = totalCatalogMiniApps > 0 ? (coveredCount / totalCatalogMiniApps) * 100 : 0;
    const coverageLabel = `${Math.round(coverageRatio)}% do catálogo`;

    stats.coveredMiniApps.setValue(
      formatCount(coveredCount),
      totalCatalogMiniApps > 0
        ? `${coverageLabel} (${formatCount(totalCatalogMiniApps)} mini-apps disponíveis).`
        : 'Catálogo de mini-apps ainda não disponível.',
    );

    const pricedPlans = plans
      .map((plan) => (typeof plan?.price === 'number' && Number.isFinite(plan.price) ? plan : null))
      .filter(Boolean);

    if (pricedPlans.length === 0) {
      stats.averageTicket.setValue(formatCurrency(0), 'Defina valores para calcular o ticket médio.');
    } else {
      const totalPrice = pricedPlans.reduce((total, plan) => total + plan.price, 0);
      const averagePrice = totalPrice / pricedPlans.length;

      const highestPlan = pricedPlans.reduce((currentHighest, plan) =>
        !currentHighest || plan.price > currentHighest.price ? plan : currentHighest,
      );

      stats.averageTicket.setValue(
        formatCurrency(averagePrice),
        highestPlan
          ? `${highestPlan.name} é o pacote mais alto (${formatCurrency(highestPlan.price)}).`
          : 'Ticket médio calculado com os pacotes cadastrados.',
      );
    }

    const plansWithEndDate = plans
      .map((plan) => ({ plan, end: toDate(plan?.endDate) }))
      .filter((entry) => entry.end);

    const upcomingRenewals = plansWithEndDate.filter((entry) => entry.end >= referenceDate);

    if (upcomingRenewals.length > 0) {
      upcomingRenewals.sort((a, b) => a.end - b.end);
      const next = upcomingRenewals[0];
      stats.nextRenewal.setValue(
        formatDateOnly(next.end),
        `Encerramento previsto do ${next.plan.name}.`,
      );
      return;
    }

    if (plansWithEndDate.length > 0) {
      plansWithEndDate.sort((a, b) => b.end - a.end);
      const last = plansWithEndDate[0];
      stats.nextRenewal.setValue(
        formatDateOnly(last.end),
        `Última vigência encerrada: ${last.plan.name}.`,
      );
      return;
    }

    stats.nextRenewal.setValue('Sem término', 'Nenhum pacote possui data final cadastrada.');
  }

  function setPlans(nextPlans) {
    plans = Array.isArray(nextPlans)
      ? nextPlans.filter((plan) => plan && typeof plan === 'object')
      : [];
    updateStats();
  }

  function setMiniApps(nextMiniApps) {
    miniApps = Array.isArray(nextMiniApps)
      ? nextMiniApps.filter((app) => app && typeof app === 'object')
      : [];
    updateStats();
  }

  function teardown() {
    plans = [];
    miniApps = [];
    Object.values(stats).forEach((stat) => stat.reset());
  }

  updateStats();

  return { widget, setPlans, setMiniApps, teardown };
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
      state.set(id, { ...entry, id, access, icon: entry.icon ?? null });
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

    const buildAvatarElement = (iconValue, nameValue) => {
      const container = document.createElement('div');
      container.className = 'admin-miniapp-table__avatar';
      container.setAttribute('aria-hidden', 'true');

      if (typeof iconValue === 'string' && iconValue.trim() !== '') {
        const image = document.createElement('img');
        image.className = 'admin-miniapp-table__avatar-image';
        image.alt = '';
        image.src = iconValue;
        container.dataset.state = 'image';
        container.append(image);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'admin-miniapp-table__avatar-placeholder';
        const fallbackInitial = nameValue ? nameValue.trim().charAt(0).toUpperCase() : 'M';
        placeholder.textContent = fallbackInitial || 'M';
        container.dataset.state = 'placeholder';
        container.append(placeholder);
      }

      return container;
    };

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

      const appContent = document.createElement('div');
      appContent.className = 'admin-miniapp-table__app-content';

      const avatarContainer = buildAvatarElement(app.icon, app.name);

      const appDetails = document.createElement('div');
      appDetails.className = 'admin-miniapp-table__app-details';

      const appName = document.createElement('span');
      appName.className = 'admin-miniapp-table__app-name';
      appName.textContent = app.name;

      const appMeta = document.createElement('span');
      appMeta.className = 'admin-miniapp-table__app-meta';
      appMeta.textContent = `${app.category} · Atualizado ${formatDateTime(app.updatedAt)}`;

      appDetails.append(appName, appMeta);
      appContent.append(avatarContainer, appDetails);
      appCell.append(appContent);

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

      const avatarField = document.createElement('div');
      avatarField.className = 'admin-miniapp-table__avatar-field';

      const avatarLabel = document.createElement('span');
      avatarLabel.className = 'admin-miniapp-table__avatar-label';
      avatarLabel.textContent = 'Avatar do mini-app';

      const avatarPreview = document.createElement('div');
      avatarPreview.className = 'admin-miniapp-table__avatar-preview';
      avatarPreview.append(buildAvatarElement(app.icon, app.name));

      const avatarHint = document.createElement('p');
      avatarHint.className = 'admin-miniapp-table__avatar-hint';
      avatarHint.textContent = 'Envie um PNG quadrado de 128 × 128 px com até 128 KB.';

      const avatarUpload = document.createElement('div');
      avatarUpload.className = 'admin-miniapp-table__avatar-upload';

      const avatarInput = document.createElement('input');
      avatarInput.type = 'file';
      avatarInput.accept = MINI_APP_AVATAR_REQUIREMENTS.mimeType;
      avatarInput.className = 'admin-miniapp-table__avatar-input';

      const normalizedId = typeof app.id === 'string' ? app.id.toLowerCase().replace(/[^a-z0-9-]+/gi, '-') : 'miniapp';
      const feedbackId = `miniapp-avatar-feedback-${normalizedId}`;

      const avatarFeedback = document.createElement('p');
      avatarFeedback.className = 'admin-miniapp-table__avatar-feedback';
      avatarFeedback.id = feedbackId;

      avatarInput.setAttribute('aria-describedby', feedbackId);

      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.className = 'button button--secondary admin-miniapp-table__avatar-reset';
      resetButton.textContent = 'Remover avatar';
      resetButton.disabled = !(typeof app.icon === 'string' && app.icon.trim() !== '');

      function setAvatarFeedback(message, status = 'info') {
        avatarFeedback.textContent = message;
        if (!message) {
          avatarFeedback.removeAttribute('data-status');
          return;
        }

        avatarFeedback.dataset.status = status;
      }

      avatarInput.addEventListener('change', () => {
        setAvatarFeedback('');

        const [file] = avatarInput.files ?? [];
        if (!file) {
          return;
        }

        const isValidType =
          file.type === MINI_APP_AVATAR_REQUIREMENTS.mimeType ||
          file.name?.toLowerCase?.().endsWith('.png');
        if (!isValidType) {
          setAvatarFeedback('Selecione um arquivo PNG.', 'error');
          avatarInput.value = '';
          return;
        }

        if (file.size > MINI_APP_AVATAR_REQUIREMENTS.maxBytes) {
          setAvatarFeedback('O arquivo deve ter no máximo 128 KB.', 'error');
          avatarInput.value = '';
          return;
        }

        const reader = new FileReader();

        reader.addEventListener('error', () => {
          setAvatarFeedback('Não foi possível ler o arquivo selecionado.', 'error');
          avatarInput.value = '';
        });

        reader.addEventListener('load', () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          if (!result) {
            setAvatarFeedback('Não foi possível carregar o arquivo escolhido.', 'error');
            avatarInput.value = '';
            return;
          }

          const previewImage = new Image();

          previewImage.addEventListener('error', () => {
            setAvatarFeedback('O arquivo precisa ser uma imagem PNG válida.', 'error');
            avatarInput.value = '';
          });

          previewImage.addEventListener('load', () => {
            if (
              previewImage.naturalWidth !== MINI_APP_AVATAR_REQUIREMENTS.width ||
              previewImage.naturalHeight !== MINI_APP_AVATAR_REQUIREMENTS.height
            ) {
              setAvatarFeedback('O PNG deve ter exatamente 128 × 128 px.', 'error');
              avatarInput.value = '';
              return;
            }

            setAvatarFeedback('Avatar enviado. Atualizando mini-app...', 'success');
            applyMiniAppUpdate(app.id, (current) => ({
              ...current,
              icon: result,
              updatedAt: new Date().toISOString(),
            }));
          });

          previewImage.src = result;
        });

        reader.readAsDataURL(file);
      });

      resetButton.addEventListener('click', () => {
        setAvatarFeedback('');
        avatarInput.value = '';
        if (!(typeof app.icon === 'string' && app.icon.trim() !== '')) {
          return;
        }

        setAvatarFeedback('Avatar removido. Atualizando mini-app...', 'success');
        applyMiniAppUpdate(app.id, (current) => ({
          ...current,
          icon: null,
          updatedAt: new Date().toISOString(),
        }));
      });

      avatarUpload.append(avatarInput, resetButton);

      avatarField.append(avatarLabel, avatarPreview, avatarHint, avatarUpload, avatarFeedback);

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

      controls.append(accessFieldset, avatarField, statusField);

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

function createSubscriptionPlansWidget() {
  let plans = [];
  let expandedPlanId = null;
  const state = new Map();
  let miniAppOptions = [];
  const miniAppLabels = new Map();

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--subscriptions';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Pacotes e assinaturas';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent =
    'Configure vigência, valor e público de cada pacote antes de liberar os mini-apps para contratação.';

  const tableContainer = document.createElement('div');
  tableContainer.className = 'admin-user-table-container';

  const table = document.createElement('table');
  table.className = 'admin-user-table admin-subscription-table';

  const thead = document.createElement('thead');
  thead.className = 'admin-user-table__head';

  const headRow = document.createElement('tr');

  [
    { label: 'Pacote', className: 'admin-user-table__head-cell admin-subscription-table__head-cell--plan' },
    { label: 'Vigência', className: 'admin-user-table__head-cell' },
    { label: 'Valor', className: 'admin-user-table__head-cell' },
    { label: 'Categoria', className: 'admin-user-table__head-cell' },
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

  function normalizePlanEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const idSource = entry.id;
    if (idSource == null) {
      return null;
    }

    const id = String(idSource);
    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : 'Pacote sem nome';
    const descriptionText = typeof entry.description === 'string' ? entry.description.trim() : '';
    const startDate = entry.startDate ?? '';
    const endDate = entry.endDate ?? '';
    const priceValue =
      typeof entry.price === 'number' && Number.isFinite(entry.price)
        ? entry.price
        : Number.isFinite(Number.parseFloat(entry.price))
        ? Number.parseFloat(entry.price)
        : 0;
    const periodicity = typeof entry.periodicity === 'string' ? entry.periodicity.trim().toLowerCase() : '';
    const userCategory = typeof entry.userCategory === 'string' ? entry.userCategory.trim().toLowerCase() : 'usuario';
    const createdAt = entry.createdAt ?? '';
    const updatedAt = entry.updatedAt ?? '';

    const miniApps = Array.isArray(entry.miniApps)
      ? entry.miniApps
          .map((value) => (value == null ? '' : String(value)))
          .filter((value, index, array) => value && array.indexOf(value) === index)
      : [];

    return {
      id,
      name,
      description: descriptionText,
      startDate,
      endDate,
      price: Number.isFinite(priceValue) ? priceValue : 0,
      periodicity,
      miniApps,
      userCategory,
      createdAt,
      updatedAt,
    };
  }

  function setPlans(entries) {
    const normalized = Array.isArray(entries)
      ? entries
          .map((entry) => normalizePlanEntry(entry))
          .filter((entry) => entry !== null)
      : [];

    plans = normalized;
    state.clear();
    normalized.forEach((plan) => {
      state.set(plan.id, plan);
    });

    if (expandedPlanId && !state.has(expandedPlanId)) {
      expandedPlanId = null;
    }

    renderRows();
  }

  function setMiniApps(entries) {
    miniAppLabels.clear();

    if (!Array.isArray(entries)) {
      miniAppOptions = [];
      renderRows();
      return;
    }

    miniAppOptions = entries
      .filter((entry) => entry && typeof entry === 'object' && entry.id != null)
      .map((entry) => {
        const id = String(entry.id);
        const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : 'Mini-app sem nome';
        miniAppLabels.set(id, name);
        return { id, name };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

    renderRows();
  }

  function createMiniAppsSummary(plan) {
    const summary = document.createElement('div');
    summary.className = 'admin-miniapp-table__access-summary admin-subscription-table__miniapps-summary';

    if (!plan.miniApps || plan.miniApps.length === 0) {
      const emptyMessage = document.createElement('span');
      emptyMessage.className = 'admin-miniapp-table__access-empty';
      emptyMessage.textContent = 'Nenhum mini-app selecionado';
      summary.append(emptyMessage);
      return summary;
    }

    plan.miniApps.forEach((id) => {
      const label = miniAppLabels.get(id) ?? id;
      const chip = document.createElement('span');
      chip.className = 'admin-miniapp-table__access-chip';
      chip.textContent = label;
      summary.append(chip);
    });

    return summary;
  }

  function applyPlanUpdate(id, updater) {
    if (!state.has(id)) {
      return;
    }

    persistSubscriptionPlanUpdate(id, (current) => {
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

  function renderRows() {
    const rows = [];

    if (plans.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'admin-user-table__empty-row';

      const emptyCell = document.createElement('td');
      emptyCell.className = 'admin-user-table__empty-cell';
      emptyCell.colSpan = 5;
      emptyCell.textContent = 'Nenhum pacote cadastrado até o momento.';

      emptyRow.append(emptyCell);
      rows.push(emptyRow);
      tbody.replaceChildren(...rows);
      return;
    }

    const sortedPlans = plans.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

    sortedPlans.forEach((plan) => {
      const isExpanded = expandedPlanId === plan.id;

      const row = document.createElement('tr');
      row.className = 'admin-user-table__row admin-subscription-table__row';
      row.dataset.planId = plan.id;
      if (isExpanded) {
        row.dataset.state = 'expanded';
      }

      const planCell = document.createElement('td');
      planCell.className = 'admin-user-table__cell admin-subscription-table__cell admin-subscription-table__cell--plan';

      const planWrapper = document.createElement('div');
      planWrapper.className = 'admin-subscription-table__plan';

      const planName = document.createElement('span');
      planName.className = 'admin-subscription-table__plan-name';
      planName.textContent = plan.name;

      const planPeriodicity = document.createElement('span');
      planPeriodicity.className = 'admin-subscription-table__plan-periodicity';
      planPeriodicity.textContent = formatPeriodicityLabel(plan.periodicity);

      const planMiniApps = createMiniAppsSummary(plan);

      planWrapper.append(planName, planPeriodicity, planMiniApps);
      planCell.append(planWrapper);

      const periodCell = document.createElement('td');
      periodCell.className = 'admin-user-table__cell admin-subscription-table__cell admin-subscription-table__cell--period';
      periodCell.textContent = formatPlanPeriod(plan.startDate, plan.endDate);

      const priceCell = document.createElement('td');
      priceCell.className = 'admin-user-table__cell admin-subscription-table__cell admin-subscription-table__cell--price';
      priceCell.textContent = formatCurrency(plan.price);

      const categoryCell = document.createElement('td');
      categoryCell.className =
        'admin-user-table__cell admin-subscription-table__cell admin-subscription-table__cell--category';
      categoryCell.textContent = formatUserCategoryLabel(plan.userCategory);

      const actionCell = document.createElement('td');
      actionCell.className = 'admin-user-table__cell admin-user-table__cell--actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'button panel-action-tile panel-action-tile--icon admin-user-table__toggle';
      toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      toggleButton.setAttribute(
        'aria-label',
        isExpanded ? `Recolher configurações de ${plan.name}` : `Expandir configurações de ${plan.name}`,
      );

      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'admin-user-table__toggle-icon';
      toggleButton.append(toggleIcon);

      toggleButton.addEventListener('click', () => {
        expandedPlanId = isExpanded ? null : plan.id;
        renderRows();
      });

      actionCell.append(toggleButton);

      row.append(planCell, periodCell, priceCell, categoryCell, actionCell);

      const detailsRow = document.createElement('tr');
      detailsRow.className = 'admin-user-table__details-row admin-miniapp-table__details-row admin-subscription-table__details-row';
      detailsRow.dataset.planId = plan.id;
      detailsRow.hidden = !isExpanded;

      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 5;
      detailsCell.className = 'admin-user-table__details-cell admin-miniapp-table__details-cell';

      const detailsPanel = document.createElement('div');
      detailsPanel.className = 'admin-miniapp-table__details admin-subscription-table__details';

      const detailsHeader = document.createElement('header');
      detailsHeader.className = 'admin-miniapp-table__details-header';

      const detailsTitle = document.createElement('h3');
      detailsTitle.className = 'admin-miniapp-table__details-title';
      detailsTitle.textContent = plan.name;

      const detailsSubtitle = document.createElement('p');
      detailsSubtitle.className = 'admin-miniapp-table__details-subtitle';
      detailsSubtitle.textContent = `${formatPeriodicityLabel(plan.periodicity)} · Última atualização ${formatDateTime(
        plan.updatedAt,
      )}`;

      detailsHeader.append(detailsTitle, detailsSubtitle);

      const detailsDescription = document.createElement('p');
      detailsDescription.className = 'admin-miniapp-table__details-description';
      detailsDescription.textContent = plan.description || '—';

      const controls = document.createElement('div');
      controls.className = 'admin-miniapp-table__controls admin-subscription-table__controls';

      const startField = document.createElement('label');
      startField.className = 'admin-subscription-table__field';

      const startLabel = document.createElement('span');
      startLabel.className = 'admin-subscription-table__field-label';
      startLabel.textContent = 'Data de início';

      const startInput = document.createElement('input');
      startInput.type = 'date';
      startInput.className = 'admin-subscription-table__input admin-subscription-table__start-input';
      startInput.dataset.field = 'start-date';
      startInput.value = toDateInputValue(plan.startDate);

      startInput.addEventListener('change', () => {
        const nextValue = fromDateInputValue(startInput.value, plan.startDate);
        if (!nextValue) {
          startInput.value = toDateInputValue(plan.startDate);
          return;
        }

        applyPlanUpdate(plan.id, { startDate: nextValue });
      });

      startField.append(startLabel, startInput);

      const endField = document.createElement('label');
      endField.className = 'admin-subscription-table__field';

      const endLabel = document.createElement('span');
      endLabel.className = 'admin-subscription-table__field-label';
      endLabel.textContent = 'Data de término';

      const endInput = document.createElement('input');
      endInput.type = 'date';
      endInput.className = 'admin-subscription-table__input admin-subscription-table__end-input';
      endInput.dataset.field = 'end-date';
      endInput.value = toDateInputValue(plan.endDate);

      endInput.addEventListener('change', () => {
        const nextValue = fromDateInputValue(endInput.value, plan.endDate);
        if (!nextValue) {
          endInput.value = toDateInputValue(plan.endDate);
          return;
        }

        applyPlanUpdate(plan.id, { endDate: nextValue });
      });

      endField.append(endLabel, endInput);

      const priceField = document.createElement('label');
      priceField.className = 'admin-subscription-table__field';

      const priceLabel = document.createElement('span');
      priceLabel.className = 'admin-subscription-table__field-label';
      priceLabel.textContent = 'Valor do pacote';

      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.min = '0';
      priceInput.step = '0.01';
      priceInput.className = 'admin-subscription-table__input admin-subscription-table__price-input';
      priceInput.dataset.field = 'price';
      priceInput.value = plan.price.toFixed(2);

      priceInput.addEventListener('change', () => {
        const parsed = Number.parseFloat(priceInput.value.replace(',', '.'));
        if (!Number.isFinite(parsed)) {
          priceInput.value = plan.price.toFixed(2);
          return;
        }

        const normalizedPrice = Math.max(0, Math.round(parsed * 100) / 100);
        priceInput.value = normalizedPrice.toFixed(2);
        applyPlanUpdate(plan.id, { price: normalizedPrice });
      });

      priceField.append(priceLabel, priceInput);

      const periodicityField = document.createElement('label');
      periodicityField.className = 'admin-subscription-table__field';

      const periodicityLabel = document.createElement('span');
      periodicityLabel.className = 'admin-subscription-table__field-label';
      periodicityLabel.textContent = 'Periodicidade';

      const periodicitySelect = document.createElement('select');
      periodicitySelect.className =
        'admin-miniapp-table__status-select admin-subscription-table__select admin-subscription-table__periodicity-select';
      periodicitySelect.dataset.field = 'periodicity';

      SUBSCRIPTION_PERIODICITY_OPTIONS.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        periodicitySelect.append(optionElement);
      });

      periodicitySelect.value = plan.periodicity || SUBSCRIPTION_PERIODICITY_OPTIONS[0].value;

      periodicitySelect.addEventListener('change', () => {
        applyPlanUpdate(plan.id, { periodicity: periodicitySelect.value });
      });

      periodicityField.append(periodicityLabel, periodicitySelect);

      const miniAppsFieldset = document.createElement('fieldset');
      miniAppsFieldset.className = 'admin-miniapp-table__access-fieldset admin-subscription-table__miniapps-fieldset';

      const miniAppsLegend = document.createElement('legend');
      miniAppsLegend.className = 'admin-miniapp-table__legend';
      miniAppsLegend.textContent = 'Mini-apps incluídos';
      miniAppsFieldset.append(miniAppsLegend);

      if (miniAppOptions.length === 0) {
        const emptyMessage = document.createElement('span');
        emptyMessage.className = 'admin-miniapp-table__access-empty';
        emptyMessage.textContent = 'Nenhum mini-app disponível no momento.';
        miniAppsFieldset.append(emptyMessage);
      } else {
        miniAppOptions.forEach((option) => {
          const optionLabel = document.createElement('label');
          optionLabel.className = 'admin-miniapp-table__access-option';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'admin-miniapp-table__access-checkbox';
          checkbox.value = option.id;
          checkbox.checked = plan.miniApps.includes(option.id);
          checkbox.dataset.miniappId = option.id;

          checkbox.addEventListener('change', () => {
            applyPlanUpdate(plan.id, (current) => {
              const nextMiniApps = new Set(Array.isArray(current.miniApps) ? current.miniApps : []);
              if (checkbox.checked) {
                nextMiniApps.add(option.id);
              } else {
                nextMiniApps.delete(option.id);
              }

              return { ...current, miniApps: Array.from(nextMiniApps) };
            });
          });

          const optionText = document.createElement('span');
          optionText.className = 'admin-miniapp-table__access-label';
          optionText.textContent = option.name;

          optionLabel.append(checkbox, optionText);
          miniAppsFieldset.append(optionLabel);
        });
      }

      const categoryField = document.createElement('label');
      categoryField.className = 'admin-subscription-table__field';

      const categoryLabel = document.createElement('span');
      categoryLabel.className = 'admin-subscription-table__field-label';
      categoryLabel.textContent = 'Categoria habilitada';

      const categorySelect = document.createElement('select');
      categorySelect.className =
        'admin-miniapp-table__status-select admin-subscription-table__select admin-subscription-table__category-select';
      categorySelect.dataset.field = 'user-category';

      ACCESS_LEVEL_OPTIONS.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        categorySelect.append(optionElement);
      });

      categorySelect.value = plan.userCategory || 'usuario';

      categorySelect.addEventListener('change', () => {
        applyPlanUpdate(plan.id, { userCategory: categorySelect.value });
      });

      categoryField.append(categoryLabel, categorySelect);

      controls.append(startField, endField, priceField, periodicityField, miniAppsFieldset, categoryField);

      detailsPanel.append(detailsHeader, detailsDescription, controls);
      detailsCell.append(detailsPanel);
      detailsRow.append(detailsCell);

      rows.push(row, detailsRow);
    });

    tbody.replaceChildren(...rows);
  }

  function teardown() {
    plans = [];
    state.clear();
    miniAppOptions = [];
    miniAppLabels.clear();
    expandedPlanId = null;
  }

  renderRows();

  return { widget, setPlans, setMiniApps, teardown };
}

function createBrandingWidget() {
  let currentBranding = getBrandingSnapshot();

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--branding';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Identidade visual';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent =
    'Atualize os logotipos exibidos no topo do painel para cada tema disponível no aplicativo.';

  widget.append(title, description);

  const modeFieldset = document.createElement('fieldset');
  modeFieldset.className = 'form-field admin-branding__mode';

  const legend = document.createElement('legend');
  legend.className = 'form-label';
  legend.textContent = 'Modo de exibição';
  modeFieldset.append(legend);

  const modeOptions = document.createElement('div');
  modeOptions.className = 'admin-branding__mode-options';

  function createModeOption(value, heading, helper) {
    const option = document.createElement('label');
    option.className = 'admin-branding__mode-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'admin-branding-mode';
    input.value = value;
    input.className = 'admin-branding__mode-input';

    const titleElement = document.createElement('span');
    titleElement.className = 'admin-branding__mode-title';
    titleElement.textContent = heading;

    const helperElement = document.createElement('span');
    helperElement.className = 'admin-branding__mode-hint';
    helperElement.textContent = helper;

    option.append(input, titleElement, helperElement);

    return { element: option, input };
  }

  const individualOption = createModeOption(
    'individual',
    'Logos independentes',
    'Defina uma imagem específica para os temas claro e escuro.',
  );
  const sharedOption = createModeOption(
    'shared',
    'Mesma logo nos dois temas',
    'A mesma imagem será utilizada simultaneamente no claro e no escuro.',
  );

  modeOptions.append(individualOption.element, sharedOption.element);
  modeFieldset.append(modeOptions);
  widget.append(modeFieldset);

  const controls = document.createElement('div');
  controls.className = 'admin-branding__controls';
  widget.append(controls);

  function createLogoBlock({ key, label, helper }) {
    const element = document.createElement('article');
    element.className = 'admin-branding__item';
    element.dataset.variant = key;

    const preview = document.createElement('div');
    preview.className = 'admin-branding__preview';
    preview.dataset.variant = key;

    const previewImage = document.createElement('img');
    previewImage.className = 'admin-branding__preview-image';
    previewImage.alt = `${label} – pré-visualização da logo`;
    previewImage.decoding = 'async';
    previewImage.loading = 'lazy';
    preview.append(previewImage);

    const form = document.createElement('div');
    form.className = 'admin-branding__form form-field';

    const labelElement = document.createElement('span');
    labelElement.className = 'form-label';
    labelElement.textContent = label;

    const helperElement = document.createElement('p');
    helperElement.className = 'form-helper';
    helperElement.textContent = helper;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/webp,image/svg+xml';
    fileInput.id = `admin-branding-file-${key}-${++brandingControlId}`;
    fileInput.hidden = true;

    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.className = 'button button--secondary admin-branding__action';
    uploadButton.textContent = 'Carregar logo';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'button button--ghost admin-branding__action';
    resetButton.textContent = 'Restaurar padrão';

    const actions = document.createElement('div');
    actions.className = 'admin-branding__actions';
    actions.append(uploadButton, resetButton);

    const feedback = document.createElement('p');
    feedback.className = 'form-helper admin-branding__feedback';
    feedback.setAttribute('aria-live', 'polite');
    feedback.hidden = true;

    form.append(labelElement, helperElement, fileInput, actions, feedback);

    element.append(preview, form);

    function setPreview(src) {
      if (typeof src === 'string' && src.trim() !== '') {
        previewImage.src = src;
        previewImage.hidden = false;
      } else {
        previewImage.src = '';
        previewImage.hidden = true;
      }
    }

    function setFeedback(message, tone = 'info') {
      const text = typeof message === 'string' ? message.trim() : '';
      if (text) {
        feedback.textContent = text;
        feedback.hidden = false;
        feedback.dataset.tone = tone;
      } else {
        feedback.textContent = '';
        feedback.hidden = true;
        feedback.removeAttribute('data-tone');
      }
    }

    function setVisibility(isVisible) {
      if (isVisible) {
        element.hidden = false;
        element.removeAttribute('aria-hidden');
        fileInput.disabled = false;
        uploadButton.disabled = false;
        resetButton.disabled = false;
      } else {
        element.hidden = true;
        element.setAttribute('aria-hidden', 'true');
        fileInput.disabled = true;
        uploadButton.disabled = true;
        resetButton.disabled = true;
      }
    }

    return {
      element,
      fileInput,
      uploadButton,
      resetButton,
      setPreview,
      setFeedback,
      setVisibility,
    };
  }

  const logoBlocks = {
    light: createLogoBlock({
      key: 'light',
      label: 'Tema claro',
      helper: 'Imagem exibida quando o painel estiver no modo claro.',
    }),
    dark: createLogoBlock({
      key: 'dark',
      label: 'Tema escuro',
      helper: 'Imagem exibida quando o painel estiver no modo escuro.',
    }),
    shared: createLogoBlock({
      key: 'shared',
      label: 'Logo compartilhada',
      helper: 'Usada simultaneamente nos temas claro e escuro.',
    }),
  };

  controls.append(logoBlocks.light.element, logoBlocks.dark.element, logoBlocks.shared.element);

  function handleUpload(variant, block, fileList) {
    const files = Array.from(fileList ?? []).filter((entry) => entry instanceof File);
    const file = files.length > 0 ? files[0] : null;
    if (!file) {
      block.setFeedback('Nenhum arquivo selecionado.', 'neutral');
      return;
    }

    const type = String(file.type ?? '').toLowerCase();
    if (type && !BRANDING_ALLOWED_MIME_TYPES.has(type)) {
      block.setFeedback('Formato não suportado. Use PNG, JPG, SVG ou WebP.', 'error');
      return;
    }

    if (Number.isFinite(file.size) && file.size > BRANDING_MAX_FILE_SIZE) {
      block.setFeedback('Arquivo muito grande. Utilize imagens de até 1 MB.', 'error');
      return;
    }

    block.setFeedback('Carregando logo...', 'info');

    const reader = new FileReader();
    reader.addEventListener('error', () => {
      block.setFeedback('Não foi possível carregar a imagem selecionada.', 'error');
    });
    reader.addEventListener('load', () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        block.setFeedback('Não foi possível carregar a imagem selecionada.', 'error');
        return;
      }

      persistBrandingUpdate({ logos: { [variant]: result } });
      block.setFeedback('Logo atualizada com sucesso!', 'success');
    });
    reader.readAsDataURL(file);
  }

  const logoEntries = [
    ['light', logoBlocks.light, DEFAULT_BRANDING_LOGOS.light],
    ['dark', logoBlocks.dark, DEFAULT_BRANDING_LOGOS.dark],
    ['shared', logoBlocks.shared, DEFAULT_BRANDING_LOGOS.light],
  ];

  logoEntries.forEach(([variant, block, defaultLogo]) => {
    block.uploadButton.addEventListener('click', () => {
      block.fileInput.click();
    });

    block.fileInput.addEventListener('change', () => {
      handleUpload(variant, block, block.fileInput.files);
      block.fileInput.value = '';
    });

    block.resetButton.addEventListener('click', () => {
      persistBrandingUpdate({ logos: { [variant]: defaultLogo } });
      block.setFeedback('Logo restaurada para o padrão.', 'success');
    });
  });

  function applySnapshot(snapshot) {
    currentBranding = snapshot && typeof snapshot === 'object' ? snapshot : getBrandingSnapshot();
    const mode = currentBranding.mode === 'shared' ? 'shared' : 'individual';

    controls.dataset.mode = mode;

    individualOption.input.checked = mode === 'individual';
    sharedOption.input.checked = mode === 'shared';

    const lightLogo =
      typeof currentBranding?.logos?.light === 'string' && currentBranding.logos.light
        ? currentBranding.logos.light
        : DEFAULT_BRANDING_LOGOS.light;
    const darkLogo =
      typeof currentBranding?.logos?.dark === 'string' && currentBranding.logos.dark
        ? currentBranding.logos.dark
        : DEFAULT_BRANDING_LOGOS.dark;
    const sharedLogo =
      typeof currentBranding?.logos?.shared === 'string' && currentBranding.logos.shared
        ? currentBranding.logos.shared
        : lightLogo;

    if (mode === 'shared') {
      logoBlocks.shared.setVisibility(true);
      logoBlocks.light.setVisibility(false);
      logoBlocks.dark.setVisibility(false);
      logoBlocks.shared.setPreview(sharedLogo);
    } else {
      logoBlocks.shared.setVisibility(false);
      logoBlocks.light.setVisibility(true);
      logoBlocks.dark.setVisibility(true);
      logoBlocks.light.setPreview(lightLogo);
      logoBlocks.dark.setPreview(darkLogo);
      logoBlocks.shared.setPreview(sharedLogo);
    }
  }

  applySnapshot(currentBranding);

  const unsubscribe = subscribeBranding((snapshot) => {
    applySnapshot(snapshot);
  });

  individualOption.input.addEventListener('change', () => {
    if (individualOption.input.checked) {
      persistBrandingUpdate({ mode: 'individual' });
    }
  });

  sharedOption.input.addEventListener('change', () => {
    if (sharedOption.input.checked) {
      const fallbackShared =
        (currentBranding?.logos?.shared && typeof currentBranding.logos.shared === 'string'
          ? currentBranding.logos.shared
          : null) ||
        (currentBranding?.logos?.light && typeof currentBranding.logos.light === 'string'
          ? currentBranding.logos.light
          : DEFAULT_BRANDING_LOGOS.light);
      persistBrandingUpdate({ mode: 'shared', logos: { shared: fallbackShared } });
    }
  });

  function teardown() {
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

  const navigation = createAdminNavigation({ active: 'overview' });
  cleanupHandlers.push(navigation.cleanup);
  layout.append(navigation.element);

  const highlightsWidget = createHighlightsWidget();
  cleanupHandlers.push(highlightsWidget.teardown);
  layout.append(highlightsWidget.widget);

  const brandingWidget = createBrandingWidget();
  cleanupHandlers.push(brandingWidget.teardown);
  layout.append(brandingWidget.widget);

  const storageWidget = createSystemStorageWidget();
  cleanupHandlers.push(storageWidget.teardown);
  layout.append(storageWidget.widget);

  const usersWidget = createSystemUsersWidget();
  cleanupHandlers.push(usersWidget.teardown);
  layout.append(usersWidget.widget);

  const subscriptionWidget = createSubscriptionPlansWidget();
  cleanupHandlers.push(subscriptionWidget.teardown);
  layout.append(subscriptionWidget.widget);

  const productPackagesWidget = createProductPackagesWidget();
  cleanupHandlers.push(productPackagesWidget.teardown);

  const miniAppsWidget = createMiniAppsWidget();
  cleanupHandlers.push(miniAppsWidget.teardown);

  const miniAppsRow = document.createElement('div');
  miniAppsRow.className = 'admin-dashboard__widget-row admin-dashboard__widget-row--split';
  miniAppsRow.append(productPackagesWidget.widget, miniAppsWidget.widget);
  layout.append(miniAppsRow);

  viewRoot.setAttribute('aria-label', 'Painel administrativo');
  viewRoot.replaceChildren(layout);

  const unsubscribeUsers = subscribeUsers((snapshot) => {
    usersWidget.setUsers(snapshot);
    highlightsWidget.setUsers(snapshot);
  });

  if (typeof unsubscribeUsers === 'function') {
    cleanupHandlers.push(unsubscribeUsers);
  }

  const unsubscribeSubscriptions = subscribeSubscriptionPlans((snapshot) => {
    const plans = Array.isArray(snapshot) ? snapshot : [];
    subscriptionWidget.setPlans(plans);
    productPackagesWidget.setPlans(plans);
  });

  if (typeof unsubscribeSubscriptions === 'function') {
    cleanupHandlers.push(unsubscribeSubscriptions);
  }

  const unsubscribeMiniApps = subscribeMiniApps((snapshot) => {
    highlightsWidget.setMiniApps(snapshot);
    subscriptionWidget.setMiniApps(snapshot);
    productPackagesWidget.setMiniApps(snapshot);
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
    const plansSnapshot = getSubscriptionPlansSnapshot();
    subscriptionWidget.setPlans(plansSnapshot);
    productPackagesWidget.setPlans(plansSnapshot);
  } catch (error) {
    console.error('Não foi possível carregar pacotes de assinatura iniciais para o painel administrativo.', error);
    subscriptionWidget.setPlans([]);
    productPackagesWidget.setPlans([]);
  }

  try {
    const miniAppsSnapshot = getMiniAppsSnapshot();
    highlightsWidget.setMiniApps(miniAppsSnapshot);
    subscriptionWidget.setMiniApps(miniAppsSnapshot);
    productPackagesWidget.setMiniApps(miniAppsSnapshot);
  } catch (error) {
    console.error('Não foi possível carregar mini-apps iniciais para o painel administrativo.', error);
    highlightsWidget.setMiniApps([]);
    subscriptionWidget.setMiniApps([]);
    productPackagesWidget.setMiniApps([]);
  }
}
