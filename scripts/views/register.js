import { addUser } from '../data/user-store.js';
import { createInputField } from './shared/form-fields.js';
import { collectDeviceInfo } from './shared/device-info.js';

const BASE_CLASSES = 'card view view--register';

export function renderRegisterPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'register';

  const heading = document.createElement('h1');
  heading.className = 'register-panel__title';
  heading.textContent = 'Crie sua conta';

  const intro = document.createElement('p');
  intro.className = 'register-panel__intro';
  intro.textContent =
    'Preencha os campos abaixo para liberar o acesso e acompanhar as informações cadastradas em tempo real.';

  const form = document.createElement('form');
  form.className = 'register-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const nameField = createInputField({
    id: 'register-name',
    label: 'Nome completo',
    type: 'text',
    placeholder: 'Digite seu nome completo',
    autocomplete: 'name',
  });

  const phoneField = createInputField({
    id: 'register-phone',
    label: 'Número de telefone',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
  });

  const emailField = createInputField({
    id: 'register-email',
    label: 'E-mail (opcional)',
    type: 'email',
    placeholder: 'nome@empresa.com',
    autocomplete: 'email',
  });

  const passwordField = createInputField({
    id: 'register-password',
    label: 'Crie uma senha',
    type: 'password',
    placeholder: 'Digite uma senha segura',
    autocomplete: 'new-password',
  });

  const confirmPasswordField = createInputField({
    id: 'register-confirm-password',
    label: 'Confirme a senha',
    type: 'password',
    placeholder: 'Repita a senha criada',
    autocomplete: 'new-password',
  });

  const nameInput = nameField.querySelector('input');
  const phoneInput = phoneField.querySelector('input');
  const emailInput = emailField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');
  const confirmPasswordInput = confirmPasswordField.querySelector('input');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit register-panel__submit';
  submitButton.textContent = 'Criar conta';

  const feedback = document.createElement('p');
  feedback.className = 'user-form__feedback register-panel__feedback';
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

    if (!nameInput || !phoneInput || !passwordInput || !confirmPasswordInput) {
      showFeedback('Não foi possível carregar o formulário de cadastro. Atualize a página e tente novamente.', {
        isError: true,
      });
      return;
    }

    const nameValue = nameInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const emailValue = emailInput?.value.trim() ?? '';
    const passwordValue = passwordInput.value;
    const confirmPasswordValue = confirmPasswordInput.value;

    if (!nameValue || !phoneValue || !passwordValue || !confirmPasswordValue) {
      showFeedback('Preencha nome, telefone e senha para concluir o cadastro.', { isError: true });
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      showFeedback('As senhas informadas não coincidem. Verifique e tente novamente.', { isError: true });
      confirmPasswordInput.focus();
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');

      await addUser({
        name: nameValue,
        phone: phoneValue,
        password: passwordValue,
        device: collectDeviceInfo(),
        profile: { email: emailValue },
      });

      form.reset();
      showFeedback('Cadastro criado com sucesso! Você já pode acessar o painel de login para entrar.', {
        isError: false,
      });
      nameInput.focus();
    } catch (error) {
      console.error('Erro ao criar cadastro pelo painel dedicado.', error);
      const errorMessage = error instanceof Error ? error.message : '';
      const isStorageIssue =
        typeof errorMessage === 'string' &&
        (errorMessage.includes('Armazenamento local indisponível') || errorMessage.includes('armazenamento local'));

      showFeedback(
        isStorageIssue
          ? 'Não foi possível concluir o cadastro porque o armazenamento local está indisponível neste dispositivo.'
          : 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
        { isError: true }
      );
    }

    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  });

  form.append(nameField, phoneField, emailField, passwordField, confirmPasswordField, submitButton, feedback);

  viewRoot.replaceChildren(heading, intro, form);
}
