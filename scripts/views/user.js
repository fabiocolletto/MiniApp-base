import {
  subscribeUsers,
  updateUser,
  deleteUser,
  sanitizeUserThemePreference,
  sanitizeUserFooterIndicatorsPreference,
  getDefaultUserPreferences,
} from '../data/user-store.js';
import {
  setThemePreference,
  getResolvedTheme,
  subscribeThemeChange,
} from '../theme/theme-manager.js';
import {
  setFooterIndicatorsPreference,
  getFooterIndicatorsPreference,
  subscribeFooterIndicatorsChange,
  sanitizeFooterIndicatorsPreference,
} from '../preferences/footer-indicators.js';
import { getActiveUserId, subscribeSession, clearActiveUser } from '../data/session-store.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createUserForm, tagFormElement } from './shared/user-form-sections.js';
import { formatPhoneNumberForDisplay, validatePhoneNumber } from './shared/validation.js';
import {
  createQuickAction,
  createQuickActionsWidget,
  createUserDashboardIntroWidget,
  createUserDashboardLabelWidget,
  createUserDashboardUsersWidget,
} from './shared/user-dashboard-widgets.js';
import eventBus from '../events/event-bus.js';
import {
  markActivityDirty,
  markActivitySaving,
  markActivitySaved,
  markActivityIdle,
  markActivityError,
} from '../system/activity-indicator.js';

const BASE_CLASSES = 'card view dashboard-view view--user user-dashboard';

const HTMLElementRef = typeof HTMLElement === 'undefined' ? null : HTMLElement;

const AUTO_FOCUS_ON_OPEN = (() => {
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return false;
  }

  const root = document.documentElement;
  if (!root || (HTMLElementRef && !(root instanceof HTMLElementRef))) {
    return false;
  }

  try {
    const computed = window.getComputedStyle(root);
    const rawValue = computed.getPropertyValue('--system-interaction-auto-focus-open');
    const normalized = typeof rawValue === 'string' ? rawValue.trim().toLowerCase() : '';
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
  } catch (error) {
    console.error('Não foi possível ler o padrão de auto foco do sistema.', error);
    return false;
  }
})();

