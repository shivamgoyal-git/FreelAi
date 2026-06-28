import React, { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accentColor }) => {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ color: accentColor || "var(--text-muted)", display: "flex" }}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 24 })
          : icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            lineHeight: "1.2",
            margin: 0,
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
};
