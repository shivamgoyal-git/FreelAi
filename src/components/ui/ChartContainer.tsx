import React from "react";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number | string;
  style?: React.CSSProperties;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  height = 240,
  style,
}) => {
  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: "var(--spacing-24)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--spacing-24)",
        }}
      >
        <div>
          <h3
            className="font-heading"
            style={{
              fontSize: "var(--text-body-sm)",
              margin: 0,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--text-muted)",
                margin: 0,
                marginTop: "4px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: height, width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
