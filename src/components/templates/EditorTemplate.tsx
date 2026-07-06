import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

interface EditorTemplateProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  formContent: React.ReactNode;
  previewContent?: React.ReactNode;
}

export const EditorTemplate: React.FC<EditorTemplateProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
  formContent,
  previewContent,
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
          gridTemplateColumns: previewContent ? "55fr 45fr" : "1fr",
          gap: "var(--spacing-28)",
          alignItems: "flex-start",
        }}
        className="grid-responsive-2"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)", minWidth: 0 }}>
          {formContent}
        </div>
        {previewContent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-20)" }}>
            {previewContent}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default EditorTemplate;
