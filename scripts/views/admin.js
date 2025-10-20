import { deleteUser, subscribeUsers, updateUser } from '../data/user-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { formatPhoneNumberForDisplay, validatePasswordStrength } from './shared/validation.js';
import {
  filterUsersByQuery,
  sortUsersForAdmin,
  createAdminSummary,
} from './shared/admin-data.js';

const BASE_CLASSES = 'card view view--admin';
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const USER_TYPE_OPTIONS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'usuario', label: 'Usuário' },
];

const USER_TYPE_LABELS = USER_TYPE_OPTIONS.reduce((accumulator, option) => {
  accumulator[option.value] = option.label;
  return accumulator;
}, {});

function normalizeUserType(value) {
  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (USER_TYPE_LABELS[normalized]) {
    return normalized;
  }

  if (normalized === 'admin' || normalized === 'administradora') {
    return 'administrador';
  }

  if (normalized === 'colaboradora') {
    return 'colaborador';
  }

  return 'usuario';
}

function formatUserType(value) {
  const normalized = normalizeUserType(value);
  return USER_TYPE_LABELS[normalized] || USER_TYPE_LABELS.usuario;
}

function createFormField({
  id,
  label,
  name,
  type = 'text',
  value = '',
  maxLength,
  disabled = false,
  attributes = {},
  options,
}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'admin-user-table__form-field';
  wrapper.htmlFor = id;

  const labelText = document.createElement('span');
  labelText.className = 'admin-user-table__form-label';
  labelText.textContent = label;

  const normalizedValue = String(value ?? '');
  let field;

  if (Array.isArray(options) && options.length > 0) {
    field = document.createElement('select');
    field.className = 'admin-user-table__input admin-user-table__select';
    field.id = id;
    field.name = name;

    let hasMatchingValue = false;
    let fallbackValue = '';

    options.forEach(({ value: optionValue, label: optionLabel }, index) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionLabel;
      if (index === 0) {
        fallbackValue = optionValue;
      }
      if (optionValue === normalizedValue) {
        option.selected = true;
        hasMatchingValue = true;
      }
      field.append(option);
    });

    if (!hasMatchingValue) {
      field.value = fallbackValue;
    }
  } else {
    field = document.createElement('input');
    field.className = 'admin-user-table__input';
    field.id = id;
    field.name = name;
    field.type = type;
    field.value = normalizedValue;

    if (typeof maxLength === 'number') {
      field.maxLength = maxLength;
    }
  }

  if (disabled) {
    field.disabled = true;
  }

  Object.entries(attributes).forEach(([attribute, attributeValue]) => {
    if (attributeValue != null) {
      field.setAttribute(attribute, attributeValue);
    }
  });

  wrapper.append(labelText, field);
  return wrapper;
}

