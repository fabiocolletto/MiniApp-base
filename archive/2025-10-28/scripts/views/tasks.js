import eventBus from '../events/event-bus.js';
import { registerViewCleanup } from '../view-cleanup.js';
import {
  seedTaskStore,
  listTasks as listStoredTasks,
  subscribeTasks,
  createTask as createTaskRecord,
  updateTask as updateTaskRecord,
  removeTask as removeTaskRecord,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../../core/task-store.js';
import { DEFAULT_TASKS } from '../data/task-dashboard-defaults.js';

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

const RAW_TASKS = DEFAULT_TASKS;

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
    source: {
      id,
      title,
      status,
      priority,
      dueDate:
        dueDate
          ? dueDate.toISOString().slice(0, 10)
          : typeof task.dueDate === 'string' && task.dueDate.trim()
            ? task.dueDate.trim()
            : null,
      lastUpdate: typeof task.lastUpdate === 'string' ? task.lastUpdate : null,
      owner: { name: ownerName, role: ownerRole },
      summary,
      description,
      tags: tags.slice(),
      focus,
      progress,
      checklist: checklist.map((item) => ({ ...item })),
      activity: activities.map((item) => ({ label: item.label, at: item.at ?? null })),
    },
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

function createTaskListItem(entry, cleanupCallbacks, options = {}) {
  const { onEdit, onDelete } = options;
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

  const actions = document.createElement('div');
  actions.className = 'task-dashboard__task-actions';

  if (typeof onEdit === 'function') {
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'task-dashboard__task-action task-dashboard__task-action--edit';
    editButton.textContent = 'Editar';
    editButton.setAttribute('aria-label', `Editar tarefa ${entry.title}`);

    const handleEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onEdit(entry);
    };

    editButton.addEventListener('click', handleEdit);
    cleanupCallbacks.push(() => {
      editButton.removeEventListener('click', handleEdit);
    });

    actions.append(editButton);
  }

  if (typeof onDelete === 'function') {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'task-dashboard__task-action task-dashboard__task-action--delete';
    deleteButton.textContent = 'Excluir';
    deleteButton.setAttribute('aria-label', `Excluir tarefa ${entry.title}`);

    const handleDelete = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onDelete(entry);
    };

    deleteButton.addEventListener('click', handleDelete);
    cleanupCallbacks.push(() => {
      deleteButton.removeEventListener('click', handleDelete);
    });

    actions.append(deleteButton);
  }

  if (actions.childElementCount > 0) {
    item.append(actions);
  }

  const handleClick = () => {
    eventBus.emit('tasks:details', { task: entry.details, trigger: button });
  };

  button.addEventListener('click', handleClick);
  cleanupCallbacks.push(() => {
    button.removeEventListener('click', handleClick);
  });

  return item;
}

function buildTaskList(entries, cleanupCallbacks, options = {}) {
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
      const item = createTaskListItem(entry, cleanupCallbacks, options);
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

function createMessageElement(baseClass) {
  const message = document.createElement('p');
  message.className = `form-message ${baseClass}`;
  message.hidden = true;
  return message;
}

function updateMessageElement(element, type, text) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.remove('form-message--error', 'form-message--success');

  if (!text) {
    element.hidden = true;
    element.textContent = '';
    return;
  }

  element.hidden = false;
  element.textContent = text;
  if (type === 'error') {
    element.classList.add('form-message--error');
  } else if (type === 'success') {
    element.classList.add('form-message--success');
  }
}

function createInputField(options) {
  const {
    name,
    label,
    type = 'text',
    required = false,
    placeholder = '',
    span = null,
  } = options;

  const field = document.createElement('div');
  field.className = 'form-field';
  if (span) {
    field.dataset.fieldSpan = span;
  }

  const inputId = `task-form-${name}-${Math.random().toString(36).slice(2, 10)}`;

  const labelElement = document.createElement('label');
  labelElement.className = 'form-label';
  labelElement.setAttribute('for', inputId);
  labelElement.textContent = label;

  let control;
  if (type === 'textarea') {
    control = document.createElement('textarea');
    control.className = 'form-textarea';
  } else {
    control = document.createElement('input');
    control.type = type;
    control.className = 'form-input';
  }

  control.id = inputId;
  control.name = name;
  if (placeholder) {
    control.placeholder = placeholder;
  }

  if (required) {
    control.required = true;
  }

  field.append(labelElement, control);
  return { field, control };
}

