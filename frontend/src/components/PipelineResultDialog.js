// PipelineResultDialog.js
// The alert shown once the backend has analysed the pipeline.
// --------------------------------------------------

import { useEffect } from 'react';
import './PipelineResultDialog.css';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const PipelineResultDialog = ({ result, error, onClose }) => {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const isDag = result?.is_dag;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        {error ? (
          <>
            <div className="dialog__badge dialog__badge--error">!</div>
            <h2 className="dialog__title" id="dialog-title">
              Couldn't analyze the pipeline
            </h2>
            <p className="dialog__message">{error}</p>
          </>
        ) : (
          <>
            <div className={`dialog__badge${isDag ? '' : ' dialog__badge--error'}`}>
              {isDag ? '✓' : '↺'}
            </div>
            <h2 className="dialog__title" id="dialog-title">
              Pipeline analyzed
            </h2>
            <p className="dialog__message">
              Your pipeline has {plural(result.num_nodes, 'node')} connected by{' '}
              {plural(result.num_edges, 'edge')}.
            </p>

            <div className="dialog__stats">
              <div className="dialog__stat">
                <span className="dialog__stat-value">{result.num_nodes}</span>
                <span className="dialog__stat-label">Nodes</span>
              </div>
              <div className="dialog__stat">
                <span className="dialog__stat-value">{result.num_edges}</span>
                <span className="dialog__stat-label">Edges</span>
              </div>
              <div className="dialog__stat">
                <span className="dialog__stat-value">{isDag ? 'Yes' : 'No'}</span>
                <span className="dialog__stat-label">Is a DAG</span>
              </div>
            </div>

            <p className={`dialog__verdict${isDag ? '' : ' dialog__verdict--error'}`}>
              {isDag
                ? 'This is a valid DAG — it has no cycles, so it can run start to finish.'
                : 'This is not a DAG — a cycle means the pipeline would loop forever. Remove a connection that feeds back into an earlier node.'}
            </p>
          </>
        )}

        <button type="button" className="button button--primary dialog__close" onClick={onClose} autoFocus>
          Close
        </button>
      </div>
    </div>
  );
};
