(function () {
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
      intro: {
        title: 'Pronto para receber novos acessos',
        description:
          'Reúna dados pessoais, defina o papel do usuário e confirme o aceite dos termos de uso. Você pode revisar tudo no resumo antes de concluir.',
        highlights: {
          dataQuality: 'Validação de email e senha com regras personalizadas.',
          roles: 'Seleção rápida de perfis e setores atendidos.',
          audit: 'Registro do aceite de políticas para auditoria.',
        },
      },
      form: {
        title: 'Dados do usuário',
        description:
          'Preencha os campos obrigatórios para liberar o acesso inicial. Todos os campos marcados com * são obrigatórios.',
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
      summary: {
        title: 'Resumo do cadastro',
        description: {
          success: 'Revisão concluída com sucesso. Compartilhe o acesso com o usuário.',
        },
        success: {
          message: 'Cadastro salvo e pronto para ativação no diretório corporativo.',
        },
        labels: {
          fullName: 'Nome completo',
          email: 'Email',
          phone: 'Telefone',
          role: 'Perfil de acesso',
          department: 'Departamento',
          password: 'Senha temporária',
          terms: 'Termos de uso',
        },
        values: {
          password: 'Senha registrada (oculta por segurança).',
          terms: {
            accepted: 'Termos aceitos às {{time}}.',
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
      intro: {
        title: 'Ready to welcome new access',
        description:
          'Gather personal data, select the user role, and confirm policy acceptance. Review everything in the summary before finishing.',
        highlights: {
          dataQuality: 'Email and password validation with tailored rules.',
          roles: 'Quick selection of roles and supported departments.',
          audit: 'Policy acceptance logged for auditing.',
        },
      },
      form: {
        title: 'User information',
        description: 'Fill in the required fields to provision the initial access. All fields marked with * are mandatory.',
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
      summary: {
        title: 'Registration summary',
        description: {
          success: 'Review completed successfully. Share the access details with the user.',
        },
        success: {
          message: 'Registration saved and ready for directory activation.',
        },
        labels: {
          fullName: 'Full name',
          email: 'Email',
          phone: 'Phone',
          role: 'Access profile',
          department: 'Department',
          password: 'Temporary password',
          terms: 'Terms of use',
        },
        values: {
          password: 'Password recorded (hidden for security).',
          terms: {
            accepted: 'Terms accepted at {{time}}.',
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
      intro: {
        title: 'Listo para habilitar nuevos accesos',
        description:
          'Reúne datos personales, define el rol del usuario y confirma la aceptación de políticas. Revisa todo en el resumen antes de finalizar.',
        highlights: {
          dataQuality: 'Validación de correo y contraseña con reglas personalizadas.',
          roles: 'Selección ágil de perfiles y áreas atendidas.',
          audit: 'Registro del consentimiento para auditoría.',
        },
      },
      form: {
        title: 'Datos del usuario',
        description: 'Completa los campos obligatorios para habilitar el acceso inicial. Todos los campos con * son obligatorios.',
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
      summary: {
        title: 'Resumen del registro',
        description: {
          success: 'Revisión completada correctamente. Comparte el acceso con la persona usuaria.',
        },
        success: {
          message: 'Registro guardado y listo para activarse en el directorio.',
        },
        labels: {
          fullName: 'Nombre completo',
          email: 'Correo',
          phone: 'Teléfono',
          role: 'Perfil de acceso',
          department: 'Departamento',
          password: 'Contraseña temporal',
          terms: 'Términos de uso',
        },
        values: {
          password: 'Contraseña registrada (oculta por seguridad).',
          terms: {
            accepted: 'Términos aceptados a las {{time}}.',
          },
        },
      },
    },
  };

  const summaryFields = [
    { key: 'fullName', labelKey: 'summary.labels.fullName' },
    { key: 'email', labelKey: 'summary.labels.email' },
    { key: 'phone', labelKey: 'summary.labels.phone' },
    { key: 'role', labelKey: 'summary.labels.role' },
    { key: 'department', labelKey: 'summary.labels.department' },
  ];

  const root = document.documentElement;
  const form = document.getElementById('registrationForm');
  const languageSelect = document.getElementById('languageSelect');
  const summaryCard = document.getElementById('summaryCard');
  const summaryList = document.getElementById('summaryList');
  const summaryDescription = document.getElementById('summaryDescription');
  const summaryAlert = document.getElementById('summaryAlert');

  let lastSummaryData = null;

  let currentLocale = detectLocale();

  function detectLocale() {
    const languageCandidates = Array.isArray(window.navigator.languages)
      ? window.navigator.languages
      : [window.navigator.language, DEFAULT_LOCALE].filter(Boolean);

    for (const candidate of languageCandidates) {
      if (typeof candidate !== 'string') {
        continue;
      }

      const normalized = candidate.trim();
      if (!normalized) {
        continue;
      }

      if (SUPPORTED_LOCALES.includes(normalized)) {
        return normalized;
      }

      const short = normalized.slice(0, 2);
      const match = SUPPORTED_LOCALES.find((locale) => locale.startsWith(short));
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

    if (languageSelect && SUPPORTED_LOCALES.includes(currentLocale)) {
      languageSelect.value = currentLocale;
    }

    if (summaryCard && summaryCard.style.display !== 'none' && lastSummaryData) {
      showSummary(lastSummaryData);
    }
  }

  function notifyShell() {
    if (!window.parent || window.parent === window) {
      return;
    }

    const header = getTranslation(currentLocale, 'header');
    if (!header || typeof header !== 'object') {
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
    if (!window.parent || window.parent === window) {
      return;
    }

    try {
      window.parent.postMessage('open-catalog', window.location.origin);
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

  function hideSummary() {
    if (summaryCard) {
      summaryCard.style.display = 'none';
    }
    lastSummaryData = null;
  }

  function showSummary(data) {
    if (!summaryCard || !summaryList) {
      return;
    }

    summaryList.innerHTML = '';

    summaryFields.forEach(({ key, labelKey }) => {
      const label = getTranslation(currentLocale, labelKey) || key;
      let value = data[key] || '';

      if (key === 'phone') {
        value = formatPhone(value);
      }

      if (key === 'role') {
        const roleLabel = getTranslation(currentLocale, `form.fields.role.options.${value}`);
        value = roleLabel || value;
      }

      if (!value) {
        return;
      }

      const item = document.createElement('li');
      item.style.display = 'grid';
      item.style.gap = 'var(--space-1)';

      const labelElement = document.createElement('span');
      labelElement.style.fontWeight = 'var(--font-weight-semibold)';
      labelElement.textContent = label;

      const valueElement = document.createElement('span');
      valueElement.textContent = value;

      item.appendChild(labelElement);
      item.appendChild(valueElement);
      summaryList.appendChild(item);
    });

    const passwordLabel = getTranslation(currentLocale, 'summary.labels.password');
    const passwordValue = getTranslation(currentLocale, 'summary.values.password');
    if (passwordLabel && passwordValue) {
      const item = document.createElement('li');
      item.style.display = 'grid';
      item.style.gap = 'var(--space-1)';

      const labelElement = document.createElement('span');
      labelElement.style.fontWeight = 'var(--font-weight-semibold)';
      labelElement.textContent = passwordLabel;

      const valueElement = document.createElement('span');
      valueElement.textContent = passwordValue;

      item.appendChild(labelElement);
      item.appendChild(valueElement);
      summaryList.appendChild(item);
    }

    const termsLabel = getTranslation(currentLocale, 'summary.labels.terms');
    const timeFormatter = new Intl.DateTimeFormat(currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const termsValueTemplate = getTranslation(currentLocale, 'summary.values.terms.accepted');
    const termsValue = termsValueTemplate
      ? termsValueTemplate.replace('{{time}}', timeFormatter.format(new Date()))
      : '';

    if (termsLabel && termsValue) {
      const item = document.createElement('li');
      item.style.display = 'grid';
      item.style.gap = 'var(--space-1)';

      const labelElement = document.createElement('span');
      labelElement.style.fontWeight = 'var(--font-weight-semibold)';
      labelElement.textContent = termsLabel;

      const valueElement = document.createElement('span');
      valueElement.textContent = termsValue;

      item.appendChild(labelElement);
      item.appendChild(valueElement);
      summaryList.appendChild(item);
    }

    const description = getTranslation(currentLocale, 'summary.description.success');
    if (summaryDescription && description) {
      summaryDescription.textContent = description;
    }

    const successMessage = getTranslation(currentLocale, 'summary.success.message');
    if (summaryAlert) {
      const messageElement = summaryAlert.querySelector('[data-i18n="summary.success.message"]');
      if (messageElement && successMessage) {
        messageElement.textContent = successMessage;
      }
    }

    summaryCard.style.display = 'grid';
    lastSummaryData = { ...data };
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
      hideSummary();
      return false;
    }

    showSummary({
      fullName,
      email,
      phone,
      role,
      department,
    });

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
      hideSummary();
      if (summaryList) {
        summaryList.innerHTML = '';
      }
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

  function setupLanguageSwitcher() {
    if (!languageSelect) {
      return;
    }

    languageSelect.addEventListener('change', (event) => {
      const { value } = event.target;
      if (!SUPPORTED_LOCALES.includes(value)) {
        return;
      }

      currentLocale = value;
      translateElements();
      notifyShell();
    });
  }

  function initialize() {
    translateElements();
    notifyShell();
    setupCatalogButton();
    setupForm();
    setupLanguageSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
