import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view dashboard-view view--exams exam-dashboard';

const EXAM_DASHBOARD_STYLES = String.raw`
.exam-dashboard {
  gap: var(--panel-gap);
}

.exam-dashboard__layout {
  gap: var(--panel-gap);
  grid-template-columns: minmax(0, 1fr);
}

.exam-dashboard__layout > * {
  grid-column: 1 / -1;
}

.exam-dashboard__header {
  display: grid;
  gap: var(--space-lg);
}

.exam-dashboard__header-text {
  display: grid;
  gap: var(--space-3xs);
}

.exam-dashboard__header-heading {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.exam-dashboard__header-description {
  margin: 0;
  color: var(--color-text-soft);
}

.exam-dashboard__header-grid {
  display: grid;
  gap: var(--space-md);
}

.exam-dashboard__header-field {
  display: grid;
  gap: var(--space-3xs);
}

.exam-dashboard__header-helper {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
}

.exam-dashboard__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-start;
}

.exam-dashboard__preview-row {
  display: grid;
  gap: var(--panel-gap);
}

.exam-dashboard__selection {
  display: grid;
  gap: var(--space-3xs);
}

.exam-dashboard__selection-message {
  margin: 0;
}

@media (min-width: 48rem) {
  .exam-dashboard__header-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .exam-dashboard__header,
  .exam-dashboard__layout {
    gap: var(--space-xl);
  }

  .exam-dashboard__header-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.exam-dashboard__preview,
.exam-dashboard__list {
  display: grid;
  gap: var(--space-md);
}

.exam-dashboard__preview-header {
  display: grid;
  gap: var(--space-2xs);
}

.exam-dashboard__preview-heading {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.exam-dashboard__preview-message {
  margin: 0;
}

.exam-dashboard__preview-body {
  display: grid;
  gap: var(--space-lg);
}

.exam-dashboard__preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.exam-dashboard__selection-button {
  inline-size: 100%;
}

@media (min-width: 40rem) {
  .exam-dashboard__selection-button {
    inline-size: auto;
  }
}

.exam-dashboard__preview-toolbar-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.exam-dashboard__preview-toggle-group {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4xs);
  padding: var(--space-4xs);
  border-radius: var(--radius-full);
  background: var(--color-surface-neutral);
}

.exam-dashboard__preview-toggle {
  font-size: var(--font-size-sm);
  padding: var(--space-3xs) var(--space-sm);
  border-radius: var(--radius-full);
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.exam-dashboard__preview-toggle[aria-pressed='true'] {
  background: var(--color-surface-base);
  color: var(--color-text-strong);
  box-shadow: 0 0 0 1px rgba(var(--color-accent-rgb), 0.2);
}

.exam-dashboard__preview-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb), 0.4);
}

.exam-dashboard__selection-description {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
}

.exam-dashboard__preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.exam-dashboard__preview-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  padding: var(--space-3xs) var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-surface-neutral);
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
}

.exam-dashboard__status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  border-radius: var(--radius-full);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-3xs) var(--space-xs);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background-color: var(--color-surface-info);
  color: var(--color-support-info-strong);
}

.exam-dashboard__status-badge[data-status='draft'] {
  background-color: var(--color-surface-neutral);
  color: var(--color-text-soft);
}

.exam-dashboard__status-badge[data-status='review'] {
  background-color: var(--color-surface-warning);
  color: var(--color-support-warning-strong);
}

.exam-dashboard__status-badge[data-status='scheduled'],
.exam-dashboard__status-badge[data-status='published'] {
  background-color: rgba(var(--color-accent-rgb), 0.15);
  color: var(--color-accent-deep);
}

.exam-dashboard__preview-schedule {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
}

.exam-dashboard__preview-section {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  background: var(--color-surface-base);
  display: grid;
  gap: var(--space-2xs);
}

.exam-dashboard__preview-question-item--empty {
  border-style: dashed;
  text-align: center;
  color: var(--color-text-soft);
}

.exam-dashboard__preview-question-skill {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.exam-dashboard__preview-question-helper,
.exam-dashboard__preview-question-statement,
.exam-dashboard__preview-question-bncc {
  margin: 0;
  color: var(--color-text-regular);
}

.exam-dashboard__preview-question-bncc {
  font-size: var(--font-size-sm);
  color: var(--color-text-soft);
}

.exam-dashboard__preview-text {
  margin: 0;
  color: var(--color-text-regular);
  font-size: var(--font-size-sm);
}

.exam-dashboard__printable {
  border-style: solid;
}

.exam-dashboard__preview-frame {
  inline-size: 100%;
  min-block-size: 32rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.02);
}

.exam-dashboard__preview-frame::-webkit-scrollbar {
  inline-size: 12px;
}

.exam-dashboard__preview-frame::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: var(--radius-md);
}

@media (min-width: 64rem) {
  .exam-dashboard__preview-frame {
    min-block-size: 38rem;
  }
}

.exam-dashboard__list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.exam-dashboard__add-button {
  white-space: nowrap;
}

.exam-dashboard__list-message {
  margin: 0;
}

.exam-dashboard__form-message {
  margin: 0;
}

.exam-dashboard__list-items {
  display: grid;
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.exam-dashboard__selection-panel {
  width: min(92vw, 32rem);
  gap: var(--space-md);
}

.exam-dashboard__selection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.exam-dashboard__selection-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.exam-dashboard__selection-content {
  display: grid;
  gap: var(--space-sm);
}

.exam-dashboard__list-empty {
  margin: 0;
  padding: var(--space-lg);
  text-align: center;
  border: 1px dashed var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  color: var(--color-text-soft);
}

.exam-dashboard__list-item {
  display: contents;
}

.exam-dashboard__list-button {
  width: 100%;
  display: grid;
  gap: var(--space-2xs);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-surface-base);
  padding: var(--space-md);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.exam-dashboard__list-button:hover,
.exam-dashboard__list-button:focus-visible {
  border-color: var(--color-support-info);
  box-shadow: 0 0 0 1px var(--color-support-info) inset;
  transform: translateY(-1px);
  outline: none;
}

.exam-dashboard__list-button[aria-current='true'] {
  border-color: var(--color-support-info);
  box-shadow: 0 0 0 1px rgba(var(--color-accent-rgb), 0.3);
  background: var(--color-surface-neutral);
}

.exam-dashboard__list-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-strong);
}

.exam-dashboard__list-meta {
  margin: 0;
  color: var(--color-text-regular);
}

.exam-dashboard__list-schedule {
  margin: 0;
  color: var(--color-text-soft);
  font-size: var(--font-size-sm);
}

.exam-dashboard__list-status {
  align-self: flex-start;
}
`;

const SUBJECT_OPTIONS = [
  { value: 'portugues', label: 'Língua Portuguesa' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'ciencias', label: 'Ciências' },
  { value: 'historia', label: 'História' },
  { value: 'geografia', label: 'Geografia' },
];

const SERIES_OPTIONS = [
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  '1ª série do Ensino Médio',
  '2ª série do Ensino Médio',
  '3ª série do Ensino Médio',
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Média' },
  { value: 'hard', label: 'Difícil' },
];

const FILTER_SUBJECT_OPTIONS = [{ value: 'all', label: 'Todas as disciplinas' }, ...SUBJECT_OPTIONS];
const FILTER_SERIES_OPTIONS = [
  { value: 'all', label: 'Todos os anos letivos' },
  ...SERIES_OPTIONS.map((series) => ({ value: series, label: series })),
];
const FILTER_DIFFICULTY_OPTIONS = [{ value: 'all', label: 'Todos os níveis' }, ...DIFFICULTY_OPTIONS];

const EXAM_STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'review', label: 'Em revisão' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'published', label: 'Publicada' },
];

const FILTER_STATUS_OPTIONS = [{ value: 'all', label: 'Todos os status' }, ...EXAM_STATUS_OPTIONS];

const EXAM_STATUS_LABELS = new Map(EXAM_STATUS_OPTIONS.map((option) => [option.value, option.label]));

const EXAM_KIND_OPTIONS = [
  { value: 'diagnostic', label: 'Diagnóstica' },
  { value: 'formative', label: 'Formativa' },
  { value: 'simulated', label: 'Simulado BNCC' },
  { value: 'remedial', label: 'Recuperação' },
  { value: 'final', label: 'Avaliação final' },
];

const EXAM_KIND_LABELS = new Map(EXAM_KIND_OPTIONS.map((option) => [option.value, option.label]));
const DEFAULT_EXAM_KIND = EXAM_KIND_OPTIONS[0].value;

const QUESTION_DIFFICULTY_LABELS = new Map(DIFFICULTY_OPTIONS.map((option) => [option.value, option.label]));

const QUESTION_TYPE_LABELS = new Map([
  ['multiple', 'Múltipla escolha'],
  ['discursive', 'Discursiva'],
  ['true-false', 'Verdadeiro ou falso'],
]);

const examDateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });
const examDateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
const examDateShortFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const numberFormatter = new Intl.NumberFormat('pt-BR');

const DEFAULT_EXAM_DIFFICULTY = 'medium';

