// Left palette — drag to canvas. HTML5 drag-and-drop with a `application/reactflow` payload.

import { NODE_REGISTRY, NODE_KINDS } from "../registry";
import { cn } from "@/lib/utils";
import type { NodeKind } from "../types";

export function NodePalette() {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, kind: NodeKind) => {
    e.dataTransfer.setData("application/reactflow", kind);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-4 py-4">
        <div className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
          Module
        </div>
        <h1 className="text-base font-semibold text-primary-deep">HR Workflow Designer</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-3 font-mono-blueprint text-[10px] uppercase text-muted-foreground">
          Node Types
        </h2>
        <div className="space-y-2">
          {NODE_KINDS.map((kind) => {
            const meta = NODE_REGISTRY[kind];
            return (
              <div
                key={kind}
                draggable
                onDragStart={(e) => onDragStart(e, kind)}
                className="group flex cursor-grab items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 shadow-sm transition hover:border-accent hover:shadow active:cursor-grabbing"
                title={meta.description}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md font-semibold text-surface",
                    meta.colorClass,
                  )}
                  aria-hidden
                >
                  {meta.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{meta.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {meta.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          Drag a node onto the canvas. Connect handles to define flow.
        </p>
      </div>
    </aside>
  );
}
