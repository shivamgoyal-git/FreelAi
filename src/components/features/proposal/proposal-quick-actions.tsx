"use client";

import React, { useState } from "react";
import { Copy, Download, Share2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/dialog";

interface ProposalQuickActionsProps {
  proposalText: string;
  proposalId?: string;
  proposalTitle?: string;
  onDelete?: () => void;
}

export function ProposalQuickActions({ proposalText, proposalId, proposalTitle, onDelete }: ProposalQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposalText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([proposalText], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${proposalTitle ?? "proposal"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .txt");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: proposalTitle ?? "Proposal", text: proposalText });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDelete = async () => {
    if (!proposalId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Proposal deleted");
        onDelete?.();
      } else {
        toast.error("Failed to delete proposal");
      }
    } catch {
      toast.error("Failed to delete proposal");
    }
    setDeleting(false);
    setDeleteOpen(false);
  };

  const actions = [
    { icon: copied ? Check : Copy, label: copied ? "Copied!" : "Copy",     onClick: handleCopy,     color: copied ? "var(--color-success)" : undefined },
    { icon: Download,              label: "Download",                       onClick: handleDownload, color: undefined },
    { icon: Share2,                label: "Share",                          onClick: handleShare,    color: undefined },
    { icon: Trash2,                label: "Delete",                         onClick: () => setDeleteOpen(true), color: "var(--color-danger)" },
  ];

  return (
    <>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            title={action.label}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "var(--radius)",
              background: "var(--surface-2)", border: "0.5px solid var(--border-strong)",
              cursor: "pointer", fontSize: "12px", fontWeight: 500,
              color: action.color ?? "var(--text-secondary)",
              transition: "all var(--dur-fast)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
          >
            <action.icon size={13} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={proposalTitle}
        onDelete={handleDelete}
        loading={deleting}
      />
    </>
  );
}

export default ProposalQuickActions;
