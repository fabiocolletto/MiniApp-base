import eventBus from '../events/event-bus.js';
import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view dashboard-view view--tasks task-dashboard';

const taskDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const taskDetailDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
});

const taskTimelineFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat('pt-BR', {
  numeric: 'auto',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

const TASK_STATUS_LABELS = {
  backlog: 'Planejada',
  'in-progress': 'Em andamento',
  review: 'Em revisão',
  blocked: 'Bloqueada',
  done: 'Concluída',
};

const TASK_STATUS_ORDER = new Map([
  ['in-progress', 0],
  ['review', 1],
  ['blocked', 2],
  ['backlog', 3],
  ['done', 4],
]);

const TASK_PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const RAW_TASKS = Object.freeze([
  Object.freeze({
    id: 'task-dashboard-widgets',
    title: 'Consolidar indicadores do painel administrativo',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-10-28',
    lastUpdate: '2025-10-25T13:20:00-03:00',
    owner: { name: 'Ana Martins', role: 'Líder de UX' },
    summary: 'Integra os cards de métricas com as novas fontes de assinaturas e implantações.',
    description:
      'Revisar o layout dos cards de indicadores do painel administrativo, conectando dados simulados de assinaturas e '
      + 'implantações para validar espaçamentos, contrastes e acessibilidade. Atualizar a documentação do widget e sinalizar '
      + 'pontos de monitoramento ao time de produto.',
    checklist: [
      { label: 'Revisar layout responsivo dos cards', done: true },
      { label: 'Sincronizar métricas de assinaturas', done: true },
      { label: 'Publicar guia de uso no Figma', done: false },
    ],
    tags: ['Dashboard', 'Indicadores'],
    activity: [
      { label: 'Design refinado aprovado', at: '2025-10-25T09:05:00-03:00' },
      { label: 'Dados de assinaturas conectados', at: '2025-10-25T12:35:00-03:00' },
    ],
    focus: 'Impacta a visibilidade da adoção do painel administrativo.',
    progress: 68,
  }),
  Object.freeze({
    id: 'task-task-dashboard-launch',
    title: 'Lançar painel de tarefas no dashboard principal',
    status: 'review',
    priority: 'high',
    dueDate: '2025-10-26',
    lastUpdate: '2025-10-25T14:10:00-03:00',
    owner: { name: 'Diego Rocha', role: 'Product Manager' },
    summary: 'Publica o novo painel de tarefas com indicadores e fluxo de detalhes no modal global.',
    description:
      'Validar o conteúdo do novo painel de tarefas, conferir os textos dos indicadores e garantir que o modal reaproveite '
      + 'o backdrop global do shell. Após o aceite, registrar o lançamento no Log e comunicar a versão no rodapé.',
    checklist: [
      { label: 'Revisar textos e hierarquia de títulos', done: true },
      { label: 'Homologar abertura do modal no mobile', done: true },
      { label: 'Atualizar Log.md com a release', done: false },
    ],
    tags: ['Dashboard', 'Experiência'],
    activity: [
      { label: 'Conteúdo revisado com UX', at: '2025-10-25T10:25:00-03:00' },
      { label: 'Modal homologado no mobile', at: '2025-10-25T13:40:00-03:00' },
    ],
    focus: 'Entrega chave para comunicar o fluxo de trabalho no MiniApp Base.',
    progress: 92,
  }),
  Object.freeze({
    id: 'task-miniapp-roadmap',
    title: 'Publicar roadmap dos miniapps priorizados',
    status: 'blocked',
    priority: 'medium',
    dueDate: '2025-10-27',
    lastUpdate: '2025-10-25T08:45:00-03:00',
    owner: { name: 'Camila Farias', role: 'Coordenadora de Produto' },
    summary: 'Lista os miniapps priorizados com status e estimativas de entrega para compartilhar com stakeholders.',
    description:
      'Mapear os miniapps planejados para o próximo ciclo, registrar status inicial e dependências conhecidas. '
      + 'Publicar visão resumida no painel do projeto e alinhar expectativas com o time comercial.',
    checklist: [
      { label: 'Consolidar lista de miniapps', done: true },
      { label: 'Receber datas estimadas do time técnico', done: false },
      { label: 'Adicionar dependências críticas', done: false },
    ],
    tags: ['Roadmap', 'Planejamento'],
    activity: [
      { label: 'Lista preliminar enviada para engenharia', at: '2025-10-24T18:15:00-03:00' },
    ],
    focus: 'Depende do alinhamento com engenharia para avançar.',
    progress: 42,
  }),
  Object.freeze({
    id: 'task-session-feedback',
    title: 'Aprimorar feedback visual do estado da sessão',
    status: 'backlog',
    priority: 'low',
    dueDate: '2025-10-30',
    lastUpdate: '2025-10-24T21:10:00-03:00',
    owner: { name: 'Marcos Lima', role: 'Front-end Engineer' },
    summary: 'Melhora o contraste e a descrição da legenda de status da sessão na barra inferior.',
    description:
      'Reavaliar o feedback visual da sessão, ajustando texto auxiliar, contraste e sequência de foco no popover. '
      + 'Validar com ferramentas assistivas e registrar resultados.',
    checklist: [
      { label: 'Atualizar tokens de cor do indicador', done: false },
      { label: 'Rever descrição de acessibilidade', done: false },
      { label: 'Executar testes com NVDA', done: false },
    ],
    tags: ['Sessão', 'Acessibilidade'],
    activity: [],
    focus: 'Dependente da priorização após o lançamento do painel de tarefas.',
    progress: 0,
  }),
  Object.freeze({
    id: 'task-cep-integration',
    title: 'Homologar integração ViaCEP no painel do usuário',
    status: 'done',
    priority: 'medium',
    dueDate: '2025-10-24',
    lastUpdate: '2025-10-24T17:20:00-03:00',
    owner: { name: 'Bruna Azevedo', role: 'Engenheira de Software' },
    summary: 'Valida o fluxo automático de preenchimento de endereço com ViaCEP e documenta o comportamento.',
    description:
      'Executar casos de teste com CEPs válidos e inválidos, registrar mensagens de erro e atualizar a documentação '
      + 'do painel do usuário com os cenários cobertos. Compartilhar evidências com o time de atendimento.',
    checklist: [
      { label: 'Testar CEPs válidos', done: true },
      { label: 'Mapear mensagens para CEP inválido', done: true },
      { label: 'Registrar evidências no Log da ferramenta', done: true },
    ],
    tags: ['Integração', 'Usuário'],
    activity: [
      { label: 'Fluxo validado com QA', at: '2025-10-24T16:05:00-03:00' },
      { label: 'Documentação publicada no repositório', at: '2025-10-24T17:05:00-03:00' },
    ],
    focus: 'Disponível como referência para as próximas integrações de dados.',
    progress: 100,
  }),
]);

function parseDateOnly(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = parts;
  const year = Number.parseInt(yearPart, 10);
  const month = Number.parseInt(monthPart, 10);
  const day = Number.parseInt(dayPart, 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateTime(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeTime(value) {
  const date = parseDateTime(value);
  if (!date) {
    return null;
  }

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diff / 60000);

  if (Math.abs(diffMinutes) < 1) {
    return 'agora';
  }

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, 'day');
}

function formatTaskDateLabel(date) {
  if (!(date instanceof Date)) {
    return 'Sem prazo definido';
  }

  return taskDateFormatter.format(date);
}

function formatDueRelative(date) {
  if (!(date instanceof Date)) {
    return 'Sem prazo definido';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date.getTime());
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return `Atrasada ${relativeTimeFormatter.format(diffDays, 'day')}`;
  }

  if (diffDays === 0) {
    return 'Entrega hoje';
  }

  if (diffDays === 1) {
    return 'Entrega amanhã';
  }

  if (diffDays <= 7) {
    return `Faltam ${diffDays} dias`;
  }

  return `Entrega em ${taskDateFormatter.format(due)}`;
}

function getDueState(date, status) {
  if (status === 'done') {
    return 'completed';
  }

  if (!(date instanceof Date)) {
    return 'unscheduled';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(date.getTime());
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) {
    return 'overdue';
  }

  if (due.getTime() === today.getTime()) {
    return 'today';
  }

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 3) {
    return 'soon';
  }

  return 'scheduled';
}

function clampProgress(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function computeChecklist(task) {
  if (!Array.isArray(task?.checklist)) {
    return [];
  }

  return task.checklist
    .map((item, index) => {
      const label = typeof item?.label === 'string' ? item.label.trim() : '';
      if (!label) {
        return null;
      }

      return {
        id: `${task.id}-check-${index + 1}`,
        label,
        done: Boolean(item?.done),
      };
    })
    .filter(Boolean);
}

function computeActivities(task) {
  if (!Array.isArray(task?.activity)) {
    return [];
  }

  return task.activity
    .map((item, index) => {
      const label = typeof item?.label === 'string' ? item.label.trim() : '';
      if (!label) {
        return null;
      }

      const date = parseDateTime(item?.at);
      return {
        id: `${task.id}-activity-${index + 1}`,
        label,
        at: date ? date.toISOString() : null,
        relative: date ? formatRelativeTime(date) : null,
        absolute: date ? taskTimelineFormatter.format(date) : 'Data não registrada',
      };
    })
    .filter(Boolean);
}

function getInitials(name) {
  if (typeof name !== 'string') {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function mapTaskToEntry(task) {
  if (!task || typeof task !== 'object') {
    return null;
  }

  const id = typeof task.id === 'string' ? task.id.trim() : '';
  if (!id) {
    return null;
  }

  const title = typeof task.title === 'string' && task.title.trim() ? task.title.trim() : 'Tarefa sem título';
  const status = typeof task.status === 'string' ? task.status.trim().toLowerCase() : 'backlog';
  const priority = typeof task.priority === 'string' ? task.priority.trim().toLowerCase() : 'medium';
  const dueDate = parseDateOnly(task.dueDate);
  const progress = clampProgress(task.progress);
  const statusLabel = TASK_STATUS_LABELS[status] ?? TASK_STATUS_LABELS.backlog;
  const priorityLabel = TASK_PRIORITY_LABELS[priority] ?? TASK_PRIORITY_LABELS.medium;
  const dueLabel = formatTaskDateLabel(dueDate);
  const dueRelative = formatDueRelative(dueDate);
  const dueState = getDueState(dueDate, status);
  const summary = typeof task.summary === 'string' && task.summary.trim() ? task.summary.trim() : 'Nenhum resumo disponível.';
  const description =
    typeof task.description === 'string' && task.description.trim()
      ? task.description.trim()
      : 'Nenhuma descrição detalhada registrada até o momento.';
  const ownerName = typeof task.owner?.name === 'string' && task.owner.name.trim() ? task.owner.name.trim() : 'Equipe do projeto';
  const ownerRole = typeof task.owner?.role === 'string' && task.owner.role.trim() ? task.owner.role.trim() : 'Responsável não definido';
  const ownerInitials = getInitials(ownerName);
  const checklist = computeChecklist(task);
  const completedChecklist = checklist.filter((item) => item.done).length;
  const activities = computeActivities(task);
  const tags = Array.isArray(task.tags)
    ? task.tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
    : [];
  const lastUpdateRelative = formatRelativeTime(task.lastUpdate) ?? 'sem atualização recente';
  const focus = typeof task.focus === 'string' && task.focus.trim() ? task.focus.trim() : '';

  return {
    id,
    title,
    status,
    statusLabel,
    priority,
    priorityLabel,
    dueDate: dueDate ? dueDate.toISOString() : null,
    dueLabel,
    dueRelative,
    dueState,
    summary,
    description,
    ownerName,
    ownerRole,
    ownerInitials,
    tags,
    progress,
    lastUpdateRelative,
    checklist,
    completedChecklist,
    activities,
    focus,
    details: {
      id,
      title,
      status,
      statusLabel,
      statusContext: focus,
      priority,
      priorityLabel,
      dueLabel,
      dueRelative,
      dueState,
      ownerName,
      ownerRole,
      ownerInitials,
      summary,
      description,
      tags,
      progress,
      progressLabel: `${progress}%`,
      checklist,
      completedChecklist,
      activities,
      lastUpdateRelative,
      lastUpdateAbsolute: task.lastUpdate
        ? taskDetailDateFormatter.format(parseDateTime(task.lastUpdate) ?? new Date())
        : 'Atualização não registrada',
      dueAbsolute: dueDate ? taskDetailDateFormatter.format(dueDate) : 'Sem prazo definido',
    },
  };
}

function buildTaskIndicators(entries) {
  const total = entries.length;
  const active = entries.filter((entry) => entry.status !== 'done').length;
  const inProgress = entries.filter((entry) => entry.status === 'in-progress').length;
  const blocked = entries.filter((entry) => entry.status === 'blocked').length;
  const completed = entries.filter((entry) => entry.status === 'done').length;
  const dueSoon = entries.filter((entry) => entry.dueState === 'soon' || entry.dueState === 'today').length;

  return [
    {
      id: 'total',
      label: 'Tarefas planejadas',
      value: numberFormatter.format(total),
      helper: `${numberFormatter.format(active)} ativas neste ciclo`,
      variant: 'accent',
    },
    {
      id: 'in-progress',
      label: 'Em andamento',
      value: numberFormatter.format(inProgress),
      helper: dueSoon > 0 ? `${numberFormatter.format(dueSoon)} próximas entregas` : 'Sem entregas urgentes',
      variant: 'info',
    },
    {
      id: 'completed',
      label: 'Concluídas',
      value: numberFormatter.format(completed),
      helper: `${numberFormatter.format(total || 1)} totais`,
      variant: 'success',
    },
    {
      id: 'blocked',
      label: 'Bloqueadas',
      value: numberFormatter.format(blocked),
      helper: blocked > 0 ? 'Requer alinhamento imediato' : 'Nenhum bloqueio ativo',
      variant: 'warning',
    },
  ];
}

function createIndicatorCard(indicator) {
  const card = document.createElement('article');
  card.className = 'task-dashboard__indicator';
  card.dataset.variant = indicator.variant;

  const label = document.createElement('p');
  label.className = 'task-dashboard__indicator-label';
  label.textContent = indicator.label;

  const value = document.createElement('p');
  value.className = 'task-dashboard__indicator-value';
  value.textContent = indicator.value;

  const helper = document.createElement('p');
  helper.className = 'task-dashboard__indicator-helper';
  helper.textContent = indicator.helper;

  card.append(label, value, helper);
  return card;
}

function createLegend(entries) {
  const legend = document.createElement('div');
  legend.className = 'task-dashboard__legend';
  legend.setAttribute('role', 'list');

  const statuses = new Set(entries.map((entry) => entry.status));

  Array.from(statuses)
    .sort((a, b) => {
      const orderA = TASK_STATUS_ORDER.get(a) ?? 99;
      const orderB = TASK_STATUS_ORDER.get(b) ?? 99;
      return orderA - orderB;
    })
    .forEach((status) => {
      const item = document.createElement('span');
      item.className = 'task-dashboard__legend-item';
      item.dataset.status = status;
      item.setAttribute('role', 'listitem');
      item.textContent = TASK_STATUS_LABELS[status] ?? status;
      legend.append(item);
    });

  return legend;
}

function createTaskListItem(entry, cleanupCallbacks) {
  const item = document.createElement('li');
  item.className = 'task-dashboard__task-item';
  item.dataset.status = entry.status;
  item.dataset.dueState = entry.dueState;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'task-dashboard__task-button';
  button.setAttribute('aria-label', `Ver detalhes da tarefa ${entry.title}`);

  const content = document.createElement('div');
  content.className = 'task-dashboard__task-content';

  const header = document.createElement('div');
  header.className = 'task-dashboard__task-header';

  const title = document.createElement('h3');
  title.className = 'task-dashboard__task-title';
  title.textContent = entry.title;

  const status = document.createElement('span');
  status.className = 'task-dashboard__status';
  status.dataset.status = entry.status;
  status.textContent = entry.statusLabel;

  header.append(title, status);

  const summary = document.createElement('p');
  summary.className = 'task-dashboard__task-summary';
  summary.textContent = entry.summary;

  const meta = document.createElement('div');
  meta.className = 'task-dashboard__task-meta';

  const due = document.createElement('span');
  due.className = 'task-dashboard__task-due';
  due.textContent = `${entry.dueLabel} · ${entry.dueRelative}`;

  const priority = document.createElement('span');
  priority.className = 'task-dashboard__priority';
  priority.dataset.priority = entry.priority;
  priority.textContent = `Prioridade ${entry.priorityLabel}`;

  meta.append(due, priority);

  const progress = document.createElement('div');
  progress.className = 'task-dashboard__task-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.setAttribute('aria-valuenow', String(entry.progress));
  progress.setAttribute('aria-label', `Progresso da tarefa ${entry.title}`);

  const progressBar = document.createElement('span');
  progressBar.className = 'task-dashboard__task-progress-bar';
  progressBar.style.width = `${entry.progress}%`;
  progress.append(progressBar);

  const checklist = document.createElement('p');
  checklist.className = 'task-dashboard__task-checklist';
  if (entry.checklist.length > 0) {
    checklist.textContent = `${numberFormatter.format(entry.completedChecklist)} de ${numberFormatter.format(
      entry.checklist.length,
    )} subtarefas concluídas`;
  } else {
    checklist.textContent = 'Sem subtarefas cadastradas';
  }

  const update = document.createElement('p');
  update.className = 'task-dashboard__task-updated';
  update.textContent = `Atualizado ${entry.lastUpdateRelative}`;

  content.append(header, summary, meta, progress, checklist, update);
  button.append(content);
  item.append(button);

  const handleClick = () => {
    eventBus.emit('tasks:details', { task: entry.details, trigger: button });
  };

  button.addEventListener('click', handleClick);
  cleanupCallbacks.push(() => {
    button.removeEventListener('click', handleClick);
  });

  return item;
}

function buildTaskList(entries, cleanupCallbacks) {
  const list = document.createElement('ul');
  list.className = 'task-dashboard__task-list';
  list.setAttribute('role', 'list');

  entries
    .slice()
    .sort((a, b) => {
      const statusOrderA = TASK_STATUS_ORDER.get(a.status) ?? 99;
      const statusOrderB = TASK_STATUS_ORDER.get(b.status) ?? 99;
      if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
      }

      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }

      return a.title.localeCompare(b.title, 'pt-BR');
    })
    .forEach((entry) => {
      const item = createTaskListItem(entry, cleanupCallbacks);
      list.append(item);
    });

  return list;
}

function buildTimeline(entries) {
  const upcoming = entries
    .filter((entry) => entry.status !== 'done')
    .filter((entry) => entry.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const container = document.createElement('div');
  container.className = 'task-dashboard__timeline';

  if (upcoming.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'task-dashboard__timeline-empty';
    empty.textContent = 'Nenhuma entrega prevista para esta semana.';
    container.append(empty);
    return container;
  }

  const list = document.createElement('ol');
  list.className = 'task-dashboard__timeline-list';
  list.setAttribute('role', 'list');

  upcoming.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'task-dashboard__timeline-item';
    item.dataset.status = entry.status;
    item.dataset.dueState = entry.dueState;

    const due = document.createElement('p');
    due.className = 'task-dashboard__timeline-date';
    due.textContent = entry.dueLabel;

    const title = document.createElement('p');
    title.className = 'task-dashboard__timeline-title';
    title.textContent = entry.title;

    const helper = document.createElement('p');
    helper.className = 'task-dashboard__timeline-helper';
    helper.textContent = entry.dueRelative;

    item.append(due, title, helper);
    list.append(item);
  });

  container.append(list);
  return container;
}

export function renderTaskDashboard(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupCallbacks = [];
  registerViewCleanup(viewRoot, () => {
    while (cleanupCallbacks.length > 0) {
      const cleanup = cleanupCallbacks.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar o painel de tarefas.', error);
      }
    }
  });

  const entries = RAW_TASKS.map((task) => mapTaskToEntry(task)).filter(Boolean);
  const indicators = buildTaskIndicators(entries);

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'tasks';
  viewRoot.setAttribute('aria-label', 'Painel de tarefas do MiniApp Base');

  const layout = document.createElement('div');
  layout.className = 'task-dashboard__layout layout-stack layout-stack--lg';

  const overview = document.createElement('section');
  overview.className = 'surface-card task-dashboard__widget task-dashboard__widget--overview layout-stack layout-stack--md';

  const overviewHeader = document.createElement('div');
  overviewHeader.className = 'section-header';

  const headerInfo = document.createElement('div');
  headerInfo.className = 'section-header__info';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = 'Controle de tarefas';

  const description = document.createElement('p');
  description.className = 'section-description';
  description.textContent =
    'Acompanhe o andamento das iniciativas prioritárias do MiniApp Base e identifique rapidamente bloqueios e entregas desta semana.';

  headerInfo.append(title, description);

  const legend = createLegend(entries);
  overviewHeader.append(headerInfo, legend);

  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'task-dashboard__indicators';
  indicators.forEach((indicator) => {
    indicatorsContainer.append(createIndicatorCard(indicator));
  });

  overview.append(overviewHeader, indicatorsContainer);

  const listSection = document.createElement('section');
  listSection.className = 'surface-card task-dashboard__widget task-dashboard__widget--list';

  const listTitle = document.createElement('h3');
  listTitle.className = 'task-dashboard__widget-title';
  listTitle.textContent = 'Backlog priorizado';

  const listDescription = document.createElement('p');
  listDescription.className = 'task-dashboard__widget-description';
  listDescription.textContent = 'Selecione uma tarefa para visualizar detalhes, subtarefas e atualizações recentes.';

  const taskList = buildTaskList(entries, cleanupCallbacks);

  listSection.append(listTitle, listDescription, taskList);

  const timelineSection = document.createElement('section');
  timelineSection.className = 'surface-card task-dashboard__widget task-dashboard__widget--timeline layout-stack layout-stack--sm';

  const timelineTitle = document.createElement('h3');
  timelineTitle.className = 'task-dashboard__widget-title';
  timelineTitle.textContent = 'Próximas entregas';

  const timelineDescription = document.createElement('p');
  timelineDescription.className = 'task-dashboard__widget-description';
  timelineDescription.textContent = 'Resumo das tarefas que chegam ao prazo nos próximos dias.';

  const timeline = buildTimeline(entries);

  timelineSection.append(timelineTitle, timelineDescription, timeline);

  layout.append(overview, listSection, timelineSection);
  viewRoot.replaceChildren(layout);
}

