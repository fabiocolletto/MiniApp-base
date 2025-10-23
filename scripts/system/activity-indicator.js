import eventBus from '../events/event-bus.js';

const DEFAULT_STATUS = {
  state: 'idle',
  message: 'Nenhuma alteração pendente',
  details: 'O painel está sincronizado com a memória local.',
  source: 'global',
  timestamp: Date.now(),
};

const STATE_DEFAULTS = {
  idle: {
    message: 'Nenhuma alteração pendente',
    details: 'O painel está sincronizado com a memória local.',
  },
  dirty: {
    message: 'Alterações pendentes',
    details: 'Suas edições serão salvas automaticamente.',
  },
  saving: {
    message: 'Salvando alterações',
    details: 'Sincronizando dados com a memória local.',
  },
  saved: {
    message: 'Alterações salvas',
    details: 'Sincronização concluída automaticamente.',
  },
  error: {
    message: 'Não foi possível salvar alterações',
    details: 'Revise os campos e tente novamente.',
  },
};

const STATE_PRIORITY = {
  error: 50,
  saving: 40,
  dirty: 30,
  saved: 20,
  idle: 10,
};

const subscribers = new Set();
const statuses = new Map();
let currentStatus = {
  state: DEFAULT_STATUS.state,
  message: DEFAULT_STATUS.message,
  details: DEFAULT_STATUS.details,
  source: DEFAULT_STATUS.source,
};

function ensureGlobalStatus() {
  if (!statuses.has('global')) {
    statuses.set('global', { ...DEFAULT_STATUS, timestamp: Date.now() });
  }
}

function cloneStatus(status) {
  return {
    state: status.state,
    message: status.message,
    details: status.details,
    source: status.source,
  };
}

function resolveStatus() {
  ensureGlobalStatus();

  let winner = statuses.get('global');
  if (!winner) {
    winner = { ...DEFAULT_STATUS, timestamp: Date.now() };
  }

  for (const status of statuses.values()) {
    if (!status) {
      continue;
    }

    const statusPriority = STATE_PRIORITY[status.state] ?? 0;
    const winnerPriority = STATE_PRIORITY[winner.state] ?? 0;
    if (statusPriority > winnerPriority) {
      winner = status;
      continue;
    }

    if (statusPriority === winnerPriority && status.timestamp > winner.timestamp) {
      winner = status;
    }
  }

  return winner;
}

function notifyStatusChange() {
  const resolved = resolveStatus();
  currentStatus = cloneStatus(resolved);

  const snapshot = cloneStatus(resolved);
  eventBus.emit('activity:status', snapshot);

  subscribers.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante do status de atividade.', error);
    }
  });
}

function normalizeSource(source) {
  if (typeof source !== 'string') {
    return 'global';
  }

  const trimmed = source.trim();
  return trimmed ? trimmed : 'global';
}

function normalizeState(state) {
  if (typeof state !== 'string') {
    return 'idle';
  }

  const trimmed = state.trim();
  if (trimmed && Object.prototype.hasOwnProperty.call(STATE_DEFAULTS, trimmed)) {
    return trimmed;
  }

  return 'idle';
}

function buildStatusRecord(status) {
  const normalizedState = normalizeState(status?.state);
  const defaults = STATE_DEFAULTS[normalizedState] ?? STATE_DEFAULTS.idle;
  const source = normalizeSource(status?.source);

  const messageProvided =
    status && Object.prototype.hasOwnProperty.call(status, 'message') ? status.message : undefined;
  const detailsProvided =
    status && Object.prototype.hasOwnProperty.call(status, 'details') ? status.details : undefined;

  const message =
    typeof messageProvided === 'string' && messageProvided.trim()
      ? messageProvided.trim()
      : defaults.message;
  const details =
    typeof detailsProvided === 'string'
      ? detailsProvided.trim()
      : detailsProvided === ''
        ? ''
        : defaults.details;

  return {
    state: normalizedState,
    message,
    details,
    source,
    timestamp: Date.now(),
  };
}

function setStatus(status) {
  const record = buildStatusRecord(status);

  if (record.state === 'idle' && record.source !== 'global') {
    const hasMessageOverride =
      status && (Object.prototype.hasOwnProperty.call(status, 'message') || Object.prototype.hasOwnProperty.call(status, 'details'));
    if (!hasMessageOverride) {
      statuses.delete(record.source);
      notifyStatusChange();
      return cloneStatus(currentStatus);
    }
  }

  statuses.set(record.source, record);
  notifyStatusChange();
  if (record.source === currentStatus.source) {
    return cloneStatus(currentStatus);
  }
  return cloneStatus(record);
}

export function getActivityStatus() {
  return cloneStatus(currentStatus);
}

export function subscribeActivityStatus(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  subscribers.add(listener);

  return () => {
    subscribers.delete(listener);
  };
}

export function markActivityDirty(options = {}) {
  return setStatus({ ...options, state: 'dirty' });
}

export function markActivitySaving(options = {}) {
  return setStatus({ ...options, state: 'saving' });
}

export function markActivitySaved(options = {}) {
  return setStatus({ ...options, state: 'saved' });
}

export function markActivityError(options = {}) {
  return setStatus({ ...options, state: 'error' });
}

export function markActivityIdle(options = {}) {
  return setStatus({ ...options, state: 'idle' });
}

export function clearActivityStatus(source) {
  const normalizedSource = normalizeSource(source);
  if (normalizedSource === 'global') {
    statuses.set('global', { ...DEFAULT_STATUS, timestamp: Date.now() });
  } else {
    statuses.delete(normalizedSource);
  }
  notifyStatusChange();
  return getActivityStatus();
}

function resetStateForTests() {
  statuses.clear();
  statuses.set('global', { ...DEFAULT_STATUS, timestamp: Date.now() });
  notifyStatusChange();
}

resetStateForTests();

export const __TEST_ONLY__ = {
  reset: resetStateForTests,
};