const DEFAULT_QUESTION_BANK = [
  {
    id: 'q-por-interpretacao',
    subject: 'portugues',
    series: '7º ano',
    skill: 'Interpretação de textos argumentativos',
    bncc: 'EF69LP29',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Leia o artigo de opinião disponibilizado e explique qual é a tese defendida pelo autor, indicando dois argumentos que sustentam a posição apresentada.',
    competencies: ['Leitura crítica', 'Comunicação escrita'],
    rubric:
      'A resposta deve identificar a tese central, apresentar dois argumentos do texto e explicar como cada argumento apoia a tese.',
  },
  {
    id: 'q-por-gramatica',
    subject: 'portugues',
    series: '9º ano',
    skill: 'Concordância verbal',
    bncc: 'EF09LP10',
    difficulty: 'easy',
    type: 'multiple',
    statement: 'Assinale a alternativa em que a concordância verbal está correta.',
    competencies: ['Norma padrão', 'Comunicação escrita'],
    options: [
      'Nem o professor nem os alunos faltou à aula.',
      'Fazem dois anos que moro nesta cidade.',
      'Os livros da estante caiu com o vento.',
      'Houve muitas comemorações na escola.',
    ],
    answerKey: 'Alternativa correta: “Houve muitas comemorações na escola.”',
  },
  {
    id: 'q-por-producao-textual',
    subject: 'portugues',
    series: '8º ano',
    skill: 'Produção de textos narrativos',
    bncc: 'EF08LP18',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Escreva um parágrafo narrativo descrevendo um conflito entre dois personagens e a solução adotada por eles.',
    competencies: ['Coerência textual', 'Planejamento de escrita'],
    rubric:
      'Avaliar a construção da narrativa, presença de conflito e desfecho coerente com uso adequado de conectivos temporais.',
  },
  {
    id: 'q-por-oralidade',
    subject: 'portugues',
    series: '6º ano',
    skill: 'Compreensão oral de textos multimodais',
    bncc: 'EF15LP05',
    difficulty: 'easy',
    type: 'multiple',
    statement:
      'Após assistir a um vídeo de reportagem, qual alternativa apresenta a melhor síntese do fato abordado?',
    competencies: ['Escuta ativa', 'Síntese de informações'],
    options: [
      'Relato de um festival gastronômico internacional.',
      'Cobertura de um projeto de ciência cidadã na escola.',
      'Entrevista com um atleta olímpico brasileiro.',
      'Documentário sobre fauna amazônica.',
    ],
    answerKey: 'Cobertura de um projeto de ciência cidadã na escola.',
  },
  {
    id: 'q-por-leitura-poetica',
    subject: 'portugues',
    series: '1ª série do Ensino Médio',
    skill: 'Análise de recursos poéticos',
    bncc: 'EM13LP01',
    difficulty: 'hard',
    type: 'discursive',
    statement:
      'Explique como o uso de metáforas reforça o tema central do poema trabalhado em sala.',
    competencies: ['Análise literária', 'Argumentação escrita'],
    rubric:
      'O estudante deve identificar ao menos duas metáforas, relacionar cada uma ao tema central e apresentar interpretação autoral.',
  },
  {
    id: 'q-mat-fracoes',
    subject: 'matematica',
    series: '6º ano',
    skill: 'Frações e números mistos',
    bncc: 'EF06MA03',
    difficulty: 'medium',
    type: 'multiple',
    statement:
      'Uma turma arrecadou 3 pizzas para um evento. Cada pizza foi dividida em 8 pedaços iguais. Quantos pedaços cada aluno recebe se a turma possui 12 estudantes?',
    competencies: ['Raciocínio lógico', 'Resolução de problemas'],
    options: ['1', '1 1/2', '2', '2 1/4'],
    answerKey: 'Cada aluno recebe 2 pedaços (24 ÷ 12).',
  },
  {
    id: 'q-mat-porcentagem',
    subject: 'matematica',
    series: '9º ano',
    skill: 'Porcentagem e juros simples',
    bncc: 'EF09MA07',
    difficulty: 'medium',
    type: 'multiple',
    statement:
      'Uma loja oferece 12% de desconto em um produto que custa R$ 240,00. Qual será o preço final pago pelo cliente?',
    competencies: ['Raciocínio lógico', 'Cálculo mental'],
    options: ['R$ 211,20', 'R$ 216,00', 'R$ 220,80', 'R$ 225,60'],
    answerKey: 'Desconto de R$ 28,80 → preço final R$ 211,20.',
  },
  {
    id: 'q-mat-equacoes',
    subject: 'matematica',
    series: '8º ano',
    skill: 'Equações lineares',
    bncc: 'EF08MA09',
    difficulty: 'medium',
    type: 'multiple',
    statement: 'Resolva a equação 5x − 7 = 3x + 9. Qual é o valor de x?',
    competencies: ['Pensamento algébrico'],
    options: ['-8', '1', '8', '16'],
    answerKey: 'x = 8.',
  },
  {
    id: 'q-mat-geometria',
    subject: 'matematica',
    series: '2ª série do Ensino Médio',
    skill: 'Geometria espacial',
    bncc: 'EM13MAT105',
    difficulty: 'hard',
    type: 'discursive',
    statement:
      'Explique como calcular a área total de um prisma triangular reto utilizando as dimensões apresentadas no esquema.',
    competencies: ['Visualização espacial', 'Comunicação matemática'],
    rubric:
      'Esperado que descreva a soma das áreas das bases triangulares e das faces retangulares, justificando cada etapa do cálculo.',
  },
  {
    id: 'q-mat-probabilidade',
    subject: 'matematica',
    series: '1ª série do Ensino Médio',
    skill: 'Probabilidade clássica',
    bncc: 'EM13MAT207',
    difficulty: 'easy',
    type: 'multiple',
    statement:
      'Em um saco com bolas vermelhas, azuis e verdes em quantidades iguais, qual a probabilidade de retirar uma bola azul em uma única tentativa?',
    competencies: ['Análise combinatória', 'Raciocínio estatístico'],
    options: ['1/6', '1/3', '1/2', '2/3'],
    answerKey: 'Probabilidade igual a 1/3.',
  },
  {
    id: 'q-cie-ecossistemas',
    subject: 'ciencias',
    series: '9º ano',
    skill: 'Cadeias alimentares em biomas brasileiros',
    bncc: 'EF09CI07',
    difficulty: 'hard',
    type: 'multiple',
    statement:
      'Associe os seres vivos listados com os níveis tróficos correspondentes de uma cadeia alimentar típica do Cerrado.',
    competencies: ['Pensamento científico', 'Análise de dados'],
    options: ['Produtores', 'Consumidores primários', 'Consumidores secundários', 'Decompositores'],
    answerKey: 'Relacione as espécies aos níveis tróficos corretos conforme a cadeia alimentar.',
  },
  {
    id: 'q-cie-saude',
    subject: 'ciencias',
    series: '8º ano',
    skill: 'Hábitos saudáveis e prevenção de doenças',
    bncc: 'EF08CI07',
    difficulty: 'easy',
    type: 'true-false',
    statement:
      'Classifique como verdadeiro ou falso os hábitos apresentados e justifique como cada um impacta o sistema imunológico.',
    competencies: ['Saúde e cidadania'],
    assertions: [
      'Dormir pelo menos 8 horas por noite fortalece o sistema imunológico.',
      'Lavar as mãos regularmente reduz o risco de infecções.',
      'Consumir bebidas açucaradas em excesso aumenta a imunidade.',
    ],
    answerKey: 'Verdadeiro, Verdadeiro, Falso — justificar efeitos em cada hábito.',
  },
  {
    id: 'q-cie-astronomia',
    subject: 'ciencias',
    series: '7º ano',
    skill: 'Movimentos da Terra',
    bncc: 'EF07CI01',
    difficulty: 'medium',
    type: 'multiple',
    statement:
      'Qual movimento da Terra é responsável pela sucessão dos dias e noites?',
    competencies: ['Compreensão de fenômenos naturais'],
    options: ['Translação', 'Rotação', 'Precessão', 'Revolução lunar'],
    answerKey: 'Rotação.',
  },
  {
    id: 'q-cie-sustentabilidade',
    subject: 'ciencias',
    series: '1ª série do Ensino Médio',
    skill: 'Tecnologias sustentáveis',
    bncc: 'EM13CNT103',
    difficulty: 'hard',
    type: 'discursive',
    statement:
      'Analise uma solução tecnológica que reduza o consumo de água na escola e descreva os impactos esperados.',
    competencies: ['Investigação científica', 'Protagonismo juvenil'],
    rubric:
      'Esperado que descreva a tecnologia, relacione com redução de consumo e apresente indicadores de acompanhamento.',
  },
  {
    id: 'q-cie-energia',
    subject: 'ciencias',
    series: '6º ano',
    skill: 'Fontes de energia',
    bncc: 'EF06CI09',
    difficulty: 'easy',
    type: 'true-false',
    statement: 'Classifique as afirmações sobre fontes de energia renováveis como verdadeiras ou falsas.',
    competencies: ['Alfabetização científica'],
    assertions: [
      'A energia solar é considerada inesgotável na escala humana.',
      'Energia eólica depende da queima de combustíveis fósseis.',
      'Biomassa pode ser usada para gerar eletricidade.',
    ],
    answerKey: 'Verdadeiro, Falso, Verdadeiro.',
  },
  {
    id: 'q-his-industrial',
    subject: 'historia',
    series: '9º ano',
    skill: 'Revolução Industrial e impactos sociais',
    bncc: 'EF09HI08',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Explique como a Revolução Industrial transformou as relações de trabalho e cite dois efeitos observados nas cidades europeias no século XIX.',
    competencies: ['Contextualização histórica', 'Argumentação'],
    rubric:
      'O estudante deve mencionar a mecanização, mudanças nas jornadas e ao menos dois impactos urbanos (crescimento populacional, condições sanitárias, etc.).',
  },
  {
    id: 'q-his-brasil-imperio',
    subject: 'historia',
    series: '8º ano',
    skill: 'Brasil Império e cidadania',
    bncc: 'EF08HI18',
    difficulty: 'easy',
    type: 'multiple',
    statement:
      'Qual medida do período regencial buscou ampliar a participação política das províncias brasileiras?',
    competencies: ['Leitura de fontes históricas'],
    options: [
      'Criação da Guarda Nacional',
      'Adoção do parlamentarismo às avessas',
      'Implementação do voto feminino',
      'Promulgação da Constituição de 1891',
    ],
    answerKey: 'Criação da Guarda Nacional.',
  },
  {
    id: 'q-his-cultura-indigena',
    subject: 'historia',
    series: '7º ano',
    skill: 'Culturas indígenas brasileiras',
    bncc: 'EF07HI10',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Descreva duas práticas culturais de povos indígenas brasileiros e explique sua importância para a manutenção da identidade do grupo.',
    competencies: ['Valorização da diversidade cultural'],
    rubric:
      'Exigir descrição de duas práticas e explicação de seu papel social ou espiritual para o povo citado.',
  },
  {
    id: 'q-his-guerras-mundiais',
    subject: 'historia',
    series: '1ª série do Ensino Médio',
    skill: 'Conflitos do século XX',
    bncc: 'EM13CHS201',
    difficulty: 'hard',
    type: 'multiple',
    statement: 'Qual evento marcou o início oficial da Segunda Guerra Mundial?',
    competencies: ['Pensamento crítico histórico'],
    options: [
      'Ataque a Pearl Harbor',
      'Invasão da Polônia pela Alemanha',
      'Conferência de Yalta',
      'Batalha de Stalingrado',
    ],
    answerKey: 'Invasão da Polônia pela Alemanha.',
  },
  {
    id: 'q-his-cidadania',
    subject: 'historia',
    series: '3ª série do Ensino Médio',
    skill: 'Direitos humanos e cidadania',
    bncc: 'EM13CHS401',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Analise como a Constituição de 1988 ampliou direitos sociais no Brasil e cite um desafio atual para a garantia desses direitos.',
    competencies: ['Cidadania ativa', 'Análise crítica'],
    rubric:
      'Esperado que mencione direitos sociais garantidos e apresente um desafio contemporâneo com justificativa.',
  },
  {
    id: 'q-geo-cartografia',
    subject: 'geografia',
    series: '8º ano',
    skill: 'Interpretação de mapas e escalas',
    bncc: 'EF08GE07',
    difficulty: 'easy',
    type: 'multiple',
    statement:
      'Um mapa em escala 1:50.000 indica a distância entre duas cidades como 6 centímetros. Qual é a distância real aproximada entre elas?',
    competencies: ['Raciocínio matemático', 'Representação espacial'],
    options: ['3 km', '12 km', '30 km', '300 km'],
    answerKey: 'Escala 1:50.000 → 6 cm representam 3 km.',
  },
  {
    id: 'q-geo-climatologia',
    subject: 'geografia',
    series: '9º ano',
    skill: 'Climas do Brasil',
    bncc: 'EF09GE01',
    difficulty: 'medium',
    type: 'multiple',
    statement: 'Qual característica é típica do clima semiárido brasileiro?',
    competencies: ['Análise de fenômenos naturais'],
    options: [
      'Alta umidade relativa durante todo o ano.',
      'Chuvas bem distribuídas em todas as estações.',
      'Temperaturas elevadas e chuvas irregulares.',
      'Invernos rigorosos com neve ocasional.',
    ],
    answerKey: 'Temperaturas elevadas e chuvas irregulares.',
  },
  {
    id: 'q-geo-populacao',
    subject: 'geografia',
    series: '7º ano',
    skill: 'Dinâmica populacional',
    bncc: 'EF07GE07',
    difficulty: 'easy',
    type: 'true-false',
    statement: 'Classifique as afirmações sobre distribuição populacional brasileira.',
    competencies: ['Leitura de dados demográficos'],
    assertions: [
      'A região Sudeste concentra a maior população do país.',
      'O Centro-Oeste é a região mais densamente povoada.',
      'A Amazônia Legal apresenta grande extensão territorial com baixa densidade.',
    ],
    answerKey: 'Verdadeiro, Falso, Verdadeiro.',
  },
  {
    id: 'q-geo-globalizacao',
    subject: 'geografia',
    series: '1ª série do Ensino Médio',
    skill: 'Globalização e fluxos econômicos',
    bncc: 'EM13CHS303',
    difficulty: 'medium',
    type: 'discursive',
    statement:
      'Explique como a globalização influencia a organização das cadeias produtivas e cite um impacto socioeconômico para o Brasil.',
    competencies: ['Análise socioeconômica', 'Pensamento crítico'],
    rubric:
      'Esperado que descreva reorganização produtiva, mencione fluxos globais e relacione a um efeito nacional.',
  },
  {
    id: 'q-geo-urbanizacao',
    subject: 'geografia',
    series: '3ª série do Ensino Médio',
    skill: 'Urbanização e planejamento territorial',
    bncc: 'EM13CHS402',
    difficulty: 'hard',
    type: 'multiple',
    statement:
      'Qual política urbana busca promover o direito à cidade e garantir moradia adequada no Brasil?',
    competencies: ['Planejamento urbano', 'Cidadania'],
    options: [
      'Estatuto da Cidade',
      'Plano Real',
      'Lei da Ficha Limpa',
      'Código Florestal',
    ],
    answerKey: 'Estatuto da Cidade.',
  },
];

