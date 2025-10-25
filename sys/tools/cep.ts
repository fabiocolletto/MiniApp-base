const CEP_API_BASE_URL = 'https://viacep.com.br/ws';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface ViaCepResponse extends Partial<CepData> {
  erro?: boolean;
}

function normalizeCep(cep: string): string {
  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) {
    throw new Error('O CEP deve conter exatamente 8 dígitos.');
  }

  return digits;
}

export async function fetchCep(cep: string): Promise<CepData> {
  const normalizedCep = normalizeCep(cep);
  const response = await fetch(`${CEP_API_BASE_URL}/${normalizedCep}/json/`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar CEP: ${response.status} ${response.statusText}`);
  }

  const data: ViaCepResponse = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    cep: data.cep ?? normalizedCep,
    logradouro: data.logradouro ?? '',
    complemento: data.complemento ?? '',
    bairro: data.bairro ?? '',
    localidade: data.localidade ?? '',
    uf: data.uf ?? '',
    ibge: data.ibge ?? '',
    gia: data.gia ?? '',
    ddd: data.ddd ?? '',
    siafi: data.siafi ?? '',
  };
}
