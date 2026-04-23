import { ReactFlowProvider } from "reactflow";
import { NodePalette } from "@/workflow/components/NodePalette";
import { WorkflowCanvas } from "@/workflow/components/WorkflowCanvas";
import { ConfigPanel } from "@/workflow/components/ConfigPanel";
import { SandboxPanel } from "@/workflow/components/SandboxPanel";

const Index = () => {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        <div className="flex min-h-0 flex-1">
          <NodePalette />
          <main className="flex min-w-0 flex-1 flex-col">
            <header className="sr-only">
              <h1>HR Workflow Designer</h1>
            </header>
            <div className="min-h-0 flex-1">
              <WorkflowCanvas />
            </div>
          </main>
          <ConfigPanel />
        </div>
        <SandboxPanel />
      </div>
    </ReactFlowProvider>
  );
};

export default Index;
