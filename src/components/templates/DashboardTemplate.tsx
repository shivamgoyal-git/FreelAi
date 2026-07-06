import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";

interface DashboardTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  kpis: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarContent?: React.ReactNode;
  bottomSection?: React.ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  description,
  actions,
  kpis,
  mainContent,
  sidebarContent,
  bottomSection,
}) => {
  return (
    <PageLayout>
      <PageHeader title={title} description={description} actions={actions} />
      
      {/* KPI Cards Row */}
      <div style={{ marginBottom: "var(--spacing-8)" }}>
        {kpis}
      </div>

      {/* Main Grid: 2-column or full width */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebarContent ? "1fr 320px" : "1fr",
          gap: "var(--spacing-20)",
          alignItems: "flex-start",
        }}
        className="grid-responsive-2"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)", minWidth: 0 }}>
          {mainContent}
        </div>
        {sidebarContent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)" }}>
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Bottom Full-Width sections */}
      {bottomSection && (
        <div style={{ marginTop: "var(--spacing-8)", display: "flex", flexDirection: "column", gap: "var(--spacing-20)" }}>
          {bottomSection}
        </div>
      )}
    </PageLayout>
  );
};

export default DashboardTemplate;
