const CEP_ENDPOINT = 'https://viacep.com.br/ws';

export function normalizeCep(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[^0-9]/g, '');
}

export async function lookupCep(rawCep, { fetchFn = fetch, signal } = {}) {
  const cep = normalizeCep(rawCep);

  if (cep.length !== 8) {
    return { status: 'invalid', cep };
  }

  try {
    const response = await fetchFn(`${CEP_ENDPOINT}/${cep}/json/`, { signal });

    if (!response?.ok) {
      return { status: 'network-error', cep };
    }

    const data = await response.json();

    if (!data || data.erro === true || data.error === true) {
      return { status: 'not-found', cep };
    }

    return {
      status: 'success',
      cep,
      address: {
        street: typeof data.logradouro === 'string' ? data.logradouro.trim() : '',
        district: typeof data.bairro === 'string' ? data.bairro.trim() : '',
        city: typeof data.localidade === 'string' ? data.localidade.trim() : '',
        state: typeof data.uf === 'string' ? data.uf.trim() : '',
      },
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      return { status: 'aborted', cep };
    }

    return { status: 'network-error', cep };
  }
}
