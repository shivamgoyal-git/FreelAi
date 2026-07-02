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
        padding: "56px 24px",
        width: "100%",
        minHeight: "280px",
        textAlign: "center",
        gap: "0",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          background: "var(--surface-2)",
          border: "0.5px solid var(--border)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
              size: 22,
              style: { color: "var(--text-muted)" },
            })
          : icon}
      </div>
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.015em",
          margin: 0,
          fontFamily: "var(--font-jakarta), var(--font-sans), sans-serif",
        }}
      >
        {heading}
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          marginTop: "6px",
          marginBottom: "20px",
          maxWidth: "300px",
          lineHeight: "1.6",
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
