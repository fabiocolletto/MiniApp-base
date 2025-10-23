const USER_TYPE_LABELS = {
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuário',
};

const THEME_LABELS = {
  dark: 'Tema escuro',
  light: 'Tema claro',
  system: 'Automático (sistema)',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateTime(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dateTimeFormatter.format(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return dateTimeFormatter.format(date);
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return dateTimeFormatter.format(parsed);
    }
  }

  return '—';
}

export function formatUserType(type) {
  const normalized = String(type ?? '')
    .trim()
    .toLowerCase();
  return USER_TYPE_LABELS[normalized] ?? USER_TYPE_LABELS.usuario;
}

export function formatThemePreference(theme) {
  const normalized = String(theme ?? '')
    .trim()
    .toLowerCase();

  if (normalized && THEME_LABELS[normalized]) {
    return THEME_LABELS[normalized];
  }

  return 'Não informado';
}

export function normalizeSystemUser(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  if (user.id == null) {
    return null;
  }

  const id = String(user.id);
  const name = typeof user.name === 'string' && user.name.trim() ? user.name.trim() : 'Usuário sem nome';
  const phone = typeof user.phone === 'string' ? user.phone.trim() : '';
  const userType = typeof user.userType === 'string' ? user.userType.trim().toLowerCase() : 'usuario';
  const device = typeof user.device === 'string' ? user.device.trim() : '';

  const profileEmail = typeof user?.profile?.email === 'string' ? user.profile.email.trim() : '';
  const profileDocument = typeof user?.profile?.document === 'string' ? user.profile.document.trim() : '';
  const profileCity = typeof user?.profile?.addressCity === 'string' ? user.profile.addressCity.trim() : '';
  const profileState = typeof user?.profile?.addressState === 'string' ? user.profile.addressState.trim() : '';

  const preferencesTheme = user?.preferences?.theme;

  return {
    id,
    name,
    phone,
    userType,
    device,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: {
      email: profileEmail,
      document: profileDocument,
      city: profileCity,
      state: profileState,
    },
    preferences: {
      theme: preferencesTheme,
    },
  };
}

export function createDefinitionItem(term, value) {
  const item = document.createElement('div');
  item.className = 'user-dashboard__summary-item';

  const termElement = document.createElement('dt');
  termElement.className = 'user-dashboard__summary-label';
  termElement.textContent = term;

  const valueElement = document.createElement('dd');
  valueElement.className = 'user-dashboard__summary-value';
  valueElement.textContent = value;

  item.append(termElement, valueElement);
  return item;
}

const DEFAULT_WIDGET_CLASSES = [
  'surface-card',
  'user-panel__widget',
  'admin-dashboard__widget',
  'admin-dashboard__widget--users',
];

const DEFAULT_COLUMNS = [
  { label: 'Nome', className: 'admin-user-table__head-cell admin-user-table__head-cell--name' },
  { label: 'Telefone', className: 'admin-user-table__head-cell' },
  { label: 'Tipo', className: 'admin-user-table__head-cell' },
  { label: 'Atualizado em', className: 'admin-user-table__head-cell' },
  {
    label: 'Ações',
    className: 'admin-user-table__head-cell admin-user-table__head-cell--actions',
  },
];

function createDefaultDetails(user) {
  const detailsPanel = document.createElement('div');
  detailsPanel.className = 'admin-user-table__details-panel user-dashboard__summary';

  const detailsIntro = document.createElement('p');
  detailsIntro.className = 'admin-user-table__details-intro';
  detailsIntro.textContent = 'Resumo sincronizado com o painel do usuário.';

  const detailsList = document.createElement('dl');
  detailsList.className = 'user-dashboard__summary-list';

  const cityState = [user.profile.city, user.profile.state].filter(Boolean).join(' · ');

  [
    ['E-mail principal', user.profile.email || '—'],
    ['Documento', user.profile.document || '—'],
    ['Localização', cityState || '—'],
    ['Dispositivo reconhecido', user.device || '—'],
    ['Preferência de tema', formatThemePreference(user.preferences.theme)],
    ['Criado em', formatDateTime(user.createdAt)],
    ['Atualizado em', formatDateTime(user.updatedAt)],
  ]
    .map(([term, value]) => createDefinitionItem(term, value))
    .forEach((item) => {
      detailsList.append(item);
    });

  detailsPanel.append(detailsIntro, detailsList);
  return detailsPanel;
}

function dispatchToggleEvent(target, detail) {
  const event = new CustomEvent('system-users-widget:toggle', {
    bubbles: true,
    cancelable: false,
    detail,
  });
  target.dispatchEvent(event);
}

