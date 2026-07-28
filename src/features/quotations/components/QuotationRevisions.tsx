import React, { useEffect, useState } from "react";
import { Quotation } from "../models/quotation";
import { quotationRepo } from "../services/quotation.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History, GitCommit, Copy, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/utils/date";

interface Props {
  quotation: Quotation;
}

export function QuotationRevisions({ quotation }: Props) {
  const [revisions, setRevisions] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRevisions();
  }, [quotation]);

  const loadRevisions = async () => {
    setIsLoading(true);
    try {
      const parentId = quotation.originalQuotationId || quotation.id;
      // Get all quotes that share this parent (including the parent)
      const { data } = await quotationRepo.list([{ field: "originalQuotationId", operator: "==", value: parentId }]);
      
      // Also get the parent itself if it's not in the list (because originalQuotationId might only be on children)
      let allRevs = [...data];
      if (!allRevs.find(q => q.id === parentId)) {
        const parent = await quotationRepo.get(parentId);
        if (parent) allRevs.push(parent);
      }
      
      // Sort by revision number descending
      allRevs.sort((a, b) => b.revisionNumber - a.revisionNumber);
      setRevisions(allRevs);
    } catch (err) {
      console.error("Failed to load revisions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const ccy = quotation.currency || "USD";
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" /> Revision History
        </h3>
        <Button variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-2" /> Create New Revision
        </Button>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading history...</div>
        ) : revisions.length > 0 ? (
          revisions.map((rev, idx) => {
            const isCurrent = rev.id === quotation.id;
            return (
              <div key={rev.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <GitCommit className="w-4 h-4" />
                </div>
                
                <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm ${isCurrent ? 'border-primary shadow-primary/10' : ''}`}>
                  <CardContent className="p-4 relative">
                    {isCurrent && (
                      <Badge className="absolute -top-3 -right-3">Current</Badge>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold">Revision {rev.revisionNumber}</h4>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime((rev.createdAt as any)?.toDate ? (rev.createdAt as any).toDate() : rev.createdAt || rev.issueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(rev.grandTotal)}</p>
                        <Badge variant="outline" className="mt-1">{rev.status}</Badge>
                      </div>
                    </div>
                    
                    {rev.revisionReason && (
                      <div className="mt-3 p-3 bg-muted/30 rounded text-sm text-muted-foreground border border-dashed">
                        <span className="font-semibold block mb-1">Reason for change:</span>
                        {rev.revisionReason}
                      </div>
                    )}

                    {!isCurrent && (
                      <div className="mt-4 flex gap-2">
                        <Button variant="secondary" size="sm" className="w-full">View</Button>
                        <Button variant="outline" size="sm" className="w-full">Restore</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/10 border border-dashed rounded-lg">
            No revisions found.
          </div>
        )}
      </div>
    </div>
  );
}
