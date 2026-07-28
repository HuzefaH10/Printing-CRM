"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Quotation } from "@/features/quotations/models/quotation";
import { QuotationService } from "@/features/quotations/services/quotation.service";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Send, Download, Printer, Copy, AlertTriangle, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProfitabilityAnalysis } from "@/features/quotations/components/ProfitabilityAnalysis";
import { QuotationRevisions } from "@/features/quotations/components/QuotationRevisions";

export default function QuotationProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    setIsLoading(true);
    try {
      const data = await QuotationService.getQuotationById(id);
      setQuotation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!quotation) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold mb-2">Quotation Not Found</h2>
        <Button onClick={() => router.push("/quotations")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/quotations")} className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> PDF</Button>
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-2" /> Print</Button>
          <Button variant="outline" size="sm"><Copy className="w-4 h-4 mr-2" /> Duplicate</Button>
          <Button size="sm"><Send className="w-4 h-4 mr-2" /> Send to Client</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{quotation.quotationNumber}</h1>
            <Badge variant="secondary" className="text-sm">v{quotation.revisionNumber}</Badge>
            <Badge variant="outline" className="text-sm">{quotation.status}</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{quotation.title}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Grand Total</p>
          <p className="text-4xl font-bold font-mono">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: quotation.currency || 'USD' }).format(quotation.grandTotal || 0)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Print Items</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="materials">Materials Costing</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Quotation Overview details go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p>Detailed Print Items editor goes here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <ProfitabilityAnalysis quotation={quotation} />
        </TabsContent>
        
        <TabsContent value="revisions">
          <QuotationRevisions quotation={quotation} />
        </TabsContent>

        <TabsContent value="production">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p>Production Engine Integration Placeholder</p>
              <p className="text-xs mt-2">Converted production jobs and their status will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p className="font-semibold mb-1">Materials Costing</p>
              <p className="text-sm">Future quotation costing will estimate material requirements based on inventory data.</p>
              <p className="text-xs mt-4 text-muted-foreground">Connects to the Warehouse &amp; Inventory Intelligence Engine.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground py-24">
              <p>Activity Engine Integration placeholder.</p>
              <p className="text-xs mt-2">The Universal Activity Engine will render a timeline specifically filtered for this quotation.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
