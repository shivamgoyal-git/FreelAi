"use client";

import * as React from "react";
import { DataTable } from "../ui/data-table";

interface CRUDTemplateProps<T> {
  title: string;
  subtitle?: string;
  primaryAction?: React.ReactNode;
  filters?: React.ReactNode;
  
  // State Machine
  state: "loading" | "error" | "empty" | "success";
  loadingSkeleton?: React.ReactNode;
  errorState?: React.ReactNode;
  emptyState?: React.ReactNode;
  
  // Data Table
  columns: any[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  mobileCardRender?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialPageSize?: number;
}

export function CRUDTemplate<T>({
  title,
  subtitle,
  primaryAction,
  filters,
  state,
  loadingSkeleton,
  errorState,
  emptyState,
  columns,
  data,
  searchKey,
  searchPlaceholder,
  mobileCardRender,
  onRowClick,
  initialPageSize = 10,
}: CRUDTemplateProps<T>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {primaryAction && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {primaryAction}
          </div>
        )}
      </div>

      {/* Filters / Search Bar Row */}
      {filters && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {filters}
        </div>
      )}

      {/* State Machine Rendering */}
      {state === "loading" && (
        loadingSkeleton ?? <div className="skeleton" style={{ height: "300px" }} />
      )}

      {state === "error" && (
        errorState ?? <div style={{ padding: "40px", textAlign: "center", color: "var(--color-danger)" }}>Failed to load data.</div>
      )}

      {state === "empty" && (
        emptyState ?? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No items found.</div>
      )}

      {state === "success" && (
        <DataTable
          columns={columns}
          data={data}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          mobileCardRender={mobileCardRender}
          onRowClick={onRowClick}
          initialPageSize={initialPageSize}
        />
      )}
    </div>
  );
}

export default CRUDTemplate;
