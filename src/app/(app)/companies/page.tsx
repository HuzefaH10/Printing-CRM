"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/features/companies/models/company";
import { companyRepo } from "@/features/companies/services/company.repository";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { companyColumns } from "@/features/companies/components/CompanyListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useModal } from "@/hooks/use-modal";

export default function CompaniesPage() {
  const router = useRouter();
  const modal = useModal();
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
    // We would typically open a slide-over or route to a create page
    alert("Create new company placeholder");
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your entire business network and organizational intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Company
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <DataTable
          columns={companyColumns}
          data={companies}
          isLoading={isLoading}
          searchKey="name"
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
