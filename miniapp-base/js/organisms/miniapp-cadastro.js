(function (window) {
  const root = window.miniappBase || (window.miniappBase = {});
  const atoms = root.atoms || (root.atoms = {});
  const molecules = root.molecules || (root.molecules = {});
  const shellSync = molecules.shellSync || null;

  const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];
  const DEFAULT_LOCALE = 'pt-BR';

  const translations = {
    'pt-BR': {
      meta: {
        title: 'Cadastro de Usuários',
      },
      header: {
        badge: 'Fluxo guiado',
        title: 'Cadastro de novos usuários',
        subtitle: 'Centralize o onboarding e valide os dados essenciais antes de liberar o acesso.',
        icon: 'person_add',
        iconTheme: 'cadastro',
      },
      language: {
        label: 'Idioma',
      },
      actions: {
        openCatalog: 'Catálogo',
      },
      feedback: {
        saved: 'Dados salvos localmente.',
        updated: 'Dados atualizados com sucesso.',
        error: 'Não foi possível salvar os dados no dispositivo.',
      },
      form: {
        title: 'Dados do usuário',
        description:
          'Preencha os campos obrigatórios para liberar o acesso inicial. Todos os campos marcados com * são obrigatórios.',
        sections: {
          personal: {
            title: 'Dados pessoais',
            description: 'Comece identificando quem receberá o acesso.',
          },
          professional: {
            title: 'Dados profissionais',
            description: 'Defina como a pessoa atuará na plataforma.',
          },
        },
        fields: {
          fullName: {
            label: 'Nome completo *',
            placeholder: 'Digite nome e sobrenome',
          },
          email: {
            label: 'Email corporativo *',
            placeholder: 'nome.sobrenome@empresa.com',
          },
          phone: {
            label: 'Telefone de contato *',
            placeholder: '(11) 99999-0000',
          },
          role: {
            label: 'Papel na plataforma *',
            placeholder: 'Selecione uma opção',
            options: {
              administrator: 'Administrador',
              manager: 'Gestor de área',
              analyst: 'Analista',
              viewer: 'Acesso somente leitura',
            },
          },
          department: {
            label: 'Departamento *',
            placeholder: 'Ex: Operações',
          },
          password: {
            label: 'Senha temporária *',
            placeholder: 'Mínimo de 8 caracteres',
          },
          confirmPassword: {
            label: 'Confirmação *',
            placeholder: 'Repita a senha temporária',
          },
          terms: {
            label: 'Declaro que li e aceito os termos de uso e a política de privacidade.',
          },
        },
        actions: {
          reset: 'Limpar',
          submit: 'Salvar cadastro',
        },
        errors: {
          required: 'Este campo é obrigatório.',
          fullName: {
            short: 'Informe nome e sobrenome.',
          },
          email: {
            invalid: 'Informe um email corporativo válido.',
          },
          phone: {
            invalid: 'Informe um telefone com DDD e 9 dígitos.',
          },
          password: {
            length: 'A senha deve ter pelo menos 8 caracteres.',
            composition: 'Use letras e números na senha.',
          },
          confirmPassword: {
            mismatch: 'As senhas não coincidem.',
          },
          terms: {
            unchecked: 'É necessário aceitar os termos para continuar.',
          },
        },
      },
    },
    'en-US': {
      meta: {
        title: 'User Onboarding',
      },
      header: {
        badge: 'Guided flow',
        title: 'Register new users',
        subtitle: 'Centralize onboarding and validate critical data before granting access.',
        icon: 'person_add',
        iconTheme: 'cadastro',
      },
      language: {
        label: 'Language',
      },
      actions: {
        openCatalog: 'Catalog',
      },
      feedback: {
        saved: 'Data saved locally.',
        updated: 'Data updated successfully.',
        error: 'We could not save the data on this device.',
      },
      form: {
        title: 'User information',
        description: 'Fill in the required fields to provision the initial access. All fields marked with * are mandatory.',
        sections: {
          personal: {
            title: 'Personal details',
            description: 'Start by identifying who will receive access.',
          },
          professional: {
            title: 'Professional details',
            description: 'Define how this person will operate on the platform.',
          },
        },
        fields: {
          fullName: {
            label: 'Full name *',
            placeholder: 'Enter first and last name',
          },
          email: {
            label: 'Work email *',
            placeholder: 'first.last@company.com',
          },
          phone: {
            label: 'Contact phone *',
            placeholder: '(305) 555-0100',
          },
          role: {
            label: 'Platform role *',
            placeholder: 'Select an option',
            options: {
              administrator: 'Administrator',
              manager: 'Area manager',
              analyst: 'Analyst',
              viewer: 'Read-only access',
            },
          },
          department: {
            label: 'Department *',
            placeholder: 'e.g. Operations',
          },
          password: {
            label: 'Temporary password *',
            placeholder: 'Minimum of 8 characters',
          },
          confirmPassword: {
            label: 'Confirmation *',
            placeholder: 'Repeat the temporary password',
          },
          terms: {
            label: 'I have read and agree to the terms of use and privacy policy.',
          },
        },
        actions: {
          reset: 'Clear',
          submit: 'Save registration',
        },
        errors: {
          required: 'This field is required.',
          fullName: {
            short: 'Provide first and last name.',
          },
          email: {
            invalid: 'Enter a valid work email.',
          },
          phone: {
            invalid: 'Enter a phone number with country or area code.',
          },
          password: {
            length: 'Password must have at least 8 characters.',
            composition: 'Use both letters and numbers in the password.',
          },
          confirmPassword: {
            mismatch: 'Passwords do not match.',
          },
          terms: {
            unchecked: 'You must accept the terms to continue.',
          },
        },
      },
    },
    'es-ES': {
      meta: {
        title: 'Registro de Usuarios',
      },
      header: {
        badge: 'Flujo guiado',
        title: 'Registrar nuevos usuarios',
        subtitle: 'Centraliza el onboarding y valida los datos clave antes de otorgar acceso.',
        icon: 'person_add',
        iconTheme: 'cadastro',
      },
      language: {
        label: 'Idioma',
      },
      actions: {
        openCatalog: 'Catálogo',
      },
      feedback: {
        saved: 'Datos guardados localmente.',
        updated: 'Datos actualizados correctamente.',
        error: 'No fue posible guardar los datos en este dispositivo.',
      },
      form: {
        title: 'Datos del usuario',
        description: 'Completa los campos obligatorios para habilitar el acceso inicial. Todos los campos con * son obligatorios.',
        sections: {
          personal: {
            title: 'Datos personales',
            description: 'Comienza identificando a la persona que recibirá el acceso.',
          },
          professional: {
            title: 'Datos profesionales',
            description: 'Define cómo actuará la persona en la plataforma.',
          },
        },
        fields: {
          fullName: {
            label: 'Nombre completo *',
            placeholder: 'Ingresa nombre y apellido',
          },
          email: {
            label: 'Correo corporativo *',
            placeholder: 'nombre.apellido@empresa.com',
          },
          phone: {
            label: 'Teléfono de contacto *',
            placeholder: '+34 600 000 000',
          },
          role: {
            label: 'Rol en la plataforma *',
            placeholder: 'Selecciona una opción',
            options: {
              administrator: 'Administrador',
              manager: 'Responsable de área',
              analyst: 'Analista',
              viewer: 'Solo lectura',
            },
          },
          department: {
            label: 'Departamento *',
            placeholder: 'Ej.: Operaciones',
          },
          password: {
            label: 'Contraseña temporal *',
            placeholder: 'Mínimo 8 caracteres',
          },
          confirmPassword: {
            label: 'Confirmación *',
            placeholder: 'Repite la contraseña temporal',
          },
          terms: {
            label: 'Declaro que leí y acepto los términos de uso y la política de privacidad.',
          },
        },
        actions: {
          reset: 'Limpiar',
          submit: 'Guardar registro',
        },
        errors: {
          required: 'Este campo es obligatorio.',
          fullName: {
            short: 'Indica nombre y apellido.',
          },
          email: {
            invalid: 'Introduce un correo corporativo válido.',
          },
          phone: {
            invalid: 'Introduce un teléfono con código de país o área.',
          },
          password: {
            length: 'La contraseña debe tener al menos 8 caracteres.',
            composition: 'Utiliza letras y números en la contraseña.',
          },
          confirmPassword: {
            mismatch: 'Las contraseñas no coinciden.',
          },
          terms: {
            unchecked: 'Debes aceptar los términos para continuar.',
          },
        },
      },
    },
  };

  const STORAGE_KEY = 'miniapp-cadastro-data';

  const FEEDBACK_VARIANTS = {
    success: {
      background: 'rgba(22, 163, 74, 0.12)',
      border: '1px solid rgba(22, 163, 74, 0.28)',
      color: 'var(--color-accent-green)',
      icon: 'check_circle',
    },
    error: {
      background: 'rgba(220, 38, 38, 0.12)',
      border: '1px solid rgba(220, 38, 38, 0.28)',
      color: 'var(--color-danger-red)',
      icon: 'error',
    },
  };

  const root = document.documentElement;
  const form = document.getElementById('registrationForm');
  const feedbackContainer = document.getElementById('formFeedback');
  const feedbackMessage = feedbackContainer
    ? feedbackContainer.querySelector('[data-js="feedback-message"]')
    : null;
  const feedbackIcon = feedbackContainer
    ? feedbackContainer.querySelector('[data-js="feedback-icon"]')
    : null;

  let lastFeedbackKey = null;

  let currentLocale = detectLocale();
  const storageAvailable = isLocalStorageAvailable();

  function detectLocale() {
    const documentLocale = (document.documentElement && document.documentElement.lang) || '';
    const normalized = documentLocale.trim();

    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }

    if (normalized) {
      const match = SUPPORTED_LOCALES.find((locale) => locale.startsWith(normalized.slice(0, 2)));
      if (match) {
        return match;
      }
    }

    return DEFAULT_LOCALE;
  }

  function getTranslation(locale, path) {
    const dictionary = translations[locale] || translations[DEFAULT_LOCALE];
    return path.split('.').reduce((value, segment) => {
      if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
        return value[segment];
      }
      return undefined;
    }, dictionary);
  }

  function formatPhone(value) {
    const digits = String(value || '')
      .replace(/[^\d+]/g, '')
      .trim();

    if (!digits) {
      return '';
    }

    if (digits.startsWith('+')) {
      return digits;
    }

    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return digits;
  }

  function translateElements() {
    root.setAttribute('lang', currentLocale);

    const metaTitle = getTranslation(currentLocale, 'meta.title');
    if (metaTitle) {
      document.title = metaTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) {
        return;
      }

      const translation = getTranslation(currentLocale, key);
      if (typeof translation === 'string') {
        element.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = key ? getTranslation(currentLocale, key) : null;
      if (typeof translation === 'string') {
        element.setAttribute('placeholder', translation);
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const key = element.getAttribute('data-i18n-aria-label');
      const translation = key ? getTranslation(currentLocale, key) : null;
      if (typeof translation === 'string') {
        element.setAttribute('aria-label', translation);
        element.setAttribute('title', translation);
      }
    });

    const catalogTrigger = document.querySelector('[data-js="open-catalog"]');
    if (catalogTrigger) {
      const catalogLabel = getTranslation(currentLocale, 'actions.openCatalog') || 'Catálogo';
      catalogTrigger.setAttribute('aria-label', catalogLabel);
      catalogTrigger.setAttribute('title', catalogLabel);
    }

    // Atualiza as opções do select de papéis conforme o idioma.
    const roleField = document.getElementById('role');
    if (roleField) {
      Array.from(roleField.options).forEach((option) => {
        const key = option.getAttribute('data-i18n');
        if (!key) {
          return;
        }

        const translation = getTranslation(currentLocale, key);
        if (typeof translation === 'string') {
          option.textContent = translation;
        }
      });
    }

    document.querySelectorAll('[data-field-error]').forEach((element) => {
      const key = element.dataset.errorKey;
      if (!key || element.style.display === 'none') {
        return;
      }

      const translation = getTranslation(currentLocale, key);
      if (typeof translation === 'string') {
        element.textContent = translation;
      }
    });

    if (
      feedbackContainer &&
      feedbackContainer.style.display !== 'none' &&
      lastFeedbackKey &&
      feedbackMessage
    ) {
      const feedbackText = getTranslation(currentLocale, lastFeedbackKey);
      if (typeof feedbackText === 'string') {
        feedbackMessage.textContent = feedbackText;
      }
    }
  }

  function handleMessage(event) {
    if (!event || typeof event !== 'object') {
      return;
    }

    if (event.origin && event.origin !== 'null' && event.origin !== window.location.origin) {
      return;
    }

    const { data } = event;
    if (!data || typeof data !== 'object' || data.action !== 'set-locale') {
      return;
    }

    const { locale } = data;
    if (typeof locale !== 'string') {
      return;
    }

    if (!SUPPORTED_LOCALES.includes(locale)) {
      return;
    }

    if (locale === currentLocale) {
      return;
    }

    currentLocale = locale;
    translateElements();
    notifyShell();
  }

  function notifyShell() {
    const header = getTranslation(currentLocale, 'header');
    if (!header || typeof header !== 'object') {
      return;
    }

    if (shellSync && typeof shellSync.sendMiniAppHeader === 'function') {
      if (shellSync.sendMiniAppHeader(header)) {
        return;
      }
    }

    if (atoms.postToParent && atoms.postToParent({ action: 'miniapp-header', ...header })) {
      return;
    }

    if (!window.parent || window.parent === window) {
      return;
    }

    try {
      window.parent.postMessage(
        {
          action: 'miniapp-header',
          title: header.title,
          subtitle: header.subtitle,
          icon: header.icon,
          iconTheme: header.iconTheme,
        },
        window.location.origin,
      );
    } catch (error) {
      console.error('Não foi possível enviar o cabeçalho do miniapp para o shell.', error);
    }
  }

  function requestCatalog() {
    if (shellSync && typeof shellSync.requestCatalog === 'function') {
      if (shellSync.requestCatalog()) {
        return;
      }
    }

    if (atoms.postToParent && atoms.postToParent({ action: 'open-catalog' })) {
      return;
    }

    if (!window.parent || window.parent === window) {
      return;
    }

    try {
      window.parent.postMessage({ action: 'open-catalog' }, window.location.origin);
    } catch (error) {
      console.error('Não foi possível solicitar o catálogo ao shell.', error);
    }
  }

  function setupCatalogButton() {
    const trigger = document.querySelector('[data-js="open-catalog"]');
    if (!trigger) {
      return;
    }

    const labelElement = trigger.querySelector('[data-js="catalog-label"]');
    const fallbackLabel = getTranslation(currentLocale, 'actions.openCatalog') || 'Catálogo';
    const labelText = labelElement && labelElement.textContent ? labelElement.textContent.trim() : '';

    if (labelElement && !labelText) {
      labelElement.textContent = fallbackLabel;
    }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      requestCatalog();
    });
  }

  function clearErrors() {
    document.querySelectorAll('[data-field-error]').forEach((element) => {
      element.textContent = '';
      element.style.display = 'none';
      delete element.dataset.errorKey;
    });
  }

  function hideFeedback() {
    if (!feedbackContainer) {
      return;
    }

    feedbackContainer.style.display = 'none';
    feedbackContainer.style.background = FEEDBACK_VARIANTS.success.background;
    feedbackContainer.style.border = FEEDBACK_VARIANTS.success.border;
    feedbackContainer.style.color = FEEDBACK_VARIANTS.success.color;
    if (feedbackMessage) {
      feedbackMessage.textContent = '';
    }
    if (feedbackIcon) {
      feedbackIcon.textContent = FEEDBACK_VARIANTS.success.icon;
    }
    lastFeedbackKey = null;
  }

  function clearFieldError(field) {
    const name = field.getAttribute('name');
    if (!name) {
      return;
    }

    const errorElement = document.querySelector(`[data-field-error="${name}"]`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      delete errorElement.dataset.errorKey;
    }
  }

  function setError(fieldName, messageKey) {
    const errorElement = document.querySelector(`[data-field-error="${fieldName}"]`);
    if (!errorElement) {
      return;
    }

    const message = messageKey ? getTranslation(currentLocale, messageKey) : null;
    if (typeof message === 'string') {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      if (messageKey) {
        errorElement.dataset.errorKey = messageKey;
      }
    }
  }

  function showFeedback(messageKey, variant = 'success') {
    if (!feedbackContainer || !feedbackMessage) {
      return;
    }

    const message = messageKey ? getTranslation(currentLocale, messageKey) : null;
    if (typeof message !== 'string' || !message.trim()) {
      return;
    }

    const config = FEEDBACK_VARIANTS[variant] || FEEDBACK_VARIANTS.success;
    feedbackContainer.style.background = config.background;
    feedbackContainer.style.border = config.border;
    feedbackContainer.style.color = config.color;
    feedbackContainer.style.display = 'inline-flex';

    if (feedbackIcon) {
      feedbackIcon.textContent = config.icon;
    }

    feedbackMessage.textContent = message;
    lastFeedbackKey = messageKey;
  }

  function isLocalStorageAvailable() {
    try {
      if (!('localStorage' in window)) {
        return false;
      }

      const testKey = `${STORAGE_KEY}__test__`;
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('Local storage não está disponível.', error);
      return false;
    }
  }

  function getStoredData() {
    if (!storageAvailable) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : null;
    } catch (error) {
      console.warn('Não foi possível ler os dados salvos.', error);
      return null;
    }
  }

  function persistStoredData(data) {
    if (!storageAvailable) {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Não foi possível salvar os dados localmente.', error);
      return false;
    }
  }

  function restoreStoredData() {
    if (!form) {
      return;
    }

    const stored = getStoredData();
    if (!stored) {
      return;
    }

    const fieldNames = ['fullName', 'email', 'phone', 'role', 'department'];
    fieldNames.forEach((name) => {
      const value = stored[name];
      const field = form.elements.namedItem(name);
      if (field && typeof value === 'string') {
        field.value = value;
      }
    });

    const termsField = form.elements.namedItem('terms');
    if (termsField) {
      termsField.checked = Boolean(stored.termsAccepted);
    }
  }

  function validateForm() {
    if (!form) {
      return false;
    }

    clearErrors();

    const formData = new FormData(form);
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const role = String(formData.get('role') || '').trim();
    const department = String(formData.get('department') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    const termsAccepted = formData.get('terms') === 'on';

    let hasError = false;

    if (!fullName) {
      setError('fullName', 'form.errors.required');
      hasError = true;
    } else if (!/\s/.test(fullName)) {
      setError('fullName', 'form.errors.fullName.short');
      hasError = true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email) {
      setError('email', 'form.errors.required');
      hasError = true;
    } else if (!emailPattern.test(email)) {
      setError('email', 'form.errors.email.invalid');
      hasError = true;
    }

    if (!phone) {
      setError('phone', 'form.errors.required');
      hasError = true;
    } else if (!/[\d]{8,}/.test(phone.replace(/\D/g, ''))) {
      setError('phone', 'form.errors.phone.invalid');
      hasError = true;
    }

    if (!role) {
      setError('role', 'form.errors.required');
      hasError = true;
    }

    if (!department) {
      setError('department', 'form.errors.required');
      hasError = true;
    }

    const hasMinLength = password.length >= 8;
    const hasLetters = /[A-Za-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!password) {
      setError('password', 'form.errors.required');
      hasError = true;
    } else if (!hasMinLength) {
      setError('password', 'form.errors.password.length');
      hasError = true;
    } else if (!(hasLetters && hasNumbers)) {
      setError('password', 'form.errors.password.composition');
      hasError = true;
    }

    if (!confirmPassword) {
      setError('confirmPassword', 'form.errors.required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setError('confirmPassword', 'form.errors.confirmPassword.mismatch');
      hasError = true;
    }

    if (!termsAccepted) {
      setError('terms', 'form.errors.terms.unchecked');
      hasError = true;
    }

    if (hasError) {
      hideFeedback();
      return false;
    }

    const previousData = getStoredData();
    const storedSuccessfully = persistStoredData({
      fullName,
      email,
      phone,
      role,
      department,
      termsAccepted,
      updatedAt: new Date().toISOString(),
    });

    if (storedSuccessfully) {
      showFeedback(previousData ? 'feedback.updated' : 'feedback.saved', 'success');
    } else {
      showFeedback('feedback.error', 'error');
    }

    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();
    validateForm();
  }

  function setupForm() {
    if (!form) {
      return;
    }

    form.addEventListener('submit', handleSubmit);

    form.addEventListener('reset', () => {
      clearErrors();
      hideFeedback();
    });

    form.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('input', () => {
        clearFieldError(field);
      });

      field.addEventListener('change', () => {
        clearFieldError(field);
      });
    });
  }

  function initialize() {
    translateElements();
    notifyShell();
    if (
      currentLocale === DEFAULT_LOCALE &&
      window.parent &&
      window.parent !== window
    ) {
      try {
        window.parent.postMessage(
          { action: 'request-locale' },
          window.location.origin,
        );
      } catch (error) {
        console.error('Não foi possível solicitar o idioma atual ao shell.', error);
      }
    }
    setupCatalogButton();
    setupForm();
    restoreStoredData();
  }

  window.addEventListener('message', handleMessage);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window);
