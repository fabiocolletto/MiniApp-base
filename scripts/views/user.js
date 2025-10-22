import {
  subscribeUsers,
  updateUser,
  sanitizeUserThemePreference,
  getDefaultUserPreferences,
} from '../data/user-store.js';
import { setThemePreference } from '../theme/theme-manager.js';
import { clearActiveUser, getActiveUserId, subscribeSession } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { registerViewCleanup } from '../view-cleanup.js';
import { createInputField } from './shared/form-fields.js';
import { formatPhoneNumberForDisplay, validatePhoneNumber, validatePasswordStrength } from './shared/validation.js';

const BASE_CLASSES = 'card view view--user user-dashboard';

const USER_TYPE_LABELS = {
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuário',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function formatDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dateFormatter.format(value);
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return dateFormatter.format(parsed);
    }
  }

  return '—';
}

function formatThemeLabel(preference) {
  const normalized = sanitizeUserThemePreference(preference);

  switch (normalized) {
    case 'light':
      return 'Tema claro';
    case 'dark':
      return 'Tema escuro';
    default:
      return 'Tema automático';
  }
}

function formatUserTypeLabel(type) {
  if (typeof type !== 'string') {
    return USER_TYPE_LABELS.usuario;
  }

  const normalized = type.trim().toLowerCase();
  return USER_TYPE_LABELS[normalized] ?? USER_TYPE_LABELS.usuario;
}

