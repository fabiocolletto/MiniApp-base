const INTERNATIONAL_PATTERN = /^\+[0-9]{8,15}$/;
const NATIONAL_PATTERN = /^[0-9]{11}$/;

function stripFormatting(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('+')) {
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    return `+${digitsOnly}`;
  }

  return trimmed.replace(/[^0-9]/g, '');
}

export function sanitizePhoneInput(rawValue) {
  return stripFormatting(rawValue);
}

export function validatePhoneNumber(rawValue) {
  const sanitized = sanitizePhoneInput(rawValue);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized,
      message: 'Informe um telefone para contato.',
    };
  }

  if (sanitized.startsWith('+')) {
    if (!INTERNATIONAL_PATTERN.test(sanitized)) {
      return {
        isValid: false,
        sanitized,
        message:
          'Digite um número internacional no formato +CódigoPaís seguido de 8 a 15 dígitos.',
      };
    }

    return {
      isValid: true,
      sanitized,
      type: 'international',
    };
  }

  if (!NATIONAL_PATTERN.test(sanitized)) {
    return {
      isValid: false,
      sanitized,
      message: 'Digite um celular brasileiro com DDD e 11 dígitos.',
    };
  }

  if (sanitized[2] !== '9') {
    return {
      isValid: false,
      sanitized,
      message: 'Aceitamos apenas celulares que iniciem com 9 após o DDD.',
    };
  }

  return {
    isValid: true,
    sanitized,
    type: 'br-mobile',
  };
}

export function validatePasswordStrength(value) {
  const password = typeof value === 'string' ? value : '';

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 8 caracteres.',
    };
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasLetter || (!hasNumber && !hasSymbol)) {
    return {
      isValid: false,
      message: 'Use ao menos uma letra e um número ou símbolo na senha.',
    };
  }

  return {
    isValid: true,
  };
}

function formatBrazilianPhone(digits) {
  if (digits.length !== 11) {
    return digits;
  }

  const areaCode = digits.slice(0, 2);
  const prefix = digits.slice(2, 7);
  const suffix = digits.slice(7);
  return `(${areaCode}) ${prefix}-${suffix}`;
}

function formatInternationalNationalNumber(value) {
  if (value.length <= 4) {
    return value;
  }

  if (value.length <= 7) {
    return `${value.slice(0, 3)} ${value.slice(3)}`;
  }

  if (value.length <= 10) {
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
  }

  const chunks = [];
  for (let index = 0; index < value.length; index += 4) {
    chunks.push(value.slice(index, index + 4));
  }
  return chunks.join(' ');
}

function guessInternationalCountryCodeDigits(digits) {
  if (digits.startsWith('55') && digits.length === 13) {
    return 2;
  }

  if (digits.length <= 8) {
    return 1;
  }

  if (digits.length >= 12) {
    return 3;
  }

  return 2;
}

export function formatPhoneNumberForDisplay(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const sanitized = sanitizePhoneInput(value);

  if (!sanitized) {
    return '';
  }

  if (sanitized.startsWith('+')) {
    const digits = sanitized.slice(1);

    if (digits.startsWith('55') && digits.length === 13) {
      const areaCode = digits.slice(2, 4);
      const prefix = digits.slice(4, 9);
      const suffix = digits.slice(9);
      return `+55 (${areaCode}) ${prefix}-${suffix}`;
    }

    const countryDigits = guessInternationalCountryCodeDigits(digits);
    const countryCode = digits.slice(0, countryDigits);
    const nationalNumber = digits.slice(countryDigits);

    if (!nationalNumber) {
      return `+${countryCode}`;
    }

    const formattedNational = formatInternationalNationalNumber(nationalNumber);
    return `+${countryCode} ${formattedNational}`.trim();
  }

  if (sanitized.length === 11) {
    return formatBrazilianPhone(sanitized);
  }

  return sanitized;
}

