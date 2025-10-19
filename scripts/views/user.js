import { addUser } from '../data/user-store.js';

const BASE_CLASSES = 'card view view--user';

export function renderUserPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'user';

  const heading = document.createElement('h1');
  heading.textContent = 'Painel do Usuário';

  const form = document.createElement('form');
  form.className = 'user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const phoneField = createField({
    id: 'user-phone',
    label: 'Número de telefone',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    autocomplete: 'tel',
    inputMode: 'tel',
  });

  const passwordField = createField({
    id: 'user-password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite sua senha',
    autocomplete: 'current-password',
  });

  const phoneInput = phoneField.querySelector('input');
  const passwordInput = passwordField.querySelector('input');

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit';
  submitButton.textContent = 'Cadastrar';

  const feedback = document.createElement('p');
  feedback.className = 'user-form__feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!phoneInput || !passwordInput) {
      showFeedback('Não foi possível processar o cadastro. Atualize a página e tente novamente.', {
        isError: true,
      });
      return;
    }

    const phone = phoneInput.value.trim();
    const password = passwordInput.value;

    if (!phone || !password) {
      showFeedback('Informe o telefone e a senha para concluir o cadastro.', { isError: true });
      return;
    }

    try {
      addUser({ phone, password });
      form.reset();
      showFeedback('Usuário cadastrado com sucesso! Confira o painel administrativo.', {
        isError: false,
      });
      phoneInput.focus();
    } catch (error) {
      console.error('Erro ao cadastrar usuário.', error);
      showFeedback('Não foi possível cadastrar o usuário. Tente novamente.', { isError: true });
    }
  });

  form.append(phoneField, passwordField, submitButton, feedback);

  viewRoot.replaceChildren(heading, form);
}

function createField({ id, label, type, placeholder, autocomplete, inputMode }) {
  const fieldWrapper = document.createElement('label');
  fieldWrapper.className = 'user-form__field';
  fieldWrapper.setAttribute('for', id);

  const fieldLabel = document.createElement('span');
  fieldLabel.className = 'user-form__label';
  fieldLabel.textContent = label;

  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = type;
  input.placeholder = placeholder;
  if (autocomplete) {
    input.autocomplete = autocomplete;
  }
  if (inputMode) {
    input.inputMode = inputMode;
  }
  input.required = true;

  fieldWrapper.append(fieldLabel, input);

  return fieldWrapper;
}
