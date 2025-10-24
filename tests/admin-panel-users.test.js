import test from 'node:test';
import assert from 'node:assert/strict';

import { setupFakeDom } from './helpers/fake-dom.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';
import { resetMiniApps } from '../scripts/data/miniapp-store.js';
import { resetSubscriptionPlans } from '../scripts/data/subscription-store.js';

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

test('renderAdmin exibe widgets de gestão de usuários, assinaturas e miniapps', async (t) => {
  const teardownDom = setupFakeDom();
  let viewRoot;

  t.after(() => {
    if (viewRoot) {
      runViewCleanup(viewRoot);
    }
    resetMiniApps();
    resetSubscriptionPlans();
    teardownDom();
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

  resetMiniApps();
  resetSubscriptionPlans();

  const { renderAdmin } = await import('../scripts/views/admin.js');

  viewRoot = document.createElement('div');
  renderAdmin(viewRoot);

  const widgets = viewRoot.querySelectorAll('.user-panel__widget');
  assert.equal(widgets.length, 6, 'painel deve começar com seis widgets principais incluindo identidade visual');

  const brandingWidget = viewRoot.querySelector('.admin-dashboard__widget--branding');
  assert.ok(brandingWidget, 'widget de identidade visual deve existir');

  const brandingControls = brandingWidget.querySelectorAll('.admin-branding__item');
  assert.ok(brandingControls.length > 0, 'widget de identidade visual deve exibir controles de logo');

  const usersWidget = viewRoot.querySelector('.admin-dashboard__widget--users');
  assert.ok(usersWidget, 'widget de usuários deve existir');

  const userTable = usersWidget.querySelector('.admin-user-table');
  assert.ok(userTable, 'tabela de usuários não foi renderizada');

  const userRows = Array.from(userTable.querySelectorAll('.admin-user-table__row'));
  assert.equal(userRows.length, savedUsers.length, 'tabela deve listar todos os usuários cadastrados');

  const firstUser = savedUsers[0];
  const firstRow = userRows.find((row) => row.dataset.userId === String(firstUser.id));
  assert.ok(firstRow, 'linha do usuário inicial não encontrada');

  const typeCell = firstRow.querySelector('.admin-user-table__cell--type');
  assert.equal(typeCell?.textContent, 'Administrador', 'tipo do usuário deve aparecer na linha principal');

  const toggleButton = firstRow.querySelector('.admin-user-table__toggle');
  assert.ok(toggleButton, 'botão de expansão do usuário não disponível');
  toggleButton.dispatchEvent({ type: 'click' });

  const detailsRow = Array.from(userTable.querySelectorAll('.admin-user-table__details-row')).find(
    (row) => row.dataset.userId === String(firstUser.id),
  );
  assert.ok(detailsRow, 'linha de detalhes do usuário não encontrada');
  assert.equal(detailsRow.hidden, false, 'detalhes do usuário devem ficar visíveis após expansão');

  const summaryItems = Array.from(detailsRow.querySelectorAll('.user-dashboard__summary-item'));
  const emailItem = summaryItems.find((item) => {
    const label = item.querySelector('.user-dashboard__summary-label');
    return label?.textContent === 'E-mail principal';
  });
  const emailValue = emailItem?.querySelector('.user-dashboard__summary-value')?.textContent ?? '';
  assert.equal(emailValue, 'ana@example.com', 'detalhes devem incluir o e-mail principal sincronizado');

  const miniAppsWidget = viewRoot.querySelector('.admin-dashboard__widget--miniapps');
  assert.ok(miniAppsWidget, 'widget de miniapps não foi exibido');

  const miniAppTable = miniAppsWidget.querySelector('.admin-miniapp-table');
  assert.ok(miniAppTable, 'tabela de miniapps deve ser renderizada');

  const miniAppRows = Array.from(miniAppTable.querySelectorAll('.admin-miniapp-table__row'));
  assert.ok(miniAppRows.length > 0, 'é esperado ao menos um mini-app configurado');

  const firstAppRow = miniAppRows[0];
  const appId = firstAppRow.dataset.appId;
  assert.ok(appId, 'linha de mini-app precisa expor data-app-id');

  const statusBadgeBefore = firstAppRow.querySelector('.admin-miniapp-table__status-badge');
  const statusBefore = statusBadgeBefore?.textContent ?? '';

  const miniAppToggle = firstAppRow.querySelector('.admin-user-table__toggle');
  assert.ok(miniAppToggle, 'botão de expansão do mini-app não encontrado');
  miniAppToggle.dispatchEvent({ type: 'click' });

  let appDetailsRow = Array.from(miniAppTable.querySelectorAll('.admin-miniapp-table__details-row')).find(
    (row) => row.dataset.appId === appId,
  );
  assert.ok(appDetailsRow, 'detalhes do mini-app não foram renderizados');
  assert.equal(appDetailsRow.hidden, false, 'detalhes do mini-app devem ficar visíveis');

  const statusSelect = appDetailsRow.querySelector('.admin-miniapp-table__status-select');
  assert.ok(statusSelect, 'controle de status do mini-app é obrigatório');
  const nextStatus = Array.from(statusSelect.children).find((option) => option.value !== statusSelect.value);
  assert.ok(nextStatus, 'é necessário possuir pelo menos duas opções de status');
  statusSelect.value = nextStatus.value;
  statusSelect.dispatchEvent({ type: 'change', target: statusSelect });

  const updatedRow = Array.from(miniAppTable.querySelectorAll('.admin-miniapp-table__row')).find(
    (row) => row.dataset.appId === appId,
  );
  assert.ok(updatedRow, 'linha do mini-app deve persistir após atualização');
  const statusBadgeAfter = updatedRow.querySelector('.admin-miniapp-table__status-badge');
  assert.notEqual(statusBadgeAfter?.textContent, statusBefore, 'status exibido deve refletir a alteração');

  appDetailsRow = Array.from(miniAppTable.querySelectorAll('.admin-miniapp-table__details-row')).find(
    (row) => row.dataset.appId === appId,
  );

  const accessCheckbox = appDetailsRow?.querySelector('input[value="usuario"]');
  if (accessCheckbox) {
    const previousValue = accessCheckbox.checked;
    accessCheckbox.checked = !previousValue;
    accessCheckbox.dispatchEvent({ type: 'change', target: accessCheckbox });

    const refreshedRow = Array.from(miniAppTable.querySelectorAll('.admin-miniapp-table__row')).find(
      (row) => row.dataset.appId === appId,
    );
    const accessCell = refreshedRow?.querySelector('.admin-miniapp-table__cell--access');
    assert.ok(accessCell, 'coluna de acesso deve continuar acessível');
    const chips = Array.from(accessCell?.querySelectorAll('.admin-miniapp-table__access-chip') ?? []);
    if (chips.length > 0) {
      assert.ok(
        chips.some((chip) => (chip.textContent ?? '').trim() !== ''),
        'resumo de acesso deve listar os níveis habilitados',
      );
    } else {
      const emptyState = accessCell
        ?.querySelector('.admin-miniapp-table__access-empty')
        ?.textContent?.trim();
      assert.ok(emptyState, 'estado vazio de acesso precisa informar ausência de permissões');
    }
  }

  const subscriptionWidget = viewRoot.querySelector('.admin-dashboard__widget--subscriptions');
  assert.ok(subscriptionWidget, 'widget de assinaturas deve ser exibido');

  const subscriptionTable = subscriptionWidget.querySelector('.admin-subscription-table');
  assert.ok(subscriptionTable, 'tabela de assinaturas deve ser renderizada');

  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const accessLevelLabels = new Map([
    ['administrador', 'Administradores'],
    ['colaborador', 'Colaboradores'],
    ['usuario', 'Usuários finais'],
  ]);

  const targetPlanId = 'field-expansion';
  let subscriptionRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  assert.ok(subscriptionRow, 'linha do pacote de expansão deve existir');

  const subscriptionToggle = subscriptionRow.querySelector('.admin-user-table__toggle');
  assert.ok(subscriptionToggle, 'botão de expansão do pacote não encontrado');
  subscriptionToggle.dispatchEvent({ type: 'click' });

  let subscriptionDetailsRow = Array.from(
    subscriptionTable.querySelectorAll('.admin-subscription-table__details-row'),
  ).find((row) => row.dataset.planId === targetPlanId);
  assert.ok(subscriptionDetailsRow, 'detalhes do pacote não foram renderizados');
  assert.equal(subscriptionDetailsRow.hidden, false, 'detalhes do pacote devem ficar visíveis');

  const priceInput = subscriptionDetailsRow.querySelector('.admin-subscription-table__price-input');
  assert.ok(priceInput, 'campo de valor do pacote é obrigatório');
  const currentPrice = Number.parseFloat(priceInput.value || '0');
  const updatedPrice = Math.max(0, (Number.isFinite(currentPrice) ? currentPrice : 0) + 10);
  priceInput.value = updatedPrice.toFixed(2);
  priceInput.dispatchEvent({ type: 'change', target: priceInput });

  subscriptionRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  assert.ok(subscriptionRow, 'linha do pacote deve persistir após atualizar valor');
  const priceCell = subscriptionRow.querySelector('.admin-subscription-table__cell--price');
  assert.equal(
    priceCell?.textContent,
    currencyFormatter.format(updatedPrice),
    'valor do pacote deve refletir a atualização',
  );

  subscriptionDetailsRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__details-row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  assert.ok(subscriptionDetailsRow, 'detalhes do pacote devem permanecer acessíveis após atualização de valor');

  const miniAppCheckbox = subscriptionDetailsRow.querySelector('.admin-miniapp-table__access-checkbox');
  assert.ok(miniAppCheckbox, 'é esperado ao menos um mini-app configurável no pacote');
  const wasChecked = miniAppCheckbox.checked;
  miniAppCheckbox.checked = !wasChecked;
  miniAppCheckbox.dispatchEvent({ type: 'change', target: miniAppCheckbox });

  subscriptionRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  const miniAppsSummary = subscriptionRow?.querySelector('.admin-miniapp-table__access-summary');
  const emptySummary = miniAppsSummary?.querySelector('.admin-miniapp-table__access-empty');
  if (wasChecked) {
    assert.ok(emptySummary, 'sumário do pacote deve indicar ausência de mini-apps após remoção');
  } else {
    const chipsAfter = miniAppsSummary
      ? Array.from(miniAppsSummary.querySelectorAll('.admin-miniapp-table__access-chip'))
      : [];
    assert.ok(chipsAfter.length > 0, 'sumário do pacote deve listar mini-apps ativos após inclusão');
  }

  subscriptionDetailsRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__details-row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  assert.ok(subscriptionDetailsRow, 'detalhes do pacote devem continuar disponíveis para atualizar categoria');

  const categorySelect = subscriptionDetailsRow.querySelector('.admin-subscription-table__category-select');
  assert.ok(categorySelect, 'campo de categoria habilitada é obrigatório');
  const availableCategories = Array.from(categorySelect.querySelectorAll('option'));
  const nextCategory = availableCategories.find((option) => option.value !== categorySelect.value);
  assert.ok(nextCategory, 'é necessário possuir ao menos duas categorias disponíveis');
  categorySelect.value = nextCategory.value;
  categorySelect.dispatchEvent({ type: 'change', target: categorySelect });

  subscriptionRow = Array.from(subscriptionTable.querySelectorAll('.admin-subscription-table__row')).find(
    (row) => row.dataset.planId === targetPlanId,
  );
  const categoryCell = subscriptionRow?.querySelector('.admin-subscription-table__cell--category');
  assert.equal(
    categoryCell?.textContent,
    accessLevelLabels.get(nextCategory.value),
    'categoria exibida deve acompanhar a atualização do pacote',
  );
});
