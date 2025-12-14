// src/core/renderer.js
// Renderer responsável por montar o AppShell e trocar somente o conteúdo do root/stage
// mantendo mensagens de erro claras e layout consistente.

import { mount as mountAppShell } from './layout/AppShell.js';

export function createRenderer({ rootId = 'app', GENOMA = { MEMBERS: {} }, Orchestrator = { load: async () => {} } } = {}) {
  const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
  let mounted = false;
  let stageEl = null;
  let titleEl = null;

  function ensureShell() {
    if (mounted) return;
    mountAppShell(root, Orchestrator, GENOMA);
    stageEl = root?.querySelector('#pwao-stage');
    titleEl = root?.querySelector('#pwao-title');
    mounted = true;
  }

  function setTitle(title) {
    ensureShell();
    if (titleEl) titleEl.textContent = title || 'PWAO';
  }

  function render(html, opts = {}) {
    ensureShell();
    if (opts.title) setTitle(opts.title);
    if (stageEl) stageEl.innerHTML = html;
  }

  function renderError(message, title = 'Erro') {
    render(`<div class="error">${message}</div>`, { title });
  }

  function getStage() {
    ensureShell();
    return stageEl;
  }

  return { ensureShell, render, renderError, setTitle, getStage };
}
