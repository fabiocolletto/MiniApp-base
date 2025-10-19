import { subscribeUsers, updateUser, deleteUser } from '../data/user-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view view--admin';
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDetailValue(value) {
  if (value == null) {
    return 'Não informado';
  }

  const trimmed = typeof value === 'string' ? value.trim() : value;

  if (typeof trimmed === 'string') {
    return trimmed || 'Não informado';
  }

  return String(trimmed);
}

function appendDetailItem(listElement, label, value, { isMultiline = false } = {}) {
  const term = document.createElement('dt');
  term.className = 'admin-user-table__details-term';
  term.textContent = label;

  const definition = document.createElement('dd');
  definition.className = 'admin-user-table__details-value';
  definition.textContent = formatDetailValue(value);

  if (isMultiline) {
    definition.classList.add('admin-user-table__details-value--multiline');
  }

  listElement.append(term, definition);
}

function createDetailsRow(user, isExpanded) {
  const row = document.createElement('tr');
  row.className = 'admin-user-table__details-row';
  row.dataset.detailsFor = String(user.id);
  row.hidden = !isExpanded;

  const cell = document.createElement('td');
  cell.colSpan = 5;
  cell.className = 'admin-user-table__details-cell';

  const container = document.createElement('div');
  container.className = 'admin-user-table__details';

  const primaryList = document.createElement('dl');
  primaryList.className = 'admin-user-table__details-list';
  appendDetailItem(primaryList, 'Nome', user.name || 'Não informado');
  appendDetailItem(primaryList, 'Telefone', user.phone);
  appendDetailItem(primaryList, 'Senha', user.password || 'Não informado');
  appendDetailItem(primaryList, 'E-mail', user.profile?.email ?? '');

  const secondaryList = document.createElement('dl');
  secondaryList.className = 'admin-user-table__details-list';
  appendDetailItem(secondaryList, 'Telefone adicional', user.profile?.secondaryPhone ?? '');
  appendDetailItem(secondaryList, 'Documento', user.profile?.document ?? '');
  appendDetailItem(secondaryList, 'Endereço', user.profile?.address ?? '');
  appendDetailItem(secondaryList, 'Dispositivo', user.device || 'Não informado');

  const metaList = document.createElement('dl');
  metaList.className = 'admin-user-table__details-list admin-user-table__details-list--meta';
  appendDetailItem(metaList, 'Registrado em', dateFormatter.format(user.createdAt));
  appendDetailItem(metaList, 'Última atualização', dateFormatter.format(user.updatedAt));
  appendDetailItem(metaList, 'Observações', user.profile?.notes ?? '', { isMultiline: true });

  container.append(primaryList, secondaryList, metaList);
  cell.append(container);
  row.append(cell);

  return row;
}

