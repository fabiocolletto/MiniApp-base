import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resetMiniApps,
  getMiniAppsSnapshot,
  getTopMiniAppsByDownloads,
  getTopMiniAppsByFavorites,
  getLatestMiniApps,
  getMiniAppsByFeaturedCategories,
  __resetMiniAppStoreStateForTests,
} from '../scripts/data/miniapp-store.js';

const OFFICIAL_MINIAPP_IDS = ['exam-planner', 'task-manager'];

test.after(() => {
  resetMiniApps();
});

test('snapshot padrão inclui Gestão de Trabalho e o Criador de Provas', () => {
  resetMiniApps();

  const snapshot = getMiniAppsSnapshot();
  const taskManager = snapshot.find((app) => app.id === 'task-manager');
  const examPlanner = snapshot.find((app) => app.id === 'exam-planner');

  assert.ok(taskManager, 'Gestão de Trabalho deve estar cadastrada no catálogo padrão de miniapps');
  assert.equal(taskManager?.category, 'Produtividade');
  assert.deepEqual(taskManager?.featuredCategories ?? [], ['Produtividade', 'Gestão de trabalho']);
  assert.ok(examPlanner, 'Criador de Provas deve estar cadastrado no catálogo padrão de miniapps');
  assert.equal(examPlanner?.category, 'Educação');
  assert.deepEqual(examPlanner?.featuredCategories ?? [], ['Educação', 'Avaliações escolares']);
  assert.deepEqual(
    snapshot
      .map((app) => app.id)
      .slice()
      .sort(),
    ['exam-planner', 'task-manager'],
  );
});

test('descarta placeholders legados persistidos ao inicializar o catálogo', () => {
  const legacySnapshot = [
    {
      id: 'time-tracker',
      name: 'Time Tracker',
      category: 'Produtividade',
      description:
        'Monitore jornadas, exporte relatórios completos e mantenha a equipe sincronizada com as regras do painel administrativo.',
      status: 'active',
      updatedAt: '2025-10-12T18:00:00-03:00',
      access: ['administrador', 'colaborador'],
      version: '1.8.0',
      downloads: 12840,
      favorites: 9420,
      releaseDate: '2024-05-10T09:00:00-03:00',
      featuredCategories: ['Produtividade', 'Gestão de tempo'],
      icon: null,
    },
    {
      id: 'field-forms',
      name: 'Field Forms',
      category: 'Operações',
      description:
        'Colete dados em campo mesmo offline, centralize anexos e acompanhe revisões em tempo real a partir do painel.',
      status: 'testing',
      updatedAt: '2025-10-18T09:30:00-03:00',
      access: ['administrador'],
      version: '3.2.1',
      downloads: 8640,
      favorites: 5120,
      releaseDate: '2023-11-03T11:30:00-03:00',
      featuredCategories: ['Operações', 'Coleta em campo'],
      icon: null,
    },
    {
      id: 'insights-hub',
      name: 'Insights Hub',
      category: 'Analytics',
      description:
        'Combine métricas de diferentes mini-apps, configure alertas inteligentes e acompanhe o avanço da implantação.',
      status: 'deployment',
      updatedAt: '2025-10-20T14:45:00-03:00',
      access: ['administrador', 'colaborador', 'usuario'],
      version: '0.9.5',
      downloads: 4760,
      favorites: 3980,
      releaseDate: '2024-07-22T15:15:00-03:00',
      featuredCategories: ['Analytics', 'Gestão'],
      icon: null,
    },
    {
      id: 'task-manager',
      name: 'Gestor de tarefas',
      category: 'Produtividade',
      description:
        'Organize o backlog, acompanhe indicadores de execução e detalhe cada entrega com checklists contextualizados.',
      status: 'active',
      updatedAt: '2025-10-25T15:03:00-03:00',
      access: ['administrador', 'colaborador', 'usuario'],
      version: '0.1.234',
      downloads: 3280,
      favorites: 2840,
      releaseDate: '2025-10-25T15:03:00-03:00',
      featuredCategories: ['Produtividade', 'Gestão de tarefas'],
      icon: null,
    },
  ];

  const storage = new Map();
  const localStorageMock = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  const previousWindow = global.window;
  global.window = { localStorage: localStorageMock };

  try {
    localStorageMock.setItem('miniapp:admin-miniapps', JSON.stringify(legacySnapshot));
    __resetMiniAppStoreStateForTests();

    const snapshot = getMiniAppsSnapshot();
    assert.equal(snapshot.length, 2);
    assert.deepEqual(
      snapshot
        .map((app) => app.id)
        .slice()
        .sort(),
      ['exam-planner', 'task-manager'],
    );

    const persisted = JSON.parse(localStorageMock.getItem('miniapp:admin-miniapps'));
    assert.ok(Array.isArray(persisted));
    assert.deepEqual(
      persisted
        .map((app) => app.id)
        .slice()
        .sort(),
      ['exam-planner', 'task-manager'],
    );
  } finally {
    if (previousWindow === undefined) {
      delete global.window;
    } else {
      global.window = previousWindow;
    }

    __resetMiniAppStoreStateForTests();
    resetMiniApps();
  }
});

