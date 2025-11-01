import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import FiltersPanel from './ui/FiltersPanel';
import SummaryPanel from './ui/SummaryPanel';
import PreviewPanel, { type ExamHeaderMeta } from './ui/PreviewPanel';
import ExportButtons from './ui/ExportButtons';
import type { RippleFilters, RippleFilterOptions } from './types/filters';
import type { QuestionBank, QuestionBankItem, QuestionBankAlternative } from './types/bank';
import type { RippleExamRecord } from './services/storage';
import { loadManifest } from './services/manifest';
import { loadBank } from './services/bank';
import { loadTokens, type TokenCatalog } from './services/tokens';
import { loadTopics, type TopicCatalog } from './services/topics';
import { saveExam, listExams, getExam, deleteExam } from './services/storage';
import type { ExamDoc } from './types/exam';
import { createSeededGenerator, normalizeSeed } from './utils/random';
import rippleStyles from './styles.css';

const INITIAL_FILTERS: RippleFilters = {
  disciplina: null,
  etapaAno: null,
  bncc: [],
  temas: [],
  subtemas: [],
  tipos: [],
  dificuldades: [],
  niveisCognitivos: [],
  tokens: [],
};

const INITIAL_META: ExamHeaderMeta = {
  escola: '',
  professor: '',
  turma: '',
  data: '',
};

interface ExamItemState {
  refId: string;
  question: QuestionBankItem;
  alternatives: QuestionBankAlternative[];
  locked: boolean;
  shuffleSeed: number | null;
}

interface StatusMessage {
  tone: 'info' | 'warning' | 'error' | 'success';
  text: string;
}

function computeOptions(
  bank: QuestionBank | null,
  tokens: TokenCatalog | null,
  topics: TopicCatalog | null,
): RippleFilterOptions {
  const itens = bank?.itens ?? [];
  const disciplinas = new Set<string>();
  const etapas = new Set<string>();
  const bncc = new Set<string>();
  const temas = new Set<string>();
  const subtemas = new Set<string>();
  const tipos = new Set<string>();
  const dificuldades = new Set<number>();
  const niveis = new Set<string>();
  const tokenMap = new Map<string, string>();

  tokens?.tokens.forEach((token) => {
    tokenMap.set(token.id_token, token.rotulo);
  });

  itens.forEach((item) => {
    if (item.disciplina) disciplinas.add(item.disciplina);
    if (item.etapa_ano) etapas.add(item.etapa_ano);
    if (item.bncc_codigo) bncc.add(item.bncc_codigo);
    if (item.tema) temas.add(item.tema);
    if (item.subtema) subtemas.add(item.subtema);
    if (item.tipo_item) tipos.add(item.tipo_item);
    if (typeof item.nivel_dificuldade === 'number') dificuldades.add(item.nivel_dificuldade);
    if (item.nivel_cognitivo) niveis.add(item.nivel_cognitivo);
    item.tokens?.forEach((token) => {
      if (token.id_token && !tokenMap.has(token.id_token)) {
        tokenMap.set(token.id_token, token.id_token);
      }
    });
  })
  topics?.topicos.forEach((topic) => {
    if (topic.rotulo) {
      temas.add(topic.rotulo);
    }
    topic.sinonimos?.forEach((nome) => temas.add(nome));
  });
;

  return {
    disciplinas: Array.from(disciplinas).sort(),
    etapasAno: Array.from(etapas).sort(),
    bncc: Array.from(bncc).sort(),
    temas: Array.from(temas).sort(),
    subtemas: Array.from(subtemas).sort(),
    tipos: Array.from(tipos).sort(),
    dificuldades: Array.from(dificuldades).sort((a, b) => a - b),
    niveisCognitivos: Array.from(niveis).sort(),
    tokens: Array.from(tokenMap.entries()).map(([id, rotulo]) => ({ id, rotulo })),
  };
}

