import React from 'react';
import PropTypes from 'prop-types';

function StageFooter({ stages, activeKey, onNavigate }) {
  return (
    <footer className="stage-footer">
      <nav aria-label="Navegação principal" className="footer-nav">
        {stages.map((stage) => {
          const isActive = stage.key === activeKey;
          return (
            <button
              key={stage.key}
              type="button"
              className={`nav-button ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(stage.key)}
            >
              <span className="material-icons-sharp" aria-hidden>
                {stage.icon}
              </span>
              <span className="nav-label sr-only">{stage.title}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}

StageFooter.propTypes = {
  stages: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeKey: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default StageFooter;
