export interface RippleFilters {
  disciplina: string | null;
  etapaAno: string | null;
  bncc: string[];
  temas: string[];
  subtemas: string[];
  tipos: string[];
  dificuldades: number[];
  niveisCognitivos: string[];
  tokens: string[];
}

export interface RippleFilterOptions {
  disciplinas: string[];
  etapasAno: string[];
  bncc: string[];
  temas: string[];
  subtemas: string[];
  tipos: string[];
  dificuldades: number[];
  niveisCognitivos: string[];
  tokens: { id: string; rotulo: string }[];
}
