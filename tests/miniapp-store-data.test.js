import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resetMiniApps,
  getMiniAppsSnapshot,
  getTopMiniAppsByDownloads,
  getTopMiniAppsByFavorites,
  getLatestMiniApps,
  getMiniAppsByFeaturedCategories,
} from '../scripts/data/miniapp-store.js';

test.after(() => {
  resetMiniApps();
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
  assert.equal(snapshot.length, 1);

  const [app] = snapshot;
  assert.equal(app.version, '2');
  assert.equal(app.downloads, 1010);
  assert.equal(app.favorites, 501);
  assert.equal(app.releaseDate, new Date(1700000000000).toISOString());
  assert.deepEqual(app.featuredCategories, ['Analytics', 'Gestão']);
  assert.deepEqual(app.access.sort(), ['colaborador', 'usuario']);
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
      downloads: 1200,
      favorites: 340,
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
      downloads: 860,
      favorites: 420,
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
      downloads: 1430,
      favorites: 180,
      releaseDate: '2025-01-15T10:00:00-03:00',
      featuredCategories: ['Financeiro'],
    },
  ]);

  const topDownloads = getTopMiniAppsByDownloads(2).map((app) => app.id);
  assert.deepEqual(topDownloads, ['gamma', 'alpha']);

  const topFavorites = getTopMiniAppsByFavorites(2).map((app) => app.id);
  assert.deepEqual(topFavorites, ['beta', 'alpha']);

  const newest = getLatestMiniApps(2).map((app) => app.id);
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

  const result = getMiniAppsByFeaturedCategories({ limit: 4 }).map((app) => app.id);
  assert.deepEqual(result, ['alpha', 'delta', 'gamma', 'beta']);
});
