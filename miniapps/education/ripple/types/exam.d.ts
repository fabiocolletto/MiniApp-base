export interface ExamDocItem {
  refId: string;
  locked?: boolean | null;
  pickPolicy?: string | null;
  altShuffleSeed?: number | null;
  notes?: string | null;
}

export interface ExamDocMeta {
  escola?: string | null;
  professor?: string | null;
  turma?: string | null;
  etapaAno?: string | null;
  disciplina?: string | null;
  data?: string | null;
}

export interface ExamDoc {
  id: string;
  title: string;
  meta: ExamDocMeta;
  stage: string;
  status?: string | null;
  seed: number;
  targetItems: number;
  shuffleQuestions?: boolean;
  shuffleAlternatives?: boolean;
  items: ExamDocItem[];
  answerKeyMode?: string | null;
  teacherNotes?: string | null;
  derived?: Record<string, unknown> | null;
  rev?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