test('descarta placeholders legados mesmo quando snapshot persistido está incompleto', () => {
  const legacySnapshot = [
    {
      id: 'time-tracker',
      name: 'Time Tracker',
      category: 'Produtividade',
      description:
        'Monitore jornadas, exporte relatórios completos e mantenha a equipe sincronizada com as regras do painel administrativo.',
      status: 'active',
      updatedAt: '2025-10-12T18:00:00-03:00',
      access: ['administrador', 'colaborador'],
      version: '1.8.0',
      downloads: 12840,
      favorites: 9420,
      releaseDate: '2024-05-10T09:00:00-03:00',
      featuredCategories: ['Produtividade', 'Gestão de tempo'],
      icon: null,
    },
    {
      id: 'field-forms',
      name: 'Field Forms',
      category: 'Operações',
      description:
        'Colete dados em campo mesmo offline, centralize anexos e acompanhe revisões em tempo real a partir do painel.',
      status: 'testing',
      updatedAt: '2025-10-18T09:30:00-03:00',
      access: ['administrador'],
      version: '3.2.1',
      downloads: 8640,
      favorites: 5120,
      releaseDate: '2023-11-03T11:30:00-03:00',
      featuredCategories: ['Operações', 'Coleta em campo'],
      icon: null,
    },
    {
      id: 'insights-hub',
      name: 'Insights Hub',
      category: 'Analytics',
      description:
        'Combine métricas de diferentes mini-apps, configure alertas inteligentes e acompanhe o avanço da implantação.',
      status: 'deployment',
      updatedAt: '2025-10-20T14:45:00-03:00',
      access: ['administrador', 'colaborador', 'usuario'],
      version: '0.9.5',
      downloads: 4760,
      favorites: 3980,
      releaseDate: '2024-07-22T15:15:00-03:00',
      featuredCategories: ['Analytics', 'Gestão'],
      icon: null,
    },
  ];

  const storage = new Map();
  const localStorageMock = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  const previousWindow = global.window;
  global.window = { localStorage: localStorageMock };

  try {
    localStorageMock.setItem('miniapp:admin-miniapps', JSON.stringify(legacySnapshot));
    __resetMiniAppStoreStateForTests();

    const snapshot = getMiniAppsSnapshot();
    assert.equal(snapshot.length, 2);
    assert.deepEqual(
      snapshot
        .map((app) => app.id)
        .slice()
        .sort(),
      ['exam-planner', 'task-manager'],
    );

    const persisted = JSON.parse(localStorageMock.getItem('miniapp:admin-miniapps'));
    assert.ok(Array.isArray(persisted));
    assert.deepEqual(
      persisted
        .map((app) => app.id)
        .slice()
        .sort(),
      ['exam-planner', 'task-manager'],
    );
  } finally {
    if (previousWindow === undefined) {
      delete global.window;
    } else {
      global.window = previousWindow;
    }

    __resetMiniAppStoreStateForTests();
    resetMiniApps();
  }
});

