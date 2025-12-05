// MiniApp Quiz - React ESM version
import React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

export function startQuizApp(container) {
  const App = () => {
    const [started, setStarted] = React.useState(false);

    return (
      <div style={{ padding: '20px', color: 'white' }}>
        <h1>Simulador de Perguntas</h1>
        {!started && (
          <button onClick={() => setStarted(true)}>Iniciar</button>
        )}
        {started && <p>Carregando perguntas...</p>}
      </div>
    );
  };

  createRoot(container).render(<App />);
}

// Auto-start when loaded by host
const mountPoint = document.getElementById('screen-apps');
if (mountPoint) startQuizApp(mountPoint);
