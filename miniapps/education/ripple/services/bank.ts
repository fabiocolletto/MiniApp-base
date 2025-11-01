import type { QuestionBank } from '../types/bank';

const bankCache = new Map<string, Promise<QuestionBank>>();

function normalizeRoute(route: string): string {
  if (!route || typeof route !== 'string') {
    throw new Error('É necessário informar a rota do banco de itens.');
  }

  const trimmed = route.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}

async function fetchBank(route: string): Promise<QuestionBank> {
  const response = await fetch(route, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar o banco de itens (${route}). HTTP ${response.status}.`);
  }

  const data = (await response.json()) as QuestionBank;
  if (!data || typeof data !== 'object' || !Array.isArray(data.itens)) {
    throw new Error('Banco de itens inválido.');
  }

  return data;
}

export async function loadBank(route: string): Promise<QuestionBank> {
  const normalizedRoute = normalizeRoute(route);
  const existing = bankCache.get(normalizedRoute);
  if (existing) {
    return existing;
  }

  const request = fetchBank(normalizedRoute).catch((error) => {
    bankCache.delete(normalizedRoute);
    throw error;
  });

  bankCache.set(normalizedRoute, request);
  return request;
}

export function clearBankCache(route?: string): void {
  if (!route) {
    bankCache.clear();
    return;
  }

  const normalizedRoute = normalizeRoute(route);
  bankCache.delete(normalizedRoute);
}
