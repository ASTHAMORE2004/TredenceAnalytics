// React Flow canvas — drop target, selection, connection wiring.

import { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "../store";
import { nodeTypes } from "../nodes";
import type { NodeKind } from "../types";

export function WorkflowCanvas() {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/reactflow") as NodeKind;
      if (!kind || !rfInstance.current) return;
      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      addNode(kind, position);
    },
    [addNode],
  );

  return (
    <div ref={wrapper} className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(inst) => (rfInstance.current = inst)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, n) => selectNode(n.id)}
        onPaneClick={() => selectNode(null)}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="hsl(var(--primary-soft))" />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={2}
          nodeColor={(n) => {
            const map: Record<string, string> = {
              start: "hsl(var(--node-start))",
              task: "hsl(var(--node-task))",
              approval: "hsl(var(--node-approval))",
              automated: "hsl(var(--node-automated))",
              end: "hsl(var(--node-end))",
            };
            return map[n.type ?? ""] || "hsl(var(--primary-mid))";
          }}
        />
      </ReactFlow>
    </div>
  );
}
