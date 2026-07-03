"use client";
 
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  Zap,
  Users,
  Palette,
  Sparkles,
} from "lucide-react";
 
const navItems = [
  { icon: LayoutDashboard, label: "Overview",  id: "overview",  badge: null, href: null },
  { icon: Briefcase,       label: "Projects",  id: "projects",  badge: null, href: "/dashboard/projects" },
  { icon: MessageSquare,   label: "Messages",  id: "messages",  badge: "3",  href: null },
  { icon: DollarSign,      label: "Payments",  id: "payments",  badge: null, href: "/dashboard/invoices" },
  { icon: BarChart3,       label: "Analytics", id: "analytics", badge: null, href: "/dashboard/analytics" },
  { icon: Sparkles,        label: "AI Proposals", id: "proposals", badge: null, href: "/dashboard/proposals" },
  { icon: Users,           label: "Clients",   id: "clients",   badge: null, href: "/dashboard/clients" },
  { icon: Settings,        label: "Settings",  id: "settings",  badge: null, href: null },
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
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "18px 16px", borderBottom: "0.5px solid var(--border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "9px",
            background: "var(--color-brand)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Zap size={17} color="var(--color-on-brand)" fill="var(--color-on-brand)" />
          </div>
          <span className="font-heading" style={{ fontSize: "17px", color: "var(--text-primary)" }}>
            Freel<span style={{ color: "var(--color-brand)" }}>Ai</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "1px" }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          const itemClass = `sidebar-nav-item${isActive ? " active" : ""}`;

          const content = (
            <>
              <item.icon
                size={17}
                style={{ color: isActive ? "var(--color-brand)" : "inherit", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                id={`sidebar-${item.id}`}
                href={item.href}
                className={itemClass}
              >
                {content}
              </Link>
            );
          } else {
            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}`}
                className={itemClass}
                onClick={() => setActive(item.id)}
              >
                {content}
              </button>
            );
          }
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: "12px" }}>
        {/* AI Boost Card */}
        <div style={{
          padding: "14px 16px",
          background: "var(--color-brand-subtle)",
          border: "0.5px solid rgba(245,166,35,0.25)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
            <Sparkles size={14} color="var(--color-brand)" />
            <p style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
              AI Boost Active
            </p>
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: "1.55" }}>
            Ready to find matching contracts &amp; optimize proposals.
          </p>
          <Link
            href="/dashboard/projects"
            className="btn-redesign btn-redesign-secondary btn-redesign-sm"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Launch Projects
          </Link>
        </div>

        {/* User profile strip */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "9px 10px", borderRadius: "var(--radius)",
          cursor: "default", transition: "background var(--dur-fast)",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <div className="avatar" style={{
            width: "33px", height: "33px",
            background: "var(--color-brand)", color: "var(--color-on-brand)",
            fontSize: "13px", flexShrink: 0, overflow: "hidden", padding: 0,
          }}>
            {userImage ? (
              <img src={userImage} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userInitial
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {userName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
