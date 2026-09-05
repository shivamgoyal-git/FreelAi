"use client";

import React from "react";
import { Search, Menu } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import { NotificationCenter } from "@/components/portal/NotificationCenter";

interface TopNavProps {
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export default function TopNav({
  userName,
  userInitial,
  userImage,
  userEmail,
  onMenuClick,
  onSearchClick,
}: TopNavProps) {
  return (
    <header
      style={{
        height: "var(--topnav-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--surface-1)",
        borderBottom: "0.5px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: "16px",
      }}
    >
      {/* Left: Mobile menu toggle + breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open mobile menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
            }}
            className="mobile-menu-btn"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Global Quick Search Button */}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            background: "var(--surface-2)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            color: "var(--text-muted)",
            fontSize: "12.5px",
            cursor: "pointer",
            width: "220px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          <Search size={13} />
          <span style={{ flex: 1, textAlign: "left" }}>Quick Search...</span>
          <kbd
            style={{
              fontSize: "10px",
              padding: "1px 4px",
              background: "var(--surface-3)",
              borderRadius: "3px",
              border: "0.5px solid var(--border)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notification Center & Profile Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Interactive Notification Center */}
        <NotificationCenter />

        {/* Profile Dropdown */}
        <AccountDropdown
          userName={userName}
          userInitial={userInitial}
          userImage={userImage}
          userEmail={userEmail}
        />
      </div>
    </header>
  );
}
