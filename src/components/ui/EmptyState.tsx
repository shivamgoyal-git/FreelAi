import React, { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  description,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        width: "100%",
        height: "100%",
        minHeight: "320px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          background: "var(--surface-2)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, { size: 28, style: { color: "var(--text-muted)" } })
          : icon}
      </div>
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginTop: "16px",
          marginBottom: "0",
          letterSpacing: "-0.015em",
        }}
      >
        {heading}
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          marginTop: "4px",
          marginBottom: "16px",
          maxWidth: "280px",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
