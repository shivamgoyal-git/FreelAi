"use client";

import React from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import AccountDropdown from "@/components/AccountDropdown";
import { useTheme } from "@/hooks/useTheme";

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
  const { theme, toggle } = useTheme();

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

        {/* Search Bar - Center/Left integrated like the reference image */}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search projects, clients, invoices... (Ctrl+K)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "7px 14px",
            borderRadius: "8px",
            background: "var(--surface-2)",
            border: "0.5px solid var(--border-strong)",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "12px",
            width: "100%",
            maxWidth: "380px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-brand)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        >
          <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "var(--text-muted)",
            }}
          >
            Search projects, clients, invoices...
          </span>
          <kbd
            style={{
              fontSize: "10px",
              padding: "1px 5px",
              background: "var(--surface-3)",
              borderRadius: "4px",
              color: "var(--text-muted)",
              border: "0.5px solid var(--border)",
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: theme toggle + notifications + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            background: "var(--surface-2)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "7px",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          style={{
            background: "var(--surface-2)",
            border: "0.5px solid var(--border-strong)",
            borderRadius: "8px",
            padding: "7px",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
        >
          <Bell size={15} />
          {/* Notification red dot indicator */}
          <span
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-brand)",
            }}
          />
        </button>

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
