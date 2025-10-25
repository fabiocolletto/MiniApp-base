import {
  createSystemLogPanelLabelWidget,
  createSystemLogTitleWidget,
} from './shared/system-log-widgets.js';

const BASE_CLASSES = 'card view dashboard-view view--log log-panel';
const LOG_PATH = 'Log.md';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const DEPLOYED_PANELS = Object.freeze([
  Object.freeze({
    id: 'home',
    name: 'Início',
    version: 'v0.1.217',
    updatedAt: '2025-10-24T06:25:00-03:00',
  }),
  Object.freeze({
    id: 'user',
    name: 'Painel do usuário',
    version: 'v0.1.232',
    updatedAt: '2025-10-25T14:00:00-03:00',
  }),
  Object.freeze({
    id: 'admin',
    name: 'Painel administrativo',
    version: 'v0.1.226',
    updatedAt: '2025-10-25T00:44:00-03:00',
  }),
  Object.freeze({
    id: 'miniapps',
    name: 'MiniApps',
    version: 'v0.1.166',
    updatedAt: '2025-10-25T06:46:00-03:00',
  }),
  Object.freeze({
    id: 'tasks',
    name: 'Painel de tarefas',
    version: 'v0.1.234',
    updatedAt: '2025-10-25T15:03:00-03:00',
  }),
  Object.freeze({
    id: 'log',
    name: 'Painel do projeto',
    version: 'v0.1.234',
    updatedAt: '2025-10-25T15:03:00-03:00',
  }),
]);

const TEMPORARY_PROJECTS = Object.freeze([
  Object.freeze({
    id: 'version-panel',
    name: 'Painel de Versões Temporárias',
    version: null,
    updatedAt: '2025-10-25T08:54:00-03:00',
    previewUrl: 'temp/version-panel/index.html',
  }),
]);

export function renderLog(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'log';

  const layout = document.createElement('div');
  layout.className = 'log-panel__layout';

  const titleWidget = createSystemLogTitleWidget();
  const panelLabelWidget = createSystemLogPanelLabelWidget();
  const deploymentsWidget = createDeploymentsWidget();
  const temporaryProjectsWidget = createTemporaryProjectsWidget();
  const { widget: logWidget, content: logContent } = createLogContentWidget();

  viewRoot.setAttribute('aria-busy', 'true');
  viewRoot.setAttribute('aria-label', 'Histórico de versões do MiniApp Base');

  const widgets = [titleWidget, panelLabelWidget, deploymentsWidget];
  if (temporaryProjectsWidget) {
    widgets.push(temporaryProjectsWidget);
  }
  widgets.push(logWidget);

  layout.append(...widgets);
  viewRoot.replaceChildren(layout);

  (async () => {
    try {
      const response = await fetch(LOG_PATH, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`Falha ao carregar Log.md: ${response.status}`);
      }

      const text = await response.text();
      logContent.dataset.state = 'ready';
      logContent.textContent = text;
    } catch (error) {
      logContent.dataset.state = 'error';
      logContent.textContent =
        'Não foi possível carregar o Log.md no momento. Atualize a página ou tente novamente.';
      console.error(error);
    } finally {
      viewRoot.removeAttribute('aria-busy');
    }
  })();
}

function createLogContentWidget() {
  const widget = document.createElement('section');
  widget.className = ['surface-card', 'log-panel__widget', 'log-panel__widget--full'].join(' ');

  const logContent = document.createElement('pre');
  logContent.className = 'log-content';
  logContent.setAttribute('role', 'region');
  logContent.setAttribute('aria-live', 'polite');
  logContent.setAttribute('aria-label', 'Histórico de versões do projeto');
  logContent.setAttribute('tabindex', '0');
  logContent.dataset.state = 'loading';
  logContent.textContent = 'Carregando histórico do projeto…';

  widget.append(logContent);
  return { widget, content: logContent };
}

