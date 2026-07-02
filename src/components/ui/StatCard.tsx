import React, { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accentColor?: string;
  change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accentColor, change }) => {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius)",
          background: accentColor ? `${accentColor}18` : "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accentColor || "var(--text-muted)",
        }}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 16 })
          : icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <p
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text-primary)",
            lineHeight: "1.2",
            margin: 0,
            fontFamily: "var(--font-jakarta), var(--font-sans), sans-serif",
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontWeight: 500,
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </p>
        {change && (
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
};
