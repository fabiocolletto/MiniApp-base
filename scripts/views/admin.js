import eventBus from '../events/event-bus.js';
import { subscribeUsers, updateUser, getUsers } from '../data/user-store.js';
import {
  filterUsersByQuery,
  sortUsersForAdmin,
  createAdminSummary,
} from './shared/admin-data.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';
import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view view--admin admin-dashboard';

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function createUserAction({ label, description, view }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-dashboard__user-action';

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-action-label';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'admin-dashboard__user-action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  button.addEventListener('click', () => navigateTo(view));

  return button;
}

function createUserStat({ label, value }) {
  const item = document.createElement('li');
  item.className = 'admin-dashboard__user-stat';

  const valueElement = document.createElement('span');
  valueElement.className = 'admin-dashboard__user-stat-value';
  valueElement.textContent = value;

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-stat-label';
  labelElement.textContent = label;

  item.append(valueElement, labelElement);

  return item;
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dateTimeFormatter.format(value);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return dateTimeFormatter.format(parsed);
  }

  return '—';
}

function createNestedUpdate(path, value) {
  if (!Array.isArray(path) || path.length === 0) {
    return {};
  }

  const [head, ...rest] = path;
  if (rest.length === 0) {
    return { [head]: value };
  }

  return { [head]: createNestedUpdate(rest, value) };
}

function getValueByPath(source, path) {
  if (!Array.isArray(path) || path.length === 0) {
    return undefined;
  }

  return path.reduce((accumulator, key) => {
    if (!accumulator || typeof accumulator !== 'object') {
      return undefined;
    }

    return accumulator[key];
  }, source);
}

function createFeedbackElement(baseClass) {
  const feedback = document.createElement('p');
  feedback.className = `${baseClass} admin-user-details__feedback`;
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;
  return feedback;
}

function isHtmlElement(node) {
  return typeof HTMLElement === 'function' && node instanceof HTMLElement;
}

function updateFeedback(feedback, message, state) {
  if (!isHtmlElement(feedback)) {
    return;
  }

  if (!message) {
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.dataset.state = '';
    return;
  }

  feedback.hidden = false;
  feedback.textContent = message;
  if (state) {
    feedback.dataset.state = state;
  } else {
    delete feedback.dataset.state;
  }
}

function createAdminUserAutosave(updateUserFn) {
  if (typeof updateUserFn !== 'function') {
    throw new Error('A função de atualização de usuários é obrigatória.');
  }

  return async function persistUserUpdates(
    userId,
    updates,
    { feedback, busyTargets = [], onFeedback } = {}
  ) {
    if (userId == null) {
      return { status: 'no-user' };
    }

    const hasUpdates = updates && typeof updates === 'object' && Object.keys(updates).length > 0;
    if (!hasUpdates) {
      return { status: 'no-changes' };
    }

    const elements = Array.isArray(busyTargets) ? busyTargets.filter(Boolean) : [];
    const disabledSnapshot = new WeakMap();

    const toggleBusyState = (isBusy) => {
      elements.forEach((element) => {
        if (!element || typeof element !== 'object') {
          return;
        }

        if ('disabled' in element) {
          if (isBusy) {
            disabledSnapshot.set(element, Boolean(element.disabled));
            element.disabled = true;
          } else if (disabledSnapshot.has(element)) {
            element.disabled = Boolean(disabledSnapshot.get(element));
          } else {
            element.disabled = false;
          }
        }

        if (isHtmlElement(element)) {
          if (isBusy) {
            element.setAttribute('aria-busy', 'true');
          } else {
            element.removeAttribute('aria-busy');
          }
        }
      });

      if (!isBusy) {
        elements.forEach((element) => disabledSnapshot.delete(element));
      }
    };

    const savingMessage = 'Salvando alterações…';
    if (isHtmlElement(feedback)) {
      updateFeedback(feedback, savingMessage, 'saving');
    }
    if (typeof onFeedback === 'function') {
      onFeedback({ message: savingMessage, state: 'saving' });
    }

    toggleBusyState(true);

    try {
      const result = await updateUserFn(userId, updates);
      const successMessage = 'Dados atualizados automaticamente.';
      if (isHtmlElement(feedback)) {
        updateFeedback(feedback, successMessage, 'success');
      }
      if (typeof onFeedback === 'function') {
        onFeedback({ message: successMessage, state: 'success' });
      }
      return { status: 'success', result };
    } catch (error) {
      console.error('Erro ao atualizar cadastro pelo painel administrativo.', error);
      const errorMessage = 'Não foi possível atualizar os dados. Tente novamente.';
      if (isHtmlElement(feedback)) {
        updateFeedback(feedback, errorMessage, 'error');
      }
      if (typeof onFeedback === 'function') {
        onFeedback({ message: errorMessage, state: 'error' });
      }
      return { status: 'error', error };
    } finally {
      toggleBusyState(false);
    }
  };
}

