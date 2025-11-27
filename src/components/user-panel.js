import { getState } from '../core/state.js';

export function renderUserPanel() {
  const { user } = getState();
  return `
    <section class="card" aria-label="Painel do usuário">
      <div class="section-title">
        <div>
          <h2>Dados do Usuário</h2>
          <p class="small">Edite o telefone para gerar UniqueID automaticamente.</p>
        </div>
        <span class="tag">Offline-first</span>
      </div>
      <div class="grid two">
        <div>
          <label class="label" for="phone">Telefone</label>
          <input id="phone" class="input" value="${user.contact.phone || ''}" placeholder="+55 11 99999-9999" />
        </div>
        <div>
          <label class="label" for="email">E-mail</label>
          <input id="email" class="input" type="email" value="${user.contact.email || ''}" placeholder="nome@email.com" />
        </div>
        <div>
          <label class="label" for="name">Nome</label>
          <input id="name" class="input" value="${user.profile.name || ''}" placeholder="Seu nome" />
        </div>
        <div>
          <label class="label" for="role">Perfil</label>
          <select id="role" class="input">
            <option value="aluno" ${user.profile.role === 'aluno' ? 'selected' : ''}>Aluno</option>
            <option value="tutor" ${user.profile.role === 'tutor' ? 'selected' : ''}>Tutor</option>
            <option value="professor" ${user.profile.role === 'professor' ? 'selected' : ''}>Professor</option>
          </select>
        </div>
        <div>
          <label class="label" for="theme">Tema</label>
          <select id="theme" class="input">
            <option value="light" ${user.preferences.theme === 'light' ? 'selected' : ''}>Claro</option>
            <option value="dark" ${user.preferences.theme === 'dark' ? 'selected' : ''}>Escuro</option>
          </select>
        </div>
        <div>
          <label class="label" for="language">Idioma</label>
          <select id="language" class="input">
            <option value="pt-BR" ${user.preferences.language === 'pt-BR' ? 'selected' : ''}>Português</option>
            <option value="en-US" ${user.preferences.language === 'en-US' ? 'selected' : ''}>Inglês</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="primary" id="save-user">Salvar e sincronizar</button>
        <button class="secondary" id="clear-user">Limpar local</button>
      </div>
      <p class="small" style="margin-top: 0.5rem;">Estado: ${user.needsSync ? 'Sincronização pendente' : 'Atualizado'}</p>
    </section>
  `;
}
