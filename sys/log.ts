const LOG_PREFIX = '[miniapp]';

type LogLevel = 'info' | 'warn' | 'error';

type LogArgs = [event: string, message: string, error?: unknown];

function formatMessage(level: LogLevel, event: string, message: string): string {
  return `${LOG_PREFIX}[${level}] ${event}: ${message}`;
}

function emit(level: LogLevel, ...args: LogArgs): void {
  const [event, message, error] = args;
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

export function logInfo(event: string, message: string): void {
  emit('info', event, message);
}

export function logWarn(event: string, message: string): void {
  emit('warn', event, message);
}

export function logError(event: string, message: string, error?: unknown): void {
  emit('error', event, message, error);
}
