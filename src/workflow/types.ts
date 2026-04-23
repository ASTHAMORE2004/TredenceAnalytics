// Core workflow type definitions.
// Adding a new node type = add to NodeKind + NodeDataMap + register in registry.ts.

import type { Node, Edge } from "reactflow";

export type NodeKind =
  | "start"
  | "task"
  | "approval"
  | "automated"
  | "end";

export interface KVPair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData {
  label: string;
  metadata: KVPair[];
}

export interface TaskNodeData {
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KVPair[];
}

export interface ApprovalNodeData {
  label: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  label: string;
  actionId: string; // references AutomationDefinition.id
  params: Record<string, string>;
}

export interface EndNodeData {
  label: string;
  endMessage: string;
  summary: boolean;
}

export interface NodeDataMap {
  start: StartNodeData;
  task: TaskNodeData;
  approval: ApprovalNodeData;
  automated: AutomatedNodeData;
  end: EndNodeData;
}

export type WorkflowNodeData = NodeDataMap[NodeKind];
export type WorkflowNode<K extends NodeKind = NodeKind> = Node<NodeDataMap[K]> & {
  type: K;
};
export type WorkflowEdge = Edge;

// Serialized graph payload sent to /simulate.
export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface AutomationDefinition {
  id: string;
  label: string;
  params: string[];
}

export type SimulationStatus = "info" | "success" | "warn" | "error";

export interface SimulationStep {
  ts: string;
  nodeId?: string;
  nodeKind?: NodeKind;
  status: SimulationStatus;
  message: string;
}

export interface SimulationResult {
  ok: boolean;
  steps: SimulationStep[];
  errors: string[];
}
