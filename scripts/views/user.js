import {
  subscribeUsers,
  updateUser,
  deleteUser,
  sanitizeUserThemePreference,
  getDefaultUserPreferences,
} from '../data/user-store.js';
import {
  setThemePreference,
  getResolvedTheme,
  subscribeThemeChange,
} from '../theme/theme-manager.js';
import { getActiveUserId, subscribeSession, clearActiveUser } from '../data/session-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createUserForm, tagFormElement } from './shared/user-form-sections.js';
import { formatPhoneNumberForDisplay, validatePhoneNumber, validatePasswordStrength } from './shared/validation.js';
import eventBus from '../events/event-bus.js';

const BASE_CLASSES = 'card view dashboard-view view--user user-dashboard';

const HTMLElementRef = typeof HTMLElement === 'undefined' ? null : HTMLElement;

function isElement(node) {
  if (!HTMLElementRef) {
    return Boolean(node) && typeof node === 'object' && 'ownerDocument' in node;
  }

  return node instanceof HTMLElementRef;
}

function createCollapsibleSection({
  id,
  title,
  description = '',
  defaultExpanded = false,
  classes = [],
  onToggle,
}) {
  const section = document.createElement('section');
  section.className = ['surface-card', 'user-panel__widget', ...classes].filter(Boolean).join(' ');
  section.dataset.sectionId = id;

  const header = document.createElement('div');
  header.className = 'user-panel__widget-header';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'user-panel__section-toggle';

  const titleElement = document.createElement('span');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const contentId = `user-panel-section-${id}`;
  toggleButton.setAttribute('aria-controls', contentId);
  toggleButton.append(titleElement);

  header.append(toggleButton);
  section.append(header);

  const content = document.createElement('div');
  content.className = 'user-panel__widget-content';
  content.id = contentId;

  let descriptionElement = null;
  if (description) {
    descriptionElement = document.createElement('p');
    descriptionElement.className = 'user-widget__description';
    descriptionElement.textContent = description;
    content.append(descriptionElement);
  }

  section.append(content);

  const setSectionState = (state) => {
    const normalized = state === 'expanded' ? 'expanded' : state === 'empty' ? 'empty' : 'collapsed';
    section.dataset.sectionState = normalized;
    const isExpanded = normalized === 'expanded';
    toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    content.hidden = !isExpanded;
    if (descriptionElement) {
      descriptionElement.hidden = !isExpanded;
    }
  };

  const setExpanded = (value) => setSectionState(value ? 'expanded' : 'collapsed');

  setSectionState(defaultExpanded ? 'expanded' : 'collapsed');

  const handleToggle = () => {
    const nextExpanded = section.dataset.sectionState !== 'expanded';
    if (typeof onToggle === 'function') {
      const result = onToggle(nextExpanded, {
        setSectionState,
        setExpanded,
      });

      if (result === false) {
        return;
      }
    }

    setExpanded(nextExpanded);
  };

  toggleButton.addEventListener('click', handleToggle);

  const cleanup = () => toggleButton.removeEventListener('click', handleToggle);

  return {
    section,
    header,
    toggleButton,
    content,
    descriptionElement,
    setSectionState,
    setExpanded,
    cleanup,
  };
}

function normalizePreferences(preferences) {
  const defaults = getDefaultUserPreferences();
  const normalized = { ...defaults };

  if (preferences && typeof preferences === 'object') {
    if (Object.prototype.hasOwnProperty.call(preferences, 'theme')) {
      normalized.theme = sanitizeUserThemePreference(preferences.theme);
    }
  }

  return normalized;
}

function normalizeUserData(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const { id } = user;
  if (id == null) {
    return null;
  }

  const name = typeof user.name === 'string' ? user.name.trim() : '';
  const phone = typeof user.phone === 'string' ? user.phone.trim() : '';
  const profileEmail = typeof user?.profile?.email === 'string' ? user.profile.email.trim() : '';

  const createdAtRaw = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const updatedAtRaw = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);

  const createdAt = createdAtRaw instanceof Date && !Number.isNaN(createdAtRaw.getTime()) ? createdAtRaw : null;
  const updatedAt = updatedAtRaw instanceof Date && !Number.isNaN(updatedAtRaw.getTime()) ? updatedAtRaw : null;

  const userType = typeof user.userType === 'string' ? user.userType.trim().toLowerCase() : 'usuario';

  return {
    id,
    name,
    phone,
    profile: { email: profileEmail },
    preferences: normalizePreferences(user.preferences),
    userType,
    createdAt,
    updatedAt,
  };
}

