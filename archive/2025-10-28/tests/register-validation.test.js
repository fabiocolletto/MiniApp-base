import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizePhoneInput,
  sanitizeCountryCode,
  sanitizeLocalPhoneNumber,
  validatePasswordStrength,
  validatePhoneParts,
  formatPhoneNumberForDisplay,
} from '../scripts/views/shared/validation.js';

test('sanitizePhoneInput removes formatting but mantém prefixo internacional', () => {
  assert.equal(sanitizePhoneInput('  +55 (11) 98888-7777  '), '+5511988887777');
  assert.equal(sanitizePhoneInput(' (11) 98888-7777 '), '11988887777');
  assert.equal(sanitizePhoneInput(''), '');
});

test('sanitizeCountryCode e sanitizeLocalPhoneNumber removem caracteres inválidos', () => {
  assert.equal(sanitizeCountryCode(' +55 '), '55');
  assert.equal(sanitizeCountryCode('0044'), '004');
  assert.equal(sanitizeCountryCode(''), '');

  assert.equal(sanitizeLocalPhoneNumber('(11) 98888-7777'), '11988887777');
  assert.equal(sanitizeLocalPhoneNumber('79 11 123 456'), '7911123456');
});

test('validatePhoneParts aceita apenas celulares brasileiros completos iniciando em 9', () => {
  const valid = validatePhoneParts('55', '(11) 98765-4321');
  assert.equal(valid.isValid, true);
  assert.equal(valid.sanitized, '11987654321');
  assert.equal(valid.type, 'br-mobile');
  assert.equal(valid.countryCode, '55');
  assert.equal(valid.localNumber, '11987654321');

  const invalidLength = validatePhoneParts('55', '11 9876-4321');
  assert.equal(invalidLength.isValid, false);
  assert.match(invalidLength.message, /11 dígitos/);
  assert.equal(invalidLength.field, 'number');

  const invalidPrefix = validatePhoneParts('55', '(11) 82765-4321');
  assert.equal(invalidPrefix.isValid, false);
  assert.match(invalidPrefix.message, /iniciem com 9/);
  assert.equal(invalidPrefix.field, 'number');
});

test('validatePhoneParts aceita números internacionais com 8 a 15 dígitos', () => {
  const valid = validatePhoneParts('44', '7911123456');
  assert.equal(valid.isValid, true);
  assert.equal(valid.sanitized, '+447911123456');
  assert.equal(valid.type, 'international');
  assert.equal(valid.countryCode, '44');
  assert.equal(valid.localNumber, '7911123456');

  const invalid = validatePhoneParts('44', '79');
  assert.equal(invalid.isValid, false);
  assert.match(invalid.message, /8 a 15 dígitos/);
  assert.equal(invalid.field, 'number');
});

test('validatePhoneParts exige código de país', () => {
  const invalid = validatePhoneParts('', '11987654321');
  assert.equal(invalid.isValid, false);
  assert.match(invalid.message, /código do país/);
  assert.equal(invalid.field, 'country');
});

test('validatePasswordStrength impõe tamanho mínimo e diversidade de caracteres', () => {
  assert.equal(validatePasswordStrength('Abc12345').isValid, true);
  assert.equal(validatePasswordStrength('Senha#Segura1').isValid, true);

  const short = validatePasswordStrength('Abc1');
  assert.equal(short.isValid, false);
  assert.match(short.message, /8 caracteres/);

  const weak = validatePasswordStrength('abcdefgh');
  assert.equal(weak.isValid, false);
  assert.match(weak.message, /letra e um número ou símbolo/);
});

test('formatPhoneNumberForDisplay formata telefones nacionais e internacionais conhecidos', () => {
  assert.equal(formatPhoneNumberForDisplay('11987654321'), '(11) 98765-4321');
  assert.equal(formatPhoneNumberForDisplay('+5511987654321'), '+55 (11) 98765-4321');
  assert.equal(formatPhoneNumberForDisplay('+447911123456'), '+447 911 123 456');
  assert.equal(formatPhoneNumberForDisplay({ countryCode: '55', localNumber: '11987654321' }), '(11) 98765-4321');
  assert.equal(
    formatPhoneNumberForDisplay({ countryCode: '44', localNumber: '7911123456' }),
    '+44 791 112 3456'
  );
  assert.equal(formatPhoneNumberForDisplay(''), '');
});

