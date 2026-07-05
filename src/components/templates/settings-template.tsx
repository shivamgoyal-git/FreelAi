"use client";

import * as React from "react";
import { useState } from "react";

interface SettingsSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SettingsTemplateProps {
  title: string;
  subtitle?: string;
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: React.ReactNode;
}

export function SettingsTemplate({
  title,
  subtitle,
  sections,
  activeSection,
  onSectionChange,
  children,
}: SettingsTemplateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Grid: Left Settings Nav, Right Section form fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "32px",
          alignItems: "start",
        }}
        className="responsive-grid-sidebar"
      >
        {/* Left Side: Settings Navigation */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            background: "var(--surface-1)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "8px",
          }}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`sidebar-nav-item${isActive ? " active" : ""}`}
                style={{
                  width: "100%",
                  border: "none",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  color: isActive ? "var(--color-brand)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  textAlign: "left",
                  transition: "all var(--dur-fast)",
                }}
              >
                {section.icon && (
                  <span style={{ color: isActive ? "var(--color-brand)" : "var(--text-muted)" }}>
                    {section.icon}
                  </span>
                )}
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Active Section Form fields */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            minWidth: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default SettingsTemplate;
