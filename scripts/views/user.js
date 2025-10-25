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
  createUserDashboardTaskSummaryWidget,
  createUserDashboardUsersWidget,
} from './shared/user-dashboard-widgets.js';
import { formatDateTime, formatUserType } from './shared/system-users-widget.js';
import eventBus from '../events/event-bus.js';
import {
  markActivityDirty,
  markActivitySaving,
  markActivitySaved,
  markActivityIdle,
  markActivityError,
} from '../system/activity-indicator.js';
import { lookupCep, normalizeCep } from '../utils/cep-service.js';
import {
  listTasks as listDashboardTasks,
  seedTaskStore as seedTaskStoreDefaults,
  subscribeTasks as subscribeDashboardTasks,
} from '../../core/task-store.js';
import { DEFAULT_TASKS } from '../data/task-dashboard-defaults.js';

const BASE_CLASSES = 'card view dashboard-view view--user user-dashboard';

const HTMLElementRef = typeof HTMLElement === 'undefined' ? null : HTMLElement;
const DocumentRef = typeof document === 'undefined' ? null : document;

const getActiveElement = () => {
  if (!DocumentRef || !HTMLElementRef) {
    return null;
  }

  const active = DocumentRef.activeElement;
  return active instanceof HTMLElementRef ? active : null;
};

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
  const profileAddress = typeof user?.profile?.address === 'string' ? user.profile.address.trim() : '';
  const profileAddressNumber =
    typeof user?.profile?.addressNumber === 'string' ? user.profile.addressNumber.trim() : '';
  const profileAddressComplement =
    typeof user?.profile?.addressComplement === 'string' ? user.profile.addressComplement.trim() : '';
  const profileAddressDistrict =
    typeof user?.profile?.addressDistrict === 'string' ? user.profile.addressDistrict.trim() : '';
  const profileAddressCity =
    typeof user?.profile?.addressCity === 'string' ? user.profile.addressCity.trim() : '';
  const profileAddressState =
    typeof user?.profile?.addressState === 'string'
      ? user.profile.addressState.trim().slice(0, 2).toUpperCase()
      : '';
  const profileAddressZip =
    typeof user?.profile?.addressZip === 'string' ? normalizeCep(user.profile.addressZip).slice(0, 8) : '';
  const profileAddressCountry =
    typeof user?.profile?.addressCountry === 'string' ? user.profile.addressCountry.trim() : '';

  const createdAtRaw = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const updatedAtRaw = user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt);
  const lastAccessAtRaw =
    user.lastAccessAt instanceof Date ? user.lastAccessAt : new Date(user.lastAccessAt ?? user.updatedAt);

  const createdAt = createdAtRaw instanceof Date && !Number.isNaN(createdAtRaw.getTime()) ? createdAtRaw : null;
  const updatedAt = updatedAtRaw instanceof Date && !Number.isNaN(updatedAtRaw.getTime()) ? updatedAtRaw : null;
  const lastAccessAt =
    lastAccessAtRaw instanceof Date && !Number.isNaN(lastAccessAtRaw.getTime())
      ? lastAccessAtRaw
      : updatedAt;

  const userType = typeof user.userType === 'string' ? user.userType.trim().toLowerCase() : 'usuario';

  return {
    id,
    name,
    phone,
    profile: {
      email: profileEmail,
      address: profileAddress,
      addressNumber: profileAddressNumber,
      addressComplement: profileAddressComplement,
      addressDistrict: profileAddressDistrict,
      addressCity: profileAddressCity,
      addressState: profileAddressState,
      addressZip: profileAddressZip,
      addressCountry: profileAddressCountry,
    },
    preferences: normalizePreferences(user.preferences),
    userType,
    createdAt,
    lastAccessAt,
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

const TASK_STATUS_SUMMARY_VALUES = new Set(['backlog', 'in-progress', 'review', 'blocked', 'done']);

function normalizeTaskStatus(value) {
  if (typeof value !== 'string') {
    return 'backlog';
  }

  const normalized = value.trim().toLowerCase();
  return TASK_STATUS_SUMMARY_VALUES.has(normalized) ? normalized : 'backlog';
}

function parseTaskDueDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function getTaskDueStateForSummary(date, status) {
  if (status === 'done') {
    return 'completed';
  }

  if (!(date instanceof Date)) {
    return 'unscheduled';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date.getTime());
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) {
    return 'overdue';
  }

  if (due.getTime() === today.getTime()) {
    return 'today';
  }

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 3) {
    return 'soon';
  }

  return 'scheduled';
}

