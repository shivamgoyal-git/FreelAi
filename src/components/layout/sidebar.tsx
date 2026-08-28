"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  User,
  X,
  Bot,
  Layers,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { icon: Users, label: "Clients", href: "/dashboard/clients" },
      { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
      { icon: Sparkles, label: "Proposals", href: "/dashboard/proposals" },
      { icon: DollarSign, label: "Invoices", href: "/dashboard/invoices" },
    ],
  },
  {
    label: "AI TOOLS",
    items: [
      { icon: Bot, label: "AI Copilot", href: "/dashboard#ai-copilot" },
      { icon: Layers, label: "Templates", href: "/dashboard/proposals" },
      { icon: Zap, label: "Automations", href: "/dashboard/settings" },
    ],
  },
  {
    label: "YOU",
    items: [
      { icon: User, label: "Profile", href: "/dashboard/profile" },
      { icon: ImageIcon, label: "Portfolio", href: "/dashboard/portfolio" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

interface AppSidebarProps {
  userName: string;
  userInitial: string;
  userImage?: string | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({
  userName,
  userInitial,
  userImage,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href.startsWith("/dashboard#")) return false;
    return pathname.startsWith(href);
  };

  const width = collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)";

  const handleCloseClick = () => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    } else if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const renderSidebarContent = () => (
    <>
      {/* Logo Header */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            overflow: "hidden",
          }}
        >
          <img
            src="/logo.png"
            alt="FreeLAI Logo"
            style={{
              width: "34px",
              height: "34px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <img
              src="/wordmark.png"
              alt="FreeLAI"
              style={{
                height: "19px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Link>

        {!collapsed && !mobileOpen && (
          <button
            onClick={handleCloseClick}
            aria-label="Close sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: "4px",
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav
        style={{
          flex: 1,
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
        }}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                style={{
                  fontSize: "9.5px",
                  fontWeight: 650,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "4px 8px",
                  margin: 0,
                }}
              >
                {group.label}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginTop: "1px" }}>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: collapsed ? "8px 0" : "6px 8px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: active ? 550 : 400,
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      background: active ? "var(--surface-2)" : "transparent",
                      borderLeft: active ? "2px solid var(--color-brand)" : "2px solid transparent",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "var(--surface-2)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    <item.icon
                      size={14}
                      style={{
                        color: active ? "var(--color-brand)" : "inherit",
                        flexShrink: 0,
                      }}
                    />
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Pro Card & User */}
      <div style={{ padding: collapsed ? "8px" : "10px", flexShrink: 0 }}>
        {!collapsed && (
          <div
            style={{
              padding: "12px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Sparkles size={12} style={{ color: "var(--color-brand)" }} />
              <p style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                FreeLAI Pro
              </p>
            </div>
            <p style={{ fontSize: "10.5px", color: "var(--text-muted)", margin: "0 0 8px 0", lineHeight: 1.35 }}>
              Unlock unlimited AI proposals and automated invoicing.
            </p>
            <Link
              href="/dashboard/settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 600,
                background: "var(--color-brand)",
                color: "var(--color-on-brand)",
                borderRadius: "5px",
                textDecoration: "none",
                transition: "filter 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Upgrade Plan →
            </Link>
          </div>
        )}

        {/* User profile strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : "8px",
            padding: collapsed ? "4px" : "5px 8px",
            borderRadius: "6px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "var(--color-brand)",
              color: "var(--color-on-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10.5px",
              fontWeight: 700,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {userImage ? (
              <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userInitial
            )}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 550,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                }}
              >
                {userName}
              </p>
              <p style={{ fontSize: "9.5px", color: "var(--text-muted)", margin: 0 }}>
                Pro Freelancer
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile view */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(3px)",
                zIndex: 999,
              }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "var(--sidebar-width)",
                background: "var(--surface-1)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                overflowX: "hidden",
                zIndex: 1000,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px 0 0" }}>
                <button
                  onClick={onMobileClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    padding: "4px",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width,
          zIndex: 50,
          transition: "width var(--dur-slow) var(--ease-spring)",
          pointerEvents: "none",
        }}
      >
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: "var(--surface-1)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            pointerEvents: "auto",
          }}
        >
          {renderSidebarContent()}
        </motion.aside>

        {/* Collapse toggle button */}
        {!mobileOpen && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              position: "absolute",
              top: "50%",
              right: "-11px",
              width: "22px",
              height: "22px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              zIndex: 60,
              transform: "translateY(-50%)",
              transition: "background var(--dur-fast)",
              pointerEvents: "auto",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
          >
            {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
          </button>
        )}
      </div>
    </>
  );
}