const USER_TYPE_LABELS = {
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuário',
};

const USER_TYPE_OPTIONS = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'administrador', label: 'Administradores' },
  { value: 'colaborador', label: 'Colaboradores' },
  { value: 'usuario', label: 'Usuários' },
];

const SORT_OPTIONS = [
  { value: 'createdAtDesc', label: 'Mais recentes primeiro' },
  { value: 'createdAtAsc', label: 'Mais antigos primeiro' },
  { value: 'updatedAtDesc', label: 'Atualizados recentemente' },
  { value: 'updatedAtAsc', label: 'Atualizados há mais tempo' },
  { value: 'nameAsc', label: 'Nome (A–Z)' },
  { value: 'nameDesc', label: 'Nome (Z–A)' },
];

const PROFILE_FIELD_LABELS = {
  email: 'E-mail principal',
  secondaryPhone: 'Telefone secundário',
  document: 'Documento',
  address: 'Endereço',
  addressNumber: 'Número',
  addressComplement: 'Complemento',
  addressDistrict: 'Bairro',
  addressCity: 'Cidade',
  addressState: 'Estado',
  addressZip: 'CEP',
  addressCountry: 'País',
  website: 'Website',
  socialLinkedin: 'LinkedIn',
  socialInstagram: 'Instagram',
  socialFacebook: 'Facebook',
  socialTwitter: 'Twitter / X',
  socialYoutube: 'YouTube',
  birthDate: 'Data de nascimento',
  pronouns: 'Pronomes',
  profession: 'Profissão',
  company: 'Empresa',
  bio: 'Biografia',
  notes: 'Anotações internas',
};

const PROFILE_TEXTAREA_FIELDS = new Set(['bio', 'notes']);

const PROFILE_FIELDS = [
  'email',
  'secondaryPhone',
  'document',
  'address',
  'addressNumber',
  'addressComplement',
  'addressDistrict',
  'addressCity',
  'addressState',
  'addressZip',
  'addressCountry',
  'website',
  'socialLinkedin',
  'socialInstagram',
  'socialFacebook',
  'socialTwitter',
  'socialYoutube',
  'birthDate',
  'pronouns',
  'profession',
  'company',
  'bio',
  'notes',
];

const PREFERENCE_OPTIONS = [
  { value: 'system', label: 'Automático (sistema)' },
  { value: 'light', label: 'Tema claro' },
  { value: 'dark', label: 'Tema escuro' },
];

const PRIMARY_FIELD_LABELS = {
  name: 'Nome completo',
  phone: 'Telefone de acesso',
  password: 'Senha de acesso',
  device: 'Dispositivo reconhecido',
};