function createSelectField(options) {
  const { name, label, values, labels, span = null } = options;
  const field = document.createElement('div');
  field.className = 'form-field';
  if (span) {
    field.dataset.fieldSpan = span;
  }

  const inputId = `task-form-${name}-${Math.random().toString(36).slice(2, 10)}`;

  const labelElement = document.createElement('label');
  labelElement.className = 'form-label';
  labelElement.setAttribute('for', inputId);
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  select.name = name;

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labels[value] ?? value;
    select.append(option);
  });

  field.append(labelElement, select);
  return { field, control: select };
}

function createTaskFormElements() {
  const form = document.createElement('form');
  form.className = 'task-dashboard__form layout-stack layout-stack--md';
  form.hidden = true;
  form.dataset.mode = 'create';
  form.id = `task-dashboard-form-${Math.random().toString(36).slice(2, 10)}`;

  const title = document.createElement('h4');
  title.className = 'task-dashboard__form-title';
  title.textContent = 'Adicionar tarefa';

  const fieldsGrid = document.createElement('div');
  fieldsGrid.className = 'task-dashboard__form-grid';

  const { field: titleField, control: titleInput } = createInputField({
    name: 'title',
    label: 'Título',
    required: true,
    span: 'full',
  });

  const { field: statusField, control: statusSelect } = createSelectField({
    name: 'status',
    label: 'Status',
    values: TASK_STATUS_OPTIONS,
    labels: TASK_STATUS_LABELS,
  });

  const { field: priorityField, control: prioritySelect } = createSelectField({
    name: 'priority',
    label: 'Prioridade',
    values: TASK_PRIORITY_OPTIONS,
    labels: TASK_PRIORITY_LABELS,
  });

  const { field: dueDateField, control: dueDateInput } = createInputField({
    name: 'dueDate',
    label: 'Prazo',
    type: 'date',
  });

  const { field: progressField, control: progressInput } = createInputField({
    name: 'progress',
    label: 'Progresso (%)',
    type: 'number',
  });
  progressInput.min = '0';
  progressInput.max = '100';
  progressInput.step = '1';

  const { field: ownerNameField, control: ownerNameInput } = createInputField({
    name: 'ownerName',
    label: 'Responsável',
    placeholder: 'Nome completo',
  });

  const { field: ownerRoleField, control: ownerRoleInput } = createInputField({
    name: 'ownerRole',
    label: 'Função',
    placeholder: 'Cargo ou papel',
  });

  const { field: tagsField, control: tagsInput } = createInputField({
    name: 'tags',
    label: 'Etiquetas',
    placeholder: 'Separe por vírgulas',
    span: 'full',
  });

  const { field: summaryField, control: summaryInput } = createInputField({
    name: 'summary',
    label: 'Resumo',
    type: 'textarea',
    span: 'full',
  });

  const { field: descriptionField, control: descriptionInput } = createInputField({
    name: 'description',
    label: 'Descrição detalhada',
    type: 'textarea',
    span: 'full',
  });

  const { field: focusField, control: focusInput } = createInputField({
    name: 'focus',
    label: 'Contexto ou foco',
    type: 'textarea',
    span: 'full',
  });

  fieldsGrid.append(
    titleField,
    statusField,
    priorityField,
    dueDateField,
    progressField,
    ownerNameField,
    ownerRoleField,
    tagsField,
    summaryField,
    descriptionField,
    focusField,
  );

  const message = createMessageElement('task-dashboard__form-message');

  const actions = document.createElement('div');
  actions.className = 'task-dashboard__form-actions';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'task-dashboard__form-cancel';
  cancelButton.textContent = 'Cancelar';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'form-submit task-dashboard__form-submit';
  submitButton.textContent = 'Salvar tarefa';

  actions.append(cancelButton, submitButton);

  form.append(title, fieldsGrid, message, actions);

  return {
    form,
    title,
    fields: {
      title: titleInput,
      status: statusSelect,
      priority: prioritySelect,
      dueDate: dueDateInput,
      progress: progressInput,
      ownerName: ownerNameInput,
      ownerRole: ownerRoleInput,
      tags: tagsInput,
      summary: summaryInput,
      description: descriptionInput,
      focus: focusInput,
    },
    message,
    cancelButton,
    submitButton,
  };
}

