import React from "react";
import { Quotation } from "../models/quotation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  quotation: Quotation;
}

export function ProfitabilityAnalysis({ quotation }: Props) {
  const ccy = quotation.currency || "USD";
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(val);
  
  const totalCost = quotation.totalEstimatedCost || 0;
  const totalProfit = quotation.totalEstimatedProfit || 0;
  const grandTotal = quotation.grandTotal || 0;
  const overallMargin = quotation.overallMargin || 0;
  
  const isLowMargin = overallMargin < 20 && overallMargin > 0;
  const isLoss = overallMargin <= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600/80 mb-1">Estimated Revenue</p>
                <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(grandTotal)}</h3>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-full">
                <DollarSign className="w-4 h-4 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-rose-600/80 mb-1">Estimated Cost</p>
                <h3 className="text-2xl font-bold text-rose-700">{formatCurrency(totalCost)}</h3>
              </div>
              <div className="p-2 bg-rose-500/20 rounded-full">
                <TrendingUp className="w-4 h-4 text-rose-700 rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600/80 mb-1">Estimated Profit</p>
                <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(totalProfit)}</h3>
              </div>
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-500/20 bg-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-500/5`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-medium text-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-600/80 mb-1`}>Overall Margin</p>
                <h3 className={`text-2xl font-bold text-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-700`}>{overallMargin.toFixed(1)}%</h3>
              </div>
              <div className={`p-2 bg-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-500/20 rounded-full`}>
                <Percent className={`w-4 h-4 text-${isLoss ? 'red' : isLowMargin ? 'amber' : 'emerald'}-700`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(isLowMargin || isLoss) && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${isLoss ? 'bg-red-500/10 border-red-500/20 text-red-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-800'}`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">{isLoss ? "Critical: Selling at a loss" : "Warning: Low Margin Quote"}</h4>
            <p className="text-sm mt-1 opacity-90">
              {isLoss 
                ? "The estimated cost exceeds the grand total. This quotation will result in negative profit. Supervisor approval may be required before sending."
                : "The overall margin is below the recommended 20% threshold. Please review the costs or consider adjusting the markup."
              }
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Item Profitability Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(quotation.items && quotation.items.length > 0) ? quotation.items.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.units}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Cost</p>
                    <p className="font-medium">{formatCurrency((item.materialCost || 0) + (item.printingCost || 0) + (item.finishingCost || 0) + (item.outsourcedCost || 0))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Revenue</p>
                    <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Profit</p>
                    <p className={`font-medium ${item.profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.profit)}</p>
                  </div>
                  <div className="text-right w-16">
                    <p className="text-muted-foreground text-xs">Margin</p>
                    <Badge variant={item.margin > 20 ? "secondary" : item.margin > 0 ? "outline" : "destructive"} className="mt-0.5">
                      {item.margin.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                No items added to this quotation yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
