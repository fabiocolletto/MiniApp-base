import { renderHeader } from '../components/header.js';
import { renderUserPanel } from '../components/user-panel.js';
import { renderCatalog } from '../components/catalog.js';
import { renderAccessibility } from '../components/accessibility.js';
import { renderNotifications } from '../components/notifications.js';
import { renderModals } from '../components/modals.js';
import {
  getState,
  setState,
  updateUser,
  subscribe,
  setTheme,
} from './state.js';
import { saveLocalUser, syncLocalUserToFirestore } from './storage.js';
import {
  generateUniqueIdIfMissing,
  loadLocalUser,
  saveLocalUser as persistUser,
  syncUserWithFirestore,
} from './user.js';
import { showToast } from './ui.js';

function render() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="app-shell">
      <div class="container">
        ${renderHeader()}
        <div class="grid" style="margin-top: 1rem;">
          ${renderUserPanel()}
          ${renderCatalog()}
          ${renderAccessibility()}
          ${renderNotifications()}
          ${renderModals()}
        </div>
      </div>
    </div>
  `;
  bindEvents();
}

function bindEvents() {
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const nameInput = document.getElementById('name');
  const role = document.getElementById('role');
  const theme = document.getElementById('theme');
  const language = document.getElementById('language');
  const saveBtn = document.getElementById('save-user');
  const clearBtn = document.getElementById('clear-user');
  const themeToggle = document.getElementById('theme-toggle');
  const syncNow = document.getElementById('sync-now');
  const highContrast = document.getElementById('high-contrast');
  const largeText = document.getElementById('large-text');
  const allowNotifications = document.getElementById('allow-notifications');

  phone?.addEventListener('change', async (e) => {
    const user = loadLocalUser();
    const updated = {
      ...user,
      contact: { ...user.contact, phone: e.target.value },
    };
    const stored = persistUser(updated);
    updateUser(stored);
    try {
      const uniqueId = await generateUniqueIdIfMissing(stored);
      updateUser({ ...stored, uniqueId });
      showToast('UniqueID atualizado.');
    } catch (err) {
      console.warn(err);
      showToast('Não foi possível gerar UniqueID.');
    }
  });

  email?.addEventListener('input', (e) =>
    patchUser({ contact: { email: e.target.value } }),
  );
  nameInput?.addEventListener('input', (e) =>
    patchUser({ profile: { name: e.target.value } }),
  );
  role?.addEventListener('change', (e) =>
    patchUser({ profile: { role: e.target.value } }),
  );
  theme?.addEventListener('change', (e) => {
    patchUser({ preferences: { theme: e.target.value } });
    setTheme(e.target.value);
  });
  language?.addEventListener('change', (e) =>
    patchUser({ preferences: { language: e.target.value } }),
  );
  highContrast?.addEventListener('change', (e) =>
    patchUser({ accessibility: { highContrast: e.target.checked } }),
  );
  largeText?.addEventListener('change', (e) =>
    patchUser({ accessibility: { largeText: e.target.checked } }),
  );
  allowNotifications?.addEventListener('change', (e) =>
    patchUser({ preferences: { notifications: e.target.checked } }),
  );

  saveBtn?.addEventListener('click', async () => {
    const synced = await syncUserWithFirestore();
    updateUser(synced);
    showToast('Dados sincronizados.');
  });

  clearBtn?.addEventListener('click', () => {
    localStorage.clear();
    const reset = loadLocalUser();
    updateUser(reset);
    render();
  });

  themeToggle?.addEventListener('click', () => {
    const { theme: current } = getState();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    patchUser({ preferences: { theme: next } });
  });

  syncNow?.addEventListener('click', async () => {
    const result = await syncLocalUserToFirestore();
    if (result.synced) {
      showToast('Sincronizado com sucesso.');
    } else {
      showToast('Sincronização pendente (offline ou sem UniqueID).');
    }
  });
}

function patchUser(partial) {
  const user = loadLocalUser();
  const merged = {
    ...user,
    ...partial,
    profile: { ...user.profile, ...(partial.profile || {}) },
    contact: { ...user.contact, ...(partial.contact || {}) },
    preferences: { ...user.preferences, ...(partial.preferences || {}) },
    accessibility: { ...user.accessibility, ...(partial.accessibility || {}) },
  };
  const stored = saveLocalUser(merged);
  updateUser(stored);
}

subscribe(render);
render();

window.addEventListener('online', () => {
  syncLocalUserToFirestore();
});

setState({});
