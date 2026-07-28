import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground mt-2">
            Manage your leads and associated records here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Leads
          </Button>
        </div>
      </div>
      
      {/* Empty State Placeholder */}
      <div className="flex flex-col items-center justify-center flex-1 border rounded-lg border-dashed bg-card/50">
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">📋</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No leads found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You don't have any leads yet. Create your first one to get started with the new OS.
          </p>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </div>
  );
}
