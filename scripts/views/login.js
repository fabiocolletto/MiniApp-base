import { addUser } from '../data/user-store.js';
import { createInputField } from './shared/form-fields.js';
import { collectDeviceInfo } from './shared/device-info.js';

const BASE_CLASSES = 'card view view--login';

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
    'Informe seu telefone e senha para acessar rapidamente o painel e acompanhar seus cadastros.';

  const form = document.createElement('form');
  form.className = 'login-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

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

  const phoneInput = phoneField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit login-panel__submit';
  submitButton.textContent = 'Entrar';

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

    if (!phoneInput || !passwordInput) {
      showFeedback('Não foi possível carregar os campos de login. Atualize e tente novamente.', {
        isError: true,
      });
      return;
    }

    const phoneValue = phoneInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!phoneValue || !passwordValue) {
      showFeedback('Preencha telefone e senha para entrar.', { isError: true });
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');

      await addUser({ phone: phoneValue, password: passwordValue, device: collectDeviceInfo() });
      form.reset();
      showFeedback('Login realizado com sucesso! Você já pode gerenciar os dados no painel do usuário.', {
        isError: false,
      });
      phoneInput.focus();
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

  form.append(phoneField, passwordField, submitButton, feedback);

  viewRoot.replaceChildren(heading, intro, form);
}
