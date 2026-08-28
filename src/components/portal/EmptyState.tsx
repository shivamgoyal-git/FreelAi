"use client";

import React from "react";
import { FolderOpen, Inbox, FileText, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: "folder" | "inbox" | "file" | "message" | "alert";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    const props = { size: 32, style: { color: "var(--color-fog)" } };
    switch (icon) {
      case "folder":
        return <FolderOpen {...props} />;
      case "file":
        return <FileText {...props} />;
      case "message":
        return <MessageSquare {...props} />;
      case "alert":
        return <AlertCircle {...props} />;
      default:
        return <Inbox {...props} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        borderRadius: "12px",
        background: "var(--color-carbon, #0f1011)",
        border: "1px dashed var(--color-graphite, #23252a)",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--color-obsidian, #161718)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          border: "1px solid var(--color-graphite, #23252a)",
        }}
      >
        {getIcon()}
      </div>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "var(--color-bone, #e5e5e6)",
          marginBottom: "6px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-fog, #8a8f98)",
          maxWidth: "380px",
          lineHeight: 1.5,
          marginBottom: actionLabel ? "20px" : "0",
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
