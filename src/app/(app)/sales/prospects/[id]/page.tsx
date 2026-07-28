"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProspectService } from "@/services/prospect.service";
import { Prospect } from "@/types/prospect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle2, Globe, MapPin, Target, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ConvertProspectModal } from "@/components/prospects/ConvertProspectModal";

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      ProspectService.getProspect(params.id as string)
        .then(data => setProspect(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>;
  if (!prospect) return <div className="p-8 text-center text-muted-foreground">Prospect not found.</div>;

  const isConverted = prospect.status === 'Converted';

  // Profile Completeness calculation
  const requiredFields = [
    prospect.organizationName,
    prospect.industry,
    prospect.website,
    prospect.location,
    prospect.likelyPrintingRequirements
  ];
  const filledFields = requiredFields.filter(f => !!f).length;
  const completeness = Math.round((filledFields / requiredFields.length) * 100);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/sales/prospects" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Database
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{prospect.organizationName}</h1>
            <Badge variant="outline" className={
              prospect.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              prospect.priority === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-muted text-muted-foreground'
            }>
              {prospect.priority} Priority
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">{prospect.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {prospect.industry && <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {prospect.industry}</span>}
            {prospect.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {prospect.location}</span>}
            {prospect.website && (
              <a href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Globe className="w-4 h-4"/> {prospect.website}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isConverted ? (
            <Button onClick={() => setConvertModalOpen(true)} className="gap-2 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 className="w-4 h-4" /> Convert to Company
            </Button>
          ) : (
            <Button variant="outline" className="gap-2 border-emerald-500/30 text-emerald-500 bg-emerald-500/10" disabled>
              <CheckCircle2 className="w-4 h-4" /> Converted
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none h-auto p-0 pb-0 mb-6 flex-wrap gap-1">
              <TabsTrigger value="details" className="rounded-lg rounded-b-none px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/[0.12] data-[state=active]:text-primary border-b-2 border-b-transparent data-[state=active]:border-b-primary">Details</TabsTrigger>
              <TabsTrigger value="requirements" className="rounded-lg rounded-b-none px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/[0.12] data-[state=active]:text-primary border-b-2 border-b-transparent data-[state=active]:border-b-primary">Requirements</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg rounded-b-none px-4 py-2.5 text-sm font-medium data-[state=active]:bg-primary/[0.12] data-[state=active]:text-primary border-b-2 border-b-transparent data-[state=active]:border-b-primary">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6 mt-0">
              <Card className="card-elevated border-0 rounded-xl">
                <CardHeader className="pb-3 pt-5 px-6">
                  <CardTitle className="text-[15px]">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</h4>
                    <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{prospect.description || "No description provided."}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tender Participant</h4>
                      <p>{prospect.tenderParticipant ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Rating</h4>
                      <p className="text-amber-400 tracking-widest">{prospect.rating || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6 mt-0">
              <Card className="card-elevated border-0 rounded-xl">
                <CardHeader className="pb-3 pt-5 px-6">
                  <CardTitle className="text-[15px]">Printing Requirements</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 text-sm">
                  <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">{prospect.likelyPrintingRequirements || "No specific requirements logged."}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <Card className="card-elevated border-0 rounded-xl p-12 text-center text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Timeline and Activities module not yet linked.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="card-elevated border-0 rounded-xl">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-[15px]">Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold tabular-nums text-primary">{completeness}%</div>
                <div className="w-16 h-16 rounded-full border-4 border-muted relative flex items-center justify-center">
                  {/* Fake SVG circle for completion */}
                  <svg className="w-full h-full absolute -rotate-90">
                    <circle cx="50%" cy="50%" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray="175" strokeDashoffset={175 - (175 * completeness / 100)} strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {completeness < 100 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-xs text-amber-500/90 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Missing key fields: {requiredFields.map((f, i) => !f ? ['Name','Industry','Website','Location','Requirements'][i] : null).filter(Boolean).join(', ')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {isConverted && prospect.convertedCompanyId && (
            <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-xl">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-emerald-500 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Successfully Converted
                </h3>
                <p className="text-xs text-muted-foreground mb-4">This prospect was converted into an active customer company.</p>
                <Link href={`/companies/${prospect.convertedCompanyId}`}>
                  <Button variant="outline" className="w-full text-xs border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500">
                    View Company Record <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConvertProspectModal 
        prospect={prospect} 
        isOpen={convertModalOpen} 
        onClose={() => setConvertModalOpen(false)}
        onSuccess={() => {
          setConvertModalOpen(false);
          // Reload prospect to show converted state
          ProspectService.getProspect(prospect.id!).then(data => setProspect(data));
        }}
      />
    </div>
  );
}
