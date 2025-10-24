import { createDefinitionItem } from './system-users-widget.js';
import { subscribeIndexedDbSnapshot } from '../../data/system-storage.js';

const countFormatter = new Intl.NumberFormat('pt-BR');
const byteFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function formatCount(value) {
  const numericValue = Number.isFinite(value) ? value : 0;
  return countFormatter.format(Math.max(0, Math.trunc(numericValue)));
}

function formatBytes(bytes) {
  const numericValue = Number(bytes);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(numericValue) / Math.log(1024)), units.length - 1);
  const normalized = numericValue / 1024 ** exponent;
  return `${byteFormatter.format(normalized)} ${units[exponent]}`;
}

function normalizeVersion(version) {
  if (typeof version === 'number' && Number.isFinite(version)) {
    return version.toString();
  }

  if (typeof version === 'string' && version.trim() !== '') {
    return version.trim().replace(/^v/i, '');
  }

  return '—';
}

function createChip(label, state) {
  const chip = document.createElement('span');
  chip.className = 'miniapp-details__chip';
  chip.textContent = label;

  if (state) {
    chip.dataset.state = state;
  }

  return chip;
}

function createEmptyState() {
  const emptyState = document.createElement('p');
  emptyState.className = 'admin-storage__empty';
  emptyState.textContent = 'Nenhum banco IndexedDB disponível no momento.';
  return emptyState;
}

function sanitizeStatus(status) {
  const state = typeof status?.state === 'string' ? status.state : 'loading';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Memória carregando';
  const details = typeof status?.details === 'string' ? status.details.trim() : '';

  return { state, message, details };
}

function renderStore(store) {
  const section = document.createElement('section');
  section.className = 'admin-storage__store';
  section.dataset.storeId = typeof store?.id === 'string' ? store.id : store?.name ?? '';

  const title = document.createElement('h4');
  title.className = 'admin-storage__store-title';
  title.textContent = typeof store?.name === 'string' && store.name.trim() ? store.name.trim() : 'Store sem nome';

  const list = document.createElement('dl');
  list.className = 'user-dashboard__summary-list admin-storage__store-summary';

  const recordsLabel = store?.records === 1 ? 'registro' : 'registros';
  list.append(
    createDefinitionItem('Registros', `${formatCount(store?.records)} ${recordsLabel}`),
    createDefinitionItem('Tamanho estimado', formatBytes(store?.approximateSizeBytes)),
  );

  if (typeof store?.details === 'string' && store.details.trim()) {
    list.append(createDefinitionItem('Detalhes', store.details.trim()));
  }

  section.append(title, list);
  return section;
}

function renderDatabase(database) {
  const card = document.createElement('article');
  card.className = 'admin-storage__card';
  card.dataset.databaseId = typeof database?.id === 'string' ? database.id : database?.name ?? '';

  const header = document.createElement('div');
  header.className = 'admin-storage__card-header';

  const title = document.createElement('h3');
  title.className = 'admin-storage__card-title';
  title.textContent = typeof database?.name === 'string' && database.name.trim() ? database.name.trim() : 'Banco desconhecido';

  const meta = document.createElement('div');
  meta.className = 'admin-storage__card-meta';

  const versionChip = createChip(`v${normalizeVersion(database?.version)}`);
  versionChip.dataset.type = 'version';
  meta.append(versionChip);

  const recordsChip = createChip(
    `${formatCount(database?.total?.records)} ${database?.total?.records === 1 ? 'registro' : 'registros'}`,
  );
  recordsChip.dataset.type = 'records';
  meta.append(recordsChip);

  header.append(title, meta);

  const status = sanitizeStatus(database?.status);
  const statusElement = document.createElement('p');
  statusElement.className = 'admin-storage__card-status';
  statusElement.dataset.state = status.state;
  statusElement.textContent = status.details ? `${status.message} — ${status.details}` : status.message;

  const storesContainer = document.createElement('div');
  storesContainer.className = 'admin-storage__stores';

  const stores = Array.isArray(database?.stores) ? database.stores : [];
  if (stores.length > 0) {
    stores
      .map((store) => renderStore(store))
      .forEach((storeSection) => {
        storesContainer.append(storeSection);
      });
  } else {
    const emptyStore = document.createElement('p');
    emptyStore.className = 'admin-storage__store-empty';
    emptyStore.textContent = 'Nenhuma store sincronizada no momento.';
    storesContainer.append(emptyStore);
  }

  card.append(header, statusElement, storesContainer);
  return card;
}

function updateSummary(summaryListElement, summary) {
  const summaryData = summary ?? {};

  const items = [
    createDefinitionItem('Bancos monitorados', formatCount(summaryData.databases)),
    createDefinitionItem('Stores catalogados', formatCount(summaryData.stores)),
    createDefinitionItem('Registros sincronizados', formatCount(summaryData.records)),
    createDefinitionItem('Uso estimado', formatBytes(summaryData.approximateSizeBytes)),
  ];

  summaryListElement.replaceChildren(...items);
}

function updateStatus(statusElement, status) {
  const normalized = sanitizeStatus(status);
  statusElement.dataset.state = normalized.state;
  statusElement.textContent = normalized.details
    ? `${normalized.message} — ${normalized.details}`
    : normalized.message;
}

function updateDatabases(container, databases) {
  const entries = Array.isArray(databases) ? databases : [];
  if (entries.length === 0) {
    container.replaceChildren(createEmptyState());
    return;
  }

  const cards = entries.map((database) => renderDatabase(database));
  container.replaceChildren(...cards);
}

export function createSystemStorageWidget({
  title = 'Monitoramento do IndexedDB',
  description = 'Acompanhe o estado dos bancos locais sincronizados com o painel.',
} = {}) {
  const widget = document.createElement('section');
  widget.className = 'surface-card user-panel__widget admin-dashboard__widget admin-dashboard__widget--storage';

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = description;

  const summaryContainer = document.createElement('div');
  summaryContainer.className = 'admin-storage__summary user-dashboard__summary';

  const summaryList = document.createElement('dl');
  summaryList.className = 'user-dashboard__summary-list';
  summaryContainer.append(summaryList);

  const statusElement = document.createElement('p');
  statusElement.className = 'admin-storage__status-message';
  statusElement.setAttribute('aria-live', 'polite');

  const databaseList = document.createElement('div');
  databaseList.className = 'admin-storage__list';

  widget.append(titleElement, descriptionElement, summaryContainer, statusElement, databaseList);

  const unsubscribe = subscribeIndexedDbSnapshot((snapshot) => {
    try {
      updateSummary(summaryList, snapshot?.summary);
      updateStatus(statusElement, snapshot?.summary?.status);
      updateDatabases(databaseList, snapshot?.databases);
    } catch (error) {
      console.error('Erro ao atualizar widget de armazenamento do sistema.', error);
    }
  });

  return {
    widget,
    teardown: () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Erro ao encerrar widget de armazenamento do sistema.', error);
        }
      }
    },
  };
}
