const LOG_PREFIX = '[miniapp]';

type LogLevel = 'info' | 'warn' | 'error';

type LogArgs = [event: string, message: string, error?: unknown];

type ReleaseIndicatorOptions = {
  version?: string | null;
  versionLabel?: string | null;
  publishedAt?: unknown;
  changelogPath?: string | null;
};

const releaseDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

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

function normalizeVersionLabel(rawVersion?: string | null): string {
  const cleaned = typeof rawVersion === 'string' ? rawVersion.trim() : '';
  if (!cleaned) {
    return 'v0';
  }

  const normalized = cleaned.replace(/^v/i, '');
  return `v${normalized}`;
}

function formatReleaseDateLabel(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return releaseDateFormatter.format(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return releaseDateFormatter.format(date);
    }
    return '';
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return releaseDateFormatter.format(parsed);
    }
  }

  return '';
}

export function syncSystemReleaseIndicators(options: ReleaseIndicatorOptions = {}): void {
  if (typeof document === 'undefined') {
    emit('warn', 'system.release.sync', 'Documento indisponível para sincronizar indicadores de versão.');
    return;
  }

  const versionLabel = normalizeVersionLabel(options.versionLabel ?? options.version ?? '');
  const releaseDateLabel = formatReleaseDateLabel(options.publishedAt);
  const changelogPath = typeof options.changelogPath === 'string' ? options.changelogPath.trim() : '';

  const selectSingle =
    typeof document.querySelector === 'function' ? document.querySelector.bind(document) : null;
  const selectAll =
    typeof document.querySelectorAll === 'function' ? document.querySelectorAll.bind(document) : null;

  const footerButton = selectSingle ? selectSingle('.footer-version') : null;
  if (footerButton instanceof HTMLElement) {
    const versionButtonText = footerButton.querySelector('.footer-version__text');
    if (versionButtonText instanceof HTMLElement) {
      versionButtonText.textContent = versionLabel;
    }

    const labelParts = [`versão ${versionLabel}`];
    if (releaseDateLabel) {
      labelParts.push(`publicada em ${releaseDateLabel}`);
    }

    const accessibleLabel = labelParts.join(' ');
    footerButton.setAttribute('aria-label', `Abrir registro de alterações da ${accessibleLabel}`);
    footerButton.setAttribute('title', `Exibir mudanças da ${accessibleLabel}`);
    footerButton.dataset.version = versionLabel;

    if (changelogPath) {
      footerButton.dataset.changelog = changelogPath;
    } else {
      delete footerButton.dataset.changelog;
    }
  }

  if (selectAll) {
    const versionChips = selectAll('.admin-menu__meta .miniapp-details__chip[data-type="version"]');
    versionChips.forEach((chip) => {
      if (chip instanceof HTMLElement) {
        chip.textContent = `Versão ${versionLabel}`;
      }
    });

    if (releaseDateLabel) {
      const publishedChips = selectAll(
        '.admin-menu__meta .miniapp-details__chip[data-type="published-at"]',
      );
      publishedChips.forEach((chip) => {
        if (chip instanceof HTMLElement) {
          chip.textContent = `Publicado em ${releaseDateLabel}`;
        }
      });
    }
  }

  emit('info', 'system.release.sync', `Versão ${versionLabel} sincronizada nos indicadores visuais.`);
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
