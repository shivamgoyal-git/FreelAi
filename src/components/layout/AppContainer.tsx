"use client";

import React, { useState, useEffect } from "react";
import AppSidebar from "./sidebar";
import TopNav from "./top-nav";
import CommandPalette from "@/components/shared/command-palette";
import FeelAssistantWidget from "@/components/ai/FeelAssistantWidget";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

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

  return (
    <>
      <a href="#main-content" className="skip-nav">Skip to content</a>

      <AppSidebar
        userName={userName}
        userInitial={userInitial}
        userImage={userImage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        style={{
          marginLeft: "var(--sidebar-collapsed-width, 56px)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
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
      <FeelAssistantWidget />
    </>
  );
};

export default AppContainer;