function createDeploymentsWidget() {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'log-panel__widget',
    'log-panel__widget--deployments',
  ].join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = 'Painéis implantados';

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent =
    'Lista com a versão comunicada e a data da última atualização dos painéis ativos no projeto.';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'log-panel__deployments-table-wrapper';

  const table = document.createElement('table');
  table.className = 'log-panel__deployments-table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Painéis implantados, versão atual e data da última atualização.';
  table.append(caption);

  const tableHead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  [
    { label: 'Painel', className: 'log-panel__deployments-header log-panel__deployments-header--panel' },
    { label: 'Versão', className: 'log-panel__deployments-header log-panel__deployments-header--version' },
    {
      label: 'Última atualização',
      className: 'log-panel__deployments-header log-panel__deployments-header--updated',
    },
  ].forEach(({ label, className }) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = className;
    cell.textContent = label;
    headerRow.append(cell);
  });

  tableHead.append(headerRow);
  table.append(tableHead);

  const tableBody = document.createElement('tbody');

  DEPLOYED_PANELS.forEach((panel) => {
    const row = document.createElement('tr');
    row.className = 'log-panel__deployments-row';

    const nameCell = document.createElement('td');
    nameCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--panel';
    nameCell.textContent = panel.name;

    const versionCell = document.createElement('td');
    versionCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--version';
    versionCell.textContent = formatVersion(panel.version);

    const updatedCell = document.createElement('td');
    updatedCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--updated';
    updatedCell.textContent = formatUpdatedAt(panel.updatedAt);

    row.append(nameCell, versionCell, updatedCell);
    tableBody.append(row);
  });

  table.append(tableBody);
  tableWrapper.append(table);
  widget.append(titleElement, descriptionElement, tableWrapper);

  return widget;
}

export function createTemporaryProjectsWidget({ projects = TEMPORARY_PROJECTS } = {}) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return null;
  }

  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'log-panel__widget',
    'log-panel__widget--deployments',
  ].join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = 'Projetos temporários';

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent =
    'Protótipos ativos na pasta temporária do projeto com acesso rápido às suas pré-visualizações.';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'log-panel__deployments-table-wrapper';

  const table = document.createElement('table');
  table.className = 'log-panel__deployments-table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent =
    'Projetos temporários ativos, suas versões comunicadas, datas de atualização e links de pré-visualização.';
  table.append(caption);

  const tableHead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  [
    { label: 'Projeto', className: 'log-panel__deployments-header log-panel__deployments-header--panel' },
    { label: 'Versão', className: 'log-panel__deployments-header log-panel__deployments-header--version' },
    {
      label: 'Última atualização',
      className: 'log-panel__deployments-header log-panel__deployments-header--updated',
    },
    {
      label: 'Pré-visualização',
      className: 'log-panel__deployments-header log-panel__deployments-header--preview',
    },
  ].forEach(({ label, className }) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = className;
    cell.textContent = label;
    headerRow.append(cell);
  });

  tableHead.append(headerRow);
  table.append(tableHead);

  const tableBody = document.createElement('tbody');

  projects.forEach((project) => {
    const row = document.createElement('tr');
    row.className = 'log-panel__deployments-row';

    const nameCell = document.createElement('td');
    nameCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--panel';
    nameCell.textContent = project.name;

    const versionCell = document.createElement('td');
    versionCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--version';
    versionCell.textContent = formatVersion(project.version);

    const updatedCell = document.createElement('td');
    updatedCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--updated';
    updatedCell.textContent = formatUpdatedAt(project.updatedAt);

    const previewCell = document.createElement('td');
    previewCell.className = 'log-panel__deployments-cell log-panel__deployments-cell--preview';

    if (typeof project.previewUrl === 'string' && project.previewUrl.trim() !== '') {
      const link = document.createElement('a');
      link.className = 'log-panel__deployments-link';
      link.href = project.previewUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Abrir';
      link.setAttribute('aria-label', `Abrir ${project.name} em uma nova aba`);
      previewCell.append(link);
    } else {
      previewCell.textContent = '—';
    }

    row.append(nameCell, versionCell, updatedCell, previewCell);
    tableBody.append(row);
  });

  table.append(tableBody);
  tableWrapper.append(table);
  widget.append(titleElement, descriptionElement, tableWrapper);

  return widget;
}

function formatUpdatedAt(value) {
  const date = normalizeDate(value);
  if (!date) {
    return '—';
  }

  return dateTimeFormatter.format(date);
}

function formatVersion(value) {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }

  return '—';
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const dateFromNumber = new Date(value);
    if (!Number.isNaN(dateFromNumber.getTime())) {
      return dateFromNumber;
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}
