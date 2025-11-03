import { createPrefsBus, createStoreBus } from '../../miniapp-base/event-bus.js';
import { loadPreferences, applyPreferences } from '../../miniapp-base/preferences.js';
import { formatDate } from '../../miniapp-base/i18n.js';
import { openMarcoCore } from '../../shared/storage/idb/databases.js';

const prefsBus = createPrefsBus();
const storeBus = createStoreBus();

const STORAGE_KEY = 'pesquisas-cidades::draft';

const TEXTS = {
  'pt-BR': {
    title: 'Pesquisas ▸ Cidades',
    subtitle: 'Sincronize dados de campo com a equipe da cidade e mantenha indicadores atualizados.',
    fields: {
      city: 'Município',
      reference: 'Referência de coleta',
      notes: 'Observações',
    },
    placeholders: {
      reference: 'Ex.: Orla central',
      notes: 'Anote destaques do dia.',
    },
    aside: {
      title: 'Sincronização',
      status: 'Status atual',
      lastSaved: 'Último salvamento',
      empty: '—',
    },
    status: {
      synced: 'Sincronizado',
      dirty: 'Desatualizado',
      saving: 'Salvando…',
      saved: 'Salvo',
      error: 'Erro ao salvar',
    },
  },
  'en-US': {
    title: 'Surveys ▸ Cities',
    subtitle: 'Sync field data with the city team and keep indicators fresh.',
    fields: {
      city: 'City',
      reference: 'Collection reference',
      notes: 'Notes',
    },
    placeholders: {
      reference: 'Eg: Central waterfront',
      notes: 'Keep highlights from the day.',
    },
    aside: {
      title: 'Sync status',
      status: 'Current status',
      lastSaved: 'Last saved',
      empty: '—',
    },
    status: {
      synced: 'Synced',
      dirty: 'Out of date',
      saving: 'Saving…',
      saved: 'Saved',
      error: 'Save failed',
    },
  },
  'es-ES': {
    title: 'Encuestas ▸ Ciudades',
    subtitle: 'Sincroniza datos de campo con el equipo de la ciudad y mantén indicadores actualizados.',
    fields: {
      city: 'Municipio',
      reference: 'Referencia de recolección',
      notes: 'Observaciones',
    },
    placeholders: {
      reference: 'Ej.: Costanera central',
      notes: 'Guarda los destacados del día.',
    },
    aside: {
      title: 'Sincronización',
      status: 'Estado actual',
      lastSaved: 'Último guardado',
      empty: '—',
    },
    status: {
      synced: 'Sincronizado',
      dirty: 'Desactualizado',
      saving: 'Guardando…',
      saved: 'Guardado',
      error: 'Error al guardar',
    },
  },
};

const state = {
  data: {
    city: '',
    reference: '',
    notes: '',
  },
  lang: 'pt-BR',
  saveTimer: null,
  lastSaved: null,
  dbPromise: null,
};

const elements = {
  title: document.querySelector('[data-i18n="title"]'),
  subtitle: document.querySelector('[data-i18n="subtitle"]'),
  form: document.querySelector('[data-form]'),
  fields: {
    city: document.querySelector('[data-field="city"]'),
    reference: document.querySelector('[data-field="reference"]'),
    notes: document.querySelector('[data-field="notes"]'),
  },
  labels: {
    city: document.querySelector('[data-field="city"]').previousElementSibling,
    reference: document.querySelector('[data-field="reference"]').previousElementSibling,
    notes: document.querySelector('[data-field="notes"]').previousElementSibling,
  },
  asideTitle: document.querySelector('[data-i18n="aside.title"]'),
  statusLabel: document.querySelector('[data-i18n="aside.status"]'),
  statusValue: document.querySelector('[data-status]'),
  lastSavedLabel: document.querySelector('[data-i18n="aside.lastSaved"]'),
  lastSavedValue: document.querySelector('[data-last-saved]'),
};

function getCopy(lang) {
  return TEXTS[lang] ?? TEXTS['pt-BR'];
}

function clearSaveTimer() {
  if (state.saveTimer) {
    clearTimeout(state.saveTimer);
    state.saveTimer = null;
  }
}