export function createSystemUsersWidget({
  title = 'Gestão de usuários do sistema',
  description =
    'Visualize todos os cadastros já sincronizados e expanda para consultar dados principais e preferências salvas.',
  emptyStateMessage = 'Nenhum usuário cadastrado até o momento.',
  extraClasses = [],
  columns = DEFAULT_COLUMNS,
  renderDetails = (user) => createDefaultDetails(user),
} = {}) {
  let users = [];
  let expandedUserId = null;

  const widget = document.createElement('section');
  const classList = [...new Set([...DEFAULT_WIDGET_CLASSES, ...extraClasses.filter(Boolean)])];
  widget.className = classList.join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = description;

  const tableContainer = document.createElement('div');
  tableContainer.className = 'admin-user-table-container';

  const table = document.createElement('table');
  table.className = 'admin-user-table';

  const thead = document.createElement('thead');
  thead.className = 'admin-user-table__head';

  const headRow = document.createElement('tr');
  columns.forEach((column) => {
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

  widget.append(titleElement, descriptionElement, tableContainer);

  const notifyToggle = (userId, expanded, { source = 'user' } = {}) => {
    const user = users.find((entry) => entry.id === userId) ?? null;
    dispatchToggleEvent(widget, {
      user,
      expanded,
      source,
    });
  };

  const renderRows = () => {
    tbody.replaceChildren();

    if (users.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'admin-user-table__empty-row';

      const emptyCell = document.createElement('td');
      emptyCell.colSpan = columns.length;
      emptyCell.className = 'admin-user-table__empty-cell';
      emptyCell.textContent = emptyStateMessage;

      emptyRow.append(emptyCell);
      tbody.append(emptyRow);
      return;
    }

    users.forEach((user) => {
      const isExpanded = expandedUserId === user.id;

      const row = document.createElement('tr');
      row.className = 'admin-user-table__row';
      row.dataset.state = isExpanded ? 'expanded' : 'collapsed';
      row.dataset.userId = user.id;

      const nameCell = document.createElement('td');
      nameCell.className = 'admin-user-table__cell admin-user-table__cell--name';
      nameCell.textContent = user.name;

      const phoneCell = document.createElement('td');
      phoneCell.className = 'admin-user-table__cell admin-user-table__cell--phone';
      phoneCell.textContent = user.phone || '—';

      const typeCell = document.createElement('td');
      typeCell.className = 'admin-user-table__cell admin-user-table__cell--type';
      typeCell.textContent = formatUserType(user.userType);

      const updatedCell = document.createElement('td');
      updatedCell.className = 'admin-user-table__cell';
      updatedCell.textContent = formatDateTime(user.updatedAt);

      const actionCell = document.createElement('td');
      actionCell.className = 'admin-user-table__cell admin-user-table__cell--actions';

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'button panel-action-tile panel-action-tile--icon admin-user-table__toggle';
      toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      toggleButton.setAttribute(
        'aria-label',
        isExpanded ? `Recolher dados de ${user.name}` : `Expandir dados de ${user.name}`,
      );

      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'admin-user-table__toggle-icon';
      toggleButton.append(toggleIcon);

      toggleButton.addEventListener('click', () => {
        const willExpand = !isExpanded;
        expandedUserId = willExpand ? user.id : null;
        renderRows();
        notifyToggle(user.id, willExpand, { source: 'user' });
      });

      actionCell.append(toggleButton);

      row.append(nameCell, phoneCell, typeCell, updatedCell, actionCell);

      const detailsRow = document.createElement('tr');
      detailsRow.className = 'admin-user-table__details-row';
      detailsRow.dataset.userId = user.id;
      detailsRow.hidden = !isExpanded;

      const detailsCell = document.createElement('td');
      detailsCell.colSpan = columns.length;
      detailsCell.className = 'admin-user-table__details-cell';

      const detailsContent = renderDetails(user);
      if (detailsContent instanceof HTMLElement) {
        detailsCell.append(detailsContent);
      }

      detailsRow.append(detailsCell);

      tbody.append(row, detailsRow);
    });
  };

  const setUsers = (nextUsers) => {
    if (!Array.isArray(nextUsers)) {
      users = [];
      if (expandedUserId) {
        const previousId = expandedUserId;
        expandedUserId = null;
        notifyToggle(previousId, false, { source: 'setUsers' });
      }
      renderRows();
      return;
    }

    const normalized = nextUsers
      .map((user) => normalizeSystemUser(user))
      .filter((user) => user !== null)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

    users = normalized;

    if (expandedUserId && !users.some((user) => user.id === expandedUserId)) {
      const previousId = expandedUserId;
      expandedUserId = null;
      notifyToggle(previousId, false, { source: 'setUsers' });
    }

    renderRows();
  };

  const setExpandedUser = (userId, shouldExpand, { notify = true } = {}) => {
    const normalizedId = typeof userId === 'string' ? userId : userId == null ? null : String(userId);
    const hasUser = normalizedId && users.some((user) => user.id === normalizedId);

    const targetExpanded = Boolean(shouldExpand && hasUser);

    if (targetExpanded) {
      if (expandedUserId === normalizedId) {
        return;
      }
      expandedUserId = normalizedId;
    } else {
      if (expandedUserId === null) {
        return;
      }
      const previousId = expandedUserId;
      expandedUserId = null;
      renderRows();
      if (notify && previousId) {
        notifyToggle(previousId, false, { source: 'api' });
      }
      return;
    }

    renderRows();
    if (notify && normalizedId) {
      notifyToggle(normalizedId, true, { source: 'api' });
    }
  };

  const teardown = () => {
    users = [];
    expandedUserId = null;
    tbody.replaceChildren();
  };

  renderRows();

  return {
    widget,
    setUsers,
    setExpandedUser,
    getExpandedUserId: () => expandedUserId,
    teardown,
  };
}