const DEFAULT_EXAMS = [
  {
    id: 'exam-por-6ano-diagnostica',
    title: 'Prova diagnóstica de Língua Portuguesa — 6º ano',
    kind: 'diagnostic',
    subject: 'portugues',
    series: '6º ano',
    difficulty: 'easy',
    status: 'draft',
    applicationDate: '2025-02-17',
    startTime: '08:00',
    durationMinutes: 50,
    objective:
      'Identificar conhecimentos prévios sobre compreensão oral e síntese de informações em textos multimodais.',
    instructions: 'Apresente o vídeo uma vez para toda a turma e permita revisão de anotações antes das respostas.',
    questionIds: ['q-por-oralidade', 'q-por-gramatica'],
  },
  {
    id: 'exam-por-7ano-formativa',
    title: 'Avaliação formativa de argumentos — 7º ano',
    kind: 'formative',
    subject: 'portugues',
    series: '7º ano',
    difficulty: 'medium',
    status: 'review',
    applicationDate: '2025-03-12',
    startTime: '10:20',
    durationMinutes: 65,
    objective:
      'Acompanhar a evolução na leitura crítica de artigos de opinião e no uso da norma padrão na produção escrita.',
    instructions: 'Permita consulta ao texto base durante toda a atividade e incentive rascunhos prévios.',
    questionIds: ['q-por-interpretacao', 'q-por-gramatica'],
  },
  {
    id: 'exam-por-8ano-simulado',
    title: 'Simulado BNCC de produção textual — 8º ano',
    kind: 'simulated',
    subject: 'portugues',
    series: '8º ano',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-04-18',
    startTime: '09:30',
    durationMinutes: 90,
    objective:
      'Preparar os estudantes para a avaliação externa da rede com foco em coesão e coerência narrativa.',
    instructions: 'Organize a sala em fileiras e distribua folhas de rascunho numeradas para facilitar a devolutiva.',
    questionIds: ['q-por-producao-textual', 'q-por-interpretacao', 'q-por-gramatica'],
  },
  {
    id: 'exam-por-9ano-recuperacao',
    title: 'Recuperação paralela de leitura crítica — 9º ano',
    kind: 'remedial',
    subject: 'portugues',
    series: '9º ano',
    difficulty: 'easy',
    status: 'draft',
    applicationDate: '2025-05-06',
    startTime: '14:00',
    durationMinutes: 60,
    objective:
      'Reforçar a identificação da tese e dos argumentos principais em textos opinativos e reportagens.',
    instructions: 'Aplicar em grupos reduzidos com mediação individualizada e leitura compartilhada do texto-base.',
    questionIds: ['q-por-interpretacao', 'q-por-gramatica'],
  },
  {
    id: 'exam-por-1serie-final',
    title: 'Avaliação final integrada — Língua Portuguesa 1ª série',
    kind: 'final',
    subject: 'portugues',
    series: '1ª série do Ensino Médio',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-06-25',
    startTime: '07:45',
    durationMinutes: 110,
    objective:
      'Consolidar a análise literária de poemas contemporâneos e a produção autoral com foco argumentativo.',
    instructions: 'Disponibilize folha de rascunho adicional e oriente sobre a entrega do caderno completo ao final.',
    questionIds: ['q-por-leitura-poetica', 'q-por-interpretacao', 'q-por-producao-textual'],
  },
  {
    id: 'exam-mat-6ano-diagnostica',
    title: 'Diagnóstico de frações equivalentes — 6º ano',
    kind: 'diagnostic',
    subject: 'matematica',
    series: '6º ano',
    difficulty: 'medium',
    status: 'draft',
    applicationDate: '2025-02-19',
    startTime: '08:10',
    durationMinutes: 45,
    objective: 'Mapear habilidades iniciais com frações simples e operações básicas.',
    instructions: 'Organize a aplicação individualmente e permita o uso de material dourado.',
    questionIds: ['q-mat-fracoes'],
  },
  {
    id: 'exam-mat-8ano-formativa',
    title: 'Avaliação formativa de equações — 8º ano',
    kind: 'formative',
    subject: 'matematica',
    series: '8º ano',
    difficulty: 'medium',
    status: 'review',
    applicationDate: '2025-03-28',
    startTime: '11:00',
    durationMinutes: 55,
    objective: 'Acompanhar a resolução de equações lineares após o módulo 2.',
    instructions: 'Estimule registros passo a passo e colete os cadernos para feedback posterior.',
    questionIds: ['q-mat-equacoes', 'q-mat-fracoes'],
  },
  {
    id: 'exam-mat-9ano-simulado',
    title: 'Simulado BNCC de porcentagem — 9º ano',
    kind: 'simulated',
    subject: 'matematica',
    series: '9º ano',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-04-30',
    startTime: '09:15',
    durationMinutes: 80,
    objective: 'Preparar para avaliações externas com foco em porcentagem e juros simples.',
    instructions: 'Proibir calculadoras durante a aplicação e reservar 10 minutos finais para revisão.',
    questionIds: ['q-mat-porcentagem', 'q-mat-equacoes'],
  },
  {
    id: 'exam-mat-1serie-recuperacao',
    title: 'Oficina de recuperação — Probabilidade 1ª série',
    kind: 'remedial',
    subject: 'matematica',
    series: '1ª série do Ensino Médio',
    difficulty: 'easy',
    status: 'draft',
    applicationDate: '2025-05-14',
    startTime: '15:00',
    durationMinutes: 60,
    objective: 'Retomar conceitos básicos de probabilidade clássica com atividades contextualizadas.',
    instructions: 'Aplicar em laboratório de matemática com manipulação de materiais concretos.',
    questionIds: ['q-mat-probabilidade'],
  },
  {
    id: 'exam-mat-2serie-final',
    title: 'Avaliação final integrada — Geometria espacial 2ª série',
    kind: 'final',
    subject: 'matematica',
    series: '2ª série do Ensino Médio',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-06-27',
    startTime: '10:40',
    durationMinutes: 95,
    objective:
      'Consolidar cálculo de área total e volume de prismas e cilindros articulando com situações reais.',
    instructions: 'Disponibilize régua e calculadora científica e recolha esquemas produzidos pelos estudantes.',
    questionIds: ['q-mat-geometria', 'q-mat-porcentagem'],
  },
  {
    id: 'exam-cie-6ano-diagnostica',
    title: 'Diagnóstico de fontes de energia — 6º ano',
    kind: 'diagnostic',
    subject: 'ciencias',
    series: '6º ano',
    difficulty: 'easy',
    status: 'draft',
    applicationDate: '2025-02-24',
    startTime: '09:40',
    durationMinutes: 40,
    objective: 'Mapear concepções iniciais sobre fontes de energia renováveis e não renováveis.',
    instructions: 'Utilize imagens como apoio visual e realize correção comentada ao final.',
    questionIds: ['q-cie-energia'],
  },
  {
    id: 'exam-cie-7ano-formativa',
    title: 'Roteiro formativo de astronomia — 7º ano',
    kind: 'formative',
    subject: 'ciencias',
    series: '7º ano',
    difficulty: 'medium',
    status: 'review',
    applicationDate: '2025-03-21',
    startTime: '13:30',
    durationMinutes: 50,
    objective: 'Verificar a compreensão sobre movimentos da Terra e fenômenos associados.',
    instructions: 'Realize a aplicação após a observação do planetário móvel disponibilizado pela rede.',
    questionIds: ['q-cie-astronomia', 'q-cie-energia'],
  },
  {
    id: 'exam-cie-8ano-simulado',
    title: 'Simulado de saúde e prevenção — 8º ano',
    kind: 'simulated',
    subject: 'ciencias',
    series: '8º ano',
    difficulty: 'medium',
    status: 'scheduled',
    applicationDate: '2025-04-15',
    startTime: '07:30',
    durationMinutes: 70,
    objective: 'Preparar os estudantes para avaliações externas de saúde e bem-estar.',
    instructions: 'Distribua álcool em gel e incentive justificativas completas para cada afirmação.',
    questionIds: ['q-cie-saude', 'q-cie-astronomia'],
  },
  {
    id: 'exam-cie-9ano-recuperacao',
    title: 'Recuperação de ecossistemas — 9º ano',
    kind: 'remedial',
    subject: 'ciencias',
    series: '9º ano',
    difficulty: 'hard',
    status: 'draft',
    applicationDate: '2025-05-22',
    startTime: '16:10',
    durationMinutes: 75,
    objective:
      'Retomar cadeias alimentares e impactos humanos nos biomas brasileiros com foco em Cerrado e Amazônia.',
    instructions: 'Organize em oficinas com mapas conceituais e discuta as respostas ao final.',
    questionIds: ['q-cie-ecossistemas', 'q-cie-sustentabilidade'],
  },
  {
    id: 'exam-cie-1serie-final',
    title: 'Avaliação final integrada — Ciências da Natureza 1ª série',
    kind: 'final',
    subject: 'ciencias',
    series: '1ª série do Ensino Médio',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-06-19',
    startTime: '08:30',
    durationMinutes: 100,
    objective: 'Sintetizar soluções tecnológicas sustentáveis propostas durante o semestre.',
    instructions: 'Solicite que anexem croquis ou tabelas produzidas e prepare retorno individualizado.',
    questionIds: ['q-cie-sustentabilidade', 'q-cie-astronomia', 'q-cie-saude'],
  },
  {
    id: 'exam-his-7ano-diagnostica',
    title: 'Diagnóstico de culturas indígenas — 7º ano',
    kind: 'diagnostic',
    subject: 'historia',
    series: '7º ano',
    difficulty: 'medium',
    status: 'draft',
    applicationDate: '2025-02-20',
    startTime: '09:15',
    durationMinutes: 45,
    objective: 'Verificar repertório sobre povos indígenas brasileiros antes do projeto interdisciplinar.',
    instructions: 'Inicie com roda de conversa e aplique a prova em seguida com tempo controlado.',
    questionIds: ['q-his-cultura-indigena'],
  },
  {
    id: 'exam-his-8ano-formativa',
    title: 'Avaliação formativa — Brasil Império 8º ano',
    kind: 'formative',
    subject: 'historia',
    series: '8º ano',
    difficulty: 'easy',
    status: 'review',
    applicationDate: '2025-03-26',
    startTime: '10:50',
    durationMinutes: 50,
    objective: 'Acompanhar compreensão sobre o período regencial e suas reformas políticas.',
    instructions: 'Estimule consulta a mapas históricos exibidos no mural da sala.',
    questionIds: ['q-his-brasil-imperio', 'q-his-cultura-indigena'],
  },
  {
    id: 'exam-his-9ano-simulado',
    title: 'Simulado BNCC — Revoluções industriais 9º ano',
    kind: 'simulated',
    subject: 'historia',
    series: '9º ano',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-04-29',
    startTime: '08:20',
    durationMinutes: 85,
    objective: 'Preparar para avaliações externas com foco em transformações industriais e urbanas.',
    instructions: 'Reserve laboratório de informática para consulta a fontes digitais controladas.',
    questionIds: ['q-his-industrial', 'q-his-guerras-mundiais'],
  },
  {
    id: 'exam-his-1serie-recuperacao',
    title: 'Recuperação temática — Conflitos do século XX',
    kind: 'remedial',
    subject: 'historia',
    series: '1ª série do Ensino Médio',
    difficulty: 'medium',
    status: 'draft',
    applicationDate: '2025-05-16',
    startTime: '17:30',
    durationMinutes: 70,
    objective: 'Retomar causas e consequências dos grandes conflitos mundiais do século XX.',
    instructions: 'Aplicação em sala multimídia com exibição prévia de trechos documentais.',
    questionIds: ['q-his-guerras-mundiais', 'q-his-industrial'],
  },
  {
    id: 'exam-his-3serie-final',
    title: 'Avaliação final — Cidadania e direitos 3ª série',
    kind: 'final',
    subject: 'historia',
    series: '3ª série do Ensino Médio',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-06-21',
    startTime: '11:10',
    durationMinutes: 105,
    objective: 'Consolidar debates sobre democracia e constituição cidadã no Brasil.',
    instructions: 'Solicite produção de respostas discursivas completas e recolha propostas de ação social.',
    questionIds: ['q-his-cidadania', 'q-his-brasil-imperio'],
  },
  {
    id: 'exam-geo-7ano-diagnostica',
    title: 'Diagnóstico regional — Geografia 7º ano',
    kind: 'diagnostic',
    subject: 'geografia',
    series: '7º ano',
    difficulty: 'easy',
    status: 'draft',
    applicationDate: '2025-02-18',
    startTime: '07:50',
    durationMinutes: 40,
    objective: 'Mapear noções iniciais sobre distribuição populacional e leitura de gráficos demográficos.',
    instructions: 'Utilize projetor para apresentar mapas populacionais antes da aplicação.',
    questionIds: ['q-geo-populacao'],
  },
  {
    id: 'exam-geo-8ano-formativa',
    title: 'Avaliação prática de cartografia — 8º ano',
    kind: 'formative',
    subject: 'geografia',
    series: '8º ano',
    difficulty: 'easy',
    status: 'review',
    applicationDate: '2025-03-19',
    startTime: '09:05',
    durationMinutes: 55,
    objective: 'Revisar leitura de escalas e orientação espacial utilizando mapas da cidade.',
    instructions: 'Distribua réguas e peça que marquem trajetos importantes no mapa impresso.',
    questionIds: ['q-geo-cartografia', 'q-geo-populacao'],
  },
  {
    id: 'exam-geo-9ano-simulado',
    title: 'Simulado BNCC — Climas brasileiros 9º ano',
    kind: 'simulated',
    subject: 'geografia',
    series: '9º ano',
    difficulty: 'medium',
    status: 'scheduled',
    applicationDate: '2025-04-23',
    startTime: '10:30',
    durationMinutes: 75,
    objective: 'Preparar os estudantes para provas externas com foco em climas e impactos regionais.',
    instructions: 'Garanta ventilação adequada e utilize mapas climáticos projetados na lousa digital.',
    questionIds: ['q-geo-climatologia', 'q-geo-cartografia'],
  },
  {
    id: 'exam-geo-1serie-recuperacao',
    title: 'Recuperação — Globalização e fluxos 1ª série',
    kind: 'remedial',
    subject: 'geografia',
    series: '1ª série do Ensino Médio',
    difficulty: 'medium',
    status: 'draft',
    applicationDate: '2025-05-29',
    startTime: '15:40',
    durationMinutes: 65,
    objective: 'Reforçar conceitos de globalização e cadeias produtivas globais.',
    instructions: 'Promova debate guiado antes da prova e disponibilize mapas mentais como apoio.',
    questionIds: ['q-geo-globalizacao', 'q-geo-climatologia'],
  },
  {
    id: 'exam-geo-3serie-final',
    title: 'Avaliação final — Urbanização e direito à cidade',
    kind: 'final',
    subject: 'geografia',
    series: '3ª série do Ensino Médio',
    difficulty: 'hard',
    status: 'scheduled',
    applicationDate: '2025-06-24',
    startTime: '13:50',
    durationMinutes: 100,
    objective: 'Avaliar propostas de intervenção urbana alinhadas ao Estatuto da Cidade.',
    instructions: 'Solicite que anexem mapas conceituais e referências utilizadas na justificativa.',
    questionIds: ['q-geo-urbanizacao', 'q-geo-globalizacao'],
  },
];

