import type { RippleExamRecord } from '../services/storage';

interface SummaryMetrics {
  totalTime: number;
  averageDifficulty: number;
  bnccCoverage: string[];
  typeDistribution: Record<string, number>;
  bloomDistribution: Record<string, number>;
  tokens: { id: string; rotulo: string }[];
  lockedCount: number;
  itemCount: number;
}

interface SummaryPanelProps {
  metrics: SummaryMetrics;
  savedExams: RippleExamRecord[];
  onSaveExam: () => void;
  onLoadExam: (id: string) => void;
  onDeleteExam: (id: string) => void;
  saving?: boolean;
  disabled?: boolean;
}

function formatMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return '0 min';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours <= 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes} min`;
}

export function SummaryPanel({
  metrics,
  savedExams,
  onSaveExam,
  onLoadExam,
  onDeleteExam,
  saving = false,
  disabled = false,
}: SummaryPanelProps) {
  const tipoEntries = Object.entries(metrics.typeDistribution).sort((a, b) => b[1] - a[1]);
  const bloomEntries = Object.entries(metrics.bloomDistribution).sort((a, b) => b[1] - a[1]);

  return (
    <section className="ripple-panel" aria-labelledby="rippleSummaryTitle">
      <header className="ripple-panel__header">
        <h2 id="rippleSummaryTitle" className="ripple-panel__title">
          Resumo da prova
        </h2>
      </header>

      <div className="ripple-summary-grid">
        <div>
          <h3 className="ripple-section-title">Carga horária estimada</h3>
          <strong>{formatMinutes(metrics.totalTime)}</strong>
        </div>

        <div>
          <h3 className="ripple-section-title">Dificuldade média</h3>
          <strong>{metrics.averageDifficulty.toFixed(1)}</strong>
        </div>

        <div>
          <h3 className="ripple-section-title">Itens bloqueados</h3>
          <strong>
            {metrics.lockedCount} / {metrics.itemCount}
          </strong>
        </div>

        <div>
          <h3 className="ripple-section-title">Cobertura BNCC</h3>
          <div className="ripple-summary-tags">
            {metrics.bnccCoverage.length === 0 && <span>Nenhuma habilidade selecionada.</span>}
            {metrics.bnccCoverage.map((bncc) => (
              <span key={bncc} className="ripple-summary-tag">
                {bncc}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="ripple-section-title">Mix por tipo</h3>
          <ul>
            {tipoEntries.length === 0 && <li>Nenhum item filtrado.</li>}
            {tipoEntries.map(([tipo, count]) => (
              <li key={tipo}>
                {tipo}: {count}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="ripple-section-title">Bloom</h3>
          <ul>
            {bloomEntries.length === 0 && <li>Nenhuma taxonomia registrada.</li>}
            {bloomEntries.map(([nivel, count]) => (
              <li key={nivel}>
                {nivel}: {count}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="ripple-section-title">Tokens presentes</h3>
          <div className="ripple-summary-tags">
            {metrics.tokens.length === 0 && <span>Nenhum token aplicado.</span>}
            {metrics.tokens.map((token) => (
              <span key={token.id} className="ripple-summary-tag">
                {token.rotulo}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ripple-storage" aria-labelledby="rippleStorageTitle">
        <h3 id="rippleStorageTitle" className="ripple-section-title">
          Salvar / carregar provas
        </h3>
        <div className="ripple-buttons">
          <button
            type="button"
            className="ripple-button"
            onClick={onSaveExam}
            disabled={disabled || saving}
          >
            {saving ? 'Salvando…' : 'Salvar prova'}
          </button>
        </div>

        <div className="ripple-storage__list">
          {savedExams.length === 0 && <span>Nenhuma prova salva neste dispositivo.</span>}
          {savedExams.map((exam) => (
            <div key={exam.id} className="ripple-storage__item">
              <div>
                <strong>{exam.title || 'Prova sem título'}</strong>
                <div>
                  <small>{new Date(exam.updatedAt).toLocaleString('pt-BR')}</small>
                </div>
              </div>
              <div className="ripple-buttons" style={{ gap: '0.35rem' }}>
                <button type="button" onClick={() => onLoadExam(exam.id)} disabled={disabled}>
                  Carregar
                </button>
                <button type="button" onClick={() => onDeleteExam(exam.id)} disabled={disabled}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SummaryPanel;