function createStatItem(label) {
  const item = document.createElement('li');
  item.className = 'admin-dashboard__user-stat user-dashboard__stat';

  const valueElement = document.createElement('span');
  valueElement.className = 'admin-dashboard__user-stat-value';
  valueElement.textContent = '—';

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-stat-label';
  labelElement.textContent = label;

  item.append(valueElement, labelElement);

  return { item, valueElement };
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
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `admin-dashboard__user-action user-dashboard__quick-action ${extraClass}`.trim();

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-action-label';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'admin-dashboard__user-action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);

  let cleanup = () => {};

  if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
    cleanup = () => {
      button.removeEventListener('click', onClick);
    };
  }

  return { button, cleanup };
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

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title admin-dashboard__title';
  heading.textContent = 'Painel do usuário';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro admin-dashboard__intro';
  intro.textContent =
    'Gerencie rapidamente seus dados principais, acompanhe o status da sessão e ajuste preferências sem sair deste painel.';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout user-dashboard__layout';

  const overviewWidget = document.createElement('section');
  overviewWidget.className = 'user-panel__widget user-dashboard__widget user-dashboard__widget--overview';

  const overviewTitle = document.createElement('h2');
  overviewTitle.className = 'user-widget__title';
  overviewTitle.textContent = 'Resumo da conta';

  const overviewDescription = document.createElement('p');
  overviewDescription.className = 'user-widget__description';
  overviewDescription.textContent =
    'Acompanhe o status da sessão ativa, a data da última atualização e ative atalhos rápidos para outras áreas do MiniApp.';

  const statsList = document.createElement('ul');
  statsList.className = 'admin-dashboard__user-stats user-dashboard__stats';

  const sessionStat = createStatItem('Status da sessão');
  const updatedStat = createStatItem('Perfil atualizado');
  const themeStat = createStatItem('Preferência de tema');
  const roleStat = createStatItem('Tipo de acesso');

  statsList.append(sessionStat.item, updatedStat.item, themeStat.item, roleStat.item);

  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'user-dashboard__actions';

  const actionGrid = document.createElement('div');
  actionGrid.className = 'admin-dashboard__user-action-grid user-dashboard__action-grid';

  const accountWidget = document.createElement('section');
  accountWidget.className = 'user-panel__widget user-dashboard__widget user-dashboard__widget--account';

  const accountTitle = document.createElement('h2');
  accountTitle.className = 'user-widget__title';
  accountTitle.textContent = 'Dados principais';

  const accountDescription = document.createElement('p');
  accountDescription.className = 'user-widget__description';
  accountDescription.textContent =
    'Atualize telefone, e-mail, senha e preferências de tema. Todas as alterações são salvas em poucos segundos.';

  const emptyState = document.createElement('p');
  emptyState.className = 'user-dashboard__empty-state';
  emptyState.textContent = 'Nenhuma sessão ativa. Faça login para atualizar seus dados.';

  const accountForm = document.createElement('form');
  accountForm.className = 'user-form user-dashboard__form';
  accountForm.noValidate = true;

  const nameField = createInputField({
    id: 'user-dashboard-name',
    label: 'Nome completo',
    type: 'text',
    placeholder: 'Informe como deseja ser identificado',
    autocomplete: 'name',
  });

  const phoneField = createInputField({
    id: 'user-dashboard-phone',
    label: 'Telefone principal',
    type: 'tel',
    placeholder: 'Inclua DDD ou código internacional',
    autocomplete: 'tel',
    inputMode: 'tel',
  });

  const emailField = createInputField({
    id: 'user-dashboard-email',
    label: 'E-mail de contato',
    type: 'email',
    placeholder: 'nome@exemplo.com',
    autocomplete: 'email',
    required: false,
  });

  const passwordField = createInputField({
    id: 'user-dashboard-password',
    label: 'Nova senha (opcional)',
    type: 'password',
    placeholder: 'Mínimo de 8 caracteres',
    autocomplete: 'new-password',
    required: false,
  });

  const themeField = document.createElement('label');
  themeField.className = 'user-form__field';
  themeField.setAttribute('for', 'user-dashboard-theme');

  const themeLabel = document.createElement('span');
  themeLabel.className = 'user-form__label';
  themeLabel.textContent = 'Tema da interface';

  const themeSelect = document.createElement('select');
  themeSelect.id = 'user-dashboard-theme';
  themeSelect.name = 'user-dashboard-theme';
  themeSelect.className = 'user-form__select';

  [
    { value: 'system', label: 'Automático (seguir sistema)' },
    { value: 'light', label: 'Tema claro' },
    { value: 'dark', label: 'Tema escuro' },
  ].forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    themeSelect.append(optionElement);
  });

  themeField.append(themeLabel, themeSelect);

  const feedbackElement = document.createElement('p');
  feedbackElement.className = 'user-form__feedback user-dashboard__feedback';
  feedbackElement.hidden = true;

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit';
  submitButton.textContent = 'Salvar alterações';

  accountForm.append(
    nameField,
    phoneField,
    emailField,
    passwordField,
    themeField,
    feedbackElement,
    submitButton,
  );

  accountWidget.append(accountTitle, accountDescription, emptyState, accountForm);

  overviewWidget.append(overviewTitle, overviewDescription, statsList, actionsWrapper);
  actionsWrapper.append(actionGrid);

  layout.append(overviewWidget, accountWidget);
  viewRoot.replaceChildren(heading, intro, layout);

  const cleanupCallbacks = [];
  const unsubscribeCallbacks = [];

  const nameInput = nameField.querySelector('input');
  const phoneInput = phoneField.querySelector('input');
  const emailInput = emailField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  const showFeedback = (message, { isError = false } = {}) => {
    if (!(feedbackElement instanceof HTMLElement)) {
      return;
    }

    feedbackElement.classList.remove('user-form__feedback--error', 'user-form__feedback--success');

    if (!message) {
      feedbackElement.hidden = true;
      feedbackElement.textContent = '';
      return;
    }

    feedbackElement.hidden = false;
    feedbackElement.textContent = message;

    if (isError) {
      feedbackElement.classList.add('user-form__feedback--error');
    } else {
      feedbackElement.classList.add('user-form__feedback--success');
    }
  };

  const resetFeedback = () => {
    showFeedback('', {});
  };

  const editAction = createQuickAction({
    label: 'Editar cadastro',
    description: 'Ir direto para o formulário principal.',
    onClick: () => {
      if (accountForm instanceof HTMLElement && typeof accountForm.scrollIntoView === 'function') {
        accountForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (nameInput && typeof nameInput.focus === 'function') {
        try {
          nameInput.focus();
        } catch (error) {
          console.error('Não foi possível focar o campo de nome.', error);
        }
      }
    },
  });

  const logAction = createQuickAction({
    label: 'Consultar atividades',
    description: 'Abra o registro de alterações recentes.',
    onClick: () => navigateTo('log'),
  });

  const adminAction = createQuickAction({
    label: 'Gerenciar cadastros',
    description: 'Acesse o painel administrativo completo.',
    onClick: () => navigateTo('admin'),
  });

  const logoutAction = createQuickAction({
    label: 'Encerrar sessão',
    description: 'Desconecte este dispositivo com segurança.',
    onClick: () => {
      if (!activeUser) {
        showFeedback('Nenhuma sessão ativa no momento.', { isError: false });
        return;
      }

      clearActiveUser();
      showFeedback('Sessão encerrada. Faça login para continuar.', { isError: false });
    },
    extraClass: 'user-dashboard__quick-action--logout',
  });

  actionGrid.append(editAction.button, logAction.button, adminAction.button, logoutAction.button);
  cleanupCallbacks.push(editAction.cleanup, logAction.cleanup, adminAction.cleanup, logoutAction.cleanup);

  const persistUserChanges = createPersistUserChanges(
    () => (activeUser ? { id: activeUser.id } : null),
    updateUser,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeUser) {
      showFeedback('Nenhuma sessão ativa. Faça login para continuar.', { isError: true });
      return;
    }

    resetFeedback();

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
        return;
      }

      const sanitizedPhone = phoneValidation.sanitized ?? phoneValidation.localNumber ?? '';
      if (sanitizedPhone && sanitizedPhone !== (activeUser.phone ?? '')) {
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
          return;
        }
        updates.password = passwordValue;
      }
    }

    let nextThemePreference = activeUser.preferences?.theme ?? 'system';
    if (themeSelect) {
      const selected = sanitizeUserThemePreference(themeSelect.value);
      if (selected !== (activeUser.preferences?.theme ?? 'system')) {
        updates.preferences = { ...(updates.preferences ?? {}), theme: selected };
      }
      nextThemePreference = selected;
    }

    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    const result = await persistUserChanges(updates, {
      feedback: {
        reset: resetFeedback,
        show: (message, options = {}) => {
          showFeedback(message, options);
        },
      },
      busyTargets: [submitButton],
      successMessage: 'Dados atualizados com sucesso!',
      errorMessage: 'Não foi possível atualizar os dados. Tente novamente.',
      missingSessionMessage: 'Nenhuma sessão ativa. Faça login para continuar.',
    });

    if (result.status === 'no-changes') {
      showFeedback('Nenhuma alteração para salvar.', { isError: false });
      return;
    }

    if (result.status === 'success') {
      if (updates.phone && phoneInput) {
        phoneInput.value = formatPhoneNumberForDisplay(updates.phone);
      }

      if (passwordInput) {
        passwordInput.value = '';
      }

      if (updates.preferences?.theme) {
        setThemePreference(updates.preferences.theme);
        if (themeSelect) {
          themeSelect.value = updates.preferences.theme;
        }
      } else if (themeSelect) {
        themeSelect.value = nextThemePreference;
      }

      if (activeUser) {
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
        activeUser.updatedAt = new Date();
      }

      updateOverview();
      updateForm();
      updateActionState();
    }
  };

  accountForm.addEventListener('submit', handleSubmit);
  cleanupCallbacks.push(() => accountForm.removeEventListener('submit', handleSubmit));

  const usersById = new Map();
  let activeUserId = getActiveUserId();
  let sessionSnapshot = null;
  let activeUser = null;

  const updateOverview = () => {
    const user = activeUser;

    if (user) {
      sessionStat.valueElement.textContent = 'Ativa';
      updatedStat.valueElement.textContent = formatDate(user.updatedAt ?? user.createdAt);
      themeStat.valueElement.textContent = formatThemeLabel(user.preferences?.theme);
      roleStat.valueElement.textContent = formatUserTypeLabel(user.userType);
    } else {
      sessionStat.valueElement.textContent = 'Desconectada';
      updatedStat.valueElement.textContent = '—';
      themeStat.valueElement.textContent = formatThemeLabel('system');
      roleStat.valueElement.textContent = 'Visitante';
    }
  };

  const updateForm = () => {
    const user = activeUser;
    const isEnabled = Boolean(user);

    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = isEnabled;
    }

    const nextTheme = user?.preferences?.theme ?? 'system';

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

    if (themeSelect) {
      themeSelect.value = nextTheme;
      themeSelect.disabled = !isEnabled;
    }

    if (submitButton) {
      submitButton.disabled = !isEnabled;
    }
  };

  const updateActionState = () => {
    const hasUser = Boolean(activeUser);
    editAction.button.disabled = !hasUser;
    logoutAction.button.disabled = !hasUser;
  };

  const syncActiveUser = () => {
    const source = (activeUserId != null && usersById.get(activeUserId)) || sessionSnapshot;
    activeUser = normalizeUserData(source);

    updateOverview();
    updateForm();
    updateActionState();
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
