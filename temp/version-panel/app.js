import {
  GITHUB_OWNER,
  GITHUB_REPO,
  DEFAULT_BRANCH,
  PREVIEW_PATH,
  MAX_BRANCHES,
} from './config.js';

const branchSelect = document.getElementById('branchSelect');
const previewFrame = document.getElementById('previewFrame');
const statusMessage = document.getElementById('statusMessage');
const detailBranch = document.getElementById('detailBranch');
const detailCommit = document.getElementById('detailCommit');
const detailAuthor = document.getElementById('detailAuthor');
const detailDate = document.getElementById('detailDate');
const detailMessage = document.getElementById('detailMessage');

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

function setStatus(type, message) {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  statusMessage.classList.add(`status--${type}`);
}

function resetPreview() {
  previewFrame.hidden = true;
  previewFrame.removeAttribute('src');
  previewFrame.srcdoc = '';
}

function updateDetails({
  branch = '—',
  commit = '—',
  author = '—',
  date = '—',
  message = '—',
} = {}) {
  detailBranch.textContent = branch;
  detailCommit.textContent = commit;
  detailAuthor.textContent = author;
  detailDate.textContent = date;
  detailMessage.textContent = message;
}

function formatDateToLocale(isoDate) {
  if (!isoDate) return '—';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    console.warn('Não foi possível formatar a data recebida.', error);
    return isoDate;
  }
}

async function fetchJson(url, errorMessage) {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const reason = `${response.status} ${response.statusText}`;
    throw new Error(`${errorMessage} (${reason})`);
  }

  return response.json();
}

async function fetchBranches() {
  setStatus('loading', 'Carregando branches disponíveis no GitHub...');
  branchSelect.disabled = true;

  try {
    const url = `${API_BASE}/branches?per_page=${encodeURIComponent(MAX_BRANCHES)}`;
    const branches = await fetchJson(url, 'Falha ao carregar a lista de branches');

    if (!Array.isArray(branches) || branches.length === 0) {
      setStatus('error', 'Nenhum branch temporário encontrado. Crie um branch antes de continuar.');
      branchSelect.innerHTML = '<option value="">Nenhum branch encontrado</option>';
      return;
    }

    branchSelect.innerHTML = ['<option value="">Selecione uma versão</option>']
      .concat(branches.map((branch) => `<option value="${branch.name}">${branch.name}</option>`))
      .join('');

    const preferredBranch = branches.some((branch) => branch.name === DEFAULT_BRANCH)
      ? DEFAULT_BRANCH
      : branches[0].name;

    branchSelect.value = preferredBranch;
    branchSelect.disabled = false;

    await loadBranch(preferredBranch);
  } catch (error) {
    console.error(error);
    setStatus('error', error.message || 'Não foi possível carregar os branches do GitHub.');
    branchSelect.innerHTML = '<option value="">Erro ao carregar branches</option>';
    branchSelect.disabled = true;
  }
}

async function loadBranch(branchName) {
  if (!branchName) {
    resetPreview();
    updateDetails();
    setStatus('info', 'Selecione uma versão para renderizar a prévia do aplicativo.');
    return;
  }

  branchSelect.disabled = true;
  setStatus('loading', `Carregando prévia da branch “${branchName}”...`);

  try {
    const branchData = await fetchJson(
      `${API_BASE}/branches/${encodeURIComponent(branchName)}`,
      'Não foi possível obter os detalhes da branch selecionada',
    );

    const commitSha = branchData?.commit?.sha ?? '—';
    const commitMessage = branchData?.commit?.commit?.message ?? '—';
    const authorName =
      branchData?.commit?.commit?.author?.name || branchData?.commit?.author?.login || '—';
    const commitDate = branchData?.commit?.commit?.author?.date || '—';

    updateDetails({
      branch: branchName,
      commit: commitSha,
      author: authorName,
      date: formatDateToLocale(commitDate),
      message: commitMessage,
    });

    const previewUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branchName}/${PREVIEW_PATH}`;
    const previewResponse = await fetch(previewUrl, { cache: 'no-store' });

    if (!previewResponse.ok) {
      throw new Error(
        `Prévia indisponível para o branch selecionado. Verifique se o arquivo “${PREVIEW_PATH}” está presente.`,
      );
    }

    const previewHtml = await previewResponse.text();
    previewFrame.hidden = false;
    previewFrame.srcdoc = previewHtml;
    setStatus('info', `Prévia renderizada a partir da branch “${branchName}”.`);
  } catch (error) {
    console.error(error);
    resetPreview();
    setStatus('error', error.message || 'Erro ao carregar a prévia da versão selecionada.');
  } finally {
    branchSelect.disabled = false;
  }
}

branchSelect.addEventListener('change', (event) => {
  const branchName = event.target.value;
  loadBranch(branchName);
});

fetchBranches();
