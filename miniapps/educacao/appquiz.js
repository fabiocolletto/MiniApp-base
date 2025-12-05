// MiniApp Quiz - integrado ao app-quiz completo
import React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';
import App from '../../products/educacao/app-quiz/app-quiz.js';

export function startQuizApp(container) {
  if (!container) return;
  createRoot(container).render(React.createElement(App));
}

// Auto-start when loaded by host
const mountPoint = document.getElementById('screen-apps');
if (mountPoint) startQuizApp(mountPoint);
