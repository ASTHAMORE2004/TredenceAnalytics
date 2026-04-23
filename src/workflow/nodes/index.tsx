// Thin per-type wrappers around BaseNode. Adding a new node kind = add one component here.

import { memo } from "react";
import type { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { useGraphValidation } from "../hooks/useGraphValidation";
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from "../types";

const useErr = (id: string): boolean => {
  const v = useGraphValidation();
  return (v.nodeErrors[id]?.length ?? 0) > 0;
};

export const StartNode = memo(({ id, data, selected }: NodeProps<StartNodeData>) => (
  <BaseNode
    kind="start"
    title={data.label}
    selected={selected}
    hasError={useErr(id)}
    showTargetHandle={false}
    subtitle={data.metadata.length ? `${data.metadata.length} metadata` : undefined}
  />
));
StartNode.displayName = "StartNode";

export const TaskNode = memo(({ id, data, selected }: NodeProps<TaskNodeData>) => (
  <BaseNode
    kind="task"
    title={data.label}
    selected={selected}
    hasError={useErr(id)}
    subtitle={
      data.assignee ? `→ ${data.assignee}${data.dueDate ? ` · ${data.dueDate}` : ""}` : undefined
    }
  />
));
TaskNode.displayName = "TaskNode";

export const ApprovalNode = memo(({ id, data, selected }: NodeProps<ApprovalNodeData>) => (
  <BaseNode
    kind="approval"
    title={data.label}
    selected={selected}
    hasError={useErr(id)}
    subtitle={`Approver: ${data.approverRole}`}
  />
));
ApprovalNode.displayName = "ApprovalNode";

export const AutomatedNode = memo(({ id, data, selected }: NodeProps<AutomatedNodeData>) => (
  <BaseNode
    kind="automated"
    title={data.label}
    selected={selected}
    hasError={useErr(id)}
    subtitle={data.actionId ? `Action: ${data.actionId}` : "No action selected"}
  />
));
AutomatedNode.displayName = "AutomatedNode";

export const EndNode = memo(({ id, data, selected }: NodeProps<EndNodeData>) => (
  <BaseNode
    kind="end"
    title={data.label}
    selected={selected}
    hasError={useErr(id)}
    showSourceHandle={false}
    subtitle={data.endMessage}
  />
));
EndNode.displayName = "EndNode";

export const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};
