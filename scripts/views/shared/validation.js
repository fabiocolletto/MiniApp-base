const BRAZIL_COUNTRY_CODE = '55';
const BRAZIL_LOCAL_LENGTH = 11;
const INTERNATIONAL_MIN_LENGTH = 8;
const INTERNATIONAL_MAX_LENGTH = 15;
const COUNTRY_CODE_MAX_LENGTH = 3;

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
    return `+${digitsOnly.slice(0, COUNTRY_CODE_MAX_LENGTH + INTERNATIONAL_MAX_LENGTH)}`;
  }

  return trimmed.replace(/[^0-9]/g, '').slice(0, INTERNATIONAL_MAX_LENGTH);
}

export function sanitizePhoneInput(rawValue) {
  return stripFormatting(rawValue);
}

export function sanitizeCountryCode(rawValue) {
  if (typeof rawValue !== 'string') {
    return '';
  }

  return rawValue.replace(/[^0-9]/g, '').slice(0, COUNTRY_CODE_MAX_LENGTH);
}

export function sanitizeLocalPhoneNumber(rawValue) {
  if (typeof rawValue !== 'string') {
    return '';
  }

  return rawValue.replace(/[^0-9]/g, '');
}

function isBrazilianCode(code) {
  return code === BRAZIL_COUNTRY_CODE;
}

function buildBrazilianValidation(localDigits) {
  if (localDigits.length !== BRAZIL_LOCAL_LENGTH) {
    return {
      isValid: false,
      message: 'Digite um celular brasileiro com DDD e 11 dígitos.',
      field: 'number',
      sanitized: localDigits.slice(0, BRAZIL_LOCAL_LENGTH),
    };
  }

  if (localDigits[2] !== '9') {
    return {
      isValid: false,
      message: 'Aceitamos apenas celulares que iniciem com 9 após o DDD.',
      field: 'number',
      sanitized: localDigits.slice(0, BRAZIL_LOCAL_LENGTH),
    };
  }

  const sanitized = localDigits.slice(0, BRAZIL_LOCAL_LENGTH);
  return {
    isValid: true,
    sanitized,
    type: 'br-mobile',
    countryCode: BRAZIL_COUNTRY_CODE,
    localNumber: sanitized,
  };
}

function buildInternationalValidation(countryCode, localDigits) {
  if (localDigits.length < INTERNATIONAL_MIN_LENGTH || localDigits.length > INTERNATIONAL_MAX_LENGTH) {
    return {
      isValid: false,
      message: 'Digite um número internacional com 8 a 15 dígitos.',
      field: 'number',
      sanitized: `+${countryCode}${localDigits.slice(0, INTERNATIONAL_MAX_LENGTH)}`,
    };
  }

  const limitedLocal = localDigits.slice(0, INTERNATIONAL_MAX_LENGTH);
  return {
    isValid: true,
    sanitized: `+${countryCode}${limitedLocal}`,
    type: 'international',
    countryCode,
    localNumber: limitedLocal,
  };
}

export function validatePhoneParts(countryRaw, localRaw) {
  const countryCode = sanitizeCountryCode(countryRaw);
  const localDigits = sanitizeLocalPhoneNumber(localRaw);

  if (!countryCode) {
    return {
      isValid: false,
      message: 'Informe o código do país.',
      field: 'country',
      sanitized: '',
      countryCode,
      localNumber: localDigits,
    };
  }

  if (!localDigits) {
    return {
      isValid: false,
      message: 'Informe um telefone para contato.',
      field: 'number',
      sanitized: '',
      countryCode,
      localNumber: localDigits,
    };
  }

  if (isBrazilianCode(countryCode)) {
    const result = buildBrazilianValidation(localDigits);
    return {
      ...result,
      countryCode: BRAZIL_COUNTRY_CODE,
      localNumber: localDigits.slice(0, BRAZIL_LOCAL_LENGTH),
    };
  }

  const result = buildInternationalValidation(countryCode, localDigits);
  return {
    ...result,
    countryCode,
    localNumber: localDigits.slice(0, INTERNATIONAL_MAX_LENGTH),
  };
}

