// Per-node configuration forms.
// Adding a new node kind = add a component here, register in `forms` map.

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormSection } from "./Field";
import { KVEditor } from "./KVEditor";
import { useAutomations } from "../hooks/useAutomations";
import type {
  NodeKind,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from "../types";

interface FormProps<T> {
  data: T;
  onChange: (patch: Partial<T>) => void;
}

function StartForm({ data, onChange }: FormProps<StartNodeData>) {
  return (
    <FormSection>
      <Field label="Start title" required>
        <Input value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <KVEditor
        label="Metadata"
        value={data.metadata}
        onChange={(metadata) => onChange({ metadata })}
      />
    </FormSection>
  );
}

function TaskForm({ data, onChange }: FormProps<TaskNodeData>) {
  return (
    <FormSection>
      <Field label="Title" required>
        <Input value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label="Assignee">
        <Input
          value={data.assignee}
          placeholder="e.g. HR Manager, jane@acme.com"
          onChange={(e) => onChange({ assignee: e.target.value })}
        />
      </Field>
      <Field label="Due date">
        <Input
          type="date"
          value={data.dueDate}
          onChange={(e) => onChange({ dueDate: e.target.value })}
        />
      </Field>
      <KVEditor
        label="Custom fields"
        value={data.customFields}
        onChange={(customFields) => onChange({ customFields })}
      />
    </FormSection>
  );
}

function ApprovalForm({ data, onChange }: FormProps<ApprovalNodeData>) {
  return (
    <FormSection>
      <Field label="Title" required>
        <Input value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Approver role">
        <Select
          value={data.approverRole}
          onValueChange={(v) => onChange({ approverRole: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Manager", "HRBP", "Director", "Finance", "Legal"].map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Auto-approve threshold" hint="0 disables auto-approval">
        <Input
          type="number"
          min={0}
          value={data.autoApproveThreshold}
          onChange={(e) => onChange({ autoApproveThreshold: Number(e.target.value) || 0 })}
        />
      </Field>
    </FormSection>
  );
}

function AutomatedForm({ data, onChange }: FormProps<AutomatedNodeData>) {
  const { data: actions = [], isLoading } = useAutomations();
  const selected = actions.find((a) => a.id === data.actionId);

  return (
    <FormSection>
      <Field label="Title" required>
        <Input value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Action" required hint={isLoading ? "Loading…" : undefined}>
        <Select
          value={data.actionId || undefined}
          onValueChange={(actionId) => onChange({ actionId, params: {} })}
        >
          <SelectTrigger><SelectValue placeholder="Select an action" /></SelectTrigger>
          <SelectContent>
            {actions.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {selected && (
        <div className="rounded-md border border-dashed border-primary-soft bg-background p-3 space-y-3">
          <div className="font-mono-blueprint text-[10px] uppercase text-muted-foreground">
            Action parameters
          </div>
          {selected.params.map((p) => (
            <Field key={p} label={p}>
              <Input
                value={data.params[p] ?? ""}
                onChange={(e) =>
                  onChange({ params: { ...data.params, [p]: e.target.value } })
                }
              />
            </Field>
          ))}
        </div>
      )}
    </FormSection>
  );
}

function EndForm({ data, onChange }: FormProps<EndNodeData>) {
  return (
    <FormSection>
      <Field label="Title">
        <Input value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="End message">
        <Textarea
          rows={3}
          value={data.endMessage}
          onChange={(e) => onChange({ endMessage: e.target.value })}
        />
      </Field>
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
        <div>
          <div className="text-sm font-medium">Generate summary</div>
          <div className="text-xs text-muted-foreground">Include a summary in the run output</div>
        </div>
        <Switch
          checked={data.summary}
          onCheckedChange={(summary) => onChange({ summary })}
        />
      </div>
    </FormSection>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const forms: Record<NodeKind, (props: FormProps<any>) => JSX.Element> = {
  start: StartForm,
  task: TaskForm,
  approval: ApprovalForm,
  automated: AutomatedForm,
  end: EndForm,
};
