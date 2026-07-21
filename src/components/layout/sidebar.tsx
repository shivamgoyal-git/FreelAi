"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, DollarSign, BarChart3, Settings,
  Users, Sparkles, ChevronLeft, ChevronRight, Image, User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Overview",   href: "/dashboard" },
      { icon: BarChart3,       label: "Analytics",  href: "/dashboard/analytics" },
    ],
  },
  {
    label: "Work",
    items: [
      { icon: Users,       label: "Clients",   href: "/dashboard/clients" },
      { icon: Briefcase,   label: "Projects",  href: "/dashboard/projects" },
      { icon: Sparkles,    label: "Proposals", href: "/dashboard/proposals" },
      { icon: DollarSign,  label: "Invoices",  href: "/dashboard/invoices" },
    ],
  },
  {
    label: "You",
    items: [
      { icon: User,     label: "Profile",   href: "/dashboard/profile" },
      { icon: Image,    label: "Portfolio", href: "/dashboard/portfolio" },
      { icon: Settings, label: "Settings",  href: "/dashboard/settings" },
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
      {/* Logo */}
      <div style={{ padding: collapsed ? "16px 10px" : "16px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "10px", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", overflow: "hidden" }}>
          <img
            src="/logo.png"
            alt="FreelAi Logo"
            style={{
              width: "38px",
              height: "38px",
              margin: "-3px -5px -3px -3px",
              borderRadius: "8px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <span className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
              Freel<span style={{ color: "var(--color-brand)" }}>Ai</span>
            </span>
          )}
        </Link>
        {!collapsed && !mobileOpen && (
          <button onClick={handleCloseClick} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "4px" }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "4px" }}>
            {!collapsed && (
              <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 4px" }}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`sidebar-nav-item${active ? " active" : ""}`}
                  style={collapsed ? { justifyContent: "center", padding: "0" } : {}}
                >
                  <item.icon
                    size={16}
                    style={{ color: active ? "var(--color-brand)" : "inherit", flexShrink: 0 }}
                  />
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom AI promo + user strip */}
      <div style={{ padding: collapsed ? "8px" : "10px", borderTop: "0.5px solid var(--border)", flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ padding: "12px 14px", background: "var(--color-brand-subtle)", border: "0.5px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius-lg)", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Sparkles size={13} color="var(--color-brand)" />
              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>AI Ready</p>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "8px" }}>
              Generate proposals that win clients.
            </p>
            <Link href="/dashboard/proposals" className="btn-redesign btn-redesign-primary btn-redesign-sm" style={{ width: "100%", justifyContent: "center" }}>
              Generate Proposal
            </Link>
          </div>
        )}

        {/* User profile info strip */}
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : "9px", padding: collapsed ? "4px" : "8px 10px", borderRadius: "var(--radius)", justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--color-brand)", color: "var(--color-on-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
            {userImage ? <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{userName}</p>
              <p style={{ fontSize: "10.5px", color: "var(--text-muted)", margin: 0 }}>Pro Plan</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile view with AnimatePresence */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(2px)",
                zIndex: 999,
              }}
            />
            {/* Slide-out Sidebar */}
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
                borderRight: "0.5px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                overflowX: "hidden",
                zIndex: 1000,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px 0 0" }}>
                <button onClick={onMobileClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "4px" }}>
                  <X size={18} />
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
            borderRight: "0.5px solid var(--border)",
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
              right: "-12px",
              width: "24px",
              height: "24px",
              background: "var(--surface-2)",
              border: "0.5px solid var(--border)",
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
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        )}
      </div>
    </>
  );
}
