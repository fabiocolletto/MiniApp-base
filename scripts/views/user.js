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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

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

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit';
  submitButton.textContent = 'Entrar';

  form.append(phoneField, passwordField, submitButton);

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
