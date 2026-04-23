// Shared form primitives so each node form stays declarative.

import type { ReactNode } from "react";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block font-mono-blueprint text-[10px] uppercase text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormSection({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
