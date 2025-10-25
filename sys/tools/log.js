const LOG_PREFIX = '[miniapp]';

function formatMessage(level, event, message) {
  return `${LOG_PREFIX}[${level}] ${event}: ${message}`;
}

function emit(level, event, message, error) {
  const formatted = formatMessage(level, event, message);

  if (level === 'error') {
    if (error instanceof Error) {
      console.error(formatted, error);
    } else if (error) {
      console.error(formatted, error);
    } else {
      console.error(formatted);
    }
    return;
  }

  if (level === 'warn') {
    console.warn(formatted);
    return;
  }

  console.info(formatted);
}

export function logInfo(event, message) {
  emit('info', event, message);
}

export function logWarn(event, message) {
  emit('warn', event, message);
}

export function logError(event, message, error) {
  emit('error', event, message, error);
}