function readTaskFormPayload(form) {
  const formData = new FormData(form);

  const getValue = (name) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };

  const progressValue = Number.parseInt(getValue('progress'), 10);
  const dueDateValue = getValue('dueDate');

  return {
    title: getValue('title'),
    status: getValue('status') || 'backlog',
    priority: getValue('priority') || 'medium',
    dueDate: dueDateValue || null,
    progress: Number.isFinite(progressValue) ? progressValue : 0,
    summary: getValue('summary'),
    description: getValue('description'),
    focus: getValue('focus'),
    owner: {
      name: getValue('ownerName'),
      role: getValue('ownerRole'),
    },
    tags: getValue('tags'),
  };
}

function formatTagsInput(tags) {
  if (!Array.isArray(tags)) {
    return '';
  }

  return tags.join(', ');
}

export function renderTaskDashboard(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupCallbacks = [];
  const listCleanupCallbacks = [];
  let listMessageTimeout;
  let currentEntries = [];
  let submitting = false;

  function clearListCleanup() {
    while (listCleanupCallbacks.length > 0) {
      const cleanup = listCleanupCallbacks.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar eventos da lista de tarefas.', error);
      }
    }
  }

  registerViewCleanup(viewRoot, () => {
    clearListCleanup();
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
    if (typeof window !== 'undefined' && typeof window.clearTimeout === 'function' && listMessageTimeout) {
      window.clearTimeout(listMessageTimeout);
      listMessageTimeout = undefined;
    }
  });

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

  const legendContainer = document.createElement('div');
  legendContainer.className = 'task-dashboard__legend-container';
  legendContainer.append(createLegend([]));

  overviewHeader.append(headerInfo, legendContainer);

  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'task-dashboard__indicators';

  overview.append(overviewHeader, indicatorsContainer);

  const listSection = document.createElement('section');
  listSection.className = 'surface-card task-dashboard__widget task-dashboard__widget--list layout-stack layout-stack--md';

  const listTitle = document.createElement('h3');
  listTitle.className = 'task-dashboard__widget-title';
  listTitle.textContent = 'Backlog priorizado';

  const listDescription = document.createElement('p');
  listDescription.className = 'task-dashboard__widget-description';
  listDescription.textContent = 'Selecione uma tarefa para visualizar detalhes, subtarefas e atualizações recentes.';

  const listActions = document.createElement('div');
  listActions.className = 'task-dashboard__list-actions';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'task-dashboard__add-button';
  addButton.textContent = 'Nova tarefa';
  addButton.setAttribute('aria-expanded', 'false');
  listActions.append(addButton);

  const listMessage = createMessageElement('task-dashboard__list-message');

  const formElements = createTaskFormElements();
  const { form, fields, message: formMessage, cancelButton, submitButton, title: formTitle } = formElements;
  if (form.id) {
    addButton.setAttribute('aria-controls', form.id);
  }

  const listContent = document.createElement('div');
  listContent.className = 'task-dashboard__list-content layout-stack layout-stack--md';

  const loadingMessage = document.createElement('p');
  loadingMessage.className = 'task-dashboard__list-empty';
  loadingMessage.textContent = 'Carregando tarefas...';
  listContent.append(loadingMessage);

  const timelineSection = document.createElement('section');
  timelineSection.className = 'surface-card task-dashboard__widget task-dashboard__widget--timeline layout-stack layout-stack--sm';

  const timelineTitle = document.createElement('h3');
  timelineTitle.className = 'task-dashboard__widget-title';
  timelineTitle.textContent = 'Próximas entregas';

  const timelineDescription = document.createElement('p');
  timelineDescription.className = 'task-dashboard__widget-description';
  timelineDescription.textContent = 'Resumo das tarefas que chegam ao prazo nos próximos dias.';

  const timelineContent = document.createElement('div');
  timelineContent.className = 'task-dashboard__timeline-wrapper';
  timelineContent.append(buildTimeline([]));

  listSection.append(listTitle, listDescription, listActions, listMessage, form, listContent);
  timelineSection.append(timelineTitle, timelineDescription, timelineContent);

  layout.append(overview, listSection, timelineSection);
  viewRoot.replaceChildren(layout);

  function resetTaskForm() {
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.taskId;
    formTitle.textContent = 'Adicionar tarefa';
    submitButton.textContent = 'Salvar tarefa';
    const defaultStatus = TASK_STATUS_OPTIONS[0] ?? fields.status.options?.[0]?.value ?? '';
    const defaultPriority =
      TASK_PRIORITY_OPTIONS[1] ?? TASK_PRIORITY_OPTIONS[0] ?? fields.priority.options?.[0]?.value ?? '';
    fields.status.value = defaultStatus;
    if (!fields.status.value && fields.status.options?.length) {
      fields.status.selectedIndex = 0;
    }
    fields.priority.value = defaultPriority;
    if (!fields.priority.value && fields.priority.options?.length) {
      fields.priority.selectedIndex = 0;
    }
    fields.progress.value = '0';
    updateMessageElement(formMessage, null, '');
  }

  function hideTaskForm() {
    resetTaskForm();
    form.hidden = true;
    addButton.setAttribute('aria-expanded', 'false');
  }

  function showTaskForm(mode, task) {
    resetTaskForm();
    if (mode === 'edit' && task) {
      form.dataset.mode = 'edit';
      form.dataset.taskId = task.id;
      formTitle.textContent = 'Editar tarefa';
      submitButton.textContent = 'Atualizar tarefa';
      fields.title.value = task.title ?? '';
      if (TASK_STATUS_OPTIONS.includes(task.status)) {
        fields.status.value = task.status;
      }
      if (TASK_PRIORITY_OPTIONS.includes(task.priority)) {
        fields.priority.value = task.priority;
      }
      if (task.dueDate) {
        fields.dueDate.value = task.dueDate;
      }
      fields.progress.value = Number.isFinite(task.progress) ? String(task.progress) : '0';
      fields.ownerName.value = typeof task.owner?.name === 'string' ? task.owner.name : '';
      fields.ownerRole.value = typeof task.owner?.role === 'string' ? task.owner.role : '';
      fields.tags.value = formatTagsInput(task.tags);
      fields.summary.value = typeof task.summary === 'string' ? task.summary : '';
      fields.description.value = typeof task.description === 'string' ? task.description : '';
      fields.focus.value = typeof task.focus === 'string' ? task.focus : '';
    } else {
      formTitle.textContent = 'Adicionar tarefa';
      submitButton.textContent = 'Salvar tarefa';
    }

    form.hidden = false;
    addButton.setAttribute('aria-expanded', 'true');
    if (mode !== 'edit' && typeof fields.title.focus === 'function') {
      try {
        fields.title.focus();
      } catch (error) {
        // ignore focus errors
      }
    }
    if (typeof form.scrollIntoView === 'function') {
      try {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        // ignore scroll errors
      }
    }
  }

  function setListMessage(type, text) {
    updateMessageElement(listMessage, type, text);
    if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
      if (listMessageTimeout) {
        window.clearTimeout(listMessageTimeout);
        listMessageTimeout = undefined;
      }
      if (text && type === 'success') {
        listMessageTimeout = window.setTimeout(() => {
          updateMessageElement(listMessage, null, '');
          listMessageTimeout = undefined;
        }, 4000);
      }
    }
  }

  function applyEntries(tasks) {
    const mappedEntries = tasks.map((task) => mapTaskToEntry(task)).filter(Boolean);
    currentEntries = mappedEntries;

    const indicators = buildTaskIndicators(mappedEntries);
    indicatorsContainer.replaceChildren(...indicators.map((indicator) => createIndicatorCard(indicator)));

    legendContainer.replaceChildren(createLegend(mappedEntries));

    clearListCleanup();

    if (mappedEntries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'task-dashboard__list-empty';
      empty.textContent = 'Nenhuma tarefa cadastrada ainda.';
      listContent.replaceChildren(empty);
    } else {
      const list = buildTaskList(mappedEntries, listCleanupCallbacks, {
        onEdit: (entry) => {
          if (entry?.source) {
            showTaskForm('edit', entry.source);
          }
        },
        onDelete: async (entry) => {
          if (!entry?.id) {
            return;
          }

          let confirmed = true;
          if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
            confirmed = window.confirm(`Deseja excluir a tarefa "${entry.title}"?`);
          }

          if (!confirmed) {
            return;
          }

          try {
            await removeTaskRecord(entry.id);
            if (form.dataset.taskId === entry.id) {
              hideTaskForm();
            }
            setListMessage('success', 'Tarefa excluída com sucesso.');
          } catch (error) {
            console.error('Erro ao excluir tarefa.', error);
            setListMessage('error', 'Não foi possível excluir a tarefa. Tente novamente.');
          }
        },
      });

      listContent.replaceChildren(list);
    }

    timelineContent.replaceChildren(buildTimeline(mappedEntries));
  }

  async function handleTaskFormSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const mode = form.dataset.mode === 'edit' ? 'edit' : 'create';
    const payload = readTaskFormPayload(form);
    if (!payload.title) {
      updateMessageElement(formMessage, 'error', 'Informe um título para a tarefa.');
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    cancelButton.disabled = true;
    addButton.disabled = true;
    updateMessageElement(formMessage, null, '');

    try {
      if (mode === 'edit') {
        const taskId = form.dataset.taskId;
        if (!taskId) {
          throw new Error('Identificador da tarefa ausente.');
        }
        await updateTaskRecord(taskId, payload);
        setListMessage('success', 'Tarefa atualizada com sucesso.');
      } else {
        await createTaskRecord(payload);
        setListMessage('success', 'Tarefa adicionada com sucesso.');
      }
      hideTaskForm();
    } catch (error) {
      console.error('Erro ao salvar tarefa.', error);
      updateMessageElement(formMessage, 'error', 'Não foi possível salvar a tarefa. Tente novamente.');
    } finally {
      submitting = false;
      submitButton.disabled = false;
      cancelButton.disabled = false;
      addButton.disabled = false;
    }
  }

  function handleAddTaskClick(event) {
    event.preventDefault();
    if (!form.hidden) {
      hideTaskForm();
      return;
    }
    showTaskForm('create');
  }

  addButton.addEventListener('click', handleAddTaskClick);
  cleanupCallbacks.push(() => {
    addButton.removeEventListener('click', handleAddTaskClick);
  });

  form.addEventListener('submit', handleTaskFormSubmit);
  cleanupCallbacks.push(() => {
    form.removeEventListener('submit', handleTaskFormSubmit);
  });

  const handleCancelClick = (event) => {
    event.preventDefault();
    hideTaskForm();
  };

  cancelButton.addEventListener('click', handleCancelClick);
  cleanupCallbacks.push(() => {
    cancelButton.removeEventListener('click', handleCancelClick);
  });

  const unsubscribe = subscribeTasks((tasks) => {
    applyEntries(tasks);
  });
  cleanupCallbacks.push(() => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  (async () => {
    try {
      await seedTaskStore(RAW_TASKS);
      const tasks = await listStoredTasks();
      applyEntries(tasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas do painel.', error);
      updateMessageElement(formMessage, 'error', 'Não foi possível carregar as tarefas.');
    }
  })();
}

