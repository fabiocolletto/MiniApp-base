interface ExportButtonsProps {
  onExport: (mode: 'student' | 'teacher') => void;
  disabled?: boolean;
}

export function ExportButtons({ onExport, disabled = false }: ExportButtonsProps) {
  return (
    <div className="ripple-export" aria-label="Exportar prova">
      <button
        type="button"
        className="ripple-button"
        onClick={() => onExport('student')}
        disabled={disabled}
      >
        PDF Aluno
      </button>
      <button
        type="button"
        className="ripple-button ripple-button--ghost"
        onClick={() => onExport('teacher')}
        disabled={disabled}
      >
        PDF Professor
      </button>
    </div>
  );
}

export default ExportButtons;
