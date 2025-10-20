import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.MINIAPP_USE_MEMORY_STORE = '1';

const userStoreModule = await import('../scripts/data/user-store.js');
const {
  resetUserStoreForTests,
  addUser,
  authenticateUser,
  updateUser,
  deleteUser,
  getUsers,
  getStorageStatus,
} = userStoreModule;

await resetUserStoreForTests();

beforeEach(async () => {
  await resetUserStoreForTests();
});

test('adiciona usuário e retorna dados sanitizados', { concurrency: false }, async () => {
  const savedUser = await addUser({
    name: '  Maria da Silva  ',
    phone: ' 11987654321 ',
    password: 'segredo',
    device: ' Dispositivo de Teste ',
    profile: { email: ' maria@example.com  ' },
    userType: 'Administrador',
  });

  assert.equal(savedUser.name, 'Maria da Silva');
  assert.equal(savedUser.phone, '11987654321');
  assert.equal(savedUser.device, 'Dispositivo de Teste');
  assert.equal(savedUser.profile.email, 'maria@example.com');
  assert.equal(savedUser.userType, 'administrador');

  const users = getUsers();
  assert.equal(users.length, 1);
  assert.notStrictEqual(users[0], savedUser);
  assert.equal(users[0].userType, 'administrador');

  const status = getStorageStatus();
  assert.equal(status.state, 'ready');
  assert.equal(status.message, 'Memória ativa');
  assert.equal(status.details, 'Armazenamento local sincronizado com 1 cadastro.');
});

test('exige telefone e senha ao adicionar usuário', { concurrency: false }, async () => {
  await assert.rejects(() => addUser({ phone: '', password: '' }), {
    message: /Telefone e senha são obrigatórios/,
  });
});

test('autentica usuário com credenciais válidas', { concurrency: false }, async () => {
  const savedUser = await addUser({
    phone: '11888877777',
    password: 'abc123',
  });

  const authenticated = await authenticateUser({
    phone: '11888877777',
    password: 'abc123',
  });

  assert.equal(authenticated.id, savedUser.id);
  assert.notStrictEqual(authenticated, savedUser);
  assert.equal(savedUser.userType, 'usuario');
  assert.equal(authenticated.userType, 'usuario');

  await assert.rejects(
    () => authenticateUser({ phone: '11888877777', password: 'senha-incorreta' }),
    {
      message: /Telefone ou senha inválidos/,
    }
  );
});

test('atualiza dados e perfil do usuário existente', { concurrency: false }, async () => {
  const savedUser = await addUser({
    name: 'Usuário Inicial',
    phone: '11777766666',
    password: 'senha123',
    profile: { notes: ' rascunho ' },
  });

  const updatedUser = await updateUser(savedUser.id, {
    name: '  Usuário Atualizado  ',
    profile: { notes: '  anotação importante  ' },
    userType: 'Colaborador',
  });

  assert.equal(updatedUser.name, 'Usuário Atualizado');
  assert.equal(updatedUser.profile.notes, 'anotação importante');
  assert.equal(updatedUser.userType, 'colaborador');

  const users = getUsers();
  assert.equal(users[0].name, 'Usuário Atualizado');
  assert.equal(users[0].profile.notes, 'anotação importante');
  assert.equal(users[0].userType, 'colaborador');

  const status = getStorageStatus();
  assert.equal(status.state, 'ready');
  assert.equal(status.message, 'Memória atualizada');
  assert.match(status.details, /Dados sincronizados com sucesso/i);
});

test('remove usuário cadastrado', { concurrency: false }, async () => {
  const savedUser = await addUser({
    phone: '11666655555',
    password: 'senha456',
  });

  assert.equal(savedUser.userType, 'usuario');

  await deleteUser(savedUser.id);

  const users = getUsers();
  assert.equal(users.length, 0);

  const status = getStorageStatus();
  assert.equal(status.state, 'empty');
  assert.equal(status.message, 'Memória ativa (vazia)');
  assert.match(status.details, /nenhum cadastro armazenado/i);
});
