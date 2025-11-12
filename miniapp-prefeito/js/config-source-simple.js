// MiniApp Prefeito — múltiplas fontes salvas no navegador
(() => {
  const KEY_SOURCES = 'prefeito.sources';
  const KEY_ACTIVE = 'prefeito.activeSource';
  const KEY_DB = 'prefeito.cache';
  const KEY_CFG_OLD = 'prefeito.cfg';
  const TITLE = 'MiniApp Prefeito — Demo';

  const statusEl = document.getElementById('status');
  const previewWrapper = document.getElementById('previewWrapper');
  const previewEl = document.getElementById('preview');
  const btnUpdate = document.getElementById('btnUpdate');
  const btnAddSource = document.getElementById('btnAddSource');
  const sourceListEl = document.getElementById('sourceList');
  const sourcesEmptyEl = document.getElementById('sourcesEmpty');
  const activeSelectEl = document.getElementById('activeSourceSelect');
  const sourceDialog = document.getElementById('sourceDialog');
  const sourceForm = document.getElementById('sourceForm');
  const formMessageEl = document.getElementById('formMessage');
  const sourceIdInput = document.getElementById('sourceId');
  const sheetIdInput = document.getElementById('sheetId');
  const sheetNameInput = document.getElementById('sheetName');
  const btnCancelAdd = document.getElementById('btnCancelAdd');

  btnAddSource?.addEventListener('click', openSourceDialog);
  btnCancelAdd?.addEventListener('click', closeSourceDialog);
  sourceForm?.addEventListener('submit', onSubmitSource);
  sourceListEl?.addEventListener('change', onToggleSource);
  sourceListEl?.addEventListener('click', onRemoveSource);
  activeSelectEl?.addEventListener('change', onActiveChange);
  btnUpdate?.addEventListener('click', onUpdate);

  if (sourceDialog && typeof sourceDialog.addEventListener === 'function') {
    sourceDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeSourceDialog();
    });
    sourceDialog.addEventListener('close', () => {
      sourceForm?.reset();
      if (formMessageEl) formMessageEl.textContent = '';
    });
  }

  init();

  async function init() {
    const sources = getSources();
    ensureDbMigrated(sources);
    if (!getActiveSourceId()) {
      const firstEnabled = sources.find((s) => s.enabled);
      if (firstEnabled) setActiveSourceId(firstEnabled.id);
    }
    const state = renderSourcesPanel();
    const previewMessage = await renderFromCacheOrDemo(state);
    const fallbackMessage = previewMessage || (state.sources.length ? 'Selecione uma planilha ativa para visualizar os dados.' : 'Adicione uma planilha para começar.');
    setStatus(fallbackMessage, false, state);
    notifyHeader(state);
  }

  function openSourceDialog() {
    if (!sourceDialog) return;
    sourceForm?.reset();
    if (formMessageEl) formMessageEl.textContent = '';
    if (sourceIdInput) sourceIdInput.value = '';
    if (sheetNameInput && !sheetNameInput.value) sheetNameInput.value = 'fato_kpi_diario';
    if (typeof sourceDialog.showModal === 'function') {
      sourceDialog.showModal();
    } else {
      sourceDialog.setAttribute('open', 'true');
    }
    window.requestAnimationFrame(() => sheetIdInput?.focus());
  }

  function closeSourceDialog() {
    if (!sourceDialog) return;
    if (typeof sourceDialog.close === 'function') {
      sourceDialog.close();
    } else {
      sourceDialog.removeAttribute('open');
    }
    sourceForm?.reset();
    if (formMessageEl) formMessageEl.textContent = '';
    btnAddSource?.focus();
  }

  async function onSubmitSource(event) {
    event.preventDefault();
    if (!sourceForm) return;
    if (formMessageEl) formMessageEl.textContent = '';

    const data = new FormData(sourceForm);
    let id = (data.get('sourceId') || '').toString().trim();
    const sheetId = (data.get('sheetId') || '').toString().trim();
    const sheetName = (data.get('sheetName') || '').toString().trim();

    if (!sheetId || !sheetName) {
      if (formMessageEl) formMessageEl.textContent = 'Informe o ID da planilha e o nome da aba.';
      return;
    }

    const current = getSources();
    const takenIds = current.map((s) => s.id);
    let normalizedId = '';
    if (id) {
      normalizedId = normalizeId(id);
      if (!normalizedId) {
        if (formMessageEl) formMessageEl.textContent = 'Use letras, números, hífen ou sublinhado no identificador.';
        return;
      }
    } else {
      normalizedId = createSourceId(sheetName, takenIds);
    }

    if (takenIds.includes(normalizedId)) {
      if (formMessageEl) formMessageEl.textContent = 'Já existe uma planilha com esse identificador.';
      return;
    }

    const nextSources = [...current, { id: normalizedId, sheetId, sheetName, enabled: true }];
    saveSources(nextSources);
    setActiveSourceId(normalizedId);
    closeSourceDialog();
    await refresh({ message: 'Planilha salva. Clique em “Atualizar” para buscar.' });
  }

  async function onToggleSource(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset.role !== 'toggle-enabled') return;
    const id = target.dataset.id;
    if (!id) return;

    const sources = getSources();
    const idx = sources.findIndex((s) => s.id === id);
    if (idx === -1) return;

    sources[idx].enabled = target.checked;
    saveSources(sources);
    if (!target.checked && getActiveSourceId() === id) {
      setActiveSourceId('');
    }
    await refresh({ message: target.checked ? 'Planilha habilitada.' : 'Planilha desabilitada.' });
  }

  async function onRemoveSource(event) {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.dataset.role !== 'remove') return;
    const id = target.dataset.id;
    if (!id) return;

    const remaining = getSources().filter((s) => s.id !== id);
    saveSources(remaining);
    deleteCacheFor(id);
    if (getActiveSourceId() === id) {
      setActiveSourceId('');
    }
    await refresh({ message: 'Planilha removida.' });
  }

  async function onActiveChange(event) {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;
    const id = select.value;
    if (!id) {
      setActiveSourceId('');
      await refresh({ message: 'Nenhuma planilha ativa selecionada.' });
      return;
    }
    setActiveSourceId(id);
    await refresh({ message: 'Fonte ativa atualizada.' });
  }

  async function onUpdate() {
    const stateBefore = renderSourcesPanel();
    const active = stateBefore.active;
    if (!active) {
      setStatus('Selecione uma planilha ativa antes de atualizar.', true, stateBefore);
      hidePreview();
      notifyHeader(stateBefore);
      return;
    }

    if (btnUpdate) {
      btnUpdate.disabled = true;
      btnUpdate.setAttribute('aria-busy', 'true');
    }

    try {
      setStatus('Buscando CSV online…', false, stateBefore);
      const url = buildCsvUrl(active.sheetId, active.sheetName);
      const csv = await fetchCsv(url);
      const rows = parseCsv(csv);
      const lastDate = maxDate(rows, 'data');
      const currentCache = getCacheFor(active.id);
      const nextCache = { rows, lastDate, count: rows.length, updatedAt: Date.now() };

      if (!currentCache || !currentCache.lastDate || isNewer(lastDate, currentCache.lastDate)) {
        saveCacheFor(active.id, nextCache);
        renderPreview(rows);
        const msg = lastDate ? `Atualizado. Última data: ${lastDate} — ${rows.length} linhas.` : `Atualizado. ${rows.length} linhas encontradas.`;
        await refresh({ message: msg, includePreviewMessage: false });
      } else {
        renderPreview(currentCache.rows || []);
        const msg = currentCache.lastDate ? `Sem novidades. Última data permanece ${currentCache.lastDate}.` : 'Sem novidades no CSV remoto.';
        await refresh({ message: msg, includePreviewMessage: false });
      }
    } catch (error) {
      console.error(error);
      await refresh({ message: 'Falha ao atualizar online.', warn: true });
    } finally {
      if (btnUpdate) {
        btnUpdate.removeAttribute('aria-busy');
      }
    }
  }

  async function refresh({ message = '', warn = false, includePreviewMessage = true } = {}) {
    const state = renderSourcesPanel();
    let previewMessage = '';
    if (includePreviewMessage) {
      previewMessage = await renderFromCacheOrDemo(state);
    }
    const text = [message, previewMessage].filter(Boolean).join(' ').trim();
    setStatus(text, warn, state);
    notifyHeader(state);
    return state;
  }

  function renderSourcesPanel() {
    const sources = getSources();
    let activeId = getActiveSourceId();
    let active = pickActive(sources, activeId);
    const enabledCount = sources.filter((s) => s.enabled).length;

    if (activeId && !active) {
      localStorage.removeItem(KEY_ACTIVE);
      activeId = '';
    }

    if (sourcesEmptyEl) sourcesEmptyEl.hidden = sources.length > 0;
    if (sourceListEl) {
      sourceListEl.innerHTML = '';
      if (sources.length) {
        const frag = document.createDocumentFragment();
        sources.forEach((src) => frag.appendChild(createSourceListItem(src, activeId)));
        sourceListEl.appendChild(frag);
        sourceListEl.hidden = false;
      } else {
        sourceListEl.hidden = true;
      }
    }

    if (activeSelectEl) {
      activeSelectEl.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = enabledCount ? 'Nenhuma planilha ativa' : 'Nenhuma planilha habilitada';
      activeSelectEl.appendChild(placeholder);
      if (!enabledCount) {
        activeSelectEl.value = '';
        activeSelectEl.disabled = true;
      } else {
        activeSelectEl.disabled = false;
        sources.filter((s) => s.enabled).forEach((src) => {
          const opt = document.createElement('option');
          opt.value = src.id;
          const masked = mask(src.sheetId);
          const label = src.sheetName || src.id;
          opt.textContent = masked ? `${label} — ${masked}` : label;
          if (src.id === activeId) opt.selected = true;
          activeSelectEl.appendChild(opt);
        });
        if (activeId) {
          activeSelectEl.value = activeId;
        } else {
          activeSelectEl.value = '';
        }
      }
    }

    if (btnUpdate) {
      btnUpdate.disabled = !active;
    }

    return { sources, active, activeId, enabledCount };
  }

  async function renderFromCacheOrDemo(state) {
    const sources = state?.sources ?? getSources();
    const active = state?.active ?? pickActive(sources, state?.activeId || getActiveSourceId());
    if (!active) {
      hidePreview();
      if (!sources.length) return 'Nenhuma planilha cadastrada.';
      const enabled = sources.filter((s) => s.enabled).length;
      return enabled ? 'Nenhuma planilha ativa.' : 'Todas as planilhas estão desabilitadas.';
    }

    const cache = getCacheFor(active.id);
    if (cache && Array.isArray(cache.rows) && cache.rows.length) {
      renderPreview(cache.rows);
      if (cache.demo) {
        const detail = cache.lastDate ? `Última data ${cache.lastDate} — ${cache.rows.length} linhas.` : `${cache.rows.length} linhas.`;
        return `DEMO carregada. ${detail}`;
      }
      const detail = cache.lastDate ? `Última data ${cache.lastDate} — ${cache.rows.length} linhas.` : `${cache.rows.length} linhas.`;
      return `Cache disponível. ${detail}`;
    }

    const demo = await loadDemo(active.id);
    if (demo && Array.isArray(demo.rows) && demo.rows.length) {
      renderPreview(demo.rows);
      const detail = demo.lastDate ? `Última data ${demo.lastDate} — ${demo.rows.length} linhas.` : `${demo.rows.length} linhas.`;
      return `DEMO carregada. ${detail}`;
    }

    hidePreview();
    return 'Sem dados em cache. Clique em “Atualizar” para buscar.';
  }

  function createSourceListItem(source, activeId) {
    const item = document.createElement('li');
    item.className = 'surface';
    item.dataset.id = source.id;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'space-between';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '12px';
    wrapper.style.alignItems = 'center';

    const info = document.createElement('div');
    info.style.flex = '1';
    info.style.minWidth = '200px';
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '4px';

    const title = document.createElement('strong');
    title.textContent = source.sheetName || source.id;

    const idLine = document.createElement('div');
    idLine.className = 'muted';
    idLine.textContent = `Identificador: ${source.id}`;

    const sheetLine = document.createElement('div');
    sheetLine.className = 'muted';
    const masked = mask(source.sheetId);
    sheetLine.textContent = masked ? `Planilha: ${masked}` : 'Planilha não informada';

    info.append(title, idLine, sheetLine);

    const actions = document.createElement('div');
    actions.className = 'cluster';
    actions.style.gap = '12px';
    actions.style.alignItems = 'center';
    actions.style.flexWrap = 'wrap';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'muted';
    toggleLabel.style.display = 'flex';
    toggleLabel.style.alignItems = 'center';
    toggleLabel.style.gap = '6px';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.dataset.role = 'toggle-enabled';
    toggle.dataset.id = source.id;
    toggle.checked = !!source.enabled;

    toggleLabel.append(toggle, document.createTextNode('Habilitada'));

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn';
    removeBtn.dataset.role = 'remove';
    removeBtn.dataset.id = source.id;
    removeBtn.textContent = 'Remover';

    actions.append(toggleLabel, removeBtn);
    wrapper.append(info, actions);
    item.append(wrapper);

    if (activeId && source.id === activeId) {
      item.setAttribute('aria-current', 'true');
    } else {
      item.removeAttribute('aria-current');
    }

    return item;
  }

  function setStatus(message = '', warn = false, state) {
    if (!statusEl) return;
    const sources = state?.sources ?? getSources();
    const active = state?.active ?? pickActive(sources, state?.activeId || getActiveSourceId());
    const enabledCount = state?.enabledCount ?? sources.filter((s) => s.enabled).length;

    let prefix = '';
    if (!sources.length) {
      prefix = 'Nenhuma planilha salva.';
    } else {
      const plural = sources.length > 1 ? 's' : '';
      const label = sources.length > 1 ? 'planilhas' : 'planilha';
      if (active) {
        const masked = mask(active.sheetId);
        const descriptor = masked ? `${active.sheetName || active.id} (${masked})` : (active.sheetName || active.id);
        prefix = `${sources.length} ${label} salva${plural}, exibindo ${descriptor}.`;
      } else if (enabledCount) {
        const enabledLabel = enabledCount === 1 ? '1 habilitada' : `${enabledCount} habilitadas`;
        prefix = `${sources.length} ${label} salva${plural}, ${enabledLabel} e nenhuma ativa.`;
      } else {
        prefix = `${sources.length} ${label} salva${plural}, todas desabilitadas.`;
      }
    }

    const text = [prefix, message].filter(Boolean).join(' ').trim();
    statusEl.textContent = text;
    statusEl.style.color = warn ? 'var(--ma-danger, #ef4444)' : 'var(--ma-muted)';
  }

  function notifyHeader(state) {
    if (!window.parent || typeof window.parent.postMessage !== 'function') return;
    const sources = state?.sources ?? getSources();
    const active = state?.active ?? pickActive(sources, state?.activeId || getActiveSourceId());
    let subtitle = '';
    if (active) {
      const masked = mask(active.sheetId);
      subtitle = masked ? `${active.sheetName || active.id} (${masked})` : (active.sheetName || active.id);
    } else if (!sources.length) {
      subtitle = 'Cadastre uma planilha para começar';
    } else {
      subtitle = 'Nenhuma planilha ativa';
    }
    window.parent.postMessage({ action: 'miniapp-header', title: TITLE, subtitle }, '*');
  }

  function hidePreview() {
    if (previewWrapper) previewWrapper.hidden = true;
    if (previewEl) previewEl.textContent = '';
  }

  function renderPreview(rows) {
    if (!previewWrapper || !previewEl) return;
    previewWrapper.hidden = false;
    const max = 12;
    const subset = Array.isArray(rows) ? rows.slice(0, max) : [];
    previewEl.textContent = JSON.stringify(subset, null, 2);
  }

  function getSources() {
    const stored = readJson(KEY_SOURCES);
    let list = Array.isArray(stored) ? stored.map(sanitizeSource).filter(Boolean) : [];

    if (!list.length) {
      const legacy = readJson(KEY_CFG_OLD);
      if (legacy && typeof legacy === 'object' && legacy.sheetId) {
        const legacyId = createSourceId(legacy.sheetName || legacy.sheetId, []);
        const sheetId = (legacy.sheetId || '').toString().trim();
        const sheetName = (legacy.sheetName || '').toString().trim();
        list = [{ id: legacyId, sheetId, sheetName, enabled: true }];
        saveSources(list);
        setActiveSourceId(legacyId);
        migrateLegacyDb(legacyId);
      }
    }

    localStorage.removeItem(KEY_CFG_OLD);
    return list;
  }

  function saveSources(sources) {
    const seen = new Set();
    const sanitized = [];
    for (const src of sources) {
      const clean = sanitizeSource(src);
      if (!clean) continue;
      if (seen.has(clean.id)) continue;
      seen.add(clean.id);
      sanitized.push(clean);
    }
    localStorage.setItem(KEY_SOURCES, JSON.stringify(sanitized));
    return sanitized;
  }

  function setActiveSourceId(id) {
    if (!id) {
      localStorage.removeItem(KEY_ACTIVE);
      return;
    }
    const sources = getSources();
    const match = sources.find((s) => s.id === id && s.enabled);
    if (!match) {
      localStorage.removeItem(KEY_ACTIVE);
      return;
    }
    localStorage.setItem(KEY_ACTIVE, id);
  }

  function getActiveSourceId() {
    const value = localStorage.getItem(KEY_ACTIVE);
    return value ? value.toString() : '';
  }

  function pickActive(sources, activeId) {
    if (!Array.isArray(sources) || !activeId) return null;
    return sources.find((s) => s.id === activeId && s.enabled) || null;
  }

  function sanitizeSource(source) {
    if (!source || typeof source !== 'object') return null;
    const id = (source.id || '').toString().trim();
    if (!id) return null;
    const sheetId = (source.sheetId || '').toString().trim();
    const sheetName = (source.sheetName || '').toString().trim();
    const enabled = !!source.enabled;
    return { id, sheetId, sheetName, enabled };
  }

  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function migrateLegacyDb(targetId) {
    if (!targetId) return;
    const raw = readJson(KEY_DB);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
    if (!Array.isArray(raw.rows)) return;
    const map = { [targetId]: raw };
    writeDbStore(map);
  }

  function ensureDbMigrated(sources) {
    const raw = readJson(KEY_DB);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
    if (!Array.isArray(raw.rows)) return;
    const target = Array.isArray(sources) && sources.length === 1 ? sources[0] : null;
    if (!target) return;
    writeDbStore({ [target.id]: raw });
  }

  function readDbStore() {
    const raw = readJson(KEY_DB);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return raw;
  }

  function writeDbStore(store) {
    localStorage.setItem(KEY_DB, JSON.stringify(store));
  }

  function getCacheFor(sourceId) {
    const store = readDbStore();
    const entry = store[sourceId];
    if (!entry || typeof entry !== 'object') return null;
    if (!Array.isArray(entry.rows)) return null;
    return entry;
  }

  function saveCacheFor(sourceId, entry) {
    const store = readDbStore();
    store[sourceId] = entry;
    writeDbStore(store);
  }

  function deleteCacheFor(sourceId) {
    const store = readDbStore();
    if (Object.prototype.hasOwnProperty.call(store, sourceId)) {
      delete store[sourceId];
      writeDbStore(store);
    }
  }

  async function loadDemo(targetId) {
    try {
      const res = await fetch('../miniapp-prefeito/data/demo_fato_kpi_diario.csv', { cache: 'no-store' });
      if (!res.ok) return null;
      const csv = await res.text();
      const rows = parseCsv(csv);
      const lastDate = maxDate(rows, 'data');
      const payload = { rows, lastDate, count: rows.length, updatedAt: Date.now(), demo: true };
      if (targetId) saveCacheFor(targetId, payload);
      return payload;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function buildCsvUrl(sheetId, sheetName) {
    const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq`;
    const params = new URLSearchParams({ tqx: 'out:csv', sheet: sheetName });
    return `${base}?${params.toString()}`;
  }

  async function fetchCsv(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  function parseCsv(csv) {
    const lines = csv.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const header = lines.shift().split(',');
    return lines.map((line) => {
      const cols = line.split(',');
      const obj = {};
      header.forEach((h, i) => {
        obj[h] = cols[i] ?? '';
      });
      return obj;
    });
  }

  function maxDate(rows, key) {
    let max = '';
    for (const row of rows) {
      const value = (row[key] || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) continue;
      if (!max || value > max) max = value;
    }
    return max;
  }

  function isNewer(a, b) {
    return a && (!b || a > b);
  }

  function mask(id) {
    if (!id) return '';
    const value = id.toString().trim();
    if (value.length <= 8) return value;
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
  }

  function normalizeId(value) {
    if (!value) return '';
    return value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 64);
  }

  function createSourceId(sheetName, taken = []) {
    const base = normalizeId(sheetName) || 'fonte';
    const used = new Set(taken);
    let candidate = base;
    let suffix = 1;
    while (used.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }
})();
