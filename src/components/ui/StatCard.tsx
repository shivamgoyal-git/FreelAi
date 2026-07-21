import React, { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
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
        borderRadius: "var(--radius-cards)",
        padding: "var(--spacing-20) var(--spacing-24)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-12)",
        transition: "border-color var(--dur-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-inputs)",
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
            fontSize: "var(--text-subheading)",
            fontWeight: 510,
            letterSpacing: "-0.022em",
            color: "var(--text-primary)",
            lineHeight: "1.2",
            margin: 0,
            fontFamily: "var(--font-sans), sans-serif",
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-muted)",
            fontWeight: 400,
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </p>
        {change && (
          <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
