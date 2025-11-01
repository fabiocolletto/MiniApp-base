export interface TokenEntry {
  id_token: string;
  slug: string;
  rotulo: string;
  categoria: string;
  status_token: string;
  [key: string]: unknown;
}

export interface TokenCatalog {
  schemaVersion: number;
  tokens: TokenEntry[];
}

let tokensPromise: Promise<TokenCatalog> | null = null;
let cachedTokens: TokenCatalog | null = null;

async function fetchTokens(): Promise<TokenCatalog> {
  const response = await fetch('/data/tokens.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar tokens.json (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as TokenCatalog;
  if (!data || typeof data !== 'object' || !Array.isArray(data.tokens)) {
    throw new Error('Catálogo de tokens inválido.');
  }

  return data;
}

export async function loadTokens(force = false): Promise<TokenCatalog> {
  if (!force && cachedTokens) {
    return cachedTokens;
  }

  if (!force && tokensPromise) {
    return tokensPromise;
  }

  tokensPromise = fetchTokens()
    .then((catalog) => {
      cachedTokens = catalog;
      return catalog;
    })
    .finally(() => {
      tokensPromise = null;
    });

  return tokensPromise;
}

export function getCachedTokens(): TokenCatalog | null {
  return cachedTokens;
}
