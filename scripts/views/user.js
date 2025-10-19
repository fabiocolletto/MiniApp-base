import { subscribeUsers, updateUser } from '../data/user-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';

const BASE_CLASSES = 'card view view--user';
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function maskPassword(password) {
  if (typeof password !== 'string') {
    return '••••';
  }

  const sanitized = password.trim();
  const minLength = 4;
  const visibleLength = Math.max(sanitized.length, minLength);
  return '•'.repeat(visibleLength);
}

function renderUserRegistrations(listElement, users, { lastRegisteredUserId = null, selectedUserId = null, onSelect } = {}) {
  if (!(listElement instanceof HTMLElement)) {
    return;
  }

  listElement.innerHTML = '';

  if (!Array.isArray(users) || users.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'user-registrations__empty';
    emptyItem.textContent = 'Nenhum cadastro realizado até o momento.';
    listElement.append(emptyItem);
    return;
  }

  users
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .forEach((user) => {
      const item = document.createElement('li');
      item.className = 'user-registrations__item';
      item.dataset.userId = String(user.id);
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-pressed', user.id === selectedUserId ? 'true' : 'false');

      if (lastRegisteredUserId != null && user.id === lastRegisteredUserId) {
        item.classList.add('user-registrations__item--highlight');
      }

      if (selectedUserId != null && user.id === selectedUserId) {
        item.classList.add('user-registrations__item--selected');
      }

      const name = document.createElement('span');
      name.className = 'user-registrations__name';
      name.textContent = user.name || 'Nome não informado';

      const phone = document.createElement('span');
      phone.className = 'user-registrations__phone';
      phone.textContent = user.phone;

      const createdAt = document.createElement('time');
      createdAt.className = 'user-registrations__timestamp';
      createdAt.dateTime = user.createdAt.toISOString();
      createdAt.textContent = `Criado em ${dateFormatter.format(user.createdAt)}`;

      const updatedAt = document.createElement('time');
      updatedAt.className = 'user-registrations__timestamp';
      updatedAt.dateTime = user.updatedAt.toISOString();
      updatedAt.textContent = `Atualizado em ${dateFormatter.format(user.updatedAt)}`;

      const password = document.createElement('span');
      password.className = 'user-registrations__password';
      password.textContent = `Senha cadastrada: ${maskPassword(user.password)}`;

      const deviceLabel = typeof user.device === 'string' && user.device.trim()
        ? user.device.trim()
        : 'não identificado';

      const device = document.createElement('span');
      device.className = 'user-registrations__device';
      device.textContent = `Dispositivo utilizado: ${deviceLabel}`;
      if (deviceLabel && deviceLabel !== 'não identificado') {
        device.title = deviceLabel;
      }

      if (typeof onSelect === 'function') {
        const handleSelect = () => {
          onSelect(user.id);
        };
        item.addEventListener('click', handleSelect);
        item.addEventListener('keydown', (event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleSelect();
          }
        });
      }

      item.append(name, phone, createdAt, updatedAt, password, device);
      listElement.append(item);
    });
}

