"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProspectService } from "@/services/prospect.service";
import { Prospect, ProspectStatus, ProspectPriority } from "@/types/prospect";
import { ImportProspectsButton } from "@/components/prospects/ImportProspectsButton";
import { 
  Search, Plus, Filter, ArrowRight, Star, Building2, 
  Trash2, Mail, Phone, Globe, MapPin, MoreHorizontal, AlertCircle, BookOpen, CheckCircle2, Info
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MethodologyContent } from "./MethodologyContent";

type SortField = 'organizationName' | 'industry' | 'status' | 'priority' | 'rating';
type SortOrder = 'asc' | 'desc';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('organizationName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Expandable Row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Convert Modal
  const [prospectToConvert, setProspectToConvert] = useState<Prospect | null>(null);
  const [isConverting, setIsConverting] = useState(false);

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

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProspectStatus) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    await ProspectService.updateProspect(id, { status: newStatus });
  };

  const handlePriorityChange = async (id: string, newPriority: ProspectPriority) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, priority: newPriority } : p));
    await ProspectService.updateProspect(id, { priority: newPriority });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prospect?")) {
      await ProspectService.deleteProspect(id);
      setProspects(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleConvert = async () => {
    if (!prospectToConvert || !prospectToConvert.id) return;
    setIsConverting(true);
    try {
      await ProspectService.convertToCompany(prospectToConvert.id);
      setProspectToConvert(null);
      loadProspects(); // Reload to get updated stats and statuses
    } catch (e) {
      console.error(e);
      alert("Failed to convert prospect.");
    } finally {
      setIsConverting(false);
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(p => p.id!)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Processing Data
  const filtered = useMemo(() => {
    let result = prospects.filter(p => 
      p.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
      p.industry?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase())
    );

    if (activeFilter === 'gov') {
      result = result.filter(p => p.industry?.toLowerCase().includes('government') || p.organizationName?.toLowerCase().includes('ministry'));
    } else if (activeFilter === 'high') {
      result = result.filter(p => p.priority === 'High' || p.priority === 'Critical');
    } else if (activeFilter === 'converted') {
      result = result.filter(p => p.status === 'Converted');
    }

    result.sort((a, b) => {
      let aVal: any = a[sortField] || '';
      let bVal: any = b[sortField] || '';
      
      if (sortField === 'priority') {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      }

      if (sortField === 'rating') {
        aVal = String(aVal).length;
        bVal = String(bVal).length;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [prospects, search, activeFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Stats
  const total = prospects.length;
  const gov = prospects.filter(p => p.industry?.toLowerCase().includes('government') || p.organizationName?.toLowerCase().includes('ministry')).length;
  const hot = prospects.filter(p => p.priority === 'High' || p.priority === 'Critical').length;
  const converted = prospects.filter(p => p.status === 'Converted').length;

  const renderStars = (rating: string) => {
    const count = rating?.length || 0;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-3.5 h-3.5 ${star <= count ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'High': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'Medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'Low': return 'text-slate-600 bg-slate-100 dark:bg-slate-800';
      default: return 'text-muted-foreground bg-muted';
    }
  };

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
          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <BookOpen className="w-4 h-4" /> View Methodology
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Data Methodology</DialogTitle>
                <DialogDescription>
                  Context and guidelines for the Master Prospect Database.
                </DialogDescription>
              </DialogHeader>
              <MethodologyContent />
            </DialogContent>
          </Dialog>
          <ImportProspectsButton onComplete={loadProspects} />
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Prospect
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="text-left" onClick={() => setActiveFilter(activeFilter === null ? null : null)}>
          <Card className={`card-elevated hover:border-primary/50 transition-colors cursor-pointer ${activeFilter === null ? 'border-primary' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{total}</div>
            </CardContent>
          </Card>
        </button>
        <button className="text-left" onClick={() => setActiveFilter(activeFilter === 'gov' ? null : 'gov')}>
          <Card className={`card-elevated hover:border-primary/50 transition-colors cursor-pointer ${activeFilter === 'gov' ? 'border-primary' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Government / Public</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{gov}</div>
            </CardContent>
          </Card>
        </button>
        <button className="text-left" onClick={() => setActiveFilter(activeFilter === 'high' ? null : 'high')}>
          <Card className={`card-elevated hover:border-primary/50 transition-colors cursor-pointer ${activeFilter === 'high' ? 'border-primary' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-amber-500">{hot}</div>
            </CardContent>
          </Card>
        </button>
        <button className="text-left" onClick={() => setActiveFilter(activeFilter === 'converted' ? null : 'converted')}>
          <Card className={`card-elevated hover:border-primary/50 transition-colors cursor-pointer ${activeFilter === 'converted' ? 'border-primary' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Converted to Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-emerald-500">{converted}</div>
            </CardContent>
          </Card>
        </button>
      </div>

      <Card className="card-elevated border-border/50">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">{selectedIds.size} selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3">
                  Bulk Actions <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
                  <DropdownMenuItem>Mark as High Priority</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium w-10">
                  <Checkbox 
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('organizationName')}>
                  Organization {sortField === 'organizationName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('industry')}>
                  Industry {sortField === 'industry' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('priority')}>
                  Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('rating')}>
                  Rating {sortField === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading prospects...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-10 h-10 mb-4 opacity-20" />
                      <p className="text-base font-medium text-foreground">No prospects found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                      {(search || activeFilter) && (
                        <Button variant="link" onClick={() => {setSearch(""); setActiveFilter(null);}} className="mt-2">
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Checkbox 
                          checked={selectedIds.has(p.id!)}
                          onCheckedChange={() => toggleSelect(p.id!)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setExpandedId(expandedId === p.id ? null : p.id!)}
                            className="font-medium text-foreground hover:text-primary transition-colors text-left"
                          >
                            {p.organizationName}
                          </button>
                          {p.contactVerificationStatus?.startsWith('Verified') && (
                            <div title={p.contactVerificationStatus} className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {p.outsourcingStatus === 'Confirmed' && (
                            <div title="Confirmed Print Outsourcer" className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Top Lead
                            </div>
                          )}
                        </div>
                        {p.website && <div className="text-xs text-muted-foreground mt-0.5">{p.website}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{p.industry || '-'}</td>
                      <td className="px-6 py-4">
                        <Select 
                          value={p.status} 
                          onValueChange={(val: string | null) => val && handleStatusChange(p.id!, val as ProspectStatus)}
                        >
                          <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none w-32 p-0 -ml-2 focus:ring-0">
                            <Badge variant="secondary" className="font-normal bg-primary/10 text-primary hover:bg-primary/20 w-fit">
                              {p.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Researching">Researching</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={p.priority} 
                          onValueChange={(val: string | null) => val && handlePriorityChange(p.id!, val as ProspectPriority)}
                        >
                          <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none w-28 p-0 -ml-2 focus:ring-0">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(p.priority)}`}>
                              {p.priority}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(p.rating)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="View details" onClick={() => setExpandedId(expandedId === p.id ? null : p.id!)}>
                            <Search className="w-4 h-4" />
                          </Button>
                          {p.status !== 'Converted' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" title="Convert to Company" onClick={() => setProspectToConvert(p)}>
                              <Building2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" title="Delete" onClick={() => handleDelete(p.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Details Row */}
                    {expandedId === p.id && (
                      <tr className="bg-muted/10 border-b border-border/50">
                        <td colSpan={7} className="px-12 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                  <span>{p.location || 'No location provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span>{p.website || 'No website'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span>{p.decisionMakerEmail || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span>{p.decisionMakerPhone || 'No phone'}</span>
                                </div>
                                <div className="mt-3 bg-muted/50 p-2 rounded-md border border-border/50">
                                  <p className="text-xs font-medium mb-1 text-foreground flex items-center gap-1.5">
                                    {p.contactVerificationStatus?.startsWith('Verified') ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                                    Contact Verification
                                  </p>
                                  <p className="text-xs text-muted-foreground">{p.contactVerificationStatus || 'Unverified'}</p>
                                </div>
                                {p.sourceList && (
                                  <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-medium text-foreground">Source:</span> {p.sourceList}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Printing Requirements</h4>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground block text-xs">General Needs</span>
                                  <p className="text-foreground leading-relaxed">{p.likelyPrintingRequirements || 'No general needs documented.'}</p>
                                </div>
                                {p.printingTypesNeeded && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs">Specific Types</span>
                                    <p className="text-foreground leading-relaxed">{p.printingTypesNeeded}</p>
                                  </div>
                                )}
                                {p.printFrequency && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs">Frequency</span>
                                    <p className="text-foreground leading-relaxed">{p.printFrequency}</p>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {p.producesPhysicalPrint && (
                                    <Badge variant="outline" className="bg-muted text-muted-foreground font-normal">Produces Print: {p.producesPhysicalPrint}</Badge>
                                  )}
                                  {p.outsourcesPrintng && (
                                    <Badge variant="outline" className="bg-muted text-muted-foreground font-normal">Outsources: {p.outsourcesPrintng}</Badge>
                                  )}
                                  {p.outsourcingStatus && (
                                    <Badge variant="outline" className={p.outsourcingStatus === 'Confirmed' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400' : 'bg-muted text-muted-foreground font-normal'}>Status: {p.outsourcingStatus}</Badge>
                                  )}
                                </div>
                                {p.tenderParticipant && (
                                  <Badge variant="outline" className="mt-2 border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800 dark:text-indigo-400">
                                    Public Tenders Participant
                                  </Badge>
                                )}
                                {p.tenderProcurementEvidence && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs">Tender Evidence</span>
                                    <p className="text-foreground leading-relaxed italic text-xs">{p.tenderProcurementEvidence}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Context & Intelligence</h4>
                              <div className="space-y-4">
                                {p.description && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Description</span>
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {p.description}
                                    </p>
                                  </div>
                                )}
                                {p.evidenceSource && (
                                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 p-2.5 rounded-md">
                                    <span className="text-blue-700 dark:text-blue-400 block text-xs font-medium mb-1 flex items-center gap-1.5"><Search className="w-3 h-3" /> Evidence / Source</span>
                                    <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
                                      {p.evidenceSource}
                                    </p>
                                  </div>
                                )}
                                {p.estimatedOpportunity && (
                                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 p-2.5 rounded-md">
                                    <span className="text-emerald-700 dark:text-emerald-400 block text-xs font-medium mb-1 flex items-center gap-1.5"><Star className="w-3 h-3" /> Estimated Opportunity</span>
                                    <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                                      {p.estimatedOpportunity}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> prospects
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Convert to Company Modal */}
      <Dialog open={!!prospectToConvert} onOpenChange={(open) => !open && setProspectToConvert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Prospect to Company</DialogTitle>
            <DialogDescription>
              This will create a new record in the Companies database and mark this prospect as converted.
            </DialogDescription>
          </DialogHeader>
          
          {prospectToConvert && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{prospectToConvert.organizationName}</h4>
                  <p className="text-sm text-muted-foreground">{prospectToConvert.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                <p>Default templates will be used for required fields like Location and Billing. You can edit these in the Company view later.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setProspectToConvert(null)} disabled={isConverting}>Cancel</Button>
            <Button onClick={handleConvert} disabled={isConverting}>
              {isConverting ? "Converting..." : "Convert to Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