function summarizeTaskSnapshot(tasks) {
  const summary = {
    total: 0,
    active: 0,
    inProgress: 0,
    blocked: 0,
    completed: 0,
    dueSoon: 0,
  };

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return summary;
  }

  tasks.forEach((task) => {
    const status = normalizeTaskStatus(task?.status);
    const dueDate = parseTaskDueDate(task?.dueDate);
    const dueState = getTaskDueStateForSummary(dueDate, status);

    summary.total += 1;

    if (status === 'done') {
      summary.completed += 1;
    } else {
      summary.active += 1;
    }

    if (status === 'in-progress') {
      summary.inProgress += 1;
    }

    if (status === 'blocked') {
      summary.blocked += 1;
    }

    if (dueState === 'soon' || dueState === 'today') {
      summary.dueSoon += 1;
    }
  });

  return summary;
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

  const cleanupCallbacks = [];

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout user-dashboard__layout';

  const footerElement = document?.querySelector?.('footer') ?? null;
  let footerNoticeElement = null;
  let footerNoticeHideHandle = null;

  const hideFooterNotice = () => {
    if (footerNoticeHideHandle) {
      clearTimeout(footerNoticeHideHandle);
      footerNoticeHideHandle = null;
    }

    if (footerNoticeElement instanceof HTMLElement) {
      footerNoticeElement.classList.remove('footer-notice--visible');
      footerNoticeElement.hidden = true;
    }
  };

  const showFooterNotice = (message, { variant = 'success', duration = 4000 } = {}) => {
    const normalizedMessage = typeof message === 'string' ? message.trim() : '';

    if (!(footerElement instanceof HTMLElement) || !normalizedMessage) {
      return;
    }

    if (!(footerNoticeElement instanceof HTMLElement)) {
      footerNoticeElement = document.createElement('div');
      footerNoticeElement.className = 'footer-notice';
      footerNoticeElement.setAttribute('role', 'status');
      footerNoticeElement.setAttribute('aria-live', 'polite');
      footerNoticeElement.setAttribute('aria-atomic', 'true');

      const textElement = document.createElement('span');
      textElement.className = 'footer-notice__text';
      footerNoticeElement.append(textElement);

      footerElement.append(footerNoticeElement);
    }

    footerNoticeElement.hidden = false;
    footerNoticeElement.dataset.variant = variant;

    const textElement = footerNoticeElement.querySelector('.footer-notice__text');
    if (textElement instanceof HTMLElement) {
      textElement.textContent = normalizedMessage;
    }

    footerNoticeElement.classList.add('footer-notice--visible');

    if (footerNoticeHideHandle) {
      clearTimeout(footerNoticeHideHandle);
    }

    if (duration > 0) {
      footerNoticeHideHandle = setTimeout(() => {
        hideFooterNotice();
      }, duration);
    }
  };

  cleanupCallbacks.push(() => {
    hideFooterNotice();
    if (footerNoticeElement instanceof HTMLElement && footerNoticeElement.parentNode) {
      footerNoticeElement.parentNode.removeChild(footerNoticeElement);
    }
    footerNoticeElement = null;
  });

  const introWidget = createUserDashboardIntroWidget({
    description: 'Gerencie preferências e dados sincronizados com o painel administrativo.',
  });

  const labelWidget = createUserDashboardLabelWidget({
    panelLabel: 'Painel do usuário',
    projectLabel: 'MiniApp Base',
    extraLabels: ['Sessão sincronizada'],
  });

  const taskSummaryControls = createUserDashboardTaskSummaryWidget({
    onNavigate: () => {
      eventBus.emit('app:navigate', { view: 'tasks' });
    },
  });
  const taskSummaryWidget = taskSummaryControls.section;

  let themeAction = null;
  let footerIndicatorsAction = null;

  const themeSectionControls = createQuickActionsWidget({
    id: 'theme',
    title: 'Preferências de tema',
    description:
      'Alterne rapidamente entre tema claro e escuro e mantenha sua escolha sincronizada em todos os acessos.',
    defaultExpanded: true,
    extraClasses: ['user-dashboard__widget--theme', 'user-dashboard__widget--quick-actions'],
    collapsible: false,
  });
  const themeActionList = themeSectionControls.actionList;

  const accessSectionControls = createQuickActionsWidget({
    id: 'access',
    title: 'Sessão e acesso',
    description:
      'Gerencie a sessão rapidamente: faça logoff, troque de usuário ou remova os dados salvos deste dispositivo.',
    defaultExpanded: true,
    extraClasses: ['user-panel__widget--access', 'user-dashboard__widget--quick-actions'],
    collapsible: false,
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

  const summaryPreview = document.createElement('div');
  summaryPreview.className = 'user-dashboard__summary user-dashboard__summary--preview';
  summaryPreview.id = 'user-dashboard-summary-preview';
  summaryPreview.hidden = true;

  const summaryPreviewList = document.createElement('dl');
  summaryPreviewList.className = 'user-dashboard__summary-list user-dashboard__summary-list--preview';
  summaryPreviewList.id = 'user-dashboard-summary-preview-list';
  summaryPreviewList.hidden = true;

  const previewName = createSummaryItem('Nome');
  const previewPhone = createSummaryItem('Telefone');
  const previewType = createSummaryItem('Tipo');
  const previewLastAccess = createSummaryItem('Último acesso');
  const previewUpdated = createSummaryItem('Atualizado em');

  summaryPreviewList.append(
    previewName.wrapper,
    previewPhone.wrapper,
    previewType.wrapper,
    previewLastAccess.wrapper,
    previewUpdated.wrapper,
  );
  summaryPreview.append(summaryPreviewList);

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
  const summaryEmail = createSummaryItem('E-mail principal');
  const summaryAddress = createSummaryItem('Endereço principal');
  const summaryZip = createSummaryItem('CEP');
  const summaryLastAccess = createSummaryItem('Último acesso');

  accountSummaryList.append(
    summaryName.wrapper,
    summaryPhone.wrapper,
    summaryEmail.wrapper,
    summaryAddress.wrapper,
    summaryZip.wrapper,
    summaryLastAccess.wrapper,
  );
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
      {
        key: 'addressZip',
        size: 'compact',
        input: {
          id: 'user-dashboard-address-zip',
          label: 'CEP',
          type: 'text',
          placeholder: '00000-000',
          autocomplete: 'postal-code',
          inputMode: 'numeric',
          required: false,
        },
      },
      {
        key: 'address',
        size: 'wide',
        input: {
          id: 'user-dashboard-address',
          label: 'Logradouro',
          type: 'text',
          placeholder: 'Rua, avenida ou estrada',
          autocomplete: 'address-line1',
          required: false,
        },
      },
      {
        key: 'addressNumber',
        size: 'compact',
        input: {
          id: 'user-dashboard-address-number',
          label: 'Número',
          type: 'text',
          placeholder: '123',
          autocomplete: 'address-line2',
          inputMode: 'numeric',
          required: false,
        },
      },
      {
        key: 'addressComplement',
        size: 'wide',
        input: {
          id: 'user-dashboard-address-complement',
          label: 'Complemento',
          type: 'text',
          placeholder: 'Apartamento, bloco ou referência',
          autocomplete: 'address-line3',
          required: false,
        },
      },
      {
        key: 'addressDistrict',
        size: 'wide',
        input: {
          id: 'user-dashboard-address-district',
          label: 'Bairro',
          type: 'text',
          placeholder: 'Bairro',
          autocomplete: 'address-level3',
          required: false,
        },
      },
      {
        key: 'addressCity',
        size: 'wide',
        input: {
          id: 'user-dashboard-address-city',
          label: 'Cidade',
          type: 'text',
          placeholder: 'Cidade',
          autocomplete: 'address-level2',
          required: false,
        },
      },
      {
        key: 'addressState',
        size: 'compact',
        input: {
          id: 'user-dashboard-address-state',
          label: 'UF',
          type: 'text',
          placeholder: 'UF',
          autocomplete: 'address-level1',
          required: false,
        },
      },
      {
        key: 'addressCountry',
        size: 'compact',
        input: {
          id: 'user-dashboard-address-country',
          label: 'País',
          type: 'text',
          placeholder: 'Brasil',
          autocomplete: 'country-name',
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
  const userDataTableContainer = userDataWidget.querySelector('.admin-user-table-container');
  let summaryPreviewInserted = false;

  if (userDataTableContainer instanceof HTMLElement) {
    if (typeof userDataTableContainer.before === 'function') {
      userDataTableContainer.before(summaryPreview);
      summaryPreviewInserted = true;
    } else if (typeof userDataWidget.insertBefore === 'function') {
      userDataWidget.insertBefore(summaryPreview, userDataTableContainer);
      summaryPreviewInserted = true;
    }
  }

  if (!summaryPreviewInserted) {
    if (typeof userDataWidget.append === 'function') {
      userDataWidget.append(summaryPreview);
    } else if (typeof userDataWidget.appendChild === 'function') {
      userDataWidget.appendChild(summaryPreview);
    }
  }

  userDataWidget.append(userDataContent);

  let userDataTableBackdrop = null;
  let userDataTableModal = null;
  let userDataTableCloseButton = null;
  let overlayFocusRestorer = null;

  if (userDataTableContainer instanceof HTMLElement) {
    userDataTableBackdrop = document.createElement('div');
    userDataTableBackdrop.className = 'app-modal-backdrop user-dashboard__table-backdrop';
    userDataTableBackdrop.hidden = true;

    userDataTableModal = document.createElement('div');
    userDataTableModal.className = 'app-modal user-dashboard__table-modal';
    userDataTableModal.hidden = true;
    userDataTableModal.setAttribute('role', 'dialog');
    userDataTableModal.setAttribute('aria-modal', 'true');
    userDataTableModal.setAttribute('aria-hidden', 'true');

    const modalPanel = document.createElement('div');
    modalPanel.className = 'app-modal__panel app-modal__panel--miniapp user-dashboard__table-modal-panel';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'app-modal__header user-dashboard__table-header';

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'app-modal__title user-dashboard__table-title';
    modalTitle.id = 'user-dashboard-table-title';
    modalTitle.textContent = 'Usuários sincronizados';
    userDataTableModal.setAttribute('aria-labelledby', modalTitle.id);

    userDataTableCloseButton = document.createElement('button');
    userDataTableCloseButton.type = 'button';
    userDataTableCloseButton.className = 'app-modal__close user-dashboard__table-close';
    userDataTableCloseButton.setAttribute('aria-label', 'Fechar tabela de usuários');
    userDataTableCloseButton.textContent = 'Fechar';

    modalHeader.append(modalTitle, userDataTableCloseButton);

    const modalContent = document.createElement('div');
    modalContent.className = 'user-dashboard__table-content';
    const detachTableContainer = () => {
      const parent = userDataTableContainer.parentNode;

      if (!parent) {
        return;
      }

      if (typeof parent.removeChild === 'function') {
        parent.removeChild(userDataTableContainer);
        return;
      }

      if (Array.isArray(parent.children)) {
        parent.children = parent.children.filter((child) => child !== userDataTableContainer);
        userDataTableContainer.parentNode = null;
      }
    };

    detachTableContainer();
    modalContent.append(userDataTableContainer);

    modalPanel.append(modalHeader, modalContent);
    userDataTableModal.append(modalPanel);
  }

  const findFieldEntry = (key) => accountFields.find((field) => field.key === key) ?? { field: null, input: null };

  const nameField = findFieldEntry('name').field;
  const phoneField = findFieldEntry('phone').field;
  const emailField = findFieldEntry('email').field;
  const addressZipField = findFieldEntry('addressZip').field;
  const addressField = findFieldEntry('address').field;
  const addressNumberField = findFieldEntry('addressNumber').field;
  const addressComplementField = findFieldEntry('addressComplement').field;
  const addressDistrictField = findFieldEntry('addressDistrict').field;
  const addressCityField = findFieldEntry('addressCity').field;
  const addressStateField = findFieldEntry('addressState').field;
  const addressCountryField = findFieldEntry('addressCountry').field;

  accountForm.classList.add('user-dashboard__form--tabbed');

  const tabList = document.createElement('div');
  tabList.className = 'user-dashboard__tab-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Categorias de dados do usuário');

  const tabPanelsContainer = document.createElement('div');
  tabPanelsContainer.className = 'user-dashboard__tab-panels';

  const tabDefinitions = [
    {
      id: 'personal',
      label: 'Dados pessoais',
      fields: [nameField, phoneField, emailField],
    },
    {
      id: 'address',
      label: 'Endereço',
      fields: [
        addressZipField,
        addressField,
        addressNumberField,
        addressComplementField,
        addressDistrictField,
        addressCityField,
        addressStateField,
        addressCountryField,
      ],
    },
  ];

  const tabButtons = new Map();
  const tabPanels = new Map();
  let activeTabId = 'personal';

  const setActiveTab = (nextTabId, { focusTab = false } = {}) => {
    if (!tabButtons.has(nextTabId) || !tabPanels.has(nextTabId)) {
      return;
    }

    activeTabId = nextTabId;

    tabButtons.forEach((button, tabId) => {
      const isActive = tabId === nextTabId;
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.tabIndex = isActive ? 0 : -1;
      button.classList.toggle('user-dashboard__tab--active', isActive);
      if (isActive && focusTab && typeof button.focus === 'function') {
        try {
          button.focus();
        } catch (error) {
          // Ignora ambientes sem suporte a foco programático.
        }
      }
    });

    tabPanels.forEach((panel, tabId) => {
      panel.hidden = tabId !== nextTabId;
    });
  };

  const orderedTabIds = tabDefinitions.map((definition) => definition.id);

  tabDefinitions.forEach((definition) => {
    const tabId = definition.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'user-dashboard__tab';
    button.id = `user-dashboard-tab-${tabId}-trigger`;
    button.dataset.tab = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `user-dashboard-tab-${tabId}`);
    button.textContent = definition.label;

    const handleTabClick = () => {
      if (!userDataExpanded) {
        const targetId = activeUser?.id != null ? String(activeUser.id) : null;

        if (targetId) {
          const expandFn = userDataWidgetInstance?.setExpandedUser;

          if (typeof expandFn === 'function') {
            expandFn(targetId, true);
          }

          if (!userDataExpanded) {
            userDataExpanded = true;
            updateUserDataViewState();
          }
        }
      }

      setActiveTab(tabId, { focusTab: true });
    };

    button.addEventListener('click', handleTabClick);
    cleanupCallbacks.push(() => button.removeEventListener('click', handleTabClick));

    tabList.append(button);
    tabButtons.set(tabId, button);

    const panel = document.createElement('div');
    panel.className = 'user-dashboard__tab-panel';
    panel.id = `user-dashboard-tab-${tabId}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.dataset.tab = tabId;

    const panelFields = document.createElement('div');
    panelFields.className = 'user-dashboard__tab-panel-fields';
    definition.fields
      .filter((field) => field instanceof HTMLElement)
      .forEach((field) => {
        panelFields.append(field);
      });

    panel.append(panelFields);
    tabPanelsContainer.append(panel);
    tabPanels.set(tabId, panel);
  });

  const handleTabKeydown = (event) => {
    const key = event?.key;
    if (!key) {
      return;
    }

    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      const direction = key === 'ArrowRight' ? 1 : -1;
      const currentIndex = orderedTabIds.indexOf(activeTabId);
      const nextIndex = (currentIndex + direction + orderedTabIds.length) % orderedTabIds.length;
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      setActiveTab(orderedTabIds[nextIndex], { focusTab: true });
      return;
    }

    if (key === 'Home') {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      setActiveTab(orderedTabIds[0], { focusTab: true });
      return;
    }

    if (key === 'End') {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      setActiveTab(orderedTabIds[orderedTabIds.length - 1], { focusTab: true });
    }
  };

  tabList.addEventListener('keydown', handleTabKeydown);
  cleanupCallbacks.push(() => tabList.removeEventListener('keydown', handleTabKeydown));

  accountForm.replaceChildren(tabList, tabPanelsContainer);
  setActiveTab(activeTabId);

  const themeWidget = themeSectionControls.section;
  const accessWidget = accessSectionControls.section;
  const accountWidget = userDataWidget;

  layout.append(introWidget, labelWidget, taskSummaryWidget, themeWidget, accessWidget, accountWidget);

  if (userDataTableBackdrop instanceof HTMLElement) {
    layout.append(userDataTableBackdrop);
  }

  if (userDataTableModal instanceof HTMLElement) {
    layout.append(userDataTableModal);
  }

  viewRoot.replaceChildren(layout);

  cleanupCallbacks.push(userDataWidgetInstance.teardown);
  cleanupCallbacks.push(taskSummaryControls.cleanup);
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
  const taskDashboardUnsubscribes = [];

  let taskSummaryActive = true;
  cleanupCallbacks.push(() => {
    taskSummaryActive = false;
  });

  const applyTaskSummary = (tasks) => {
    if (!taskSummaryActive) {
      return;
    }

    const summary = summarizeTaskSnapshot(tasks);
    taskSummaryControls.setSummary(summary);
    taskSummaryControls.setState(summary.total > 0 ? 'ready' : 'empty');
  };

  try {
    const unsubscribeTasks = subscribeDashboardTasks((tasks) => {
      applyTaskSummary(tasks);
    });

    if (typeof unsubscribeTasks === 'function') {
      taskDashboardUnsubscribes.push(unsubscribeTasks);
    }
  } catch (error) {
    console.error('Erro ao inscrever resumo do painel de tarefas.', error);
    taskSummaryControls.setState('error');
  }

  (async () => {
    try {
      await seedTaskStoreDefaults(DEFAULT_TASKS);
      const tasks = await listDashboardTasks();
      applyTaskSummary(tasks);
    } catch (error) {
      console.error('Erro ao carregar resumo de tarefas para o painel do usuário.', error);
      if (taskSummaryActive) {
        taskSummaryControls.setState('error');
      }
    }
  })();

  const usersById = new Map();
  let activeUserId = getActiveUserId();
  let sessionSnapshot = null;
  let activeUser = null;
  let userDataExpanded = false;

  const nameInput = nameField?.querySelector('input');
  const phoneInput = phoneField?.querySelector('input');
  const emailInput = emailField?.querySelector('input');
  const addressZipInput = addressZipField?.querySelector('input');
  const addressInput = addressField?.querySelector('input');
  const addressNumberInput = addressNumberField?.querySelector('input');
  const addressComplementInput = addressComplementField?.querySelector('input');
  const addressDistrictInput = addressDistrictField?.querySelector('input');
  const addressCityInput = addressCityField?.querySelector('input');
  const addressStateInput = addressStateField?.querySelector('input');
  const addressCountryInput = addressCountryField?.querySelector('input');

  const inputsSharingFeedback = [
    nameInput,
    phoneInput,
    emailInput,
    addressZipInput,
    addressInput,
    addressNumberInput,
    addressComplementInput,
    addressDistrictInput,
    addressCityInput,
    addressStateInput,
    addressCountryInput,
  ];

  inputsSharingFeedback
    .filter((field) => field instanceof HTMLElement)
    .forEach((field) => {
      field.setAttribute('aria-describedby', feedbackElementId);
    });

  if (addressZipInput instanceof HTMLElement) {
    addressZipInput.setAttribute('maxlength', '9');
  }

  if (addressStateInput instanceof HTMLElement) {
    addressStateInput.setAttribute('maxlength', '2');
    addressStateInput.setAttribute('autocapitalize', 'characters');
  }

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
  let cepLookupController = null;

  const ADDRESS_PROFILE_KEYS = [
    'addressZip',
    'address',
    'addressNumber',
    'addressComplement',
    'addressDistrict',
    'addressCity',
    'addressState',
    'addressCountry',
  ];

  const PROFILE_FIELD_KEYS = ['email', ...ADDRESS_PROFILE_KEYS];

  const profileInputs = {
    email: emailInput,
    addressZip: addressZipInput,
    address: addressInput,
    addressNumber: addressNumberInput,
    addressComplement: addressComplementInput,
    addressDistrict: addressDistrictInput,
    addressCity: addressCityInput,
    addressState: addressStateInput,
    addressCountry: addressCountryInput,
  };

  const setInputValue = (input, value = '') => {
    if (input instanceof HTMLElement) {
      input.value = typeof value === 'string' ? value : '';
    }
  };

  const formatCepForDisplay = (value) => {
    const digits = normalizeCep(typeof value === 'string' ? value : '');
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    }
    return digits;
  };

  const sanitizeProfileValue = (key, value) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();

    if (key === 'addressZip') {
      return normalizeCep(trimmed).slice(0, 8);
    }

    if (key === 'addressState') {
      return trimmed.slice(0, 2).toUpperCase();
    }

    return trimmed.slice(0, 240);
  };

  const getStoredProfileValue = (key) => {
    const value = activeUser?.profile?.[key];
    return typeof value === 'string' ? value : '';
  };

  const getSanitizedInputValue = (key) => {
    const input = profileInputs[key];
    if (!input || typeof input.value !== 'string') {
      return '';
    }

    return sanitizeProfileValue(key, input.value);
  };

  const collectProfileUpdatesFromInputs = (keys = PROFILE_FIELD_KEYS) => {
    const updates = {};

    keys.forEach((key) => {
      const sanitized = getSanitizedInputValue(key);
      if (sanitized !== getStoredProfileValue(key)) {
        updates[key] = sanitized;
      }
    });

    return updates;
  };

  const applyProfileDisplayFormatting = () => {
    if (addressZipInput instanceof HTMLElement) {
      const cep = getStoredProfileValue('addressZip') || getSanitizedInputValue('addressZip');
      addressZipInput.value = formatCepForDisplay(cep);
    }

    if (addressStateInput instanceof HTMLElement) {
      const stateValue = getStoredProfileValue('addressState') || getSanitizedInputValue('addressState');
      addressStateInput.value = sanitizeProfileValue('addressState', stateValue);
    }
  };

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

    if (Object.keys(collectProfileUpdatesFromInputs()).length > 0) {
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

  inputsSharingFeedback
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
    const previewFallback = '—';

    if (previewName.valueElement) {
      previewName.valueElement.textContent = user?.name ? user.name : previewFallback;
    }

    if (previewPhone.valueElement) {
      previewPhone.valueElement.textContent = user?.phone
        ? formatPhoneNumberForDisplay(user.phone)
        : previewFallback;
    }

    if (previewType.valueElement) {
      previewType.valueElement.textContent = user ? formatUserType(user.userType) : previewFallback;
    }

    if (previewLastAccess.valueElement) {
      previewLastAccess.valueElement.textContent = user?.lastAccessAt
        ? formatDateTime(user.lastAccessAt)
        : previewFallback;
    }

    if (previewUpdated.valueElement) {
      previewUpdated.valueElement.textContent = user?.updatedAt
        ? formatDateTime(user.updatedAt)
        : previewFallback;
    }

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

    if (summaryAddress.valueElement) {
      const profile = user?.profile ?? {};
      const lines = [];

      if (profile.address) {
        const numberSegment = profile.addressNumber ? `, ${profile.addressNumber}` : '';
        const complementSegment = profile.addressComplement ? ` (${profile.addressComplement})` : '';
        lines.push(`${profile.address}${numberSegment}${complementSegment}`.trim());
      }

      const district = profile.addressDistrict ? profile.addressDistrict : '';
      const cityStateParts = [profile.addressCity, profile.addressState].filter(Boolean).join('/');
      const locality = [district, cityStateParts].filter(Boolean).join(' · ');
      if (locality) {
        lines.push(locality);
      }

      summaryAddress.valueElement.textContent = lines.length > 0 ? lines.join(' • ') : fallback;
    }

    if (summaryZip.valueElement) {
      const cep = user?.profile?.addressZip;
      summaryZip.valueElement.textContent = cep ? formatCepForDisplay(cep) : fallback;
    }

    if (summaryLastAccess.valueElement) {
      summaryLastAccess.valueElement.textContent = user?.lastAccessAt
        ? formatDateTime(user.lastAccessAt)
        : fallback;
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
    [phoneInput, addressZipInput]
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

    const shouldShowTableModal = Boolean(
      hasUser &&
      userDataExpanded &&
      userDataTableModal instanceof HTMLElement &&
      userDataTableBackdrop instanceof HTMLElement,
    );

    if (!shouldShowTableModal) {
      restoreUserDataContentToRoot();
    }

    if (userDataTableBackdrop instanceof HTMLElement) {
      if (shouldShowTableModal) {
        userDataTableBackdrop.hidden = false;
        userDataTableBackdrop.classList.add('app-modal-backdrop--visible');
      } else {
        userDataTableBackdrop.classList.remove('app-modal-backdrop--visible');
        userDataTableBackdrop.hidden = true;
      }
    }

    if (userDataTableModal instanceof HTMLElement) {
      if (shouldShowTableModal) {
        if (userDataTableModal.hidden) {
          overlayFocusRestorer = getActiveElement() ?? overlayFocusRestorer;
        }

        userDataTableModal.hidden = false;
        userDataTableModal.setAttribute('aria-hidden', 'false');

        if (
          HTMLElementRef &&
          userDataTableCloseButton instanceof HTMLElementRef &&
          typeof userDataTableCloseButton.focus === 'function'
        ) {
          try {
            userDataTableCloseButton.focus();
          } catch (error) {
            // Ignora ambientes sem suporte a foco programático.
          }
        }
      } else if (!userDataTableModal.hidden) {
        userDataTableModal.hidden = true;
        userDataTableModal.setAttribute('aria-hidden', 'true');

        const focusTarget = overlayFocusRestorer;
        overlayFocusRestorer = null;

        if (HTMLElementRef && focusTarget instanceof HTMLElementRef && typeof focusTarget.focus === 'function') {
          try {
            focusTarget.focus();
          } catch (error) {
            // Ignora ambientes sem suporte a foco programático.
          }
        }
      }
    }

    if (summaryPreview instanceof HTMLElement) {
      summaryPreview.hidden = !hasUser;
    }

    if (summaryPreviewList instanceof HTMLElement) {
      summaryPreviewList.hidden = !hasUser;
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

  const collapseUserDataOverlay = ({ notify = true } = {}) => {
    const targetId = activeUser?.id != null ? String(activeUser.id) : null;
    const collapseFn = userDataWidgetInstance?.setExpandedUser;

    if (typeof collapseFn === 'function') {
      collapseFn(targetId, false, { notify });
      return;
    }

    if (userDataExpanded) {
      userDataExpanded = false;
      updateUserDataViewState();
    }
  };

  const handleOverlayKeydown = (event) => {
    if (!event || event.key !== 'Escape') {
      return;
    }

    if (!(userDataTableModal instanceof HTMLElement) || userDataTableModal.hidden) {
      return;
    }

    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    collapseUserDataOverlay();
  };

  if (DocumentRef && typeof DocumentRef.addEventListener === 'function') {
    DocumentRef.addEventListener('keydown', handleOverlayKeydown);
    cleanupCallbacks.push(() => {
      if (typeof DocumentRef.removeEventListener === 'function') {
        DocumentRef.removeEventListener('keydown', handleOverlayKeydown);
      }
    });
  }

  if (userDataTableCloseButton instanceof HTMLElement) {
    const handleModalClose = () => collapseUserDataOverlay();
    userDataTableCloseButton.addEventListener('click', handleModalClose);
    cleanupCallbacks.push(() => userDataTableCloseButton.removeEventListener('click', handleModalClose));
  }

  if (userDataTableModal instanceof HTMLElement) {
    const handleModalClick = (event) => {
      if (event?.target === userDataTableModal) {
        collapseUserDataOverlay();
      }
    };

    userDataTableModal.addEventListener('click', handleModalClick);
    cleanupCallbacks.push(() => userDataTableModal.removeEventListener('click', handleModalClick));
  }

  if (userDataTableBackdrop instanceof HTMLElement) {
    const handleBackdropClick = () => collapseUserDataOverlay();
    userDataTableBackdrop.addEventListener('click', handleBackdropClick);
    cleanupCallbacks.push(() => userDataTableBackdrop.removeEventListener('click', handleBackdropClick));
  }

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

    if (updates.profile) {
      if (!activeUser.profile || typeof activeUser.profile !== 'object') {
        activeUser.profile = {};
      }

      Object.entries(updates.profile).forEach(([key, value]) => {
        if (typeof value === 'string') {
          activeUser.profile[key] = value;
        } else if (value == null) {
          activeUser.profile[key] = '';
        }
      });
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

  const persistProfileFields = async (
    keys,
    { successMessage, showNoChangesFeedback = false, busyTargets: overrideBusyTargets } = {},
  ) => {
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

    const profileUpdates = collectProfileUpdatesFromInputs(keys);

    if (Object.keys(profileUpdates).length === 0) {
      if (showNoChangesFeedback) {
        showFeedback('Nenhuma alteração para salvar.', { isError: false });
      }
      refreshDirtyFlag({ allowIdle: true, force: true });
      return { status: 'no-changes' };
    }

    const busyTargets = Array.isArray(overrideBusyTargets) && overrideBusyTargets.length > 0
      ? overrideBusyTargets.filter((element) => element instanceof HTMLElement)
      : keys.map((key) => profileInputs[key]).filter((element) => element instanceof HTMLElement);

    return persistUpdates(
      { profile: profileUpdates },
      {
        successMessage: successMessage ?? 'Alterações salvas com sucesso!',
        busyTargets,
      },
    );
  };

  const handleEmailChange = async () => {
    if (!emailInput) {
      return;
    }

    const nextEmail = getSanitizedInputValue('email');
    if (nextEmail === (activeUser?.profile?.email ?? '')) {
      resetFeedback();
      updateSummary();
      refreshDirtyFlag({ allowIdle: true, force: true });
      emailInput.value = nextEmail;
      return;
    }

    await persistProfileFields(['email'], {
      successMessage: 'E-mail atualizado com sucesso!',
      busyTargets: [emailInput],
    });
  };

  const handleAddressChange = async () => {
    const result = await persistProfileFields(ADDRESS_PROFILE_KEYS, {
      successMessage: 'Endereço atualizado com sucesso!',
    });

    if (result.status === 'success') {
      return;
    }

    applyProfileDisplayFormatting();
  };

  const handleCepChange = async () => {
    if (!(addressZipInput instanceof HTMLElement)) {
      return;
    }

    const sanitizedCep = sanitizeProfileValue('addressZip', addressZipInput.value);
    addressZipInput.value = formatCepForDisplay(sanitizedCep);

    if (!sanitizedCep) {
      addressZipInput.removeAttribute('aria-invalid');
      applyProfileDisplayFormatting();
      await persistProfileFields(['addressZip'], {
        successMessage: 'CEP removido com sucesso!',
        busyTargets: [addressZipInput],
      });
      return;
    }

    if (sanitizedCep.length !== 8) {
      addressZipInput.setAttribute('aria-invalid', 'true');
      showFeedback('Informe um CEP válido com 8 dígitos.', { isError: true });
      return;
    }

    setInputValue(addressNumberInput, '');
    setInputValue(addressComplementInput, '');
    setInputValue(addressCountryInput, '');

    if (cepLookupController) {
      try {
        cepLookupController.abort();
      } catch (error) {
        // Ignora navegadores sem suporte a abortar requisições.
      }
    }

    const controller = new AbortController();
    cepLookupController = controller;

    addressZipInput.removeAttribute('aria-invalid');
    addressZipInput.setAttribute('aria-busy', 'true');

    try {
      const result = await lookupCep(sanitizedCep, { signal: controller.signal });

      if (controller.signal.aborted) {
        return;
      }

      if (result.status === 'success') {
        const { address } = result;

        setInputValue(addressInput, sanitizeProfileValue('address', address?.street ?? ''));
        setInputValue(
          addressDistrictInput,
          sanitizeProfileValue('addressDistrict', address?.district ?? ''),
        );
        setInputValue(addressCityInput, sanitizeProfileValue('addressCity', address?.city ?? ''));
        setInputValue(
          addressStateInput,
          sanitizeProfileValue('addressState', address?.state ?? ''),
        );

        const persistResult = await persistProfileFields(ADDRESS_PROFILE_KEYS, {
          successMessage: '',
          busyTargets: [
            addressZipInput,
            addressInput,
            addressNumberInput,
            addressComplementInput,
            addressDistrictInput,
            addressCityInput,
            addressStateInput,
            addressCountryInput,
          ],
        });

        if (persistResult.status === 'success') {
          showFooterNotice('Endereço carregado a partir do CEP!', { variant: 'success' });
        }
        return;
      }

      if (result.status === 'not-found') {
        addressZipInput.setAttribute('aria-invalid', 'true');
        showFeedback('CEP não encontrado. Verifique o número e tente novamente.', { isError: true });
        return;
      }

      if (result.status !== 'aborted') {
        addressZipInput.setAttribute('aria-invalid', 'true');
        showFeedback('Não foi possível consultar o CEP. Tente novamente.', { isError: true });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        addressZipInput.setAttribute('aria-invalid', 'true');
        showFeedback('Não foi possível consultar o CEP. Tente novamente.', { isError: true });
      }
    } finally {
      if (cepLookupController === controller) {
        cepLookupController = null;
      }
      addressZipInput.removeAttribute('aria-busy');
      applyProfileDisplayFormatting();
    }
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

    const profileUpdates = collectProfileUpdatesFromInputs();
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

    const busyTargets = inputsSharingFeedback.filter((element) => element instanceof HTMLElement);

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

  ADDRESS_PROFILE_KEYS.forEach((key) => {
    if (key === 'addressZip') {
      return;
    }

    const input = profileInputs[key];
    if (!(input instanceof HTMLElement)) {
      return;
    }

    input.addEventListener('change', handleAddressChange);
    cleanupCallbacks.push(() => input.removeEventListener('change', handleAddressChange));
  });

  if (addressStateInput instanceof HTMLElement) {
    const handleStateInputFormat = () => {
      addressStateInput.value = sanitizeProfileValue('addressState', addressStateInput.value);
    };

    addressStateInput.addEventListener('input', handleStateInputFormat);
    cleanupCallbacks.push(() => addressStateInput.removeEventListener('input', handleStateInputFormat));
  }

  if (addressZipInput instanceof HTMLElement) {
    const handleCepBlur = () => {
      addressZipInput.value = formatCepForDisplay(addressZipInput.value);
    };

    addressZipInput.addEventListener('change', handleCepChange);
    cleanupCallbacks.push(() => addressZipInput.removeEventListener('change', handleCepChange));

    addressZipInput.addEventListener('blur', handleCepBlur);
    cleanupCallbacks.push(() => addressZipInput.removeEventListener('blur', handleCepBlur));
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

    if (addressZipInput) {
      addressZipInput.value = user?.profile?.addressZip ?? '';
      addressZipInput.disabled = !isEnabled;
    }

    if (addressInput) {
      addressInput.value = user?.profile?.address ?? '';
      addressInput.disabled = !isEnabled;
    }

    if (addressNumberInput) {
      addressNumberInput.value = user?.profile?.addressNumber ?? '';
      addressNumberInput.disabled = !isEnabled;
    }

    if (addressComplementInput) {
      addressComplementInput.value = user?.profile?.addressComplement ?? '';
      addressComplementInput.disabled = !isEnabled;
    }

    if (addressDistrictInput) {
      addressDistrictInput.value = user?.profile?.addressDistrict ?? '';
      addressDistrictInput.disabled = !isEnabled;
    }

    if (addressCityInput) {
      addressCityInput.value = user?.profile?.addressCity ?? '';
      addressCityInput.disabled = !isEnabled;
    }

    if (addressStateInput) {
      addressStateInput.value = user?.profile?.addressState ?? '';
      addressStateInput.disabled = !isEnabled;
    }

    if (addressCountryInput) {
      addressCountryInput.value = user?.profile?.addressCountry ?? '';
      addressCountryInput.disabled = !isEnabled;
    }

    if (!isEnabled) {
      userDataExpanded = false;
    }

    applyProfileDisplayFormatting();
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
    taskDashboardUnsubscribes.forEach((unsubscribe) => {
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (error) {
        console.error('Erro ao cancelar inscrição do resumo de tarefas.', error);
      }
    });

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
