"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  Zap,
  Users,
  Palette,
  Sparkles,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview", badge: null, href: null },
  { icon: Briefcase, label: "Projects", id: "projects", badge: null, href: "/dashboard/projects" },
  { icon: MessageSquare, label: "Messages", id: "messages", badge: "3", href: null },
  { icon: DollarSign, label: "Payments", id: "payments", badge: null, href: null },
  { icon: Palette, label: "Portfolio", id: "portfolio", badge: null, href: null },
  { icon: Users, label: "Clients", id: "clients", badge: null, href: "/dashboard/clients" },
  { icon: Settings, label: "Settings", id: "settings", badge: null, href: null },
];

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  userName: string;
  userInitial: string;
  userImage?: string | null;
}

export default function Sidebar({
  active,
  setActive,
  userName,
  userInitial,
  userImage,
}: SidebarProps) {
  return (
    <aside
      className="sidebar"
      style={{
        background: "var(--surface-1)",
        borderRight: "0.5px solid var(--border)",
        boxShadow: "none",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: "0.5px solid var(--border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="var(--color-on-brand)" fill="var(--color-on-brand)" />
          </div>
          <span className="font-heading" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
            Freel<span style={{ color: "var(--color-brand)" }}>Ai</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          const navItemStyle: React.CSSProperties = {
            height: "36px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: isActive ? "0 12px 0 9.5px" : "0 12px",
            borderRadius: "var(--radius)",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            cursor: "pointer",
            width: "100%",
            background: isActive ? "var(--surface-2)" : "transparent",
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            borderLeft: isActive ? "2.5px solid var(--color-brand)" : "none",
            borderTop: "none",
            borderRight: "none",
            borderBottom: "none",
            textAlign: "left",
            fontFamily: "inherit",
            transition: "all var(--dur-fast) ease",
          };

          const handleHover = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
            if (!isActive) {
              e.currentTarget.style.background = "var(--surface-2)";
            }
          };
          const handleLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
            if (!isActive) {
              e.currentTarget.style.background = "transparent";
            }
          };

          const content = (
            <>
              <item.icon size={18} style={{ color: isActive ? "var(--color-brand)" : "var(--text-secondary)" }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    background: isActive ? "var(--color-brand)" : "var(--surface-3)",
                    color: isActive ? "var(--color-on-brand)" : "var(--text-secondary)",
                    padding: "2px 7px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                id={`sidebar-${item.id}`}
                href={item.href}
                style={navItemStyle}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                {content}
              </Link>
            );
          } else {
            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}`}
                style={navItemStyle}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                onClick={() => setActive(item.id)}
              >
                {content}
              </button>
            );
          }
        })}
      </nav>

      {/* AI Boost Card */}
      <div style={{ padding: "12px 16px" }}>
        <div
          style={{
            padding: "16px",
            background: "var(--color-brand-subtle)",
            border: "0.5px solid rgba(245, 166, 35, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "12px",
            boxShadow: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={16} color="var(--color-brand)" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-on-brand)" }}>AI Boost Active</p>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: "1.5" }}>
            Ready to find matching contracts & optimize proposals.
          </p>
          <Link
            href="/dashboard/projects"
            style={{
              display: "block",
              textAlign: "center",
              width: "100%",
              padding: "8px",
              background: "var(--surface-2)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background var(--dur-fast) ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
            }}
          >
            Launch Projects
          </Link>
        </div>

        {/* User profile strip */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "var(--radius-md)" }}>
          <div
            className="avatar"
            style={{
              width: "36px",
              height: "36px",
              background: "var(--color-brand)",
              color: "var(--color-on-brand)",
              fontSize: "14px",
              flexShrink: 0,
              overflow: "hidden",
              padding: 0,
            }}
          >
            {userImage ? (
              <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userInitial
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
