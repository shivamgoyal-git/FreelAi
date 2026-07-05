"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, Menu } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface TopNavProps {
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Overview",
    clients: "Clients",
    projects: "Projects",
    proposals: "Proposals",
    invoices: "Invoices",
    analytics: "Analytics",
    profile: "Profile",
    portfolio: "Portfolio",
    settings: "Settings",
    security: "Security",
    new: "New",
  };

  return segments.map((seg, i) => ({
    label: labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

export default function TopNav({ userName, userInitial, userImage, userEmail, onMenuClick, onSearchClick }: TopNavProps) {
  const breadcrumbs = useBreadcrumbs();
  const { theme, toggle } = useTheme();

  return (
    <header
      style={{
        height: "var(--topnav-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "var(--surface-1)",
        borderBottom: "0.5px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: "16px",
      }}
    >
      {/* Left: mobile menu + breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "4px", borderRadius: "var(--radius-sm)" }}
          className="mobile-only"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", overflow: "hidden" }}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <ChevronRight size={13} style={{ color: "var(--border-strong)", flexShrink: 0 }} />}
              {crumb.isLast ? (
                <span style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} style={{ color: "var(--text-muted)", textDecoration: "none", whiteSpace: "nowrap" }}>
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: search + theme + notifications + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        {/* Global search */}
        <button
          onClick={onSearchClick}
          aria-label="Open command palette (Ctrl+K)"
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "6px 12px", borderRadius: "var(--radius)",
            background: "var(--surface-2)", border: "0.5px solid var(--border-strong)",
            cursor: "pointer", color: "var(--text-muted)", fontSize: "12px",
            transition: "all var(--dur-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-brand)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        >
          <Search size={13} />
          <span style={{ display: "none", whiteSpace: "nowrap" }} className="search-label">Search...</span>
          <kbd style={{ fontSize: "10px", padding: "1px 5px", background: "var(--surface-3)", borderRadius: "3px", color: "var(--text-muted)", border: "0.5px solid var(--border)" }}>
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{ background: "none", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", padding: "7px", cursor: "pointer", color: "var(--text-muted)", display: "flex", transition: "all var(--dur-fast)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          style={{ background: "none", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", padding: "7px", cursor: "pointer", color: "var(--text-muted)", display: "flex", position: "relative", transition: "all var(--dur-fast)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <Bell size={15} />
        </button>

        {/* Profile */}
        <AccountDropdown userName={userName} userInitial={userInitial} userImage={userImage} userEmail={userEmail} />
      </div>
    </header>
  );
}
