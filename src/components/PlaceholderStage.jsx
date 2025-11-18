import React from 'react';
import PropTypes from 'prop-types';

function PlaceholderStage({ stage }) {
  return (
    <section className="stage-panel placeholder-stage">
      <div className="placeholder-icon" aria-hidden>
        <span className="material-icons-sharp">{stage.icon}</span>
      </div>
      <div>
        <p className="stage-label">Etapa</p>
        <h2>{stage.title}</h2>
        <p className="subtitle">{stage.description}</p>
      </div>
    </section>
  );
}

PlaceholderStage.propTypes = {
  stage: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
};

export default PlaceholderStage;
