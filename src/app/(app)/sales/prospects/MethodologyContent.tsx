import React from "react";
import { AlertCircle, FileText, Info, AlertTriangle, Lightbulb } from "lucide-react";

export function MethodologyContent() {
  return (
    <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
      <div>
        <h3 className="font-semibold text-base mb-2">Master Prospect Database — Status & Reality Check</h3>
        <p>This file merges both previous datasets into one master list of 94 deduplicated organizations, sorted by priority.</p>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-lg">
        <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
          <CheckCircleIcon className="w-4 h-4" /> What's actually verified vs. what isn't
        </h4>
        <p className="text-emerald-900/80 dark:text-emerald-200/80">
          Rows with <span className="font-semibold">Contact Verification Status</span> starting with "Verified" have at least one search-verified contact field (an official phone/email pulled directly from the organization's own contact page). Everything else has blank contact fields — not because the organization isn't real (all companies were verified as real), but because Kuwaiti organizations overwhelmingly do NOT publish named procurement/marketing contacts on public web pages.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground" /> Why named 'Procurement Contact' and 'Marketing Contact' are mostly blank
        </h4>
        <p className="text-muted-foreground">
          I checked. Third-party 'contact enrichment' sites (ContactOut, LeadIQ, Prospeo, etc.) do surface names against Kuwaiti companies, but cross-checking them showed clearly wrong/mismatched data (e.g. one source listed a farm owner as KOC's CEO). Using that data would mean inventing information dressed up as fact, which defeats the purpose of a database you can actually trust and act on — so none of it went into this file.
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-500" /> What real named contacts require
        </h4>
        <p className="mb-2">This is a structural reality of the Kuwaiti B2B market, not a research shortfall: named procurement/marketing contacts at this level are gathered one of three ways:</p>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li><strong>LinkedIn Sales Navigator</strong>, searching each company for 'Procurement,' 'Purchasing,' or 'Marketing Manager' titles.</li>
          <li><strong>Calling the general switchboard</strong> number already provided in this file and asking to be directed.</li>
          <li><strong>An in-person/referral introduction</strong>, which in Gulf B2B culture is often the fastest route to an actual conversation anyway.</li>
        </ol>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-4 rounded-lg">
        <h4 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4" /> Recommended next step
        </h4>
        <p className="text-amber-900/80 dark:text-amber-200/80">
          Work this list top-down by Priority. For your top 15-20 (5-star, High confidence) accounts, do a manual LinkedIn pass per company — that targeted effort on the highest-value accounts will get you further than trying to auto-fill all 94 rows with unreliable scraped data.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Column notes
        </h4>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li><strong>Source List:</strong> shows which original research batch each row came from ('Book/Institutional list', 'Corporate/industrial list', or 'Both lists (merged)' where a company appeared in both and was deduplicated).</li>
          <li><strong>Contact Verification Status:</strong> tells you, per row, exactly what was confirmed and where it came from, or that it still needs manual outreach.</li>
        </ul>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
