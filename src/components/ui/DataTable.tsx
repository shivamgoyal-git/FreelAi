"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./input";

// ── TYPES ────────────────────────────────────────────────────
export interface ColumnDef<T> {
  id: string;
  header: string | (() => React.ReactNode);
  accessorKey?: keyof T | string;
  cell?: (info: { row: T; value: any }) => React.ReactNode;
  sortable?: boolean;
}

// ── TABLE TOOLBAR ──────────────────────────────────────────────
interface TableToolbarProps {
  children: React.ReactNode;
}
export const TableToolbar: React.FC<TableToolbarProps> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-12)",
        flexWrap: "wrap",
        marginBottom: "var(--spacing-16)",
      }}
    >
      {children}
    </div>
  );
};

// ── TABLE FILTERS ──────────────────────────────────────────────
interface TableFiltersProps {
  children: React.ReactNode;
}
export const TableFilters: React.FC<TableFiltersProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-8)", flexWrap: "wrap" }}>
      {children}
    </div>
  );
};

// ── BULK ACTIONS ───────────────────────────────────────────────
interface BulkActionsProps {
  selectedCount: number;
  actions: React.ReactNode;
}
export const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, actions }) => {
  if (selectedCount === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-12)",
        padding: "var(--spacing-8) var(--spacing-16)",
        background: "var(--color-brand-subtle)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius)",
        marginBottom: "var(--spacing-16)",
      }}
    >
      <span style={{ fontSize: "var(--text-caption)", color: "var(--text-primary)" }}>
        {selectedCount} selected
      </span>
      <div style={{ display: "flex", gap: "var(--spacing-8)" }}>{actions}</div>
    </div>
  );
};

// ── EXPORT BUTTON ──────────────────────────────────────────────
interface ExportButtonProps {
  onExport: () => void;
  label?: string;
}
export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, label = "Export" }) => {
  return (
    <Button variant="secondary" size="sm" leftIcon={<Download size={13} />} onClick={onExport}>
      {label}
    </Button>
  );
};

// ── LOADING STATE ──────────────────────────────────────────────
export const LoadingState: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-64) 0",
        gap: "var(--spacing-12)",
        width: "100%",
      }}
    >
      <div className="skeleton" style={{ width: "100%", height: "40px", borderRadius: "var(--radius)" }} />
      <div className="skeleton" style={{ width: "100%", height: "40px", borderRadius: "var(--radius)" }} />
      <div className="skeleton" style={{ width: "100%", height: "40px", borderRadius: "var(--radius)" }} />
    </div>
  );
};

// ── PAGINATION ─────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) => {
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "var(--spacing-16)",
        paddingTop: "var(--spacing-16)",
        borderTop: "0.5px solid var(--border)",
      }}
    >
      <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", margin: 0 }}>
        Showing {totalItems === 0 ? 0 : startIdx}–{endIdx} of {totalItems} entries
      </p>
      <div style={{ display: "flex", gap: "var(--spacing-4)" }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

// ── MAIN DATATABLE COMPONENT ────────────────────────────────────
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  initialPageSize?: number;
  mobileCardRender?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey,
  initialPageSize = 10,
  mobileCardRender,
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = initialPageSize;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchKey) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      const value = item[searchKey];
      return String(value ?? "").toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchKey]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const column = columns.find((c) => c.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      let valA = column.accessorKey ? a[column.accessorKey] : a[column.id];
      let valB = column.accessorKey ? b[column.accessorKey] : b[column.id];

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: ColumnDef<T>) => {
    if (!column.sortable) return null;
    if (sortColumn !== column.id) return <ChevronsUpDown size={13} style={{ marginLeft: "4px", opacity: 0.5 }} />;
    if (sortDirection === "asc") return <ChevronUp size={13} style={{ marginLeft: "4px", color: "var(--color-brand)" }} />;
    return <ChevronDown size={13} style={{ marginLeft: "4px", color: "var(--color-brand)" }} />;
  };

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    const value = column.accessorKey ? (row as any)[column.accessorKey] : (row as any)[column.id];
    if (column.cell) {
      return column.cell({ row, value });
    }
    return String(value ?? "");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
      {searchKey && (
        <TableToolbar>
          <div style={{ maxWidth: "320px", width: "100%" }}>
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              leftIcon={<Search size={14} />}
            />
          </div>
        </TableToolbar>
      )}

      {/* Desktop view */}
      <div
        className="glass-card desktop-only animate-fade-in"
        style={{
          overflow: "hidden",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-cards)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: "var(--surface-1)" }}>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    onClick={() => handleSort(column.id, column.sortable)}
                    style={{
                      cursor: column.sortable ? "pointer" : "default",
                      userSelect: "none",
                      padding: "var(--spacing-12) var(--spacing-16)",
                      borderBottom: "0.5px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {typeof column.header === "function" ? column.header() : column.header}
                      {renderSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "var(--spacing-40) var(--spacing-24)", color: "var(--text-muted)", fontSize: "var(--text-caption)" }}>
                    No results found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      borderBottom: idx === paginatedData.length - 1 ? "none" : "0.5px solid var(--border)",
                    }}
                  >
                    {columns.map((column) => (
                      <td key={column.id} style={{ padding: "var(--spacing-12) var(--spacing-16)", fontSize: "var(--text-body-sm)" }}>
                        {getCellValue(row, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      {mobileCardRender && (
        <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)" }}>
          {paginatedData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-40) var(--spacing-24)", color: "var(--text-muted)", fontSize: "var(--text-caption)" }}>
              No results found.
            </div>
          ) : (
            paginatedData.map((row, idx) => (
              <div
                key={idx}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {mobileCardRender(row)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination controls */}
      {sortedData.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

export default DataTable;
