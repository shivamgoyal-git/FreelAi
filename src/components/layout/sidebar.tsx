"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  User,
  X,
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
      { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
      { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
      { icon: Sparkles, label: "Proposals", href: "/dashboard/proposals" },
      { icon: DollarSign, label: "Invoices", href: "/dashboard/invoices" },
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
}

export default function AppSidebar({
  userName,
  userInitial,
  userImage,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href.startsWith("/dashboard#")) return false;
    return pathname.startsWith(href);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const renderSidebarContent = (expanded: boolean) => (
    <div
      style={{
        width: "252px",
        minWidth: "252px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Top Header & Navigation */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Logo Header */}
        <div
          style={{
            height: "60px",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.png"
                alt="FreeLAI Logo"
                style={{
                  width: "28px",
                  height: "28px",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                opacity: expanded ? 1 : 0,
                transform: expanded ? "translateX(0)" : "translateX(-8px)",
                transition: "opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.22s cubic-bezier(0.2, 0, 0, 1)",
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                pointerEvents: expanded ? "auto" : "none",
              }}
            >
              <img
                src="/wordmark.png"
                alt="FreeLAI"
                style={{
                  height: "19px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: "8px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div
                style={{
                  height: "18px",
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? "translateY(0)" : "translateY(-4px)",
                  transition: "opacity 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--text-muted, #71717a)",
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    padding: "2px 10px",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.label}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={!expanded ? item.label : undefined}
                      onClick={(e) => {
                        if (item.href === "#feel-assistant") {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("open-feel-assistant"));
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "36px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "12.5px",
                        fontWeight: active ? 600 : 450,
                        color: active ? "var(--text-primary, #ffffff)" : "var(--text-secondary, #a1a1aa)",
                        background: active ? "var(--surface-2, rgba(255, 255, 255, 0.08))" : "transparent",
                        transition: "background 0.15s ease, color 0.15s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "var(--surface-2, rgba(255, 255, 255, 0.05))";
                          e.currentTarget.style.color = "var(--text-primary, #ffffff)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary, #a1a1aa)";
                        }
                      }}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "6px",
                            bottom: "6px",
                            width: "3px",
                            borderRadius: "0 3px 3px 0",
                            background: "var(--color-brand, #22c55e)",
                            boxShadow: "0 0 10px var(--color-brand, #22c55e)",
                          }}
                        />
                      )}

                      {/* Icon Container (Fixed 40px width centered in collapsed rail) */}
                      <div
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <item.icon
                          size={17}
                          style={{
                            color: active ? "var(--color-brand, #22c55e)" : "inherit",
                            transition: "color 0.15s ease",
                          }}
                        />
                      </div>

                      {/* Text Label */}
                      <span
                        style={{
                          opacity: expanded ? 1 : 0,
                          transform: expanded ? "translateX(0)" : "translateX(-6px)",
                          transition: "opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.22s cubic-bezier(0.2, 0, 0, 1)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          paddingRight: "10px",
                          pointerEvents: expanded ? "auto" : "none",
                        }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Pro Card & User Section */}
      <div
        style={{
          padding: "10px 8px 12px 8px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          borderTop: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))",
        }}
      >
        {/* Pro Card */}
        <div
          style={{
            maxHeight: expanded ? "150px" : "0px",
            opacity: expanded ? 1 : 0,
            transform: expanded ? "translateY(0)" : "translateY(8px)",
            overflow: "hidden",
            transition: "max-height 0.28s cubic-bezier(0.2, 0, 0, 1), opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.22s cubic-bezier(0.2, 0, 0, 1)",
            pointerEvents: expanded ? "auto" : "none",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.09) 0%, rgba(34, 197, 94, 0.07) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Sparkles size={12} style={{ color: "var(--color-brand, #22c55e)" }} />
              <p style={{ fontSize: "11.5px", fontWeight: 650, color: "var(--text-primary)", margin: 0 }}>
                FreeLAI Pro
              </p>
            </div>
            <p style={{ fontSize: "10.5px", color: "var(--text-muted)", margin: "0 0 8px 0", lineHeight: 1.35 }}>
              Unlock unlimited AI proposals & automated invoicing.
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
                background: "var(--color-brand, #22c55e)",
                color: "#000000",
                borderRadius: "5px",
                textDecoration: "none",
                transition: "filter 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Upgrade Plan →
            </Link>
          </div>
        </div>

        {/* User profile strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "42px",
            borderRadius: "8px",
            background: "var(--surface-2, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--border)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Avatar Container (Fixed 40px width centered in collapsed mode) */}
          <div
            style={{
              width: "40px",
              minWidth: "40px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--color-brand, #22c55e)",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                overflow: "hidden",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              {userImage ? (
                <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                userInitial
              )}
            </div>
          </div>

          {/* User Name and Role */}
          <div
            style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateX(0)" : "translateX(-6px)",
              transition: "opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.22s cubic-bezier(0.2, 0, 0, 1)",
              overflow: "hidden",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
              paddingRight: "8px",
              pointerEvents: expanded ? "auto" : "none",
            }}
          >
            <p
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              {userName}
            </p>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0, whiteSpace: "nowrap" }}>
              Pro Freelancer
            </p>
          </div>
        </div>
      </div>
    </div>
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
                backdropFilter: "blur(4px)",
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
                width: "var(--sidebar-width, 252px)",
                background: "var(--surface-1, #0f1117)",
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
              {renderSidebarContent(true)}
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
          width: "var(--sidebar-collapsed-width, 56px)",
          zIndex: isHovered ? 150 : 50,
          pointerEvents: "none",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            width: isHovered ? "var(--sidebar-width, 252px)" : "var(--sidebar-collapsed-width, 56px)",
            background: "var(--surface-1, #0f1117)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            boxShadow: isHovered
              ? "8px 0 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)"
              : "none",
            willChange: "width, box-shadow",
            transform: "translateZ(0)",
            transition:
              "width 0.3s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {renderSidebarContent(isHovered)}
        </motion.aside>
      </div>
    </>
  );
}
