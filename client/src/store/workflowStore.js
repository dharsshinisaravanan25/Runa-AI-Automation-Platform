import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export const useWorkflowStore = create((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  nodeStatuses: {}, // nodeId -> 'idle' | 'running' | 'completed' | 'failed'

  // Initialize or set active workflow
  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNodeId: null,
      isDirty: false,
      nodeStatuses: {}
    });
  },

  // React Flow state handlers
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, id: `e_${connection.source}-${connection.target}` }, get().edges),
      isDirty: true
    });
  },

  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
      selectedNodeId: node.id,
      isDirty: true
    });
  },

  updateNodeData: (nodeId, dataUpdate) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...dataUpdate,
              config: {
                ...(n.data.config || {}),
                ...(dataUpdate.config || {})
              }
            }
          };
        }
        return n;
      }),
      isDirty: true
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true
    });
  },

  setSelectedNodeId: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  setNodeStatus: (nodeId, status) => {
    set({
      nodeStatuses: {
        ...get().nodeStatuses,
        [nodeId]: status
      }
    });
  },

  resetNodeStatuses: () => {
    set({ nodeStatuses: {} });
  },

  markSaved: (updatedWorkflow) => {
    set({
      workflow: updatedWorkflow || get().workflow,
      isDirty: false
    });
  }
}));
