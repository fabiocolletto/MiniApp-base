import { deleteUser, subscribeUsers, updateUser } from '../data/user-store.js';
import { clearActiveUser, getActiveUserId, subscribeSession } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';
import { createPasswordToggleIcon } from './shared/password-toggle-icon.js';

const BASE_CLASSES = 'card view view--user';
export function renderUserPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'user';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title';
  heading.textContent = 'Gerencie seus dados';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro';
  intro.textContent = 'Atualize telefone, senha e detalhes do perfil sem sair deste painel.';

  const selectionInfo = document.createElement('div');
  selectionInfo.className = 'user-widget__status user-details__selected';

  const selectionText = document.createElement('p');
  selectionText.className = 'user-details__selected-text';
  selectionText.textContent = 'Nenhuma sessão ativa. Faça login para começar.';

  const selectionAction = document.createElement('button');
  selectionAction.type = 'button';
  selectionAction.className = 'user-details__selected-action';
  selectionAction.textContent = 'Ir para o login';
  selectionAction.addEventListener('click', () => {
    navigateTo('login');
  });

  selectionInfo.append(selectionText, selectionAction);

  function createPanelFeedback(baseClass) {
    const feedbackElement = document.createElement('p');
    feedbackElement.className = `${baseClass} user-form__feedback`;
    feedbackElement.setAttribute('aria-live', 'polite');
    feedbackElement.hidden = true;

    const successClass = `${baseClass}--success`;
    const errorClass = `${baseClass}--error`;

    function reset() {
      feedbackElement.hidden = true;
      feedbackElement.textContent = '';
      feedbackElement.classList.remove(
        errorClass,
        successClass,
        'user-form__feedback--error',
        'user-form__feedback--success',
      );
      feedbackElement.removeAttribute('role');
    }

    function show(message, { isError = false } = {}) {
      feedbackElement.textContent = message;
      feedbackElement.hidden = false;
      feedbackElement.classList.toggle(errorClass, isError);
      feedbackElement.classList.toggle(successClass, !isError);
      feedbackElement.classList.toggle('user-form__feedback--error', isError);
      feedbackElement.classList.toggle('user-form__feedback--success', !isError);
      if (isError) {
        feedbackElement.setAttribute('role', 'alert');
      } else {
        feedbackElement.removeAttribute('role');
      }
    }

    return { element: feedbackElement, reset, show };
  }

  function createCollapsibleGroup({ title, description, open = false }) {
    const container = document.createElement('details');
    container.className = 'user-details__collapsible';
    container.open = Boolean(open);

    const summary = document.createElement('summary');
    summary.className = 'user-details__collapsible-summary';

    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'user-details__collapsible-header';

    const headerTitle = document.createElement('span');
    headerTitle.className = 'user-details__group-title';
    headerTitle.textContent = title;
    summaryHeader.append(headerTitle);

    if (description) {
      const headerDescription = document.createElement('span');
      headerDescription.className = 'user-details__group-description';
      headerDescription.textContent = description;
      summaryHeader.append(headerDescription);
    }

    const indicator = document.createElement('span');
    indicator.className = 'user-details__collapsible-icon';
    indicator.setAttribute('aria-hidden', 'true');

    summary.append(summaryHeader, indicator);

    const content = document.createElement('div');
    content.className = 'user-details__collapsible-content';

    container.append(summary, content);

    return { container, content };
  }

  function navigateTo(view) {
    if (!view) {
      return;
    }

    eventBus.emit('app:navigate', { view });
  }

  const primaryForm = document.createElement('form');
  primaryForm.className = 'user-widget user-panel__widget user-panel__widget--access user-form user-details__card';
  primaryForm.noValidate = true;

  const primaryTitle = document.createElement('h2');
  primaryTitle.className = 'user-widget__title user-details__form-title';
  primaryTitle.textContent = 'Dados de acesso';

  const primaryIntro = document.createElement('p');
  primaryIntro.className = 'user-widget__description user-details__form-description';
  primaryIntro.textContent = 'Telefone e senha que você usa para entrar.';

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
  passwordToggle.setAttribute('aria-controls', 'user-details-password');

  const passwordToggleIcon = document.createElement('span');
  passwordToggleIcon.className = 'user-details__password-toggle-icon';

  const passwordToggleText = document.createElement('span');
  passwordToggleText.className = 'sr-only';

  passwordToggle.append(passwordToggleIcon, passwordToggleText);

  primaryPasswordField.append(passwordToggle);

  const primarySubmit = document.createElement('button');
  primarySubmit.type = 'submit';
  primarySubmit.className = 'user-form__submit';
  primarySubmit.textContent = 'Salvar dados de acesso';

  const {
    element: primaryFeedback,
    reset: resetPrimaryFeedback,
    show: showPrimaryFeedback,
  } = createPanelFeedback('user-details__feedback');

  const primaryFields = document.createElement('div');
  primaryFields.className = 'user-details__form-grid user-details__form-grid--two';
  primaryFields.append(primaryPhoneField, primaryPasswordField);

  primaryForm.append(primaryTitle, primaryIntro, selectionInfo, primaryFields, primarySubmit, primaryFeedback);

  const profileForm = document.createElement('form');
  profileForm.className = 'user-widget user-panel__widget user-panel__widget--profile user-form user-details__card';
  profileForm.noValidate = true;

  const profileTitle = document.createElement('h2');
  profileTitle.className = 'user-widget__title user-details__form-title';
  profileTitle.textContent = 'Perfil completo';

  const profileIntro = document.createElement('p');
  profileIntro.className = 'user-widget__description user-details__form-description';
  profileIntro.textContent = 'Organize dados pessoais, contatos e endereço em um só lugar.';

  const profileNameField = createInputField({
    id: 'user-details-name',
    label: 'Nome completo',
    type: 'text',
    placeholder: 'Nome e sobrenome',
    autocomplete: 'name',
    required: false,
  });

  const profilePronounsField = createInputField({
    id: 'user-details-pronouns',
    label: 'Pronomes',
    type: 'text',
    placeholder: 'Ela/dela, Ele/dele, Elu/delu, ...',
    autocomplete: 'off',
    required: false,
  });

  const profileBirthDateField = createInputField({
    id: 'user-details-birth-date',
    label: 'Data de nascimento',
    type: 'date',
    placeholder: 'Selecione a data',
    autocomplete: 'bday',
    required: false,
  });

  const profileProfessionField = createInputField({
    id: 'user-details-profession',
    label: 'Profissão ou cargo',
    type: 'text',
    placeholder: 'Ex.: Desenvolvedor(a) front-end',
    autocomplete: 'organization-title',
    required: false,
  });

  const profileCompanyField = createInputField({
    id: 'user-details-company',
    label: 'Empresa ou organização',
    type: 'text',
    placeholder: 'Onde você atua atualmente?',
    autocomplete: 'organization',
    required: false,
  });

  const profileBioField = createTextareaField({
    id: 'user-details-bio',
    label: 'Biografia e destaques',
    placeholder: 'Conte um pouco sobre sua trajetória, objetivos e conquistas.',
    rows: 4,
  });
  profileBioField.classList.add('user-form__field--full');

  const profileEmailField = createInputField({
    id: 'user-details-email',
    label: 'E-mail',
    type: 'email',
    placeholder: 'nome@exemplo.com',
    autocomplete: 'email',
    required: false,
  });

  const profileWebsiteField = createInputField({
    id: 'user-details-website',
    label: 'Site pessoal ou portfólio',
    type: 'url',
    placeholder: 'https://seuportfolio.com',
    autocomplete: 'url',
    required: false,
  });

  const profileLinkedinField = createInputField({
    id: 'user-details-linkedin',
    label: 'LinkedIn',
    type: 'url',
    placeholder: 'https://linkedin.com/in/usuario',
    autocomplete: 'url',
    required: false,
  });

  const profileInstagramField = createInputField({
    id: 'user-details-instagram',
    label: 'Instagram',
    type: 'url',
    placeholder: 'https://instagram.com/usuario',
    autocomplete: 'url',
    required: false,
  });

  const profileFacebookField = createInputField({
    id: 'user-details-facebook',
    label: 'Facebook',
    type: 'url',
    placeholder: 'https://facebook.com/usuario',
    autocomplete: 'url',
    required: false,
  });

  const profileTwitterField = createInputField({
    id: 'user-details-twitter',
    label: 'X (Twitter)',
    type: 'url',
    placeholder: 'https://x.com/usuario',
    autocomplete: 'url',
    required: false,
  });

  const profileYoutubeField = createInputField({
    id: 'user-details-youtube',
    label: 'YouTube',
    type: 'url',
    placeholder: 'https://youtube.com/@usuario',
    autocomplete: 'url',
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
    label: 'Logradouro',
    type: 'text',
    placeholder: 'Rua, avenida, alameda...',
    autocomplete: 'address-line1',
    required: false,
  });

  const profileAddressNumberField = createInputField({
    id: 'user-details-address-number',
    label: 'Número',
    type: 'text',
    placeholder: 'Número ou S/N',
    autocomplete: 'address-line2',
    required: false,
  });

  const profileAddressComplementField = createInputField({
    id: 'user-details-address-complement',
    label: 'Complemento',
    type: 'text',
    placeholder: 'Apartamento, bloco, referência',
    autocomplete: 'address-line2',
    required: false,
  });

  const profileAddressDistrictField = createInputField({
    id: 'user-details-address-district',
    label: 'Bairro ou distrito',
    type: 'text',
    placeholder: 'Informe o bairro',
    autocomplete: 'address-level2',
    required: false,
  });

  const profileAddressCityField = createInputField({
    id: 'user-details-address-city',
    label: 'Cidade',
    type: 'text',
    placeholder: 'Informe a cidade',
    autocomplete: 'address-level2',
    required: false,
  });

  const profileAddressStateField = createInputField({
    id: 'user-details-address-state',
    label: 'Estado',
    type: 'text',
    placeholder: 'Ex.: SP',
    autocomplete: 'address-level1',
    required: false,
  });

  const profileAddressZipField = createInputField({
    id: 'user-details-address-zip',
    label: 'CEP',
    type: 'text',
    placeholder: '00000-000',
    autocomplete: 'postal-code',
    inputMode: 'numeric',
    required: false,
  });

  const profileAddressCountryField = createInputField({
    id: 'user-details-address-country',
    label: 'País',
    type: 'text',
    placeholder: 'Brasil',
    autocomplete: 'country-name',
    required: false,
  });

  const profileNotesField = createTextareaField({
    id: 'user-details-notes',
    label: 'Observações adicionais',
    placeholder: 'Compartilhe observações importantes, preferências ou instruções especiais.',
    rows: 4,
  });
  profileNotesField.classList.add('user-form__field--full');

  const profileSubmit = document.createElement('button');
  profileSubmit.type = 'submit';
  profileSubmit.className = 'user-form__submit';
  profileSubmit.textContent = 'Salvar perfil completo';

  const {
    element: profileFeedback,
    reset: resetProfileFeedback,
    show: showProfileFeedback,
  } = createPanelFeedback('user-details__feedback');

  const profilePersonalGrid = document.createElement('div');
  profilePersonalGrid.className = 'user-details__form-grid user-details__form-grid--two';
  profilePersonalGrid.append(
    profileNameField,
    profilePronounsField,
    profileBirthDateField,
    profileProfessionField,
    profileCompanyField,
    profileBioField,
  );

  const { container: profilePersonalGroup, content: profilePersonalContent } = createCollapsibleGroup({
    title: 'Dados pessoais',
    description: 'Nome, pronomes, nascimento e resumo profissional.',
    open: true,
  });
  profilePersonalContent.append(profilePersonalGrid);

  const profileContactGrid = document.createElement('div');
  profileContactGrid.className = 'user-details__form-grid user-details__form-grid--two';
  profileContactGrid.append(
    profileEmailField,
    profileSecondaryPhoneField,
    profileWebsiteField,
    profileLinkedinField,
    profileInstagramField,
    profileFacebookField,
    profileTwitterField,
    profileYoutubeField,
  );

  const { container: profileContactGroup, content: profileContactContent } = createCollapsibleGroup({
    title: 'Contatos e redes sociais',
    description: 'Centralize seus canais de atendimento e presença digital.',
  });
  profileContactContent.append(profileContactGrid);

  const profileAddressGrid = document.createElement('div');
  profileAddressGrid.className = 'user-details__form-grid user-details__form-grid--two';
  profileAddressGrid.append(
    profileDocumentField,
    profileAddressField,
    profileAddressNumberField,
    profileAddressComplementField,
    profileAddressDistrictField,
    profileAddressCityField,
    profileAddressStateField,
    profileAddressZipField,
    profileAddressCountryField,
    profileNotesField,
  );

  const { container: profileAddressGroup, content: profileAddressContent } = createCollapsibleGroup({
    title: 'Endereço e documentação',
    description: 'Localização completa, documento e observações extras.',
  });
  profileAddressContent.append(profileAddressGrid);

  profileForm.append(
    profileTitle,
    profileIntro,
    profilePersonalGroup,
    profileContactGroup,
    profileAddressGroup,
    profileSubmit,
    profileFeedback,
  );

  const accountSection = document.createElement('section');
  accountSection.className = 'user-widget user-panel__widget user-panel__widget--session user-account';

  const accountHeading = document.createElement('h2');
  accountHeading.className = 'user-widget__title user-account__title';
  accountHeading.textContent = 'Sessão e segurança';

  const accountDescription = document.createElement('p');
  accountDescription.className = 'user-widget__description user-account__description';
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

  const {
    element: accountFeedback,
    reset: resetAccountFeedback,
    show: showAccountFeedback,
  } = createPanelFeedback('user-account__feedback');

  accountSection.append(accountHeading, accountDescription, accountActions, accountFeedback);

  let usersSnapshot = [];
  let isPasswordVisible = false;
  let sessionUserId = getActiveUserId();

  const primaryPhoneInput = primaryPhoneField.querySelector('input');
  const primaryPasswordInput = primaryPasswordField.querySelector('input');
  const profileNameInput = profileNameField.querySelector('input');
  const profilePronounsInput = profilePronounsField.querySelector('input');
  const profileBirthDateInput = profileBirthDateField.querySelector('input');
  const profileProfessionInput = profileProfessionField.querySelector('input');
  const profileCompanyInput = profileCompanyField.querySelector('input');
  const profileBioInput = profileBioField.querySelector('textarea');
  const profileEmailInput = profileEmailField.querySelector('input');
  const profileSecondaryPhoneInput = profileSecondaryPhoneField.querySelector('input');
  const profileWebsiteInput = profileWebsiteField.querySelector('input');
  const profileLinkedinInput = profileLinkedinField.querySelector('input');
  const profileInstagramInput = profileInstagramField.querySelector('input');
  const profileFacebookInput = profileFacebookField.querySelector('input');
  const profileTwitterInput = profileTwitterField.querySelector('input');
  const profileYoutubeInput = profileYoutubeField.querySelector('input');
  const profileDocumentInput = profileDocumentField.querySelector('input');
  const profileAddressInput = profileAddressField.querySelector('input');
  const profileAddressNumberInput = profileAddressNumberField.querySelector('input');
  const profileAddressComplementInput = profileAddressComplementField.querySelector('input');
  const profileAddressDistrictInput = profileAddressDistrictField.querySelector('input');
  const profileAddressCityInput = profileAddressCityField.querySelector('input');
  const profileAddressStateInput = profileAddressStateField.querySelector('input');
  const profileAddressZipInput = profileAddressZipField.querySelector('input');
  const profileAddressCountryInput = profileAddressCountryField.querySelector('input');
  const profileNotesInput = profileNotesField.querySelector('textarea');

  const profileFieldBindings = {
    pronouns: profilePronounsInput,
    birthDate: profileBirthDateInput,
    profession: profileProfessionInput,
    company: profileCompanyInput,
    bio: profileBioInput,
    email: profileEmailInput,
    secondaryPhone: profileSecondaryPhoneInput,
    website: profileWebsiteInput,
    socialLinkedin: profileLinkedinInput,
    socialInstagram: profileInstagramInput,
    socialFacebook: profileFacebookInput,
    socialTwitter: profileTwitterInput,
    socialYoutube: profileYoutubeInput,
    document: profileDocumentInput,
    address: profileAddressInput,
    addressNumber: profileAddressNumberInput,
    addressComplement: profileAddressComplementInput,
    addressDistrict: profileAddressDistrictInput,
    addressCity: profileAddressCityInput,
    addressState: profileAddressStateInput,
    addressZip: profileAddressZipInput,
    addressCountry: profileAddressCountryInput,
    notes: profileNotesInput,
  };

  function readFieldValue(fieldElement) {
    if (!fieldElement) {
      return '';
    }

    if (fieldElement instanceof HTMLInputElement) {
      if (fieldElement.type === 'date') {
        return fieldElement.value;
      }
      return fieldElement.value.trim();
    }

    if (fieldElement instanceof HTMLTextAreaElement) {
      return fieldElement.value.trim();
    }

    if ('value' in fieldElement) {
      return String(fieldElement.value ?? '').trim();
    }

    return '';
  }

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

    const action = isPasswordVisible ? 'hide' : 'show';
    const label = isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha';

    primaryPasswordInput.type = isPasswordVisible ? 'text' : 'password';
    passwordToggleIcon.replaceChildren(createPasswordToggleIcon(action));
    passwordToggleText.textContent = label;
    passwordToggle.setAttribute('aria-label', label);
    passwordToggle.setAttribute('title', label);
    passwordToggle.setAttribute('aria-pressed', String(isPasswordVisible));
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
    if (!selectionText || !selectionAction) {
      return;
    }

    if (!user) {
      selectionText.textContent = 'Nenhuma sessão ativa. Faça login para editar os dados.';
      selectionAction.hidden = false;
      selectionAction.disabled = false;
      return;
    }

    const nameLabel = user.name?.trim() || 'Usuário sem nome';
    selectionText.textContent = `Editando informações de ${nameLabel}.`;
    selectionAction.hidden = true;
    selectionAction.disabled = true;
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

    if (profileSubmit) {
      profileSubmit.disabled = shouldDisable;
    }

    Object.values(profileFieldBindings).forEach((element) => {
      if (element instanceof HTMLElement) {
        element.disabled = shouldDisable;
      }
    });

    if (profileNameInput) {
      profileNameInput.disabled = shouldDisable;
    }

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
      Object.values(profileFieldBindings).forEach((element) => {
        if (element && 'value' in element) {
          element.value = '';
        }
      });
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

    Object.entries(profileFieldBindings).forEach(([key, element]) => {
      if (!element || !('value' in element)) {
        return;
      }

      const profileValue = user.profile?.[key] ?? '';

      if (key === 'birthDate') {
        if (element instanceof HTMLInputElement) {
          element.value = /^\d{4}-\d{2}-\d{2}$/.test(profileValue) ? profileValue : '';
        } else {
          element.value = '';
        }
        return;
      }

      element.value = profileValue;
    });

    updatePasswordVisibility();
  }

  updateAccountActionsState();
  updateFormsState();

  primaryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetPrimaryFeedback();

    const user = getActiveSessionUser();
    if (!user) {
      showPrimaryFeedback('Nenhuma sessão ativa. Faça login para atualizar telefone ou senha.', {
        isError: true,
      });
      return;
    }

    if (!primaryPhoneInput || !primaryPasswordInput) {
      showPrimaryFeedback('Os campos de telefone e senha não foram carregados corretamente.', {
        isError: true,
      });
      return;
    }

    const phoneValue = primaryPhoneInput.value.trim();
    const passwordValue = primaryPasswordInput.value;

    const updates = {};

    if (phoneValue !== user.phone) {
      if (!phoneValue) {
        showPrimaryFeedback('Informe um telefone válido para atualizar o cadastro.', {
          isError: true,
        });
        return;
      }
      updates.phone = phoneValue;
    }

    if (passwordValue !== user.password) {
      if (!passwordValue) {
        showPrimaryFeedback('Informe uma senha válida para atualizar o cadastro.', {
          isError: true,
        });
        return;
      }
      updates.password = passwordValue;
    }

    if (Object.keys(updates).length === 0) {
      showPrimaryFeedback('Nenhuma alteração identificada para salvar.', { isError: true });
      return;
    }

    try {
      primarySubmit.disabled = true;
      primarySubmit.setAttribute('aria-busy', 'true');
      passwordToggle.disabled = true;
      await updateUser(user.id, updates);
      showPrimaryFeedback('Dados principais atualizados com sucesso!', { isError: false });
    } catch (error) {
      console.error('Erro ao atualizar telefone ou senha pelo painel do usuário.', error);
      showPrimaryFeedback('Não foi possível atualizar os dados. Tente novamente.', {
        isError: true,
      });
    }

    primarySubmit.disabled = false;
    primarySubmit.removeAttribute('aria-busy');
    passwordToggle.disabled = false;
  });

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetProfileFeedback();

    const user = getActiveSessionUser();

    if (!user) {
      showProfileFeedback('Nenhuma sessão ativa. Faça login para complementar os dados.', {
        isError: true,
      });
      return;
    }

    if (!profileNameInput || Object.values(profileFieldBindings).some((element) => element == null)) {
      showProfileFeedback('Os campos adicionais não foram carregados corretamente.', {
        isError: true,
      });
      return;
    }

    const nameValue = readFieldValue(profileNameInput);

    const updates = {};
    const profileUpdates = {};

    if (nameValue !== user.name) {
      if (!nameValue) {
        showProfileFeedback('O nome completo não pode ficar vazio.', { isError: true });
        return;
      }
      updates.name = nameValue;
    }

    Object.entries(profileFieldBindings).forEach(([key, element]) => {
      if (!element) {
        return;
      }

      const nextValue = readFieldValue(element);
      const currentValue = user.profile?.[key] ?? '';

      if (nextValue !== currentValue) {
        profileUpdates[key] = nextValue;
      }
    });

    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    if (Object.keys(updates).length === 0) {
      showProfileFeedback('Nenhuma alteração identificada para salvar.', { isError: true });
      return;
    }

    try {
      profileSubmit.disabled = true;
      profileSubmit.setAttribute('aria-busy', 'true');
      await updateUser(user.id, updates);
      showProfileFeedback('Perfil completo atualizado com sucesso!', { isError: false });
    } catch (error) {
      console.error('Erro ao complementar cadastro pelo painel do usuário.', error);
      showProfileFeedback('Não foi possível salvar os dados do perfil. Tente novamente.', {
        isError: true,
      });
    }

    profileSubmit.disabled = false;
    profileSubmit.removeAttribute('aria-busy');
  });

  logoffButton.addEventListener('click', () => {
    resetAccountFeedback();

    if (!hasActiveSessionUser()) {
      showAccountFeedback('Nenhuma sessão ativa para encerrar no momento.', { isError: true });
      return;
    }

    clearActiveUser();
    showAccountFeedback('Sessão finalizada. Faça login novamente para continuar.', {
      isError: false,
    });
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetPrimaryFeedback();
    resetProfileFeedback();
    updateFormsState();
    updateAccountActionsState();
  });

  logoutButton.addEventListener('click', () => {
    resetAccountFeedback();

    if (!hasActiveSessionUser()) {
      showAccountFeedback('Nenhuma sessão ativa para encerrar no momento.', { isError: true });
      return;
    }

    clearActiveUser();
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetPrimaryFeedback();
    resetProfileFeedback();
    updateFormsState();
    updateAccountActionsState();
    navigateTo('login');
  });

  deleteButton.addEventListener('click', async () => {
    resetAccountFeedback();

    const activeUser = getActiveSessionUser();
    if (!activeUser) {
      showAccountFeedback('Nenhum usuário autenticado encontrado para exclusão.', {
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
      showAccountFeedback('Todos os dados foram removidos com sucesso.', { isError: false });
    } catch (error) {
      console.error('Erro ao excluir cadastro pelo painel do usuário.', error);
      showAccountFeedback('Não foi possível remover os dados armazenados. Tente novamente mais tarde.', {
        isError: true,
      });
    }

    deleteButton.removeAttribute('aria-busy');
    isPasswordVisible = false;
    updatePasswordVisibility();
    resetPrimaryFeedback();
    resetProfileFeedback();
    updateAccountActionsState();
    updateFormsState();
  });

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout';
  layout.append(primaryForm, profileForm, accountSection);

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
      resetPrimaryFeedback();
      resetProfileFeedback();
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
      resetPrimaryFeedback();
      resetProfileFeedback();
    }

    if (sessionUserId != null) {
      const hasSessionUser = usersSnapshot.some((user) => user.id === sessionUserId);
      if (!hasSessionUser) {
        sessionUserId = null;
      } else if (sessionUserId !== previousSessionUserId) {
        isPasswordVisible = false;
        updatePasswordVisibility();
        resetPrimaryFeedback();
        resetProfileFeedback();
      }
      resetAccountFeedback();
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

