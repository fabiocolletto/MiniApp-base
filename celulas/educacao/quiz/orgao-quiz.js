// ORGAO-QUIZ.JS - Engine do Quiz PWAO

import React, { useState, useEffect, useRef, useCallback, useMemo } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18";

// ============================================================================
// 1. TEMA E ESTILO (Tokens Simplificados)
// ============================================================================

export const APP_PRIMARY_COLOR = "#059669"; // Esmeralda
export const APP_PRIMARY_BG_RAW = "#ecfdf5";
export const APP_PRIMARY_TEXT = "#065f46";

export const FEEDBACK_COLORS = {
  RED_PRIMARY: "#DC2626",
  RED_BG: "#FEE2E2",
  NEUTRAL_PRIMARY: "#64748B",
  NEUTRAL_BG: "#F8FAFC",
};

export const PRIMITIVE_STYLES = {
  TEXT_SLATE_800: "text-slate-800",
  TEXT_SLATE_700: "text-slate-700",
  TEXT_SLATE_500: "text-slate-500",
  BG_WHITE: "bg-white",
  BG_SLATE_50: "bg-slate-50",
  BG_SLATE_100: "bg-slate-100",
};

// ============================================================================
// 2. COMPONENTES DO QUIZ
// ============================================================================

function Pergunta({ pergunta, onResponder, respostaSelecionada }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{pergunta.titulo}</h2>

      <ul className="space-y-3">
        {pergunta.alternativas.map((alt, i) => (
          <button
            key={i}
            onClick={() => onResponder(i)}
            className={`w-full p-3 rounded-lg border ${
              respostaSelecionada === i
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            {alt}
          </button>
        ))}
      </ul>
    </div>
  );
}

function Resultado({ corretas, total, onReiniciar }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Resultado</h2>
      <p className="text-lg">Você acertou {corretas} de {total} questões.</p>
      <button
        onClick={onReiniciar}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
      >
        Reiniciar
      </button>
    </div>
  );
}

// ============================================================================
// 3. MOTOR DO QUIZ (AppQuiz)
// ============================================================================

function AppQuiz() {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [finalizado, setFinalizado] = useState(false);

  // Exemplo reduzido de base de perguntas
  const perguntas = [
    {
      titulo: "Qual a capital da França?",
      alternativas: ["Madrid", "Paris", "Roma"],
      correta: 1,
    },
    {
      titulo: "Quanto é 2 + 2?",
      alternativas: ["3", "4", "5"],
      correta: 1,
    },
  ];

  const responder = (i) => {
    setRespostas((prev) => {
      const novo = [...prev];
      novo[indice] = i;
      return novo;
    });

    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
    } else {
      setFinalizado(true);
    }
  };

  const reiniciar = () => {
    setIndice(0);
    setRespostas([]);
    setFinalizado(false);
  };

  const corretas = respostas.filter((r, i) => r === perguntas[i].correta).length;

  return (
    <div className="p-4 space-y-6">
      {!finalizado ? (
        <Pergunta
          pergunta={perguntas[indice]}
          onResponder={responder}
          respostaSelecionada={respostas[indice]}
        />
      ) : (
        <Resultado corretas={corretas} total={perguntas.length} onReiniciar={reiniciar} />
      )}
    </div>
  );
}

// ============================================================================
// 4. EXPRESSÃO DO ÓRGÃO
// ============================================================================

export function iniciarQuiz() {
  const el = document.getElementById("quiz-root");
  if (!el) {
    console.error("Célula quiz não possui #quiz-root");
    return;
  }
  ReactDOM.createRoot(el).render(<AppQuiz />);
}

// Inicializa automaticamente ao carregar a célula
iniciarQuiz();
