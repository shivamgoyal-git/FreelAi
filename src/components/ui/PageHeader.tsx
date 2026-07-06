import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "var(--spacing-28)",
        flexWrap: "wrap",
        gap: "var(--spacing-16)",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, minWidth: "240px" }}>
        <h1
          className="font-heading animate-fade-in"
          style={{
            fontSize: "var(--text-subheading)",
            fontWeight: 510,
            margin: 0,
            color: "var(--text-primary)",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--text-muted)",
              marginTop: "var(--spacing-8)",
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-12)", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