export function renderAdmin(viewRoot) {
  if (!isHtmlElement(viewRoot)) {
    return;
  }

  const cleanupCallbacks = [];
  const scheduledHandles = new Map();
  const autosave = createAdminUserAutosave(updateUser);
  const usersById = new Map();
  const feedbackStateByUser = new Map();
  const feedbackElementsByUser = new Map();
  let tableCleanupCallbacks = [];

  let expandedUserId = null;
  let queryValue = '';
  let typeFilterValue = 'all';
  let sortValue = 'createdAtDesc';
  let allUsers = [];

  function syncUsers(nextUsers) {
    allUsers = Array.isArray(nextUsers) ? nextUsers.slice() : [];
    usersById.clear();
    allUsers.forEach((user) => {
      usersById.set(user.id, user);
    });
  }

  function runTableCleanup() {
    tableCleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao limpar listeners da tabela administrativa.', error);
      }
    });
    tableCleanupCallbacks = [];
  }

  function formatUserTypeLabel(type) {
    return USER_TYPE_LABELS[type] ?? 'Usuário';
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title admin-dashboard__title';
  heading.textContent = 'Painel administrativo';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro admin-dashboard__intro';
  intro.textContent =
    'Gerencie a base de usuários cadastrados, acompanhe indicadores prioritários e mantenha os dados alinhados ao painel do usuário.';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout';

  const managementWidget = document.createElement('section');
  managementWidget.className =
    'user-panel__widget admin-dashboard__widget admin-dashboard__widget--user-management';

  const managementTitle = document.createElement('h2');
  managementTitle.className = 'user-widget__title';
  managementTitle.textContent = 'Gestão de usuários cadastrados';

  const managementDescription = document.createElement('p');
  managementDescription.className = 'user-widget__description';
  managementDescription.textContent =
    'Visualize indicadores recentes, organize filas de revisão e acione atalhos para manter o cadastro atualizado.';

  const managementContent = document.createElement('div');
  managementContent.className = 'admin-dashboard__user-management';

  const summarySection = document.createElement('div');
  summarySection.className = 'admin-dashboard__user-summary';

  const summaryTitle = document.createElement('h3');
  summaryTitle.className = 'admin-dashboard__user-section-title';
  summaryTitle.textContent = 'Resumo de cadastros';

  const summaryDescription = document.createElement('p');
  summaryDescription.className = 'admin-dashboard__user-section-description';
  summaryDescription.textContent =
    'Indicadores sincronizados com o painel do usuário ajudam a priorizar revisões e manter a base consistente.';

  const statsList = document.createElement('ul');
  statsList.className = 'admin-dashboard__user-stats';

  [
    { label: 'Usuários ativos', value: '128' },
    { label: 'Perfis aguardando revisão', value: '12' },
    { label: 'Última sincronização', value: 'há 12 minutos' },
  ]
    .map(createUserStat)
    .forEach((item) => statsList.append(item));

  summarySection.append(summaryTitle, summaryDescription, statsList);

  const actionsSection = document.createElement('div');
  actionsSection.className = 'admin-dashboard__user-actions';

  const actionsTitle = document.createElement('h3');
  actionsTitle.className = 'admin-dashboard__user-section-title';
  actionsTitle.textContent = 'Ações de gestão';

  const actionsDescription = document.createElement('p');
  actionsDescription.className = 'admin-dashboard__user-section-description';
  actionsDescription.textContent =
    'Escolha uma ação rápida para atualizar cadastros, registrar novos usuários ou monitorar mudanças recentes.';

  const actionGrid = document.createElement('div');
  actionGrid.className = 'admin-dashboard__user-action-grid';

  [
    {
      label: 'Revisar cadastros completos',
      description: 'Abra o painel do usuário para atualizar dados e preferências em tempo real.',
      view: 'user',
    },
    {
      label: 'Cadastrar novo integrante',
      description: 'Direcione para o formulário de criação de contas e convites.',
      view: 'register',
    },
    {
      label: 'Monitorar atividades recentes',
      description: 'Consulte o registro de alterações para confirmar sincronizações e auditorias.',
      view: 'log',
    },
  ]
    .map(createUserAction)
    .forEach((button) => actionGrid.append(button));

  actionsSection.append(actionsTitle, actionsDescription, actionGrid);

  managementContent.append(summarySection, actionsSection);
  managementWidget.append(managementTitle, managementDescription, managementContent);

  const usersWidget = document.createElement('section');
  usersWidget.className = 'user-panel__widget admin-user-section';

  const usersTitle = document.createElement('h2');
  usersTitle.className = 'user-widget__title';
  usersTitle.textContent = 'Cadastros detalhados';

  const usersDescription = document.createElement('p');
  usersDescription.className = 'user-widget__description';
  usersDescription.textContent =
    'Filtre a lista completa de usuários, expanda os detalhes e edite os dados sem sair do painel.';

  const toolbar = document.createElement('form');
  toolbar.className = 'admin-user-toolbar';
  toolbar.noValidate = true;
  toolbar.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  const toolbarControls = document.createElement('div');
  toolbarControls.className = 'admin-user-toolbar__controls';

  const searchField = document.createElement('label');
  searchField.className = 'admin-user-toolbar__field admin-user-toolbar__field--search';

  const searchLabel = document.createElement('span');
  searchLabel.className = 'admin-user-toolbar__label';
  searchLabel.textContent = 'Buscar';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'admin-user-toolbar__input admin-user-toolbar__search';
  searchInput.placeholder = 'Nome, telefone, e-mail ou documento';
  searchInput.autocomplete = 'off';
  searchInput.inputMode = 'search';

  searchField.append(searchLabel, searchInput);
  searchInput.value = queryValue;

  const typeField = document.createElement('label');
  typeField.className = 'admin-user-toolbar__field';

  const typeLabel = document.createElement('span');
  typeLabel.className = 'admin-user-toolbar__label';
  typeLabel.textContent = 'Tipo';

  const typeSelect = document.createElement('select');
  typeSelect.className = 'admin-user-toolbar__select';
  typeSelect.name = 'admin-user-filter-type';
  typeSelect.id = 'admin-user-filter-type';

  USER_TYPE_OPTIONS.forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    typeSelect.append(optionElement);
  });
  typeSelect.value = typeFilterValue;

  typeField.append(typeLabel, typeSelect);

  const sortField = document.createElement('label');
  sortField.className = 'admin-user-toolbar__field';

  const sortLabel = document.createElement('span');
  sortLabel.className = 'admin-user-toolbar__label';
  sortLabel.textContent = 'Ordenação';

  const sortSelect = document.createElement('select');
  sortSelect.className = 'admin-user-toolbar__select';
  sortSelect.name = 'admin-user-sort';
  sortSelect.id = 'admin-user-sort';

  SORT_OPTIONS.forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    sortSelect.append(optionElement);
  });

  sortField.append(sortLabel, sortSelect);
  sortSelect.value = sortValue;

  toolbarControls.append(searchField, typeField, sortField);

  const toolbarSummary = document.createElement('p');
  toolbarSummary.className = 'admin-user-toolbar__summary';
  toolbarSummary.textContent = 'Carregando cadastros…';

  toolbar.append(toolbarControls, toolbarSummary);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'admin-user-table-container';

  const table = document.createElement('table');
  table.className = 'admin-user-table';

  const tableHead = document.createElement('thead');
  tableHead.className = 'admin-user-table__head';

  const headRow = document.createElement('tr');
  headRow.className = 'admin-user-table__head-row';

  [
    'Nome',
    'Telefone',
    'Tipo',
    'Criado em',
    'Atualizado em',
    'Ações',
  ].forEach((label) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = 'admin-user-table__head-cell';
    cell.textContent = label;
    headRow.append(cell);
  });

  tableHead.append(headRow);

  const tableBody = document.createElement('tbody');
  tableBody.className = 'admin-user-table__body';
  table.append(tableHead, tableBody);

  tableContainer.append(table);

  usersWidget.append(usersTitle, usersDescription, toolbar, tableContainer);

  function buildEmptyRow() {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'admin-user-table__empty-row';

    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'admin-user-table__empty-cell';
    cell.textContent = queryValue
      ? 'Nenhum usuário encontrado com os filtros atuais.'
      : 'Nenhum usuário cadastrado até o momento.';

    emptyRow.append(cell);
    return emptyRow;
  }

  function attachFieldAutosave(user, element, path, { eventName = 'input', transform = (value) => value, feedback } = {}) {
    if (!element || typeof element.addEventListener !== 'function') {
      return;
    }

    const listener = () => {
      const rawValue = 'value' in element ? element.value : element.textContent;
      const nextValue = transform(rawValue);
      const previousTimeout = scheduledHandles.get(element);
      if (previousTimeout) {
        clearTimeout(previousTimeout);
      }

      const timeoutId = setTimeout(() => {
        scheduledHandles.delete(element);
        const latestUser = usersById.get(user.id);
        const currentValue = getValueByPath(latestUser, path);
        const normalizedCurrent = currentValue == null ? '' : String(currentValue);
        const normalizedNext = nextValue == null ? '' : String(nextValue);

        if (normalizedCurrent === normalizedNext) {
          return;
        }

        const updates = createNestedUpdate(path, nextValue);
        const persistPromise = autosave(user.id, updates, {
          feedback,
          busyTargets: [element],
          onFeedback: (nextState) => {
            if (!nextState || typeof nextState.message !== 'string' || !nextState.message) {
              feedbackStateByUser.delete(user.id);
              const liveFeedback = feedbackElementsByUser.get(user.id);
              if (liveFeedback) {
                updateFeedback(liveFeedback, '', '');
              }
              return;
            }

            const snapshot = {
              message: nextState.message,
              state: nextState.state,
            };
            feedbackStateByUser.set(user.id, snapshot);

            const liveFeedback = feedbackElementsByUser.get(user.id);
            if (liveFeedback) {
              updateFeedback(liveFeedback, snapshot.message, snapshot.state);
            }
          },
        });

        if (persistPromise && typeof persistPromise.catch === 'function') {
          persistPromise.catch(() => {
            // Falhas já são tratadas no autosave; manter estado atual.
          });
        }
      }, 420);

      scheduledHandles.set(element, timeoutId);
    };

    element.addEventListener(eventName, listener);
    const cleanup = () => {
      element.removeEventListener(eventName, listener);
      const pending = scheduledHandles.get(element);
      if (pending) {
        clearTimeout(pending);
        scheduledHandles.delete(element);
      }
    };

    tableCleanupCallbacks.push(cleanup);
  }

  function createGroup(title) {
    const section = document.createElement('section');
    section.className = 'admin-user-details__group';

    const groupTitle = document.createElement('h4');
    groupTitle.className = 'admin-user-details__group-title';
    groupTitle.textContent = title;

    const grid = document.createElement('div');
    grid.className = 'admin-user-details__grid';

    section.append(groupTitle, grid);
    return { section, grid };
  }

  function createUserRows(user) {
    const isExpanded = expandedUserId === user.id;

    const row = document.createElement('tr');
    row.className = 'admin-user-table__row';
    row.dataset.state = isExpanded ? 'expanded' : 'collapsed';

    const nameCell = document.createElement('td');
    nameCell.className = 'admin-user-table__cell admin-user-table__cell--name';
    nameCell.textContent = user?.name ? user.name : 'Usuário sem nome';

    const phoneCell = document.createElement('td');
    phoneCell.className = 'admin-user-table__cell admin-user-table__cell--phone';
    phoneCell.textContent = user?.phone ? user.phone : '—';

    const typeCell = document.createElement('td');
    typeCell.className = 'admin-user-table__cell';
    typeCell.textContent = formatUserTypeLabel(user?.userType);

    const createdCell = document.createElement('td');
    createdCell.className = 'admin-user-table__cell';
    createdCell.textContent = formatDateTime(user?.createdAt);

    const updatedCell = document.createElement('td');
    updatedCell.className = 'admin-user-table__cell';
    updatedCell.textContent = formatDateTime(user?.updatedAt);

    const actionCell = document.createElement('td');
    actionCell.className = 'admin-user-table__cell admin-user-table__cell--actions';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'admin-user-table__toggle';
    toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    const userLabel = user?.name ? user.name : 'usuário sem nome';
    toggleButton.setAttribute(
      'aria-label',
      isExpanded
        ? `Recolher dados de ${userLabel}`
        : `Expandir dados de ${userLabel}`,
    );

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'admin-user-table__toggle-icon';
    toggleButton.append(toggleIcon);

    const handleToggle = () => {
      expandedUserId = isExpanded ? null : user.id;
      renderUsers();
    };

    toggleButton.addEventListener('click', handleToggle);
    tableCleanupCallbacks.push(() => {
      toggleButton.removeEventListener('click', handleToggle);
    });

    actionCell.append(toggleButton);

    row.append(nameCell, phoneCell, typeCell, createdCell, updatedCell, actionCell);

    const detailsRow = document.createElement('tr');
    detailsRow.className = 'admin-user-table__details-row';
    detailsRow.hidden = !isExpanded;

    const detailsCell = document.createElement('td');
    detailsCell.colSpan = 6;
    detailsCell.className = 'admin-user-table__details-cell';

    const details = document.createElement('div');
    details.className = 'admin-user-details';

    const detailsHeader = document.createElement('header');
    detailsHeader.className = 'admin-user-details__header';

    const detailsTitle = document.createElement('h3');
    detailsTitle.className = 'admin-user-details__title';
    detailsTitle.textContent = user?.name ? user.name : 'Usuário sem nome';

    const detailsMeta = document.createElement('p');
    detailsMeta.className = 'admin-user-details__meta';
    const typeLabel = formatUserTypeLabel(user?.userType);
    const phoneLabel = user?.phone ? user.phone : 'sem telefone';
    detailsMeta.textContent = `${typeLabel} · ${phoneLabel}`;

    detailsHeader.append(detailsTitle, detailsMeta);

    const feedback = createFeedbackElement('admin-user-details__message');
    if (user?.id != null) {
      feedback.id = `admin-user-${user.id}-feedback`;
      feedback.dataset.userId = String(user.id);
    }
    const persistedFeedback = feedbackStateByUser.get(user?.id);
    if (persistedFeedback) {
      updateFeedback(feedback, persistedFeedback.message, persistedFeedback.state);
    }
    if (user?.id != null) {
      feedbackElementsByUser.set(user.id, feedback);
    }

    const primary = createGroup('Dados principais');

    const nameField = createInputField({
      id: `admin-user-${user.id}-name`,
      label: PRIMARY_FIELD_LABELS.name,
      type: 'text',
      placeholder: 'Nome completo',
    });
    const nameInput = nameField.querySelector('input');
    if (nameInput) {
      nameInput.value = user?.name ?? '';
      attachFieldAutosave(user, nameInput, ['name'], { feedback });
    }
    primary.grid.append(nameField);

    const phoneField = createInputField({
      id: `admin-user-${user.id}-phone`,
      label: PRIMARY_FIELD_LABELS.phone,
      type: 'tel',
      placeholder: '11999998888',
      autocomplete: 'tel',
      inputMode: 'tel',
    });
    const phoneInput = phoneField.querySelector('input');
    if (phoneInput) {
      phoneInput.value = user?.phone ?? '';
      attachFieldAutosave(user, phoneInput, ['phone'], { feedback });
    }
    primary.grid.append(phoneField);

    const passwordField = createInputField({
      id: `admin-user-${user.id}-password`,
      label: PRIMARY_FIELD_LABELS.password,
      type: 'text',
      placeholder: 'Senha temporária',
      autocomplete: 'off',
      required: false,
    });
    const passwordInput = passwordField.querySelector('input');
    if (passwordInput) {
      passwordInput.value = user?.password ?? '';
      attachFieldAutosave(user, passwordInput, ['password'], { feedback });
    }
    primary.grid.append(passwordField);

    const deviceField = createInputField({
      id: `admin-user-${user.id}-device`,
      label: PRIMARY_FIELD_LABELS.device,
      type: 'text',
      placeholder: 'Dispositivo reconhecido',
      required: false,
    });
    const deviceInput = deviceField.querySelector('input');
    if (deviceInput) {
      deviceInput.value = user?.device ?? '';
      attachFieldAutosave(user, deviceInput, ['device'], { feedback });
    }
    primary.grid.append(deviceField);

    const userTypeField = document.createElement('label');
    userTypeField.className = 'user-form__field admin-user-details__select-field';
    userTypeField.setAttribute('for', `admin-user-${user.id}-type`);

    const userTypeLabel = document.createElement('span');
    userTypeLabel.className = 'user-form__label';
    userTypeLabel.textContent = 'Tipo de usuário';

    const userTypeSelect = document.createElement('select');
    userTypeSelect.id = `admin-user-${user.id}-type`;
    userTypeSelect.name = userTypeSelect.id;
    userTypeSelect.className = 'admin-user-details__select';

    USER_TYPE_OPTIONS.filter((option) => option.value !== 'all').forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      userTypeSelect.append(optionElement);
    });

    userTypeSelect.value = user?.userType ?? 'usuario';
    userTypeField.append(userTypeLabel, userTypeSelect);
    primary.grid.append(userTypeField);

    attachFieldAutosave(user, userTypeSelect, ['userType'], {
      eventName: 'change',
      feedback,
      transform: (value) => value,
    });

    const profile = createGroup('Perfil completo');

    PROFILE_FIELDS.forEach((field) => {
      const fieldId = `admin-user-${user.id}-profile-${field}`;
      const label = PROFILE_FIELD_LABELS[field] ?? field;
      const isTextarea = PROFILE_TEXTAREA_FIELDS.has(field);

      if (isTextarea) {
        const textareaField = createTextareaField({
          id: fieldId,
          label,
          rows: field === 'bio' ? 4 : 3,
          placeholder: label,
        });
        const textarea = textareaField.querySelector('textarea');
        if (textarea) {
          textarea.value = user?.profile?.[field] ?? '';
          attachFieldAutosave(user, textarea, ['profile', field], { feedback });
        }
        profile.grid.append(textareaField);
        return;
      }

      const profileField = createInputField({
        id: fieldId,
        label,
        type: field === 'birthDate' ? 'date' : 'text',
        placeholder: label,
        required: false,
      });
      const input = profileField.querySelector('input');
      if (input) {
        input.value = user?.profile?.[field] ?? '';
        attachFieldAutosave(user, input, ['profile', field], { feedback });
      }
      profile.grid.append(profileField);
    });

    const preferences = createGroup('Preferências');

    const themeField = document.createElement('label');
    themeField.className = 'user-form__field admin-user-details__select-field';
    themeField.setAttribute('for', `admin-user-${user.id}-preferences-theme`);

    const themeLabel = document.createElement('span');
    themeLabel.className = 'user-form__label';
    themeLabel.textContent = 'Tema preferido';

    const themeSelect = document.createElement('select');
    themeSelect.id = `admin-user-${user.id}-preferences-theme`;
    themeSelect.name = themeSelect.id;
    themeSelect.className = 'admin-user-details__select';

    PREFERENCE_OPTIONS.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      themeSelect.append(optionElement);
    });

    themeSelect.value = user?.preferences?.theme ?? 'system';

    themeField.append(themeLabel, themeSelect);
    preferences.grid.append(themeField);

    attachFieldAutosave(user, themeSelect, ['preferences', 'theme'], {
      eventName: 'change',
      feedback,
      transform: (value) => value,
    });

    details.append(detailsHeader, feedback, primary.section, profile.section, preferences.section);
    detailsCell.append(details);
    detailsRow.append(detailsCell);

    return [row, detailsRow];
  }

  function getVisibleUsers() {
    const baseList = filterUsersByQuery(allUsers, queryValue, {
      alwaysIncludeId: expandedUserId != null ? expandedUserId : undefined,
    });

    let typeFiltered =
      typeFilterValue === 'all'
        ? baseList.slice()
        : baseList.filter((user) => user?.userType === typeFilterValue);

    if (expandedUserId != null) {
      const preservedUser = baseList.find((user) => user?.id === expandedUserId);
      if (preservedUser && !typeFiltered.some((user) => user?.id === expandedUserId)) {
        typeFiltered.push(preservedUser);
      }
    }

    return sortUsersForAdmin(typeFiltered, sortValue);
  }

  function renderUsers() {
    runTableCleanup();
    feedbackElementsByUser.clear();
    const visibleUsers = getVisibleUsers();
    toolbarSummary.textContent = createAdminSummary(allUsers.length, visibleUsers.length, queryValue);

    if (!visibleUsers.length) {
      tableBody.replaceChildren(buildEmptyRow());
      return;
    }

    const rows = visibleUsers.flatMap((user) => createUserRows(user));
    tableBody.replaceChildren(...rows);
  }

  const handleSearchInput = (event) => {
    queryValue = event.target?.value ?? '';
    renderUsers();
  };

  const handleTypeChange = (event) => {
    const value = event.target?.value ?? 'all';
    typeFilterValue = value || 'all';
    renderUsers();
  };

  const handleSortChange = (event) => {
    const value = event.target?.value ?? 'createdAtDesc';
    sortValue = value || 'createdAtDesc';
    renderUsers();
  };

  searchInput.addEventListener('input', handleSearchInput);
  typeSelect.addEventListener('change', handleTypeChange);
  sortSelect.addEventListener('change', handleSortChange);

  cleanupCallbacks.push(() => {
    searchInput.removeEventListener('input', handleSearchInput);
    typeSelect.removeEventListener('change', handleTypeChange);
    sortSelect.removeEventListener('change', handleSortChange);
  });

  cleanupCallbacks.push(() => {
    scheduledHandles.forEach((timeoutId) => clearTimeout(timeoutId));
    scheduledHandles.clear();
  });

  cleanupCallbacks.push(() => {
    runTableCleanup();
  });

  layout.append(managementWidget, usersWidget);

  syncUsers(getUsers());
  renderUsers();

  const unsubscribe = subscribeUsers((nextUsers) => {
    syncUsers(nextUsers);
    renderUsers();
  });

  cleanupCallbacks.push(() => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  registerViewCleanup(viewRoot, () => {
    cleanupCallbacks.splice(0).forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao limpar a view administrativa.', error);
      }
    });
  });

  viewRoot.replaceChildren(heading, intro, layout);
}
