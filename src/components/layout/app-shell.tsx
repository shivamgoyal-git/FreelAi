"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppSidebar from "./sidebar";
import TopNav from "./top-nav";
import CommandPalette from "@/components/shared/command-palette";
import StatusBar from "./status-bar";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
}

export default function AppShell({ children, userName, userInitial, userImage, userEmail }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Read sidebar collapsed state
  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sidebarWidth = sidebarCollapsed
    ? "var(--sidebar-collapsed-width)"
    : "var(--sidebar-width)";

  return (
    <>
      {/* Skip navigation */}
      <a href="#main-content" className="skip-nav">Skip to content</a>

      {/* Sidebar */}
      <AppSidebar
        userName={userName}
        userInitial={userInitial}
        userImage={userImage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div
        style={{
          marginLeft: sidebarWidth,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left var(--dur-slow) var(--ease-spring)",
        }}
      >
        <TopNav
          userName={userName}
          userInitial={userInitial}
          userImage={userImage}
          userEmail={userEmail}
          onMenuClick={() => setMobileOpen(true)}
          onSearchClick={() => setCmdOpen(true)}
        />
        <main id="main-content" style={{ flex: 1, padding: "24px" }} className="page-enter">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Status Bar */}
      <StatusBar />
    </>
  );
}