export function validatePhoneNumber(rawValue) {
  const sanitized = sanitizePhoneInput(rawValue);

  if (!sanitized) {
    return {
      isValid: false,
      sanitized,
      message: 'Informe um telefone para contato.',
      field: 'number',
    };
  }

  if (sanitized.startsWith('+')) {
    const digits = sanitized.slice(1);
    const countryGuess = guessInternationalCountryCodeDigits(digits);
    const countryCode = digits.slice(0, countryGuess);
    const localNumber = digits.slice(countryGuess);
    const result = validatePhoneParts(countryCode, localNumber);
    if (result.isValid) {
      return result;
    }
    return {
      ...result,
      sanitized,
    };
  }

  const result = validatePhoneParts(BRAZIL_COUNTRY_CODE, sanitized);
  if (result.isValid) {
    return result;
  }
  return {
    ...result,
    sanitized,
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
  if (digits.length !== BRAZIL_LOCAL_LENGTH) {
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
  if (digits.startsWith('55') && digits.length === BRAZIL_LOCAL_LENGTH + BRAZIL_COUNTRY_CODE.length) {
    return BRAZIL_COUNTRY_CODE.length;
  }

  if (digits.length <= INTERNATIONAL_MIN_LENGTH) {
    return 1;
  }

  if (digits.length >= INTERNATIONAL_MAX_LENGTH + 1) {
    return COUNTRY_CODE_MAX_LENGTH;
  }

  return 2;
}

function buildPhoneFromParts(countryCodeRaw, localNumberRaw) {
  const countryCode = sanitizeCountryCode(countryCodeRaw);
  const localDigits = sanitizeLocalPhoneNumber(localNumberRaw);

  if (!countryCode) {
    return localDigits;
  }

  if (isBrazilianCode(countryCode)) {
    return localDigits;
  }

  if (!localDigits) {
    return `+${countryCode}`;
  }

  return `+${countryCode}${localDigits}`;
}

export function formatPhoneNumberForDisplay(value, localNumber) {
  if (typeof value === 'object' && value !== null) {
    return formatPhoneNumberForDisplay(value.countryCode, value.localNumber);
  }

  if (typeof localNumber === 'string') {
    const countryCode = sanitizeCountryCode(value);
    const localDigits = sanitizeLocalPhoneNumber(localNumber);

    if (!countryCode) {
      return formatPhoneNumberForDisplay(localDigits);
    }

    if (!localDigits) {
      return `+${countryCode}`;
    }

    if (isBrazilianCode(countryCode)) {
      const limitedLocal = localDigits.slice(0, BRAZIL_LOCAL_LENGTH);
      return formatBrazilianPhone(limitedLocal);
    }

    const limitedLocal = localDigits.slice(0, INTERNATIONAL_MAX_LENGTH);
    const formattedNational = formatInternationalNationalNumber(limitedLocal);
    return `+${countryCode} ${formattedNational}`.trim();
  }

  if (typeof value !== 'string') {
    return '';
  }

  const sanitized = sanitizePhoneInput(value);

  if (!sanitized) {
    return '';
  }

  if (sanitized.startsWith('+')) {
    const digits = sanitized.slice(1);

    if (
      digits.startsWith(BRAZIL_COUNTRY_CODE) &&
      digits.length === BRAZIL_COUNTRY_CODE.length + BRAZIL_LOCAL_LENGTH
    ) {
      const areaCode = digits.slice(2, 4);
      const prefix = digits.slice(4, 9);
      const suffix = digits.slice(9);
      return `+${BRAZIL_COUNTRY_CODE} (${areaCode}) ${prefix}-${suffix}`;
    }

    if (typeof localNumber === 'undefined' && digits.length % 3 === 0) {
      const groups = digits.match(/.{1,3}/g);
      if (groups && groups.length > 1) {
        const [firstGroup, ...rest] = groups;
        return `+${firstGroup} ${rest.join(' ')}`.trim();
      }
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

  if (sanitized.length === BRAZIL_LOCAL_LENGTH) {
    return formatBrazilianPhone(sanitized);
  }

  return sanitized;
}
