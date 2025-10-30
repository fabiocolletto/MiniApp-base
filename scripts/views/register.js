import { addUser, DUPLICATE_PHONE_ERROR_MESSAGE } from '../data/user-store.js';
import { setActiveUser } from '../data/session-store.js';
import eventBus from '../events/event-bus.js';
import { createInputField } from './shared/form-fields.js';
import { collectDeviceInfo } from './shared/device-info.js';
import { validatePasswordStrength, validatePhoneParts, formatPhoneNumberForDisplay } from './shared/validation.js';

export const BASE_CLASSES = 'card view auth-view view--register';

export function sanitizeCountryCode(value) {
  return String(value ?? '')
    .replace(/[^0-9]/g, '')
    .slice(0, 3);
}

export function isBrazilianCode(code) {
  const normalized = String(code ?? '').trim();
  return normalized === '' || normalized === '55';
}

export function formatBrazilianDigits(digits) {
  const normalized = String(digits ?? '').replace(/[^0-9]/g, '').slice(0, 11);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= 2) {
    return `(${normalized}`;
  }

  if (normalized.length <= 7) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2)}`;
  }

  return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
}

export function formatInternationalDigits(digits) {
  const normalized = String(digits ?? '').replace(/[^0-9]/g, '').slice(0, 15);

  if (normalized.length <= 4) {
    return normalized;
  }

  const groups = [];
  for (let index = 0; index < normalized.length; index += 3) {
    groups.push(normalized.slice(index, index + 3));
  }

  return groups.join(' ');
}

function renderRegisterSuccess(viewRoot, savedUser) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = `${BASE_CLASSES} register-view--success`;
  viewRoot.dataset.view = 'register-success';

  const successWidget = document.createElement('section');
  successWidget.className = 'surface-card register-success__widget';

  const title = document.createElement('h2');
  title.className = 'register-success__title';
  title.textContent = 'Cadastro concluído!';
  title.tabIndex = -1;

  const message = document.createElement('p');
  message.className = 'register-success__message';
  message.textContent =
    'Seu acesso foi liberado e a MiniApp Store já está pronta para receber suas informações.';

  let summary = null;
  if (savedUser?.phone) {
    summary = document.createElement('p');
    summary.className = 'register-success__summary';
    const phoneHighlight = document.createElement('strong');
    phoneHighlight.className = 'register-success__highlight';
    phoneHighlight.textContent =
      formatPhoneNumberForDisplay(savedUser.phone) || savedUser.phone || '';
    summary.append('Telefone cadastrado: ', phoneHighlight);
  }

  const openPanelButton = document.createElement('button');
  openPanelButton.type = 'button';
  openPanelButton.className =
    'button button--primary button--pill register-success__action register-success__action--primary';
  openPanelButton.textContent = 'Ir para a MiniApp Store';
  openPanelButton.addEventListener('click', () => {
    eventBus.emit('app:navigate', { view: 'miniapps', source: 'register:success:cta' });
  });

  successWidget.append(title, message);

  if (summary) {
    successWidget.append(summary);
  }

  const actions = document.createElement('div');
  actions.className = 'register-success__actions';
  actions.append(openPanelButton);

  successWidget.append(actions);

  viewRoot.setAttribute('aria-label', 'Cadastro concluído');
  viewRoot.replaceChildren(successWidget);

  setTimeout(() => {
    title.focus();
  }, 0);
}

export function renderRegisterPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'register';

  const form = document.createElement('form');
  form.className = 'form auth-panel__form user-form';
  form.autocomplete = 'on';
  form.noValidate = true;

  const phoneField = document.createElement('div');
  phoneField.className = 'form-field user-form__field user-form__field--inline auth-panel__phone-field';

  const phoneFieldLabel = document.createElement('span');
  phoneFieldLabel.className = 'form-label user-form__label auth-panel__phone-label';
  phoneFieldLabel.textContent = 'Telefone de contato';

  const phoneInputsWrapper = document.createElement('div');
  phoneInputsWrapper.className = 'auth-panel__phone-inputs';

  const countryGroup = document.createElement('div');
  countryGroup.className = 'auth-panel__phone-subfield auth-panel__phone-subfield--country';

  const countryLabel = document.createElement('label');
  countryLabel.className = 'auth-panel__phone-subfield-label sr-only';
  countryLabel.setAttribute('for', 'register-phone-country');
  countryLabel.textContent = 'Código do país';

  const phoneCountryInput = document.createElement('input');
  phoneCountryInput.id = 'register-phone-country';
  phoneCountryInput.name = 'register-phone-country';
  phoneCountryInput.type = 'tel';
  phoneCountryInput.inputMode = 'numeric';
  phoneCountryInput.autocomplete = 'tel-country-code';
  phoneCountryInput.value = '55';
  phoneCountryInput.required = true;
  phoneCountryInput.className = 'form-input';

  countryGroup.append(countryLabel, phoneCountryInput);

  const numberGroup = document.createElement('div');
  numberGroup.className = 'auth-panel__phone-subfield auth-panel__phone-subfield--number';

  const numberLabel = document.createElement('label');
  numberLabel.className = 'auth-panel__phone-subfield-label sr-only';
  numberLabel.setAttribute('for', 'register-phone-number');
  numberLabel.textContent = 'Número do telefone';

  const phoneNumberInput = document.createElement('input');
  phoneNumberInput.id = 'register-phone-number';
  phoneNumberInput.name = 'register-phone-number';
  phoneNumberInput.type = 'tel';
  phoneNumberInput.placeholder = '(11) 98888-7777';
  phoneNumberInput.inputMode = 'tel';
  phoneNumberInput.autocomplete = 'tel-national';
  phoneNumberInput.required = true;
  phoneNumberInput.className = 'form-input';

  numberGroup.append(numberLabel, phoneNumberInput);

  phoneInputsWrapper.append(countryGroup, numberGroup);
  phoneField.append(phoneFieldLabel, phoneInputsWrapper);

  const updateNumberPlaceholder = (code) => {
    if (isBrazilianCode(code)) {
      phoneNumberInput.placeholder = '(11) 98888-7777';
      return;
    }
    phoneNumberInput.placeholder = 'Ex.: 447911234567';
  };

  const applyCurrentMask = () => {
    if (!phoneCountryInput || !phoneNumberInput) {
      return;
    }

    const countryDigits = sanitizeCountryCode(
      typeof phoneCountryInput.value === 'string' ? phoneCountryInput.value : '',
    );
    const rawNumber = typeof phoneNumberInput.value === 'string' ? phoneNumberInput.value : '';
    const numberDigits = rawNumber.replace(/[^0-9]/g, '');
    const formatted = isBrazilianCode(countryDigits)
      ? formatBrazilianDigits(numberDigits)
      : formatInternationalDigits(numberDigits);
    phoneNumberInput.value = formatted;
    phoneCountryInput.value = countryDigits;
    updateNumberPlaceholder(countryDigits);
  };

  phoneCountryInput.addEventListener('input', applyCurrentMask);
  phoneCountryInput.addEventListener('change', applyCurrentMask);
  phoneNumberInput.addEventListener('input', applyCurrentMask);
  phoneNumberInput.addEventListener('change', applyCurrentMask);

  applyCurrentMask();

  const passwordField = createInputField({
    id: 'register-password',
    label: 'Crie uma senha',
    type: 'password',
    placeholder: 'Mínimo 8 dígitos',
    autocomplete: 'new-password',
  });

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
  legalCheckbox.setAttribute('aria-label', 'Concordo com os termos legais.');

  const legalText = document.createElement('span');
  legalText.className = 'register-panel__legal-text';
  legalText.textContent = 'Li e concordo com os termos legais.';

  legalOption.append(legalCheckbox, legalText);
  legalSection.append(legalOption);

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'button form-submit user-form__submit';
  submitButton.textContent = 'Criar conta';

  const feedback = document.createElement('p');
  feedback.className = 'form-message user-form__feedback auth-panel__feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;

  function resetFeedback() {
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.classList.remove(
      'user-form__feedback--error',
      'user-form__feedback--success',
      'form-message--error',
      'form-message--success',
    );
    feedback.removeAttribute('role');
  }

  function showFeedback(message, { isError = false } = {}) {
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.toggle('user-form__feedback--error', isError);
    feedback.classList.toggle('form-message--error', isError);
    feedback.classList.toggle('user-form__feedback--success', !isError);
    feedback.classList.toggle('form-message--success', !isError);
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

  const collectPhoneDigits = () => {
    const countryDigits = sanitizeCountryCode(phoneCountryInput.value);
    const numberDigits = phoneNumberInput.value.replace(/[^0-9]/g, '');
    return { countryDigits, numberDigits };
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetFeedback();

    if (!phoneCountryInput || !phoneNumberInput || !passwordInput) {
      showFeedback('Não foi possível carregar o formulário de cadastro. Atualize a página e tente novamente.', {
        isError: true,
      });
      return;
    }

    const { countryDigits, numberDigits } = collectPhoneDigits();
    phoneCountryInput.value = countryDigits;
    const isBrazilian = isBrazilianCode(countryDigits);
    phoneNumberInput.value = isBrazilian
      ? formatBrazilianDigits(numberDigits)
      : formatInternationalDigits(numberDigits);

    const passwordValue = passwordInput.value;

    if (!hasAcceptedTerms) {
      showFeedback('Para criar sua conta, concorde com os termos legais antes de prosseguir.', {
        isError: true,
      });
      legalCheckbox.focus();
      return;
    }

    const phoneValidation = validatePhoneParts(countryDigits, numberDigits);
    if (!phoneValidation.isValid) {
      showFeedback(phoneValidation.message, { isError: true });
      if (phoneValidation.field === 'country') {
        phoneCountryInput.focus();
        phoneCountryInput.select?.();
      } else {
        phoneNumberInput.focus();
      }
      return;
    }

    const sanitizedPhone = phoneValidation.sanitized;
    const sanitizedCountry = phoneValidation.countryCode || countryDigits;
    const sanitizedLocal = phoneValidation.localNumber || numberDigits;
    phoneCountryInput.value = sanitizedCountry;
    phoneNumberInput.value = isBrazilianCode(sanitizedCountry)
      ? formatBrazilianDigits(sanitizedLocal)
      : formatInternationalDigits(sanitizedLocal);

    const passwordValidation = validatePasswordStrength(passwordValue);
    if (!passwordValidation.isValid) {
      showFeedback(passwordValidation.message, { isError: true });
      passwordInput.focus();
      passwordInput.select?.();
      return;
    }

    try {
      isSubmitting = true;
      updateLegalControls();
      submitButton.setAttribute('aria-busy', 'true');

      const savedUser = await addUser({
        phone: sanitizedPhone,
        password: passwordValue,
        device: collectDeviceInfo(),
        userType: 'usuario',
      });
      setActiveUser(savedUser?.id);
      isSubmitting = false;
      submitButton.removeAttribute('aria-busy');
      renderRegisterSuccess(viewRoot, savedUser);
      eventBus.emit('app:navigate', { view: 'miniapps', source: 'register:success' });
      return;
    } catch (error) {
      console.error('Erro ao criar cadastro pelo painel dedicado.', error);
      const errorMessage = error instanceof Error ? error.message : '';
      const isDuplicatePhone = errorMessage === DUPLICATE_PHONE_ERROR_MESSAGE;
      const isStorageIssue =
        typeof errorMessage === 'string' &&
        (errorMessage.includes('Armazenamento local indisponível') || errorMessage.includes('armazenamento local'));

      showFeedback(
        isDuplicatePhone
          ? DUPLICATE_PHONE_ERROR_MESSAGE
          : isStorageIssue
          ? 'Não foi possível concluir o cadastro porque o armazenamento local está indisponível neste dispositivo.'
          : 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
        { isError: true }
      );

      if (isDuplicatePhone) {
        phoneNumberInput.focus();
        phoneNumberInput.select?.();
      }
    }

    isSubmitting = false;
    submitButton.removeAttribute('aria-busy');
    updateLegalControls();
  });

  form.append(phoneField, passwordField, legalSection, submitButton, feedback);

  viewRoot.setAttribute('aria-label', 'Painel de cadastro');
  viewRoot.replaceChildren(form);
}
