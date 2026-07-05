"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./input";

export interface ColumnDef<T> {
  id: string;
  header: string | (() => React.ReactNode);
  accessorKey?: keyof T | string;
  cell?: (info: { row: T; value: any }) => React.ReactNode;
  sortable?: boolean;
}

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
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchKey) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      const value = item[searchKey];
      return String(value ?? "").toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchKey]);

  // Sort data
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

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Adjust current page if data changes
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top action bar: Search */}
      {searchKey && (
        <div style={{ maxWidth: "320px" }}>
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            leftIcon={<Search size={14} />}
          />
        </div>
      )}

      {/* Main Table (Desktop view) */}
      <div
        className="glass-card desktop-only"
        style={{
          overflow: "hidden",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: "var(--surface-0)" }}>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.id, col.sortable)}
                    style={{
                      cursor: col.sortable ? "pointer" : "default",
                      userSelect: "none",
                      padding: "12px 16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "0.5px solid var(--border)",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {typeof col.header === "function" ? col.header() : col.header}
                      {renderSortIcon(col)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No results found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {columns.map((col) => (
                      <td key={col.id} style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-primary)", borderBottom: "0.5px solid var(--border)" }}>
                        {getCellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List view */}
      <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {paginatedData.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", background: "var(--surface-1)", borderRadius: "var(--radius)", border: "0.5px solid var(--border)" }}>
            No results found.
          </div>
        ) : (
          paginatedData.map((row, idx) => (
            <div
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="glass-card"
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {mobileCardRender
                ? mobileCardRender(row)
                : columns.map((col) => (
                    <div key={col.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ color: "var(--text-muted)" }}>
                        {typeof col.header === "function" ? col.id.toUpperCase() : col.header}
                      </span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {getCellValue(row, col)}
                      </span>
                    </div>
                  ))}
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}-
            {Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length} items
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft size={14} />}
            >
              Previous
            </Button>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight size={14} />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
