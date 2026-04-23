import { useMemo } from "react";
import { useWorkflowStore } from "../store";
import { validateGraph } from "../validation";

export function useGraphValidation() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  return useMemo(() => validateGraph({ nodes, edges }), [nodes, edges]);
}
