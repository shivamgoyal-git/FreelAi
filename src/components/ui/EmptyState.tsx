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
        minHeight: "240px",
        textAlign: "center",
        gap: "0",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          background: "var(--surface-2)",
          border: "0.5px solid var(--border)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
              size: 20,
              style: { color: "var(--text-muted)" },
            })
          : icon}
      </div>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 510,
          color: "var(--text-primary)",
          letterSpacing: "-0.012em",
          margin: 0,
          fontFamily: "var(--font-inter-variable), var(--font-sans), sans-serif",
        }}
      >
        {heading}
      </h3>
      <p
        style={{
          fontSize: "12.5px",
          color: "var(--text-muted)",
          marginTop: "4px",
          marginBottom: actionLabel ? "16px" : "0",
          maxWidth: "360px",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button variant="secondary" size="sm" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
