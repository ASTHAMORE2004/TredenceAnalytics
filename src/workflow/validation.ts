// Graph validation — used by sandbox + node visual error markers.

import type { WorkflowGraph } from "./types";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  /** Per-node error messages keyed by nodeId. */
  nodeErrors: Record<string, string[]>;
}

export function validateGraph(graph: WorkflowGraph): ValidationResult {
  const errors: string[] = [];
  const nodeErrors: Record<string, string[]> = {};
  const addNodeErr = (id: string, msg: string) => {
    (nodeErrors[id] ??= []).push(msg);
  };

  const startNodes = graph.nodes.filter((n) => n.type === "start");
  const endNodes = graph.nodes.filter((n) => n.type === "end");

  if (startNodes.length === 0) errors.push("Workflow must contain a Start node.");
  if (startNodes.length > 1) errors.push("Workflow must have exactly one Start node.");
  if (endNodes.length === 0) errors.push("Workflow must contain at least one End node.");

  // Build adjacency + reverse.
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const e of graph.edges) {
    (outgoing.get(e.source) ?? outgoing.set(e.source, []).get(e.source)!).push(e.target);
    (incoming.get(e.target) ?? incoming.set(e.target, []).get(e.target)!).push(e.source);
  }

  for (const n of graph.nodes) {
    const inc = incoming.get(n.id)?.length ?? 0;
    const out = outgoing.get(n.id)?.length ?? 0;
    if (n.type === "start" && inc > 0) addNodeErr(n.id, "Start node cannot have incoming edges.");
    if (n.type === "end" && out > 0) addNodeErr(n.id, "End node cannot have outgoing edges.");
    if (n.type !== "start" && inc === 0) addNodeErr(n.id, "Node has no incoming connection.");
    if (n.type !== "end" && out === 0) addNodeErr(n.id, "Node has no outgoing connection.");

    if (n.type === "automated") {
      const d = n.data as { actionId?: string };
      if (!d.actionId) addNodeErr(n.id, "Select an automation action.");
    }
    if (n.type === "task") {
      const d = n.data as { label?: string };
      if (!d.label?.trim()) addNodeErr(n.id, "Task title is required.");
    }
  }

  // Cycle detection via DFS.
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  graph.nodes.forEach((n) => color.set(n.id, WHITE));
  let hasCycle = false;
  const dfs = (u: string) => {
    color.set(u, GRAY);
    for (const v of outgoing.get(u) ?? []) {
      const c = color.get(v) ?? WHITE;
      if (c === GRAY) { hasCycle = true; return; }
      if (c === WHITE) dfs(v);
      if (hasCycle) return;
    }
    color.set(u, BLACK);
  };
  for (const n of graph.nodes) {
    if ((color.get(n.id) ?? WHITE) === WHITE) dfs(n.id);
    if (hasCycle) break;
  }
  if (hasCycle) errors.push("Workflow contains a cycle.");

  // Reachability from start.
  if (startNodes.length === 1) {
    const reach = new Set<string>();
    const stack = [startNodes[0].id];
    while (stack.length) {
      const u = stack.pop()!;
      if (reach.has(u)) continue;
      reach.add(u);
      for (const v of outgoing.get(u) ?? []) stack.push(v);
    }
    for (const n of graph.nodes) {
      if (!reach.has(n.id)) addNodeErr(n.id, "Node is not reachable from Start.");
    }
  }

  Object.values(nodeErrors).forEach((list) => {
    list.forEach((m) => errors.push(m));
  });

  return { ok: errors.length === 0, errors, nodeErrors };
}