function matchesFilters(item: QuestionBankItem, filters: RippleFilters): boolean {
  if (filters.disciplina && item.disciplina !== filters.disciplina) {
    return false;
  }

  if (filters.etapaAno && item.etapa_ano !== filters.etapaAno) {
    return false;
  }

  if (filters.bncc.length > 0 && !filters.bncc.includes(item.bncc_codigo)) {
    return false;
  }

  if (filters.temas.length > 0) {
    const tema = item.tema ?? '';
    if (!filters.temas.some((value) => value === tema)) {
      return false;
    }
  }

  if (filters.subtemas.length > 0) {
    const subtema = item.subtema ?? '';
    if (!filters.subtemas.some((value) => value === subtema)) {
      return false;
    }
  }

  if (filters.tipos.length > 0 && !filters.tipos.includes(item.tipo_item)) {
    return false;
  }

  if (filters.dificuldades.length > 0 && !filters.dificuldades.includes(item.nivel_dificuldade)) {
    return false;
  }

  if (filters.niveisCognitivos.length > 0 && !filters.niveisCognitivos.includes(item.nivel_cognitivo)) {
    return false;
  }

  if (filters.tokens.length > 0) {
    const itemTokens = item.tokens?.map((token) => token.id_token) ?? [];
    if (!itemTokens.some((id) => filters.tokens.includes(id))) {
      return false;
    }
  }

  return true;
}

