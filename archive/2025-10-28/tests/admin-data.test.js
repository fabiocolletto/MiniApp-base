import test from 'node:test';
import assert from 'node:assert/strict';

import {
  filterUsersByQuery,
  sortUsersForAdmin,
  createAdminSummary,
} from '../scripts/views/shared/admin-data.js';

const baseUsers = [
  {
    id: 1,
    name: 'Ana Júlia',
    phone: '+5511999999999',
    password: 'Senha@123',
    device: 'iOS',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-02T12:00:00Z'),
    profile: { email: 'ana@example.com', document: '123.456.789-00' },
  },
  {
    id: 2,
    name: 'Bruno Silva',
    phone: '11988887777',
    password: 'Senha@123',
    device: 'Android',
    createdAt: new Date('2025-01-03T10:00:00Z'),
    updatedAt: new Date('2025-01-05T12:00:00Z'),
    profile: { email: 'bruno@empresa.com', document: '987.654.321-00' },
  },
  {
    id: 3,
    name: 'Carla Pêra',
    phone: '+447911123456',
    password: 'Senha@123',
    device: 'Web',
    createdAt: new Date('2025-01-02T10:00:00Z'),
    updatedAt: new Date('2025-01-04T12:00:00Z'),
    profile: { email: 'carla@example.co.uk', document: '' },
  },
];

test('filterUsersByQuery returns all users when query is empty', () => {
  const result = filterUsersByQuery(baseUsers, '');
  assert.equal(result.length, baseUsers.length);
});

test('filterUsersByQuery matches names ignoring accents and case', () => {
  const result = filterUsersByQuery(baseUsers, 'carla pera');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 3);
});

test('filterUsersByQuery matches numeric queries against sanitized phones', () => {
  const result = filterUsersByQuery(baseUsers, '988887777');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
});

test('filterUsersByQuery keeps editing user even when it does not match the query', () => {
  const result = filterUsersByQuery(baseUsers, 'carla', { alwaysIncludeId: 1 });
  assert.equal(result.some((user) => user.id === 1), true);
  assert.equal(result.some((user) => user.id === 3), true);
});

test('sortUsersForAdmin respects the selected strategy', () => {
  const byNewest = sortUsersForAdmin(baseUsers, 'createdAtDesc');
  assert.equal(byNewest[0].id, 2);

  const byNameAsc = sortUsersForAdmin(baseUsers, 'nameAsc');
  assert.deepEqual(
    byNameAsc.map((user) => user.id),
    [1, 2, 3],
  );

  const byNameDesc = sortUsersForAdmin(baseUsers, 'nameDesc');
  assert.deepEqual(
    byNameDesc.map((user) => user.id),
    [3, 2, 1],
  );
});

test('createAdminSummary generates contextual descriptions', () => {
  assert.equal(
    createAdminSummary(0, 0),
    'Nenhum usuário cadastrado até o momento.',
  );

  assert.equal(
    createAdminSummary(5, 0, 'ana'),
    'Nenhum usuário encontrado para “ana”.',
  );

  assert.equal(
    createAdminSummary(3, 3),
    'Exibindo 3 usuários.',
  );

  assert.equal(
    createAdminSummary(6, 2, 'bruno'),
    'Exibindo 2 usuários de 6 usuários. Filtro: “bruno”.',
  );
});