const PRINTABLE_OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const PRINTABLE_TEMPLATE_STYLES = String.raw`
:root{
  --font-body: "Arial", "Helvetica", sans-serif;
  --font-serif: "Times New Roman", serif;
  --ink:#111;
  --muted:#555;
  --border:#ddd;
  --shade:#f6f6f6;
  --h1:17pt;
  --h2:14pt;
  --text:12.3pt;
  --small:10.8pt;
  --lh:1.45;
  --page-w:210mm;
  --page-h:297mm;
  --page-padding:12mm;
}
html, body{height:100%;}
body{
  margin:0;
  padding:0;
  color:var(--ink);
  font:400 var(--text)/var(--lh) var(--font-body);
  background:#e9ecef;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
*{box-sizing:border-box;}
.sheet{
  width:var(--page-w);
  min-height:var(--page-h);
  margin:12mm auto;
  background:#fff;
  border:1px solid var(--border);
  border-radius:0;
  box-shadow:0 8px 24px rgba(0,0,0,.06);
  padding:var(--page-padding);
}
header{
  display:grid;
  grid-template-columns:1fr auto;
  grid-template-rows:auto auto;
  align-items:end;
  gap:6px 12px;
  padding:12px 18px;
  border-bottom:1px solid var(--border);
  background:linear-gradient(#fff,#fafafa);
}
h1{
  font-size:var(--h1);
  margin:0;
}
.title{grid-column:1 / -1;}
.meta{
  display:grid;
  grid-auto-flow:column;
  gap:12px 18px;
  justify-content:end;
  text-align:right;
  color:var(--muted);
  font-size:var(--small);
}
header .head-grid{grid-column:1 / -1;}
.head-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px 12px;
  align-items:start;
}
.head-card{
  border:1px solid var(--border);
  border-radius:8px;
  padding:8pt 10pt;
  background:#fff;
}
.section-title{
  font-size:var(--h2);
  padding:10px 18px;
  background:var(--shade);
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  font-weight:700;
}
.intro,
.id-block{padding:12px 18px;}
.q{
  padding:14px 18px;
  border-bottom:1px solid var(--border);
  page-break-inside:avoid;
}
.q:last-child{border-bottom:none;}
legend{
  font-weight:700;
  margin-bottom:8pt;
  padding:0 4pt;
}
fieldset{
  border:1px solid var(--border);
  border-radius:8px;
  padding:10pt 12pt;
  margin:0;
  background:#fff;
}
.help{
  color:var(--muted);
  font-size:var(--small);
}
.options{
  display:grid;
  gap:8pt;
  margin-top:6pt;
}
.option{
  display:flex;
  gap:10px;
  align-items:flex-start;
}
.option b{
  display:inline-block;
  width:20px;
  text-align:center;
}
.stimulus{
  background:#fff;
  border:none;
  padding:0;
  border-radius:0;
  margin:6pt 0 10pt;
  color:#1f2937;
}
.two-col{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10pt;
}
table.clean{
  width:100%;
  border-collapse:collapse;
  font-size:var(--text);
}
table.clean th,
table.clean td{
  border:1px solid var(--border);
  padding:6pt 8pt;
  text-align:left;
}
.line-fill{
  display:block;
  width:100%;
  min-height:18pt;
  border-bottom:1px solid var(--ink);
  margin-top:6pt;
}
.answer-lines{
  background:repeating-linear-gradient(#fff,#fff 24px,#f2f2f2 25px);
  border:1px dashed var(--border);
  min-height:160px;
  border-radius:8px;
}
.short-line{
  border-bottom:1px solid var(--ink);
  min-width:120px;
  height:18pt;
  display:inline-block;
}
.page-break{
  page-break-before:always;
  break-before:page;
}
.bubbles{
  width:18px;
  height:18px;
  border:1.2px solid #666;
  border-radius:50%;
  display:inline-block;
}
.teacher-meta{
  margin-top:6pt;
  color:var(--muted);
  font-size:var(--small);
}
body.student-version .teacher-meta{display:none;}
body.teacher-version .teacher-meta{display:block;}
@media print{
  body{
    background:#fff;
    padding:0;
  }
  .sheet{
    width:auto;
    min-height:auto;
    margin:0;
    border:none;
    border-radius:0;
    box-shadow:none;
    padding:var(--page-padding);
  }
  header{background:#fff;}
}
@page{size:A4 portrait;margin:0;}
`;

const LINE_FILL_MARKUP = '<span class="line-fill" aria-hidden="true"></span>';

function cloneQuestion(question) {
  return {
    ...question,
    competencies: Array.isArray(question.competencies) ? question.competencies.slice() : [],
  };
}

function cloneExam(exam) {
  return {
    ...exam,
    questionIds: Array.isArray(exam.questionIds) ? exam.questionIds.slice() : [],
  };
}

function createMessageElement(baseClass) {
  const message = document.createElement('p');
  message.className = `form-message ${baseClass}`;
  message.hidden = true;
  return message;
}

function updateMessageElement(element, type, text) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.remove('form-message--error', 'form-message--success');

  if (!text) {
    element.hidden = true;
    element.textContent = '';
    return;
  }

  element.hidden = false;
  element.textContent = text;
  if (type === 'error') {
    element.classList.add('form-message--error');
  } else if (type === 'success') {
    element.classList.add('form-message--success');
  }
}

function createInputField({ name, label, type = 'text', required = false, placeholder = '', span = null }) {
  const field = document.createElement('div');
  field.className = 'form-field';
  if (span) {
    field.dataset.fieldSpan = span;
  }

  const inputId = `exam-form-${name}-${Math.random().toString(36).slice(2, 10)}`;

  const labelElement = document.createElement('label');
  labelElement.className = 'form-label';
  labelElement.setAttribute('for', inputId);
  labelElement.textContent = label;

  let control;
  if (type === 'textarea') {
    control = document.createElement('textarea');
    control.className = 'form-textarea';
  } else {
    control = document.createElement('input');
    control.type = type;
    control.className = 'form-input';
  }

  control.id = inputId;
  control.name = name;
  if (placeholder) {
    control.placeholder = placeholder;
  }
  if (required) {
    control.required = true;
  }

  field.append(labelElement, control);
  return { field, control };
}

function createSelectField({ name, label, options, span = null }) {
  const field = document.createElement('div');
  field.className = 'form-field';
  if (span) {
    field.dataset.fieldSpan = span;
  }

  const inputId = `exam-form-${name}-${Math.random().toString(36).slice(2, 10)}`;

  const labelElement = document.createElement('label');
  labelElement.className = 'form-label';
  labelElement.setAttribute('for', inputId);
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  select.name = name;

  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value ?? option;
    opt.textContent = option.label ?? option;
    select.append(opt);
  });

  field.append(labelElement, select);
  return { field, control: select };
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) {
    return 'Sem duração definida';
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }

  if (minutes < 60) {
    return `${minutes} minutos`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = hours === 1 ? '1 hora' : `${hours} horas`;
  return `${hourLabel} e ${remainingMinutes} minutos`;
}

function combineDateAndTime(dateOnly, timeValue) {
  if (!dateOnly) {
    return null;
  }

  const [year, month, day] = dateOnly.split('-').map((value) => Number.parseInt(value, 10));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (!timeValue) {
    return new Date(year, month - 1, day);
  }

  const [hour, minute] = timeValue.split(':').map((value) => Number.parseInt(value, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return new Date(year, month - 1, day);
  }

  return new Date(year, month - 1, day, hour, minute);
}

function getSubjectLabel(subjectId) {
  return SUBJECT_OPTIONS.find((option) => option.value === subjectId)?.label ?? 'Disciplina não informada';
}

function getDifficultyLabel(difficultyId) {
  return QUESTION_DIFFICULTY_LABELS.get(difficultyId) ?? 'Nível indefinido';
}

function getExamKindLabel(kindId) {
  return EXAM_KIND_LABELS.get(kindId) ?? 'Tipo personalizado';
}

function getStatusLabel(status) {
  return EXAM_STATUS_LABELS.get(status) ?? 'Status não informado';
}

function formatExamSchedule(exam) {
  const combined = combineDateAndTime(exam.applicationDate, exam.startTime);
  if (!(combined instanceof Date) || Number.isNaN(combined.getTime())) {
    return 'Agendamento não definido';
  }

  const scheduleLabel = exam.startTime ? examDateTimeFormatter.format(combined) : examDateFormatter.format(combined);
  const durationLabel = formatDuration(exam.durationMinutes);
  return `${scheduleLabel} • ${durationLabel}`;
}

function createStatusBadge(status) {
  const badge = document.createElement('span');
  badge.className = 'exam-dashboard__status-badge';
  badge.dataset.status = status;
  badge.textContent = getStatusLabel(status);
  return badge;
}

function buildQuestionPreview(questionIds, questionMap) {
  const container = document.createElement('section');
  container.className = 'exam-dashboard__preview-section layout-stack layout-stack--sm';

  const heading = document.createElement('h4');
  heading.className = 'exam-dashboard__preview-subtitle';
  heading.textContent = 'Questões planejadas';

  const summary = document.createElement('p');
  summary.className = 'exam-dashboard__preview-summary';
  summary.textContent = `Total de questões: ${numberFormatter.format(questionIds.length ?? 0)}`;

  const list = document.createElement('ul');
  list.className = 'exam-dashboard__preview-question-list';
  list.setAttribute('role', 'list');

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'exam-dashboard__preview-question-item exam-dashboard__preview-question-item--empty';
    empty.textContent = 'Nenhuma questão foi adicionada ainda. Você pode anexar exercícios quando montar a versão final.';
    list.append(empty);
  } else {
    questionIds.forEach((questionId) => {
      const question = questionMap.get(questionId);
      const item = document.createElement('li');
      item.className = 'exam-dashboard__preview-question-item';

      const title = document.createElement('p');
      title.className = 'exam-dashboard__preview-question-skill';
      title.textContent = question?.skill ?? 'Questão sem descrição';

      const helper = document.createElement('p');
      helper.className = 'exam-dashboard__preview-question-helper';
      helper.textContent = `${
        question ? getSubjectLabel(question.subject) : 'Disciplina não informada'
      } • ${getDifficultyLabel(question?.difficulty)} • ${
        QUESTION_TYPE_LABELS.get(question?.type) ?? 'Tipo não definido'
      }`;

      const statement = document.createElement('p');
      statement.className = 'exam-dashboard__preview-question-statement';
      statement.textContent = question?.statement ?? 'Adicione um enunciado para esta questão ao preparar o material.';

      const bncc = document.createElement('p');
      bncc.className = 'exam-dashboard__preview-question-bncc';
      bncc.textContent = question?.bncc ? `BNCC: ${question.bncc}` : 'BNCC: não informada';

      item.append(title, helper, statement, bncc);
      list.append(item);
    });
  }

  container.append(heading, summary, list);
  return container;
}

function escapeHtml(value) {
  if (value == null) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrintableDate(dateOnly) {
  if (!dateOnly) {
    return '____/____/____';
  }

  const parts = dateOnly.split('-').map((value) => Number.parseInt(value, 10));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return '____/____/____';
  }

  const [year, month, day] = parts;
  const parsed = new Date(year, month - 1, day);

  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return '____/____/____';
  }

  try {
    return examDateShortFormatter.format(parsed) || '____/____/____';
  } catch (error) {
    console.error('Não foi possível formatar a data da prova para impressão.', error);
    return '____/____/____';
  }
}

function formatPrintableDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '--';
  }

  return `${minutes} min`;
}

function buildPrintableInstructionList(exam) {
  const defaults = [
    'Responda neste caderno todas as questões.',
    'Utilize caneta azul ou preta.',
    'Entregue o caderno ao final.',
  ];

  const custom = typeof exam?.instructions === 'string'
    ? exam.instructions
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

  const items = [...defaults, ...custom].slice(0, 8);

  return items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
}

function buildPrintableIntroTeacherMeta(exam) {
  const meta = [];

  if (exam?.objective) {
    meta.push(`Objetivo pedagógico: ${exam.objective}`);
  }

  const kindLabel = getExamKindLabel(exam?.kind);
  if (kindLabel) {
    meta.push(`Tipo de prova: ${kindLabel}`);
  }

  const subjectLabel = getSubjectLabel(exam?.subject);
  if (subjectLabel) {
    meta.push(`Disciplina: ${subjectLabel}`);
  }

  const difficultyLabel = getDifficultyLabel(exam?.difficulty);
  if (difficultyLabel) {
    meta.push(`Nível: ${difficultyLabel}`);
  }

  const duration = formatPrintableDuration(exam?.durationMinutes);
  if (duration && duration !== '--') {
    meta.push(`Tempo estimado: ${duration}`);
  }

  if (meta.length === 0) {
    return '';
  }

  return `<div class="teacher-meta">${meta.map((item) => escapeHtml(item)).join(' • ')}</div>`;
}

function buildPrintableTeacherMeta(question) {
  if (!question) {
    return '';
  }

  const meta = [];

  if (question.bncc) {
    meta.push(`BNCC: ${question.bncc}`);
  }

  if (Array.isArray(question.competencies) && question.competencies.length > 0) {
    meta.push(`Competências: ${question.competencies.join(', ')}`);
  }

  if (question.answerKey) {
    meta.push(`Gabarito: ${question.answerKey}`);
  }

  if (question.rubric) {
    meta.push(`Rubrica: ${question.rubric}`);
  }

  if (meta.length === 0) {
    return '';
  }

  return `<div class="teacher-meta">${meta.map((item) => escapeHtml(item)).join(' • ')}</div>`;
}

function buildPrintableMultipleQuestion(question) {
  const options = Array.isArray(question?.options) && question.options.length > 0
    ? question.options
    : ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'];

  const optionsMarkup = options
    .slice(0, PRINTABLE_OPTION_LETTERS.length)
    .map(
      (option, index) => `
        <div class="option"><b>${PRINTABLE_OPTION_LETTERS[index] ?? '?'}</b><label>${escapeHtml(option)}</label></div>
      `.trim(),
    )
    .join('');

  const helper = question?.helper ?? 'Marque apenas uma alternativa.';

  return `
    <div class="options">
      ${optionsMarkup}
    </div>
    <p class="help">${escapeHtml(helper)}</p>
  `;
}

function buildPrintableDiscursiveQuestion(question) {
  const height = Number.isFinite(question?.answerLinesHeight)
    ? `${Math.max(60, Number.parseInt(question.answerLinesHeight, 10))}px`
    : '160px';

  const rubric = question?.rubric ? `<p class="help">${escapeHtml(question.rubric)}</p>` : '';

  return `
    <div class="answer-lines" style="min-height:${height}"></div>
    ${rubric}
  `;
}

function buildPrintableTrueFalseQuestion(question) {
  const assertions = Array.isArray(question?.assertions) && question.assertions.length > 0
    ? question.assertions
    : ['Afirmativa 1', 'Afirmativa 2', 'Afirmativa 3'];

  const rows = assertions
    .map((assertion) => `
      <tr><td>${escapeHtml(assertion)}</td><td>☐</td><td>☐</td></tr>
    `.trim())
    .join('');

  const helper = question?.helper ?? 'Assinale V ou F para cada afirmativa e justifique quando necessário.';

  return `
    <table class="clean" role="table" aria-label="Afirmativas para V ou F">
      <thead><tr><th>Afirmativa</th><th>V</th><th>F</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="help">${escapeHtml(helper)}</p>
    <div class="help" style="margin-top:6pt">Justificativa:</div>
    <div class="answer-lines" aria-label="Justificativa" style="min-height:90px"></div>
  `;
}

function buildPrintableQuestionSection(question, index) {
  const id = `q${index}`;

  if (!question) {
    return `
      <section class="q" id="${id}">
        <form><fieldset>
          <legend>Questão pendente de definição</legend>
          <p class="help">Adicione questões ao planejamento para gerar o modelo completo de impressão.</p>
        </fieldset></form>
      </section>
    `;
  }

  const labelParts = [];
  if (question.skill) {
    labelParts.push(`(${question.skill})`);
  }

  const baseLegend = `Q${index}. ${labelParts.join(' ')} ${question.statement ?? 'Defina o enunciado da questão.'}`.trim();

  const helperParts = [
    getSubjectLabel(question.subject),
    getDifficultyLabel(question.difficulty),
    QUESTION_TYPE_LABELS.get(question.type) ?? 'Tipo não definido',
  ].filter(Boolean);

  let body = '';
  switch (question.type) {
    case 'multiple':
      body = buildPrintableMultipleQuestion(question);
      break;
    case 'true-false':
      body = buildPrintableTrueFalseQuestion(question);
      break;
    case 'discursive':
    default:
      body = buildPrintableDiscursiveQuestion(question);
      break;
  }

  const helper = helperParts.length > 0 ? `<p class="help">${escapeHtml(helperParts.join(' • '))}</p>` : '';
  const teacherMeta = buildPrintableTeacherMeta(question);

  return `
    <section class="q" id="${id}">
      <form><fieldset>
        <legend>${escapeHtml(baseLegend)}</legend>
        ${helper}
        ${body}
        ${teacherMeta}
      </fieldset></form>
    </section>
  `;
}

function buildPrintableQuestionsMarkup(questionIds, questionMap) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return `
      <section class="q" id="q0">
        <form><fieldset>
          <legend>Questões pendentes de seleção</legend>
          <p class="help">Nenhuma questão foi vinculada a esta prova. Utilize o fluxo do miniapp para escolher os exercícios antes de imprimir.</p>
        </fieldset></form>
      </section>
    `;
  }

  return questionIds
    .map((questionId, index) => buildPrintableQuestionSection(questionMap.get(questionId), index + 1))
    .join('');
}

function generatePrintableExamHtml(exam, questionMap, { version = 'student' } = {}) {
  const safeExam = exam ?? {};
  const title = safeExam.title?.trim() || 'Prova sem título';
  const seriesLabel = SERIES_OPTIONS.includes(safeExam.series) ? safeExam.series : 'Turma não definida';
  const dateLabel = formatPrintableDate(safeExam.applicationDate);
  const durationLabel = formatPrintableDuration(safeExam.durationMinutes);
  const instructions = buildPrintableInstructionList(safeExam);
  const introTeacherMeta = buildPrintableIntroTeacherMeta(safeExam);
  const questions = buildPrintableQuestionsMarkup(safeExam.questionIds ?? [], questionMap);
  const bodyClass = version === 'teacher' ? 'teacher-version' : 'student-version';
  const schoolName = safeExam.school?.trim() || 'Escola Municipal';
  const teacherName = safeExam.teacher?.trim();
  const teacherCell = teacherName ? escapeHtml(teacherName) : LINE_FILL_MARKUP;
  const studentRows = `
    <tr><th style="width:130px">Estudante</th><td>${LINE_FILL_MARKUP}</td></tr>
    <tr><th>Registro</th><td>${LINE_FILL_MARKUP}</td></tr>
    <tr><th>Assinatura</th><td>${LINE_FILL_MARKUP}</td></tr>
  `;

  const institutionRows = `
    <tr><th style="width:130px">Escola</th><td>${escapeHtml(schoolName)}</td></tr>
    <tr><th>Professor(a)</th><td>${teacherCell}</td></tr>
    <tr><th>Disciplina</th><td>${escapeHtml(getSubjectLabel(safeExam.subject))}</td></tr>
    <tr><th>Turma</th><td>${escapeHtml(seriesLabel)}</td></tr>
    <tr><th>Data</th><td>${escapeHtml(dateLabel)}</td></tr>
    <tr><th>Tempo</th><td>${escapeHtml(durationLabel)}</td></tr>
  `;

  return String.raw`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${PRINTABLE_TEMPLATE_STYLES}</style>
</head>
<body class="${bodyClass}">
  <main class="sheet" role="main" aria-label="${escapeHtml(title)}">
    <header>
      <h1 class="title">${escapeHtml(title)}</h1>
      <div class="head-grid">
        <div class="head-card inst">
          <table class="clean">
            <tbody>
              ${institutionRows}
            </tbody>
          </table>
        </div>
        <div class="head-card aluno">
          <table class="clean">
            <tbody>
              ${studentRows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="sub help">Tipografia 12.3pt, ritmo 14pt, contraste P&B, A4.</div>
    </header>
    <section class="intro" aria-labelledby="instr">
      <h2 id="instr" class="help" style="font-size:var(--h2); color:var(--ink)">Instruções</h2>
      <ol>
        ${instructions}
      </ol>
      ${introTeacherMeta}
    </section>
    <div class="section-title">Seção A — Questões</div>
    ${questions}
  </main>
</body>
</html>`;
}

function buildPrintablePreviewSection(exam, questionMap, options = {}) {
  const { initialVersion = 'student', onVersionChange } = options;

  const section = document.createElement('section');
  section.className = 'exam-dashboard__preview-section exam-dashboard__printable layout-stack layout-stack--sm';

  const heading = document.createElement('h4');
  heading.className = 'exam-dashboard__preview-subtitle';
  heading.textContent = 'Prévia do modelo impresso';

  const description = document.createElement('p');
  description.className = 'exam-dashboard__preview-text';
  description.textContent =
    'Alterne entre as versões para alunos e professores e confirme o visual antes de gerar a impressão.';

  const toolbar = document.createElement('div');
  toolbar.className = 'exam-dashboard__preview-toolbar';

  const toolbarLabel = document.createElement('span');
  toolbarLabel.className = 'exam-dashboard__preview-toolbar-label';
  toolbarLabel.textContent = 'Versão da prévia:';

  const toggleGroup = document.createElement('div');
  toggleGroup.className = 'exam-dashboard__preview-toggle-group';
  toggleGroup.setAttribute('role', 'group');
  toggleGroup.setAttribute('aria-label', 'Escolher versão da prévia impressa');

  const studentToggle = document.createElement('button');
  studentToggle.type = 'button';
  studentToggle.className = 'button button--ghost button--pill exam-dashboard__preview-toggle';
  studentToggle.textContent = 'Alunos';
  studentToggle.dataset.version = 'student';

  const teacherToggle = document.createElement('button');
  teacherToggle.type = 'button';
  teacherToggle.className = 'button button--ghost button--pill exam-dashboard__preview-toggle';
  teacherToggle.textContent = 'Professores';
  teacherToggle.dataset.version = 'teacher';

  toggleGroup.append(studentToggle, teacherToggle);
  toolbar.append(toolbarLabel, toggleGroup);

  const frame = document.createElement('iframe');
  frame.className = 'exam-dashboard__preview-frame';
  frame.setAttribute('loading', 'lazy');
  frame.setAttribute('title', `Prévia da prova impressa: ${exam.title}`);

  const toggles = {
    student: studentToggle,
    teacher: teacherToggle,
  };

  const isTeacherVersion = initialVersion === 'teacher';
  let currentVersion = isTeacherVersion ? 'teacher' : 'student';

  function updateToggleState() {
    Object.entries(toggles).forEach(([versionKey, button]) => {
      const isActive = versionKey === currentVersion;
      button.setAttribute('aria-pressed', String(isActive));
    });
    section.dataset.previewVersion = currentVersion;
  }

  function setVersion(version, options = {}) {
    const { force = false } = options;
    const normalizedVersion = version === 'teacher' ? 'teacher' : 'student';
    if (!force && normalizedVersion === currentVersion) {
      return false;
    }
    currentVersion = normalizedVersion;
    frame.srcdoc = generatePrintableExamHtml(exam, questionMap, { version: currentVersion });
    updateToggleState();
    if (typeof onVersionChange === 'function') {
      onVersionChange(currentVersion);
    }
    return true;
  }

  studentToggle.addEventListener('click', () => {
    setVersion('student');
  });
  teacherToggle.addEventListener('click', () => {
    setVersion('teacher');
  });

  frame.srcdoc = generatePrintableExamHtml(exam, questionMap, { version: currentVersion });
  updateToggleState();

  if (typeof onVersionChange === 'function') {
    onVersionChange(currentVersion);
  }

  section.append(heading, description, toolbar, frame);
  return {
    element: section,
    setVersion,
    getVersion() {
      return currentVersion;
    },
  };
}

