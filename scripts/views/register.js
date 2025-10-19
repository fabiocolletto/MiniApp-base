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
  intro.textContent = 'Informe seu telefone e defina uma senha para liberar o acesso imediato.';

  const form = document.createElement('form');
  form.className = 'register-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const phoneField = createInputField({
    id: 'register-phone',
    label: 'Telefone de contato',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
  });

  const passwordField = createInputField({
    id: 'register-password',
    label: 'Crie uma senha',
    type: 'password',
    placeholder: 'Digite uma senha segura',
    autocomplete: 'new-password',
  });

  const phoneInput = phoneField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  const legalSection = document.createElement('div');
  legalSection.className = 'register-panel__legal';

  const legalOption = document.createElement('label');
  legalOption.className = 'register-panel__legal-option';
  legalOption.htmlFor = 'register-legal-consent';

  const legalCheckbox = document.createElement('input');
  legalCheckbox.type = 'checkbox';
  legalCheckbox.id = 'register-legal-consent';
  legalCheckbox.name = 'register-legal-consent';
  legalCheckbox.className = 'register-panel__legal-checkbox';

  const legalText = document.createElement('span');
  legalText.className = 'register-panel__legal-text';
  legalText.append('Li e concordo com os termos legais. ');

  const legalLink = document.createElement('a');
  legalLink.className = 'register-panel__legal-link';
  legalLink.href = 'https://5horas.com.br/home/pagina-legal/docs-legais/';
  legalLink.target = '_blank';
  legalLink.rel = 'noopener noreferrer';
  legalLink.textContent = 'Saiba mais';

  legalText.append(legalLink);
  legalOption.append(legalCheckbox, legalText);
  legalSection.append(legalOption);

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

  let hasAcceptedTerms = false;
  let isSubmitting = false;

  function updateLegalControls() {
    hasAcceptedTerms = legalCheckbox.checked;
    legalCheckbox.disabled = isSubmitting;
    legalOption.classList.toggle('register-panel__legal-option--accepted', hasAcceptedTerms);
    submitButton.disabled = !hasAcceptedTerms || isSubmitting;
    if (submitButton.disabled) {
      submitButton.setAttribute('aria-disabled', 'true');
    } else {
      submitButton.removeAttribute('aria-disabled');
    }
  }

  legalCheckbox.addEventListener('change', () => {
    resetFeedback();
    updateLegalControls();
  });

  updateLegalControls();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!phoneInput || !passwordInput) {
      showFeedback('Não foi possível carregar o formulário de cadastro. Atualize a página e tente novamente.', {
        isError: true,
      });
      return;
    }

    const phoneValue = phoneInput.value.trim();
    const passwordValue = passwordInput.value;

    if (!hasAcceptedTerms) {
      showFeedback('Para criar sua conta, concorde com os termos legais antes de prosseguir.', {
        isError: true,
      });
      legalCheckbox.focus();
      return;
    }

    if (!phoneValue || !passwordValue) {
      showFeedback('Informe telefone e senha para concluir o cadastro.', { isError: true });
      return;
    }

    try {
      isSubmitting = true;
      updateLegalControls();
      submitButton.setAttribute('aria-busy', 'true');

      await addUser({
        phone: phoneValue,
        password: passwordValue,
        device: collectDeviceInfo(),
      });

      form.reset();
      hasAcceptedTerms = false;
      legalCheckbox.checked = false;
      updateLegalControls();
      showFeedback('Cadastro criado com sucesso! Você já pode acessar o painel de login para entrar.', {
        isError: false,
      });
      phoneInput.focus();
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

    isSubmitting = false;
    submitButton.removeAttribute('aria-busy');
    updateLegalControls();
  });

  form.append(phoneField, passwordField, legalSection, submitButton, feedback);

  viewRoot.replaceChildren(heading, intro, form);
}