function setStatus(stateKey, { broadcast = false } = {}) {
  const copy = getCopy(state.lang);
  const label = copy.status[stateKey] ?? copy.status.synced;
  if (elements.statusValue) {
    elements.statusValue.textContent = label;
  }
  if (broadcast) {
    storeBus.post({ type: 'status', state: stateKey, source: 'pesquisas-cidades' });
  }
  if (stateKey === 'saved') {
    setTimeout(() => setStatus('synced', { broadcast }), 1800);
  }
}

function applyLanguage(lang) {
  const copy = getCopy(lang);
  state.lang = lang;
  document.documentElement.lang = lang;
  if (elements.title) elements.title.textContent = copy.title;
  if (elements.subtitle) elements.subtitle.textContent = copy.subtitle;
  if (elements.labels.city) elements.labels.city.textContent = copy.fields.city;
  if (elements.labels.reference) elements.labels.reference.textContent = copy.fields.reference;
  if (elements.labels.notes) elements.labels.notes.textContent = copy.fields.notes;
  if (elements.fields.reference) elements.fields.reference.placeholder = copy.placeholders.reference;
  if (elements.fields.notes) elements.fields.notes.placeholder = copy.placeholders.notes;
  if (elements.asideTitle) elements.asideTitle.textContent = copy.aside.title;
  if (elements.statusLabel) elements.statusLabel.textContent = copy.aside.status;
  if (elements.lastSavedLabel) elements.lastSavedLabel.textContent = copy.aside.lastSaved;
  updateLastSaved();
}

function updateLastSaved() {
  const copy = getCopy(state.lang);
  if (!elements.lastSavedValue) return;
  if (state.lastSaved) {
    elements.lastSavedValue.textContent = formatDate(state.lastSaved, state.lang);
  } else {
    elements.lastSavedValue.textContent = copy.aside.empty;
  }
}

async function getDb() {
  if (!state.dbPromise) {
    state.dbPromise = openMarcoCore();
  }
  return state.dbPromise;
}

async function saveDraft() {
  clearSaveTimer();
  try {
    setStatus('saving', { broadcast: true });
    const db = await getDb();
    const payload = {
      key: STORAGE_KEY,
      value: { ...state.data },
      updatedAt: new Date().toISOString(),
    };
    await db.put('kv_cache', payload);
    state.lastSaved = new Date(payload.updatedAt);
    updateLastSaved();
    setStatus('saved', { broadcast: true });
  } catch (error) {
    console.error('MiniApp Pesquisas: falha ao salvar', error);
    setStatus('error', { broadcast: true });
  }
}

function scheduleSave() {
  clearSaveTimer();
  state.saveTimer = setTimeout(saveDraft, 800);
}

function handleInput(event) {
  const field = event.target?.dataset?.field;
  if (!field || !(field in state.data)) return;
  state.data[field] = event.target.value;
  setStatus('dirty', { broadcast: true });
  scheduleSave();
}

async function loadDraft() {
  try {
    const db = await getDb();
    const record = await db.get('kv_cache', STORAGE_KEY);
    if (record?.value) {
      state.data = {
        city: record.value.city ?? '',
        reference: record.value.reference ?? '',
        notes: record.value.notes ?? '',
      };
      if (elements.fields.city) elements.fields.city.value = state.data.city;
      if (elements.fields.reference) elements.fields.reference.value = state.data.reference;
      if (elements.fields.notes) elements.fields.notes.value = state.data.notes;
      if (record.updatedAt) {
        state.lastSaved = new Date(record.updatedAt);
      }
      updateLastSaved();
    }
  } catch (error) {
    console.warn('MiniApp Pesquisas: falha ao carregar rascunho', error);
  }
}

function subscribeBuses() {
  prefsBus.subscribe((message) => {
    if (!message || typeof message !== 'object') return;
    if (message.type === 'preferences' && message.prefs) {
      state.lang = message.prefs.lang;
      applyPreferences(message.prefs);
      applyLanguage(message.prefs.lang);
    }
  });

  storeBus.subscribe((message) => {
    if (!message || typeof message !== 'object') return;
    if (message.source === 'pesquisas-cidades') return;
    if (message.type === 'status' && typeof message.state === 'string') {
      setStatus(message.state, { broadcast: false });
    }
  });
}

async function bootstrap() {
  const prefs = await loadPreferences();
  state.lang = prefs.lang;
  applyPreferences(prefs);
  applyLanguage(state.lang);
  setStatus('synced');
  await loadDraft();
  subscribeBuses();
  if (elements.form) {
    elements.form.addEventListener('input', handleInput);
  }
}

bootstrap();
