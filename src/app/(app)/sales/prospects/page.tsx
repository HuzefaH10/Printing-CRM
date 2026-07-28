"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProspectService } from "@/services/prospect.service";
import { Prospect } from "@/types/prospect";
import { ImportProspectsButton } from "@/components/prospects/ImportProspectsButton";
import { Search, Plus, Filter, ArrowRight, UserPlus, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProspects = async () => {
    setLoading(true);
    try {
      const data = await ProspectService.getAllProspects();
      setProspects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const filtered = prospects.filter(p => 
    p.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
    p.industry?.toLowerCase().includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const total = prospects.length;
  const gov = prospects.filter(p => p.industry?.toLowerCase().includes('government') || p.organizationName?.toLowerCase().includes('ministry')).length;
  const hot = prospects.filter(p => p.priority === 'High' || p.priority === 'Critical').length;
  const converted = prospects.filter(p => p.status === 'Converted').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prospect Database</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your sales acquisition pipeline before they become customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {total === 0 && (
            <ImportProspectsButton onComplete={loadProspects} />
          )}
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Prospect
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{total}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Government / Public</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{gov}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-amber-500">{hot}</div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted to Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums text-emerald-500">{converted}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated border-border/50">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search prospects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/30"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Industry</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading prospects...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No prospects found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/sales/prospects/${p.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {p.organizationName}
                      </Link>
                      {p.website && <div className="text-xs text-muted-foreground mt-0.5">{p.website}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.industry || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-normal bg-primary/10 text-primary hover:bg-primary/20">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        p.priority === 'High' || p.priority === 'Critical' ? 'text-amber-500' : 'text-muted-foreground'
                      }`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.rating || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/sales/prospects/${p.id}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