function normalizePreferences(preferences) {
  const defaults = getDefaultUserPreferences();
  const normalized = { ...defaults };

  if (preferences && typeof preferences === 'object') {
    if (Object.prototype.hasOwnProperty.call(preferences, 'theme')) {
      normalized.theme = sanitizeUserThemePreference(preferences.theme);
    }

    if (Object.prototype.hasOwnProperty.call(preferences, 'footerIndicators')) {
      normalized.footerIndicators = sanitizeUserFooterIndicatorsPreference(preferences.footerIndicators);
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
      activity,
    } = {},
  ) {
    const activityOptions = activity && typeof activity === 'object' ? activity : null;
    const activitySource =
      activityOptions && typeof activityOptions.source === 'string' && activityOptions.source.trim()
        ? activityOptions.source.trim()
        : 'global';

    const buildActivityPayload = (messageKey, detailsKey) => {
      const payload = { source: activitySource };

      if (activityOptions && messageKey && Object.prototype.hasOwnProperty.call(activityOptions, messageKey)) {
        const messageValue = activityOptions[messageKey];
        if (typeof messageValue === 'string') {
          payload.message = messageValue;
        } else if (messageValue == null) {
          payload.message = '';
        }
      }

      if (activityOptions && detailsKey && Object.prototype.hasOwnProperty.call(activityOptions, detailsKey)) {
        const detailsValue = activityOptions[detailsKey];
        if (typeof detailsValue === 'string') {
          payload.details = detailsValue;
        } else if (detailsValue == null) {
          payload.details = '';
        }
      }

      return payload;
    };

    const runActivityCallback = (callbackName) => {
      if (!activityOptions) {
        return;
      }

      const callback = activityOptions[callbackName];
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (error) {
          console.error('Erro ao executar retorno do indicador de atividade.', error);
        }
      }
    };

    const hasUpdates = updates && typeof updates === 'object' && Object.keys(updates).length > 0;
    if (!hasUpdates) {
      if (activityOptions) {
        markActivityIdle(buildActivityPayload('noChangesMessage', 'noChangesDetails'));
        runActivityCallback('onNoChanges');
        runActivityCallback('onComplete');
      }
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
      if (activityOptions) {
        markActivityError(buildActivityPayload('missingSessionMessage', 'missingSessionDetails'));
        runActivityCallback('onMissingSession');
        runActivityCallback('onComplete');
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

    if (activityOptions) {
      markActivitySaving(buildActivityPayload('savingMessage', 'savingDetails'));
    }

    toggleBusyState(true);

    try {
      await updateUserFn(activeUser.id, updates);
      if (activityOptions) {
        markActivitySaved(buildActivityPayload('savedMessage', 'savedDetails'));
      }
      if (feedback?.show) {
        feedback.show(successMessage, { isError: false });
      }
      return { status: 'success' };
    } catch (error) {
      console.error('Erro ao persistir alterações no painel do usuário.', error);
      if (activityOptions) {
        markActivityError(buildActivityPayload('errorMessage', 'errorDetails'));
      }
      if (feedback?.show) {
        feedback.show(errorMessage, { isError: true });
      }
      return { status: 'error', error };
    } finally {
      toggleBusyState(false);
      runActivityCallback('onComplete');
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

  const introWidget = createUserDashboardIntroWidget({
    description: 'Gerencie preferências e dados sincronizados com o painel administrativo.',
  });

  const labelWidget = createUserDashboardLabelWidget({
    panelLabel: 'Painel do usuário',
    projectLabel: 'MiniApp Base',
    extraLabels: ['Sessão sincronizada'],
  });

  let themeAction = null;
  let footerIndicatorsAction = null;

  const themeSectionControls = createQuickActionsWidget({
    id: 'theme',
    title: 'Preferências de tema',
    description:
      'Alterne rapidamente entre tema claro e escuro e mantenha sua escolha sincronizada em todos os acessos.',
    defaultExpanded: true,
    extraClasses: ['user-dashboard__widget--theme'],
  });
  const themeActionList = themeSectionControls.actionList;

  const accessSectionControls = createQuickActionsWidget({
    id: 'access',
    title: 'Sessão e acesso',
    description:
      'Gerencie a sessão rapidamente: faça logoff, troque de usuário ou remova os dados salvos deste dispositivo.',
    defaultExpanded: true,
    extraClasses: ['user-panel__widget--access'],
  });
  const accessActionList = accessSectionControls.actionList;

  const accessFeedback = document.createElement('p');
  accessFeedback.className = 'form-message user-form__feedback user-dashboard__feedback';
  accessFeedback.hidden = true;
  accessFeedback.setAttribute('aria-live', 'polite');

  accessSectionControls.content.append(accessFeedback);

  const userDataSectionIdentifier = 'dados do usuário';
  const userDataContent = document.createElement('div');
  userDataContent.className = 'user-panel__widget-content user-dashboard__user-data-content';

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
    ],
    extras: [],
  });

  accountForm.hidden = true;
  tagFormElement(userDataSectionIdentifier, accountForm);

  userDataContent.append(accountSummary, emptyState, feedbackElement, accountForm);

  const userDataWidgetInstance = createUserDashboardUsersWidget({
    title: 'Dados do usuário',
    description:
      'Visualize e mantenha sincronizados os dados principais da sua conta com o painel administrativo.',
    emptyStateMessage: 'Nenhuma sessão ativa. Faça login para atualizar seus dados.',
    renderDetails: () => {
      const panel = document.createElement('div');
      panel.className =
        'admin-user-table__details-panel user-panel__widget-content user-dashboard__user-data-content';

      const intro = document.createElement('p');
      intro.className = 'admin-user-table__details-intro';
      intro.textContent = 'Gerencie seus dados principais sincronizados com o painel administrativo.';

      panel.append(intro, userDataContent);
      return panel;
    },
  });

  const userDataWidget = userDataWidgetInstance.widget;
  userDataWidget.dataset.sectionId = 'user-data';
  userDataWidget.dataset.sectionState = 'empty';
  userDataWidget.append(userDataContent);

  const findFieldEntry = (key) => accountFields.find((field) => field.key === key) ?? { field: null, input: null };

  const nameField = findFieldEntry('name').field;
  const phoneField = findFieldEntry('phone').field;
  const emailField = findFieldEntry('email').field;

  const themeWidget = themeSectionControls.section;
  const accessWidget = accessSectionControls.section;
  const accountWidget = userDataWidget;

  layout.append(introWidget, labelWidget, themeWidget, accessWidget, accountWidget);
  viewRoot.replaceChildren(layout);

  const cleanupCallbacks = [];
  cleanupCallbacks.push(userDataWidgetInstance.teardown);
  [themeSectionControls, accessSectionControls]
    .map((controls) => controls?.cleanup)
    .filter((cleanup) => typeof cleanup === 'function')
    .forEach((cleanup) => cleanupCallbacks.push(cleanup));

  const handleUserWidgetToggle = (event) => {
    const detail = event?.detail ?? {};
    const { user, expanded } = detail;
    const eventUserId = user?.id != null ? String(user.id) : null;
    const activeId = activeUser?.id != null ? String(activeUser.id) : null;
    const matchesActive = Boolean(eventUserId && activeId && eventUserId === activeId);

    if (expanded && !matchesActive) {
      return;
    }

    const previousExpanded = userDataExpanded;
    userDataExpanded = Boolean(expanded && matchesActive);
    updateUserDataViewState();

    if (
      AUTO_FOCUS_ON_OPEN &&
      userDataExpanded &&
      !previousExpanded &&
      nameInput instanceof HTMLElement &&
      typeof nameInput.focus === 'function'
    ) {
      try {
        nameInput.focus();
      } catch (error) {
        // Ignora navegadores ou ambientes sem suporte a foco programático.
      }
    }
  };

  userDataWidget.addEventListener('system-users-widget:toggle', handleUserWidgetToggle);
  cleanupCallbacks.push(() =>
    userDataWidget.removeEventListener('system-users-widget:toggle', handleUserWidgetToggle),
  );
  const unsubscribeCallbacks = [];

  const usersById = new Map();
  let activeUserId = getActiveUserId();
  let sessionSnapshot = null;
  let activeUser = null;
  let userDataExpanded = false;

  const nameInput = nameField.querySelector('input');
  const phoneInput = phoneField.querySelector('input');
  const emailInput = emailField.querySelector('input');
  [nameInput, phoneInput, emailInput]
    .filter((field) => field instanceof HTMLElement)
    .forEach((field) => {
      field.setAttribute('aria-describedby', feedbackElementId);
    });

  const ACTIVITY_SOURCE = 'user-panel';
  const activityLabels = {
    dirtyMessage: 'Alterações pendentes no painel do usuário',
    dirtyDetails: 'Suas edições serão salvas automaticamente.',
    savingMessage: 'Sincronizando alterações do painel do usuário',
    savingDetails: 'Estamos atualizando seus dados na memória local.',
    savedMessage: 'Painel do usuário sincronizado',
    savedDetails: 'As alterações foram salvas automaticamente.',
    errorMessage: 'Não foi possível salvar alterações do painel do usuário',
    errorDetails: 'Verifique os campos e tente novamente.',
    missingSessionMessage: 'Sessão inativa para salvar alterações',
    missingSessionDetails: 'Entre para sincronizar seus dados automaticamente.',
    noChangesMessage: 'Nenhuma alteração pendente no painel do usuário',
    noChangesDetails: 'Os dados exibidos correspondem à última sincronização.',
  };

  let hasPendingChanges = false;

  const computeDirtyState = () => {
    if (!activeUser) {
      return false;
    }

    if (nameInput && nameInput.value.trim() !== (activeUser.name ?? '').trim()) {
      return true;
    }

    if (phoneInput) {
      const inputDigits = typeof phoneInput.value === 'string' ? phoneInput.value.replace(/\D+/g, '') : '';
      const storedDigits = typeof activeUser.phone === 'string' ? activeUser.phone.replace(/\D+/g, '') : '';
      if (inputDigits !== storedDigits) {
        return true;
      }
    }

    if (emailInput && emailInput.value.trim() !== (activeUser.profile?.email ?? '').trim()) {
      return true;
    }

    return false;
  };

  const forceActivityIdle = ({ message, details } = {}) => {
    hasPendingChanges = false;
    const payload = { source: ACTIVITY_SOURCE };
    if (typeof message === 'string') {
      payload.message = message;
    }
    if (typeof details === 'string') {
      payload.details = details;
    }
    markActivityIdle(payload);
  };

  const refreshDirtyFlag = ({ allowIdle = true, force = false } = {}) => {
    const dirty = computeDirtyState();

    if (dirty) {
      if (!hasPendingChanges || force) {
        hasPendingChanges = true;
        markActivityDirty({
          source: ACTIVITY_SOURCE,
          message: activityLabels.dirtyMessage,
          details: activityLabels.dirtyDetails,
        });
      }
      return true;
    }

    if (hasPendingChanges || force) {
      hasPendingChanges = false;
      if (allowIdle) {
        forceActivityIdle({
          message: activityLabels.noChangesMessage,
          details: activityLabels.noChangesDetails,
        });
      }
    }

    return false;
  };

  const handleFieldInput = () => {
    refreshDirtyFlag({ allowIdle: true, force: true });
  };

  [nameInput, phoneInput, emailInput]
    .filter((field) => field instanceof HTMLElement)
    .forEach((field) => {
      field.addEventListener('input', handleFieldInput);
      cleanupCallbacks.push(() => field.removeEventListener('input', handleFieldInput));
    });

  forceActivityIdle();

  const activityConfig = {
    source: ACTIVITY_SOURCE,
    savingMessage: activityLabels.savingMessage,
    savingDetails: activityLabels.savingDetails,
    savedMessage: activityLabels.savedMessage,
    savedDetails: activityLabels.savedDetails,
    errorMessage: activityLabels.errorMessage,
    errorDetails: activityLabels.errorDetails,
    missingSessionMessage: activityLabels.missingSessionMessage,
    missingSessionDetails: activityLabels.missingSessionDetails,
    noChangesMessage: activityLabels.noChangesMessage,
    noChangesDetails: activityLabels.noChangesDetails,
    onComplete: () => {
      refreshDirtyFlag({ allowIdle: false, force: true });
    },
    onNoChanges: () => {
      refreshDirtyFlag({ allowIdle: true, force: true });
    },
    onMissingSession: () => {
      hasPendingChanges = false;
    },
  };

  cleanupCallbacks.push(() => {
    hasPendingChanges = false;
    markActivityIdle({ source: ACTIVITY_SOURCE });
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
    [phoneInput]
      .filter((field) => field instanceof HTMLElement)
      .forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
  };

  const resetFeedback = () => {
    showFeedback('', {});
    clearFieldValidity();
  };

  const restoreUserDataContentToRoot = () => {
    if (!(userDataContent instanceof HTMLElement)) {
      return;
    }

    if (userDataContent.parentElement !== userDataWidget) {
      userDataWidget.append(userDataContent);
    }
  };

  const updateUserDataViewState = () => {
    const hasUser = Boolean(activeUser);

    if (!hasUser) {
      userDataExpanded = false;
      restoreUserDataContentToRoot();
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

    accountWidget.dataset.sectionState = hasUser ? (userDataExpanded ? 'expanded' : 'collapsed') : 'empty';
  };

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

  const resolveFooterIndicatorsPreference = () => {
    if (activeUser?.preferences?.footerIndicators) {
      return sanitizeUserFooterIndicatorsPreference(activeUser.preferences.footerIndicators);
    }

    return sanitizeFooterIndicatorsPreference(getFooterIndicatorsPreference());
  };

  const computeNextFooterIndicatorsPreference = () =>
    resolveFooterIndicatorsPreference() === 'visible' ? 'hidden' : 'visible';

  const formatFooterIndicatorsActionTitle = () => {
    const currentPreference = resolveFooterIndicatorsPreference();

    if (!activeUser) {
      return currentPreference === 'hidden'
        ? 'Indicadores ocultos no rodapé'
        : 'Indicadores visíveis no rodapé';
    }

    return currentPreference === 'hidden'
      ? 'Indicadores do rodapé ocultos'
      : 'Indicadores do rodapé visíveis';
  };

  const formatFooterIndicatorsActionDescription = () => {
    if (!activeUser) {
      return 'Inicie uma sessão para sincronizar sua preferência de indicadores.';
    }

    const nextPreference = computeNextFooterIndicatorsPreference();
    return nextPreference === 'hidden'
      ? 'Clique para ocultar os indicadores de status e versão do rodapé.'
      : 'Clique para exibir novamente os indicadores de status e versão.';
  };

  const updateFooterIndicatorsActionContent = () => {
    if (!footerIndicatorsAction) {
      return;
    }

    const currentPreference = resolveFooterIndicatorsPreference();
    const nextPreference = computeNextFooterIndicatorsPreference();

    footerIndicatorsAction.labelElement.textContent = formatFooterIndicatorsActionTitle();
    footerIndicatorsAction.descriptionElement.textContent = formatFooterIndicatorsActionDescription();
    footerIndicatorsAction.button.dataset.footerIndicatorsPreference = currentPreference;
    footerIndicatorsAction.button.dataset.footerIndicatorsTarget = nextPreference;
    footerIndicatorsAction.button.setAttribute('aria-pressed', currentPreference === 'visible' ? 'true' : 'false');
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
        activity: activityConfig,
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

  const handleFooterIndicatorsToggle = async () => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para ajustar os indicadores.', { isError: true });
      return;
    }

    const nextPreference = computeNextFooterIndicatorsPreference();

    resetFeedback();

    const result = await persistUserChanges(
      { preferences: { footerIndicators: nextPreference } },
      {
        feedback: {
          reset: resetFeedback,
          show: (message, options = {}) => {
            showFeedback(message, options);
          },
        },
        busyTargets: [footerIndicatorsAction?.button].filter(Boolean),
        successMessage:
          nextPreference === 'hidden'
            ? 'Indicadores ocultados com sucesso!'
            : 'Indicadores exibidos com sucesso!',
        errorMessage: 'Não foi possível atualizar os indicadores. Tente novamente.',
        missingSessionMessage: 'Nenhuma sessão ativa. Faça login para ajustar os indicadores.',
        activity: activityConfig,
      },
    );

    if (result.status !== 'success') {
      return;
    }

    setFooterIndicatorsPreference(nextPreference);

    if (activeUser?.preferences) {
      activeUser.preferences.footerIndicators = nextPreference;
    }
    if (activeUser) {
      activeUser.updatedAt = new Date();
    }

    updateActionState();
    updateFooterIndicatorsActionContent();
  };

  footerIndicatorsAction = createQuickAction({
    label: 'Indicadores visíveis no rodapé',
    description: 'Clique para controlar os indicadores de status e versão.',
    onClick: handleFooterIndicatorsToggle,
    extraClass: 'user-dashboard__quick-action-button--footer',
  });

  themeActionList.append(themeAction.item, footerIndicatorsAction.item);
  cleanupCallbacks.push(themeAction.cleanup, footerIndicatorsAction.cleanup);
  updateThemeActionContent();
  updateFooterIndicatorsActionContent();

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

    if (updates.preferences?.footerIndicators) {
      activeUser.preferences.footerIndicators = sanitizeUserFooterIndicatorsPreference(
        updates.preferences.footerIndicators,
      );
    }

    if (Object.keys(updates).length > 0) {
      activeUser.updatedAt = new Date();
    }
  };

  const persistUpdates = async (updates, { successMessage, busyTargets = [] } = {}) => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      markActivityError({
        source: ACTIVITY_SOURCE,
        message: activityLabels.missingSessionMessage,
        details: activityLabels.missingSessionDetails,
      });
      hasPendingChanges = false;
      return { status: 'no-session' };
    }

    const hasUpdates = updates && typeof updates === 'object' && Object.keys(updates).length > 0;
    if (!hasUpdates) {
      refreshDirtyFlag({ allowIdle: true, force: true });
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
      activity: activityConfig,
    });

    if (result.status !== 'success') {
      return result;
    }

    applySnapshotUpdates(updates);
    updateForm({ allowIdleReset: false });
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
      refreshDirtyFlag({ allowIdle: true, force: true });
      return;
    }

    await persistUpdates(
      { name: nextName },
      {
        successMessage: 'Nome atualizado com sucesso!',
        busyTargets: [nameInput].filter((element) => element instanceof HTMLElement),
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
      refreshDirtyFlag({ allowIdle: true, force: true });
      return;
    }

    const result = await persistUpdates(
      { phone: sanitizedPhone },
      {
        successMessage: 'Telefone atualizado com sucesso!',
        busyTargets: [phoneInput].filter((element) => element instanceof HTMLElement),
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
      refreshDirtyFlag({ allowIdle: true, force: true });
      return;
    }

    await persistUpdates(
      { profile: { email: nextEmail } },
      {
        successMessage: 'E-mail atualizado com sucesso!',
        busyTargets: [emailInput].filter((element) => element instanceof HTMLElement),
      },
    );
  };

  const persistAllFields = async ({ showNoChangesFeedback = true } = {}) => {
    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      markActivityError({
        source: ACTIVITY_SOURCE,
        message: activityLabels.missingSessionMessage,
        details: activityLabels.missingSessionDetails,
      });
      hasPendingChanges = false;
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

    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    if (Object.keys(updates).length === 0) {
      if (showNoChangesFeedback) {
        showFeedback('Nenhuma alteração para salvar.', { isError: false });
      }
      refreshDirtyFlag({ allowIdle: true, force: true });
      return { status: 'no-changes' };
    }

    const busyTargets = [nameInput, phoneInput, emailInput].filter((element) => element instanceof HTMLElement);

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

  const unsubscribeThemeListener = subscribeThemeChange(() => {
    updateThemeActionContent();
  });
  cleanupCallbacks.push(unsubscribeThemeListener);

  const unsubscribeFooterIndicatorsListener = subscribeFooterIndicatorsChange(() => {
    updateFooterIndicatorsActionContent();
  });
  cleanupCallbacks.push(unsubscribeFooterIndicatorsListener);

  const updateForm = ({ allowIdleReset = true } = {}) => {
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

    if (!isEnabled) {
      userDataExpanded = false;
    }

    updateSummary();
    updateUserDataViewState();
    refreshDirtyFlag({ allowIdle: allowIdleReset, force: true });
  };

  const updateActionState = () => {
    const hasUser = Boolean(activeUser);
    if (themeAction) {
      const shouldDisable = !hasUser || busyButtons.has(themeAction.button);
      themeAction.button.disabled = shouldDisable;
    }

    if (footerIndicatorsAction) {
      const shouldDisable = !hasUser || busyButtons.has(footerIndicatorsAction.button);
      footerIndicatorsAction.button.disabled = shouldDisable;
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

    if (source) {
      userDataWidgetInstance.setUsers([source]);
    } else {
      userDataWidgetInstance.setUsers([]);
    }

    updateForm();
    updateActionState();
    updateThemeActionContent();
    updateFooterIndicatorsActionContent();
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
