"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Send,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  XCircle,
  Clock,
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type PortalStatus =
  | "not_invited"
  | "invitation_pending"
  | "invitation_expired"
  | "invitation_revoked"
  | "active";

interface ClientPortalCardProps {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  projectId?: string;
}

export function ClientPortalCard({
  clientId,
  clientName,
  clientEmail,
  projectId,
}: ClientPortalCardProps) {
  const [status, setStatus] = useState<PortalStatus>("not_invited");
  const [invitation, setInvitation] = useState<any>(null);
  const [storedEmail, setStoredEmail] = useState<string>(clientEmail || "");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch(`/api/clients/${clientId}/portal-status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setInvitation(data.invitation || null);
        if (data.clientEmail) {
          setStoredEmail(data.clientEmail);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to check portal status");
      }
    } catch (err: any) {
      console.error("Failed to check portal status:", err);
      setErrorMessage(err.message || "Failed to check portal status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [clientId]);

  const handleInvite = async (isResend = false) => {
    try {
      setInviting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await fetch(`/api/clients/${clientId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (res.ok) {
        setInvitation(data.invitation || data);
        setStatus("invitation_pending");
        if (data.recipient) {
          setStoredEmail(data.recipient);
        }
        setSuccessMessage(
          isResend
            ? `New invitation sent to ${data.recipient || storedEmail}`
            : `Invitation sent successfully to ${data.recipient || storedEmail}`
        );
      } else {
        setErrorMessage(
          data.details
            ? `${data.error} — ${data.details}`
            : data.error || "Failed to send invitation email"
        );
      }
    } catch (err: any) {
      console.error("Failed to invite client:", err);
      setErrorMessage(err.message || "Invitation could not be sent. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setRevoking(true);
      setErrorMessage("");
      setSuccessMessage("");
      const res = await fetch(`/api/clients/${clientId}/portal-status`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus("invitation_revoked");
        setInvitation(null);
        setSuccessMessage("Invitation revoked successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to revoke invitation");
      }
    } catch (err: any) {
      console.error("Failed to revoke invite:", err);
      setErrorMessage(err.message || "Failed to revoke invitation");
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyLink = () => {
    const url =
      invitation?.inviteUrl || (typeof invitation === "string" ? invitation : "");
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const effectiveRecipient =
    invitation?.recipient || storedEmail || clientEmail;

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <h3
            className="font-heading"
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
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
            Invitation Pending
          </span>
        )}

        {status === "invitation_expired" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={12} />
            Expired
          </span>
        )}

        {status === "invitation_revoked" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              background: "rgba(107, 114, 128, 0.15)",
              color: "#9ca3af",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <XCircle size={12} />
            Revoked
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
        <div
          style={{
            padding: "16px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "13px",
          }}
        >
          Checking portal credentials...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {errorMessage && (
            <div
              style={{
                fontSize: "12px",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "8px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--color-pulse-green, #22c55e)",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                padding: "8px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {status === "active"
              ? `${clientName} has activated their client portal and can view assigned projects, approve deliverables, and pay invoices.`
              : status === "invitation_pending"
              ? `An official invitation email has been sent to ${effectiveRecipient || clientName}. They can use the secure link to activate access.`
              : status === "invitation_expired"
              ? `The previous invitation for ${clientName} has expired. Click Resend to dispatch a fresh invitation.`
              : status === "invitation_revoked"
              ? `The previous invitation for ${clientName} was revoked. You can send a new invite email at any time.`
              : `Send an official invitation email to give ${clientName} a private, branded portal to track progress, review deliverables, message you, and pay invoices.`}
          </p>

          {/* Invitation Pending Details Card */}
          {status === "invitation_pending" && (
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                  <Mail size={13} color="var(--primary)" />
                  <span>Sent to:</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {effectiveRecipient || "Client Email"}
                  </strong>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Expires in 7 days
                </span>
              </div>

              {(invitation?.inviteUrl || typeof invitation === "string") && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                  }}
                >
                  <input
                    type="text"
                    readOnly
                    value={invitation?.inviteUrl || invitation}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "11px",
                      outline: "none",
                      textOverflow: "ellipsis",
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyLink}
                    style={{ padding: "3px 8px", fontSize: "11px", height: "24px" }}
                  >
                    {copied ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}>
                        <Check size={12} /> Copied
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Copy size={12} /> Copy Link
                      </span>
                    )}
                  </Button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  fontSize: "11px",
                }}
              >
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--error)",
                    cursor: "pointer",
                    fontSize: "11px",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {revoking ? "Revoking..." : "Revoke Invitation"}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {status === "not_invited" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInvite(false)}
                disabled={inviting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {inviting ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending Invitation Email...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Send size={13} />
                    <span>Send Invitation Email</span>
                  </div>
                )}
              </Button>
            )}

            {status === "invitation_pending" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleInvite(true)}
                disabled={inviting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {inviting ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending New Email...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <RefreshCw size={13} />
                    <span>Resend Invitation</span>
                  </div>
                )}
              </Button>
            )}

            {(status === "invitation_expired" ||
              status === "invitation_revoked") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInvite(false)}
                disabled={inviting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {inviting ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending Invitation...</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <RefreshCw size={13} />
                    <span>
                      {status === "invitation_expired"
                        ? "Resend Invitation"
                        : "Invite Again"}
                    </span>
                  </div>
                )}
              </Button>
            )}

            {/* Preview Client Portal View */}
            <a
              href={`/portal?previewClientId=${clientId}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="secondary"
                size="sm"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
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