function createQuickAction({ label, description, onClick, extraClass = '' }) {
  const item = document.createElement('li');
  item.className = 'user-dashboard__quick-action';

  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    [
      'button',
      'button--secondary',
      'button--stacked',
      'button--block',
      'user-dashboard__quick-action-button',
      extraClass,
    ]
      .filter(Boolean)
      .join(' ');

  const labelElement = document.createElement('span');
  labelElement.className = 'user-dashboard__quick-action-title';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'user-dashboard__quick-action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  item.append(button);

  let cleanup = () => {};

  if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
    cleanup = () => {
      button.removeEventListener('click', onClick);
    };
  }

  return { item, button, labelElement, descriptionElement, cleanup };
}

function createSummaryItem(label) {
  const wrapper = document.createElement('div');
  wrapper.className = 'user-dashboard__summary-item';

  const term = document.createElement('dt');
  term.className = 'user-dashboard__summary-label';
  term.textContent = label;

  const description = document.createElement('dd');
  description.className = 'user-dashboard__summary-value';
  description.textContent = '—';

  wrapper.append(term, description);

  return { wrapper, valueElement: description };
}

export function createPersistUserChanges(getUserFn, updateUserFn) {
  if (typeof getUserFn !== 'function') {
    throw new Error('A função de acesso ao usuário ativo é obrigatória.');
  }

  if (typeof updateUserFn !== 'function') {
    throw new Error('A função de atualização de usuário é obrigatória.');
  }

  return async function persistUserChanges(
    updates,
    {
      feedback,
      busyTargets = [],
      successMessage = 'Alterações salvas com sucesso!',
      errorMessage = 'Não foi possível salvar as alterações. Tente novamente.',
      missingSessionMessage = 'Nenhuma sessão ativa. Faça login para continuar.',
    } = {},
  ) {
    const hasUpdates = updates && typeof updates === 'object' && Object.keys(updates).length > 0;
    if (!hasUpdates) {
      return { status: 'no-changes' };
    }

    const activeUser = getUserFn();
    if (!activeUser || activeUser.id == null) {
      if (feedback?.reset) {
        feedback.reset();
      }
      if (feedback?.show) {
        feedback.show(missingSessionMessage, { isError: true });
      }
      return { status: 'no-session' };
    }

    if (feedback?.reset) {
      feedback.reset();
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

        if (element instanceof HTMLElement) {
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

    toggleBusyState(true);

    try {
      await updateUserFn(activeUser.id, updates);
      if (feedback?.show) {
        feedback.show(successMessage, { isError: false });
      }
      return { status: 'success' };
    } catch (error) {
      console.error('Erro ao persistir alterações no painel do usuário.', error);
      if (feedback?.show) {
        feedback.show(errorMessage, { isError: true });
      }
      return { status: 'error', error };
    } finally {
      toggleBusyState(false);
    }
  };
}

export function renderUserPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'user';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout user-dashboard__layout';

  let themeAction = null;

  const themeSectionControls = createCollapsibleSection({
    id: 'theme',
    title: 'Preferências de tema',
    description:
      'Alterne rapidamente entre tema claro e escuro e mantenha sua escolha sincronizada em todos os acessos.',
    defaultExpanded: true,
    classes: ['user-dashboard__widget', 'user-dashboard__widget--theme'],
  });

  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'user-dashboard__actions';

  const actionList = document.createElement('ul');
  actionList.className = 'user-dashboard__action-list';
  actionList.setAttribute('role', 'list');

  actionsWrapper.append(actionList);
  themeSectionControls.content.append(actionsWrapper);

  const accessSectionControls = createCollapsibleSection({
    id: 'access',
    title: 'Sessão e acesso',
    description:
      'Gerencie a sessão rapidamente: faça logoff, troque de usuário ou remova os dados salvos deste dispositivo.',
    defaultExpanded: true,
    classes: ['user-dashboard__widget', 'user-panel__widget--access'],
  });

  const accessActionsWrapper = document.createElement('div');
  accessActionsWrapper.className = 'user-dashboard__actions';

  const accessActionList = document.createElement('ul');
  accessActionList.className = 'user-dashboard__action-list';
  accessActionList.setAttribute('role', 'list');

  accessActionsWrapper.append(accessActionList);

  const accessFeedback = document.createElement('p');
  accessFeedback.className = 'form-message user-form__feedback user-dashboard__feedback';
  accessFeedback.hidden = true;
  accessFeedback.setAttribute('aria-live', 'polite');

  accessSectionControls.content.append(accessActionsWrapper, accessFeedback);

  const userDataSectionIdentifier = 'dados do usuário';

  const userDataWidget = document.createElement('section');
  userDataWidget.className =
    'surface-card user-panel__widget user-dashboard__widget user-dashboard__widget--user-data';
  userDataWidget.dataset.sectionId = 'user-data';
  userDataWidget.dataset.sectionState = 'empty';

  const userDataHeader = document.createElement('div');
  userDataHeader.className = 'user-panel__widget-header user-dashboard__user-data-header';

  const userDataTitle = document.createElement('span');
  userDataTitle.className = 'user-widget__title';
  userDataTitle.textContent = 'Dados do Usuário';

  userDataHeader.append(userDataTitle);
  userDataWidget.append(userDataHeader);

  const userDataContent = document.createElement('div');
  userDataContent.className = 'user-panel__widget-content user-dashboard__user-data-content';
  userDataWidget.append(userDataContent);

  const accountSummary = document.createElement('div');
  accountSummary.className = 'user-dashboard__summary';
  accountSummary.id = 'user-dashboard-summary';
  accountSummary.hidden = true;

  const accountSummaryList = document.createElement('dl');
  accountSummaryList.className = 'user-dashboard__summary-list';
  accountSummaryList.id = 'user-dashboard-summary-list';
  accountSummaryList.hidden = true;

  const summaryName = createSummaryItem('Nome completo');
  const summaryPhone = createSummaryItem('Telefone principal');
  const summaryEmail = createSummaryItem('E-mail de contato');

  accountSummaryList.append(summaryName.wrapper, summaryPhone.wrapper, summaryEmail.wrapper);
  accountSummary.append(accountSummaryList);

  const emptyState = document.createElement('p');
  emptyState.className = 'user-dashboard__empty-state';
  emptyState.textContent = 'Nenhuma sessão ativa. Faça login para atualizar seus dados.';

  const userDataActions = document.createElement('div');
  userDataActions.className = 'user-dashboard__user-data-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className =
    'button button--primary user-dashboard__summary-edit user-dashboard__user-data-edit';
  editButton.textContent = 'Editar dados';
  editButton.setAttribute('aria-controls', 'user-dashboard-form');
  editButton.setAttribute('aria-expanded', 'false');
  editButton.disabled = true;

  userDataActions.append(editButton);

  const feedbackElement = document.createElement('p');
  feedbackElement.className = 'form-message user-form__feedback user-dashboard__feedback';
  feedbackElement.hidden = true;
  feedbackElement.setAttribute('aria-live', 'polite');
  const feedbackElementId = 'user-dashboard-feedback';
  feedbackElement.id = feedbackElementId;
  feedbackElement.setAttribute('data-field-size', 'full');
  tagFormElement(userDataSectionIdentifier, feedbackElement);

  const { form: accountForm, fields: accountFields } = createUserForm(userDataSectionIdentifier, {
    id: 'user-dashboard-form',
    className: 'form user-form user-dashboard__form',
    fieldConfigs: [
      {
        key: 'name',
        size: 'full',
        input: {
          id: 'user-dashboard-name',
          label: 'Nome completo',
          type: 'text',
          placeholder: 'Informe como deseja ser identificado',
          autocomplete: 'name',
        },
      },
      {
        key: 'phone',
        size: 'compact',
        input: {
          id: 'user-dashboard-phone',
          label: 'Telefone principal',
          type: 'tel',
          placeholder: 'Inclua DDD ou código internacional',
          autocomplete: 'tel',
          inputMode: 'tel',
        },
      },
      {
        key: 'email',
        size: 'wide',
        input: {
          id: 'user-dashboard-email',
          label: 'E-mail de contato',
          type: 'email',
          placeholder: 'nome@exemplo.com',
          autocomplete: 'email',
          required: false,
        },
      },
      {
        key: 'password',
        size: 'medium',
        input: {
          id: 'user-dashboard-password',
          label: 'Nova senha (opcional)',
          type: 'password',
          placeholder: 'Mínimo de 8 caracteres',
          autocomplete: 'new-password',
          required: false,
        },
      },
    ],
    extras: [],
  });

  accountForm.hidden = true;
  tagFormElement(userDataSectionIdentifier, accountForm);

  const findFieldEntry = (key) => accountFields.find((field) => field.key === key) ?? { field: null, input: null };

  const nameField = findFieldEntry('name').field;
  const phoneField = findFieldEntry('phone').field;
  const emailField = findFieldEntry('email').field;
  const passwordField = findFieldEntry('password').field;

  userDataContent.append(accountSummary, emptyState, userDataActions, feedbackElement, accountForm);

  const themeWidget = themeSectionControls.section;
  const accessWidget = accessSectionControls.section;
  const accountWidget = userDataWidget;

  layout.append(themeWidget, accessWidget, accountWidget);
  viewRoot.replaceChildren(layout);

  const cleanupCallbacks = [];
  [themeSectionControls, accessSectionControls]
    .map((controls) => controls?.cleanup)
    .filter((cleanup) => typeof cleanup === 'function')
    .forEach((cleanup) => cleanupCallbacks.push(cleanup));
  const unsubscribeCallbacks = [];

  const usersById = new Map();
  let activeUserId = getActiveUserId();
  let sessionSnapshot = null;
  let activeUser = null;
  let userDataExpanded = false;

  const nameInput = nameField.querySelector('input');
  const phoneInput = phoneField.querySelector('input');
  const emailInput = emailField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  [nameInput, phoneInput, emailInput, passwordInput]
    .filter((field) => field instanceof HTMLElement)
    .forEach((field) => {
      field.setAttribute('aria-describedby', feedbackElementId);
    });

  const accessActions = new Map();
  const busyButtons = new Set();

  let logoffAction = null;
  let logoutAction = null;
  let switchUserAction = null;

  const setButtonBusy = (button, isBusy) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    if (isBusy) {
      busyButtons.add(button);
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    } else {
      busyButtons.delete(button);
      button.removeAttribute('aria-busy');
    }

    updateActionState();
  };

  const showAccessFeedback = (message, { isError = false } = {}) => {
    if (!(accessFeedback instanceof HTMLElement)) {
      return;
    }

    accessFeedback.classList.remove(
      'user-form__feedback--error',
      'user-form__feedback--success',
      'form-message--error',
      'form-message--success',
    );

    if (!message) {
      accessFeedback.hidden = true;
      accessFeedback.textContent = '';
      accessFeedback.removeAttribute('role');
      return;
    }

    accessFeedback.hidden = false;
    accessFeedback.textContent = message;
    accessFeedback.classList.add(
      isError ? 'user-form__feedback--error' : 'user-form__feedback--success',
      isError ? 'form-message--error' : 'form-message--success',
    );
    accessFeedback.setAttribute('role', isError ? 'alert' : 'status');
  };

  const resetAccessFeedback = () => {
    showAccessFeedback('', {});
  };

  const registerAccessAction = ({ key, label, description, onClick, extraClass = '', requiresSession = true }) => {
    const action = createQuickAction({ label, description, onClick, extraClass });
    action.button.dataset.action = key;
    accessActionList.append(action.item);
    cleanupCallbacks.push(action.cleanup);
    accessActions.set(key, { button: action.button, requiresSession });
    return action;
  };

  const handleLogoff = () => {
    if (!activeUser) {
      showAccessFeedback('Nenhuma sessão ativa para encerrar.', { isError: true });
      return;
    }

    resetAccessFeedback();
    setButtonBusy(logoffAction?.button ?? null, true);

    try {
      clearActiveUser();
      showAccessFeedback('Sessão encerrada neste dispositivo.', { isError: false });
    } catch (error) {
      console.error('Erro ao encerrar sessão no painel do usuário.', error);
      showAccessFeedback('Não foi possível encerrar a sessão. Tente novamente.', { isError: true });
    } finally {
      setButtonBusy(logoffAction?.button ?? null, false);
    }
  };

  const handleLogout = () => {
    if (!activeUser) {
      showAccessFeedback('Nenhuma sessão ativa para sair da conta.', { isError: true });
      return;
    }

    resetAccessFeedback();
    setButtonBusy(logoutAction?.button ?? null, true);

    try {
      clearActiveUser();
      eventBus.emit('app:navigate', { view: 'dashboard' });
    } catch (error) {
      console.error('Erro ao efetuar logout no painel do usuário.', error);
      showAccessFeedback('Não foi possível realizar o logout. Tente novamente.', { isError: true });
    } finally {
      setButtonBusy(logoutAction?.button ?? null, false);
    }
  };

  const handleSwitchUser = () => {
    resetAccessFeedback();
    setButtonBusy(switchUserAction?.button ?? null, true);

    try {
      clearActiveUser();
      eventBus.emit('app:navigate', { view: 'login' });
    } catch (error) {
      console.error('Erro ao alternar usuário no painel.', error);
      showAccessFeedback('Não foi possível abrir a troca de usuário. Tente novamente.', { isError: true });
    } finally {
      setButtonBusy(switchUserAction?.button ?? null, false);
    }
  };

  const setAllAccessBusy = (isBusy) => {
    accessActions.forEach(({ button }) => {
      setButtonBusy(button, isBusy);
    });
  };

  const handleEraseData = async () => {
    if (!activeUser) {
      showAccessFeedback('Nenhum dado ativo para remover deste dispositivo.', { isError: true });
      return;
    }

    resetAccessFeedback();
    setAllAccessBusy(true);

    try {
      await deleteUser(activeUser.id);
      clearActiveUser();
      setThemePreference('system');
      showAccessFeedback('Dados locais removidos com sucesso.', { isError: false });
      eventBus.emit('app:navigate', { view: 'login' });
    } catch (error) {
      console.error('Erro ao remover dados do usuário pelo painel.', error);
      const message =
        error instanceof Error && error.message ? error.message : 'Não foi possível remover os dados. Tente novamente.';
      showAccessFeedback(message, { isError: true });
    } finally {
      setAllAccessBusy(false);
    }
  };

  logoffAction = registerAccessAction({
    key: 'logoff',
    label: 'Fazer logoff',
    description: 'Encerre apenas a sessão atual e mantenha os dados salvos.',
    onClick: handleLogoff,
    requiresSession: true,
  });

  logoutAction = registerAccessAction({
    key: 'logout',
    label: 'Logout da conta',
    description: 'Retorne ao Início e saia desta conta neste dispositivo.',
    onClick: handleLogout,
    extraClass: 'user-dashboard__quick-action-button--logout',
    requiresSession: true,
  });

  switchUserAction = registerAccessAction({
    key: 'switch-user',
    label: 'Trocar usuário',
    description: 'Acesse rapidamente a tela de login para entrar com outra conta.',
    onClick: handleSwitchUser,
    requiresSession: false,
  });

  registerAccessAction({
    key: 'erase-data',
    label: 'Excluir dados locais',
    description: 'Remova este cadastro e preferências armazenadas neste dispositivo.',
    onClick: handleEraseData,
    extraClass: 'user-dashboard__quick-action-button--logout',
    requiresSession: true,
  });

  const updateSummary = () => {
    const user = activeUser;
    const fallback = 'Não informado';

    if (summaryName.valueElement) {
      summaryName.valueElement.textContent = user?.name ? user.name : fallback;
    }

    if (summaryPhone.valueElement) {
      summaryPhone.valueElement.textContent = user?.phone
        ? formatPhoneNumberForDisplay(user.phone)
        : fallback;
    }

    if (summaryEmail.valueElement) {
      summaryEmail.valueElement.textContent = user?.profile?.email ? user.profile.email : fallback;
    }
  };

  const showFeedback = (message, { isError = false } = {}) => {
    if (!(feedbackElement instanceof HTMLElement)) {
      return;
    }

    feedbackElement.classList.remove(
      'user-form__feedback--error',
      'user-form__feedback--success',
      'form-message--error',
      'form-message--success',
    );

    if (!message) {
      feedbackElement.hidden = true;
      feedbackElement.textContent = '';
      feedbackElement.removeAttribute('role');
      return;
    }

    feedbackElement.hidden = false;
    feedbackElement.setAttribute('role', isError ? 'alert' : 'status');
    feedbackElement.textContent = message;

    if (isError) {
      feedbackElement.classList.add('user-form__feedback--error', 'form-message--error');
    } else {
      feedbackElement.classList.add('user-form__feedback--success', 'form-message--success');
    }
  };

  const clearFieldValidity = () => {
    [phoneInput, passwordInput]
      .filter((field) => field instanceof HTMLElement)
      .forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
  };

  const resetFeedback = () => {
    showFeedback('', {});
    clearFieldValidity();
  };

  const updateUserDataViewState = () => {
    const hasUser = Boolean(activeUser);

    if (!hasUser) {
      userDataExpanded = false;
    }

    if (accountSummary instanceof HTMLElement) {
      accountSummary.hidden = !hasUser;
    }

    if (accountSummaryList instanceof HTMLElement) {
      accountSummaryList.hidden = !hasUser;
    }

    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = hasUser;
    }

    if (accountForm instanceof HTMLElement) {
      accountForm.hidden = !(hasUser && userDataExpanded);
    }

    if (feedbackElement instanceof HTMLElement) {
      const hasFeedbackContent =
        typeof feedbackElement.textContent === 'string' && feedbackElement.textContent.trim().length > 0;
      if (!hasFeedbackContent) {
        feedbackElement.hidden = true;
        feedbackElement.removeAttribute('role');
      }
    }

    if (editButton instanceof HTMLElement) {
      const isBusy = typeof editButton.hasAttribute === 'function' && editButton.hasAttribute('aria-busy');
      editButton.disabled = isBusy || !hasUser;
      editButton.setAttribute('aria-expanded', hasUser ? String(Boolean(userDataExpanded)) : 'false');
    }

    accountWidget.dataset.sectionState = hasUser ? (userDataExpanded ? 'expanded' : 'collapsed') : 'empty';
  };

  const toggleUserDataExpanded = (nextState) => {
    const hasUser = Boolean(activeUser);
    userDataExpanded = Boolean(nextState) && hasUser;
    updateUserDataViewState();

    if (userDataExpanded && nameInput instanceof HTMLElement && typeof nameInput.focus === 'function') {
      try {
        nameInput.focus();
      } catch (error) {
        // Ignora navegadores ou ambientes sem suporte a foco programático.
      }
    }
  };

  const handleEditShortcut = () => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    const nextExpanded = !userDataExpanded;
    if (nextExpanded) {
      resetFeedback();
    } else {
      clearFieldValidity();
    }

    toggleUserDataExpanded(nextExpanded);
  };

  editButton.addEventListener('click', handleEditShortcut);
  cleanupCallbacks.push(() => editButton.removeEventListener('click', handleEditShortcut));

  const resolveCurrentPreference = () => activeUser?.preferences?.theme ?? 'system';

  const resolveCurrentTheme = () => {
    const currentPreference = resolveCurrentPreference();
    return currentPreference === 'system' ? getResolvedTheme() : currentPreference;
  };

  const computeNextThemePreference = () => (resolveCurrentTheme() === 'dark' ? 'light' : 'dark');

  const formatThemeActionTitle = () => {
    const preference = resolveCurrentPreference();
    const currentTheme = resolveCurrentTheme();

    if (!activeUser) {
      return 'Tema automático';
    }

    if (preference === 'system') {
      return currentTheme === 'dark' ? 'Tema escuro (automático) 🌙' : 'Tema claro (automático) ☀️';
    }

    return currentTheme === 'dark' ? 'Tema escuro ativo 🌙' : 'Tema claro ativo ☀️';
  };

  const formatThemeActionDescription = () => {
    if (!activeUser) {
      return 'Inicie uma sessão para escolher entre claro ou escuro.';
    }

    const nextPreference = computeNextThemePreference();
    return nextPreference === 'dark'
      ? 'Clique para ativar o tema escuro imediatamente.'
      : 'Clique para ativar o tema claro imediatamente.';
  };

  const updateThemeActionContent = () => {
    if (!themeAction) {
      return;
    }

    themeAction.labelElement.textContent = formatThemeActionTitle();
    themeAction.descriptionElement.textContent = formatThemeActionDescription();

    const nextPreference = computeNextThemePreference();
    const preference = resolveCurrentPreference();
    const currentTheme = resolveCurrentTheme();

    themeAction.button.dataset.themeTarget = nextPreference;
    themeAction.button.dataset.themePreference = preference;
    themeAction.button.dataset.themeActive = currentTheme;
  };

  const persistUserChanges = createPersistUserChanges(
    () => (activeUser ? { id: activeUser.id } : null),
    updateUser,
  );

  const handleThemeToggle = async () => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para ajustar o tema.', { isError: true });
      return;
    }

    const nextPreference = computeNextThemePreference();

    resetFeedback();

    const result = await persistUserChanges(
      { preferences: { theme: nextPreference } },
      {
        feedback: {
          reset: resetFeedback,
          show: (message, options = {}) => {
            showFeedback(message, options);
          },
        },
        busyTargets: [themeAction?.button].filter(Boolean),
        successMessage:
          nextPreference === 'dark'
            ? 'Tema escuro ativado com sucesso!'
            : 'Tema claro ativado com sucesso!',
        errorMessage: 'Não foi possível atualizar o tema. Tente novamente.',
        missingSessionMessage: 'Nenhuma sessão ativa. Faça login para ajustar o tema.',
      },
    );

    if (result.status !== 'success') {
      return;
    }

    setThemePreference(nextPreference);

    if (activeUser?.preferences) {
      activeUser.preferences.theme = nextPreference;
    }
    if (activeUser) {
      activeUser.updatedAt = new Date();
    }

    updateForm();
    updateActionState();
    updateThemeActionContent();
  };

  themeAction = createQuickAction({
    label: 'Tema automático',
    description: 'Clique para alternar entre tema claro e escuro.',
    onClick: handleThemeToggle,
    extraClass: 'user-dashboard__quick-action-button--theme',
  });

  actionList.append(themeAction.item);
  cleanupCallbacks.push(themeAction.cleanup);
  updateThemeActionContent();

  const applySnapshotUpdates = (updates) => {
    if (!activeUser || !updates || typeof updates !== 'object') {
      return;
    }

    if (updates.name !== undefined) {
      activeUser.name = updates.name;
    }

    if (updates.phone !== undefined) {
      activeUser.phone = updates.phone;
    }

    if (updates.profile?.email !== undefined) {
      activeUser.profile.email = updates.profile.email ?? '';
    }

    if (updates.preferences?.theme) {
      activeUser.preferences.theme = updates.preferences.theme;
    }

    if (Object.keys(updates).length > 0) {
      activeUser.updatedAt = new Date();
    }
  };

  const persistUpdates = async (updates, { successMessage, busyTargets = [] } = {}) => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return { status: 'no-session' };
    }

    const hasUpdates = updates && typeof updates === 'object' && Object.keys(updates).length > 0;
    if (!hasUpdates) {
      return { status: 'no-changes' };
    }

    resetFeedback();

    const result = await persistUserChanges(updates, {
      feedback: {
        reset: resetFeedback,
        show: (message, options = {}) => {
          showFeedback(message, options);
        },
      },
      busyTargets,
      successMessage: successMessage ?? 'Alterações salvas com sucesso!',
      errorMessage: 'Não foi possível salvar as alterações. Tente novamente.',
      missingSessionMessage: 'Nenhuma sessão ativa. Faça login para continuar.',
    });

    if (result.status !== 'success') {
      return result;
    }

    applySnapshotUpdates(updates);
    updateForm();
    updateActionState();

    return result;
  };

  const handleNameChange = async () => {
    if (!nameInput) {
      return;
    }

    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    const nextName = nameInput.value.trim();
    if (nextName === (activeUser.name ?? '')) {
      resetFeedback();
      updateSummary();
      return;
    }

    await persistUpdates(
      { name: nextName },
      {
        successMessage: 'Nome atualizado com sucesso!',
        busyTargets: [nameInput, editButton].filter((element) => element instanceof HTMLElement),
      },
    );
  };

  const handlePhoneChange = async () => {
    if (!phoneInput) {
      return;
    }

    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneInput.value);
    if (!phoneValidation.isValid) {
      showFeedback(phoneValidation.message ?? 'Informe um telefone válido.', { isError: true });
      phoneInput.setAttribute('aria-invalid', 'true');
      try {
        phoneInput.focus();
      } catch (error) {
        // Ignora ambientes sem suporte a foco programático.
      }
      return;
    }

    phoneInput.removeAttribute('aria-invalid');

    const sanitizedPhone = phoneValidation.sanitized ?? phoneValidation.localNumber ?? '';
    if (sanitizedPhone === (activeUser.phone ?? '')) {
      phoneInput.value = formatPhoneNumberForDisplay(sanitizedPhone);
      resetFeedback();
      updateSummary();
      return;
    }

    const result = await persistUpdates(
      { phone: sanitizedPhone },
      {
        successMessage: 'Telefone atualizado com sucesso!',
        busyTargets: [phoneInput, editButton].filter((element) => element instanceof HTMLElement),
      },
    );

    if (result.status === 'success') {
      phoneInput.value = formatPhoneNumberForDisplay(sanitizedPhone);
    }
  };

  const handleEmailChange = async () => {
    if (!emailInput) {
      return;
    }

    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    const nextEmail = emailInput.value.trim();
    if (nextEmail === (activeUser.profile?.email ?? '')) {
      resetFeedback();
      updateSummary();
      return;
    }

    await persistUpdates(
      { profile: { email: nextEmail } },
      {
        successMessage: 'E-mail atualizado com sucesso!',
        busyTargets: [emailInput, editButton].filter((element) => element instanceof HTMLElement),
      },
    );
  };

  const handlePasswordChange = async () => {
    if (!passwordInput) {
      return;
    }

    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    const passwordValue = passwordInput.value;
    if (!passwordValue) {
      passwordInput.removeAttribute('aria-invalid');
      resetFeedback();
      return;
    }

    const passwordValidation = validatePasswordStrength(passwordValue);
    if (!passwordValidation.isValid) {
      showFeedback(passwordValidation.message ?? 'Informe uma senha válida.', { isError: true });
      passwordInput.setAttribute('aria-invalid', 'true');
      try {
        passwordInput.focus();
      } catch (error) {
        // Ignora ambientes sem suporte a foco programático.
      }
      return;
    }

    passwordInput.removeAttribute('aria-invalid');

    const result = await persistUpdates(
      { password: passwordValue },
      {
        successMessage: 'Senha atualizada com sucesso!',
        busyTargets: [passwordInput, editButton].filter((element) => element instanceof HTMLElement),
      },
    );

    if (result.status === 'success') {
      passwordInput.value = '';
    }
  };

  const persistAllFields = async ({ showNoChangesFeedback = true } = {}) => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return { status: 'no-session' };
    }

    const updates = {};
    const profileUpdates = {};

    if (nameInput) {
      const nextName = nameInput.value.trim();
      if (nextName !== (activeUser.name ?? '')) {
        updates.name = nextName;
      }
    }

    if (phoneInput) {
      const phoneValidation = validatePhoneNumber(phoneInput.value);
      if (!phoneValidation.isValid) {
        showFeedback(phoneValidation.message ?? 'Informe um telefone válido.', { isError: true });
        phoneInput.setAttribute('aria-invalid', 'true');
        try {
          phoneInput.focus();
        } catch (error) {
          // Ignora ambientes sem suporte a foco programático.
        }
        return { status: 'invalid', field: 'phone' };
      }

      phoneInput.removeAttribute('aria-invalid');

      const sanitizedPhone = phoneValidation.sanitized ?? phoneValidation.localNumber ?? '';
      if (sanitizedPhone !== (activeUser.phone ?? '')) {
        updates.phone = sanitizedPhone;
      }
    }

    if (emailInput) {
      const nextEmail = emailInput.value.trim();
      if (nextEmail !== (activeUser.profile?.email ?? '')) {
        profileUpdates.email = nextEmail;
      }
    }

    if (passwordInput) {
      const passwordValue = passwordInput.value;
      if (passwordValue) {
        const passwordValidation = validatePasswordStrength(passwordValue);
        if (!passwordValidation.isValid) {
          showFeedback(passwordValidation.message ?? 'Informe uma senha válida.', { isError: true });
          passwordInput.setAttribute('aria-invalid', 'true');
          try {
            passwordInput.focus();
          } catch (error) {
            // Ignora ambientes sem suporte a foco programático.
          }
          return { status: 'invalid', field: 'password' };
        }
        updates.password = passwordValue;
        passwordInput.removeAttribute('aria-invalid');
      } else {
        passwordInput.removeAttribute('aria-invalid');
      }
    }

    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    if (Object.keys(updates).length === 0) {
      if (showNoChangesFeedback) {
        showFeedback('Nenhuma alteração para salvar.', { isError: false });
      }
      return { status: 'no-changes' };
    }

    const busyTargets = [nameInput, phoneInput, emailInput, passwordInput, editButton].filter(
      (element) => element instanceof HTMLElement,
    );

    return persistUpdates(updates, {
      successMessage: 'Alterações salvas com sucesso!',
      busyTargets,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!userDataExpanded) {
      return;
    }

    await persistAllFields();
  };

  accountForm.addEventListener('submit', handleFormSubmit);
  cleanupCallbacks.push(() => accountForm.removeEventListener('submit', handleFormSubmit));

  if (nameInput) {
    nameInput.addEventListener('change', handleNameChange);
    cleanupCallbacks.push(() => nameInput.removeEventListener('change', handleNameChange));
  }

  if (phoneInput) {
    phoneInput.addEventListener('change', handlePhoneChange);
    cleanupCallbacks.push(() => phoneInput.removeEventListener('change', handlePhoneChange));
  }

  if (emailInput) {
    emailInput.addEventListener('change', handleEmailChange);
    cleanupCallbacks.push(() => emailInput.removeEventListener('change', handleEmailChange));
  }

  if (passwordInput) {
    passwordInput.addEventListener('change', handlePasswordChange);
    cleanupCallbacks.push(() => passwordInput.removeEventListener('change', handlePasswordChange));
  }

  const unsubscribeThemeListener = subscribeThemeChange(() => {
    updateThemeActionContent();
  });
  cleanupCallbacks.push(unsubscribeThemeListener);

  const updateForm = () => {
    const user = activeUser;
    const isEnabled = Boolean(user);

    if (nameInput) {
      nameInput.value = user?.name ?? '';
      nameInput.disabled = !isEnabled;
    }

    if (phoneInput) {
      phoneInput.value = user?.phone ? formatPhoneNumberForDisplay(user.phone) : '';
      phoneInput.disabled = !isEnabled;
    }

    if (emailInput) {
      emailInput.value = user?.profile?.email ?? '';
      emailInput.disabled = !isEnabled;
    }

    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.disabled = !isEnabled;
    }

    if (!isEnabled) {
      userDataExpanded = false;
    }

    updateSummary();
    updateUserDataViewState();
  };

  const updateActionState = () => {
    const hasUser = Boolean(activeUser);
    if (themeAction) {
      const shouldDisable = !hasUser || busyButtons.has(themeAction.button);
      themeAction.button.disabled = shouldDisable;
    }

    accessActions.forEach(({ button, requiresSession }) => {
      const shouldDisable = (requiresSession && !hasUser) || busyButtons.has(button);
      button.disabled = shouldDisable;
    });

    if (accessWidget instanceof HTMLElement) {
      accessWidget.dataset.state = hasUser ? 'ready' : 'empty';
    }
  };

  const syncActiveUser = () => {
    const source = (activeUserId != null && usersById.get(activeUserId)) || sessionSnapshot;
    activeUser = normalizeUserData(source);

    if (!activeUser) {
      userDataExpanded = false;
    }

    updateForm();
    updateActionState();
    updateThemeActionContent();
  };

  const unsubscribeSession = subscribeSession((user) => {
    sessionSnapshot = user;
    activeUserId = user?.id ?? activeUserId ?? null;
    syncActiveUser();
  });
  unsubscribeCallbacks.push(unsubscribeSession);

  const unsubscribeUsers = subscribeUsers((users) => {
    usersById.clear();

    if (Array.isArray(users)) {
      users.forEach((user) => {
        if (user && user.id != null) {
          usersById.set(user.id, user);
        }
      });
    }

    syncActiveUser();
  });
  unsubscribeCallbacks.push(unsubscribeUsers);

  syncActiveUser();

  registerViewCleanup(viewRoot, () => {
    unsubscribeCallbacks.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Erro ao remover assinatura do painel do usuário.', error);
      }
    });

    cleanupCallbacks.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error('Erro ao limpar listeners do painel do usuário.', error);
      }
    });
  });
}
