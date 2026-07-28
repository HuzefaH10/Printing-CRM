"use client";

import React, { useEffect, useState } from "react";
import { Quotation } from "@/features/quotations/models/quotation";
import { quotationRepo } from "@/features/quotations/services/quotation.repository";
import { QuotationListTable } from "@/features/quotations/components/QuotationListTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText, CheckCircle2, TrendingUp, Clock } from "lucide-react";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setIsLoading(true);
    try {
      const { data } = await quotationRepo.list();
      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeQuotations = quotations.filter(q => !q.isArchived);
  const totalValue = activeQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const acceptedValue = activeQuotations.filter(q => q.status === "Accepted").reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage your pricing, estimates, and customer approvals.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeQuotations.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Quotes</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pipeline Value</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(acceptedValue)}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Won Revenue</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {activeQuotations.filter(q => q.status === "Awaiting Approval" || q.status === "Sent").length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Approval</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <QuotationListTable quotations={activeQuotations} isLoading={isLoading} />
      </div>
    </div>
  );
}
