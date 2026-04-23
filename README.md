# HR Workflow Designer

A visual workflow builder for HR processes — onboarding, approvals, document verification — built with **React 18 + Vite + TypeScript + React Flow + Zustand + Tailwind**.

Built as a Tredence Studio Frontend Internship case study (4–6 hour time-box).

## Features

- **Drag-and-drop canvas** powered by React Flow with 5 custom node types: `Start`, `Task`, `Approval`, `Automated`, `End`.
- **Per-node configuration forms** with dynamic fields (e.g. Automated step's params change based on the selected mock action).
- **Mock API layer** (`src/workflow/api.ts`):
  - `getAutomations()` — returns automation definitions with parameter schemas.
  - `simulateWorkflow(graph)` — walks the graph from Start, returns a step-by-step execution log.
- **Sandbox panel** — Run, Reset, Import / Export workflow JSON, live validation status, scrollable execution log.
- **Live validation** — missing connections, cycles, missing Start/End, unreachable nodes, missing required fields. Errors render on the node and in the inspector.
- **MiniMap + zoom controls** for canvas navigation.

## Run locally

```bash
npm install
npm run dev
```

## Architecture

```
src/
├── pages/Index.tsx                # Layout: palette | canvas | inspector / sandbox
└── workflow/
    ├── types.ts                   # All workflow types (single source of truth)
    ├── registry.ts                # Node-type metadata + defaults factory
    ├── store.ts                   # Zustand store: nodes, edges, selection, ops
    ├── api.ts                     # Mock /automations + /simulate
    ├── validation.ts              # Pure graph validation (cycles, reachability, …)
    ├── hooks/
    │   ├── useAutomations.ts      # React Query wrapper around mock API
    │   └── useGraphValidation.ts  # Memoized validation result
    ├── nodes/
    │   ├── BaseNode.tsx           # Shared visual shell (handles, header, error state)
    │   └── index.tsx              # 5 thin node components + nodeTypes map
    ├── forms/
    │   ├── Field.tsx              # Form primitives (Field, FormSection)
    │   ├── KVEditor.tsx           # Reusable key-value list editor
    │   └── nodeForms.tsx          # 5 forms + `forms` lookup map
    └── components/
        ├── NodePalette.tsx        # Left sidebar, drag source
        ├── WorkflowCanvas.tsx     # React Flow + drop target
        ├── ConfigPanel.tsx        # Right inspector
        └── SandboxPanel.tsx       # Bottom dock: run, log, import/export
```

### Design choices

- **Zustand over context** for canvas state — selectors avoid re-rendering the whole canvas on every keystroke in the inspector.
- **Registry pattern** (`registry.ts` + `nodes/index.tsx` + `forms/nodeForms.tsx`) — adding a new node type is a localized 3-file change with no edits to canvas or store logic.
- **Validation is pure** and lives separately from the store, so the same function is reused by node visuals, the inspector, and the simulate API.
- **Mock API mirrors a REST shape** (`getAutomations`, `simulateWorkflow`) so swapping in `fetch()` later requires no caller changes.
- **All colors are HSL semantic tokens** in `index.css` and `tailwind.config.ts` — no ad-hoc colors in components.
- **Blueprint Architect** visual direction: IBM Plex Sans/Mono, blue + teal palette, structured "engineering schematic" feel.

### Assumptions

- No persistence / auth required — refresh wipes state (Import/Export JSON is the manual save path).
- Simulation is sequential BFS from the single Start node; multi-start is rejected by validation.
- "Auto-approve threshold" semantics are mocked (logged but not branched).
- A single Start node is enforced; multiple End nodes are allowed.

### What I'd add with more time

- Undo / redo history stack (the store is structured to support a snapshot pattern).
- Conditional / branch edges with labels and runtime branching in the simulator.
- Node templates library + auto-layout (e.g. dagre).
- Real backend persistence + collaborative editing (Y.js).
- Per-form validation with `zod` + `react-hook-form` for richer error states.
- E2E tests with Playwright (drag-drop interactions); unit tests for `validation.ts`.
