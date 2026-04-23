// Mock API layer.
// Swap these implementations for real fetch() calls without changing callers.

import type {
  AutomationDefinition,
  WorkflowGraph,
  SimulationResult,
  SimulationStep,
} from "./types";
import { validateGraph } from "./validation";

const AUTOMATIONS: AutomationDefinition[] = [
  { id: "send_email", label: "Send Email", params: ["to", "subject", "body"] },
  { id: "generate_doc", label: "Generate Document", params: ["template", "recipient"] },
  { id: "create_ticket", label: "Create IT Ticket", params: ["category", "priority"] },
  { id: "post_slack", label: "Post Slack Message", params: ["channel", "text"] },
  { id: "provision_account", label: "Provision Account", params: ["system", "role"] },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAutomations(): Promise<AutomationDefinition[]> {
  await wait(150);
  return AUTOMATIONS;
}

/**
 * POST /simulate — accepts a workflow graph, returns a step-by-step
 * mock execution log following edges from the start node.
 */
export async function simulateWorkflow(graph: WorkflowGraph): Promise<SimulationResult> {
  await wait(250);

  const validation = validateGraph(graph);
  const steps: SimulationStep[] = [];
  const ts = () => new Date().toISOString().slice(11, 19);

  steps.push({
    ts: ts(),
    status: "info",
    message: `Validating workflow (${graph.nodes.length} nodes, ${graph.edges.length} edges)…`,
  });

  if (!validation.ok) {
    for (const err of validation.errors) {
      steps.push({ ts: ts(), status: "error", message: err });
    }
    return { ok: false, steps, errors: validation.errors };
  }

  steps.push({ ts: ts(), status: "success", message: "Validation passed" });

  // Walk the graph from the start node.
  const start = graph.nodes.find((n) => n.type === "start")!;
  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }

  const visited = new Set<string>();
  const queue: string[] = [start.id];

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const node = graph.nodes.find((n) => n.id === id);
    if (!node) continue;
    const data = node.data as { label?: string };
    const label = data.label || node.type;

    await wait(40);

    switch (node.type) {
      case "start":
        steps.push({ ts: ts(), nodeId: id, nodeKind: "start", status: "info", message: `▶ Start: ${label}` });
        break;
      case "task": {
        const t = node.data as import("./types").TaskNodeData;
        steps.push({
          ts: ts(),
          nodeId: id,
          nodeKind: "task",
          status: "info",
          message: `Task "${label}" assigned to ${t.assignee || "(unassigned)"}${t.dueDate ? ` — due ${t.dueDate}` : ""}`,
        });
        steps.push({ ts: ts(), nodeId: id, nodeKind: "task", status: "success", message: `Task "${label}" completed (mock)` });
        break;
      }
      case "approval": {
        const a = node.data as import("./types").ApprovalNodeData;
        const auto = a.autoApproveThreshold > 0;
        steps.push({
          ts: ts(),
          nodeId: id,
          nodeKind: "approval",
          status: "info",
          message: `Awaiting approval from ${a.approverRole}${auto ? ` (auto-approve ≤ ${a.autoApproveThreshold})` : ""}`,
        });
        steps.push({ ts: ts(), nodeId: id, nodeKind: "approval", status: "success", message: `Approved by ${a.approverRole}` });
        break;
      }
      case "automated": {
        const au = node.data as import("./types").AutomatedNodeData;
        const def = AUTOMATIONS.find((x) => x.id === au.actionId);
        const paramStr = def
          ? def.params.map((p) => `${p}=${au.params[p] || "∅"}`).join(", ")
          : "no action selected";
        steps.push({
          ts: ts(),
          nodeId: id,
          nodeKind: "automated",
          status: "info",
          message: `⚙ Running ${def?.label ?? "(missing action)"} — ${paramStr}`,
        });
        steps.push({ ts: ts(), nodeId: id, nodeKind: "automated", status: "success", message: `Action completed` });
        break;
      }
      case "end": {
        const e = node.data as import("./types").EndNodeData;
        steps.push({ ts: ts(), nodeId: id, nodeKind: "end", status: "success", message: `■ End: ${e.endMessage}` });
        break;
      }
    }

    const next = adj.get(id) ?? [];
    queue.push(...next);
  }

  return { ok: true, steps, errors: [] };
}
