import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";

interface ManagementTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  content: React.ReactNode;
}

export const ManagementTemplate: React.FC<ManagementTemplateProps> = ({
  title,
  description,
  actions,
  toolbar,
  content,
}) => {
  return (
    <PageLayout>
      <PageHeader title={title} description={description} actions={actions} />
      
      {toolbar && (
        <div style={{ marginBottom: "var(--spacing-4)" }}>
          {toolbar}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {content}
      </div>
    </PageLayout>
  );
};

export default ManagementTemplate;