function createDetailsRow(user, isExpanded, editingState) {
  const row = document.createElement('tr');
  row.className = 'admin-user-table__details-row';
  row.dataset.detailsFor = String(user.id);
  row.hidden = !isExpanded;

  const cell = document.createElement('td');
  cell.colSpan = 7;
  cell.className = 'admin-user-table__details-cell';
  cell.dataset.label = 'Detalhes do cliente';

  if (!isExpanded) {
    row.append(cell);
    return row;
  }

  const container = document.createElement('div');
  container.className = 'admin-user-table__details';

  const form = document.createElement('form');
  form.className = 'admin-user-table__form';
  form.dataset.userId = String(user.id);

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'admin-user-table__form-fieldset';

  const legend = document.createElement('legend');
  legend.className = 'admin-user-table__form-legend';
  legend.textContent = 'Editar dados principais';
  fieldset.append(legend);

  const isBusy = Boolean(editingState?.isSaving || editingState?.isDeleting);

  const nameField = createFormField({
    id: `admin-user-name-${user.id}`,
    label: 'Nome completo',
    name: 'admin-user-name',
    value: editingState?.name ?? user.name ?? '',
    maxLength: 120,
    disabled: isBusy,
    attributes: {
      autocomplete: 'name',
    },
  });

  const phoneField = createFormField({
    id: `admin-user-phone-${user.id}`,
    label: 'Telefone de contato',
    name: 'admin-user-phone',
    value: editingState?.phone ?? user.phone ?? '',
    maxLength: 32,
    disabled: isBusy,
    attributes: {
      autocomplete: 'tel',
      inputmode: 'tel',
    },
  });

  const emailField = createFormField({
    id: `admin-user-email-${user.id}`,
    label: 'E-mail principal',
    name: 'admin-user-email',
    type: 'email',
    value: editingState?.email ?? user.profile?.email ?? '',
    maxLength: 120,
    disabled: isBusy,
    attributes: {
      autocomplete: 'email',
      spellcheck: 'false',
    },
  });

  const userTypeField = createFormField({
    id: `admin-user-type-${user.id}`,
    label: 'Tipo de usuário',
    name: 'admin-user-type',
    value: normalizeUserType(editingState?.userType ?? user.userType),
    disabled: isBusy,
    options: USER_TYPE_OPTIONS,
  });

  const passwordField = createFormField({
    id: `admin-user-password-${user.id}`,
    label: 'Senha de acesso',
    name: 'admin-user-password',
    type: 'password',
    value: editingState?.password ?? user.password ?? '',
    maxLength: 120,
    disabled: isBusy,
    attributes: {
      autocomplete: 'new-password',
    },
  });

  fieldset.append(nameField, phoneField, emailField, userTypeField, passwordField);

  const formActions = document.createElement('div');
  formActions.className = 'admin-user-table__form-actions';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'admin-user-table__action admin-user-table__action--cancel';
  cancelButton.dataset.action = 'cancel-edit';
  cancelButton.textContent = 'Cancelar';
  cancelButton.disabled = isBusy;

  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'admin-user-table__action admin-user-table__action--save';
  saveButton.textContent = editingState?.isSaving ? 'Salvando…' : 'Salvar alterações';
  saveButton.disabled = isBusy;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'admin-user-table__action admin-user-table__action--delete';
  deleteButton.dataset.action = 'delete';
  deleteButton.textContent = editingState?.isDeleting ? 'Excluindo…' : 'Excluir cliente';
  deleteButton.disabled = isBusy;

  formActions.append(cancelButton, saveButton, deleteButton);
  fieldset.append(formActions);
  form.append(fieldset);

  container.append(form);

  cell.append(container);
  row.append(cell);

  return row;
}

