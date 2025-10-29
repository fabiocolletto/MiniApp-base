const INSTALL_BUTTON_SELECTOR = '#pwaInstallFab';

function toggleButtonVisibility(button, shouldShow) {
  if (!button) {
    return;
  }

  if (shouldShow) {
    button.removeAttribute('hidden');
    button.disabled = false;
  } else {
    button.setAttribute('hidden', '');
    button.disabled = false;
  }
}

export function initPwaInstallPrompt(windowRef = globalThis) {
  const win = windowRef ?? globalThis;
  const doc = win?.document;

  if (!win || !doc) {
    return () => {};
  }

  const button = doc.querySelector(INSTALL_BUTTON_SELECTOR);

  if (!button) {
    return () => {};
  }

  const hasBeforeInstallPromptSupport =
    'BeforeInstallPromptEvent' in win || 'onbeforeinstallprompt' in win;

  if (!hasBeforeInstallPromptSupport) {
    toggleButtonVisibility(button, false);
    return () => {};
  }

  let deferredPromptEvent = null;

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    deferredPromptEvent = event;
    toggleButtonVisibility(button, true);
  };

  const handleAppInstalled = () => {
    deferredPromptEvent = null;
    toggleButtonVisibility(button, false);
  };

  const handleVisibilityChange = () => {
    if (doc.visibilityState !== 'visible') {
      toggleButtonVisibility(button, false);
      return;
    }

    if (deferredPromptEvent) {
      toggleButtonVisibility(button, true);
    }
  };

  const handleClick = async () => {
    if (!deferredPromptEvent) {
      toggleButtonVisibility(button, false);
      return;
    }

    toggleButtonVisibility(button, true);
    button.disabled = true;

    try {
      deferredPromptEvent.prompt();
      const { outcome } = (await deferredPromptEvent.userChoice) ?? {};

      if (outcome === 'accepted') {
        handleAppInstalled();
      } else {
        toggleButtonVisibility(button, false);
      }
    } catch (error) {
      console.warn('Não foi possível exibir o prompt de instalação do PWA.', error);
      toggleButtonVisibility(button, false);
    } finally {
      deferredPromptEvent = null;
      button.disabled = false;
    }
  };

  toggleButtonVisibility(button, false);

  win.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  win.addEventListener('appinstalled', handleAppInstalled);
  doc.addEventListener('visibilitychange', handleVisibilityChange);
  button.addEventListener('click', handleClick);

  return () => {
    win.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    win.removeEventListener('appinstalled', handleAppInstalled);
    doc.removeEventListener('visibilitychange', handleVisibilityChange);
    button.removeEventListener('click', handleClick);
  };
}
