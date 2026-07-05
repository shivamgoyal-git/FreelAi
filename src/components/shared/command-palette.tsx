"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, BarChart3, Users, Briefcase,
  Sparkles, DollarSign, User, Image, Settings, Plus,
  ArrowRight, Hash, FileText, Zap,
} from "lucide-react";

interface CommandResult {
  id: string;
  type: "nav" | "action" | "data";
  icon: React.ElementType;
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
}

const NAV_COMMANDS: CommandResult[] = [
  { id: "dash",      type: "nav", icon: LayoutDashboard, label: "Overview",   description: "Dashboard",  shortcut: "G D", action: () => {} },
  { id: "analytics", type: "nav", icon: BarChart3,       label: "Analytics",  description: "Dashboard",  shortcut: "G A", action: () => {} },
  { id: "clients",   type: "nav", icon: Users,           label: "Clients",    description: "Dashboard",                  action: () => {} },
  { id: "projects",  type: "nav", icon: Briefcase,       label: "Projects",   description: "Dashboard",                  action: () => {} },
  { id: "proposals", type: "nav", icon: Sparkles,        label: "Proposals",  description: "Dashboard",                  action: () => {} },
  { id: "invoices",  type: "nav", icon: DollarSign,      label: "Invoices",   description: "Dashboard",                  action: () => {} },
  { id: "profile",   type: "nav", icon: User,            label: "Profile",    description: "Settings",                   action: () => {} },
  { id: "portfolio", type: "nav", icon: Image,           label: "Portfolio",  description: "Settings",                   action: () => {} },
  { id: "settings",  type: "nav", icon: Settings,        label: "Settings",   description: "Settings",                   action: () => {} },
];

const ACTION_COMMANDS: CommandResult[] = [
  { id: "new-proposal", type: "action", icon: Zap,       label: "Generate Proposal", description: "AI",       action: () => {} },
  { id: "new-client",   type: "action", icon: Plus,      label: "New Client",         description: "Create",  action: () => {} },
  { id: "new-project",  type: "action", icon: Plus,      label: "New Project",        description: "Create",  action: () => {} },
  { id: "new-invoice",  type: "action", icon: FileText,  label: "New Invoice",        description: "Create",  action: () => {} },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [searchResults, setSearchResults] = useState<CommandResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const ROUTES: Record<string, string> = {
    dash: "/dashboard", analytics: "/dashboard/analytics", clients: "/dashboard/clients",
    projects: "/dashboard/projects", proposals: "/dashboard/proposals", invoices: "/dashboard/invoices",
    profile: "/dashboard/profile", portfolio: "/dashboard/portfolio", settings: "/dashboard/settings",
    "new-proposal": "/", "new-client": "/dashboard/clients", "new-project": "/dashboard/projects",
    "new-invoice": "/dashboard/invoices/new",
  };

  const allCommands = [...NAV_COMMANDS, ...ACTION_COMMANDS].map((cmd) => ({
    ...cmd,
    action: () => { router.push(ROUTES[cmd.id] ?? "/dashboard"); onClose(); },
  }));

  const filtered = query.trim()
    ? allCommands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const results = [...filtered, ...searchResults];

  // Live data search (debounced 200ms)
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSearchResults([]); return; }
    clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const dataResults: CommandResult[] = (data.results ?? []).map((r: { id: string; type: string; label: string; href: string }) => ({
            id: `data-${r.id}`,
            type: "data" as const,
            icon: Hash,
            label: r.label,
            description: r.type,
            action: () => { router.push(r.href); onClose(); },
          }));
          setSearchResults(dataResults);
        }
      } catch { /* silently fail */ }
      setSearching(false);
    }, 200);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
      setSearchResults([]);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && results[selected]) { results[selected].action(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, onClose]);

  if (!open) return null;

  const groupedNav    = results.filter((r) => r.type === "nav");
  const groupedAction = results.filter((r) => r.type === "action");
  const groupedData   = results.filter((r) => r.type === "data");

  const renderGroup = (label: string, items: CommandResult[]) => {
    if (!items.length) return null;
    return (
      <div key={label}>
        <div style={{ padding: "8px 14px 4px", fontSize: "10.5px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </div>
        {items.map((item) => {
          const idx = results.indexOf(item);
          const isSelected = idx === selected;
          return (
            <button
              key={item.id}
              onClick={() => item.action()}
              onMouseEnter={() => setSelected(idx)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "9px 14px", border: "none", cursor: "pointer", textAlign: "left",
                background: isSelected ? "var(--color-brand-subtle)" : "transparent",
                color: isSelected ? "var(--color-brand)" : "var(--text-primary)",
                transition: "background var(--dur-fast)",
              }}
            >
              <item.icon size={15} style={{ flexShrink: 0, color: isSelected ? "var(--color-brand)" : "var(--text-muted)" }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{item.label}</span>
                {item.description && (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>{item.description}</span>
                )}
              </div>
              {item.shortcut && (
                <kbd style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--surface-3)", padding: "2px 6px", borderRadius: "3px", border: "0.5px solid var(--border)" }}>
                  {item.shortcut}
                </kbd>
              )}
              {isSelected && <ArrowRight size={13} style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="cmdk-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk-container" role="dialog" aria-modal aria-label="Command palette">
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderBottom: "0.5px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search pages, clients, proposals..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: "14px", color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          />
          {searching && (
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid var(--border-strong)", borderTopColor: "var(--color-brand)", animation: "spin 0.7s linear infinite" }} />
          )}
          <kbd style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: "4px", border: "0.5px solid var(--border)", whiteSpace: "nowrap" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "4px 0" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {!query && renderGroup("Navigation", groupedNav)}
              {!query && renderGroup("Actions", groupedAction)}
              {query && renderGroup("Pages & Actions", [...groupedNav, ...groupedAction])}
              {renderGroup("Search Results", groupedData)}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 14px", borderTop: "0.5px solid var(--border)", display: "flex", gap: "14px", alignItems: "center" }}>
          {[["↑↓", "Navigate"], ["↵", "Open"], ["Esc", "Close"]].map(([key, label]) => (
            <span key={key} style={{ display: "flex", gap: "5px", fontSize: "11px", color: "var(--text-muted)", alignItems: "center" }}>
              <kbd style={{ fontSize: "10px", padding: "1px 5px", background: "var(--surface-2)", borderRadius: "3px", border: "0.5px solid var(--border)" }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
