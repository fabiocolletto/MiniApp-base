import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCep, lookupCep } from '../scripts/utils/cep-service.js';
import { PROFILE_ADDRESS_FIELD_SEQUENCE } from '../scripts/views/user.js';

test('PROFILE_ADDRESS_FIELD_SEQUENCE mantém o CEP como primeiro item', () => {
  assert.equal(PROFILE_ADDRESS_FIELD_SEQUENCE[0], 'zip');
});

test('normalizeCep remove caracteres não numéricos', () => {
  assert.equal(normalizeCep('12.345-678'), '12345678');
  assert.equal(normalizeCep(' abc '), '');
  assert.equal(normalizeCep(12345678), '');
});

test('lookupCep retorna endereço quando o serviço responde com sucesso', async () => {
  let receivedUrl = '';
  let receivedSignal = null;
  const controller = new AbortController();

  const fetchStub = async (url, options = {}) => {
    receivedUrl = url;
    receivedSignal = options.signal ?? null;
    return {
      ok: true,
      async json() {
        return {
          logradouro: 'Rua das Flores',
          bairro: 'Centro',
          localidade: 'São Paulo',
          uf: 'SP',
        };
      },
    };
  };

  const result = await lookupCep('12.345-678', { fetchFn: fetchStub, signal: controller.signal });

  assert.equal(receivedUrl, 'https://viacep.com.br/ws/12345678/json/');
  assert.equal(receivedSignal, controller.signal);
  assert.equal(result.status, 'success');
  assert.deepEqual(result.address, {
    street: 'Rua das Flores',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  });
});

test('lookupCep retorna not-found quando o serviço indica erro', async () => {
  const fetchStub = async () => ({
    ok: true,
    async json() {
      return { erro: true };
    },
  });

  const result = await lookupCep('12345678', { fetchFn: fetchStub });
  assert.equal(result.status, 'not-found');
});

test('lookupCep retorna network-error quando a resposta não é ok', async () => {
  const fetchStub = async () => ({
    ok: false,
    async json() {
      return {};
    },
  });

  const result = await lookupCep('12345678', { fetchFn: fetchStub });
  assert.equal(result.status, 'network-error');
});

test('lookupCep retorna aborted quando a requisição é cancelada', async () => {
  const abortError = new Error('aborted');
  abortError.name = 'AbortError';

  const fetchStub = async () => {
    throw abortError;
  };

  const controller = new AbortController();
  controller.abort();

  const result = await lookupCep('12345678', { fetchFn: fetchStub, signal: controller.signal });
  assert.equal(result.status, 'aborted');
});

test('lookupCep retorna invalid quando o CEP não possui 8 dígitos', async () => {
  const fetchStub = async () => {
    throw new Error('fetch should not be called');
  };

  const result = await lookupCep('1234', { fetchFn: fetchStub });
  assert.equal(result.status, 'invalid');
});
