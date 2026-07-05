"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";

// ── Base EmptyState ────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, heading, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-heading">{heading}</p>
      {description && <p className="empty-state-description">{description}</p>}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {action && (
          <Button variant="primary" size="sm" onClick={action.onClick}>{action.label}</Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
        )}
      </div>
    </div>
  );
}

// ── Base ErrorState ────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title = "Something went wrong", description, onRetry, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", borderColor: "rgba(220,38,38,0.2)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p className="empty-state-heading">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: "8px" }}>{retryLabel}</Button>
      )}
    </div>
  );
}

// ── Module-specific variants ───────────────────────────────────
import { Users, Briefcase, FileText, Sparkles, Image, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientsEmptyState({ onAdd }: { onAdd?: () => void }) {
  const router = useRouter();
  return (
    <EmptyState
      icon={<Users size={22} />}
      heading="No clients yet"
      description="Add your first client to start managing projects and generating proposals."
      action={{ label: "Add Client", onClick: () => onAdd?.() }}
      secondaryAction={{ label: "View projects", onClick: () => router.push("/dashboard/projects") }}
    />
  );
}

export function ProjectsEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Briefcase size={22} />}
      heading="No projects yet"
      description="Create your first project to start tracking milestones and deliverables."
      action={{ label: "New Project", onClick: () => onAdd?.() }}
    />
  );
}

export function InvoicesEmptyState({ onAdd }: { onAdd?: () => void }) {
  const router = useRouter();
  return (
    <EmptyState
      icon={<FileText size={22} />}
      heading="No invoices yet"
      description="Create your first invoice to start getting paid."
      action={{ label: "New Invoice", onClick: () => router.push("/dashboard/invoices/new") }}
    />
  );
}

export function ProposalsEmptyState() {
  const router = useRouter();
  return (
    <EmptyState
      icon={<Sparkles size={22} />}
      heading="No proposals yet"
      description="Generate your first AI-powered proposal and start winning clients."
      action={{ label: "Generate Proposal", onClick: () => router.push("/") }}
    />
  );
}

export function PortfolioEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Image size={22} />}
      heading="No portfolio items"
      description="Add past work samples so the AI can match them to client jobs."
      action={{ label: "Add Work Sample", onClick: () => onAdd?.() }}
    />
  );
}

export function AnalyticsEmptyState() {
  const router = useRouter();
  return (
    <EmptyState
      icon={<BarChart2 size={22} />}
      heading="No data yet"
      description="Complete some projects and invoices to see analytics."
      action={{ label: "Add Project", onClick: () => router.push("/dashboard/projects") }}
    />
  );
}

// ── Module-specific error states ──────────────────────────────
export function AnalyticsError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState title="Couldn't load analytics" description="There was a problem fetching your data." onRetry={onRetry} />;
}
export function ClientsError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState title="Couldn't load clients" onRetry={onRetry} />;
}
export function ProjectsError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState title="Couldn't load projects" onRetry={onRetry} />;
}
export function InvoicesError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState title="Couldn't load invoices" onRetry={onRetry} />;
}
export function ProposalError({ onRetry }: { onRetry?: () => void }) {
  return <ErrorState title="Proposal generation failed" description="The AI pipeline encountered an error." onRetry={onRetry} retryLabel="Generate Again" />;
}
