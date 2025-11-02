import eventBus from '../events/event-bus.js';

const sessionListeners = new Set();
const sessionStatusListeners = new Set();

const GUEST_SESSION_STATUS = Object.freeze({
  state: 'guest',
  message: 'Navegação como convidado',
  details: 'Todos os recursos estão liberados e os dados permanecem neste dispositivo.',
});

let sessionStatus = { ...GUEST_SESSION_STATUS };

function cloneSessionStatus() {
  return {
    state: sessionStatus.state,
    message: sessionStatus.message,
    details: sessionStatus.details,
  };
}

function notifySessionStatus() {
  const snapshot = cloneSessionStatus();
  sessionStatusListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante do status da sessão.', error);
    }
  });
  eventBus.emit('session:status', snapshot);
}

function setSessionStatus(nextStatus = GUEST_SESSION_STATUS) {
  const state = typeof nextStatus?.state === 'string' ? nextStatus.state : GUEST_SESSION_STATUS.state;
  const message = typeof nextStatus?.message === 'string' ? nextStatus.message : GUEST_SESSION_STATUS.message;
  const details = typeof nextStatus?.details === 'string' ? nextStatus.details : GUEST_SESSION_STATUS.details;

  const hasChanged =
    state !== sessionStatus.state || message !== sessionStatus.message || details !== sessionStatus.details;

  sessionStatus = { state, message, details };

  if (hasChanged) {
    notifySessionStatus();
  }
}

function notifySessionListeners() {
  sessionListeners.forEach((listener) => {
    try {
      listener(null);
    } catch (error) {
      console.error('Erro ao notificar assinante da sessão ativa.', error);
    }
  });

  eventBus.emit('session:changed', null);
  setSessionStatus(GUEST_SESSION_STATUS);
}

export function getActiveUserId() {
  return null;
}

export function getActiveUser() {
  return null;
}

export function setActiveUser() {
  notifySessionListeners();
}

export function clearActiveUser() {
  notifySessionListeners();
}

export function subscribeSession(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  sessionListeners.add(listener);

  try {
    listener(null);
  } catch (error) {
    console.error('Erro ao inicializar assinante da sessão ativa.', error);
  }

  return () => {
    sessionListeners.delete(listener);
  };
}

export function getSessionStatus() {
  return cloneSessionStatus();
}

export function subscribeSessionStatus(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  sessionStatusListeners.add(listener);

  try {
    listener(getSessionStatus());
  } catch (error) {
    console.error('Erro ao inicializar assinante do status da sessão.', error);
  }

  return () => {
    sessionStatusListeners.delete(listener);
  };
}

notifySessionListeners();
