"use client";

import * as React from "react";

interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  content?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function DashboardTemplate({
  title,
  subtitle,
  actions,
  stats,
  content,
  sidebar,
}: DashboardTemplateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header section */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {actions}
          </div>
        )}
      </div>

      {/* Stats Widgets section */}
      {stats && (
        <div className="grid-responsive-4" style={{ gap: "16px" }}>
          {stats}
        </div>
      )}

      {/* Main body content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sidebar ? "1fr 340px" : "1fr",
          gap: "24px",
          alignItems: "start",
        }}
        className={sidebar ? "responsive-grid-sidebar" : ""}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          {content}
        </div>
        {sidebar && (
          <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}

export default DashboardTemplate;
