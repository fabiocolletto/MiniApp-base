import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizePhoneInput,
  validatePasswordStrength,
  validatePhoneNumber,
  formatPhoneNumberForDisplay,
} from '../scripts/views/shared/validation.js';

test('sanitizePhoneInput removes formatting but mantém prefixo internacional', () => {
  assert.equal(sanitizePhoneInput('  +55 (11) 98888-7777  '), '+5511988887777');
  assert.equal(sanitizePhoneInput(' (11) 98888-7777 '), '11988887777');
  assert.equal(sanitizePhoneInput(''), '');
});

test('validatePhoneNumber aceita números internacionais entre 8 e 15 dígitos', () => {
  const valid = validatePhoneNumber('+447911123456');
  assert.equal(valid.isValid, true);
  assert.equal(valid.sanitized, '+447911123456');
  assert.equal(valid.type, 'international');

  const invalid = validatePhoneNumber('+44 79');
  assert.equal(invalid.isValid, false);
  assert.match(invalid.message, /8 a 15 dígitos/);
});

test('validatePhoneNumber aceita apenas celulares nacionais com 11 dígitos iniciando em 9', () => {
  const valid = validatePhoneNumber('(11) 98765-4321');
  assert.equal(valid.isValid, true);
  assert.equal(valid.sanitized, '11987654321');
  assert.equal(valid.type, 'br-mobile');

  const invalidLength = validatePhoneNumber('11 9876-4321');
  assert.equal(invalidLength.isValid, false);
  assert.match(invalidLength.message, /11 dígitos/);

  const invalidPrefix = validatePhoneNumber('(11) 82765-4321');
  assert.equal(invalidPrefix.isValid, false);
  assert.match(invalidPrefix.message, /iniciem com 9/);
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
  assert.equal(formatPhoneNumberForDisplay(''), '');
});

