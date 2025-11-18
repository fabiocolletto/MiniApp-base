import React from 'react';
import PropTypes from 'prop-types';

function IframeStage({ stage }) {
  return (
    <section className="stage-panel iframe-stage">
      <div className="iframe-header">
        <div>
          <p className="stage-label">Iframe externo</p>
          <h2>{stage.title}</h2>
          <p className="subtitle">Conteúdo carregado fora do shell principal.</p>
        </div>
        <span className="material-icons-sharp" aria-hidden>
          open_in_new
        </span>
      </div>
      <div className="iframe-wrapper">
        <iframe title={stage.title} src={stage.launchUrl} allow="fullscreen" loading="lazy" />
      </div>
    </section>
  );
}

IframeStage.propTypes = {
  stage: PropTypes.shape({
    title: PropTypes.string.isRequired,
    launchUrl: PropTypes.string.isRequired,
  }).isRequired,
};

export default IframeStage;
