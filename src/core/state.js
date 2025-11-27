import { loadLocalUser } from './user.js';

const listeners = new Set();

const state = {
  user: loadLocalUser(),
  currentScreen: 'catalog',
  panel: 'user',
  modal: null,
  theme: loadLocalUser().preferences?.theme || 'light',
};

export function getState() {
  return state;
}

export function setState(patch) {
  Object.assign(state, patch);
  notify();
}

export function updateUser(userPatch) {
  state.user = { ...state.user, ...userPatch };
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) {
    listener(state);
  }
}

export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  notify();
}

setTheme(state.theme);
