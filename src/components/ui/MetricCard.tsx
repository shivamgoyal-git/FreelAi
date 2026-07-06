import React, { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  description,
  icon,
}) => {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-cards)",
        padding: "var(--spacing-20) var(--spacing-24)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-8)",
        transition: "border-color var(--dur-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div className="flex-between">
        <span
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          {title}
        </span>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
      </div>

      <div className="flex-align-center" style={{ gap: "var(--spacing-8)", flexWrap: "wrap" }}>
        <h4
          style={{
            fontSize: "var(--text-subheading)",
            fontWeight: 510,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.022em",
          }}
        >
          {value}
        </h4>
        {change && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: 510,
              color:
                trend === "up"
                  ? "var(--color-pulse-green)"
                  : trend === "down"
                  ? "var(--color-coral-red)"
                  : "var(--text-muted)",
            }}
          >
            {trend === "up" ? "+" : ""}
            {change}
          </span>
        )}
      </div>

      {description && (
        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
