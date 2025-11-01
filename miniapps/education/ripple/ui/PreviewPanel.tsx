import { useMemo, useState } from 'react';
import type { QuestionBankItem, QuestionBankAlternative } from '../types/bank';

export interface ExamItemView {
  refId: string;
  locked: boolean;
  question: QuestionBankItem;
  alternatives: QuestionBankAlternative[];
  shuffleSeed?: number | null;
}

export interface ExamHeaderMeta {
  escola: string;
  professor: string;
  turma: string;
  data: string;
}

interface PreviewPanelProps {
  title: string;
  meta: ExamHeaderMeta;
  onTitleChange: (title: string) => void;
  onMetaChange: (meta: ExamHeaderMeta) => void;
  targetItems: number;
  onTargetItemsChange: (value: number) => void;
  items: ExamItemView[];
  onReplace: (index: number) => void;
  onShuffleAlternatives: (index: number) => void;
  onToggleLock: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

function sanitizeHtml(html: string): { __html: string } {
  return { __html: html };
}

export function PreviewPanel({
  title,
  meta,
  onTitleChange,
  onMetaChange,
  targetItems,
  onTargetItemsChange,
  items,
  onReplace,
  onShuffleAlternatives,
  onToggleLock,
  onRemove,
  onMove,
  disabled = false,
}: PreviewPanelProps) {
  const [movingIndex, setMovingIndex] = useState<number | null>(null);
  const [movingTarget, setMovingTarget] = useState<number>(1);

  const handleMetaChange = (field: keyof ExamHeaderMeta, value: string) => {
    onMetaChange({ ...meta, [field]: value });
  };

  const itemCount = items.length;

  const normalizedTarget = useMemo(() => {
    if (!Number.isFinite(targetItems)) {
      return 10;
    }

    return Math.min(30, Math.max(5, Math.round(targetItems)));
  }, [targetItems]);

  return (
    <section className="ripple-panel ripple-preview" aria-labelledby="ripplePreviewTitle">
      <header className="ripple-panel__header">
        <h2 id="ripplePreviewTitle" className="ripple-panel__title">
          Pré-visualização
        </h2>
      </header>

      <div className="ripple-preview__header">
        <input
          className="ripple-preview__title-input"
          type="text"
          value={title}
          placeholder="Título da prova"
          disabled={disabled}
          onChange={(event) => onTitleChange(event.target.value)}
        />

        <div className="ripple-preview__meta">
          <div className="ripple-field">
            <label htmlFor="rippleMetaEscola">Escola</label>
            <input
              id="rippleMetaEscola"
              type="text"
              value={meta.escola}
              disabled={disabled}
              onChange={(event) => handleMetaChange('escola', event.target.value)}
            />
          </div>
          <div className="ripple-field">
            <label htmlFor="rippleMetaProfessor">Professor(a)</label>
            <input
              id="rippleMetaProfessor"
              type="text"
              value={meta.professor}
              disabled={disabled}
              onChange={(event) => handleMetaChange('professor', event.target.value)}
            />
          </div>
          <div className="ripple-field">
            <label htmlFor="rippleMetaTurma">Turma</label>
            <input
              id="rippleMetaTurma"
              type="text"
              value={meta.turma}
              disabled={disabled}
              onChange={(event) => handleMetaChange('turma', event.target.value)}
            />
          </div>
          <div className="ripple-field">
            <label htmlFor="rippleMetaData">Data</label>
            <input
              id="rippleMetaData"
              type="date"
              value={meta.data}
              disabled={disabled}
              onChange={(event) => handleMetaChange('data', event.target.value)}
            />
          </div>
        </div>

        <div className="ripple-preview__quantity">
          <label htmlFor="rippleTargetItems">Quantidade de questões</label>
          <input
            id="rippleTargetItems"
            type="number"
            min={5}
            max={30}
            value={normalizedTarget}
            disabled={disabled}
            onChange={(event) => onTargetItemsChange(Number.parseInt(event.target.value, 10) || normalizedTarget)}
          />
        </div>
      </div>

      <div className="ripple-item-list">
        {items.map((item, index) => {
          const isMoving = movingIndex === index;
          const hasAlternatives = Array.isArray(item.alternatives) && item.alternatives.length > 0;
          const bncc = item.question.bncc_codigo;

          return (
            <article
              key={`${item.refId}-${index}`}
              className="ripple-item-card"
              data-locked={item.locked ? 'true' : 'false'}
              data-ripple-item
            >
              <div className="ripple-item-card__header">
                <h3>
                  Questão {index + 1} — {item.question.tipo_item}
                </h3>
                <div className="ripple-item-card__meta">
                  {bncc && <span>BNCC: {bncc}</span>}
                  {item.question.tema && <span>Tema: {item.question.tema}</span>}
                  {item.question.subtema && <span>Subtema: {item.question.subtema}</span>}
                  <span>Dificuldade: {item.question.nivel_dificuldade}</span>
                  <span>Bloom: {item.question.nivel_cognitivo}</span>
                </div>
              </div>

              <div dangerouslySetInnerHTML={sanitizeHtml(item.question.enunciado_html)} />

              {hasAlternatives && (
                <ol>
                  {item.alternatives.map((alternative) => (
                    <li key={alternative.letra}>
                      <strong>{alternative.letra})</strong>{' '}
                      <span dangerouslySetInnerHTML={sanitizeHtml(alternative.texto_html)} />
                    </li>
                  ))}
                </ol>
              )}

              {item.question.gabarito_tipo && (
                <div data-teacher-only>
                  <strong>Gabarito:</strong>{' '}
                  {typeof item.question.gabarito_valor === 'object'
                    ? JSON.stringify(item.question.gabarito_valor)
                    : String(item.question.gabarito_valor)}
                </div>
              )}

              <div className="ripple-item-card__actions">
                <button type="button" disabled={disabled || item.locked} onClick={() => onReplace(index)}>
                  Trocar só esta
                </button>
                <button
                  type="button"
                  disabled={disabled || !hasAlternatives}
                  onClick={() => onShuffleAlternatives(index)}
                >
                  Embaralhar alternativas
                </button>
                <button type="button" disabled={disabled} onClick={() => onToggleLock(index)}>
                  {item.locked ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button
                  type="button"
                  disabled={disabled || itemCount <= 1}
                  onClick={() => {
                    setMovingIndex(isMoving ? null : index);
                    setMovingTarget(index + 1);
                  }}
                >
                  Mover
                </button>
                <button
                  type="button"
                  disabled={disabled || item.locked}
                  onClick={() => onRemove(index)}
                >
                  Remover
                </button>
              </div>

              {isMoving && (
                <div className="ripple-item-card__move">
                  <label htmlFor={`rippleMove-${item.refId}`}>Posição desejada</label>
                  <input
                    id={`rippleMove-${item.refId}`}
                    type="number"
                    min={1}
                    max={itemCount}
                    value={movingTarget}
                    disabled={disabled}
                    onChange={(event) =>
                      setMovingTarget(Math.min(itemCount, Math.max(1, Number.parseInt(event.target.value, 10) || index + 1)))
                    }
                  />
                  <div className="ripple-buttons" style={{ gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onMove(index, movingTarget - 1);
                        setMovingIndex(null);
                      }}
                      disabled={disabled}
                    >
                      Confirmar
                    </button>
                    <button type="button" onClick={() => setMovingIndex(null)} disabled={disabled}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PreviewPanel;
