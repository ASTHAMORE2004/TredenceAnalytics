// Single source of truth for node-type metadata.
// Extending workflow with a new node = add an entry here + matching form + node component.

import type { NodeKind, NodeDataMap } from "./types";

export interface NodeTypeMeta<K extends NodeKind = NodeKind> {
  kind: K;
  label: string;
  description: string;
  /** Tailwind bg color class for the icon chip. */
  colorClass: string;
  /** Single-letter glyph for the chip. */
  glyph: string;
  defaults: () => NodeDataMap[K];
}

const baseDefaults = {
  start: (): NodeDataMap["start"] => ({
    label: "Start",
    metadata: [],
  }),
  task: (): NodeDataMap["task"] => ({
    label: "New Task",
    description: "",
    assignee: "",
    dueDate: "",
    customFields: [],
  }),
  approval: (): NodeDataMap["approval"] => ({
    label: "Approval",
    approverRole: "Manager",
    autoApproveThreshold: 0,
  }),
  automated: (): NodeDataMap["automated"] => ({
    label: "Automated Step",
    actionId: "",
    params: {},
  }),
  end: (): NodeDataMap["end"] => ({
    label: "End",
    endMessage: "Workflow complete",
    summary: true,
  }),
};

export const NODE_REGISTRY: Record<NodeKind, NodeTypeMeta> = {
  start: {
    kind: "start",
    label: "Start",
    description: "Entry point of the workflow",
    colorClass: "bg-node-start",
    glyph: "S",
    defaults: baseDefaults.start as NodeTypeMeta["defaults"],
  },
  task: {
    kind: "task",
    label: "Task",
    description: "Human task — collect docs, fill form",
    colorClass: "bg-node-task",
    glyph: "T",
    defaults: baseDefaults.task as NodeTypeMeta["defaults"],
  },
  approval: {
    kind: "approval",
    label: "Approval",
    description: "Manager / HR approval step",
    colorClass: "bg-node-approval",
    glyph: "A",
    defaults: baseDefaults.approval as NodeTypeMeta["defaults"],
  },
  automated: {
    kind: "automated",
    label: "Automated",
    description: "System-triggered action",
    colorClass: "bg-node-automated",
    glyph: "⚙",
    defaults: baseDefaults.automated as NodeTypeMeta["defaults"],
  },
  end: {
    kind: "end",
    label: "End",
    description: "Workflow completion",
    colorClass: "bg-node-end",
    glyph: "E",
    defaults: baseDefaults.end as NodeTypeMeta["defaults"],
  },
};

export const NODE_KINDS: NodeKind[] = ["start", "task", "approval", "automated", "end"];
