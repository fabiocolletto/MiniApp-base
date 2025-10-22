import eventBus from '../events/event-bus.js';

const BASE_CLASSES = 'card view view--home';

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

export function renderHome(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'home';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title home-dashboard__title';
  heading.textContent = 'Painel inicial';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro home-dashboard__intro';
  intro.textContent =
    'Acompanhe o progresso do MiniApp Base, acione os principais painéis e descubra o que mudou nesta edição.';

  const sessionCallout = document.createElement('section');
  sessionCallout.className = 'user-details__selected home-dashboard__callout';

  const sessionText = document.createElement('p');
  sessionText.className = 'user-details__selected-text';
  sessionText.textContent = 'Nenhuma sessão ativa. Escolha um painel para começar a navegar.';

  const sessionActions = document.createElement('div');
  sessionActions.className = 'home-dashboard__callout-actions';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'user-details__selected-action home-dashboard__callout-button';
  loginButton.textContent = 'Fazer login';
  loginButton.addEventListener('click', () => navigateTo('login'));

  const registerButton = document.createElement('button');
  registerButton.type = 'button';
  registerButton.className =
    'user-details__selected-action home-dashboard__callout-button home-dashboard__callout-button--secondary';
  registerButton.textContent = 'Criar conta';
  registerButton.addEventListener('click', () => navigateTo('register'));

  sessionActions.append(loginButton, registerButton);
  sessionCallout.append(sessionText, sessionActions);

  viewRoot.replaceChildren(heading, intro, sessionCallout);
}
