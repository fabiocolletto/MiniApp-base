import { openDB, type IDBPDatabase, type DBSchema } from '../../../../shared/vendor/idb.min.js';
import type { ExamDoc } from '../types/exam';

const DB_NAME = 'ripple_exam_store';
const DB_VERSION = 1;
const STORE_EXAMS = 'exams';
const INDEX_UPDATED_AT = 'by_updated_at';

export interface RippleExamRecord extends ExamDoc {
  createdAt: string;
  updatedAt: string;
}

interface RippleExamSchema extends DBSchema {
  exams: {
    key: string;
    value: RippleExamRecord;
    indexes: {
      [INDEX_UPDATED_AT]: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RippleExamSchema>> | null = null;

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

async function openRippleDb(): Promise<IDBPDatabase<RippleExamSchema>> {
  if (!isIndexedDbAvailable()) {
    throw new Error('IndexedDB não está disponível neste ambiente.');
  }

  if (!dbPromise) {
    dbPromise = openDB<RippleExamSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_EXAMS)) {
          const store = db.createObjectStore(STORE_EXAMS, { keyPath: 'id' });
          store.createIndex(INDEX_UPDATED_AT, 'updatedAt');
        }
      },
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

function normalizeExam(doc: ExamDoc): RippleExamRecord {
  const now = new Date().toISOString();
  return {
    ...doc,
    createdAt: doc.createdAt ?? now,
    updatedAt: now,
  };
}

export async function saveExam(doc: ExamDoc): Promise<RippleExamRecord> {
  if (!doc || typeof doc !== 'object' || typeof doc.id !== 'string') {
    throw new Error('Documento de prova inválido.');
  }

  const record = normalizeExam(doc);
  if (!isIndexedDbAvailable()) {
    throw new Error('IndexedDB não está disponível neste ambiente.');
  }
  const db = await openRippleDb();
  await db.put(STORE_EXAMS, record);
  return record;
}

export async function getExam(id: string): Promise<RippleExamRecord | null> {
  if (!id) {
    return null;
  }

  if (!isIndexedDbAvailable()) {
    return null;
  }

  const db = await openRippleDb();
  const result = await db.get(STORE_EXAMS, id);
  return result ?? null;
}

export async function listExams(): Promise<RippleExamRecord[]> {
  if (!isIndexedDbAvailable()) {
    return [];
  }

  const db = await openRippleDb();
  const records = await db.getAllFromIndex(STORE_EXAMS, INDEX_UPDATED_AT);
  return [...records].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : a.updatedAt < b.updatedAt ? 1 : 0));
}

export async function deleteExam(id: string): Promise<void> {
  if (!id) {
    return;
  }

  if (!isIndexedDbAvailable()) {
    return;
  }

  const db = await openRippleDb();
  await db.delete(STORE_EXAMS, id);
}
