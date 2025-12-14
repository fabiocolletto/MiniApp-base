import { createRenderer } from '../core/renderer.js';
import { DataOrchestrator } from '../tools/data-orchestrator.js';

(function () {
  'use strict';

    /* ========================== ELEMENTOS ========================== */
    const Renderer = createRenderer({ rootId: 'app' });
    Renderer.ensureShell();

    const STAGE = Renderer.getStage();
    const FOOTER = document.getElementById('pwao-footer');

    const BTN_BACK = document.getElementById('btn-back');
    const BTN_USER = document.getElementById('btn-user');
    const HEADER_TITLE = document.getElementById('pwao-title');

    /* ========================== ESTADO ========================== */
    let CURRENT_SCREEN = null;
    const HISTORY = [];

    /* ========================== RENDER ========================== */
    function renderStage(html, opts = {}) {
      Renderer.render(html, opts);
    }

    function setHeaderTitle(title) {
      Renderer.setTitle(title);
    }

    function updateBackVisibility() {
      if (!BTN_BACK) return;
      BTN_BACK.style.visibility = HISTORY.length ? 'visible' : 'hidden';
    }

    function goBack() {
      const prev = HISTORY.pop();
      if (!prev) {
        updateBackVisibility();
        return;
      }
      // Voltar não empilha histórico
      CURRENT_SCREEN = null;
      navigate(prev, { pushHistory: false });
    }

    function renderFooter(buttons = []) {
      // Reservado (hoje oculto)
      FOOTER.innerHTML = (buttons || []).map(btn =>
        `<button data-screen="${btn.screen || ''}" data-celula="${btn.celula || ''}">${btn.label}</button>`
      ).join('');
    }

    /* ========================== MEMÓRIA (IndexedDB + fallback) ========================== */
    const Memory = (() => {
      const DB = 'pwao-organism';
      let db = null;
      const mem = new Map();

      function open() {
        if (!('indexedDB' in window)) {
          console.warn('IndexedDB indisponível neste ambiente. Usando memória volátil.');
          db = null;
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          const req = indexedDB.open(DB, 1);
          req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('cells')) {
              d.createObjectStore('cells', { keyPath: 'nome' });
            }
          };
          req.onsuccess = () => { db = req.result; resolve(); };
          req.onerror = () => {
            console.warn('Falha ao abrir IndexedDB. Usando memória volátil.');
            db = null;
            resolve();
          };
        });
      }

      function saveCell(c) {
        if (!c?.nome) return Promise.resolve();
        mem.set(c.nome, c);

        if (!db) return Promise.resolve();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('cells', 'readwrite');
          const store = tx.objectStore('cells');
          const req = store.put(c);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }

      function getCell(n) {
        if (!n) return Promise.resolve(null);

        if (mem.has(n)) return Promise.resolve(mem.get(n));
        if (!db) return Promise.resolve(null);

        return new Promise((resolve) => {
          const tx = db.transaction('cells', 'readonly');
          const store = tx.objectStore('cells');
          const req = store.get(n);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      }

      return { open, saveCell, getCell };
    })();

    /* ========================== NARRADOR (Event Bus) ========================== */
    const Narrador = (() => {
      const map = {};
      return {
        on(tipo, fn) { (map[tipo] ||= []).push(fn); },
        emitir(evt) {
          const list = map[evt.tipo] || [];
          list.forEach((f) => {
            try { f(evt); } catch (e) { console.warn(e); }
          });
        }
      };
    })();

    window.Narrador = Narrador;

    /* ========================== API PÚBLICA (CÉLULAS) ========================== */
    window.PWAO_RegistrarCelula = async (m) => {
      if (!m?.nome || !m?.caminho) return;
      await Memory.saveCell({
        nome: m.nome,
        caminho: m.caminho,
        orgao: m.orgao || null,
        versao: m.versao || '0.0.0',
        descricao: m.descricao || ''
      });
    };

    /* ========================== EXPRESSÃO DE CÉLULAS ========================== */
    async function fetchWithFallback(cell) {
      async function tryFetch(url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch-failed');
        return res.text();
      }

      try {
        return await tryFetch(cell.caminho);
      } catch (e) {
        if (cell.fallback) {
          try {
            return await tryFetch(cell.fallback);
          } catch (_) {}
        }
        throw new Error('all-fetch-failed');
      }
    }

    async function expressarCelula(nome) {
      const cell = await Memory.getCell(nome);
      if (!cell) {
        renderStage(`<div class="error">Célula não registrada: <b>${nome}</b></div>`);
        return;
      }

      try {
        const html = await fetchWithFallback(cell);
        renderStage(html);
      } catch (e) {
        renderStage(`<div class="error">Falha ao carregar célula: <b>${nome}</b><br><small>${cell.caminho}</small></div>`);
      }
    }

    Narrador.on('celula.expressar', (e) => expressarCelula(e.nome));

    /* ========================== DATA_SCREENS (telas geradas) ========================== */
    const DATA_SCREENS = {
      'finance.income.single': {
        title: 'Receita Avulsa',
        fields: [
          { name: 'descricao', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex: Bico, venda, reembolso' },
          { name: 'valor', label: 'Valor', type: 'number', required: true, placeholder: 'Ex: 150.00' },
          { name: 'data', label: 'Data', type: 'date', required: true }
        ]
      },
      'finance.income.recurring': {
        title: 'Receita Recorrente',
        fields: [
          { name: 'descricao', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex: Salário, aluguel' },
          { name: 'valor', label: 'Valor', type: 'number', required: true, placeholder: 'Ex: 2500.00' },
          { name: 'dia', label: 'Dia do mês', type: 'number', required: true, placeholder: 'Ex: 5' }
        ]
      },
      'finance.expense.single': {
        title: 'Despesa Avulsa',
        fields: [
          { name: 'descricao', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex: Mercado, farmácia' },
          { name: 'valor', label: 'Valor', type: 'number', required: true, placeholder: 'Ex: 80.00' },
          { name: 'data', label: 'Data', type: 'date', required: true }
        ]
      },
      'finance.expense.recurring': {
        title: 'Despesa Recorrente',
        fields: [
          { name: 'descricao', label: 'Descrição', type: 'text', required: true, placeholder: 'Ex: Internet, escola' },
          { name: 'valor', label: 'Valor', type: 'number', required: true, placeholder: 'Ex: 120.00' },
          { name: 'dia', label: 'Dia do mês', type: 'number', required: true, placeholder: 'Ex: 10' }
        ]
      },
      'user.profile': {
        title: 'Perfil do Usuário',
        fields: [
          { name: 'name', label: 'Nome completo', type: 'text', required: true, placeholder: 'Seu nome' },
          { name: 'email', label: 'E-mail', type: 'email', required: true, placeholder: 'email@exemplo.com' },
          { name: 'birth', label: 'Data de nascimento', type: 'date' },
          { name: 'phone', label: 'Telefone', type: 'tel', placeholder: '(00) 00000-0000' }
        ]
      }
    };

    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }

    function renderDataForm(spec, routeKey) {
      const fields = (spec.fields || []).map((f) => {
        const id = `f_${routeKey}_${f.name}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const required = f.required ? 'required' : '';
        const placeholder = f.placeholder ? `placeholder="${escapeHtml(f.placeholder)}"` : '';
        const value = f.value ? `value="${escapeHtml(f.value)}"` : '';

        return `
          <div class="field">
            <label for="${id}">${escapeHtml(f.label || f.name)}</label>
            <input id="${id}" name="${escapeHtml(f.name)}" type="${escapeHtml(f.type || 'text')}" ${required} ${placeholder} ${value} />
          </div>
        `;
      }).join('');

      renderStage(`
        <div>
          <div style="text-align:center; font-weight:700; margin-bottom:8px;">${escapeHtml(spec.title || 'Cadastro')}</div>
          <div style="text-align:center; color:#6b7280; font-size:13px; margin-bottom:16px;">Tela gerada pelo Genoma (data.*). Persistência ativada via DataOrchestrator.</div>
          <form class="form" id="data-form">
            ${fields}
            <button class="primary" type="submit">Salvar</button>
          </form>
        </div>
      `);

      const form = document.getElementById('data-form');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());

        const recordId = crypto.randomUUID();

        try {
          const saved = await DataOrchestrator.dispatch({
            action: 'create',
            collection: routeKey,
            payload,
            recordId
          });

          const persistedCollection = await DataOrchestrator.getPersistedCollection(routeKey);
          const persistedSnapshot = Array.isArray(persistedCollection)
            ? persistedCollection.find((item) => item.id === recordId)
            : persistedCollection;

          const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
          const valorFormatado = payload.valor ? currency.format(Number(payload.valor)) : '—';
          const dataFormatada = payload.data
            ? new Date(payload.data).toLocaleDateString('pt-BR')
            : (payload.dia ? `Todo dia ${payload.dia}` : 'Sem data');
          const descricao = payload.descricao || payload.description || 'Sem descrição';

          renderStage(`
            <div style="padding:16px; display:flex; justify-content:center;">
              <div style="background:#ffffff; border-radius:14px; padding:20px; width:100%; max-width:420px; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                  <div style="font-size:26px;">✅</div>
                  <div>
                    <div style="font-weight:700; font-size:18px;">Receita registrada!</div>
                    <div style="color:#6b7280; font-size:13px;">Guardamos suas informações com segurança.</div>
                  </div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">💸</span>
                    <div>
                      <div style="font-size:12px; color:#6b7280;">Valor</div>
                      <div style="font-weight:700; font-size:16px;">${escapeHtml(valorFormatado)}</div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">📅</span>
                    <div>
                      <div style="font-size:12px; color:#6b7280;">Data</div>
                      <div style="font-weight:600; font-size:14px;">${escapeHtml(dataFormatada)}</div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:18px;">📝</span>
                    <div>
                      <div style="font-size:12px; color:#6b7280;">Descrição</div>
                      <div style="font-size:14px;">${escapeHtml(descricao)}</div>
                    </div>
                  </div>
                </div>

                ${persistedSnapshot ? `<pre style="margin-top:12px; background:#f1f5f9; padding:12px; border-radius:10px; border:1px solid #e2e8f0; font-size:12px; overflow:auto;">${escapeHtml(JSON.stringify(persistedSnapshot, null, 2))}</pre>` : ''}

                <div style="display:flex; flex-direction:column; gap:10px; margin-top:14px;">
                  <button id="btn-add-another" class="primary" style="padding:12px 14px;">Adicionar outra receita</button>
                  <button id="btn-back-finance" style="padding:12px 14px; background:#e5e7eb; border:none; border-radius:10px; font-weight:600;">Voltar para Finanças</button>
                </div>
              </div>
            </div>
          `);

          const addAnother = document.getElementById('btn-add-another');
          const backFinance = document.getElementById('btn-back-finance');

          if (addAnother) addAnother.onclick = () => renderDataForm(spec, routeKey);
          if (backFinance) backFinance.onclick = () => navigate('finance');
        } catch (err) {
          console.error('[data.* submit] erro', err);
          renderStage('<div class="error">Falha ao salvar os dados. Tente novamente.</div>');
        }
      });
    }

    function ScreenFactory(target) {
      if (!target.startsWith('data.')) return false;

      const routeKey = target.replace(/^data\./, '');
      const spec = DATA_SCREENS[routeKey];

      if (!spec) {
        setHeaderTitle('Cadastro');
        renderStage(`<div class="error">Tela data não registrada: <b>${escapeHtml(routeKey)}</b></div>`);
        return true;
      }

      setHeaderTitle(spec.title);
      renderDataForm(spec, routeKey);
      return true;
    }

    /* ========================== TELAS NATIVAS (v1) ========================== */
    const SCREENS = {
      _meta: {
        welcome:   { title: 'Bem-vindo' },
        dashboard: { title: 'Dashboard' },
        finance:   { title: 'Finanças' },
        education: { title: 'Educação' },
        health:    { title: 'Saúde' },
        alerts:    { title: 'Alertas' },
        settings:  { title: 'Configurações' },
        offline:   { title: 'Offline' },
        error:     { title: 'Erro' }
      },

      welcome() {
        setHeaderTitle(SCREENS._meta.welcome.title);

        renderStage(`
          <div class="welcome">
            <div class="welcome-box">
              <div class="icon" style="font-size:48px; margin-bottom:12px;">🚀</div>
              <h1>Bem-vindo</h1>
              <p>Seu painel inteligente começa aqui</p>
              <div class="welcome-actions">
                <button id="btn-start">Entrar</button>
              </div>
            </div>
          </div>
        `);
        const btnStart = document.getElementById('btn-start');
        if (btnStart) btnStart.onclick = () => navigate('dashboard');
      },

      dashboard() {
        setHeaderTitle(SCREENS._meta.dashboard.title);
        renderStage(`
          <div class="grid">
            <button class="card tone-finance" data-action="render" data-target="finance">
              <div class="icon">💰</div>
              <div>Finanças</div>
            </button>
            <button class="card tone-education" data-action="render" data-target="education">
              <div class="icon">🎓</div>
              <div>Educação</div>
            </button>
            <button class="card tone-health" data-action="render" data-target="health">
              <div class="icon">🏥</div>
              <div>Saúde</div>
            </button>
            <button class="card tone-settings" data-action="render" data-target="settings">
              <div class="icon">⚙️</div>
              <div>Configurações</div>
            </button>
          </div>
        `);
      },

      finance() {
        setHeaderTitle(SCREENS._meta.finance.title);
        renderStage(`
          <div class="grid">
            <button class="card finance-income" data-action="render" data-target="data.finance.income.single">
              <div class="icon">➕</div>
              <div>Receitas Avulsas</div>
            </button>
            <button class="card finance-income" data-action="render" data-target="data.finance.income.recurring">
              <div class="icon">🔁</div>
              <div>Receitas Recorrentes</div>
            </button>
            <button class="card finance-expense" data-action="render" data-target="data.finance.expense.single">
              <div class="icon">➖</div>
              <div>Despesas Avulsas</div>
            </button>
            <button class="card finance-expense" data-action="render" data-target="data.finance.expense.recurring">
              <div class="icon">🔁</div>
              <div>Despesas Recorrentes</div>
            </button>
            <button class="card finance-report" data-action="render" data-target="finance.reports">
              <div class="icon">📈</div>
              <div>Relatórios</div>
            </button>
            <button class="card" data-action="render" data-target="finance.settings">
              <div class="icon">⚙️</div>
              <div>Ajustes</div>
            </button>
          </div>
        `);
      },

      education() {
        setHeaderTitle(SCREENS._meta.education.title);
        renderStage(`
          <div class="grid">
            <button class="card edu-study" data-action="render" data-target="education.study">
              <div class="icon">📚</div>
              <div>Estudos do Dia</div>
            </button>
            <button class="card edu-exam" data-action="render" data-target="education.exam">
              <div class="icon">📝</div>
              <div>Provas & Avaliações</div>
            </button>
            <button class="card edu-contest" data-action="render" data-target="education.contest">
              <div class="icon">🏆</div>
              <div>Concursos</div>
            </button>
            <button class="card edu-agenda" data-action="render" data-target="education.agenda">
              <div class="icon">📅</div>
              <div>Agenda Escolar</div>
            </button>
            <button class="card edu-task" data-action="render" data-target="education.tasks">
              <div class="icon">✅</div>
              <div>Tarefas de Casa</div>
            </button>
            <button class="card edu-sim" data-action="render" data-target="education.simulations">
              <div class="icon">⏱️</div>
              <div>Simulados</div>
            </button>
          </div>
        `);
      },

      health() {
        setHeaderTitle(SCREENS._meta.health.title);
        renderStage(`
          <div class="grid">
            <button class="card health-record" data-action="render" data-target="health.records">
              <div class="icon">📋</div>
              <div>Histórico Médico</div>
            </button>
            <button class="card health-appointment" data-action="render" data-target="health.appointments">
              <div class="icon">🩺</div>
              <div>Consultas</div>
            </button>
            <button class="card health-meds" data-action="render" data-target="health.meds">
              <div class="icon">💊</div>
              <div>Medicamentos</div>
            </button>
            <button class="card health-vaccine" data-action="render" data-target="health.vaccines">
              <div class="icon">💉</div>
              <div>Vacinas</div>
            </button>
            <button class="card health-exam" data-action="render" data-target="health.exams">
              <div class="icon">🧪</div>
              <div>Exames</div>
            </button>
            <button class="card health-reminder" data-action="render" data-target="health.reminders">
              <div class="icon">⏰</div>
              <div>Lembretes</div>
            </button>
          </div>
        `);
      },

      alerts() {
        setHeaderTitle(SCREENS._meta.alerts.title);
        renderStage('<div class="loading">Nenhum alerta no momento.</div>');
      },

      settings() {
        setHeaderTitle(SCREENS._meta.settings.title);
        renderStage(`
          <div class="grid">
            <button class="card" data-action="render" data-target="data.user.profile">
              <div class="icon">👤</div>
              <div>Perfil do Usuário</div>
            </button>
          </div>
        `);
      },

      offline() {
        setHeaderTitle(SCREENS._meta.offline.title);
        renderStage('<div class="error">Você está offline.</div>');
      },

      error() {
        setHeaderTitle(SCREENS._meta.error.title);
        renderStage('<div class="error">Ocorreu um erro inesperado.</div>');
      }
    };

    /* ========================== ERRO PREVISTO (Educação) ========================== */
    function renderEducationPlanned() {
      setHeaderTitle('Educação');
      renderStage(`
        <div class="welcome">
          <div class="welcome-box">
            <div class="icon" style="font-size:40px; margin-bottom:12px;">🚧</div>
            <h1>Em implantação</h1>
            <p>Este recurso educacional está previsto no sistema e será disponibilizado em breve.</p>
            <button id="btn-back-education">Voltar ao painel Educação</button>
          </div>
        </div>
      `);

      const backBtn = document.getElementById('btn-back-education');
      if (backBtn) backBtn.onclick = () => navigate('education');
    }

    /* ========================== NAVEGAÇÃO (v1) ========================== */
    function navigate(screen, opts = { pushHistory: true }) {
      // Histórico
      if (opts.pushHistory !== false) {
        if (CURRENT_SCREEN && screen !== CURRENT_SCREEN) {
          HISTORY.push(CURRENT_SCREEN);
        }
      }

      // Tela nativa
      if (typeof SCREENS[screen] === 'function') {
        CURRENT_SCREEN = screen;
        SCREENS[screen]();
        updateBackVisibility();
        return;
      }

      // Erro previsto: Educação (apenas education.*)
      if (typeof screen === 'string' && screen.startsWith('education.')) {
        CURRENT_SCREEN = 'education';
        renderEducationPlanned();
        updateBackVisibility();
        return;
      }

      // Tela data.*
      if (typeof screen === 'string' && ScreenFactory(screen)) {
        CURRENT_SCREEN = screen;
        updateBackVisibility();
        return;
      }

      // Qualquer outra coisa vira célula (expressar)
      CURRENT_SCREEN = screen;
      Narrador.emitir({ tipo: 'celula.expressar', nome: screen });
      updateBackVisibility();
    }

    /* ========================== CLIQUES (renderizador) ========================== */
    if (STAGE) {
      STAGE.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="render"]');
        if (!btn) return;

        const target = btn.dataset.target;
        if (!target) return;

        // 1) Tela nativa
        if (typeof SCREENS[target] === 'function') {
          navigate(target);
          return;
        }

        // 2) Tela gerada pelo Genoma
        if (ScreenFactory(target)) {
          CURRENT_SCREEN = target;
          updateBackVisibility();
          return;
        }

        // 3) Erro previsto (Educação)
        if (target.startsWith('education.')) {
          navigate(target);
          return;
        }

        // 4) Célula
        CURRENT_SCREEN = target;
        Narrador.emitir({ tipo: 'celula.expressar', nome: target });
        updateBackVisibility();
      });
    }

    // Header
    if (BTN_BACK) BTN_BACK.addEventListener('click', goBack);
    if (BTN_USER) BTN_USER.addEventListener('click', () => navigate('data.user.profile'));

    // Footer reservado
    if (FOOTER) {
      FOOTER.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const screen = btn.dataset.screen;
        const celula = btn.dataset.celula;

        if (screen) navigate(screen);
        if (celula) Narrador.emitir({ tipo: 'celula.expressar', nome: celula });
      });
    }

    /* ========================== TESTES (SMOKE) ========================== */
    function runTests() {
      console.group('Genoma v2 – Tests');

      console.assert(typeof window.Narrador?.emitir === 'function', 'Narrador.emitir deve existir');
      console.assert(typeof window.PWAO_RegistrarCelula === 'function', 'PWAO_RegistrarCelula deve existir');
      console.assert(typeof SCREENS.welcome === 'function', 'Tela welcome deve existir');
      console.assert(typeof SCREENS.dashboard === 'function', 'Tela dashboard deve existir');
      console.assert(typeof SCREENS.finance === 'function', 'Tela finance deve existir');
      console.assert(typeof SCREENS.education === 'function', 'Tela education deve existir');
      console.assert(typeof SCREENS.health === 'function', 'Tela health deve existir');
      console.assert(HEADER_TITLE && HEADER_TITLE.textContent.length >= 0, 'Header title deve existir');

      setHeaderTitle('Teste');
      console.assert(HEADER_TITLE.textContent === 'Teste', 'setHeaderTitle deve atualizar o header');
      setHeaderTitle('PWAO');

      console.assert(ScreenFactory('data.finance.income.single') === true, 'ScreenFactory deve reconhecer data.*');
      console.assert(ScreenFactory('finance.income.single') === false, 'ScreenFactory não deve reconhecer sem prefixo');

      // Teste: erro previsto educação
      navigate('education.study');
      console.assert((HEADER_TITLE.textContent || '').includes('Educação'), 'Fallback educação deve manter título Educação');

      console.log('OK: smoke tests');
      console.groupEnd();

      // Volta para um estado previsível após os testes
      navigate('welcome', { pushHistory: false });
      HISTORY.length = 0;
      updateBackVisibility();
    }

      /* ========================== BOOT ========================== */
      (async function bootstrap() {
        renderStage('<div class="loading">Inicializando…</div>');

        await DataOrchestrator.init();
        await Memory.open();

        // Registro mínimo de células essenciais do sistema
        // Células – Saúde da Família (arquivos podem ser implantados depois)
        await window.PWAO_RegistrarCelula({
          nome: 'health.records',
          caminho: './products/health/records/index.html',
          descricao: 'Histórico médico da família'
        });

        await window.PWAO_RegistrarCelula({
          nome: 'health.meds',
          caminho: './products/health/meds/index.html',
          descricao: 'Controle de medicamentos'
        });

        await window.PWAO_RegistrarCelula({
          nome: 'health.appointments',
          caminho: './products/health/appointments/index.html',
          descricao: 'Consultas médicas'
        });

        await window.PWAO_RegistrarCelula({
          nome: 'health.vaccines',
          caminho: './products/health/vaccines/index.html',
          descricao: 'Carteira de vacinação'
        });

        await window.PWAO_RegistrarCelula({
          nome: 'health.exams',
          caminho: './products/health/exams/index.html',
          descricao: 'Exames e laudos'
        });

        await window.PWAO_RegistrarCelula({
          nome: 'health.reminders',
          caminho: './products/health/reminders/index.html',
          descricao: 'Lembretes de saúde'
        });

        runTests();
      })();

  })();
