"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  MessageSquare,
  X,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Deliverable } from "@/types/portal";

export function ProjectDeliverablesManager({
  projectId,
  clientId,
}: {
  projectId: string;
  clientId?: string;
}) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    version: "v1",
    description: "",
    fileUrl: "",
    externalUrl: "",
  });

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/deliverables`);
      if (res.ok) {
        const data = await res.json();
        setDeliverables(data.deliverables || []);
      }
    } catch (err) {
      console.error("Failed to fetch project deliverables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [projectId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Deliverable title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`/api/projects/${projectId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setForm({
          title: "",
          version: `v${deliverables.length + 2}`,
          description: "",
          fileUrl: "",
          externalUrl: "",
        });
        fetchDeliverables();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload deliverable");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload deliverable");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileCheck size={18} color="var(--primary)" />
          <h2 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>
            Deliverables & Approvals
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {clientId && (
            <a
              href={`/portal/projects/${projectId}?previewClientId=${clientId}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button variant="secondary" size="sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={13} />
                <span>Client View</span>
              </Button>
            </a>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={13} />
            <span>Upload Deliverable</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          Loading deliverables...
        </div>
      ) : deliverables.length === 0 ? (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-subtle)",
            fontSize: "13px",
          }}
        >
          No deliverables submitted for client review yet. Click &quot;Upload Deliverable&quot; to send work for approval.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {deliverables.map((d) => {
            const isApproved = d.status === "approved";
            const isChanges = d.status === "changes_requested";
            return (
              <div
                key={d._id}
                style={{
                  background: "var(--bg-elevated)",
                  border: isChanges
                    ? "1px solid rgba(234, 179, 8, 0.4)"
                    : isApproved
                    ? "1px solid rgba(39, 166, 68, 0.3)"
                    : "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {d.title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: "var(--border-default)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {d.version}
                      </span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                      Uploaded {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    {isApproved && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--color-pulse-green, #27a644)",
                          background: "rgba(39, 166, 68, 0.15)",
                          padding: "3px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Approved by Client
                      </span>
                    )}

                    {isChanges && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fbbf24",
                          background: "rgba(234, 179, 8, 0.15)",
                          padding: "3px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        <AlertTriangle size={12} />
                        Changes Requested
                      </span>
                    )}

                    {d.status === "pending_review" && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#818cf8",
                          background: "rgba(99, 102, 241, 0.15)",
                          padding: "3px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        <Clock size={12} />
                        Pending Client Review
                      </span>
                    )}
                  </div>
                </div>

                {d.description && (
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {d.description}
                  </p>
                )}

                {/* Client Feedback Callout */}
                {isChanges && d.clientFeedback && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "6px",
                      background: "rgba(234, 179, 8, 0.08)",
                      border: "1px solid rgba(234, 179, 8, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#fbbf24" }}>
                      <MessageSquare size={12} />
                      <span>Client Feedback</span>
                    </div>
                    <p style={{ fontSize: "12.5px", color: "var(--text-primary)", margin: 0, fontStyle: "italic" }}>
                      &quot;{d.clientFeedback}&quot;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>
                Upload Deliverable
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "6px", fontSize: "12.5px", marginBottom: "14px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "10px" }}>
                <div>
                  <label className="label-redesign">Title *</label>
                  <input
                    className="input-redesign"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Homepage Design v3"
                    required
                  />
                </div>
                <div>
                  <label className="label-redesign">Version</label>
                  <input
                    className="input-redesign"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    placeholder="v1"
                  />
                </div>
              </div>

              <div>
                <label className="label-redesign">Description</label>
                <textarea
                  className="textarea-redesign"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain what was updated or completed in this version..."
                  rows={3}
                />
              </div>

              <div>
                <label className="label-redesign">Figma / Preview / Demo URL</label>
                <input
                  className="input-redesign"
                  type="url"
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://figma.com/file/... or live URL"
                />
              </div>

              <div>
                <label className="label-redesign">Downloadable File Link</label>
                <input
                  className="input-redesign"
                  type="url"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? "Uploading..." : "Upload Deliverable"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
