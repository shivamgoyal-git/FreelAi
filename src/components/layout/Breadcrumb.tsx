"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Overview",
    clients: "Clients",
    projects: "Projects",
    proposals: "Proposals",
    invoices: "Invoices",
    analytics: "Analytics",
    profile: "Profile",
    portfolio: "Portfolio",
    settings: "Settings",
    security: "Security",
    new: "New",
  };

  const breadcrumbs = segments.map((seg, i) => ({
    label: labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-8)",
        fontSize: "var(--text-caption)",
        overflow: "hidden",
      }}
    >
      {breadcrumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && (
            <ChevronRight
              size={12}
              style={{ color: "var(--border-strong)", flexShrink: 0 }}
            />
          )}
          {crumb.isLast ? (
            <span
              style={{
                fontWeight: 510,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
