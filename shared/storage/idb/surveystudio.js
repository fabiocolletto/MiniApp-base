import { openPesquisaStudio } from './databases.js';

const SURVEYS_STORE = 'surveys';
const FLOWS_STORE = 'flows';
const TEMPLATES_STORE = 'templates';
const VARIANTS_STORE = 'variants';
const TERMINALS_STORE = 'terminals';
const PRESETS_STORE = 'presets';
const DRAFTS_STORE = 'drafts';
const EXPORTS_STORE = 'exports';
const RUNS_STORE = 'runs';
const TAGS_STORE = 'tags';

const SURVEY_STATUSES = new Set(['draft', 'published', 'archived']);
const DEFAULT_FLOW_VERSION = '3.0';

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openPesquisaStudio();
  }
  return dbPromise;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeIsoDate(value, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) {
      return asDate.toISOString();
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) {
      return asDate.toISOString();
    }
  }

  return fallback instanceof Date && !Number.isNaN(fallback.getTime()) ? fallback.toISOString() : new Date().toISOString();
}

async function runStoreTransaction(storeName, mode, handler) {
  const db = await getDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await handler(store, tx);
  await tx.done;
  return result;
}

function sortByUpdatedAt(records) {
  return records
    .slice()
    .sort((a, b) => {
      const timeA = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });
}

