import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";

interface SettingsSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SettingsTemplateProps {
  title: string;
  description?: string;
  subtitle?: string; // support both description and subtitle
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: React.ReactNode;
}

export const SettingsTemplate: React.FC<SettingsTemplateProps> = ({
  title,
  description,
  subtitle,
  sections,
  activeSection,
  onSectionChange,
  children,
}) => {
  const resolvedDesc = description || subtitle;

  return (
    <PageLayout>
      <PageHeader title={title} description={resolvedDesc} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "var(--spacing-32)",
          alignItems: "flex-start",
        }}
        className="grid-responsive-2"
      >
        {/* Sidebar sub-navigation tabs */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-4)",
          }}
        >
          {sections.map((section) => {
            const active = section.id === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`sidebar-nav-item${active ? " active" : ""}`}
                style={{
                  textAlign: "left",
                  justifyContent: "flex-start",
                  padding: "0 var(--spacing-12)",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-8)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "var(--radius-inputs)",
                  cursor: "pointer",
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {section.icon && (
                  <span style={{ display: "inline-flex", color: active ? "var(--color-brand)" : "inherit" }}>
                    {section.icon}
                  </span>
                )}
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-24)", minWidth: 0 }}>
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsTemplate;
