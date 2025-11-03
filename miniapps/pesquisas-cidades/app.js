import { sdk } from '../../miniapp-base/sdk.js';
import { formatDate } from '../../miniapp-base/i18n.js';
import {
  readDocument,
  writeDocument,
  touchField,
  getPlainValues,
  getLatestFieldTimestamp,
  normalizeDocument,
} from './storage.js';

const prefsBus = sdk.events.createPrefsBus();
const storeBus = sdk.events.createStoreBus();
const autosave = sdk.autosave.createAutosaveController({ bus: storeBus, source: 'pesquisas-cidades' });
const { loadPreferences, applyPreferences } = sdk.preferences;

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
  doc: normalizeDocument(null, null),
  lang: 'pt-BR',
  saveTimer: null,
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

async function saveDraft() {
  clearSaveTimer();
  try {
    autosave.markSaving();
    state.doc = await writeDocument(state.doc);
    updateLastSaved();
    autosave.markSaved();
  } catch (error) {
    console.error('MiniApp Pesquisas: falha ao salvar', error);
    autosave.markError();
  }
}

function scheduleSave() {
  clearSaveTimer();
  state.saveTimer = setTimeout(saveDraft, 800);
}

function updateStatusLabel(nextState) {
  const copy = getCopy(state.lang);
  const label = copy.status[nextState] ?? copy.status.synced;
  if (elements.statusValue) {
    elements.statusValue.textContent = label;
  }
}

function updateLastSaved() {
  const copy = getCopy(state.lang);
  if (!elements.lastSavedValue) return;
  const latest = getLatestFieldTimestamp(state.doc);
  if (latest) {
    elements.lastSavedValue.textContent = formatDate(new Date(latest), state.lang);
  } else {
    elements.lastSavedValue.textContent = copy.aside.empty;
  }
}

function applyDocumentToForm() {
  const plain = getPlainValues(state.doc);
  if (elements.fields.city) elements.fields.city.value = plain.city ?? '';
  if (elements.fields.reference) elements.fields.reference.value = plain.reference ?? '';
  if (elements.fields.notes) elements.fields.notes.value = plain.notes ?? '';
}

function handleInput(event) {
  const field = event.target?.dataset?.field;
  if (!field) return;
  const value = event.target.value;
  state.doc = touchField(state.doc, field, value, state.doc?.deviceId);
  autosave.markDirty();
  scheduleSave();
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
  updateStatusLabel(autosave.getState());
  updateLastSaved();
}

async function loadDraft() {
  try {
    const { document } = await readDocument();
    state.doc = document;
    applyDocumentToForm();
    updateLastSaved();
  } catch (error) {
    console.warn('MiniApp Pesquisas: falha ao carregar rascunho', error);
    state.doc = normalizeDocument(null, state.doc?.deviceId ?? null);
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
    if (message.type === 'sync:update' && message.miniappId === 'pesquisas-cidades') {
      loadDraft();
      return;
    }
  });
}

async function bootstrap() {
  autosave.subscribe((nextState) => updateStatusLabel(nextState));
  const prefs = await loadPreferences();
  state.lang = prefs.lang;
  applyPreferences(prefs);
  applyLanguage(state.lang);
  autosave.setState('synced', { broadcast: false });
  await loadDraft();
  subscribeBuses();
  if (elements.form) {
    elements.form.addEventListener('input', handleInput);
  }
}

bootstrap();
