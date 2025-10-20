import { deleteUser, subscribeUsers, updateUser } from '../data/user-store.js';
import { clearActiveUser, getActiveUserId, subscribeSession } from '../data/session-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';

const BASE_CLASSES = 'card view view--user';
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

  const detailsSection = document.createElement('section');
  detailsSection.className = 'user-panel__section user-panel__section--details user-details';

  const detailsHeading = document.createElement('h2');
  detailsHeading.className = 'user-details__title';
  detailsHeading.textContent = 'Complete seus dados';

  const detailsDescription = document.createElement('p');
  detailsDescription.className = 'user-details__description';
  detailsDescription.textContent =
    'Revise telefone, senha e complemente os dados vinculados ao usuário autenticado.';

  const selectionInfo = document.createElement('p');
  selectionInfo.className = 'user-details__selected';
  selectionInfo.textContent = 'Nenhum usuário autenticado no momento.';

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

  function resetAccountFeedback(feedbackElement) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.hidden = true;
    feedbackElement.textContent = '';
    feedbackElement.classList.remove('user-account__feedback--error', 'user-account__feedback--success');
    feedbackElement.removeAttribute('role');
  }

  function showAccountFeedback(feedbackElement, message, { isError = false } = {}) {
    if (!feedbackElement) {
      return;
    }

    feedbackElement.textContent = message;
    feedbackElement.hidden = false;
    feedbackElement.classList.toggle('user-account__feedback--error', isError);
    feedbackElement.classList.toggle('user-account__feedback--success', !isError);
    if (isError) {
      feedbackElement.setAttribute('role', 'alert');
    } else {
      feedbackElement.removeAttribute('role');
    }
  }

  function navigateTo(view) {
    if (!view) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent('app:navigate', {
        detail: { view },
      })
    );
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

  const accountSection = document.createElement('section');
  accountSection.className = 'user-panel__section user-panel__section--account user-account';

  const accountHeading = document.createElement('h2');
  accountHeading.className = 'user-panel__section-title user-account__title';
  accountHeading.textContent = 'Sessão e segurança';

  const accountDescription = document.createElement('p');
  accountDescription.className = 'user-panel__section-description user-account__description';
  accountDescription.textContent =
    'Gerencie sua sessão atual, finalize o acesso com segurança ou remova todos os dados armazenados.';

  const accountActions = document.createElement('div');
  accountActions.className = 'user-account__actions';

  const logoffButton = document.createElement('button');
  logoffButton.type = 'button';
  logoffButton.className = 'user-account__action user-account__action--logoff';
  logoffButton.textContent = 'Fazer logoff';

  const logoutButton = document.createElement('button');
  logoutButton.type = 'button';
  logoutButton.className = 'user-account__action user-account__action--logout';
  logoutButton.textContent = 'Fazer logout';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'user-account__action user-account__action--delete';
  deleteButton.textContent = 'Excluir todos os dados';

  accountActions.append(logoffButton, logoutButton, deleteButton);

  const accountFeedback = document.createElement('p');
  accountFeedback.className = 'user-account__feedback';
  accountFeedback.setAttribute('aria-live', 'polite');
  accountFeedback.hidden = true;

  accountSection.append(accountHeading, accountDescription, accountActions, accountFeedback);

  let usersSnapshot = [];
  let isPasswordVisible = false;
  let sessionUserId = getActiveUserId();

  const primaryPhoneInput = primaryPhoneField.querySelector('input');
  const primaryPasswordInput = primaryPasswordField.querySelector('input');
  const profileNameInput = profileNameField.querySelector('input');
  const profileEmailInput = profileEmailField.querySelector('input');
  const profileSecondaryPhoneInput = profileSecondaryPhoneField.querySelector('input');
  const profileDocumentInput = profileDocumentField.querySelector('input');
  const profileAddressInput = profileAddressField.querySelector('input');
  const profileNotesInput = profileNotesField.querySelector('textarea');

  function getActiveSessionUser() {
    if (sessionUserId == null) {
      return null;
    }

    return usersSnapshot.find((user) => user.id === sessionUserId) ?? null;
  }

  function hasActiveSessionUser() {
    return Boolean(getActiveSessionUser());
  }

  function updateAccountActionsState() {
    const hasActive = hasActiveSessionUser();

    [logoffButton, logoutButton, deleteButton].forEach((button) => {
      if (button) {
        button.disabled = !hasActive;
        if (!hasActive) {
          button.removeAttribute('aria-busy');
        }
      }
    });

    if (!hasActive) {
      logoffButton?.setAttribute('title', 'Nenhuma sessão ativa no momento.');
      logoutButton?.setAttribute('title', 'Nenhuma sessão ativa no momento.');
      deleteButton?.setAttribute('title', 'Nenhum usuário autenticado para excluir.');
      return;
    }

    const activeUser = getActiveSessionUser();
    const nameLabel = activeUser?.name ? activeUser.name.trim() : '';
    const phoneLabel = activeUser?.phone ? activeUser.phone.trim() : '';

    const labelComplement = nameLabel
      ? ` de ${nameLabel}`
      : phoneLabel
      ? ` do usuário ${phoneLabel}`
      : '';

    logoffButton?.setAttribute('title', `Encerrar sessão atual${labelComplement}.`);
    logoutButton?.setAttribute('title', `Encerrar sessão e retornar à tela de login${labelComplement}.`);
    deleteButton?.setAttribute('title', `Remover definitivamente todos os dados${labelComplement}.`);
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
      selectionInfo.textContent = 'Nenhum usuário autenticado. Faça login para editar os dados.';
      return;
    }

    const nameLabel = user.name?.trim() || 'Usuário sem nome';
    selectionInfo.textContent = `Editando informações de ${nameLabel}.`;
  }

  function updateFormsState() {
    const user = getActiveSessionUser();
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

  updateAccountActionsState();
  updateFormsState();

  primaryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetDetailsFeedback(primaryFeedback);

    const user = getActiveSessionUser();
    if (!user) {
      showDetailsFeedback(primaryFeedback, 'Nenhuma sessão ativa. Faça login para atualizar telefone ou senha.', {
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

    const user = getActiveSessionUser();

    if (!user) {
      showDetailsFeedback(profileFeedback, 'Nenhuma sessão ativa. Faça login para complementar os dados.', {
        isError: true,
      });
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

  logoffButton.addEventListener('click', () => {
    resetAccountFeedback(accountFeedback);

    if (!hasActiveSessionUser()) {
      showAccountFeedback(accountFeedback, 'Nenhuma sessão ativa para encerrar no momento.', { isError: true });
      return;
    }

    clearActiveUser();
    showAccountFeedback(accountFeedback, 'Sessão finalizada. Faça login novamente para continuar.', {
      isError: false,
    });
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetDetailsFeedback(primaryFeedback);
    resetDetailsFeedback(profileFeedback);
    updateFormsState();
    updateAccountActionsState();
  });

  logoutButton.addEventListener('click', () => {
    resetAccountFeedback(accountFeedback);

    if (!hasActiveSessionUser()) {
      showAccountFeedback(accountFeedback, 'Nenhuma sessão ativa para encerrar no momento.', { isError: true });
      return;
    }

    clearActiveUser();
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetDetailsFeedback(primaryFeedback);
    resetDetailsFeedback(profileFeedback);
    updateFormsState();
    updateAccountActionsState();
    navigateTo('login');
  });

  deleteButton.addEventListener('click', async () => {
    resetAccountFeedback(accountFeedback);

    const activeUser = getActiveSessionUser();
    if (!activeUser) {
      showAccountFeedback(accountFeedback, 'Nenhum usuário autenticado encontrado para exclusão.', {
        isError: true,
      });
      return;
    }

    const confirmationMessage = activeUser.name
      ? `Excluir todos os dados de ${activeUser.name}? Essa ação não pode ser desfeita.`
      : 'Excluir todos os dados deste cadastro? Essa ação não pode ser desfeita.';

    const shouldDelete = window.confirm(confirmationMessage);
    if (!shouldDelete) {
      return;
    }

    try {
      deleteButton.disabled = true;
      deleteButton.setAttribute('aria-busy', 'true');
      await deleteUser(activeUser.id);
      clearActiveUser();
      showAccountFeedback(accountFeedback, 'Todos os dados foram removidos com sucesso.', { isError: false });
    } catch (error) {
      console.error('Erro ao excluir cadastro pelo painel do usuário.', error);
      showAccountFeedback(
        accountFeedback,
        'Não foi possível remover os dados armazenados. Tente novamente mais tarde.',
        { isError: true }
      );
    }

    deleteButton.removeAttribute('aria-busy');
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetDetailsFeedback(primaryFeedback);
    resetDetailsFeedback(profileFeedback);
    updateAccountActionsState();
    updateFormsState();
  });

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout';
  layout.append(detailsSection, accountSection);

  const unsubscribe = subscribeUsers((users) => {
    const hadActiveUser = hasActiveSessionUser();

    usersSnapshot = Array.isArray(users) ? users.slice() : [];

    const stillHasSessionUser =
      sessionUserId != null && usersSnapshot.some((user) => user.id === sessionUserId);

    if (!stillHasSessionUser) {
      sessionUserId = null;
    }

    if (hadActiveUser && !hasActiveSessionUser()) {
      isPasswordVisible = false;
      updatePasswordVisibility();
      resetDetailsFeedback(primaryFeedback);
      resetDetailsFeedback(profileFeedback);
    }

    updateAccountActionsState();
    updateFormsState();
  });

  const unsubscribeSession = subscribeSession((sessionUser) => {
    const previousSessionUserId = sessionUserId;
    sessionUserId = sessionUser?.id ?? null;

    if (sessionUserId == null && previousSessionUserId != null) {
      isPasswordVisible = false;
      updatePasswordVisibility();
      resetDetailsFeedback(primaryFeedback);
      resetDetailsFeedback(profileFeedback);
    }

    if (sessionUserId != null) {
      const hasSessionUser = usersSnapshot.some((user) => user.id === sessionUserId);
      if (!hasSessionUser) {
        sessionUserId = null;
      } else if (sessionUserId !== previousSessionUserId) {
        isPasswordVisible = false;
        updatePasswordVisibility();
        resetDetailsFeedback(primaryFeedback);
        resetDetailsFeedback(profileFeedback);
      }
      resetAccountFeedback(accountFeedback);
    }

    updateAccountActionsState();
    updateFormsState();
  });

  registerViewCleanup(viewRoot, () => {
    unsubscribe();
    unsubscribeSession();
  });

  viewRoot.replaceChildren(heading, intro, layout);
}