function ensureAlternatives(question: QuestionBankItem, seed?: number | null): QuestionBankAlternative[] {
  const alternatives = Array.isArray(question.alternativas_json)
    ? [...question.alternativas_json]
    : [];

  if (typeof seed !== 'number' || !Number.isFinite(seed) || alternatives.length === 0) {
    return alternatives;
  }

  const generator = createSeededGenerator(normalizeSeed(seed));
  const shuffled = [...alternatives];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(generator() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function buildExamDoc(
  id: string,
  title: string,
  meta: ExamHeaderMeta,
  seed: number,
  targetItems: number,
  items: ExamItemState[],
  bank: QuestionBank | null,
): ExamDoc {
  return {
    id,
    title: title.trim() || 'Prova sem título',
    meta: {
      escola: meta.escola || null,
      professor: meta.professor || null,
      turma: meta.turma || null,
      data: meta.data || null,
      disciplina: bank?.meta.disciplina ?? null,
      etapaAno: bank?.meta.etapa_ano ?? null,
    },
    stage: 'draft',
    status: 'draft',
    seed,
    targetItems,
    shuffleQuestions: false,
    shuffleAlternatives: false,
    items: items.map((item) => ({
      refId: item.refId,
      locked: item.locked,
      altShuffleSeed: item.shuffleSeed ?? null,
    })),
    answerKeyMode: 'teacher',
    teacherNotes: null,
    derived: null,
    rev: null,
    createdAt: null,
    updatedAt: null,
  };
}

function computeSummary(items: ExamItemState[], tokensCatalog: TokenCatalog | null) {
  const totalTime = items.reduce((sum, item) => sum + (item.question.tempo_estimado_min || 0), 0);
  const avgDifficulty =
    items.length > 0
      ? items.reduce((sum, item) => sum + (item.question.nivel_dificuldade || 0), 0) / items.length
      : 0;
  const bnccCoverage = Array.from(
    new Set(items.map((item) => item.question.bncc_codigo).filter(Boolean)),
  );
  const typeDistribution: Record<string, number> = {};
  const bloomDistribution: Record<string, number> = {};
  const tokenRefs = new Map<string, string>();

  tokensCatalog?.tokens.forEach((token) => tokenRefs.set(token.id_token, token.rotulo));

  items.forEach((item) => {
    const tipo = item.question.tipo_item ?? '—';
    typeDistribution[tipo] = (typeDistribution[tipo] ?? 0) + 1;

    const bloom = item.question.nivel_cognitivo ?? '—';
    bloomDistribution[bloom] = (bloomDistribution[bloom] ?? 0) + 1;

    item.question.tokens?.forEach((token) => {
      if (token.id_token) {
        const rotulo = tokenRefs.get(token.id_token) ?? token.id_token;
        tokenRefs.set(token.id_token, rotulo);
      }
    });
  });

  return {
    totalTime,
    averageDifficulty: avgDifficulty,
    bnccCoverage,
    typeDistribution,
    bloomDistribution,
    tokens: Array.from(tokenRefs.entries()).map(([id, rotulo]) => ({ id, rotulo })),
    lockedCount: items.filter((item) => item.locked).length,
    itemCount: items.length,
  };
}

function filterBankItems(bank: QuestionBank | null, filters: RippleFilters): QuestionBankItem[] {
  if (!bank) {
    return [];
  }

  return bank.itens.filter((item) => matchesFilters(item, filters));
}

function createExamItems(
  bank: QuestionBank | null,
  filters: RippleFilters,
  baseItems: ExamItemState[],
  seed: number,
  target: number,
): ExamItemState[] {
  const bankItems = filterBankItems(bank, filters);
  const lockedSlots: Array<ExamItemState | null> = Array.from({ length: target }, (_, index) => {
    const existing = baseItems[index];
    if (existing && existing.locked) {
      return existing;
    }
    return null;
  });

  const result: ExamItemState[] = Array.from({ length: target }, (_, index) => lockedSlots[index] ?? null).filter(
    (value): value is ExamItemState => Boolean(value),
  );
  const generator = createSeededGenerator(normalizeSeed(seed));
  const used = new Set(result.map((item) => item.refId));

  for (let index = 0; index < target; index += 1) {
    if (lockedSlots[index]) {
      continue;
    }

    const available = bankItems.filter((item) => !used.has(item.id_item));
    const pool = available.length > 0 ? available : bankItems;

    if (pool.length === 0) {
      break;
    }

    const chosen = pool[Math.floor(generator() * pool.length)];
    used.add(chosen.id_item);

    result[index] = {
      refId: chosen.id_item,
      question: chosen,
      locked: false,
      shuffleSeed: null,
      alternatives: ensureAlternatives(chosen),
    };
  }

  return result;
}

function useExamLoader() {
  const [manifestRoute, setManifestRoute] = useState<string | null>(null);
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [tokensCatalog, setTokensCatalog] = useState<TokenCatalog | null>(null);
  const [topicsCatalog, setTopicsCatalog] = useState<TopicCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        setLoading(true);
        const manifest = await loadManifest();
        const routes = Object.values(manifest.rotas ?? {});
        const firstRoute = routes[0];
        if (!firstRoute) {
          throw new Error('Manifesto sem rotas configuradas.');
        }

        const loadedBank = await loadBank(firstRoute);
        const disciplinaKey = firstRoute
          .replace(/^\/?data\//, '')
          .split('.')[0]
          .toLowerCase();
        const topics = await loadTopics(disciplinaKey);
        const tokens = await loadTokens();

        if (!cancelled) {
          setManifestRoute(firstRoute);
          setBank(loadedBank);
          setTopicsCatalog(topics);
          setTokensCatalog(tokens);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar dados do Ripple.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return { manifestRoute, bank, tokensCatalog, topicsCatalog, loading, error };
}

function RippleApp() {
  const { bank, tokensCatalog, topicsCatalog, loading, error } = useExamLoader();
  const [filters, setFilters] = useState<RippleFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RippleFilters>(INITIAL_FILTERS);
  const [meta, setMeta] = useState<ExamHeaderMeta>(INITIAL_META);
  const [title, setTitle] = useState('Prova de História EF8');
  const [seed, setSeed] = useState<number>(normalizeSeed());
  const [targetItems, setTargetItems] = useState<number>(12);
  const [items, setItems] = useState<ExamItemState[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [savedExams, setSavedExams] = useState<RippleExamRecord[]>([]);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState<'student' | 'teacher' | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const filterOptions = useMemo(
    () => computeOptions(bank, tokensCatalog, topicsCatalog),
    [bank, tokensCatalog, topicsCatalog],
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (styleRef.current) {
      return;
    }

    let created = false;
    let styleElement = document.querySelector('style[data-ripple-styles]');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.dataset.rippleStyles = 'true';
      styleElement.textContent = rippleStyles;
      document.head.appendChild(styleElement);
      created = true;
    }

    styleRef.current = styleElement as HTMLStyleElement;

    return () => {
      if (created && styleElement?.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      styleRef.current = null;
    };
  }, []);

  useEffect(() => {
    listExams()
      .then(setSavedExams)
      .catch((err) => {
        console.error('Falha ao listar provas salvas', err);
      });
  }, []);

  useEffect(() => {
    if (!bank) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      disciplina: bank.meta.disciplina,
      etapaAno: bank.meta.etapa_ano,
    }));
    setAppliedFilters((prev) => ({
      ...prev,
      disciplina: bank.meta.disciplina,
      etapaAno: bank.meta.etapa_ano,
    }));
  }, [bank]);

  useEffect(() => {
    if (!bank) {
      return;
    }

    const generated = createExamItems(bank, appliedFilters, items, seed, targetItems);
    if (generated.length === 0 && !loading) {
      setStatusMessage({ tone: 'warning', text: 'Nenhum item encontrado para os filtros atuais.' });
    }
    setItems(generated);
  }, [bank, seed, targetItems, appliedFilters]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const classList = containerRef.current.classList;
    classList.toggle('ripple-print-mode--student', printMode === 'student');
    classList.toggle('ripple-print-mode--teacher', printMode === 'teacher');
  }, [printMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);


  const summary = useMemo(() => computeSummary(items, tokensCatalog), [items, tokensCatalog]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setSeed(normalizeSeed());
    setStatusMessage({ tone: 'info', text: 'Filtros aplicados. Prova regenerada.' });
    setCurrentExamId(null);
  };

  const regenerate = () => {
    setSeed(normalizeSeed());
    setStatusMessage({ tone: 'info', text: 'Prova regenerada com nova seed.' });
    setCurrentExamId(null);
  };

  const shuffleAlternatives = (index: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) {
        return prev;
      }

      const newSeed = normalizeSeed(Date.now());
      next[index] = {
        ...item,
        shuffleSeed: newSeed,
        alternatives: ensureAlternatives(item.question, newSeed),
      };
      return next;
    });
  };

  const toggleLock = (index: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) {
        return prev;
      }

      next[index] = { ...item, locked: !item.locked };
      return next;
    });
  };

  const removeItem = (index: number) => {
    const item = items[index];
    if (item?.locked) {
      setStatusMessage({ tone: 'warning', text: 'Desbloqueie a questão antes de removê-la.' });
      return;
    }

    const remaining = items.filter((_, idx) => idx !== index);
    const regenerated = createExamItems(bank, appliedFilters, remaining, seed, targetItems);
    setItems(regenerated);
    setStatusMessage({ tone: 'info', text: 'Questão removida e prova reequilibrada.' });
  };

  const moveItem = (from: number, to: number) => {
    if (from === to) {
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      if (item) {
        next.splice(to, 0, item);
      }
      return next;
    });
  };

  const replaceItem = (index: number) => {
    const current = items[index];
    if (!current) {
      return;
    }

    if (current.locked) {
      setStatusMessage({ tone: 'warning', text: 'Desbloqueie a questão antes de trocar.' });
      return;
    }

    const relaxationSteps: RippleFilters[] = [
      appliedFilters,
      { ...appliedFilters, bncc: [] },
      { ...appliedFilters, bncc: [], temas: [] },
      { ...appliedFilters, bncc: [], temas: [], dificuldades: [] },
    ];

    const used = new Set(items.map((item, idx) => (idx === index ? null : item.refId)).filter(Boolean) as string[]);
    let replacement: QuestionBankItem | null = null;
    let relaxedLevel = 0;

    for (let step = 0; step < relaxationSteps.length; step += 1) {
      const pool = filterBankItems(bank, relaxationSteps[step]).filter((item) => !used.has(item.id_item));
      if (pool.length > 0) {
        const generator = createSeededGenerator(normalizeSeed(Date.now()));
        replacement = pool[Math.floor(generator() * pool.length)];
        relaxedLevel = step;
        break;
      }
    }

    if (!replacement) {
      setStatusMessage({ tone: 'warning', text: 'Nenhuma alternativa encontrada para substituir esta questão.' });
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        refId: replacement!.id_item,
        question: replacement!,
        locked: false,
        shuffleSeed: null,
        alternatives: ensureAlternatives(replacement!),
      };
      return next;
    });

    if (relaxedLevel === 0) {
      setStatusMessage({ tone: 'success', text: 'Questão substituída mantendo os filtros atuais.' });
    } else {
      const messages = [
        '',
        'Nenhum resultado com os filtros atuais. Relaxamos BNCC.',
        'Relaxamos BNCC e Tema para encontrar uma alternativa.',
        'Relaxamos BNCC, Tema e Dificuldade para manter a prova completa.',
      ];
      setStatusMessage({ tone: 'warning', text: messages[relaxedLevel] });
    }
  };

  const handleSaveExam = async () => {
    if (!bank) {
      return;
    }

    try {
      setSaving(true);
      const identifier = currentExamId ?? `ripple-${crypto.randomUUID()}`;
      const doc = buildExamDoc(identifier, title, meta, seed, targetItems, items, bank);
      const record = await saveExam(doc);
      setCurrentExamId(record.id);
      const refreshed = await listExams();
      setSavedExams(refreshed);
      setStatusMessage({ tone: 'success', text: 'Prova salva no dispositivo.' });
    } catch (err) {
      console.error('Falha ao salvar prova', err);
      setStatusMessage({ tone: 'error', text: 'Não foi possível salvar a prova localmente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadExam = async (id: string) => {
    if (!bank) {
      return;
    }

    try {
      const doc = await getExam(id);
      if (!doc) {
        setStatusMessage({ tone: 'warning', text: 'Prova não encontrada no armazenamento local.' });
        return;
      }

      const bankMap = new Map(bank.itens.map((item) => [item.id_item, item] as const));
      const restored: ExamItemState[] = doc.items
        .map((entry) => {
          const question = bankMap.get(entry.refId);
          if (!question) {
            return null;
          }

          return {
            refId: entry.refId,
            question,
            locked: Boolean(entry.locked),
            shuffleSeed: entry.altShuffleSeed ?? null,
            alternatives: ensureAlternatives(question, entry.altShuffleSeed ?? undefined),
          };
        })
        .filter((value): value is ExamItemState => Boolean(value));

      setItems(restored);
      setTitle(doc.title);
      setMeta({
        escola: doc.meta.escola ?? '',
        professor: doc.meta.professor ?? '',
        turma: doc.meta.turma ?? '',
        data: doc.meta.data ?? '',
      });
      setTargetItems(doc.targetItems);
      setSeed(doc.seed);
      setCurrentExamId(doc.id);
      setStatusMessage({ tone: 'success', text: 'Prova carregada com sucesso.' });
    } catch (err) {
      console.error('Falha ao carregar prova', err);
      setStatusMessage({ tone: 'error', text: 'Não foi possível carregar a prova selecionada.' });
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam(id);
      const refreshed = await listExams();
      setSavedExams(refreshed);
      if (currentExamId === id) {
        setCurrentExamId(null);
      }
      setStatusMessage({ tone: 'info', text: 'Prova removida do dispositivo.' });
    } catch (err) {
      console.error('Falha ao excluir prova', err);
      setStatusMessage({ tone: 'error', text: 'Não foi possível excluir a prova salva.' });
    }
  };

  const ensurePrintStylesheet = useCallback(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const existing = document.querySelector<HTMLLinkElement>('link[data-ripple-print-style]');
    if (existing) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/print/prova.css';
    link.dataset.ripplePrintStyle = 'true';
    document.head.appendChild(link);
  }, []);

  const handleExport = (mode: 'student' | 'teacher') => {
    ensurePrintStylesheet();
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  if (loading) {
    return (
      <div className="ripple-app" ref={containerRef}>
        <p>Carregando dados do Ripple…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ripple-app" ref={containerRef}>
        <p>Erro ao carregar painel: {error}</p>
      </div>
    );
  }

  return (
    <div className="ripple-app" ref={containerRef}>
      {statusMessage && <div className="ripple-status-banner">{statusMessage.text}</div>}
      <div className="ripple-layout">
        <FiltersPanel
          filters={filters}
          options={filterOptions}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onRegenerate={regenerate}
          disabled={!bank}
        />

        <div className="ripple-column">
          <SummaryPanel
            metrics={summary}
            savedExams={savedExams}
            onSaveExam={handleSaveExam}
            onLoadExam={handleLoadExam}
            onDeleteExam={handleDeleteExam}
            saving={saving}
            disabled={!bank}
          />

          <PreviewPanel
            title={title}
            meta={meta}
            onTitleChange={setTitle}
            onMetaChange={setMeta}
            targetItems={targetItems}
            onTargetItemsChange={setTargetItems}
            items={items}
            onReplace={replaceItem}
            onShuffleAlternatives={shuffleAlternatives}
            onToggleLock={toggleLock}
            onRemove={removeItem}
            onMove={moveItem}
            disabled={!bank || items.length === 0}
          />

          <ExportButtons onExport={handleExport} disabled={items.length === 0} />
        </div>
      </div>
    </div>
  );
}

export async function mount(target: Element) {
  if (!target) {
    throw new Error('Elemento de destino inválido para montar o Ripple.');
  }

  target.innerHTML = '';
  const root = createRoot(target);
  root.render(
    <StrictMode>
      <RippleApp />
    </StrictMode>,
  );

  return () => {
    root.unmount();
  };
}

export default { mount };
