// Right inspector panel — renders the right form for the currently selected node.

import { useWorkflowStore } from "../store";
import { NODE_REGISTRY } from "../registry";
import { forms } from "../forms/nodeForms";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useGraphValidation } from "../hooks/useGraphValidation";

export function ConfigPanel() {
  const selectedId = useWorkflowStore((s) => s.selectedNodeId);
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === selectedId));
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const validation = useGraphValidation();

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <div className="border-b border-border px-5 py-4">
        <div className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
          Inspector
        </div>
        <h2 className="text-base font-semibold text-primary-deep">Configuration</h2>
      </div>

      {!node ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="max-w-[200px] text-center text-sm text-muted-foreground">
            Select a node on the canvas to edit its configuration.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-semibold text-surface text-xs ${NODE_REGISTRY[node.type as keyof typeof NODE_REGISTRY].colorClass}`}
                  aria-hidden
                >
                  {NODE_REGISTRY[node.type as keyof typeof NODE_REGISTRY].glyph}
                </div>
                <div className="min-w-0">
                  <div className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
                    {NODE_REGISTRY[node.type as keyof typeof NODE_REGISTRY].label} node
                  </div>
                  <div className="truncate text-sm font-medium">{node.id}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteNode(node.id)}
                aria-label="Delete node"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {validation.nodeErrors[node.id]?.length ? (
              <ul className="mt-3 space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-[11px] text-destructive">
                {validation.nodeErrors[node.id].map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {(() => {
              const Form = forms[node.type as keyof typeof forms];
              return (
                <Form
                  data={node.data}
                  onChange={(patch) => updateNodeData(node.id, patch)}
                />
              );
            })()}
          </div>
        </div>
      )}
    </aside>
  );
}
