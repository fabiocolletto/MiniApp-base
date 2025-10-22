export function createInputField({
  id,
  label,
  type,
  placeholder,
  autocomplete,
  inputMode,
  required = true,
}) {
  const fieldWrapper = document.createElement('label');
  fieldWrapper.className = 'form-field user-form__field';
  fieldWrapper.setAttribute('for', id);

  const fieldLabel = document.createElement('span');
  fieldLabel.className = 'form-label user-form__label';
  fieldLabel.textContent = label;

  const input = document.createElement('input');
  input.className = 'form-input';
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
  input.required = Boolean(required);

  fieldWrapper.append(fieldLabel, input);

  return fieldWrapper;
}

export function createTextareaField({ id, label, placeholder, rows = 4 }) {
  const fieldWrapper = document.createElement('label');
  fieldWrapper.className = 'form-field user-form__field user-form__field--textarea';
  fieldWrapper.setAttribute('for', id);

  const fieldLabel = document.createElement('span');
  fieldLabel.className = 'form-label user-form__label';
  fieldLabel.textContent = label;

  const textarea = document.createElement('textarea');
  textarea.className = 'form-input form-textarea';
  textarea.id = id;
  textarea.name = id;
  textarea.placeholder = placeholder;
  textarea.rows = rows;

  fieldWrapper.append(fieldLabel, textarea);

  return fieldWrapper;
}
