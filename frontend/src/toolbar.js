// toolbar.js
// The node palette. Driven entirely by the config registry — a new entry in
// nodeConfigs.js appears here without touching this file.
// --------------------------------------------------

import { DraggableNode } from './draggableNode';
import { nodeConfigs } from './nodes';

export const PipelineToolbar = () => {
  return (
    <aside className="palette">
      <div className="palette__heading">
        <h2 className="palette__title">Nodes</h2>
        <p className="palette__hint">Drag onto the canvas to build a pipeline.</p>
      </div>
      <div className="palette__grid">
        {nodeConfigs.map((config) => (
          <DraggableNode key={config.type} config={config} />
        ))}
      </div>
    </aside>
  );
};
