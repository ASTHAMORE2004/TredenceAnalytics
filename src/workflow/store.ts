// Zustand store — single source of truth for canvas state.
// Keeps React Flow handlers thin and lets any component subscribe selectively.

import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import type {
  NodeKind,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
} from "./types";
import { NODE_REGISTRY } from "./registry";

let _id = 0;
export const nextId = (kind: string) => `${kind}_${Date.now().toString(36)}_${++_id}`;

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (conn: Connection) => void;

  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<WorkflowNodeData>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  loadGraph: (g: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
  reset: () => void;
}

const initialNodes: WorkflowNode[] = [
  {
    id: "start_seed_1",
    type: "start",
    position: { x: 80, y: 160 },
    data: NODE_REGISTRY.start.defaults(),
  } as WorkflowNode,
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (conn) =>
    set({
      edges: addEdge(
        { ...conn, animated: false },
        get().edges,
      ) as WorkflowEdge[],
    }),

  addNode: (kind, position) => {
    const meta = NODE_REGISTRY[kind];
    const id = nextId(kind);
    const node: WorkflowNode = {
      id,
      type: kind,
      position,
      data: meta.defaults(),
    } as WorkflowNode;
    set({ nodes: [...get().nodes, node], selectedNodeId: id });
  },

  updateNodeData: (id, patch) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as WorkflowNode) : n,
      ),
    }),

  deleteNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    }),

  selectNode: (id) => set({ selectedNodeId: id }),

  loadGraph: ({ nodes, edges }) =>
    set({ nodes, edges, selectedNodeId: null }),

  reset: () => set({ nodes: initialNodes, edges: [], selectedNodeId: null }),
}));
