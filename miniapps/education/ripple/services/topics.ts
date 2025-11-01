export interface TopicEntry {
  slug: string;
  rotulo: string;
  sinonimos?: string[];
  palavras_chave?: string[];
  bncc_sugeridos?: string[];
}

export interface TopicCatalog {
  schemaVersion: number;
  topicos: TopicEntry[];
}

const topicsCache = new Map<string, Promise<TopicCatalog>>();

function buildTopicsPath(disciplina: string): string {
  if (!disciplina) {
    throw new Error('Informe a disciplina para carregar o catálogo de tópicos.');
  }

  const normalized = disciplina.trim().toLowerCase();
  return `/data/topicos.${normalized}.json`;
}

async function fetchTopics(path: string): Promise<TopicCatalog> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar o catálogo de tópicos (${path}). HTTP ${response.status}.`);
  }

  const data = (await response.json()) as TopicCatalog;
  if (!data || typeof data !== 'object' || !Array.isArray(data.topicos)) {
    throw new Error('Catálogo de tópicos inválido.');
  }

  return data;
}

export async function loadTopics(disciplina: string): Promise<TopicCatalog> {
  const path = buildTopicsPath(disciplina);
  const existing = topicsCache.get(path);
  if (existing) {
    return existing;
  }

  const request = fetchTopics(path).catch((error) => {
    topicsCache.delete(path);
    throw error;
  });

  topicsCache.set(path, request);
  return request;
}

export function clearTopicsCache(disciplina?: string): void {
  if (!disciplina) {
    topicsCache.clear();
    return;
  }

  const path = buildTopicsPath(disciplina);
  topicsCache.delete(path);
}
