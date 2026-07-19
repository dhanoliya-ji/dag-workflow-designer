// submit.js
// Sends the pipeline to the backend and surfaces the analysis it returns.
// --------------------------------------------------

import { useState, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';
import { PipelineResultDialog } from './components/PipelineResultDialog';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

// Send only what the backend models — React Flow decorates nodes and edges
// with view state (positions, z-index, handle geometry) that it never reads.
const serialize = (nodes, edges) => ({
  nodes: nodes.map(({ id, type, data }) => ({ id, type, data })),
  edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
  })),
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialize(nodes, edges)),
      });

      if (!response.ok) {
        throw new Error(`The server responded with ${response.status}.`);
      }

      setResult(await response.json());
    } catch (err) {
      const unreachable = err instanceof TypeError;
      setError(
        unreachable
          ? `Couldn't reach the backend at ${API_BASE_URL}. Start it with "uvicorn main:app --reload" in the /backend folder.`
          : err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [nodes, edges]);

  const dismiss = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <button
        type="submit"
        className="button button--primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Analyzing…' : 'Submit Pipeline'}
      </button>

      {(result || error) && (
        <PipelineResultDialog result={result} error={error} onClose={dismiss} />
      )}
    </>
  );
};