export async function upsertSurvey(survey) {
  if (!survey || typeof survey !== 'object') {
    throw new Error('Dados de pesquisa inválidos.');
  }

  const surveyId = normalizeString(survey.surveyId || survey.id);
  if (!surveyId) {
    throw new Error('A pesquisa precisa de um identificador (surveyId).');
  }

  const status = SURVEY_STATUSES.has(survey.status) ? survey.status : 'draft';
  const nowIso = new Date().toISOString();

  const payload = {
    ...survey,
    surveyId,
    name: normalizeString(survey.name) || `Pesquisa ${surveyId}`,
    status,
    updatedAt: normalizeIsoDate(survey.updatedAt, new Date()),
    createdAt: normalizeIsoDate(survey.createdAt ?? nowIso, new Date(nowIso)),
  };

  await runStoreTransaction(SURVEYS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listSurveys({ status, limit } = {}) {
  const db = await getDb();
  let records;

  if (status && SURVEY_STATUSES.has(status)) {
    records = await db.getAllFromIndex(SURVEYS_STORE, 'by_status', status);
  } else {
    records = await db.getAll(SURVEYS_STORE);
  }

  if (!Array.isArray(records)) {
    return [];
  }

  const sorted = sortByUpdatedAt(records);
  if (typeof limit === 'number' && Number.isFinite(limit)) {
    return sorted.slice(0, Math.max(0, Math.floor(limit)));
  }

  return sorted;
}

export async function getSurvey(surveyId) {
  const id = normalizeString(surveyId);
  if (!id) {
    return null;
  }

  const db = await getDb();
  return db.get(SURVEYS_STORE, id);
}

export async function upsertFlow(flow) {
  if (!flow || typeof flow !== 'object') {
    throw new Error('Dados de fluxo inválidos.');
  }

  const flowId = normalizeString(flow.flowId || flow.id);
  if (!flowId) {
    throw new Error('O fluxo precisa de um identificador (flowId).');
  }

  const surveyId = normalizeString(flow.surveyId);
  if (!surveyId) {
    throw new Error('O fluxo precisa referenciar uma pesquisa (surveyId).');
  }

  const payload = {
    ...flow,
    flowId,
    surveyId,
    version: normalizeString(flow.version) || DEFAULT_FLOW_VERSION,
    updatedAt: normalizeIsoDate(flow.updatedAt, new Date()),
  };

  await runStoreTransaction(FLOWS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listFlowsBySurvey(surveyId, { version } = {}) {
  const id = normalizeString(surveyId);
  if (!id) {
    return [];
  }

  const db = await getDb();
  const records = await db.getAllFromIndex(FLOWS_STORE, 'by_survey', id);
  if (!Array.isArray(records)) {
    return [];
  }

  const filtered = version ? records.filter((flow) => normalizeString(flow.version) === normalizeString(version)) : records;
  return sortByUpdatedAt(filtered);
}

export async function upsertTemplate(template) {
  if (!template || typeof template !== 'object') {
    throw new Error('Dados de template inválidos.');
  }

  const templateName = normalizeString(template.templateName || template.name);
  if (!templateName) {
    throw new Error('O template precisa de um identificador (templateName).');
  }

  const surveyId = normalizeString(template.surveyId);
  if (!surveyId) {
    throw new Error('O template precisa referenciar uma pesquisa (surveyId).');
  }

  const payload = {
    ...template,
    templateName,
    surveyId,
    terminalCode: normalizeString(template.terminalCode),
    updatedAt: normalizeIsoDate(template.updatedAt, new Date()),
  };

  await runStoreTransaction(TEMPLATES_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listTemplatesBySurveyTerminal(surveyId, terminalCode) {
  const id = normalizeString(surveyId);
  const normalizedTerminal = normalizeString(terminalCode);

  const db = await getDb();
  let records = [];

  if (id) {
    const bySurvey = await db.getAllFromIndex(TEMPLATES_STORE, 'by_survey', id);
    if (Array.isArray(bySurvey)) {
      records = bySurvey;
    }
  }

  if (normalizedTerminal) {
    const byTerminal = await db.getAllFromIndex(TEMPLATES_STORE, 'by_terminal', normalizedTerminal);
    if (Array.isArray(byTerminal)) {
      const map = new Map(records.map((entry) => [entry.templateName, entry]));
      byTerminal.forEach((entry) => {
        if (!map.has(entry.templateName)) {
          records.push(entry);
        }
      });
    }
  }

  return sortByUpdatedAt(records);
}

export async function upsertVariant(variant) {
  if (!variant || typeof variant !== 'object') {
    throw new Error('Dados de variante inválidos.');
  }

  const surveyId = normalizeString(variant.surveyId);
  const variantId = normalizeString(variant.variantId || variant.id);

  if (!surveyId || !variantId) {
    throw new Error('A variante precisa de surveyId e variantId.');
  }

  const payload = {
    ...variant,
    surveyId,
    variantId,
    terminalCode: normalizeString(variant.terminalCode),
    status: SURVEY_STATUSES.has(variant.status) ? variant.status : 'draft',
    updatedAt: normalizeIsoDate(variant.updatedAt, new Date()),
  };

  await runStoreTransaction(VARIANTS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function getVariant(surveyId, variantId) {
  const surveyKey = normalizeString(surveyId);
  const variantKey = normalizeString(variantId);

  if (!surveyKey || !variantKey) {
    return null;
  }

  const db = await getDb();
  return db.get(VARIANTS_STORE, [surveyKey, variantKey]);
}

export async function upsertTerminal(terminal) {
  if (!terminal || typeof terminal !== 'object') {
    throw new Error('Dados de terminal inválidos.');
  }

  const terminalCode = normalizeString(terminal.terminalCode || terminal.code);
  if (!terminalCode) {
    throw new Error('O terminal precisa de um código (terminalCode).');
  }

  const payload = {
    ...terminal,
    terminalCode,
    cityCode: normalizeString(terminal.cityCode),
    updatedAt: normalizeIsoDate(terminal.updatedAt, new Date()),
  };

  await runStoreTransaction(TERMINALS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listTerminalsByCity(cityCode) {
  const normalizedCity = normalizeString(cityCode);
  const db = await getDb();

  let records;
  if (normalizedCity) {
    records = await db.getAllFromIndex(TERMINALS_STORE, 'by_city', normalizedCity);
  } else {
    records = await db.getAll(TERMINALS_STORE);
  }

  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records);
}

export async function upsertPreset(preset) {
  if (!preset || typeof preset !== 'object') {
    throw new Error('Dados de preset inválidos.');
  }

  const presetId = normalizeString(preset.presetId || preset.id);
  if (!presetId) {
    throw new Error('O preset precisa de um identificador (presetId).');
  }

  const payload = {
    ...preset,
    presetId,
    type: normalizeString(preset.type),
    updatedAt: normalizeIsoDate(preset.updatedAt, new Date()),
  };

  await runStoreTransaction(PRESETS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function getPreset(presetId) {
  const id = normalizeString(presetId);
  if (!id) {
    return null;
  }

  const db = await getDb();
  return db.get(PRESETS_STORE, id);
}

export async function listPresetsByType(type) {
  const normalizedType = normalizeString(type);
  const db = await getDb();

  const records = normalizedType
    ? await db.getAllFromIndex(PRESETS_STORE, 'by_type', normalizedType)
    : await db.getAll(PRESETS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records).sort((a, b) => a.presetId.localeCompare(b.presetId, 'pt-BR'));
}

export async function upsertDraft(draft) {
  if (!draft || typeof draft !== 'object') {
    throw new Error('Dados de rascunho inválidos.');
  }

  const draftId = normalizeString(draft.draftId || draft.id);
  if (!draftId) {
    throw new Error('O rascunho precisa de um identificador (draftId).');
  }

  const surveyId = normalizeString(draft.surveyId);

  const payload = {
    ...draft,
    draftId,
    surveyId,
    updatedAt: normalizeIsoDate(draft.updatedAt, new Date()),
  };

  await runStoreTransaction(DRAFTS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listDraftsBySurvey(surveyId) {
  const id = normalizeString(surveyId);
  const db = await getDb();

  const records = id
    ? await db.getAllFromIndex(DRAFTS_STORE, 'by_survey', id)
    : await db.getAll(DRAFTS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records);
}

export async function upsertExport(exportJob) {
  if (!exportJob || typeof exportJob !== 'object') {
    throw new Error('Dados de exportação inválidos.');
  }

  const exportId = normalizeString(exportJob.exportId || exportJob.id);
  if (!exportId) {
    throw new Error('A exportação precisa de um identificador (exportId).');
  }

  const payload = {
    ...exportJob,
    exportId,
    surveyId: normalizeString(exportJob.surveyId),
    kind: normalizeString(exportJob.kind),
    updatedAt: normalizeIsoDate(exportJob.updatedAt, new Date()),
  };

  await runStoreTransaction(EXPORTS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function listExportsBySurvey(surveyId) {
  const id = normalizeString(surveyId);
  const db = await getDb();

  const records = id
    ? await db.getAllFromIndex(EXPORTS_STORE, 'by_survey', id)
    : await db.getAll(EXPORTS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records);
}

export async function listExportsByKind(kind) {
  const normalizedKind = normalizeString(kind);
  const db = await getDb();

  const records = normalizedKind
    ? await db.getAllFromIndex(EXPORTS_STORE, 'by_kind', normalizedKind)
    : await db.getAll(EXPORTS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records);
}

export async function upsertRun(run) {
  if (!run || typeof run !== 'object') {
    throw new Error('Dados de execução inválidos.');
  }

  const runId = normalizeString(run.runId || run.id);
  if (!runId) {
    throw new Error('A execução precisa de um identificador (runId).');
  }

  const payload = {
    ...run,
    runId,
    surveyId: normalizeString(run.surveyId),
    terminalCode: normalizeString(run.terminalCode),
    startedAt: normalizeIsoDate(run.startedAt, new Date()),
    updatedAt: normalizeIsoDate(run.updatedAt ?? run.completedAt ?? run.startedAt, new Date()),
  };

  await runStoreTransaction(RUNS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

function limitRecords(records, limit) {
  if (typeof limit === 'number' && Number.isFinite(limit)) {
    return records.slice(0, Math.max(0, Math.floor(limit)));
  }
  return records;
}

export async function listRunsBySurvey(surveyId, { limit } = {}) {
  const id = normalizeString(surveyId);
  const db = await getDb();

  const records = id
    ? await db.getAllFromIndex(RUNS_STORE, 'by_survey', id)
    : await db.getAll(RUNS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return limitRecords(sortByUpdatedAt(records), limit);
}

export async function listRunsByTerminal(terminalCode, { limit } = {}) {
  const code = normalizeString(terminalCode);
  const db = await getDb();

  const records = code
    ? await db.getAllFromIndex(RUNS_STORE, 'by_terminal', code)
    : await db.getAll(RUNS_STORE);

  if (!Array.isArray(records)) {
    return [];
  }

  return limitRecords(sortByUpdatedAt(records), limit);
}

function normalizeTagRecord(tagRecord) {
  if (!tagRecord || typeof tagRecord !== 'object') {
    return null;
  }

  const tag = normalizeString(tagRecord.tag || tagRecord.id);
  if (!tag) {
    return null;
  }

  const surveys = Array.isArray(tagRecord.surveys)
    ? tagRecord.surveys
        .map((surveyId) => normalizeString(surveyId))
        .filter((surveyId) => surveyId)
    : [];

  return {
    ...tagRecord,
    tag,
    surveys,
    updatedAt: normalizeIsoDate(tagRecord.updatedAt, new Date()),
  };
}

export async function upsertTag(tagRecord) {
  const payload = normalizeTagRecord(tagRecord);
  if (!payload) {
    throw new Error('Registro de tag inválido.');
  }

  await runStoreTransaction(TAGS_STORE, 'readwrite', (store) => store.put(payload));
  return payload;
}

export async function getTag(tag) {
  const normalizedTag = normalizeString(tag);
  if (!normalizedTag) {
    return null;
  }

  const db = await getDb();
  return db.get(TAGS_STORE, normalizedTag);
}

export async function listTags() {
  const db = await getDb();
  const records = await db.getAll(TAGS_STORE);
  if (!Array.isArray(records)) {
    return [];
  }

  return sortByUpdatedAt(records).sort((a, b) => a.tag.localeCompare(b.tag, 'pt-BR'));
}

export async function clearPesquisaStudio() {
  const db = await getDb();
  const tx = db.transaction(
    [
      SURVEYS_STORE,
      FLOWS_STORE,
      TEMPLATES_STORE,
      VARIANTS_STORE,
      TERMINALS_STORE,
      PRESETS_STORE,
      DRAFTS_STORE,
      EXPORTS_STORE,
      RUNS_STORE,
      TAGS_STORE,
    ],
    'readwrite',
  );

  const storeNames = Array.from(tx.raw.objectStoreNames ?? []);
  await Promise.all(storeNames.map((storeName) => tx.objectStore(storeName).clear()));
  await tx.done;
}
