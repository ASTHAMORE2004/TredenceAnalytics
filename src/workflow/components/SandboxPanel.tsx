// Bottom dock: workflow sandbox / execution log + import/export.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Download, Upload, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useWorkflowStore } from "../store";
import { simulateWorkflow } from "../api";
import { useGraphValidation } from "../hooks/useGraphValidation";
import { cn } from "@/lib/utils";
import type { SimulationStep } from "../types";

const statusColor: Record<SimulationStep["status"], string> = {
  info: "text-primary-mid",
  success: "text-accent",
  warn: "text-amber-600",
  error: "text-destructive",
};

export function SandboxPanel() {
  const [open, setOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const reset = useWorkflowStore((s) => s.reset);
  const loadGraph = useWorkflowStore((s) => s.loadGraph);
  const validation = useGraphValidation();

  const run = async () => {
    setRunning(true);
    setOpen(true);
    setSteps([]);
    try {
      const res = await simulateWorkflow({ nodes, edges });
      setSteps(res.steps);
    } finally {
      setRunning(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ nodes, edges }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const txt = await file.text();
        const parsed = JSON.parse(txt);
        if (parsed.nodes && parsed.edges) loadGraph(parsed);
      } catch (e) {
        alert("Invalid workflow JSON");
      }
    };
    input.click();
  };

  return (
    <section
      className={cn(
        "flex shrink-0 flex-col border-t border-border bg-background transition-[height] duration-200",
        open ? "h-72" : "h-12",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-semibold text-primary-deep hover:text-primary"
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            Sandbox & Execution Log
          </button>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono-blueprint text-[10px] uppercase",
              validation.ok
                ? "bg-accent/15 text-accent"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {validation.ok ? "Valid" : `${validation.errors.length} issue(s)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={importJSON} className="h-8">
            <Upload className="mr-1 h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="ghost" size="sm" onClick={exportJSON} className="h-8">
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (confirm("Reset workflow?")) reset(); }}
            className="h-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={run}
            disabled={running}
            className="h-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Play className="mr-1 h-3.5 w-3.5" />
            {running ? "Running…" : "Run Workflow"}
          </Button>
        </div>
      </div>
      {open && (
        <div className="flex-1 overflow-y-auto bg-background p-4">
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Click <strong>Run Workflow</strong> to simulate execution. Validation issues appear below.
            </p>
          ) : (
            <pre className="font-mono-blueprint text-xs leading-relaxed">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-muted-foreground">[{s.ts}]</span>
                  <span className={cn("font-medium uppercase", statusColor[s.status])}>
                    {s.status}
                  </span>
                  <span className="text-foreground">{s.message}</span>
                </div>
              ))}
            </pre>
          )}
          {!validation.ok && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <div className="mb-1 font-semibold">Validation issues</div>
              <ul className="space-y-0.5">
                {Array.from(new Set(validation.errors)).map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
