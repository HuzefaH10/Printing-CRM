const fs = require('fs');
const path = require('path');

const routes = [
  'dashboard', 'companies', 'contacts', 'leads', 'opportunities', 
  'quotations', 'production', 'inventory', 'knowledge', 'tenders', 
  'documents', 'analytics', 'calendar', 'tasks', 'settings'
];

const basePath = path.join(__dirname, 'src', 'app');

routes.forEach(route => {
  const dirPath = path.join(basePath, route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const title = route.charAt(0).toUpperCase() + route.slice(1);
  
  const content = `import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ${title}Page() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">${title}</h2>
          <p className="text-muted-foreground mt-2">
            Manage your ${route} and associated records here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New ${title}
          </Button>
        </div>
      </div>
      
      {/* Empty State Placeholder */}
      <div className="flex flex-col items-center justify-center flex-1 border rounded-lg border-dashed bg-card/50">
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">📋</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No ${route} found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You don't have any ${route} yet. Create your first one to get started with the new OS.
          </p>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
  
  // Create loading.tsx
  const loadingContent = `import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="flex-1 w-full rounded-lg" />
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dirPath, 'loading.tsx'), loadingContent);
});

console.log('Placeholders created successfully.');
