import { openMarcoCore } from '../../shared/storage/idb/databases.js';
import { ensureDeviceId } from '../../shared/storage/idb/sync.js';

export const STORAGE_KEY = 'pesquisas-cidades::draft';
export const FIELDS = ['city', 'reference', 'notes'];

function normalizeTimestamp(input) {
  if (!input) return null;
  const date = typeof input === 'string' ? new Date(input) : new Date(input.valueOf());
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function createEmptyField(deviceId) {
  return {
    value: '',
    updatedAt: null,
    deviceId: deviceId ?? null,
  };
}

export function normalizeDocument(rawValue, fallbackDeviceId) {
  const deviceId = rawValue?.deviceId ?? fallbackDeviceId ?? null;
  const document = {
    version: 1,
    deviceId,
    updatedAt: null,
    fields: {},
  };

  const legacyUpdatedAt = normalizeTimestamp(rawValue?.updatedAt);

  FIELDS.forEach((field) => {
    const fieldValue = rawValue?.fields?.[field];
    if (fieldValue && typeof fieldValue === 'object') {
      document.fields[field] = {
        value: fieldValue.value ?? '',
        updatedAt: normalizeTimestamp(fieldValue.updatedAt) ?? legacyUpdatedAt,
        deviceId: fieldValue.deviceId ?? deviceId,
      };
    } else if (rawValue && Object.prototype.hasOwnProperty.call(rawValue, field)) {
      document.fields[field] = {
        value: rawValue[field] ?? '',
        updatedAt: legacyUpdatedAt,
        deviceId,
      };
    } else {
      document.fields[field] = createEmptyField(deviceId);
    }
  });

  const timestamps = Object.values(document.fields)
    .map((field) => normalizeTimestamp(field.updatedAt))
    .filter(Boolean);
  document.updatedAt = timestamps.length > 0 ? timestamps.sort().at(-1) ?? null : legacyUpdatedAt;

  return document;
}

export function getPlainValues(document) {
  return FIELDS.reduce((acc, field) => {
    acc[field] = document?.fields?.[field]?.value ?? '';
    return acc;
  }, {});
}

export function getLatestFieldTimestamp(document) {
  if (!document || typeof document !== 'object') {
    return null;
  }
  const timestamps = FIELDS.map((field) => document.fields?.[field]?.updatedAt)
    .map((value) => normalizeTimestamp(value))
    .filter(Boolean);
  if (timestamps.length === 0) {
    return null;
  }
  return timestamps.sort().at(-1) ?? null;
}

export function touchField(document, field, value, deviceId, timestamp = new Date()) {
  if (!FIELDS.includes(field)) {
    return normalizeDocument(document, deviceId);
  }
  const normalized = normalizeDocument(document, deviceId);
  const iso = normalizeTimestamp(timestamp) ?? new Date().toISOString();
  normalized.fields[field] = {
    value,
    updatedAt: iso,
    deviceId: deviceId ?? normalized.deviceId,
  };
  normalized.updatedAt = iso;
  normalized.deviceId = deviceId ?? normalized.deviceId;
  return normalized;
}

export async function readDocument() {
  const db = await openMarcoCore();
  try {
    const record = await db.get('kv_cache', STORAGE_KEY);
    const deviceId = await ensureDeviceId();
    const document = normalizeDocument(record?.value ?? null, deviceId);
    if (!document.deviceId) {
      document.deviceId = deviceId;
    }
    if (!document.updatedAt) {
      document.updatedAt = getLatestFieldTimestamp(document);
    }
    return {
      document,
      deviceId,
      updatedAt: normalizeTimestamp(record?.updatedAt) ?? document.updatedAt,
    };
  } finally {
    db.close();
  }
}

export async function writeDocument(document) {
  const deviceId = await ensureDeviceId();
  const normalized = normalizeDocument(document, deviceId);
  if (!normalized.deviceId) {
    normalized.deviceId = deviceId;
  }
  if (!normalized.updatedAt) {
    normalized.updatedAt = getLatestFieldTimestamp(normalized) ?? new Date().toISOString();
  }
  const payload = {
    key: STORAGE_KEY,
    value: normalized,
    updatedAt: normalized.updatedAt,
  };
  const db = await openMarcoCore();
  try {
    await db.put('kv_cache', payload);
    return normalized;
  } finally {
    db.close();
  }
}

export async function clearDocument() {
  const db = await openMarcoCore();
  try {
    await db.delete('kv_cache', STORAGE_KEY);
  } finally {
    db.close();
  }
}
