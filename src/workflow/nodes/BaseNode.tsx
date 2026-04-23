// Shared shell for every custom node — keeps visual language consistent.

import { Handle, Position } from "reactflow";
import type { ReactNode } from "react";
import type { NodeKind } from "../types";
import { NODE_REGISTRY } from "../registry";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
  kind: NodeKind;
  title: string;
  subtitle?: ReactNode;
  selected?: boolean;
  hasError?: boolean;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

export function BaseNode({
  kind,
  title,
  subtitle,
  selected,
  hasError,
  showSourceHandle = true,
  showTargetHandle = true,
}: BaseNodeProps) {
  const meta = NODE_REGISTRY[kind];
  return (
    <div
      className={cn(
        "min-w-[180px] max-w-[220px] rounded-lg border bg-surface shadow-sm transition",
        "hover:shadow-md",
        selected ? "border-accent ring-2 ring-accent/40" : "border-primary-soft",
        hasError && "border-destructive ring-2 ring-destructive/30",
      )}
    >
      {showTargetHandle && <Handle type="target" position={Position.Left} />}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface font-semibold text-sm",
              meta.colorClass,
            )}
            aria-hidden
          >
            {meta.glyph}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
              {meta.label}
            </div>
            <div className="truncate text-sm font-medium text-foreground">
              {title || <span className="text-muted-foreground italic">Untitled</span>}
            </div>
          </div>
        </div>
        {subtitle && (
          <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{subtitle}</div>
        )}
        {hasError && (
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-destructive">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
            Configuration issue
          </div>
        )}
      </div>
      {showSourceHandle && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
