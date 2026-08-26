"use client";

import React, { useState, useEffect } from "react";
import { Company } from "../models/company";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, MoreHorizontal, ExternalLink, Edit, Handshake, Lock, Trash2 } from "lucide-react";
import { RequestPartnershipModal } from "./RequestPartnershipModal";
import { OutreachUtils } from "../utils/outreach.utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometricConfirm } from "@/features/auth/hooks/useBiometricConfirm";
import { useBiometricGate } from "@/features/auth/hooks/useBiometricGate";
import { companyRepo } from "../services/company.repository";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompanyHeaderProps {
  company: Company;
  onRefreshTimeline?: () => void;
}

export function CompanyHeader({ company, onRefreshTimeline }: CompanyHeaderProps) {
  const { profile } = useAuth();
  const { confirmWithBiometric } = useBiometricConfirm();
  const { withBiometricGate } = useBiometricGate();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isLimited: boolean; minutesRemaining: number; elapsedMs: number }>({
    isLimited: false,
    minutesRemaining: 0,
    elapsedMs: Infinity,
  });

  const hasPermission = OutreachUtils.hasSalesPermission(profile?.role);

  const performDelete = async () => {
    try {
      await companyRepo.hardDelete(company.id);
      router.push("/companies");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = withBiometricGate(performDelete, `Delete Company (${company.name})`);

  // Recalculate rate limit status
  useEffect(() => {
    const updateRateLimit = () => {
      const info = OutreachUtils.isRateLimited(company.lastOutreachSentAt);
      setRateLimitInfo(info);
    };

    updateRateLimit();
    const interval = setInterval(updateRateLimit, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [company.lastOutreachSentAt]);

  const handleActionClick = async () => {
    // 1. Trigger fingerprint / WebAuthn biometric scan FIRST
    const res = await confirmWithBiometric("Request Partnership Outreach");
    if (res.success) {
      // 2. On biometric success (or valid fallback), open send modal
      setIsModalOpen(true);
    }
  };

  const handleModalSuccess = () => {
    // Immediately trigger rate limit status update
    const info = OutreachUtils.isRateLimited(new Date().toISOString());
    setRateLimitInfo(info);

    if (onRefreshTimeline) {
      onRefreshTimeline();
    }
  };

  // Label for rate limited state: e.g. "Sent 2m ago" or "Sent 0m ago"
  const elapsedMinutes = Math.floor(rateLimitInfo.elapsedMs / (60 * 1000));
  const rateLimitLabel = rateLimitInfo.isLimited ? `Sent ${elapsedMinutes}m ago` : "Request Partnership";

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <StatusBadge status={company.status} />
            {company.priority === "URGENT" || company.priority === "HIGH" ? (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                {company.priority}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            {company.industry && (
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                {company.industry}
              </span>
            )}
            {company.location?.city && company.location?.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {company.location.city}, {company.location.country}
              </span>
            )}
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Partnership Outreach Action Button (Gated with WebAuthn Biometric) */}
          <Button
            size="sm"
            variant={rateLimitInfo.isLimited ? "secondary" : "default"}
            disabled={!hasPermission || rateLimitInfo.isLimited}
            onClick={handleActionClick}
            title={
              !hasPermission
                ? "Requires Sales/CRM write permissions"
                : rateLimitInfo.isLimited
                ? `An outreach email was sent recently. Next available in ${rateLimitInfo.minutesRemaining}m.`
                : "Send commercial partnership outreach email (Gated by Biometric Authentication)"
            }
            className={`shadow-sm transition-all ${
              rateLimitInfo.isLimited ? "opacity-75 cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {!hasPermission ? (
              <Lock className="w-4 h-4 mr-1.5" />
            ) : (
              <Handshake className="w-4 h-4 mr-1.5" />
            )}
            {rateLimitLabel}
          </Button>

          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleActionClick} disabled={!hasPermission || rateLimitInfo.isLimited}>
                <Handshake className="w-4 h-4 mr-2" />
                Request Partnership
              </DropdownMenuItem>
              <DropdownMenuItem>Add Note</DropdownMenuItem>
              <DropdownMenuItem>Log Meeting</DropdownMenuItem>
              <DropdownMenuItem>Upload Document</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Share Profile <ExternalLink className="w-4 h-4 ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Company
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Outreach Modal */}
      <RequestPartnershipModal
        company={company}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