test('repõe miniapps padrão quando snapshot persistido não os inclui', () => {
  const storage = new Map();
  const localStorageMock = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  const persistedSnapshot = [
    {
      id: 'custom-app',
      name: 'App personalizado',
      category: 'Utilidades',
      description: 'Ferramenta criada para um cliente específico.',
      status: 'testing',
      updatedAt: '2025-10-01T12:00:00-03:00',
      access: ['usuario'],
      version: '1.0.0',
      downloads: 42,
      favorites: 8,
      releaseDate: '2025-10-01T12:00:00-03:00',
      featuredCategories: ['Utilidades'],
      icon: null,
    },
  ];

  const previousWindow = global.window;
  global.window = { localStorage: localStorageMock };

  try {
    localStorageMock.setItem('miniapp:admin-miniapps', JSON.stringify(persistedSnapshot));
    __resetMiniAppStoreStateForTests();

    const snapshot = getMiniAppsSnapshot();
    assert.equal(snapshot.length, 3);
    assert.deepEqual(
      snapshot
        .map((app) => app.id)
        .slice()
        .sort(),
      ['custom-app', 'exam-planner', 'task-manager'],
    );

    const persisted = JSON.parse(localStorageMock.getItem('miniapp:admin-miniapps'));
    assert.ok(Array.isArray(persisted));
    assert.deepEqual(
      persisted
        .map((app) => app.id)
        .slice()
        .sort(),
      ['custom-app', 'exam-planner', 'task-manager'],
    );
  } finally {
    if (previousWindow === undefined) {
      delete global.window;
    } else {
      global.window = previousWindow;
    }

    __resetMiniAppStoreStateForTests();
    resetMiniApps();
  }
});

test('resetMiniApps normalizes métricas numéricas e categorias destacadas', () => {
  resetMiniApps([
    {
      id: 'alpha',
      name: 'Alpha',
      category: 'Analytics',
      description: 'App de análise completa.',
      status: 'active',
      updatedAt: '2025-01-01T10:00:00-03:00',
      access: ['usuario', 'USUARIO', 'colaborador'],
      version: 2,
      downloads: '1010',
      favorites: 500.7,
      releaseDate: 1700000000000,
      featuredCategories: ['Analytics', '  Analytics  ', 'Gestão'],
    },
  ]);

  const snapshot = getMiniAppsSnapshot();
  assert.deepEqual(
    snapshot
      .map((app) => app.id)
      .slice()
      .sort(),
    ['alpha', ...OFFICIAL_MINIAPP_IDS].sort(),
  );

  const alpha = snapshot.find((app) => app.id === 'alpha');
  assert.ok(alpha, 'miniapp personalizado deve permanecer no catálogo');
  assert.equal(alpha.version, '2');
  assert.equal(alpha.downloads, 1010);
  assert.equal(alpha.favorites, 501);
  assert.equal(alpha.releaseDate, new Date(1700000000000).toISOString());
  assert.deepEqual(alpha.featuredCategories, ['Analytics', 'Gestão']);
  assert.deepEqual(alpha.access.sort(), ['colaborador', 'usuario']);
});