function renderExamPreview(container, exam, questionMap, controls = {}) {
  const {
    previewVersion = 'student',
    onVersionChange,
    syncButtons,
    registerController,
  } = controls;

  container.replaceChildren();

  if (typeof syncButtons === 'function') {
    syncButtons();
  }

  if (!exam) {
    if (typeof registerController === 'function') {
      registerController(null);
    }
    return;
  }

  const printablePreview = buildPrintablePreviewSection(exam, questionMap, {
    initialVersion: previewVersion,
    onVersionChange,
  });

  if (typeof registerController === 'function') {
    registerController(printablePreview);
  }

  container.append(printablePreview.element);
}

function sortExamsForList(exams) {
  return exams
    .slice()
    .sort((a, b) => {
      const dateA = combineDateAndTime(a.applicationDate, a.startTime)?.getTime() ?? Number.POSITIVE_INFINITY;
      const dateB = combineDateAndTime(b.applicationDate, b.startTime)?.getTime() ?? Number.POSITIVE_INFINITY;

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return a.title.localeCompare(b.title, 'pt-BR');
    });
}

function createExamListItem(exam, { isSelected, onSelect, startEditExam }) {
  const item = document.createElement('li');
  item.className = 'exam-dashboard__list-item';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'exam-dashboard__list-button';
  button.dataset.status = exam.status;
  button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  if (isSelected) {
    button.setAttribute('aria-current', 'true');
  }

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'button button--ghost exam-dashboard__list-edit-button';
  editButton.textContent = 'Editar';

  const title = document.createElement('p');
  title.className = 'exam-dashboard__list-title';
  title.textContent = exam.title;

  const meta = document.createElement('p');
  meta.className = 'exam-dashboard__list-meta';
  const seriesLabel = SERIES_OPTIONS.includes(exam.series) ? exam.series : 'Turma não definida';
  const kindLabel = getExamKindLabel(exam.kind);
  meta.textContent = `${kindLabel} • ${getSubjectLabel(exam.subject)} • ${seriesLabel} • ${getDifficultyLabel(exam.difficulty)}`;

  const schedule = document.createElement('p');
  schedule.className = 'exam-dashboard__list-schedule';
  schedule.textContent = formatExamSchedule(exam);

  const status = createStatusBadge(exam.status);
  status.classList.add('exam-dashboard__list-status');

  button.append(title, meta, schedule, status);

  button.addEventListener('click', () => {
    onSelect(exam.id);
  });

  editButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (typeof startEditExam === 'function') {
      startEditExam(exam);
    }
  });

  item.append(button, editButton);
  return { item, button, editButton };
}

function createExamForm() {
  const form = document.createElement('form');
  form.className = 'task-dashboard__form exam-dashboard__form layout-stack layout-stack--md';
  form.hidden = true;
  form.dataset.mode = 'create';
  form.id = `exam-dashboard-form-${Math.random().toString(36).slice(2, 10)}`;

  const title = document.createElement('h4');
  title.className = 'task-dashboard__form-title';
  title.textContent = 'Cadastrar nova prova';

  const grid = document.createElement('div');
  grid.className = 'task-dashboard__form-grid';

  const { field: titleField, control: titleInput } = createInputField({
    name: 'title',
    label: 'Título da prova',
    required: true,
    span: 'full',
  });

  const { field: subjectField, control: subjectSelect } = createSelectField({
    name: 'subject',
    label: 'Disciplina',
    options: SUBJECT_OPTIONS,
  });

  const { field: seriesField, control: seriesSelect } = createSelectField({
    name: 'series',
    label: 'Turma / ano',
    options: SERIES_OPTIONS,
  });

  const { field: difficultyField, control: difficultySelect } = createSelectField({
    name: 'difficulty',
    label: 'Grau de dificuldade',
    options: DIFFICULTY_OPTIONS,
  });
  if (difficultySelect instanceof HTMLSelectElement) {
    difficultySelect.value = DEFAULT_EXAM_DIFFICULTY;
  }

  const { field: kindField, control: kindSelect } = createSelectField({
    name: 'kind',
    label: 'Tipo de prova',
    options: EXAM_KIND_OPTIONS,
  });
  if (kindSelect instanceof HTMLSelectElement) {
    kindSelect.value = DEFAULT_EXAM_KIND;
  }

  const { field: statusField, control: statusSelect } = createSelectField({
    name: 'status',
    label: 'Status',
    options: EXAM_STATUS_OPTIONS,
  });

  const { field: dateField, control: dateInput } = createInputField({
    name: 'applicationDate',
    label: 'Data de aplicação',
    type: 'date',
    required: true,
  });

  const { field: timeField, control: timeInput } = createInputField({
    name: 'startTime',
    label: 'Horário de início',
    type: 'time',
  });

  const { field: durationField, control: durationInput } = createInputField({
    name: 'durationMinutes',
    label: 'Duração (minutos)',
    type: 'number',
  });
  durationInput.min = '20';
  durationInput.step = '5';

  const { field: objectiveField, control: objectiveInput } = createInputField({
    name: 'objective',
    label: 'Objetivo pedagógico',
    type: 'textarea',
    span: 'full',
    placeholder: 'Descreva o recorte da avaliação e os resultados esperados.',
  });

  const { field: instructionsField, control: instructionsInput } = createInputField({
    name: 'instructions',
    label: 'Orientações logísticas',
    type: 'textarea',
    span: 'full',
    placeholder: 'Informe materiais necessários, acomodações e avisos aos alunos.',
  });

  grid.append(
    titleField,
    subjectField,
    seriesField,
    difficultyField,
    kindField,
    statusField,
    dateField,
    timeField,
    durationField,
    objectiveField,
    instructionsField,
  );

  const message = createMessageElement('exam-dashboard__form-message');

  const actions = document.createElement('div');
  actions.className = 'task-dashboard__form-actions';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'task-dashboard__form-cancel';
  cancelButton.textContent = 'Cancelar';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'form-submit task-dashboard__form-submit';
  submitButton.textContent = 'Salvar prova';

  actions.append(cancelButton, submitButton);

  form.append(title, grid, message, actions);

  return {
    form,
    title,
    fields: {
      title: titleInput,
      subject: subjectSelect,
      series: seriesSelect,
      difficulty: difficultySelect,
      kind: kindSelect,
      status: statusSelect,
      applicationDate: dateInput,
      startTime: timeInput,
      durationMinutes: durationInput,
      objective: objectiveInput,
      instructions: instructionsInput,
    },
    message,
    cancelButton,
    submitButton,
  };
}

