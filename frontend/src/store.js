// store.js
// Central pipeline state: nodes, edges and the actions that mutate them.
// --------------------------------------------------

import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const edgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, height: 18, width: 18 },
};

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: {},

  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, ...edgeOptions }, get().edges) });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node
      ),
    });
  },

  // Drops edges that point at handles a node no longer renders. Nodes with
  // data-driven handles (e.g. Text) call this when their handle set shrinks,
  // which keeps edges from dangling in empty space.
  pruneNodeHandles: (nodeId, validHandleIds) => {
    const valid = new Set(validHandleIds);
    const isOrphaned = (edge) =>
      (edge.source === nodeId && edge.sourceHandle && !valid.has(edge.sourceHandle)) ||
      (edge.target === nodeId && edge.targetHandle && !valid.has(edge.targetHandle));

    const edges = get().edges;
    const remaining = edges.filter((edge) => !isOrphaned(edge));
    if (remaining.length !== edges.length) {
      set({ edges: remaining });
    }
  },
}));
