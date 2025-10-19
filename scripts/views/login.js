import { addUser } from '../data/user-store.js';
import { createInputField } from './shared/form-fields.js';
import { collectDeviceInfo } from './shared/device-info.js';

const BASE_CLASSES = 'card view view--login';

function dispatchNavigation(viewName) {
  document.dispatchEvent(
    new CustomEvent('app:navigate', {
      detail: { view: viewName },
    })
  );
}

export function renderLoginPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'login';

  const heading = document.createElement('h1');
  heading.className = 'login-panel__title';
  heading.textContent = 'Painel de Login';

  const intro = document.createElement('p');
  intro.className = 'login-panel__intro';
  intro.textContent =
    'Informe seu nome, telefone e senha para gerar seu acesso e acompanhar os cadastros.';

  const form = document.createElement('form');
  form.className = 'login-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const nameField = createInputField({
    id: 'login-name',
    label: 'Nome completo',
    type: 'text',
    placeholder: 'Digite seu nome completo',
    autocomplete: 'name',
  });

  const phoneField = createInputField({
    id: 'login-phone',
    label: 'Número de telefone',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
  });

  const passwordField = createInputField({
    id: 'login-password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite sua senha',
    autocomplete: 'current-password',
  });

  const nameInput = nameField.querySelector('input');
  const phoneInput = phoneField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit login-panel__submit';
  submitButton.textContent = 'Cadastrar';

  const feedback = document.createElement('p');
  feedback.className = 'user-form__feedback login-panel__feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;

  function resetFeedback() {
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.classList.remove('user-form__feedback--error', 'user-form__feedback--success');
    feedback.removeAttribute('role');
  }

  function showFeedback(message, { isError = false } = {}) {
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.toggle('user-form__feedback--error', isError);
    feedback.classList.toggle('user-form__feedback--success', !isError);
    if (isError) {
      feedback.setAttribute('role', 'alert');
    } else {
      feedback.removeAttribute('role');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!nameInput || !phoneInput || !passwordInput) {
      showFeedback('Não foi possível carregar os campos de login. Atualize e tente novamente.', {
        isError: true,
      });
      return;
    }

    const nameValue = nameInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!nameValue || !phoneValue || !passwordValue) {
      showFeedback('Preencha nome, telefone e senha para concluir o acesso.', { isError: true });
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');

      await addUser({ name: nameValue, phone: phoneValue, password: passwordValue, device: collectDeviceInfo() });
      form.reset();
      showFeedback('Acesso cadastrado com sucesso! Você já pode gerenciar os dados no painel do usuário.', {
        isError: false,
      });
      nameInput.focus();
    } catch (error) {
      console.error('Erro ao cadastrar acesso pelo painel de login.', error);
      const errorMessage = error instanceof Error ? error.message : '';
      const isStorageIssue =
        typeof errorMessage === 'string' &&
        (errorMessage.includes('Armazenamento local indisponível') ||
          errorMessage.includes('armazenamento local'));

      showFeedback(
        isStorageIssue
          ? 'Não foi possível concluir o acesso porque o armazenamento local está indisponível neste dispositivo.'
          : 'Não foi possível concluir o acesso. Verifique os dados e tente novamente.',
        { isError: true }
      );
    }

    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  });

  form.append(nameField, phoneField, passwordField, submitButton, feedback);

  const actions = document.createElement('div');
  actions.className = 'login-panel__actions';

  const manageButton = document.createElement('button');
  manageButton.type = 'button';
  manageButton.className = 'login-panel__manage-button';
  manageButton.textContent = 'Acompanhar painel do usuário';
  manageButton.addEventListener('click', () => {
    dispatchNavigation('user');
  });

  actions.append(manageButton);

  viewRoot.replaceChildren(heading, intro, form, actions);
}
