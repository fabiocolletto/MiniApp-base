import React, { useMemo, useState } from 'react';
import StageFooter from './components/StageFooter';
import PlaceholderStage from './components/PlaceholderStage';
import IframeStage from './components/IframeStage';
import './styles/app.css';

const NAV_STAGES = [
  {
    key: 'home',
    title: 'Navegação ativa',
    description: 'Visual clássico reimaginado em React, mantendo apenas a troca de stages pelo rodapé.',
    icon: 'flash_on',
    launchUrl: '',
  },
  {
    key: 'alerts',
    title: 'Notificações',
    description: 'Painel de alertas em construção.',
    icon: 'notifications',
    launchUrl: '',
  },
  {
    key: 'catalog',
    title: 'Catálogo',
    description: 'Catálogo de MiniApps renderizado como placeholder.',
    icon: 'grid_view',
    launchUrl: '',
  },
  {
    key: 'settings',
    title: 'Configurações',
    description: 'Preferências do usuário e tema.',
    icon: 'settings',
    launchUrl: '',
  },
  {
    key: 'account',
    title: 'Conta do Usuário',
    description: 'Área externa carregada em iframe.',
    icon: 'person',
    launchUrl: 'https://example.com/',
  },
];

const NAV_MAP = NAV_STAGES.reduce((acc, stage) => {
  acc[stage.key] = stage;
  return acc;
}, {});

function App() {
  const [activeKey, setActiveKey] = useState('home');
  const activeStage = useMemo(() => NAV_MAP[activeKey] ?? NAV_STAGES[0], [activeKey]);

  return (
    <div className="app-shell">
      <header className="legacy-hero">
        <div className="hero-icon" aria-hidden>
          <span className="material-icons-sharp">rocket_launch</span>
        </div>
        <div>
          <p className="eyebrow">Aplicação de Base</p>
          <h1>MiniApp 5Horas</h1>
          <p className="subtitle">
            Interface centralizada e mobile-first, com o rodapé como controle principal – agora recriada em React.
          </p>
        </div>
      </header>

      <main className="stage-area" aria-live="polite">
        {activeStage.key === 'home' && (
          <section className="stage-panel home-stage">
            <p className="stage-label">Home</p>
            <h2>{activeStage.title}</h2>
            <p className="subtitle">{activeStage.description}</p>
            <div className="home-badge">Somente navegação</div>
          </section>
        )}

        {activeStage.key !== 'home' && !activeStage.launchUrl && <PlaceholderStage stage={activeStage} />}

        {activeStage.launchUrl && <IframeStage stage={activeStage} />}
      </main>

      <StageFooter stages={NAV_STAGES} activeKey={activeKey} onNavigate={setActiveKey} />
    </div>
  );
}

export default App;
