import { authenticateUser, updateUser } from '../data/user-store.js';
import { setActiveUser } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { createInputField } from './shared/form-fields.js';
import { collectDeviceInfo } from './shared/device-info.js';
import {
  sanitizeCountryCode,
  sanitizeLocalPhoneNumber,
  validatePhoneParts,
} from './shared/validation.js';

const BASE_CLASSES = 'card view auth-view view--login';
const BRAZIL_COUNTRY_CODE = '55';

const isBrazilianCode = (code) => code === BRAZIL_COUNTRY_CODE || code === '';

const formatBrazilianDigits = (digits) => {
  const limited = digits.slice(0, 11);
  if (!limited) {
    return '';
  }
  if (limited.length <= 2) {
    return `(${limited}`;
  }
  if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
};

const formatInternationalDigits = (digits) => {
  const limited = digits.slice(0, 15);
  if (!limited) {
    return '';
  }
  if (limited.length <= 4) {
    return limited;
  }
  const groups = [];
  for (let index = 0; index < limited.length; index += 3) {
    groups.push(limited.slice(index, index + 3));
  }
  return groups.join(' ');
};

export function renderLoginPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'login';

  const heading = document.createElement('h1');
  heading.className = 'auth-panel__title';
  heading.textContent = 'Painel de Login';

  const intro = document.createElement('p');
  intro.className = 'auth-panel__intro';
  intro.textContent =
    'Informe seu telefone e senha para acessar rapidamente o painel e acompanhar seus cadastros.';

  const form = document.createElement('form');
  form.className = 'auth-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const phoneField = document.createElement('div');
  phoneField.className =
    'user-form__field user-form__field--inline auth-panel__phone-field login-panel__phone-field';

  const phoneFieldLabel = document.createElement('span');
  phoneFieldLabel.className = 'user-form__label auth-panel__phone-label';
  phoneFieldLabel.textContent = 'Telefone cadastrado';

  const phoneInputsWrapper = document.createElement('div');
  phoneInputsWrapper.className = 'auth-panel__phone-inputs login-panel__phone-inputs';

  const countryGroup = document.createElement('div');
  countryGroup.className =
    'auth-panel__phone-subfield auth-panel__phone-subfield--country login-panel__phone-subfield login-panel__phone-subfield--country';

  const countryLabel = document.createElement('label');
  countryLabel.className = 'auth-panel__phone-subfield-label sr-only';
  countryLabel.setAttribute('for', 'login-phone-country');
  countryLabel.textContent = 'Código do país';

  const phoneCountryInput = document.createElement('input');
  phoneCountryInput.id = 'login-phone-country';
  phoneCountryInput.name = 'login-phone-country';
  phoneCountryInput.type = 'tel';
  phoneCountryInput.inputMode = 'numeric';
  phoneCountryInput.autocomplete = 'tel-country-code';
  phoneCountryInput.value = BRAZIL_COUNTRY_CODE;
  phoneCountryInput.required = true;

  countryGroup.append(countryLabel, phoneCountryInput);

  const numberGroup = document.createElement('div');
  numberGroup.className =
    'auth-panel__phone-subfield auth-panel__phone-subfield--number login-panel__phone-subfield login-panel__phone-subfield--number';

  const numberLabel = document.createElement('label');
  numberLabel.className = 'auth-panel__phone-subfield-label sr-only';
  numberLabel.setAttribute('for', 'login-phone-number');
  numberLabel.textContent = 'Número do telefone';

  const phoneNumberInput = document.createElement('input');
  phoneNumberInput.id = 'login-phone-number';
  phoneNumberInput.name = 'login-phone-number';
  phoneNumberInput.type = 'tel';
  phoneNumberInput.placeholder = '(11) 98888-7777';
  phoneNumberInput.inputMode = 'tel';
  phoneNumberInput.autocomplete = 'tel-national';
  phoneNumberInput.required = true;

  numberGroup.append(numberLabel, phoneNumberInput);

  phoneInputsWrapper.append(countryGroup, numberGroup);
  phoneField.append(phoneFieldLabel, phoneInputsWrapper);

  const passwordField = createInputField({
    id: 'login-password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite sua senha',
    autocomplete: 'current-password',
  });

  const passwordInput = passwordField.querySelector('input');

  const updateNumberPlaceholder = (code) => {
    if (isBrazilianCode(code)) {
      phoneNumberInput.placeholder = '(11) 98888-7777';
      return;
    }
    phoneNumberInput.placeholder = 'Ex.: 447911234567';
  };

  const applyCurrentMask = () => {
    const countryDigits = sanitizeCountryCode(phoneCountryInput.value);
    const numberDigits = sanitizeLocalPhoneNumber(phoneNumberInput.value);
    const formatted = isBrazilianCode(countryDigits)
      ? formatBrazilianDigits(numberDigits)
      : formatInternationalDigits(numberDigits);
    phoneCountryInput.value = countryDigits;
    phoneNumberInput.value = formatted;
    updateNumberPlaceholder(countryDigits);
  };

  phoneCountryInput.addEventListener('input', applyCurrentMask);
  phoneCountryInput.addEventListener('change', applyCurrentMask);
  phoneNumberInput.addEventListener('input', applyCurrentMask);
  phoneNumberInput.addEventListener('change', applyCurrentMask);

  applyCurrentMask();

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'user-form__submit';
  submitButton.textContent = 'Entrar';

  const feedback = document.createElement('p');
  feedback.className = 'user-form__feedback auth-panel__feedback';
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

    if (!phoneCountryInput || !phoneNumberInput || !passwordInput) {
      showFeedback('Não foi possível carregar os campos de login. Atualize e tente novamente.', {
        isError: true,
      });
      return;
    }

    const countryDigits = sanitizeCountryCode(phoneCountryInput.value);
    const numberDigits = sanitizeLocalPhoneNumber(phoneNumberInput.value);
    phoneCountryInput.value = countryDigits;
    const isBrazilian = isBrazilianCode(countryDigits);
    phoneNumberInput.value = isBrazilian
      ? formatBrazilianDigits(numberDigits)
      : formatInternationalDigits(numberDigits);

    const phoneValidation = validatePhoneParts(countryDigits, numberDigits);
    if (!phoneValidation.isValid) {
      showFeedback(phoneValidation.message || 'Revise o telefone informado e tente novamente.', { isError: true });
      if (phoneValidation.field === 'country') {
        phoneCountryInput.focus();
        phoneCountryInput.select?.();
      } else {
        phoneNumberInput.focus();
      }
      return;
    }

    const phoneValue = phoneValidation.sanitized;
    const passwordValue = passwordInput.value;

    if (!phoneValue || !passwordValue) {
      showFeedback('Preencha telefone e senha para entrar.', { isError: true });
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');

      const deviceInfo = collectDeviceInfo();
      const authenticatedUser = await authenticateUser({
        phone: phoneValue,
        password: passwordValue,
      });
      setActiveUser(authenticatedUser?.id);

      if (
        authenticatedUser?.id != null &&
        typeof deviceInfo === 'string' &&
        deviceInfo &&
        deviceInfo !== authenticatedUser.device
      ) {
        try {
          await updateUser(authenticatedUser.id, { device: deviceInfo });
        } catch (updateError) {
          console.warn('Não foi possível atualizar o dispositivo do usuário autenticado.', updateError);
        }
      }
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      eventBus.emit('app:navigate', { view: 'user' });
      return;
    } catch (error) {
      console.error('Erro ao autenticar acesso pelo painel de login.', error);
      const errorMessage = error instanceof Error ? error.message : '';
      const isStorageIssue =
        typeof errorMessage === 'string' &&
        (errorMessage.includes('Armazenamento local indisponível') ||
          errorMessage.includes('armazenamento local'));

      if (isStorageIssue) {
        showFeedback(
          'Não foi possível concluir o acesso porque o armazenamento local está indisponível neste dispositivo.',
          { isError: true }
        );
      } else if (errorMessage) {
        showFeedback(errorMessage, { isError: true });
      } else {
        showFeedback('Não foi possível concluir o acesso. Verifique os dados e tente novamente.', {
          isError: true,
        });
      }
    }

    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  });

  form.append(phoneField, passwordField, submitButton, feedback);

  viewRoot.replaceChildren(heading, intro, form);
}
