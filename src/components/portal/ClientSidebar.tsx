"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Receipt,
  FileText,
  Files,
  MessageSquare,
  Settings,
  HelpCircle,
  Mail,
  X,
  ExternalLink,
} from "lucide-react";

interface ClientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  freelancerName?: string;
  freelancerEmail?: string;
}

export function ClientSidebar({
  isOpen = false,
  onClose,
  freelancerName = "Your Freelancer",
  freelancerEmail,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewClientId = searchParams?.get("previewClientId") || "";

  const buildHref = (baseHref: string) => {
    if (!previewClientId) return baseHref;
    return `${baseHref}?previewClientId=${previewClientId}`;
  };

  const navItems = [
    { label: "Overview", href: "/portal", icon: LayoutDashboard, exact: true },
    { label: "Projects", href: "/portal/projects", icon: FolderGit2 },
    { label: "Invoices", href: "/portal/invoices", icon: Receipt },
    { label: "Proposals", href: "/portal/proposals", icon: FileText },
    { label: "Files", href: "/portal/files", icon: Files },
    { label: "Messages", href: "/portal/messages", icon: MessageSquare },
  ];

  const accountItems = [
    { label: "Settings", href: "/portal/settings", icon: Settings },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
          className="portal-mobile-backdrop"
        />
      )}

      <aside
        className={`portal-sidebar ${isOpen ? "open" : ""}`}
        style={{
          width: "260px",
          height: "100vh",
          position: "sticky",
          top: 0,
          background: "var(--color-carbon, #0f1011)",
          borderRight: "1px solid var(--color-graphite, #23252a)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50,
          transition: "transform 0.25s ease",
          padding: "20px 16px",
          flexShrink: 0,
        }}
      >
        {/* Top Header & Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
              padding: "0 8px",
            }}
          >
            <Link
              href="/portal"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #27a644 0%, #166534 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(39, 166, 68, 0.35)",
                }}
              >
                <img
                  src="/logo.png"
                  alt="FreeAI"
                  style={{ width: "24px", height: "24px", objectFit: "contain" }}
                  onError={(e) => {
                    // Fallback letter if logo image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--color-bone, #e5e5e6)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  FreeAI
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--color-pulse-green, #27a644)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Client Portal
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="portal-mobile-close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-fog)",
                  cursor: "pointer",
                  display: "none",
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-ash, #62666d)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "8px 12px 4px",
              }}
            >
              Workspace
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  onClick={() => onClose && onClose()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#ffffff" : "var(--color-fog, #8a8f98)",
                    background: active
                      ? "var(--color-obsidian, #161718)"
                      : "transparent",
                    border: active
                      ? "1px solid var(--color-graphite, #23252a)"
                      : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "6px",
                        bottom: "6px",
                        width: "3px",
                        borderRadius: "0 2px 2px 0",
                        background: "var(--color-pulse-green, #27a644)",
                        boxShadow: "0 0 8px rgba(39, 166, 68, 0.6)",
                      }}
                    />
                  )}
                  <Icon
                    size={17}
                    style={{
                      color: active
                        ? "var(--color-pulse-green, #27a644)"
                        : "var(--color-fog, #8a8f98)",
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-ash, #62666d)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "16px 12px 4px",
              }}
            >
              Account
            </div>
            {accountItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  onClick={() => onClose && onClose()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#ffffff" : "var(--color-fog, #8a8f98)",
                    background: active
                      ? "var(--color-obsidian, #161718)"
                      : "transparent",
                    border: active
                      ? "1px solid var(--color-graphite, #23252a)"
                      : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon
                    size={17}
                    style={{
                      color: active
                        ? "var(--color-pulse-green, #27a644)"
                        : "var(--color-fog, #8a8f98)",
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Help Card */}
        <div
          style={{
            background: "var(--color-obsidian, #161718)",
            borderRadius: "10px",
            padding: "14px",
            border: "1px solid var(--color-graphite, #23252a)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <HelpCircle size={15} style={{ color: "var(--color-pulse-green, #27a644)" }} />
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--color-bone, #e5e5e6)",
              }}
            >
              Need help?
            </span>
          </div>
          <p
            style={{
              fontSize: "11.5px",
              color: "var(--color-fog, #8a8f98)",
              lineHeight: 1.4,
              marginBottom: "10px",
            }}
          >
            Contact {freelancerName} for questions about your projects or deliverables.
          </p>
          {freelancerEmail ? (
            <a
              href={`mailto:${freelancerEmail}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                color: "var(--color-pulse-green, #27a644)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <Mail size={12} />
              <span>Email Freelancer</span>
            </a>
          ) : (
            <Link
              href="/portal/messages"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11.5px",
                color: "var(--color-pulse-green, #27a644)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <MessageSquare size={12} />
              <span>Send Message</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
