// ui.js
// The drag-and-drop pipeline canvas.
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';
import { nodeTypes, getInitialNodeData, configByType } from './nodes';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

// Colours the minimap dots with each node's own accent.
const accentOf = (node) => {
  const accent = configByType[node.type]?.accent || 'blue';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--accent-${accent}`)
    .trim();
};

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect } =
    useStore(selector, shallow);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const payload = event?.dataTransfer?.getData('application/reactflow');
      if (!payload || !reactFlowInstance) return;

      const type = JSON.parse(payload)?.nodeType;
      if (!type || !configByType[type]) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeID = getNodeID(type);
      addNode({
        id: nodeID,
        type,
        position,
        data: getInitialNodeData(nodeID, type),
      });
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: 'smoothstep' }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={gridSize} size={1.4} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={accentOf} nodeStrokeWidth={0} />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="canvas__empty">
          <p className="canvas__empty-title">Your canvas is empty</p>
          <p className="canvas__empty-text">
            Drag a node from the left to get started.
          </p>
        </div>
      )}
    </div>
  );
};
