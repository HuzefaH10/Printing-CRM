"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/features/companies/models/company";
import { companyRepo } from "@/features/companies/services/company.repository";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { companyColumns } from "@/features/companies/components/CompanyListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load companies
    const unsubscribe = companyRepo.subscribe(
      [],
      { orderBy: "name", orderDirection: "asc", limit: 100 },
      (data) => {
        setCompanies(data);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleRowClick = (company: Company) => {
    router.push(`/companies/${company.id}`);
  };

  const handleCreateNew = () => {
    alert("Create new company placeholder");
  };

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto">
      <PageHeader 
        title="Companies"
        description="Manage your entire business network, clients, and partners."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden md:flex shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleCreateNew} size="sm" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Company
            </Button>
          </>
        }
      />

      <div className="flex-1">
        <DataTable
          columns={companyColumns}
          data={companies}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="Search companies by name..."
          onRowClick={handleRowClick}
          emptyState={{
            title: "No companies found",
            description: "You haven't added any companies yet. Create your first company to get started."
          }}
        />
      </div>
    </div>
  );
}
