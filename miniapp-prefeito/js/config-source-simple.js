// MiniApp Prefeito — fonte simples (sem PIN), com cache offline e botão "Atualizar"
(() => {
  const KEY_CFG = 'prefeito.cfg';    // {sheetId, sheetName}
  const KEY_DB  = 'prefeito.cache';  // {rows:[], lastDate:'YYYY-MM-DD', count:n, updatedAt:epoch}

  const statusEl = document.getElementById('status');
  const previewEl= document.getElementById('preview');
  const btnConfig= document.getElementById('btnConfig');
  const btnUpdate= document.getElementById('btnUpdate');

  btnConfig.addEventListener('click', onConfig);
  btnUpdate.addEventListener('click', onUpdate);

  init();

  function init(){
    const cfg = readCfg();
    if (!cfg) {
      setStatus('Sem fonte definida — usando DEMO local.', true);
      loadDemo();
    } else {
      setStatus(`Fonte: planilha ${mask(cfg.sheetId)} / aba "${cfg.sheetName}".`, false);
      renderFromCacheOrDemo();
    }
  }

  function readCfg(){
    try { return JSON.parse(localStorage.getItem(KEY_CFG)); } catch { return null; }
  }
  function writeCfg(cfg){
    localStorage.setItem(KEY_CFG, JSON.stringify(cfg));
  }
  function readDb(){
    try { return JSON.parse(localStorage.getItem(KEY_DB)); } catch { return null; }
  }
  function writeDb(db){
    localStorage.setItem(KEY_DB, JSON.stringify(db));
  }
  function mask(id){ return id ? id.slice(0,4)+'…'+id.slice(-4) : ''; }

  function buildCsvUrl(sheetId, sheetName){
    // Requer planilha com permissão "Qualquer pessoa com o link - Leitor"
    // gviz CSV por nome da aba (evita depender de gid)
    const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq`;
    const params = new URLSearchParams({ tqx: 'out:csv', sheet: sheetName });
    return `${base}?${params.toString()}`;
  }

  async function onConfig(){
    const current = readCfg() || { sheetId: '', sheetName: '' };
    const sheetId = prompt('Informe o ID da planilha (docs.google.com/spreadsheets/d/ID/...):', current.sheetId || '');
    if (!sheetId) return;
    const sheetName = prompt('Informe o NOME da aba (ex.: fato_kpi_diario):', current.sheetName || 'fato_kpi_diario');
    if (!sheetName) return;
    writeCfg({ sheetId: sheetId.trim(), sheetName: sheetName.trim() });
    setStatus(`Fonte definida. Clique em "Atualizar" para buscar.`);
  }

  async function onUpdate(){
    const cfg = readCfg();
    if (!cfg) {
      setStatus('Defina a fonte primeiro. Usando DEMO local.', true);
      await loadDemo();
      return;
    }
    try {
      setStatus('Buscando CSV online…');
      const url = buildCsvUrl(cfg.sheetId, cfg.sheetName);
      const csv = await fetchCsv(url);
      const rows = parseCsv(csv);
      const lastDate = maxDate(rows, 'data');
      const db = readDb();
      if (!db || !db.lastDate || isNewer(lastDate, db.lastDate)) {
        writeDb({ rows, lastDate, count: rows.length, updatedAt: Date.now() });
        setStatus(`Atualizado. Última data: ${lastDate} — ${rows.length} linhas.`);
        renderPreview(rows);
      } else {
        setStatus(`Sem novidades. Última data permanece ${db.lastDate}.`);
        renderPreview(db.rows);
      }
    } catch (e) {
      console.error(e);
      setStatus('Falha ao atualizar online. Mantendo cache/DEMO.', true);
      renderFromCacheOrDemo();
    }
  }

  function setStatus(msg, warn=false){
    statusEl.textContent = msg;
    statusEl.style.color = warn ? 'var(--ma-danger, #ef4444)' : 'var(--ma-muted)';
  }

  function renderFromCacheOrDemo(){
    const db = readDb();
    if (db && db.rows && db.rows.length) {
      setStatus(`Cache: última data ${db.lastDate} — ${db.rows.length} linhas.`);
      renderPreview(db.rows);
    } else {
      loadDemo();
    }
  }

  async function loadDemo(){
    try {
      const res = await fetch('../miniapp-prefeito/data/demo_fato_kpi_diario.csv', { cache:'no-store' });
      const csv = await res.text();
      const rows = parseCsv(csv);
      const lastDate = maxDate(rows, 'data');
      writeDb({ rows, lastDate, count: rows.length, updatedAt: Date.now() });
      setStatus(`DEMO carregada. Última data ${lastDate} — ${rows.length} linhas.`);
      renderPreview(rows);
    } catch (e) {
      setStatus('Erro ao carregar DEMO local.', true);
      previewEl.textContent = '';
    }
  }

  function parseCsv(csv){
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const header = lines.shift().split(',');
    return lines.map(line => {
      const cols = line.split(',');
      const obj = {};
      header.forEach((h, i) => obj[h] = cols[i] ?? '');
      return obj;
    });
  }

  function renderPreview(rows){
    const max = 12;
    const subset = rows.slice(0, max);
    previewEl.textContent = JSON.stringify(subset, null, 2);
  }

  function maxDate(rows, key){
    let m = null;
    for (const r of rows) {
      const d = (r[key]||'').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      if (!m || d > m) m = d;
    }
    return m || '';
  }

  function isNewer(a,b){ return a && (!b || a > b); }
})();
