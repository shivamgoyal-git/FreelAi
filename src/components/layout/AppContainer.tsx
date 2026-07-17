"use client";

import React, { useState, useEffect } from "react";
import AppSidebar from "./sidebar";
import TopNav from "./top-nav";
import CommandPalette from "@/components/shared/command-palette";
import StatusBar from "./status-bar";

interface AppContainerProps {
  children: React.ReactNode;
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
}

export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  userName,
  userInitial,
  userImage,
  userEmail,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem("sidebar-collapsed") === "true");

    // Listen for sidebar toggle changes (from the sidebar component)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed") {
        setSidebarCollapsed(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSidebarToggle = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

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
      <a href="#main-content" className="skip-nav">Skip to content</a>

      <AppSidebar
        userName={userName}
        userInitial={userInitial}
        userImage={userImage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
      />

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
        <main id="main-content" style={{ flex: 1, padding: "var(--spacing-24)" }} className="page-enter">
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <StatusBar />
    </>
  );
};

export default AppContainer;
