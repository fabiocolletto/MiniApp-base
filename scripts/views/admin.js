import { subscribeUsers } from '../data/user-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view view--admin';
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function maskPassword(password) {
  if (typeof password !== 'string') {
    return '••••';
  }

  const minLength = 4;
  const sanitized = password.trim();
  const visibleLength = Math.max(sanitized.length, minLength);
  return '•'.repeat(visibleLength);
}

function createUserListItem(user) {
  const item = document.createElement('li');
  item.className = 'admin-user-list__item';
  item.dataset.userId = String(user.id);

  const phone = document.createElement('span');
  phone.className = 'admin-user-list__phone';
  phone.textContent = user.phone;

  const password = document.createElement('span');
  password.className = 'admin-user-list__password';
  password.textContent = maskPassword(user.password);

  const device = document.createElement('span');
  device.className = 'admin-user-list__device';
  const deviceLabel = typeof user.device === 'string' && user.device.trim()
    ? user.device.trim()
    : 'não identificado';
  device.textContent = `Dispositivo: ${deviceLabel}`;
  if (deviceLabel && deviceLabel !== 'não identificado') {
    device.title = deviceLabel;
  }

  const createdAt = document.createElement('time');
  createdAt.className = 'admin-user-list__timestamp';
  createdAt.dateTime = user.createdAt.toISOString();
  createdAt.textContent = dateFormatter.format(user.createdAt);

  item.append(phone, password, device, createdAt);

  return item;
}

function renderUserList(listElement, users) {
  listElement.innerHTML = '';

  if (!Array.isArray(users) || users.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'admin-user-list__empty';
    emptyItem.textContent = 'Nenhum usuário cadastrado até o momento.';
    listElement.append(emptyItem);
    return;
  }

  users
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .forEach((user) => {
      listElement.append(createUserListItem(user));
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

  const list = document.createElement('ul');
  list.className = 'admin-user-list';
  list.setAttribute('aria-live', 'polite');

  const listSection = document.createElement('section');
  listSection.className = 'admin-user-section';
  listSection.append(listHeading, listDescription, list);

  const unsubscribe = subscribeUsers((users) => {
    renderUserList(list, users);
  });

  registerViewCleanup(viewRoot, () => {
    unsubscribe();
  });

  viewRoot.replaceChildren(heading, message, listSection);
}
