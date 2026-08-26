"use client";

import { useState, useEffect } from "react";
import { useBiometricConfirm } from "@/features/auth/hooks/useBiometricConfirm";
import { BiometricAuditService, BiometricAuditLog } from "@/services/biometric-audit.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Fingerprint, ShieldCheck, Trash2, Smartphone, Key, AlertCircle, Activity, CheckCircle } from "lucide-react";

export function SecuritySettings() {
  const {
    isSupported,
    userCredentials,
    isLoadingCredentials,
    registerBiometric,
    deleteBiometric,
  } = useBiometricConfirm();

  const [deviceLabelInput, setDeviceLabelInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [auditLogs, setAuditLogs] = useState<BiometricAuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logs = await BiometricAuditService.getRecentLogs(20);
        setAuditLogs(logs.data);
      } catch (err) {
        console.error("Failed to fetch biometric logs:", err);
      } finally {
        setIsLoadingLogs(false);
      }
    }
    fetchLogs();
  }, []);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const label = deviceLabelInput.trim() || undefined;
      const success = await registerBiometric(label);
      if (success) {
        setDeviceLabelInput("");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Security & Biometric Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage hardware security keys and fingerprint / Windows Hello / Touch ID authenticators for confirming sensitive CRM actions.
        </p>
      </div>

      <div className="border-t border-border"></div>

      {/* WebAuthn Registration Section */}
      <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-base text-foreground">WebAuthn Biometric Authentication</h4>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isSupported
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {isSupported ? "Biometric Hardware Available" : "No Biometric Hardware Detected"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Biometric credentials are device-bound. Register your fingerprint sensor or Windows Hello PIN on this laptop to gate high-value actions such as sending partnership outreach emails.
        </p>

        {/* Registration Form */}
        <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
          <div className="space-y-1.5 flex-1 w-full">
            <Label htmlFor="deviceLabel" className="text-xs font-medium">Device Custom Label (Optional)</Label>
            <Input
              id="deviceLabel"
              placeholder="e.g. Work ThinkPad - Windows Hello Fingerprint"
              value={deviceLabelInput}
              onChange={(e) => setDeviceLabelInput(e.target.value)}
              disabled={isRegistering}
            />
          </div>

          <Button
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full sm:w-auto gap-2"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scan Fingerprint...
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4" />
                Register Biometric Device
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Registered Credential List */}
      <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Key className="w-4 h-4 text-muted-foreground" />
          Registered Biometric Devices ({userCredentials.length})
        </h4>

        {isLoadingCredentials ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : userCredentials.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
            <p className="font-medium">No biometric credentials registered yet.</p>
            <p className="text-xs max-w-md mx-auto text-muted-foreground">
              Click &quot;Register Biometric Device&quot; above to bind your fingerprint reader or Windows Hello sensor to your CRM user account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userCredentials.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{cred.deviceLabel}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span>ID: {cred.id.substring(0, 16)}...</span>
                      <span>Registered: {new Date(cred.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBiometric(cred.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Biometric Action Log */}
      <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Biometric Action Log
        </h4>

        {isLoadingLogs ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/20">
            No biometric actions logged yet.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th scope="col" className="px-4 py-3">Action</th>
                  <th scope="col" className="px-4 py-3">User ID</th>
                  <th scope="col" className="px-4 py-3">Verified</th>
                  <th scope="col" className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 bg-background hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.userId?.substring(0, 8)}...</td>
                    <td className="px-4 py-3">
                      {log.verified ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-destructive font-medium">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
