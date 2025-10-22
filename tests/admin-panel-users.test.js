import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

import { setupFakeDom } from './helpers/fake-dom.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';

const initialUsers = [
  {
    name: 'Ana Lima',
    phone: '11999990000',
    password: 'Segredo!1',
    device: 'iPhone 14',
    userType: 'administrador',
    profile: {
      email: 'ana@example.com',
      secondaryPhone: '11888887777',
      document: '123.456.789-00',
      address: 'Rua das Flores',
      addressNumber: '123',
      addressComplement: '',
      addressDistrict: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01000000',
      addressCountry: 'Brasil',
      website: 'https://ana.example',
      socialLinkedin: '',
      socialInstagram: '',
      socialFacebook: '',
      socialTwitter: '',
      socialYoutube: '',
      birthDate: '',
      pronouns: 'ela/dela',
      profession: 'Analista',
      company: '5Horas',
      bio: '',
      notes: '',
    },
    preferences: {
      theme: 'light',
    },
  },
  {
    name: 'Bruno Costa',
    phone: '11877776666',
    password: 'Senha@2024',
    device: 'Pixel 7',
    userType: 'colaborador',
    profile: {
      email: 'bruno@example.com',
      secondaryPhone: '',
      document: '',
      address: 'Av. Paulista',
      addressNumber: '1000',
      addressComplement: 'cj 12',
      addressDistrict: 'Bela Vista',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01311000',
      addressCountry: 'Brasil',
      website: '',
      socialLinkedin: '',
      socialInstagram: '',
      socialFacebook: '',
      socialTwitter: '',
      socialYoutube: '',
      birthDate: '',
      pronouns: 'ele/dele',
      profession: 'Designer',
      company: '5Horas',
      bio: '',
      notes: '',
    },
    preferences: {
      theme: 'dark',
    },
  },
];

test('renderAdmin lista usuários com filtros, expansão e auto-save', async (t) => {
  const teardownDom = setupFakeDom();
  let viewRoot;
  t.after(() => {
    if (viewRoot) {
      runViewCleanup(viewRoot);
    }
    teardownDom();
  });

  mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => {
    mock.timers.reset();
  });

  const userStoreModule = await import('../scripts/data/user-store.js');

  if (typeof userStoreModule.resetUserStoreForTests === 'function') {
    await userStoreModule.resetUserStoreForTests();
  }

  const savedUsers = [];
  for (const entry of initialUsers) {
    const saved = await userStoreModule.addUser({
      name: entry.name,
      phone: entry.phone,
      password: entry.password,
      device: entry.device,
      profile: entry.profile,
      userType: entry.userType,
      preferences: entry.preferences,
    });
    savedUsers.push(saved);
  }

  const { renderAdmin } = await import('../scripts/views/admin.js');

  viewRoot = document.createElement('div');
  renderAdmin(viewRoot);

  const layout = viewRoot.querySelector('.admin-dashboard__layout');
  assert.ok(layout, 'layout administrativo deve ser renderizado');

  const table = viewRoot.querySelector('.admin-user-table');
  assert.ok(table, 'tabela de usuários não foi montada');

  const toolbarSummary = viewRoot.querySelector('.admin-user-toolbar__summary');
  assert.ok(toolbarSummary, 'resumo do toolbar é obrigatório');
  assert.match(toolbarSummary.textContent ?? '', /Exibindo 2 usuários/i);

  const firstUser = savedUsers[0];
  const summaryRows = Array.from(viewRoot.querySelectorAll('.admin-user-table__row'));
  const targetRow = summaryRows.find((row) => {
    const nameCell = row.querySelector('.admin-user-table__cell--name');
    return nameCell?.textContent?.includes(firstUser.name);
  });
  assert.ok(targetRow, 'linha do usuário não encontrada');
  const firstToggle = targetRow.querySelector('.admin-user-table__toggle');
  assert.ok(firstToggle, 'botão de expansão não encontrado');
  firstToggle.dispatchEvent({ type: 'click' });
  await Promise.resolve();

  const detailRows = Array.from(viewRoot.querySelectorAll('.admin-user-table__details-row'));
  const detailInputs = detailRows.flatMap((row) => Array.from(row.querySelectorAll('input')));
  const expectedId = `admin-user-${firstUser.id}-name`;
  assert.ok(
    detailInputs.some((input) => input.id === expectedId),
    `linha de detalhes não encontrada. IDs disponíveis: ${detailInputs
      .map((input) => input.id || '<sem id>')
      .join(', ')}`,
  );
  const nameInput = detailInputs.find((input) => input.id === expectedId);
  assert.ok(nameInput, 'campo de nome do usuário não foi renderizado');
  const updatedName = `${firstUser.name} Atualizada`;
  nameInput.value = updatedName;
  nameInput.dispatchEvent({ type: 'input', target: nameInput });

  mock.timers.tick(500);
  await new Promise((resolve) => setImmediate(resolve));
  await Promise.resolve();

  const usersAfterUpdate = userStoreModule.getUsers();
  const updatedUser = usersAfterUpdate.find((user) => user.id === firstUser.id);
  assert.ok(updatedUser, 'usuário atualizado deve existir');
  assert.equal(updatedUser?.name, updatedName);

  const feedbackList = Array.from(viewRoot.querySelectorAll('.admin-user-details__feedback'));
  const feedback = feedbackList.find((element) => element.dataset.userId === String(firstUser.id));
  assert.ok(feedback, 'feedback inline deve existir');

  await new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      if (feedback.dataset.state === 'success') {
        resolve();
        return;
      }
      if (attempts >= 5) {
        reject(new Error(`estado do feedback: ${feedback.dataset.state ?? '<indefinido>'}`));
        return;
      }
      attempts += 1;
      setImmediate(check);
    };
    check();
  });

  assert.equal(feedback.dataset.state, 'success');
  assert.match(feedback.textContent ?? '', /Dados atualizados automaticamente/i);

  const searchInput = viewRoot.querySelector('.admin-user-toolbar__search');
  assert.ok(searchInput, 'campo de busca não encontrado');
  const secondUser = savedUsers[1];
  searchInput.value = secondUser.name.split(' ')[0];
  searchInput.dispatchEvent({ type: 'input', target: searchInput });

  mock.timers.tick(50);

  const filteredRows = viewRoot.querySelectorAll('.admin-user-table__row');
  assert.equal(filteredRows.length, 2, 'filtro por busca mantém o usuário expandido visível');
  const filteredNames = Array.from(filteredRows).map((row) => {
    const cell = row.querySelector('.admin-user-table__cell--name');
    return cell?.textContent ?? '';
  });
  assert.ok(
    filteredNames.some((name) => name.includes(firstUser.name)),
    'usuário expandido deve permanecer na listagem após filtrar',
  );
  assert.ok(
    filteredNames.some((name) => name.includes(secondUser.name)),
    'resultado do filtro por busca deve estar visível',
  );
  assert.match(toolbarSummary.textContent ?? '', /Filtro: “Bruno”/i);

  const typeSelect = Array.from(viewRoot.querySelectorAll('select')).find(
    (element) => element.name === 'admin-user-filter-type'
  );
  assert.ok(typeSelect, 'filtro por tipo deve existir');
  typeSelect.value = 'colaborador';
  typeSelect.dispatchEvent({ type: 'change', target: typeSelect });

  mock.timers.tick(50);

  const rowsAfterTypeFilter = viewRoot.querySelectorAll('.admin-user-table__row');
  assert.equal(rowsAfterTypeFilter.length, 2, 'usuário expandido deve continuar visível junto ao filtro');
});
