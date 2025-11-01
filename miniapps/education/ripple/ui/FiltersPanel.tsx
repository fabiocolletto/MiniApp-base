import { useMemo, type ChangeEvent } from 'react';
import type { RippleFilterOptions, RippleFilters } from '../types/filters';

interface FiltersPanelProps {
  filters: RippleFilters;
  options: RippleFilterOptions;
  onFiltersChange: (filters: RippleFilters) => void;
  onApply: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
}

function getMultiSelectValues(event: ChangeEvent<HTMLSelectElement>): string[] {
  return Array.from(event.target.selectedOptions || []).map((option) => option.value);
}

function mergeFilters(current: RippleFilters, patch: Partial<RippleFilters>): RippleFilters {
  return { ...current, ...patch };
}

export function FiltersPanel({
  filters,
  options,
  onFiltersChange,
  onApply,
  onRegenerate,
  disabled = false,
}: FiltersPanelProps) {
  const dificuldadeOptions = useMemo(() => options.dificuldades.sort((a, b) => a - b), [options.dificuldades]);

  return (
    <section className="ripple-panel" aria-labelledby="rippleFiltersTitle">
      <header className="ripple-panel__header">
        <h2 id="rippleFiltersTitle" className="ripple-panel__title">
          Filtros da prova
        </h2>
      </header>

      <div className="ripple-field">
        <label htmlFor="rippleFilterDisciplina">Disciplina</label>
        <select
          id="rippleFilterDisciplina"
          value={filters.disciplina ?? ''}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                disciplina: event.target.value || null,
              }),
            )
          }
        >
          <option value="">Todas</option>
          {options.disciplinas.map((disciplina) => (
            <option key={disciplina} value={disciplina}>
              {disciplina}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterEtapa">Série</label>
        <select
          id="rippleFilterEtapa"
          value={filters.etapaAno ?? ''}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                etapaAno: event.target.value || null,
              }),
            )
          }
        >
          <option value="">Todas</option>
          {options.etapasAno.map((etapa) => (
            <option key={etapa} value={etapa}>
              {etapa}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterBncc">BNCC</label>
        <select
          id="rippleFilterBncc"
          multiple
          size={Math.min(6, Math.max(3, options.bncc.length))}
          value={filters.bncc}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                bncc: getMultiSelectValues(event),
              }),
            )
          }
        >
          {options.bncc.map((bncc) => (
            <option key={bncc} value={bncc}>
              {bncc}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterTema">Tema</label>
        <select
          id="rippleFilterTema"
          multiple
          size={Math.min(6, Math.max(3, options.temas.length))}
          value={filters.temas}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                temas: getMultiSelectValues(event),
              }),
            )
          }
        >
          {options.temas.map((tema) => (
            <option key={tema} value={tema}>
              {tema}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterSubtema">Subtema</label>
        <select
          id="rippleFilterSubtema"
          multiple
          size={Math.min(6, Math.max(3, options.subtemas.length))}
          value={filters.subtemas}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                subtemas: getMultiSelectValues(event),
              }),
            )
          }
        >
          {options.subtemas.map((subtema) => (
            <option key={subtema} value={subtema}>
              {subtema}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterTipo">Tipo de questão</label>
        <select
          id="rippleFilterTipo"
          multiple
          size={Math.min(6, Math.max(3, options.tipos.length))}
          value={filters.tipos}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                tipos: getMultiSelectValues(event),
              }),
            )
          }
        >
          {options.tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterDificuldade">Dificuldade</label>
        <select
          id="rippleFilterDificuldade"
          multiple
          size={Math.min(5, Math.max(3, dificuldadeOptions.length))}
          value={filters.dificuldades.map(String)}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                dificuldades: getMultiSelectValues(event).map((value) => Number.parseInt(value, 10)),
              }),
            )
          }
        >
          {dificuldadeOptions.map((nivel) => (
            <option key={nivel} value={String(nivel)}>
              Nível {nivel}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <label htmlFor="rippleFilterBloom">Bloom</label>
        <select
          id="rippleFilterBloom"
          multiple
          size={Math.min(6, Math.max(3, options.niveisCognitivos.length))}
          value={filters.niveisCognitivos}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange(
              mergeFilters(filters, {
                niveisCognitivos: getMultiSelectValues(event),
              }),
            )
          }
        >
          {options.niveisCognitivos.map((nivel) => (
            <option key={nivel} value={nivel}>
              {nivel}
            </option>
          ))}
        </select>
      </div>

      <div className="ripple-field">
        <span className="ripple-section-title">Tokens</span>
        <div className="ripple-token-list" role="group" aria-label="Tokens">
          {options.tokens.map((token) => {
            const checked = filters.tokens.includes(token.id);
            return (
              <label key={token.id} className="ripple-token-item">
                <input
                  type="checkbox"
                  value={token.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = new Set(filters.tokens);
                    if (event.target.checked) {
                      next.add(token.id);
                    } else {
                      next.delete(token.id);
                    }

                    onFiltersChange(
                      mergeFilters(filters, {
                        tokens: Array.from(next),
                      }),
                    );
                  }}
                />
                <span>{token.rotulo}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="ripple-buttons">
        <button type="button" className="ripple-button" disabled={disabled} onClick={onApply}>
          Aplicar
        </button>
        <button
          type="button"
          className="ripple-button ripple-button--ghost"
          disabled={disabled}
          onClick={onRegenerate}
        >
          Regenerar
        </button>
      </div>
    </section>
  );
}

export default FiltersPanel;
