const BASE_CLASSES = 'card view view--greeting';

export function renderGreeting(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'greeting';

  const sun = document.createElement('div');
  sun.className = 'sun';
  sun.setAttribute('role', 'presentation');

  const heading = document.createElement('h1');
  heading.textContent = 'Bom dia!';

  const message = document.createElement('p');
  message.textContent =
    'Que o seu dia seja cheio de energia positiva e boas conquistas.';

  viewRoot.replaceChildren(sun, heading, message);
}
