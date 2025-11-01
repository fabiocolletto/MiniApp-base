export interface QuestionBankMeta {
  schemaVersion: number;
  contentVersion: string;
  disciplina: string;
  etapa_ano: string;
}

export interface QuestionBankTokenRef {
  id_token: string;
  categoria?: string | null;
  grau_aderencia?: number | null;
}

export interface QuestionBankAlternative {
  letra: string;
  texto_html: string;
  correta?: boolean;
}

export type QuestionBankGabaritoValor =
  | { alternativa: string }
  | { palavras_chave: string[] }
  | Record<string, unknown>;

export interface QuestionBankItem {
  id_item: string;
  disciplina: string;
  etapa_ano: string;
  bncc_codigo: string;
  bncc_habilidade?: string;
  eixo_tematico?: string;
  tema?: string;
  subtema?: string;
  topico_slug?: string;
  sinonimos?: string[];
  palavras_chave?: string[];
  periodo?: string;
  localidade?: string;
  personagens?: string[];
  tipo_item: string;
  nivel_dificuldade: number;
  nivel_cognitivo: string;
  tempo_estimado_min: number;
  enunciado_html: string;
  alternativas_json?: QuestionBankAlternative[];
  gabarito_tipo: string;
  gabarito_valor: QuestionBankGabaritoValor;
  status_item: string;
  tokens?: QuestionBankTokenRef[];
  midias_json?: unknown[];
  acess_alt_text?: string | null;
  print_safe?: boolean | null;
  search_text?: string | null;
}

export interface QuestionBank {
  meta: QuestionBankMeta;
  itens: QuestionBankItem[];
}