function renderUserTableBody(bodyElement, users, expandedUserIds = new Set()) {
  bodyElement.innerHTML = '';

  if (!Array.isArray(users) || users.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'admin-user-table__empty-row';

    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 5;
    emptyCell.className = 'admin-user-table__empty-cell';
    emptyCell.textContent = 'Nenhum usuário cadastrado até o momento.';

    emptyRow.append(emptyCell);
    bodyElement.append(emptyRow);
    return;
  }

  users
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .forEach((user) => {
      const row = document.createElement('tr');
      row.className = 'admin-user-table__row';
      row.dataset.userId = String(user.id);
      const isExpanded = expandedUserIds.has(user.id);

      const nameCell = document.createElement('td');
      nameCell.className = 'admin-user-table__cell admin-user-table__cell--name';
      nameCell.textContent = user.name || 'Nome não informado';

      const phoneCell = document.createElement('td');
      phoneCell.className = 'admin-user-table__cell admin-user-table__cell--phone';
      phoneCell.textContent = user.phone;

      const createdAtCell = document.createElement('td');
      createdAtCell.className = 'admin-user-table__cell admin-user-table__cell--created-at';
      const createdAtTime = document.createElement('time');
      createdAtTime.dateTime = user.createdAt.toISOString();
      createdAtTime.textContent = dateFormatter.format(user.createdAt);
      createdAtCell.append(createdAtTime);

      const updatedAtCell = document.createElement('td');
      updatedAtCell.className = 'admin-user-table__cell admin-user-table__cell--updated-at';
      const updatedAtTime = document.createElement('time');
      updatedAtTime.dateTime = user.updatedAt.toISOString();
      updatedAtTime.textContent = dateFormatter.format(user.updatedAt);
      updatedAtCell.append(updatedAtTime);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'admin-user-table__cell admin-user-table__cell--actions';

      const detailsButton = document.createElement('button');
      detailsButton.type = 'button';
      detailsButton.className = 'admin-user-table__action admin-user-table__action--details';
      detailsButton.dataset.action = 'details';
      detailsButton.textContent = isExpanded ? 'Ocultar detalhes' : 'Detalhes';
      detailsButton.setAttribute('aria-expanded', String(isExpanded));

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'admin-user-table__action admin-user-table__action--edit';
      editButton.dataset.action = 'edit';
      editButton.textContent = 'Editar';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'admin-user-table__action admin-user-table__action--delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.textContent = 'Excluir';

      actionsCell.append(detailsButton, editButton, deleteButton);

      row.append(nameCell, phoneCell, createdAtCell, updatedAtCell, actionsCell);
      const detailsRow = createDetailsRow(user, isExpanded);

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

  const message = document.createElement('p');
  message.textContent = 'Área reservada para ferramentas internas.';

  const listHeading = document.createElement('h2');
  listHeading.className = 'admin-user-section__title';
  listHeading.textContent = 'Usuários cadastrados';

  const listDescription = document.createElement('p');
  listDescription.className = 'admin-user-section__description';
  listDescription.textContent = 'Os cadastros realizados no painel do usuário aparecem aqui automaticamente.';

  const table = document.createElement('table');
  table.className = 'admin-user-table';
  table.createCaption().textContent = 'Tabela de usuários cadastrados';

  const tableHead = document.createElement('thead');
  tableHead.className = 'admin-user-table__head';
  const headRow = document.createElement('tr');
  headRow.className = 'admin-user-table__head-row';

  ['Nome', 'Telefone', 'Registrado em', 'Última alteração', 'Ações'].forEach((headingText) => {
    const headerCell = document.createElement('th');
    headerCell.scope = 'col';
    headerCell.className = 'admin-user-table__header';
    headerCell.textContent = headingText;
    headRow.append(headerCell);
  });

  tableHead.append(headRow);

  const tableBody = document.createElement('tbody');
  tableBody.className = 'admin-user-table__body';

  table.append(tableHead, tableBody);

  const listSection = document.createElement('section');
  listSection.className = 'admin-user-section';
  listSection.append(listHeading, listDescription, table);

  let usersSnapshot = [];
  const expandedUserIds = new Set();

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
    const row = actionButton.closest('tr');
    const userId = Number(row?.dataset.userId);

    if (!row || Number.isNaN(userId)) {
      return;
    }

    const user = usersSnapshot.find((item) => item.id === userId);
    if (!user) {
      window.alert('Não foi possível localizar o usuário selecionado.');
      return;
    }

    if (action === 'details') {
      if (expandedUserIds.has(userId)) {
        expandedUserIds.delete(userId);
      } else {
        expandedUserIds.add(userId);
      }

      renderUserTableBody(tableBody, usersSnapshot, expandedUserIds);

      const focusSelector = `.admin-user-table__row[data-user-id="${userId}"] .admin-user-table__action--details`;
      requestAnimationFrame(() => {
        const newButton = tableBody.querySelector(focusSelector);
        if (newButton instanceof HTMLButtonElement) {
          newButton.focus();
        }
      });

      return;
    }

    if (action === 'edit') {
      const name = window.prompt('Atualize o nome do usuário:', user.name || '');
      if (name == null) {
        return;
      }

      const phone = window.prompt('Atualize o telefone do usuário:', user.phone || '');
      if (phone == null) {
        return;
      }

      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedName || !trimmedPhone) {
        window.alert('Nome e telefone são obrigatórios para atualizar o cadastro.');
        return;
      }

      try {
        await updateUser(userId, { name: trimmedName, phone: trimmedPhone });
        window.alert('Usuário atualizado com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar usuário pelo painel administrativo.', error);
        window.alert('Não foi possível atualizar o usuário. Tente novamente.');
      }
      return;
    }

    if (action === 'delete') {
      const confirmationLabel = user.name || user.phone || 'o usuário selecionado';
      const shouldDelete = window.confirm(`Deseja realmente excluir ${confirmationLabel}?`);
      if (!shouldDelete) {
        return;
      }

      try {
        await deleteUser(userId);
        window.alert('Usuário removido com sucesso.');
      } catch (error) {
        console.error('Erro ao remover usuário pelo painel administrativo.', error);
        window.alert('Não foi possível remover o usuário. Tente novamente.');
      }
    }
  });

  const unsubscribe = subscribeUsers((users) => {
    usersSnapshot = Array.isArray(users) ? users.slice() : [];

    expandedUserIds.forEach((id) => {
      if (!usersSnapshot.some((user) => user.id === id)) {
        expandedUserIds.delete(id);
      }
    });

    renderUserTableBody(tableBody, usersSnapshot, expandedUserIds);
  });

  registerViewCleanup(viewRoot, () => {
    unsubscribe();
  });

  viewRoot.replaceChildren(heading, message, listSection);
}
