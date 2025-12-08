// ORGAO-QUIZ.JS (Versão com carregamento de datasets externos)

import React, { useState, useEffect } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18";

// =============================================
// 1. TEMA (simplificado)
// =============================================
export const APP_PRIMARY_COLOR = "#059669";
export const APP_PRIMARY_TEXT = "#065f46";
export const FEEDBACK_COLORS = {
  RED: "#DC2626",
  RED_BG: "#FEE2E2",
  NEUTRAL: "#64748B",
  NEUTRAL_BG: "#F8FAFC"
};

// =============================================
// 2. Carregador Universal de Dados
// =============================================
export async function carregarJSON(caminho) {
  try {
    const resp = await fetch(caminho);
    if (!resp.ok) throw new Error("Falha ao carregar: " + caminho);
    return await resp.json();
  } catch (e) {
    console.error("Erro carregando JSON", caminho, e);
    return null;
  }
}

// Carrega o mapa de cursos
export async function carregarMapaCursos() {
  return carregarJSON("./datasets/cursos.json");
}

// Carrega o dataset do curso escolhido
export async function carregarDataset(curso, ano) {
  const mapa = await carregarMapaCursos();
  if (!mapa || !mapa[curso] || !mapa[curso][ano]) {
    console.error("Dataset não encontrado para", curso, ano);
    return null;
  }
  return carregarJSON(mapa[curso][ano]);
}

// =============================================
// 3. Componentes do Quiz
// =============================================
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

// =============================================
// 4. Motor Principal do Quiz
// =============================================
function AppQuiz() {
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [perguntas, setPerguntas] = useState(null);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [finalizado, setFinalizado] = useState(false);
  const [mapaCursos, setMapaCursos] = useState(null);

  // Carrega o mapa de cursos ao iniciar
  useEffect(() => {
    carregarMapaCursos().then(setMapaCursos);
  }, []);

  // Quando curso e ano forem escolhidos, carrega o dataset
  useEffect(() => {
    if (cursoSelecionado && anoSelecionado) {
      carregarDataset(cursoSelecionado, anoSelecionado).then(setPerguntas);
    }
  }, [cursoSelecionado, anoSelecionado]);

  if (!mapaCursos) return <p>Carregando cursos…</p>;

  // Tela de seleção de curso → ano
  if (!cursoSelecionado) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Selecione o curso</h1>
        {Object.keys(mapaCursos).map((curso) => (
          <button
            key={curso}
            onClick={() => setCursoSelecionado(curso)}
            className="w-full bg-emerald-600 text-white p-3 rounded-lg"
          >
            {curso.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  if (!anoSelecionado) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Ano do curso: {cursoSelecionado.toUpperCase()}</h1>
        {Object.keys(mapaCursos[cursoSelecionado]).map((ano) => (
          <button
            key={ano}
            onClick={() => setAnoSelecionado(ano)}
            className="w-full bg-emerald-600 text-white p-3 rounded-lg"
          >
            {ano}
          </button>
        ))}
      </div>
    );
  }

  if (!perguntas) return <p>Carregando questões…</p>;

  const responder = (i) => {
    setRespostas((prev) => {
      const novo = [...prev];
      novo[indice] = i;
      return novo;
    });

    if (indice + 1 < perguntas.length) setIndice(indice + 1);
    else setFinalizado(true);
  };

  const reiniciar = () => {
    setIndice(0);
    setRespostas([]);
    setFinalizado(false);
    setAnoSelecionado(null);
    setCursoSelecionado(null);
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

// =============================================
// 5. Função de expressão do órgão
// =============================================
export function iniciarQuiz() {
  const el = document.getElementById("quiz-root");
  if (!el) {
    console.error("Célula quiz não possui #quiz-root");
    return;
  }
  ReactDOM.createRoot(el).render(<AppQuiz />);
}

// Inicializa ao carregar a célula
iniciarQuiz();