test('métricas de ranking retornam os miniapps ordenados corretamente', () => {
  resetMiniApps([
    {
      id: 'alpha',
      name: 'Alpha',
      category: 'Analytics',
      description: 'App de análise completa.',
      status: 'active',
      updatedAt: '2025-01-01T10:00:00-03:00',
      access: ['usuario'],
      version: '1.0.0',
      downloads: 5200,
      favorites: 2340,
      releaseDate: '2024-10-01T10:00:00-03:00',
      featuredCategories: ['Analytics'],
    },
    {
      id: 'beta',
      name: 'Beta',
      category: 'Operações',
      description: 'Ferramenta de campo.',
      status: 'testing',
      updatedAt: '2025-01-02T10:00:00-03:00',
      access: ['administrador'],
      version: '1.2.0',
      downloads: 4860,
      favorites: 3420,
      releaseDate: '2024-12-01T10:00:00-03:00',
      featuredCategories: ['Operações'],
    },
    {
      id: 'gamma',
      name: 'Gamma',
      category: 'Financeiro',
      description: 'Painel financeiro.',
      status: 'deployment',
      updatedAt: '2025-01-03T10:00:00-03:00',
      access: ['usuario'],
      version: '0.9.0',
      downloads: 6430,
      favorites: 1180,
      releaseDate: '2025-01-15T10:00:00-03:00',
      featuredCategories: ['Financeiro'],
    },
  ]);

  const topDownloads = getTopMiniAppsByDownloads(5)
    .map((app) => app.id)
    .filter((id) => !OFFICIAL_MINIAPP_IDS.includes(id))
    .slice(0, 2);
  assert.deepEqual(topDownloads, ['gamma', 'alpha']);

  const topFavorites = getTopMiniAppsByFavorites(5)
    .map((app) => app.id)
    .filter((id) => !OFFICIAL_MINIAPP_IDS.includes(id))
    .slice(0, 2);
  assert.deepEqual(topFavorites, ['beta', 'alpha']);

  const newest = getLatestMiniApps(5)
    .map((app) => app.id)
    .filter((id) => !OFFICIAL_MINIAPP_IDS.includes(id))
    .slice(0, 2);
  assert.deepEqual(newest, ['gamma', 'beta']);
});

test('getMiniAppsByFeaturedCategories respeita limite e ordenação por categoria', () => {
  resetMiniApps([
    {
      id: 'alpha',
      name: 'Alpha',
      category: 'Analytics',
      description: 'App de análise completa.',
      status: 'active',
      updatedAt: '2025-01-01T10:00:00-03:00',
      access: ['usuario'],
      version: '1.0.0',
      downloads: 150,
      favorites: 50,
      releaseDate: '2024-10-01T10:00:00-03:00',
      featuredCategories: ['Analytics', 'Relatórios'],
    },
    {
      id: 'beta',
      name: 'Beta',
      category: 'Operações',
      description: 'Ferramenta de campo.',
      status: 'testing',
      updatedAt: '2025-01-02T10:00:00-03:00',
      access: ['administrador'],
      version: '1.2.0',
      downloads: 320,
      favorites: 120,
      releaseDate: '2024-12-01T10:00:00-03:00',
      featuredCategories: ['Operações'],
    },
    {
      id: 'gamma',
      name: 'Gamma',
      category: 'Financeiro',
      description: 'Painel financeiro.',
      status: 'deployment',
      updatedAt: '2025-01-03T10:00:00-03:00',
      access: ['usuario'],
      version: '0.9.0',
      downloads: 280,
      favorites: 90,
      releaseDate: '2025-01-15T10:00:00-03:00',
      featuredCategories: [],
    },
    {
      id: 'delta',
      name: 'Delta',
      category: 'Analytics',
      description: 'Monitoramento avançado.',
      status: 'active',
      updatedAt: '2025-01-04T10:00:00-03:00',
      access: ['usuario'],
      version: '1.1.0',
      downloads: 80,
      favorites: 30,
      releaseDate: '2024-07-01T10:00:00-03:00',
      featuredCategories: ['Analytics'],
    },
  ]);

  const result = getMiniAppsByFeaturedCategories({ limit: 8 })
    .map((app) => app.id)
    .filter((id) => !OFFICIAL_MINIAPP_IDS.includes(id));
  assert.deepEqual(result.slice(0, 4), ['alpha', 'delta', 'gamma', 'beta']);
});
