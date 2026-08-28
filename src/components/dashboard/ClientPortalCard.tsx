"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Send,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ClientPortalCard({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [status, setStatus] = useState<"not_invited" | "invitation_pending" | "active">("not_invited");
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/portal-status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setInvitation(data.invitation || null);
      }
    } catch (err) {
      console.error("Failed to check portal status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [clientId]);

  const handleInvite = async () => {
    try {
      setInviting(true);
      const res = await fetch(`/api/clients/${clientId}/invite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInvitation(data);
        setStatus("invitation_pending");
      }
    } catch (err) {
      console.error("Failed to invite client:", err);
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/portal-status`, { method: "DELETE" });
      if (res.ok) {
        setStatus("not_invited");
        setInvitation(null);
      }
    } catch (err) {
      console.error("Failed to revoke invite:", err);
    }
  };

  const handleCopyLink = () => {
    if (!invitation?.inviteUrl) return;
    navigator.clipboard.writeText(invitation.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <h3
            className="font-heading"
            style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}
          >
            Client Portal Access
          </h3>
        </div>

        {status === "active" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(39, 166, 68, 0.15)",
              color: "var(--color-pulse-green, #27a644)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Check size={12} />
            Active
          </span>
        )}

        {status === "invitation_pending" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(234, 179, 8, 0.15)",
              color: "#fbbf24",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={12} />
            Pending Invite
          </span>
        )}

        {status === "not_invited" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
            }}
          >
            Not Invited
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          Checking portal credentials...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            {status === "active"
              ? `${clientName} has activated their client portal and can view assigned projects, approve deliverables, and pay invoices.`
              : status === "invitation_pending"
              ? `An active invitation has been generated for ${clientName}. Share the secure link with them to activate.`
              : `Give ${clientName} a private, branded portal to track progress, review deliverables, message you, and pay invoices.`}
          </p>

          {/* Invitation Pending Controls */}
          {status === "invitation_pending" && invitation?.inviteUrl && (
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="text"
                  readOnly
                  value={invitation.inviteUrl}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    outline: "none",
                    textOverflow: "ellipsis",
                  }}
                />
                <Button variant="secondary" size="sm" onClick={handleCopyLink} style={{ padding: "4px 8px" }}>
                  {copied ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                </Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>Expires in 7 days</span>
                <button
                  onClick={handleRevoke}
                  style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", fontSize: "11px" }}
                >
                  Revoke Invite
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {status === "not_invited" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleInvite}
                disabled={inviting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {inviting ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Generating Invite...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Send size={13} />
                    <span>Invite to Client Portal</span>
                  </div>
                )}
              </Button>
            )}

            {status === "invitation_pending" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInvite}
                disabled={inviting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <RefreshCw size={13} style={{ marginRight: "6px" }} />
                <span>Resend / Re-generate Link</span>
              </Button>
            )}

            {/* Preview Button */}
            <a
              href={`/portal?previewClientId=${clientId}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="secondary"
                size="sm"
                style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ExternalLink size={13} />
                <span>Preview Client Portal View</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