export function renderExamDashboard(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupCallbacks = [];
  let listMessageTimeout = null;

  let currentExams = DEFAULT_EXAMS.map((exam) => cloneExam(exam));
  const questionBank = DEFAULT_QUESTION_BANK.map((question) => cloneQuestion(question));
  const questionMap = new Map(questionBank.map((question) => [question.id, question]));
  let selectedExamId = currentExams[0]?.id ?? null;
  const filterState = {
    subject: 'all',
    series: 'all',
    difficulty: 'all',
    status: 'all',
    maxDuration: null,
  };

  let previewVersion = 'student';
  let printablePreviewController = null;
  let selectionModal = null;
  let selectionBackdrop = null;
  let selectionCloseButton = null;
  let selectionFocusRestorer = null;
  let isSelectionModalOpen = false;

  viewRoot.className = BASE_CLASSES;
  viewRoot.setAttribute('aria-label', 'Painel de provas do MiniApp Criador de Provas');

  const styleElement = document.createElement('style');
  styleElement.id = 'exam-dashboard-styles';
  styleElement.textContent = EXAM_DASHBOARD_STYLES;

  const headerSection = document.createElement('section');
  headerSection.className = 'surface-card exam-dashboard__header layout-stack layout-stack--lg';

  const headerText = document.createElement('div');
  headerText.className = 'exam-dashboard__header-text layout-stack layout-stack--3xs';

  const headerTitle = document.createElement('h2');
  headerTitle.className = 'exam-dashboard__header-heading';
  headerTitle.textContent = 'Planejamento da avaliação';

  headerText.append(headerTitle);

  const headerGrid = document.createElement('div');
  headerGrid.className = 'exam-dashboard__header-grid';

  const { field: filterSubjectField, control: filterSubjectSelect } = createSelectField({
    name: 'filterSubject',
    label: 'Disciplina',
    options: FILTER_SUBJECT_OPTIONS,
  });
  filterSubjectField.classList.add('exam-dashboard__header-field');

  const { field: filterSeriesField, control: filterSeriesSelect } = createSelectField({
    name: 'filterSeries',
    label: 'Ano letivo',
    options: FILTER_SERIES_OPTIONS,
  });
  filterSeriesField.classList.add('exam-dashboard__header-field');

  const { field: filterDifficultyField, control: filterDifficultySelect } = createSelectField({
    name: 'filterDifficulty',
    label: 'Dificuldade da prova',
    options: FILTER_DIFFICULTY_OPTIONS,
  });
  filterDifficultyField.classList.add('exam-dashboard__header-field');

  const { field: filterStatusField, control: filterStatusSelect } = createSelectField({
    name: 'filterStatus',
    label: 'Status da prova',
    options: FILTER_STATUS_OPTIONS,
  });
  filterStatusField.classList.add('exam-dashboard__header-field');

  const { field: filterDurationField, control: filterDurationInput } = createInputField({
    name: 'filterDuration',
    label: 'Tempo máximo (minutos)',
    type: 'number',
    placeholder: 'Ex.: 90',
  });
  filterDurationField.classList.add('exam-dashboard__header-field');
  filterDurationInput.min = '10';
  filterDurationInput.step = '5';
  filterDurationInput.inputMode = 'numeric';
  filterDurationInput.value = '';

  if (filterSubjectSelect instanceof HTMLSelectElement) {
    filterSubjectSelect.value = filterState.subject;
  }
  if (filterSeriesSelect instanceof HTMLSelectElement) {
    filterSeriesSelect.value = filterState.series;
  }
  if (filterDifficultySelect instanceof HTMLSelectElement) {
    filterDifficultySelect.value = filterState.difficulty;
  }
  if (filterStatusSelect instanceof HTMLSelectElement) {
    filterStatusSelect.value = filterState.status;
  }

  headerGrid.append(
    filterSubjectField,
    filterSeriesField,
    filterDifficultyField,
    filterStatusField,
    filterDurationField,
  );

  const headerActions = document.createElement('div');
  headerActions.className = 'exam-dashboard__header-actions';

  const printStudentButton = document.createElement('button');
  printStudentButton.type = 'button';
  printStudentButton.className = 'button button--primary';
  printStudentButton.textContent = 'Imprimir versão para alunos';

  const printTeacherButton = document.createElement('button');
  printTeacherButton.type = 'button';
  printTeacherButton.className = 'button button--secondary';
  printTeacherButton.textContent = 'Imprimir versão para professores';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'button button--ghost exam-dashboard__add-button';
  addButton.textContent = 'Cadastrar nova prova';
  addButton.setAttribute('aria-expanded', 'false');
  addButton.setAttribute('aria-controls', '');

  headerActions.append(printStudentButton, printTeacherButton, addButton);

  function syncPrintButtons() {
    const isStudentActive = previewVersion !== 'teacher';
    printStudentButton.classList.toggle('button--primary', isStudentActive);
    printStudentButton.classList.toggle('button--secondary', !isStudentActive);
    printTeacherButton.classList.toggle('button--primary', !isStudentActive);
    printTeacherButton.classList.toggle('button--secondary', isStudentActive);
    printStudentButton.setAttribute('aria-pressed', String(isStudentActive));
    printTeacherButton.setAttribute('aria-pressed', String(!isStudentActive));
  }

  function updatePreviewVersionState(version) {
    previewVersion = version === 'teacher' ? 'teacher' : 'student';
    syncPrintButtons();
  }

  function applyPreviewVersion(version, options = {}) {
    const normalizedVersion = version === 'teacher' ? 'teacher' : 'student';
    const controller = printablePreviewController;
    const changed = controller?.setVersion ? controller.setVersion(normalizedVersion, options) : false;

    if (!changed) {
      updatePreviewVersionState(normalizedVersion);
    }
  }

  syncPrintButtons();

  headerSection.append(headerText, headerGrid, headerActions);

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout exam-dashboard__layout';

  const previewRow = document.createElement('div');
  previewRow.className = 'admin-dashboard__widget-row exam-dashboard__preview-row';

  const previewSection = document.createElement('section');
  previewSection.className = 'surface-card exam-dashboard__preview layout-stack layout-stack--lg';

  const previewHeader = document.createElement('div');
  previewHeader.className = 'exam-dashboard__preview-header layout-stack layout-stack--3xs';

  const previewTitle = document.createElement('h2');
  previewTitle.className = 'exam-dashboard__preview-heading';
  previewTitle.textContent = 'Visualização da prova';

  previewHeader.append(previewTitle);

  const previewMessage = createMessageElement('exam-dashboard__preview-message');

  const selectionControls = document.createElement('div');
  selectionControls.className = 'exam-dashboard__selection layout-stack layout-stack--4xs';

  const openSelectionButton = document.createElement('button');
  openSelectionButton.type = 'button';
  openSelectionButton.className = 'button button--ghost exam-dashboard__selection-button';
  openSelectionButton.textContent = 'Provas em andamento e agendadas';
  openSelectionButton.setAttribute('aria-haspopup', 'dialog');
  openSelectionButton.setAttribute('aria-expanded', 'false');

  const selectionStatusMessage = createMessageElement('exam-dashboard__selection-message');

  selectionControls.append(openSelectionButton, selectionStatusMessage);

  headerSection.append(selectionControls);

  const previewBody = document.createElement('div');
  previewBody.className = 'exam-dashboard__preview-body layout-stack layout-stack--lg';

  previewSection.append(previewHeader, previewBody);

  previewRow.append(previewMessage, previewSection);

  const listItems = document.createElement('ul');
  listItems.className = 'exam-dashboard__list-items';
  listItems.setAttribute('role', 'list');

  const { form, fields, message: formMessage, cancelButton, submitButton } = createExamForm();
  addButton.setAttribute('aria-controls', form.id);

  const selectionTitleId = `exam-dashboard-selection-title-${Math.random().toString(36).slice(2, 8)}`;

  const selectionBackdropElement = document.createElement('div');
  selectionBackdropElement.className = 'app-modal-backdrop exam-dashboard__selection-backdrop';
  selectionBackdropElement.hidden = true;

  const selectionModalElement = document.createElement('div');
  selectionModalElement.className = 'app-modal exam-dashboard__selection-modal';
  selectionModalElement.hidden = true;
  selectionModalElement.id = `exam-dashboard-selection-${Math.random().toString(36).slice(2, 8)}`;
  selectionModalElement.setAttribute('role', 'dialog');
  selectionModalElement.setAttribute('aria-modal', 'true');
  selectionModalElement.setAttribute('aria-hidden', 'true');
  selectionModalElement.setAttribute('aria-labelledby', selectionTitleId);

  openSelectionButton.setAttribute('aria-controls', selectionModalElement.id);

  const selectionPanel = document.createElement('div');
  selectionPanel.className = 'app-modal__panel app-modal__panel--miniapp exam-dashboard__selection-panel';

  const selectionHeader = document.createElement('div');
  selectionHeader.className = 'app-modal__header exam-dashboard__selection-header';

  const selectionTitle = document.createElement('h3');
  selectionTitle.className = 'app-modal__title exam-dashboard__selection-title';
  selectionTitle.id = selectionTitleId;
  selectionTitle.textContent = 'Provas em andamento e agendadas';

  const selectionCloseButtonElement = document.createElement('button');
  selectionCloseButtonElement.type = 'button';
  selectionCloseButtonElement.className = 'app-modal__close exam-dashboard__selection-close';
  selectionCloseButtonElement.setAttribute('aria-label', 'Fechar lista de provas');
  selectionCloseButtonElement.textContent = 'Fechar';

  selectionHeader.append(selectionTitle, selectionCloseButtonElement);

  const selectionDescription = document.createElement('p');
  selectionDescription.className = 'exam-dashboard__selection-description';
  selectionDescription.textContent = 'Selecione uma prova para carregar os detalhes no painel de visualização.';

  const selectionContent = document.createElement('div');
  selectionContent.className = 'exam-dashboard__selection-content';
  selectionContent.append(listItems);

  selectionPanel.append(selectionHeader, selectionDescription, selectionContent);
  selectionModalElement.append(selectionPanel);

  selectionBackdrop = selectionBackdropElement;
  selectionModal = selectionModalElement;
  selectionCloseButton = selectionCloseButtonElement;

  const formRow = document.createElement('div');
  formRow.className = 'admin-dashboard__widget-row exam-dashboard__form-row';
  formRow.append(form);

  layout.append(
    headerSection,
    previewRow,
    formRow,
    selectionBackdropElement,
    selectionModalElement,
  );

  function parseMaxDurationValue(value) {
    const numericValue = Number.parseInt((value ?? '').toString(), 10);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return null;
    }
    return numericValue;
  }

  function syncFiltersFromControls() {
    if (filterSubjectSelect instanceof HTMLSelectElement) {
      filterState.subject = filterSubjectSelect.value || 'all';
      if (!FILTER_SUBJECT_OPTIONS.some((option) => option.value === filterState.subject)) {
        filterState.subject = 'all';
      }
    }
    if (filterSeriesSelect instanceof HTMLSelectElement) {
      filterState.series = filterSeriesSelect.value || 'all';
      if (!FILTER_SERIES_OPTIONS.some((option) => option.value === filterState.series)) {
        filterState.series = 'all';
      }
    }
    if (filterDifficultySelect instanceof HTMLSelectElement) {
      filterState.difficulty = filterDifficultySelect.value || 'all';
      if (!FILTER_DIFFICULTY_OPTIONS.some((option) => option.value === filterState.difficulty)) {
        filterState.difficulty = 'all';
      }
    }
    if (filterStatusSelect instanceof HTMLSelectElement) {
      filterState.status = filterStatusSelect.value || 'all';
      if (!FILTER_STATUS_OPTIONS.some((option) => option.value === filterState.status)) {
        filterState.status = 'all';
      }
    }
    if (filterDurationInput instanceof HTMLInputElement) {
      filterState.maxDuration = parseMaxDurationValue(filterDurationInput.value);
    }
  }

  function getFilteredExams() {
    return currentExams.filter((exam) => {
      if (filterState.subject !== 'all' && exam.subject !== filterState.subject) {
        return false;
      }
      if (filterState.series !== 'all' && exam.series !== filterState.series) {
        return false;
      }
      if (filterState.difficulty !== 'all' && exam.difficulty !== filterState.difficulty) {
        return false;
      }
      if (filterState.status !== 'all' && exam.status !== filterState.status) {
        return false;
      }
      if (filterState.maxDuration !== null && Number.isFinite(filterState.maxDuration)) {
        if (!Number.isFinite(exam.durationMinutes) || exam.durationMinutes > filterState.maxDuration) {
          return false;
        }
      }
      return true;
    });
  }

  function applyFiltersToFormDefaults() {
    if (!fields || typeof fields !== 'object') {
      return;
    }

    if (fields.subject instanceof HTMLSelectElement) {
      const subjectValue = filterState.subject !== 'all' ? filterState.subject : SUBJECT_OPTIONS[0]?.value;
      if (subjectValue) {
        fields.subject.value = subjectValue;
      }
    }

    if (fields.series instanceof HTMLSelectElement) {
      const seriesValue = filterState.series !== 'all' ? filterState.series : SERIES_OPTIONS[0];
      if (seriesValue) {
        fields.series.value = seriesValue;
      }
    }

    if (fields.difficulty instanceof HTMLSelectElement) {
      const difficultyValue = filterState.difficulty !== 'all' ? filterState.difficulty : DEFAULT_EXAM_DIFFICULTY;
      fields.difficulty.value = difficultyValue;
    }

    if (fields.status instanceof HTMLSelectElement) {
      const statusValue = filterState.status !== 'all' ? filterState.status : EXAM_STATUS_OPTIONS[0]?.value;
      if (statusValue) {
        fields.status.value = statusValue;
      }
    }

    if (fields.kind instanceof HTMLSelectElement) {
      fields.kind.value = DEFAULT_EXAM_KIND;
    }

    if (fields.durationMinutes instanceof HTMLInputElement) {
      fields.durationMinutes.value = filterState.maxDuration !== null ? String(filterState.maxDuration) : '';
    }
  }

  function handleFiltersChange() {
    syncFiltersFromControls();
    renderExamList();
    applyFiltersToFormDefaults();
  }

  function setListMessage(type, text) {
    updateMessageElement(selectionStatusMessage, type, text);
    if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
      if (listMessageTimeout) {
        window.clearTimeout(listMessageTimeout);
      }
      if (text) {
        listMessageTimeout = window.setTimeout(() => {
          updateMessageElement(selectionStatusMessage, null, '');
        }, 5000);
      }
    }
  }

  function handleSelectionKeydown(event) {
    if (event?.key === 'Escape') {
      event.preventDefault();
      closeSelectionModal();
    }
  }

  function closeSelectionModal(options = {}) {
    const { restoreFocus = true } = options;

    if (!isSelectionModalOpen) {
      return;
    }

    isSelectionModalOpen = false;

    if (selectionBackdrop instanceof HTMLElement) {
      selectionBackdrop.classList.remove('app-modal-backdrop--visible');
      selectionBackdrop.hidden = true;
    }

    if (selectionModal instanceof HTMLElement) {
      selectionModal.hidden = true;
      selectionModal.setAttribute('aria-hidden', 'true');
    }

    openSelectionButton.setAttribute('aria-expanded', 'false');

    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
      document.removeEventListener('keydown', handleSelectionKeydown);
    }

    const focusTarget = restoreFocus ? selectionFocusRestorer : null;
    selectionFocusRestorer = null;

    if (focusTarget instanceof HTMLElement) {
      try {
        focusTarget.focus();
      } catch (error) {
        console.error('Não foi possível restaurar o foco após fechar a lista de provas.', error);
      }
    }
  }

  function openSelectionModal() {
    if (!(selectionModal instanceof HTMLElement) || !(selectionBackdrop instanceof HTMLElement)) {
      return;
    }

    const activeElement = typeof document !== 'undefined' ? document.activeElement : null;
    selectionFocusRestorer = activeElement instanceof HTMLElement ? activeElement : openSelectionButton;

    renderExamList();

    isSelectionModalOpen = true;

    selectionBackdrop.hidden = false;
    selectionBackdrop.classList.add('app-modal-backdrop--visible');

    selectionModal.hidden = false;
    selectionModal.setAttribute('aria-hidden', 'false');

    openSelectionButton.setAttribute('aria-expanded', 'true');

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', handleSelectionKeydown);
    }

    const firstInteractive = selectionModal.querySelector('.exam-dashboard__list-button');
    const focusTarget =
      firstInteractive instanceof HTMLElement
        ? firstInteractive
        : selectionCloseButton instanceof HTMLElement
          ? selectionCloseButton
          : null;

    if (focusTarget instanceof HTMLElement) {
      try {
        focusTarget.focus();
      } catch (error) {
        console.error('Não foi possível focar a lista de provas ao abrir a janela.', error);
      }
    }
  }

  function handleSelectionButtonClick(event) {
    event.preventDefault();
    if (isSelectionModalOpen) {
      closeSelectionModal();
    } else {
      openSelectionModal();
    }
  }

  function handleSelectionClose(event) {
    event.preventDefault();
    closeSelectionModal();
  }

  function handleSelectionBackdropClick(event) {
    event.preventDefault();
    closeSelectionModal();
  }

  function handleSelectionModalClick(event) {
    if (event?.target === selectionModal) {
      closeSelectionModal();
    }
  }

  function resetForm() {
    form.reset();
    form.dataset.mode = 'create';
    form.hidden = true;
    addButton.setAttribute('aria-expanded', 'false');
    submitButton.textContent = 'Salvar prova';
    updateMessageElement(formMessage, null, '');
    if (fields.status instanceof HTMLSelectElement) {
      fields.status.value = 'draft';
    }
    if (fields.kind instanceof HTMLSelectElement) {
      fields.kind.value = DEFAULT_EXAM_KIND;
    }
    applyFiltersToFormDefaults();
  }

  function showForm() {
    const isEditMode = form.dataset.mode === 'edit';
    form.hidden = false;
    if (!isEditMode) {
      form.dataset.mode = 'create';
    }
    submitButton.textContent = isEditMode ? 'Atualizar prova' : 'Salvar prova';
    addButton.setAttribute('aria-expanded', 'true');
    if (!isEditMode) {
      applyFiltersToFormDefaults();
    }
    if (fields.title instanceof HTMLElement && typeof fields.title.focus === 'function') {
      try {
        fields.title.focus();
      } catch (error) {
        console.error('Não foi possível focar o campo de título da prova.', error);
      }
    }
    if (typeof form.scrollIntoView === 'function') {
      try {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        console.error('Não foi possível rolar até o formulário de provas.', error);
      }
    }
  }

  function startEditExam(exam) {
    if (!exam || typeof exam !== 'object') {
      return;
    }

    const existingExam = currentExams.find((item) => item.id === exam.id);
    if (!existingExam) {
      updateMessageElement(
        formMessage,
        'error',
        'Não foi possível localizar a prova selecionada para edição.',
      );
      return;
    }

    selectedExamId = existingExam.id;
    selectExam(existingExam.id);

    form.dataset.mode = 'edit';
    updateMessageElement(formMessage, null, '');

    if (fields.title && 'value' in fields.title) {
      fields.title.value = existingExam.title ?? '';
    }
    if (fields.subject instanceof HTMLSelectElement) {
      fields.subject.value = existingExam.subject ?? '';
    }
    if (fields.series instanceof HTMLSelectElement) {
      fields.series.value = existingExam.series ?? '';
    }
    if (fields.difficulty instanceof HTMLSelectElement) {
      fields.difficulty.value = existingExam.difficulty ?? DEFAULT_EXAM_DIFFICULTY;
    }
    if (fields.kind instanceof HTMLSelectElement) {
      fields.kind.value = existingExam.kind ?? DEFAULT_EXAM_KIND;
    }
    if (fields.status instanceof HTMLSelectElement) {
      fields.status.value = existingExam.status ?? 'draft';
    }
    if (fields.applicationDate && 'value' in fields.applicationDate) {
      fields.applicationDate.value = existingExam.applicationDate ?? '';
    }
    if (fields.startTime && 'value' in fields.startTime) {
      fields.startTime.value = existingExam.startTime ?? '';
    }
    if (fields.durationMinutes && 'value' in fields.durationMinutes) {
      const durationValue = Number.isFinite(existingExam.durationMinutes)
        ? existingExam.durationMinutes
        : '';
      fields.durationMinutes.value = durationValue ? String(durationValue) : '';
    }
    if (fields.objective && 'value' in fields.objective) {
      fields.objective.value = existingExam.objective ?? '';
    }
    if (fields.instructions && 'value' in fields.instructions) {
      fields.instructions.value = existingExam.instructions ?? '';
    }

    showForm();
  }

  function selectExam(examId) {
    const visibleExams = getFilteredExams();
    if (!examId || !visibleExams.some((exam) => exam.id === examId)) {
      selectedExamId = visibleExams[0]?.id ?? null;
    } else {
      selectedExamId = examId;
    }
    updateMessageElement(previewMessage, null, '');
    const selectedExam = currentExams.find((exam) => exam.id === selectedExamId) ?? null;
    renderExamPreview(previewBody, selectedExam, questionMap, {
      previewVersion,
      onVersionChange: updatePreviewVersionState,
      syncButtons: syncPrintButtons,
      registerController(controller) {
        printablePreviewController = controller;
      },
    });
    updateListSelection();
    const hasSelection = Boolean(selectedExam);
    printStudentButton.disabled = !hasSelection;
    printTeacherButton.disabled = !hasSelection;
  }

  function updateListSelection() {
    listItems.querySelectorAll('.exam-dashboard__list-button').forEach((button) => {
      const isCurrent = button.dataset.examId === selectedExamId;
      button.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      if (isCurrent) {
        button.setAttribute('aria-current', 'true');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function renderExamList() {
    listItems.replaceChildren();

    const filtered = getFilteredExams();

    if (!Array.isArray(filtered) || filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'exam-dashboard__list-empty';
      empty.textContent =
        Array.isArray(currentExams) && currentExams.length === 0
          ? 'Nenhuma prova cadastrada ainda. Utilize “Nova prova” para iniciar seu planejamento.'
          : 'Nenhuma prova atende ao contexto selecionado. Ajuste os filtros acima para visualizar outras avaliações.';
      listItems.append(empty);
      selectExam(null);
      return;
    }

    const sorted = sortExamsForList(filtered);

    sorted.forEach((exam) => {
      const { item, button } = createExamListItem(exam, {
        isSelected: exam.id === selectedExamId,
        onSelect: (examId) => {
          selectExam(examId);
          closeSelectionModal();
        },
        startEditExam: (examToEdit) => {
          closeSelectionModal({ restoreFocus: false });
          startEditExam(examToEdit);
        },
      });
      button.dataset.examId = exam.id;
      listItems.append(item);
    });

    if (!selectedExamId || !sorted.some((exam) => exam.id === selectedExamId)) {
      selectedExamId = sorted[0].id;
    }

    selectExam(selectedExamId);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);

    const title = (formData.get('title') || '').toString().trim();
    const subject = (formData.get('subject') || '').toString();
    const series = (formData.get('series') || '').toString();
    const difficulty = (formData.get('difficulty') || '').toString();
    const kind = (formData.get('kind') || '').toString();
    const status = (formData.get('status') || 'draft').toString();
    const applicationDate = (formData.get('applicationDate') || '').toString();
    const startTime = (formData.get('startTime') || '').toString();
    const durationMinutes = Number.parseInt((formData.get('durationMinutes') || '0').toString(), 10);
    const objective = (formData.get('objective') || '').toString().trim();
    const instructions = (formData.get('instructions') || '').toString().trim();

    if (!title) {
      updateMessageElement(formMessage, 'error', 'Informe o título da prova para continuar.');
      return;
    }

    if (!applicationDate) {
      updateMessageElement(formMessage, 'error', 'Defina a data de aplicação da prova.');
      return;
    }

    const sanitizedDifficulty = DIFFICULTY_OPTIONS.some((option) => option.value === difficulty)
      ? difficulty
      : DEFAULT_EXAM_DIFFICULTY;
    const sanitizedKind = EXAM_KIND_OPTIONS.some((option) => option.value === kind)
      ? kind
      : DEFAULT_EXAM_KIND;
    const sanitizedDuration = Number.isFinite(durationMinutes) && durationMinutes > 0
      ? durationMinutes
      : 60;

    if (form.dataset.mode === 'edit') {
      if (!selectedExamId) {
        updateMessageElement(
          formMessage,
          'error',
          'Selecione uma prova válida antes de tentar editar.',
        );
        return;
      }

      const examIndex = currentExams.findIndex((exam) => exam.id === selectedExamId);
      if (examIndex === -1) {
        updateMessageElement(
          formMessage,
          'error',
          'Não foi possível localizar a prova selecionada para edição.',
        );
        return;
      }

      const existingExam = currentExams[examIndex];
      const updatedExam = {
        ...existingExam,
        title,
        subject,
        series,
        difficulty: sanitizedDifficulty || existingExam.difficulty || DEFAULT_EXAM_DIFFICULTY,
        kind: sanitizedKind || existingExam.kind || DEFAULT_EXAM_KIND,
        status,
        applicationDate,
        startTime,
        durationMinutes:
          Number.isFinite(durationMinutes) && durationMinutes > 0
            ? durationMinutes
            : existingExam.durationMinutes ?? sanitizedDuration,
        objective,
        instructions,
      };

      currentExams = [
        ...currentExams.slice(0, examIndex),
        updatedExam,
        ...currentExams.slice(examIndex + 1),
      ];

      selectedExamId = updatedExam.id;
      renderExamList();
      updateMessageElement(formMessage, 'success', `Prova “${title}” atualizada com sucesso.`);
      setListMessage('success', `Prova “${title}” atualizada.`);
      resetForm();
      return;
    }

    const newExam = {
      id: `exam-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      subject,
      series,
      difficulty: sanitizedDifficulty,
      kind: sanitizedKind,
      status,
      applicationDate,
      startTime,
      durationMinutes: sanitizedDuration,
      objective,
      instructions,
      questionIds: [],
    };

    currentExams = [...currentExams, newExam];
    selectedExamId = newExam.id;
    updateMessageElement(formMessage, 'success', `Prova “${title}” salva com sucesso.`);
    setListMessage('success', `Prova “${title}” adicionada ao planejamento.`);
    renderExamList();
    resetForm();
  }

  function handleAddButtonClick(event) {
    event.preventDefault();
    if (form.hidden) {
      resetForm();
      showForm();
    } else {
      resetForm();
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    resetForm();
  }

  function handlePrint(version) {
    const exam = currentExams.find((item) => item.id === selectedExamId);
    if (!exam) {
      updateMessageElement(previewMessage, 'error', 'Selecione uma prova para gerar a impressão.');
      return;
    }

    const versionLabel = version === 'teacher' ? 'professores' : 'alunos';

    try {
      const html = generatePrintableExamHtml(exam, questionMap, { version });
      const printWindow = window.open('', '_blank', 'noopener=yes,width=1024,height=768');

      if (!printWindow) {
        updateMessageElement(
          previewMessage,
          'error',
          'Não foi possível abrir a janela de impressão. Libere pop-ups e tente novamente.',
        );
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      updateMessageElement(
        previewMessage,
        'success',
        `A versão para ${versionLabel} da prova “${exam.title}” foi aberta em uma nova janela. Revise e utilize o comando de impressão do navegador para gerar o PDF.`,
      );

      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (error) {
          console.error('Erro ao acionar a impressão automática da prova.', error);
        }
      }, 300);
    } catch (error) {
      console.error('Erro ao gerar o modelo de impressão da prova.', error);
      updateMessageElement(
        previewMessage,
        'error',
        'Não foi possível gerar o modelo de impressão. Tente novamente em instantes.',
      );
    }
  }

  const handlePrintStudent = () => {
    applyPreviewVersion('student');
    handlePrint('student');
  };
  const handlePrintTeacher = () => {
    applyPreviewVersion('teacher');
    handlePrint('teacher');
  };

  if (filterSubjectSelect instanceof HTMLSelectElement) {
    filterSubjectSelect.addEventListener('change', handleFiltersChange);
    cleanupCallbacks.push(() => {
      filterSubjectSelect.removeEventListener('change', handleFiltersChange);
    });
  }

  if (filterSeriesSelect instanceof HTMLSelectElement) {
    filterSeriesSelect.addEventListener('change', handleFiltersChange);
    cleanupCallbacks.push(() => {
      filterSeriesSelect.removeEventListener('change', handleFiltersChange);
    });
  }

  if (filterDifficultySelect instanceof HTMLSelectElement) {
    filterDifficultySelect.addEventListener('change', handleFiltersChange);
    cleanupCallbacks.push(() => {
      filterDifficultySelect.removeEventListener('change', handleFiltersChange);
    });
  }

  if (filterStatusSelect instanceof HTMLSelectElement) {
    filterStatusSelect.addEventListener('change', handleFiltersChange);
    cleanupCallbacks.push(() => {
      filterStatusSelect.removeEventListener('change', handleFiltersChange);
    });
  }

  if (filterDurationInput instanceof HTMLInputElement) {
    filterDurationInput.addEventListener('input', handleFiltersChange);
    cleanupCallbacks.push(() => {
      filterDurationInput.removeEventListener('input', handleFiltersChange);
    });
  }

  addButton.addEventListener('click', handleAddButtonClick);
  form.addEventListener('submit', handleSubmit);
  cancelButton.addEventListener('click', handleCancel);
  printStudentButton.addEventListener('click', handlePrintStudent);
  printTeacherButton.addEventListener('click', handlePrintTeacher);
  openSelectionButton.addEventListener('click', handleSelectionButtonClick);

  if (selectionCloseButton instanceof HTMLElement) {
    selectionCloseButton.addEventListener('click', handleSelectionClose);
    cleanupCallbacks.push(() => {
      selectionCloseButton.removeEventListener('click', handleSelectionClose);
    });
  }

  if (selectionBackdrop instanceof HTMLElement) {
    selectionBackdrop.addEventListener('click', handleSelectionBackdropClick);
    cleanupCallbacks.push(() => {
      selectionBackdrop.removeEventListener('click', handleSelectionBackdropClick);
    });
  }

  if (selectionModal instanceof HTMLElement) {
    selectionModal.addEventListener('click', handleSelectionModalClick);
    cleanupCallbacks.push(() => {
      selectionModal.removeEventListener('click', handleSelectionModalClick);
    });
  }

  cleanupCallbacks.push(() => {
    addButton.removeEventListener('click', handleAddButtonClick);
    form.removeEventListener('submit', handleSubmit);
    cancelButton.removeEventListener('click', handleCancel);
    printStudentButton.removeEventListener('click', handlePrintStudent);
    printTeacherButton.removeEventListener('click', handlePrintTeacher);
    openSelectionButton.removeEventListener('click', handleSelectionButtonClick);
    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
      document.removeEventListener('keydown', handleSelectionKeydown);
    }
    closeSelectionModal({ restoreFocus: false });
  });

  registerViewCleanup(viewRoot, () => {
    cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao limpar handlers do painel de provas.', error);
      }
    });
    cleanupCallbacks.length = 0;
    if (typeof window !== 'undefined' && listMessageTimeout) {
      window.clearTimeout(listMessageTimeout);
      listMessageTimeout = null;
    }
  });

  syncFiltersFromControls();
  applyFiltersToFormDefaults();

  viewRoot.replaceChildren(styleElement, layout);

  renderExamList();
}

export default renderExamDashboard;
