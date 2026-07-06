import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";

interface DetailTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;
}

export const DetailTemplate: React.FC<DetailTemplateProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
  mainContent,
  sidebarContent,
}) => {
  return (
    <PageLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
        {breadcrumbs ?? <Breadcrumb />}
        <PageHeader title={title} description={description} actions={actions} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "var(--spacing-24)",
          alignItems: "flex-start",
        }}
        className="grid-responsive-2"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)", minWidth: 0 }}>
          {mainContent}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)" }}>
          {sidebarContent}
        </div>
      </div>
    </PageLayout>
  );
};

export default DetailTemplate;