function renderUserTableBody(
  bodyElement,
  users,
  expandedUserId = null,
  editingState = null,
  { emptyMessage } = {},
) {
  bodyElement.innerHTML = '';

  if (!Array.isArray(users) || users.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'admin-user-table__empty-row';

    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 7;
    emptyCell.className = 'admin-user-table__empty-cell';
    emptyCell.dataset.label = 'Clientes';
    emptyCell.textContent = emptyMessage || 'Nenhum cliente cadastrado até o momento.';

    emptyRow.append(emptyCell);
    bodyElement.append(emptyRow);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.className = 'admin-user-table__row';
    row.dataset.userId = String(user.id);

    const isExpanded = expandedUserId === user.id;
    const isEditing = editingState?.userId === user.id;

    if (isExpanded) {
      row.classList.add('admin-user-table__row--editing');
    }

    const nameCell = document.createElement('td');
    nameCell.className = 'admin-user-table__cell admin-user-table__cell--name';
    nameCell.dataset.label = 'Nome';
    nameCell.textContent = user.name || 'Nome não informado';

    const phoneCell = document.createElement('td');
    phoneCell.className = 'admin-user-table__cell admin-user-table__cell--phone';
    phoneCell.dataset.label = 'Telefone';
    const formattedPhone = formatPhoneNumberForDisplay(user.phone);
    phoneCell.textContent = formattedPhone || 'Telefone não informado';

    const emailCell = document.createElement('td');
    emailCell.className = 'admin-user-table__cell admin-user-table__cell--email';
    emailCell.dataset.label = 'E-mail';
    const emailValue = user.profile?.email?.trim();
    emailCell.textContent = emailValue || '—';

    const userTypeCell = document.createElement('td');
    userTypeCell.className = 'admin-user-table__cell admin-user-table__cell--user-type';
    userTypeCell.dataset.label = 'Tipo de usuário';
    userTypeCell.textContent = formatUserType(user.userType);

    const createdAtCell = document.createElement('td');
    createdAtCell.className = 'admin-user-table__cell admin-user-table__cell--created-at';
    createdAtCell.dataset.label = 'Criado em';
    const createdAtTime = document.createElement('time');
    createdAtTime.dateTime = user.createdAt.toISOString();
    createdAtTime.textContent = dateFormatter.format(user.createdAt);
    createdAtCell.append(createdAtTime);

    const updatedAtCell = document.createElement('td');
    updatedAtCell.className = 'admin-user-table__cell admin-user-table__cell--updated-at';
    updatedAtCell.dataset.label = 'Atualizado em';
    const updatedAtTime = document.createElement('time');
    updatedAtTime.dateTime = user.updatedAt.toISOString();
    updatedAtTime.textContent = dateFormatter.format(user.updatedAt);
    updatedAtCell.append(updatedAtTime);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'admin-user-table__cell admin-user-table__cell--actions';
    actionsCell.dataset.label = 'Ações';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'admin-user-table__action admin-user-table__action--edit';
    editButton.dataset.action = 'edit';
    editButton.textContent = isExpanded ? 'Fechar edição' : 'Editar';
    editButton.setAttribute('aria-expanded', String(isExpanded));
    editButton.disabled = Boolean((editingState?.isSaving || editingState?.isDeleting) && isEditing);

    actionsCell.append(editButton);

    row.append(nameCell, phoneCell, emailCell, userTypeCell, createdAtCell, updatedAtCell, actionsCell);

    const detailsRow = createDetailsRow(user, isExpanded, isEditing ? editingState : null);

    bodyElement.append(row, detailsRow);
  });
}

