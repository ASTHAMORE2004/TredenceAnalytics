// Reusable key-value editor used by Start metadata + Task custom fields.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { KVPair } from "../types";

interface KVEditorProps {
  label: string;
  value: KVPair[];
  onChange: (next: KVPair[]) => void;
}

export function KVEditor({ label, value, onChange }: KVEditorProps) {
  const update = (id: string, patch: Partial<KVPair>) =>
    onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) => onChange(value.filter((p) => p.id !== id));
  const add = () =>
    onChange([
      ...value,
      { id: `kv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, key: "", value: "" },
    ]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
          {label}
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={add} className="h-6 px-2 text-xs">
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">No entries.</p>
      ) : (
        <div className="space-y-2">
          {value.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <Input
                value={p.key}
                onChange={(e) => update(p.id, { key: e.target.value })}
                placeholder="key"
                className="h-8 text-xs"
              />
              <Input
                value={p.value}
                onChange={(e) => update(p.id, { value: e.target.value })}
                placeholder="value"
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(p.id)}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove pair"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
