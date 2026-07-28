"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Clock,
  AlertTriangle,
  Plus,
  Download,
  FolderOpen,
  CheckCircle2,
  Search,
  Filter,
  Image as ImageIcon,
  Award,
  BookMarked,
  HardDrive
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeDashboard() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Vault</h2>
          <p className="text-muted-foreground">The institutional memory of your company. Manage documents, SOPs, and artwork.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" /> New Folder
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">142</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Documents</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-xs text-red-600/80 uppercase tracking-wider font-semibold">Expiring Certificates</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.2 GB</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Storage Used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content Area (3 Columns) */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="explorer" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-max justify-start border-b rounded-none h-auto p-0 bg-transparent mb-4 flex-nowrap">
                <TabsTrigger value="explorer" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><FolderOpen className="w-4 h-4 mr-2"/> Explorer</TabsTrigger>
                <TabsTrigger value="sops" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><CheckCircle2 className="w-4 h-4 mr-2"/> SOPs & Training</TabsTrigger>
                <TabsTrigger value="artwork" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><ImageIcon className="w-4 h-4 mr-2"/> Artwork Assets</TabsTrigger>
                <TabsTrigger value="certificates" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><Award className="w-4 h-4 mr-2"/> Certificates</TabsTrigger>
                <TabsTrigger value="articles" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><BookOpen className="w-4 h-4 mr-2"/> Internal Articles</TabsTrigger>
                <TabsTrigger value="templates" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"><BookMarked className="w-4 h-4 mr-2"/> Templates</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search documents, tags, content..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="explorer" className="mt-0 space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-muted/30 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer">Knowledge Vault</span>
                    <span>/</span>
                    <span className="text-foreground">Recent Documents</span>
                  </div>
                  
                  {/* Mock Folder */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-700">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Client Contracts (2026)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">14 items • Updated 2 days ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock Document 1 */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer border-b transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-700 font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-sm">MoE_Textbook_Tender_Specs_v2.pdf</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] font-normal">Tender Document</Badge>
                          <span className="text-xs text-muted-foreground">v2.0 • 4.2 MB • By Sarah J.</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">APPROVED</Badge>
                    </div>
                  </div>
                  
                  {/* Mock Document 2 */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                        XLSX
                      </div>
                      <div>
                        <p className="font-medium text-sm">Q3_Pricing_Matrix_Draft.xlsx</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] font-normal">Sales</Badge>
                          <span className="text-xs text-muted-foreground">v1.3 • 1.1 MB • By Finance Team</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">UNDER_REVIEW</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholders for other tabs */}
            <TabsContent value="sops">
              <Card><CardContent className="p-24 text-center text-muted-foreground"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Standard Operating Procedures and Training Manuals.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="artwork">
              <Card><CardContent className="p-24 text-center text-muted-foreground"><ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Design files, proofs, and print-ready artwork linked to Jobs.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="certificates">
              <Card><CardContent className="p-24 text-center text-muted-foreground"><Award className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>ISO Certs, Trade Licenses, and compliance documents.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="articles">
              <Card><CardContent className="p-24 text-center text-muted-foreground"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Rich-text internal wikis and knowledge base articles.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="templates">
              <Card><CardContent className="p-24 text-center text-muted-foreground"><BookMarked className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Reusable outlines for quotes, meeting minutes, and inspections.</p></CardContent></Card>
            </TabsContent>

          </Tabs>
        </div>

        {/* Sidebar Widgets (1 Column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Knowledge Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm hover:bg-muted/50 p-1.5 rounded cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Sales & Tenders</span>
                <span className="text-muted-foreground">42</span>
              </div>
              <div className="flex items-center justify-between text-sm hover:bg-muted/50 p-1.5 rounded cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Production & QA</span>
                <span className="text-muted-foreground">38</span>
              </div>
              <div className="flex items-center justify-between text-sm hover:bg-muted/50 p-1.5 rounded cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Finance & Legal</span>
                <span className="text-muted-foreground">24</span>
              </div>
              <div className="flex items-center justify-between text-sm hover:bg-muted/50 p-1.5 rounded cursor-pointer transition-colors">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> HR & Training</span>
                <span className="text-muted-foreground">15</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors">SOP-012 Heidelberg Operation Guide</p>
                <p className="text-xs text-muted-foreground">Viewed 2 hours ago</p>
              </div>
              <div>
                <p className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors">Acme_Corp_NDA_Signed.pdf</p>
                <p className="text-xs text-muted-foreground">Viewed yesterday</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
