"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const VARIANT_STYLES: Record<AlertVariant, { bg: string; border: string; text: string; Icon: React.ElementType }> = {
  info:    { bg: "var(--color-accent-bg)",  border: "rgba(59,130,246,0.25)",   text: "var(--color-accent)",  Icon: Info },
  success: { bg: "var(--color-success-bg)", border: "rgba(22,163,74,0.25)",    text: "var(--color-success)", Icon: CheckCircle2 },
  warning: { bg: "var(--color-warning-bg)", border: "rgba(217,119,6,0.25)",    text: "var(--color-warning)", Icon: AlertTriangle },
  error:   { bg: "var(--color-danger-bg)",  border: "rgba(220,38,38,0.25)",    text: "var(--color-danger)",  Icon: AlertCircle },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

export function Alert({ variant = "info", title, children, onDismiss }: AlertProps) {
  const { bg, border, text, Icon } = VARIANT_STYLES[variant];
  return (
    <div
      role="alert"
      style={{
        display: "flex", gap: "10px", padding: "12px 14px",
        background: bg, border: `0.5px solid ${border}`,
        borderRadius: "var(--radius)", color: text, fontSize: "13px",
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
      <div style={{ flex: 1 }}>
        {title && <p style={{ fontWeight: 700, marginBottom: "3px" }}>{title}</p>}
        <div style={{ lineHeight: 1.5 }}>{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, display: "flex", padding: 0 }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default Alert;