export function renderAdmin(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin';

  const heading = document.createElement('h1');
  heading.textContent = 'Painel Administrativo';

  const layout = document.createElement('div');
  layout.className = 'admin-user-layout';

  const overview = document.createElement('div');
  overview.className = 'admin-user-overview';

  const widgetDescription = document.createElement('p');
  widgetDescription.className = 'admin-user-section__description';
  widgetDescription.textContent =
    'Utilize os controles abaixo para pesquisar, filtrar e ordenar os clientes cadastrados.';

  const toolbar = document.createElement('div');
  toolbar.className = 'admin-user-toolbar';

  const searchGroup = document.createElement('div');
  searchGroup.className = 'admin-user-toolbar__group admin-user-toolbar__group--search';

  const searchLabel = document.createElement('label');
  searchLabel.className = 'admin-user-toolbar__label';
  searchLabel.htmlFor = 'admin-user-search';
  searchLabel.textContent = 'Pesquisar';

  const searchInput = document.createElement('input');
  searchInput.className = 'admin-user-toolbar__search-input';
  searchInput.type = 'search';
  searchInput.id = 'admin-user-search';
  searchInput.placeholder = 'Nome, telefone, e-mail ou tipo';
  searchInput.autocomplete = 'off';
  searchInput.spellcheck = false;
  searchInput.setAttribute('aria-label', 'Pesquisar clientes por nome, telefone, e-mail ou tipo');

  searchGroup.append(searchLabel, searchInput);

  const sortGroup = document.createElement('div');
  sortGroup.className = 'admin-user-toolbar__group admin-user-toolbar__group--sort';

  const sortLabel = document.createElement('label');
  sortLabel.className = 'admin-user-toolbar__label';
  sortLabel.htmlFor = 'admin-user-sort';
  sortLabel.textContent = 'Ordenar';

  const sortSelect = document.createElement('select');
  sortSelect.className = 'admin-user-toolbar__sort-select';
  sortSelect.id = 'admin-user-sort';
  sortSelect.setAttribute('aria-label', 'Alterar a ordem da lista de clientes');

  [
    { value: 'createdAtDesc', label: 'Mais recentes' },
    { value: 'createdAtAsc', label: 'Mais antigos' },
    { value: 'nameAsc', label: 'Nome A–Z' },
    { value: 'nameDesc', label: 'Nome Z–A' },
    { value: 'updatedAtDesc', label: 'Atualizados recentemente' },
    { value: 'updatedAtAsc', label: 'Atualizados há mais tempo' },
  ].forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    sortSelect.append(option);
  });

  sortGroup.append(sortLabel, sortSelect);

  const summary = document.createElement('p');
  summary.className = 'admin-user-toolbar__summary';
  summary.setAttribute('role', 'status');
  summary.setAttribute('aria-live', 'polite');
  summary.setAttribute('aria-atomic', 'true');
  summary.textContent = 'Carregando clientes...';

  toolbar.append(searchGroup, sortGroup, summary);

  overview.append(widgetDescription, toolbar);

  const widget = document.createElement('section');
  widget.className = 'admin-user-section admin-client-widget admin-user-table-panel';
  widget.setAttribute('aria-label', 'Widget tabela de clientes cadastrados');

  const widgetTitle = document.createElement('h2');
  widgetTitle.className = 'admin-user-section__title';
  widgetTitle.textContent = 'Widget: Tabela de clientes cadastrados';

  const table = document.createElement('table');
  table.className = 'admin-user-table';
  table.createCaption().textContent = 'Tabela de clientes cadastrados';

  const tableContainer = document.createElement('div');
  tableContainer.className = 'admin-user-table__container';

  const tableHead = document.createElement('thead');
  tableHead.className = 'admin-user-table__head';
  const headRow = document.createElement('tr');
  headRow.className = 'admin-user-table__head-row';

  ['Nome', 'Telefone', 'E-mail', 'Tipo de usuário', 'Registrado em', 'Última alteração', 'Ações'].forEach(
    (headingText) => {
      const headerCell = document.createElement('th');
      headerCell.scope = 'col';
      headerCell.className = 'admin-user-table__header';
      headerCell.textContent = headingText;
      headRow.append(headerCell);
    },
  );

  tableHead.append(headRow);

  const tableBody = document.createElement('tbody');
  tableBody.className = 'admin-user-table__body';

  table.append(tableHead, tableBody);
  tableContainer.append(table);

  widget.append(widgetTitle, tableContainer);

  layout.append(overview, widget);

  let usersSnapshot = [];
  let expandedUserId = null;
  let editingState = null;
  let filterQuery = '';
  let sortOption = 'createdAtDesc';

  function refreshToolbar(totalUsers, visibleUsers) {
    summary.textContent = createAdminSummary(totalUsers, visibleUsers, filterQuery);
    sortSelect.value = sortOption;
    searchInput.value = filterQuery;
  }

  function refreshTable() {
    const filteredUsers = filterUsersByQuery(usersSnapshot, filterQuery, {
      alwaysIncludeId: editingState?.userId,
    });
    const sortedUsers = sortUsersForAdmin(filteredUsers, sortOption);
    const totalUsers = usersSnapshot.length;
    const visibleUsers = sortedUsers.length;
    const emptyMessage =
      visibleUsers === 0
        ? filterQuery.trim()
          ? 'Nenhum cliente encontrado para a busca atual.'
          : 'Nenhum cliente cadastrado até o momento.'
        : undefined;

    renderUserTableBody(tableBody, sortedUsers, expandedUserId, editingState, {
      emptyMessage,
    });
    refreshToolbar(totalUsers, visibleUsers);
  }

  searchInput.addEventListener('input', (event) => {
    filterQuery = event.target.value;
    refreshTable();
  });

  searchInput.addEventListener('search', (event) => {
    filterQuery = event.target.value;
    refreshTable();
  });

  sortSelect.addEventListener('change', (event) => {
    sortOption = event.target.value;
    refreshTable();
  });

  tableBody.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest('button[data-action]');
    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }

    const action = actionButton.dataset.action;

    if (action === 'edit') {
      const row = actionButton.closest('tr');
      const userId = Number(row?.dataset.userId);

      if (!row || Number.isNaN(userId)) {
        return;
      }

      if (editingState?.isSaving || editingState?.isDeleting) {
        return;
      }

      const user = usersSnapshot.find((item) => item.id === userId);
      if (!user) {
        window.alert('Não foi possível localizar o cliente selecionado.');
        return;
      }

      if (editingState?.userId === userId) {
        editingState = null;
        expandedUserId = null;
        refreshTable();
        requestAnimationFrame(() => {
          const button = tableBody.querySelector(
            `.admin-user-table__row[data-user-id="${userId}"] .admin-user-table__action--edit`,
          );
          if (button instanceof HTMLButtonElement) {
            button.focus();
          }
        });
        return;
      }

      editingState = {
        userId,
        name: user.name || '',
        phone: user.phone || '',
        email: user.profile?.email || '',
        password: user.password || '',
        userType: normalizeUserType(user.userType),
        isSaving: false,
        isDeleting: false,
      };
      expandedUserId = userId;
      refreshTable();
      return;
    }

    if (action === 'cancel-edit') {
      const detailsRow = actionButton.closest('tr');
      const userId = Number(detailsRow?.dataset.detailsFor);

      if (Number.isNaN(userId)) {
        return;
      }

      if (editingState?.isSaving || editingState?.isDeleting) {
        return;
      }

      editingState = null;
      expandedUserId = null;
      refreshTable();
      requestAnimationFrame(() => {
        const button = tableBody.querySelector(
          `.admin-user-table__row[data-user-id="${userId}"] .admin-user-table__action--edit`,
        );
        if (button instanceof HTMLButtonElement) {
          button.focus();
        }
      });
      return;
    }

    if (action === 'delete') {
      const detailsRow = actionButton.closest('tr');
      const userId = Number(detailsRow?.dataset.detailsFor);

      if (Number.isNaN(userId)) {
        window.alert('Não foi possível identificar o cliente em edição.');
        return;
      }

      if (editingState?.isSaving || editingState?.isDeleting) {
        return;
      }

      const user = usersSnapshot.find((item) => item.id === userId);
      if (!user) {
        window.alert('Não foi possível localizar o cliente selecionado.');
        return;
      }

      const confirmation = window.confirm(
        'Tem certeza de que deseja excluir este cliente? Essa ação não pode ser desfeita.',
      );

      if (!confirmation) {
        return;
      }

      editingState = {
        userId,
        name: editingState?.name ?? user.name ?? '',
        phone: editingState?.phone ?? user.phone ?? '',
        email: editingState?.email ?? user.profile?.email ?? '',
        password: editingState?.password ?? user.password ?? '',
        userType: normalizeUserType(editingState?.userType ?? user.userType),
        isSaving: false,
        isDeleting: true,
      };
      expandedUserId = userId;
      refreshTable();

      try {
        await deleteUser(userId);
        window.alert('Cliente removido com sucesso.');
        editingState = null;
        expandedUserId = null;
      } catch (error) {
        console.error('Erro ao remover cliente pelo painel administrativo.', error);
        window.alert('Não foi possível remover o cliente. Tente novamente.');
        editingState = {
          userId,
          name: user.name || '',
          phone: user.phone || '',
          email: user.profile?.email || '',
          password: user.password || '',
          userType: normalizeUserType(user.userType),
          isSaving: false,
          isDeleting: false,
        };
        expandedUserId = userId;
      }

      refreshTable();

      if (!editingState) {
        requestAnimationFrame(() => {
          const button = tableBody.querySelector(
            `.admin-user-table__row[data-user-id="${userId}"] .admin-user-table__action--edit`,
          );
          if (button instanceof HTMLButtonElement) {
            button.focus();
          }
        });
      }

      return;
    }
  });

  tableBody.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (!form.classList.contains('admin-user-table__form')) {
      return;
    }

    event.preventDefault();

    const userId = Number(form.dataset.userId);
    if (Number.isNaN(userId)) {
      window.alert('Não foi possível identificar o cliente em edição.');
      return;
    }

    const row = tableBody.querySelector(`.admin-user-table__row[data-user-id="${userId}"]`);
    const user = usersSnapshot.find((item) => item.id === userId);

    if (!row || !user) {
      window.alert('Não foi possível localizar o cliente selecionado.');
      return;
    }

    if (editingState?.isDeleting) {
      return;
    }

    const nameInput = form.querySelector('input[name="admin-user-name"]');
    const phoneInput = form.querySelector('input[name="admin-user-phone"]');
    const emailInput = form.querySelector('input[name="admin-user-email"]');
    const userTypeSelect = form.querySelector('select[name="admin-user-type"]');
    const passwordInput = form.querySelector('input[name="admin-user-password"]');

    if (
      !(nameInput instanceof HTMLInputElement) ||
      !(phoneInput instanceof HTMLInputElement) ||
      !(emailInput instanceof HTMLInputElement) ||
      !(userTypeSelect instanceof HTMLSelectElement) ||
      !(passwordInput instanceof HTMLInputElement)
    ) {
      window.alert('Não foi possível identificar os campos de edição.');
      return;
    }

    const trimmedName = nameInput.value.trim();
    const trimmedPhone = phoneInput.value.trim();
    const trimmedEmail = emailInput.value.trim();
    const passwordValue = passwordInput.value;
    const selectedUserType = normalizeUserType(userTypeSelect.value);

    if (!trimmedName || !trimmedPhone) {
      window.alert('Nome e telefone são obrigatórios para atualizar o cadastro.');
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/iu.test(trimmedEmail)) {
      window.alert('Informe um e-mail válido ou deixe o campo em branco.');
      emailInput.focus();
      emailInput.select();
      return;
    }

    const hasPasswordChange = passwordValue !== user.password;

    if (hasPasswordChange) {
      const passwordValidation = validatePasswordStrength(passwordValue);

      if (!passwordValidation.isValid) {
        window.alert(passwordValidation.message);
        passwordInput.focus();
        passwordInput.select?.();
        return;
      }
    }

    editingState = {
      userId,
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      password: passwordValue,
      userType: selectedUserType,
      isSaving: true,
      isDeleting: false,
    };
    expandedUserId = userId;
    refreshTable();

    try {
      await updateUser(userId, {
        name: trimmedName,
        phone: trimmedPhone,
        userType: selectedUserType,
        profile: { email: trimmedEmail },
        ...(hasPasswordChange ? { password: passwordValue } : {}),
      });
      window.alert('Cliente atualizado com sucesso.');
      editingState = null;
      expandedUserId = null;
    } catch (error) {
      console.error('Erro ao atualizar cliente pelo painel administrativo.', error);
      window.alert('Não foi possível atualizar o cliente. Tente novamente.');
      editingState = {
        userId,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        password: passwordValue,
        userType: selectedUserType,
        isSaving: false,
        isDeleting: false,
      };
      expandedUserId = userId;
    }

    refreshTable();

    if (!editingState) {
      requestAnimationFrame(() => {
        const button = tableBody.querySelector(
          `.admin-user-table__row[data-user-id="${userId}"] .admin-user-table__action--edit`,
        );
        if (button instanceof HTMLButtonElement) {
          button.focus();
        }
      });
    }
  });

  const unsubscribe = subscribeUsers((users) => {
    usersSnapshot = Array.isArray(users) ? users.slice() : [];

    if (editingState) {
      const matchingUser = usersSnapshot.find((user) => user.id === editingState.userId);
      if (!matchingUser) {
        editingState = null;
        expandedUserId = null;
      } else if (!editingState.isSaving && !editingState.isDeleting) {
        editingState = {
          ...editingState,
          name: editingState.name ?? matchingUser.name ?? '',
          phone: editingState.phone ?? matchingUser.phone ?? '',
          email: editingState.email ?? matchingUser.profile?.email ?? '',
          password: editingState.password ?? matchingUser.password ?? '',
          userType: normalizeUserType(editingState.userType ?? matchingUser.userType),
        };
        expandedUserId = matchingUser.id;
      }
    }

    refreshTable();
  });

  registerViewCleanup(viewRoot, () => {
    unsubscribe();
  });

  viewRoot.replaceChildren(heading, layout);

  refreshTable();
}
