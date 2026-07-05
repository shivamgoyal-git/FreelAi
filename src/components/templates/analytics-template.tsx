"use client";

import * as React from "react";

interface AnalyticsTemplateProps {
  title: string;
  subtitle?: string;
  filters?: React.ReactNode;
  
  // State Machine
  state: "loading" | "error" | "success";
  loadingSkeleton?: React.ReactNode;
  errorState?: React.ReactNode;
  
  statsGrid?: React.ReactNode;
  chartsGrid?: React.ReactNode;
  additionalContent?: React.ReactNode;
}

export function AnalyticsTemplate({
  title,
  subtitle,
  filters,
  state,
  loadingSkeleton,
  errorState,
  statsGrid,
  chartsGrid,
  additionalContent,
}: AnalyticsTemplateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {filters && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {filters}
          </div>
        )}
      </div>

      {/* State Machine Rendering */}
      {state === "loading" && (
        loadingSkeleton ?? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="grid-responsive-4" style={{ gap: "16px" }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton" style={{ height: "120px" }} />
              ))}
            </div>
            <div className="grid-responsive-2" style={{ gap: "20px" }}>
              <div className="skeleton" style={{ height: "300px" }} />
              <div className="skeleton" style={{ height: "300px" }} />
            </div>
          </div>
        )
      )}

      {state === "error" && (
        errorState ?? <div style={{ padding: "40px", textAlign: "center", color: "var(--color-danger)" }}>Failed to load analytics data.</div>
      )}

      {state === "success" && (
        <>
          {/* Stats KPI Widgets */}
          {statsGrid && (
            <div className="grid-responsive-4" style={{ gap: "16px" }}>
              {statsGrid}
            </div>
          )}

          {/* Core Charts Area */}
          {chartsGrid && (
            <div className="grid-responsive-2" style={{ gap: "20px", marginTop: "8px" }}>
              {chartsGrid}
            </div>
          )}

          {/* Any other reports or lists */}
          {additionalContent && (
            <div style={{ marginTop: "8px" }}>
              {additionalContent}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnalyticsTemplate;
