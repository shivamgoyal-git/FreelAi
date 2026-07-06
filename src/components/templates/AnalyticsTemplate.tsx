import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";

interface AnalyticsTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  kpis: React.ReactNode;
  mainChart: React.ReactNode;
  subCharts?: React.ReactNode;
  tablesSection?: React.ReactNode;
}

export const AnalyticsTemplate: React.FC<AnalyticsTemplateProps> = ({
  title,
  description,
  actions,
  kpis,
  mainChart,
  subCharts,
  tablesSection,
}) => {
  return (
    <PageLayout>
      <PageHeader title={title} description={description} actions={actions} />
      
      {/* KPIs Row */}
      <div style={{ marginBottom: "var(--spacing-8)" }}>
        {kpis}
      </div>

      {/* Main Chart Card */}
      <div style={{ width: "100%", marginBottom: "var(--spacing-8)" }}>
        {mainChart}
      </div>

      {/* Sub Charts Segment */}
      {subCharts && (
        <div style={{ width: "100%", marginBottom: "var(--spacing-8)" }}>
          {subCharts}
        </div>
      )}

      {/* Tables Segment */}
      {tablesSection && (
        <div style={{ width: "100%" }}>
          {tablesSection}
        </div>
      )}
    </PageLayout>
  );
};

export default AnalyticsTemplate;
