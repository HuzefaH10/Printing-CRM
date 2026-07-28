"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Company } from "@/features/companies/models/company";
import { companyRepo } from "@/features/companies/services/company.repository";
import { CompanyHeader } from "@/features/companies/components/CompanyHeader";
import { Loader2 } from "lucide-react";

export default function CompanyDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params?.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Subscribe to realtime updates for this company
    const unsubscribe = companyRepo.subscribe(
      [{ field: "id", operator: "==", value: id }],
      { limit: 1 },
      (data) => {
        if (data.length > 0) {
          setCompany(data[0]);
        } else {
          setCompany(null);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
        <p className="text-muted-foreground mb-4">This company may have been deleted or you don't have access.</p>
        <button onClick={() => router.push('/companies')} className="text-primary hover:underline">
          Return to Companies
        </button>
      </div>
    );
  }

  const tabs = [
    { name: "Overview", path: `/companies/${id}` },
    { name: "Timeline", path: `/companies/${id}/timeline` },
    { name: "Knowledge Vault", path: `/companies/${id}/knowledge` },
  ];

  return (
    <div className="flex flex-col h-full">
      <CompanyHeader company={company} />
      
      {/* Navigation Tabs */}
      <div className="flex items-center space-x-6 border-b border-border mt-4 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.path)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* We pass the company object via React Context or cloning children, but since this is App Router Layout, we can't easily pass props to children without a Context. 
            However, we can just fetch it locally in the page components, or use a custom Context Provider. 
            For simplicity and performance (since Firebase client caches aggressively), we'll let children fetch it, OR we'll use a Context.
        */}
        {children}
      </div>
    </div>
  );
}
