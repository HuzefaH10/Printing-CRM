export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  defaultProbability: number;
  isArchived?: boolean;
}

// Hardcoded for foundation; can be moved to DB later for user customization.
export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "stage_1_prospect", name: "Prospect Identified", order: 10, color: "bg-slate-200 text-slate-700", defaultProbability: 5 },
  { id: "stage_2_research", name: "Researching", order: 20, color: "bg-slate-200 text-slate-700", defaultProbability: 10 },
  { id: "stage_3_contact", name: "Initial Contact", order: 30, color: "bg-blue-100 text-blue-700", defaultProbability: 15 },
  { id: "stage_4_qualification", name: "Qualification", order: 40, color: "bg-blue-100 text-blue-700", defaultProbability: 25 },
  { id: "stage_5_relationship", name: "Relationship Building", order: 50, color: "bg-indigo-100 text-indigo-700", defaultProbability: 30 },
  { id: "stage_6_meeting", name: "Meeting Scheduled", order: 60, color: "bg-indigo-100 text-indigo-700", defaultProbability: 40 },
  { id: "stage_7_requirements", name: "Requirements Gathering", order: 70, color: "bg-purple-100 text-purple-700", defaultProbability: 50 },
  { id: "stage_8_prep_samples", name: "Preparing Samples", order: 80, color: "bg-fuchsia-100 text-fuchsia-700", defaultProbability: 55 },
  { id: "stage_9_samples_sent", name: "Sample Sent", order: 90, color: "bg-fuchsia-100 text-fuchsia-700", defaultProbability: 60 },
  { id: "stage_10_prep_quote", name: "Preparing Quotation", order: 100, color: "bg-amber-100 text-amber-700", defaultProbability: 65 },
  { id: "stage_11_quote_sent", name: "Quotation Sent", order: 110, color: "bg-amber-100 text-amber-700", defaultProbability: 70 },
  { id: "stage_12_negotiation", name: "Negotiation", order: 120, color: "bg-orange-100 text-orange-700", defaultProbability: 80 },
  { id: "stage_13_waiting", name: "Waiting for Decision", order: 130, color: "bg-stone-200 text-stone-700", defaultProbability: 85 },
  { id: "stage_14_vendor_reg", name: "Vendor Registration", order: 140, color: "bg-cyan-100 text-cyan-700", defaultProbability: 90 },
  { id: "stage_15_tender", name: "Tender Participation", order: 150, color: "bg-teal-100 text-teal-700", defaultProbability: 50 },
  { id: "stage_16_po_received", name: "Purchase Order Received", order: 160, color: "bg-emerald-100 text-emerald-700", defaultProbability: 100 },
  { id: "stage_17_production", name: "Production Ready", order: 170, color: "bg-emerald-200 text-emerald-800", defaultProbability: 100 },
  
  // Terminal Stages (often filtered out of the active kanban or put at the very end)
  { id: "stage_won", name: "Won", order: 900, color: "bg-green-500 text-white", defaultProbability: 100 },
  { id: "stage_lost", name: "Lost", order: 910, color: "bg-red-500 text-white", defaultProbability: 0 },
  { id: "stage_dormant", name: "Dormant", order: 920, color: "bg-gray-500 text-white", defaultProbability: 0 }
];