export function renderUserPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'user';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title';
  heading.textContent = 'Painel do Usuário';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro';
  intro.textContent =
    'Gerencie seus cadastros pessoais e acompanhe as atualizações em um único lugar.';

  const registrationsSection = document.createElement('section');
  registrationsSection.className =
    'user-panel__section user-panel__section--registrations user-registrations';

  const registrationsHeading = document.createElement('h2');
  registrationsHeading.className = 'user-registrations__title';
  registrationsHeading.textContent = 'Cadastros enviados';

  const registrationsDescription = document.createElement('p');
  registrationsDescription.className = 'user-registrations__description';
  registrationsDescription.textContent = 'Confira abaixo os cadastros realizados por este formulário.';

  const registrationsList = document.createElement('ul');
  registrationsList.className = 'user-registrations__list';
  registrationsList.setAttribute('aria-live', 'polite');

  registrationsSection.append(registrationsHeading, registrationsDescription, registrationsList);

  const detailsSection = document.createElement('section');
  detailsSection.className = 'user-panel__section user-panel__section--details user-details';

  const detailsHeading = document.createElement('h2');
  detailsHeading.className = 'user-details__title';
  detailsHeading.textContent = 'Complete seus dados';

  const detailsDescription = document.createElement('p');
  detailsDescription.className = 'user-details__description';
  detailsDescription.textContent =
    'Selecione um cadastro enviado para revisar telefone, senha e complementar suas informações.';

  const selectionInfo = document.createElement('p');
  selectionInfo.className = 'user-details__selected';
  selectionInfo.textContent = 'Nenhum cadastro selecionado no momento.';

  function createDetailsFeedbackElement() {
    const detailsFeedback = document.createElement('p');
    detailsFeedback.className = 'user-details__feedback';
    detailsFeedback.setAttribute('aria-live', 'polite');
    detailsFeedback.hidden = true;
    return detailsFeedback;
  }

  function resetDetailsFeedback(feedbackElement) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.hidden = true;
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('user-details__feedback--error', 'user-details__feedback--success');
    feedbackElement.removeAttribute('role');
  }

  function showDetailsFeedback(feedbackElement, message, { isError = false } = {}) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.textContent = message;
    feedbackElement.hidden = false;
    feedbackElement.classList.toggle('user-details__feedback--error', isError);
    feedbackElement.classList.toggle('user-details__feedback--success', !isError);
    if (isError) {
      feedbackElement.setAttribute('role', 'alert');
    } else {
      feedbackElement.removeAttribute('role');
    }
  }

  const primaryForm = document.createElement('form');
  primaryForm.className = 'user-details__form user-details__form--primary';
  primaryForm.noValidate = true;

  const primaryTitle = document.createElement('h3');
  primaryTitle.className = 'user-details__form-title';
  primaryTitle.textContent = 'Dados principais do cadastro';

  const primaryIntro = document.createElement('p');
  primaryIntro.className = 'user-details__form-description';
  primaryIntro.textContent = 'Atualize o telefone e a senha informados inicialmente.';

  const primaryPhoneField = createInputField({
    id: 'user-details-phone',
    label: 'Telefone cadastrado',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
    required: false,
  });

  const primaryPasswordField = createInputField({
    id: 'user-details-password',
    label: 'Senha cadastrada',
    type: 'password',
    placeholder: 'Atualize sua senha',
    autocomplete: 'new-password',
    required: false,
  });
  primaryPasswordField.classList.add('user-details__password-field');

  const passwordToggle = document.createElement('button');
  passwordToggle.type = 'button';
  passwordToggle.className = 'user-details__password-toggle';
  passwordToggle.textContent = 'Mostrar senha';

  primaryPasswordField.append(passwordToggle);

  const primarySubmit = document.createElement('button');
  primarySubmit.type = 'submit';
  primarySubmit.className = 'user-details__submit';
  primarySubmit.textContent = 'Atualizar contato';

  const primaryFeedback = createDetailsFeedbackElement();

  primaryForm.append(primaryTitle, primaryIntro, primaryPhoneField, primaryPasswordField, primarySubmit, primaryFeedback);

  const profileForm = document.createElement('form');
  profileForm.className = 'user-details__form user-details__form--profile';
  profileForm.noValidate = true;

  const profileTitle = document.createElement('h3');
  profileTitle.className = 'user-details__form-title';
  profileTitle.textContent = 'Dados complementares';

  const profileIntro = document.createElement('p');
  profileIntro.className = 'user-details__form-description';
  profileIntro.textContent = 'Inclua ou revise informações adicionais para deixar o cadastro completo.';

  const profileNameField = createInputField({
    id: 'user-details-name',
    label: 'Nome completo',
    type: 'text',
    placeholder: 'Nome e sobrenome',
    autocomplete: 'name',
    required: false,
  });

  const profileEmailField = createInputField({
    id: 'user-details-email',
    label: 'E-mail',
    type: 'email',
    placeholder: 'nome@exemplo.com',
    autocomplete: 'email',
    required: false,
  });

  const profileSecondaryPhoneField = createInputField({
    id: 'user-details-secondary-phone',
    label: 'Telefone adicional',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
    required: false,
  });

  const profileDocumentField = createInputField({
    id: 'user-details-document',
    label: 'Documento de identificação',
    type: 'text',
    placeholder: 'CPF ou documento equivalente',
    autocomplete: 'off',
    required: false,
  });

  const profileAddressField = createInputField({
    id: 'user-details-address',
    label: 'Endereço completo',
    type: 'text',
    placeholder: 'Rua, número e complemento',
    autocomplete: 'street-address',
    required: false,
  });

  const profileNotesField = createTextareaField({
    id: 'user-details-notes',
    label: 'Observações adicionais',
    placeholder: 'Informações relevantes sobre o cadastro',
    rows: 3,
  });

  const profileSubmit = document.createElement('button');
  profileSubmit.type = 'submit';
  profileSubmit.className = 'user-details__submit';
  profileSubmit.textContent = 'Salvar dados complementares';

  const profileFeedback = createDetailsFeedbackElement();

  profileForm.append(
    profileTitle,
    profileIntro,
    profileNameField,
    profileEmailField,
    profileSecondaryPhoneField,
    profileDocumentField,
    profileAddressField,
    profileNotesField,
    profileSubmit,
    profileFeedback,
  );

  detailsSection.append(detailsHeading, detailsDescription, selectionInfo, primaryForm, profileForm);

  const columnsWrapper = document.createElement('div');
  columnsWrapper.className = 'user-panel__columns';
  columnsWrapper.append(registrationsSection, detailsSection);

  let lastRegisteredUserId = null;
  let usersSnapshot = [];
  let selectedUserId = null;
  let isPasswordVisible = false;

  const primaryPhoneInput = primaryPhoneField.querySelector('input');
  const primaryPasswordInput = primaryPasswordField.querySelector('input');
  const profileNameInput = profileNameField.querySelector('input');
  const profileEmailInput = profileEmailField.querySelector('input');
  const profileSecondaryPhoneInput = profileSecondaryPhoneField.querySelector('input');
  const profileDocumentInput = profileDocumentField.querySelector('input');
  const profileAddressInput = profileAddressField.querySelector('input');
  const profileNotesInput = profileNotesField.querySelector('textarea');

  function getSelectedUser() {
    if (selectedUserId == null) {
      return null;
    }

    return usersSnapshot.find((user) => user.id === selectedUserId) ?? null;
  }

  function updatePasswordVisibility() {
    if (!primaryPasswordInput) {
      return;
    }

    primaryPasswordInput.type = isPasswordVisible ? 'text' : 'password';
    passwordToggle.textContent = isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha';
  }

  passwordToggle.addEventListener('click', (event) => {
    event.preventDefault();
    if (passwordToggle.disabled) {
      return;
    }

    isPasswordVisible = !isPasswordVisible;
    updatePasswordVisibility();
  });

  function updateSelectionInfo(user) {
    if (!selectionInfo) {
      return;
    }

    if (!user) {
      selectionInfo.textContent = 'Nenhum cadastro selecionado. Escolha um item da lista para editar os dados.';
      return;
    }

    const nameLabel = user.name || 'Cadastro sem nome';
    selectionInfo.textContent = `Editando informações de ${nameLabel} (ID ${user.id}).`;
  }

  function updateFormsState() {
    const user = getSelectedUser();
    updateSelectionInfo(user);

    const shouldDisable = !user;

    [primaryPhoneInput, primaryPasswordInput, primarySubmit, passwordToggle].forEach((element) => {
      if (element) {
        element.disabled = shouldDisable;
      }
    });

    [
      profileNameInput,
      profileEmailInput,
      profileSecondaryPhoneInput,
      profileDocumentInput,
      profileAddressInput,
      profileNotesInput,
      profileSubmit,
    ].forEach((element) => {
      if (element) {
        element.disabled = shouldDisable;
      }
    });

    if (!user) {
      if (primaryPhoneInput) {
        primaryPhoneInput.value = '';
      }
      if (primaryPasswordInput) {
        primaryPasswordInput.value = '';
      }
      if (profileNameInput) {
        profileNameInput.value = '';
      }
      if (profileEmailInput) {
        profileEmailInput.value = '';
      }
      if (profileSecondaryPhoneInput) {
        profileSecondaryPhoneInput.value = '';
      }
      if (profileDocumentInput) {
        profileDocumentInput.value = '';
      }
      if (profileAddressInput) {
        profileAddressInput.value = '';
      }
      if (profileNotesInput) {
        profileNotesInput.value = '';
      }
      isPasswordVisible = false;
      updatePasswordVisibility();
      return;
    }

    if (primaryPhoneInput) {
      primaryPhoneInput.value = user.phone;
    }
    if (primaryPasswordInput) {
      primaryPasswordInput.value = user.password;
    }
    if (profileNameInput) {
      profileNameInput.value = user.name;
    }
    if (profileEmailInput) {
      profileEmailInput.value = user.profile?.email ?? '';
    }
    if (profileSecondaryPhoneInput) {
      profileSecondaryPhoneInput.value = user.profile?.secondaryPhone ?? '';
    }
    if (profileDocumentInput) {
      profileDocumentInput.value = user.profile?.document ?? '';
    }
    if (profileAddressInput) {
      profileAddressInput.value = user.profile?.address ?? '';
    }
    if (profileNotesInput) {
      profileNotesInput.value = user.profile?.notes ?? '';
    }

    updatePasswordVisibility();
  }

  function handleSelectUser(userId) {
    if (Number.isNaN(Number(userId))) {
      return;
    }

    const numericId = Number(userId);

    if (selectedUserId === numericId) {
      return;
    }

    selectedUserId = numericId;
    isPasswordVisible = false;
    resetDetailsFeedback(primaryFeedback);
    resetDetailsFeedback(profileFeedback);
    refreshRegistrationList();
    updateFormsState();
  }

  function refreshRegistrationList() {
    renderUserRegistrations(registrationsList, usersSnapshot, {
      lastRegisteredUserId,
      selectedUserId,
      onSelect: handleSelectUser,
    });
  }

  updateFormsState();
  refreshRegistrationList();

  primaryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetDetailsFeedback(primaryFeedback);

    const user = getSelectedUser();
    if (!user) {
      showDetailsFeedback(primaryFeedback, 'Selecione um cadastro para atualizar telefone ou senha.', {
        isError: true,
      });
      return;
    }

    if (!primaryPhoneInput || !primaryPasswordInput) {
      showDetailsFeedback(primaryFeedback, 'Os campos de telefone e senha não foram carregados corretamente.', {
        isError: true,
      });
      return;
    }

    const phoneValue = primaryPhoneInput.value.trim();
    const passwordValue = primaryPasswordInput.value;

    const updates = {};

    if (phoneValue !== user.phone) {
      if (!phoneValue) {
        showDetailsFeedback(primaryFeedback, 'Informe um telefone válido para atualizar o cadastro.', {
          isError: true,
        });
        return;
      }
      updates.phone = phoneValue;
    }

    if (passwordValue !== user.password) {
      if (!passwordValue) {
        showDetailsFeedback(primaryFeedback, 'Informe uma senha válida para atualizar o cadastro.', {
          isError: true,
        });
        return;
      }
      updates.password = passwordValue;
    }

    if (Object.keys(updates).length === 0) {
      showDetailsFeedback(primaryFeedback, 'Nenhuma alteração identificada para salvar.', { isError: true });
      return;
    }

    try {
      primarySubmit.disabled = true;
      primarySubmit.setAttribute('aria-busy', 'true');
      passwordToggle.disabled = true;
      await updateUser(user.id, updates);
      showDetailsFeedback(primaryFeedback, 'Dados principais atualizados com sucesso!', { isError: false });
    } catch (error) {
      console.error('Erro ao atualizar telefone ou senha pelo painel do usuário.', error);
      showDetailsFeedback(primaryFeedback, 'Não foi possível atualizar os dados. Tente novamente.', {
        isError: true,
      });
    }

    primarySubmit.disabled = false;
    primarySubmit.removeAttribute('aria-busy');
    passwordToggle.disabled = false;
  });

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetDetailsFeedback(profileFeedback);

    const user = getSelectedUser();

    if (!user) {
      showDetailsFeedback(profileFeedback, 'Selecione um cadastro para complementar os dados.', { isError: true });
      return;
    }

    if (!profileNameInput || !profileEmailInput || !profileSecondaryPhoneInput || !profileDocumentInput || !profileAddressInput || !profileNotesInput) {
      showDetailsFeedback(profileFeedback, 'Os campos adicionais não foram carregados corretamente.', {
        isError: true,
      });
      return;
    }

    const nameValue = profileNameInput.value.trim();
    const emailValue = profileEmailInput.value.trim();
    const secondaryPhoneValue = profileSecondaryPhoneInput.value.trim();
    const documentValue = profileDocumentInput.value.trim();
    const addressValue = profileAddressInput.value.trim();
    const notesValue = profileNotesInput.value.trim();

    const updates = {};
    const profileUpdates = {};

    if (nameValue !== user.name) {
      if (!nameValue) {
        showDetailsFeedback(profileFeedback, 'O nome completo não pode ficar vazio.', { isError: true });
        return;
      }
      updates.name = nameValue;
    }

    if (emailValue !== (user.profile?.email ?? '')) {
      profileUpdates.email = emailValue;
    }

    if (secondaryPhoneValue !== (user.profile?.secondaryPhone ?? '')) {
      profileUpdates.secondaryPhone = secondaryPhoneValue;
    }

    if (documentValue !== (user.profile?.document ?? '')) {
      profileUpdates.document = documentValue;
    }

    if (addressValue !== (user.profile?.address ?? '')) {
      profileUpdates.address = addressValue;
    }

    if (notesValue !== (user.profile?.notes ?? '')) {
      profileUpdates.notes = notesValue;
    }

    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    if (Object.keys(updates).length === 0) {
      showDetailsFeedback(profileFeedback, 'Nenhuma alteração identificada para salvar.', { isError: true });
      return;
    }

    try {
      profileSubmit.disabled = true;
      profileSubmit.setAttribute('aria-busy', 'true');
      await updateUser(user.id, updates);
      showDetailsFeedback(profileFeedback, 'Dados complementares atualizados com sucesso!', { isError: false });
    } catch (error) {
      console.error('Erro ao complementar cadastro pelo painel do usuário.', error);
      showDetailsFeedback(profileFeedback, 'Não foi possível salvar os dados adicionais. Tente novamente.', {
        isError: true,
      });
    }

    profileSubmit.disabled = false;
    profileSubmit.removeAttribute('aria-busy');
  });

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout';
  layout.append(columnsWrapper);

  const unsubscribe = subscribeUsers((users) => {
    const previousUsers = Array.isArray(usersSnapshot) ? usersSnapshot.slice() : [];
    const previousIds = new Set(previousUsers.map((user) => user.id));

    usersSnapshot = Array.isArray(users) ? users.slice() : [];

    if (usersSnapshot.length === 0) {
      selectedUserId = null;
      isPasswordVisible = false;
      lastRegisteredUserId = null;
    } else {
      const newEntries = usersSnapshot.filter((user) => !previousIds.has(user.id));

      if (newEntries.length > 0) {
        newEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        lastRegisteredUserId = newEntries[0]?.id ?? lastRegisteredUserId;
      } else if (!usersSnapshot.some((user) => user.id === lastRegisteredUserId)) {
        lastRegisteredUserId = usersSnapshot[0]?.id ?? null;
      }

      const hasSelectedUser = usersSnapshot.some((user) => user.id === selectedUserId);
      if (!hasSelectedUser) {
        const fallbackUser =
          usersSnapshot.find((user) => user.id === lastRegisteredUserId) ?? usersSnapshot[0];
        const fallbackId = fallbackUser?.id ?? null;
        if (fallbackId !== selectedUserId) {
          selectedUserId = fallbackId;
          isPasswordVisible = false;
        } else {
          selectedUserId = fallbackId;
        }
      }
    }

    refreshRegistrationList();
    updateFormsState();
  });

  registerViewCleanup(viewRoot, () => {
    unsubscribe();
  });

  viewRoot.replaceChildren(heading, intro, layout);
}

