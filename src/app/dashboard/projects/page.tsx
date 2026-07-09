"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  X,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  FileText,
  Zap,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Flame,
  LayoutGrid,
  List,
  ChevronDown,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectCategory,
  ProjectFormData,
  ProjectMilestone,
} from "@/types/project";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
    case "active":
      return "active";
    case "in_review":
    case "on_hold":
    case "draft":
      return "pending";
    case "cancelled":
    default:
      return "inactive";
  }
};

// ─── CONFIG ──────────────────────────────────────────────────
const STATUS_CFG: Record<
  ProjectStatus,
  { label: string; badge: string; icon: React.ReactNode; color: string }
> = {
  draft:      { label: "Draft",      badge: "badge-info",    icon: <FileText size={11}/>,   color: "var(--info)" },
  active:     { label: "Active",     badge: "badge-success", icon: <Zap size={11}/>,         color: "var(--success)" },
  in_review:  { label: "In Review",  badge: "badge-warning", icon: <Clock size={11}/>,       color: "var(--warning)" },
  completed:  { label: "Completed",  badge: "badge-success", icon: <CheckCircle size={11}/>, color: "var(--success)" },
  on_hold:    { label: "On Hold",    badge: "badge-warning", icon: <Pause size={11}/>,       color: "var(--warning)" },
  cancelled:  { label: "Cancelled",  badge: "badge-error",   icon: <XCircle size={11}/>,     color: "var(--error)" },
};

const PRIORITY_CFG: Record<
  ProjectPriority,
  { label: string; icon: React.ReactNode; color: string }
> = {
  low:    { label: "Low",    icon: <ArrowDown size={12}/>,  color: "var(--success)" },
  medium: { label: "Medium", icon: <ArrowRight size={12}/>, color: "var(--warning)" },
  high:   { label: "High",   icon: <ArrowUp size={12}/>,    color: "#f97316" },
  urgent: { label: "Urgent", icon: <Flame size={12}/>,      color: "var(--error)" },
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  design:      "Design",
  development: "Development",
  illustration: "Illustration",
  video:       "Video",
  writing:     "Writing",
  marketing:   "Marketing",
  consulting:  "Consulting",
  other:       "Other",
};

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  design:      "var(--color-iris-violet)",
  development: "var(--color-signal-teal)",
  illustration: "var(--color-lavender)",
  video:       "var(--color-coral-red)",
  writing:     "var(--color-mist)",
  marketing:   "var(--color-pulse-green)",
  consulting:  "var(--color-bone)",
  other:       "var(--color-fog)",
};

const EMPTY_FORM: ProjectFormData = {
  title: "",
  description: "",
  clientId: undefined,
  clientName: "",
  category: "design",
  status: "draft",
  priority: "medium",
  budget: 0,
  currency: "USD",
  paid: 0,
  progress: 0,
  startDate: "",
  dueDate: "",
  tags: [],
  milestones: [],
  notes: "",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysRemaining(d?: string) {
  if (!d) return null;
  const due = new Date(d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ─── HEALTH & RISK UTILS ──────────────────────────────────────
const getProjectHealth = (project: Project) => {
  let score = 100;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = project.dueDate && new Date(project.dueDate) < now && project.status !== "completed" && project.status !== "cancelled";
  if (overdue) {
    score -= 40;
  } else if (project.dueDate) {
    const daysLeft = getDaysRemaining(project.dueDate);
    if (daysLeft !== null) {
      if (daysLeft <= 5 && project.progress < 50) {
        score -= 25;
      } else if (daysLeft <= 10 && project.progress < 20) {
        score -= 15;
      }
    }
  }

  if (project.milestones.length === 0 && project.status === "active") {
    score -= 10;
  }

  if (project.paid > project.budget) {
    score -= 10;
  }

  return Math.max(0, score);
};

const getRiskInfo = (project: Project, health: number) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdue = project.dueDate && new Date(project.dueDate) < now && project.status !== "completed" && project.status !== "cancelled";
  
  if (overdue) {
    return { label: "Overdue Alert", level: "high", color: "var(--error)" };
  }
  
  if (project.dueDate) {
    const daysLeft = getDaysRemaining(project.dueDate);
    if (daysLeft !== null) {
      if (daysLeft <= 5 && project.progress < 50) {
        return { label: "Delay Risk", level: "high", color: "var(--error)" };
      }
      if (daysLeft <= 10 && project.progress < 25) {
        return { label: "Schedule Warning", level: "medium", color: "var(--warning)" };
      }
    }
  }
  
  if (health < 70) {
    return { label: "Review Budgets", level: "medium", color: "var(--warning)" };
  }
  
  return { label: "On Track", level: "low", color: "var(--success)" };
};

const getSuggestedAction = (project: Project) => {
  if (project.status === "completed" && project.budget > project.paid) {
    return `Bill outstanding $${(project.budget - project.paid).toLocaleString()}`;
  }
  if (project.status === "in_review") {
    return "Ping client for feedback review";
  }
  const nextMs = project.milestones.find((m) => !m.completed);
  if (nextMs) {
    return `Complete milestone: "${nextMs.title}"`;
  }
  if (project.status === "active" && project.milestones.length === 0) {
    return "Create milestones to scope tasks";
  }
  return "Assess project roadmap steps";
};

// ─── PROJECT FORM MODAL ───────────────────────────────────────
function ProjectFormModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: (ProjectFormData & { _id?: string }) | null;
  onSaved: (p: Project) => void;
}) {
  const [form, setForm] = useState<ProjectFormData & { _id?: string }>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basics" | "milestones" | "notes">("basics");
  const [milestoneInput, setMilestoneInput] = useState("");
  const isEdit = !!initial?._id;

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_FORM);
      setTagInput("");
      setMilestoneInput("");
      setError("");
      setActiveTab("basics");
    }
  }, [open, initial?._id]);

  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const addMilestone = () => {
    const t = milestoneInput.trim();
    if (!t) return;
    const ms: ProjectMilestone = { id: uid(), title: t, completed: false };
    set("milestones", [...form.milestones, ms]);
    setMilestoneInput("");
  };

  const toggleMilestone = (id: string) =>
    set("milestones", form.milestones.map((m) => m.id === id ? { ...m, completed: !m.completed } : m));

  const removeMilestone = (id: string) =>
    set("milestones", form.milestones.filter((m) => m.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url    = isEdit ? `/api/projects/${form._id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onSaved(data.project as Project);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth:"620px", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div className="subpage-icon">
              <Briefcase size={15} />
            </div>
            <h2 className="font-heading" style={{ fontSize:"17px" }}>
              {isEdit ? "Edit Project" : "New Project"}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY:"auto" }}>
          {/* Tabs */}
          <div className="modal-tabs">
            {(["basics", "milestones", "notes"] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`modal-tab${activeTab === id ? " active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {id === "basics" ? "Details" : id === "milestones" ? `Milestones (${form.milestones.length})` : "Notes"}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-banner">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {/* ── TAB: BASICS ── */}
            {activeTab === "basics" && (
              <>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-title">Project Title *</label>
                  <input id="proj-title" className="input-redesign" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Brand Identity for Bloom Studio" required />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-client">Client Name</label>
                    <input id="proj-client" className="input-redesign" value={form.clientName ?? ""} onChange={(e) => set("clientName", e.target.value)} placeholder="Client or company" />
                  </div>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-category">Category</label>
                    <select id="proj-category" className="input-redesign" value={form.category} onChange={(e) => set("category", e.target.value as ProjectCategory)} style={{ cursor:"pointer" }}>
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-status">Status</label>
                    <select id="proj-status" className="input-redesign" value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} style={{ cursor:"pointer" }}>
                      {Object.entries(STATUS_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-priority">Priority</label>
                    <select id="proj-priority" className="input-redesign" value={form.priority} onChange={(e) => set("priority", e.target.value as ProjectPriority)} style={{ cursor:"pointer" }}>
                      {Object.entries(PRIORITY_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-budget">Budget ($)</label>
                    <input id="proj-budget" className="input-redesign" type="number" min={0} value={form.budget} onChange={(e) => set("budget", Number(e.target.value))} />
                  </div>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-paid">Amount Paid ($)</label>
                    <input id="proj-paid" className="input-redesign" type="number" min={0} value={form.paid} onChange={(e) => set("paid", Number(e.target.value))} />
                  </div>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-progress">Progress (%)</label>
                    <input id="proj-progress" className="input-redesign" type="number" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} />
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-start">Start Date</label>
                    <input id="proj-start" className="input-redesign" type="date" value={form.startDate ?? ""} onChange={(e) => set("startDate", e.target.value)} />
                  </div>
                  <div className="form-group-redesign">
                    <label className="label-redesign" htmlFor="proj-due">Due Date</label>
                    <input id="proj-due" className="input-redesign" type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
                  </div>
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-desc">Description</label>
                  <textarea id="proj-desc" className="textarea-redesign" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief project description..." rows={2} style={{ resize:"vertical" }} />
                </div>

                <div className="form-group-redesign">
                  <label className="label-redesign">Tags</label>
                  <div className="tag-input-container">
                    {form.tags.map((t) => (
                      <span key={t} className="tag-chip">
                        {t}
                        <button type="button" className="tag-chip-remove" onClick={() => set("tags", form.tags.filter((x) => x !== t))}>
                          <X size={10}/>
                        </button>
                      </span>
                    ))}
                    <input
                      className="tag-input-inner"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag & press Enter"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── TAB: MILESTONES ── */}
            {activeTab === "milestones" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input
                    className="input-redesign"
                    value={milestoneInput}
                    onChange={(e) => setMilestoneInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key==="Enter") { e.preventDefault(); addMilestone(); } }}
                    placeholder="Milestone title, e.g. Wireframes approved"
                    style={{ flex:1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addMilestone}
                    style={{ padding: "0 14px", height: "36px" }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginTop:"6px" }}>
                  {form.milestones.map((m) => (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", background:"var(--surface-2)", borderRadius:"var(--radius-md)" }}>
                      <button
                        type="button"
                        onClick={() => toggleMilestone(m.id)}
                        style={{ width:"18px", height:"18px", borderRadius:"50%", border:`2px solid ${m.completed ? "var(--success)" : "var(--border-strong)"}`, background: m.completed ? "var(--success)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}
                      >
                        {m.completed && <CheckCircle size={10} color="white" fill="white"/>}
                      </button>
                      <span style={{ flex:1, fontSize:"13px", color: m.completed ? "var(--text-muted)" : "var(--text-primary)", textDecoration: m.completed ? "line-through" : "none" }}>
                        {m.title}
                      </span>
                      <button type="button" onClick={() => removeMilestone(m.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex", padding:"2px", borderRadius:"4px" }}>
                        <X size={13}/>
                      </button>
                    </div>
                  ))}
                </div>

                {form.milestones.length > 0 && (
                  <div style={{ padding:"8px 12px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", fontSize:"12px", color:"var(--text-muted)" }}>
                    {form.milestones.filter((m) => m.completed).length} / {form.milestones.length} completed
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: NOTES ── */}
            {activeTab === "notes" && (
              <div className="form-group-redesign">
                <label className="label-redesign" htmlFor="proj-notes">Internal Notes</label>
                <textarea id="proj-notes" className="textarea-redesign" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notes, links, instructions, anything relevant..." rows={8} style={{ resize:"vertical" }} />
              </div>
            )}

            {/* Footer */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", paddingTop:"8px", borderTop:"1px solid var(--border-subtle)", marginTop:"4px" }}>
              <Button type="button" onClick={onClose} variant="secondary" size="sm" disabled={saving}>Cancel</Button>
              <Button type="submit" id="project-form-submit" variant="primary" size="sm" style={{ minWidth:"120px" }} disabled={saving} leftIcon={saving ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> : undefined}>
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────
function DeleteModal({
  project,
  onClose,
  onDeleted,
}: {
  project: Project | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method:"DELETE" });
      if (res.ok) onDeleted(project._id);
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  if (!project) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:"380px", textAlign:"center" }}>
        <div className="modal-body">
          <div style={{ width:"52px", height:"52px", borderRadius:"var(--radius-lg)", background:"rgba(239, 68, 68, 0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Trash2 size={22} color="var(--error)"/>
          </div>
          <h3 className="font-heading" style={{ fontSize:"17px", marginBottom:"6px" }}>Delete Project?</h3>
          <p style={{ fontSize:"13.5px", color:"var(--text-muted)", marginBottom:"20px", lineHeight:"1.6" }}>
            Permanently remove <strong style={{ color:"var(--text-primary)" }}>{project.title}</strong>. This action cannot be undone.
          </p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <Button id="proj-delete-cancel" onClick={onClose} variant="secondary" size="sm" disabled={deleting}>Cancel</Button>
            <Button id="proj-delete-confirm" onClick={handleDelete} variant="danger" size="sm" style={{ minWidth:"100px" }} disabled={deleting} leftIcon={deleting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13}/>}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STATUS QUICK-CHANGE DROPDOWN ────────────────────────────
function StatusDropdown({ project, onUpdated }: { project: Project; onUpdated: (p: Project) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const change = async (status: ProjectStatus) => {
    setOpen(false);
    const res = await fetch(`/api/projects/${project._id}`, {
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status }),
    });
    if (res.ok) { const d = await res.json(); onUpdated(d.project); }
  };

  const cfg = STATUS_CFG[project.status];

  return (
    <div style={{ position:"relative" }} ref={ref}>
      <button
        id={`status-btn-${project._id}`}
        onClick={() => setOpen((v) => !v)}
        style={{ cursor:"pointer", border:"none", background:"transparent", display:"flex", alignItems:"center", padding:0 }}
      >
        <Badge variant={getBadgeVariant(project.status)}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:"4px" }}>
            {cfg.icon}
            <span>{cfg.label}</span>
            <ChevronDown size={9}/>
          </span>
        </Badge>
      </button>
      {open && (
        <div className="dropdown-menu" style={{ top:"calc(100% + 6px)", left:0, minWidth:"150px" }}>
          {(Object.keys(STATUS_CFG) as ProjectStatus[]).map((s) => {
            const c = STATUS_CFG[s];
            return (
              <button
                key={s}
                id={`status-option-${s}-${project._id}`}
                onClick={() => change(s)}
                className={`dropdown-item${s === project.status ? " active" : ""}`}
              >
                <span style={{ color:c.color, display:"inline-flex", alignItems:"center", marginRight:"6px" }}>{c.icon}</span>{c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT CARD (Grid View) ─────────────────────────────────
function ProjectCard({ project, onEdit, onDelete, onUpdated }: { project: Project; onEdit: (p: Project) => void; onDelete: (p: Project) => void; onUpdated: (p: Project) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pCfg = PRIORITY_CFG[project.priority];
  const completedMs = project.milestones.filter((m) => m.completed).length;

  const healthScore = useMemo(() => getProjectHealth(project), [project]);
  const riskInfo = useMemo(() => getRiskInfo(project, healthScore), [project, healthScore]);
  const suggestedAction = useMemo(() => getSuggestedAction(project), [project]);
  const daysLeft = useMemo(() => getDaysRemaining(project.dueDate), [project.dueDate]);
  const overdue = daysLeft !== null && daysLeft < 0 && project.status !== "completed" && project.status !== "cancelled";

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        cursor: "default",
        borderLeft: `4px solid ${CATEGORY_COLORS[project.category]}`,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Top Meta info row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: CATEGORY_COLORS[project.category],
              background: `${CATEGORY_COLORS[project.category]}12`,
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {CATEGORY_LABELS[project.category]}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: pCfg.color, fontWeight: 600 }}>
            {pCfg.icon}
            {pCfg.label}
          </span>
        </div>

        {/* Action drop trigger */}
        <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
          <button
            id={`proj-menu-${project._id}`}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu" style={{ right: 0, top: "34px" }}>
              {[
                { id: `view-${project._id}`, icon: <Eye size={13} />, label: "View Details", href: `/dashboard/projects/${project._id}` },
                { id: `edit-${project._id}`, icon: <Edit3 size={13} />, label: "Edit Details", action: () => { onEdit(project); setMenuOpen(false); } },
                { id: `delete-${project._id}`, icon: <Trash2 size={13} />, label: "Delete Project", action: () => { onDelete(project); setMenuOpen(false); }, danger: true },
              ].map((item) =>
                item.href ? (
                  <Link key={item.id} id={item.id} href={item.href} className="dropdown-item">
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.id} id={item.id} onClick={item.action} className={`dropdown-item${item.danger ? " danger" : ""}`}>
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title & Client */}
      <div>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {project.title}
        </p>
        {project.clientName ? (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{project.clientName}</p>
        ) : (
          <p style={{ fontSize: "12px", color: "var(--text-subtle)", marginTop: "4px" }}>Direct Project</p>
        )}
      </div>

      {/* AI Risk & Health Score row */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            background: riskInfo.level === "high" ? "rgba(239, 68, 68, 0.12)" : riskInfo.level === "medium" ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
            color: riskInfo.color,
            padding: "2px 8px",
            borderRadius: "4px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Sparkles size={11} />
          {riskInfo.label}
        </span>

        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Health Score: 
          <strong
            style={{
              color: healthScore >= 80 ? "var(--success)" : healthScore >= 50 ? "var(--warning)" : "var(--error)",
              fontWeight: 800,
            }}
          >
            {healthScore}/100
          </strong>
        </span>
      </div>

      {/* Progress & Milestone */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Progress</span>
          <span style={{ fontSize: "12px", fontWeight: 700 }}>{project.progress}%</span>
        </div>
        <div className="progress-bar" style={{ height: "4px" }}>
          <div
            className="progress-fill"
            style={{
              width: `${project.progress}%`,
              background: project.progress >= 100 ? "var(--success)" : project.progress > 50 ? "var(--primary)" : "var(--color-iris-violet)",
            }}
          />
        </div>
      </div>

      {/* Financial Splits */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          background: "var(--surface-2)",
          padding: "10px",
          borderRadius: "var(--radius)",
        }}
      >
        <div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Budget</span>
          <p style={{ fontSize: "13px", fontWeight: 800, marginTop: "2px" }}>
            {project.budget > 0 ? `$${project.budget.toLocaleString()}` : "—"}
          </p>
        </div>
        <div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Collected</span>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "var(--success)", marginTop: "2px" }}>
            {project.paid > 0 ? `$${project.paid.toLocaleString()}` : "—"}
          </p>
        </div>
        <div>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Remaining</span>
          <p style={{ fontSize: "13px", fontWeight: 800, color: project.budget - project.paid > 0 ? "var(--color-iris-violet)" : "var(--text-muted)", marginTop: "2px" }}>
            {project.budget - project.paid > 0 ? `$${(project.budget - project.paid).toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      {/* AI Next Action Opportunity card */}
      <div
        style={{
          background: "rgba(99, 102, 241, 0.04)",
          border: "0.5px solid rgba(99, 102, 241, 0.15)",
          borderRadius: "var(--radius)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
        }}
      >
        <Sparkles size={12} color="var(--color-iris-violet)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
          <span style={{ color: "var(--text-muted)" }}>Suggested Next: </span>
          <strong style={{ color: "var(--text-secondary)" }}>{suggestedAction}</strong>
        </div>
      </div>

      {/* Footer Details */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "10px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: overdue ? "var(--error)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
            <Calendar size={11} />
            {overdue
              ? "Overdue"
              : daysLeft === null
              ? "No Due Date"
              : daysLeft === 0
              ? "Due Today"
              : daysLeft === 1
              ? "Due Tomorrow"
              : `${daysLeft} days left`}
          </span>

          {project.milestones.length > 0 && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
              <CheckCircle size={11} />
              {completedMs}/{project.milestones.length}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <StatusDropdown project={project} onUpdated={onUpdated} />
        </div>
      </div>
    </div>
  );
}

// ─── LIST ROW (Table View) ────────────────────────────────────
function ProjectRow({ project, onEdit, onDelete, onUpdated }: { project: Project; onEdit: (p: Project) => void; onDelete: (p: Project) => void; onUpdated: (p: Project) => void }) {
  const pCfg = PRIORITY_CFG[project.priority];
  const daysLeft = useMemo(() => getDaysRemaining(project.dueDate), [project.dueDate]);
  const overdue = daysLeft !== null && daysLeft < 0 && project.status !== "completed" && project.status !== "cancelled";

  return (
    <tr
      style={{ borderBottom:"1px solid var(--border-subtle)", transition:"background 0.15s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-elevated)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
    >
      {/* Project info column */}
      <td style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"4px", height:"32px", borderRadius:"2px", background:CATEGORY_COLORS[project.category], flexShrink:0 }}/>
          <div>
            <p style={{ fontSize:"13.5px", fontWeight:600, color:"var(--text-primary)", marginBottom:"2px" }}>{project.title}</p>
            <p style={{ fontSize:"11px", color:"var(--text-muted)" }}>{project.clientName || CATEGORY_LABELS[project.category]}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding:"14px 16px" }}>
        <StatusDropdown project={project} onUpdated={onUpdated}/>
      </td>

      {/* Priority */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"12px", color:pCfg.color, fontWeight:600 }}>
          {pCfg.icon}
          {pCfg.label}
        </span>
      </td>

      {/* Progress */}
      <td style={{ padding:"14px 16px", minWidth:"110px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div className="progress-bar" style={{ flex:1, height: "4px" }}>
            <div className="progress-fill" style={{ width:`${project.progress}%`, background: project.progress >= 100 ? "var(--success)" : "var(--primary)" }}/>
          </div>
          <span style={{ fontSize:"11px", color:"var(--text-muted)", minWidth:"28px" }}>{project.progress}%</span>
        </div>
      </td>

      {/* Budget */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ fontSize:"13px", fontWeight:700 }}>
          {project.budget > 0 ? `$${project.budget.toLocaleString()}` : "—"}
        </span>
      </td>

      {/* Due Date & remaining status */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ fontSize:"12px", color: overdue ? "var(--error)" : "var(--text-secondary)", display:"flex", alignItems:"center", gap:"4px" }}>
          <Calendar size={11}/>
          {project.dueDate ? (
            <>
              {fmtDate(project.dueDate)}
              {overdue && <span style={{ fontSize: "10px", color: "var(--error)", marginLeft: "4px", fontWeight: 700 }}>(Overdue)</span>}
            </>
          ) : "—"}
        </span>
      </td>

      {/* Action actions buttons */}
      <td style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", gap:"4px" }}>
          <Link href={`/dashboard/projects/${project._id}`}>
            <Button variant="ghost" size="sm">
              <Eye size={13}/>
            </Button>
          </Link>
          <Button id={`row-edit-${project._id}`} onClick={() => onEdit(project)} variant="ghost" size="sm">
            <Edit3 size={13}/>
          </Button>
          <Button id={`row-delete-${project._id}`} onClick={() => onDelete(project)} variant="ghost" size="sm" style={{ color:"var(--error)" }}>
            <Trash2 size={13}/>
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ProjectsPage() {
  useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  // Filter and Sorting state
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("all");
  const [priorityF,setPriorityF]= useState("all");
  const [categoryF,setCategoryF]= useState("all");
  const [sortBy,   setSortBy]   = useState<"dueDate" | "budget" | "progress" | "createdAt" | "title">("createdAt");
  const [sortOrder,setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");

  const [formOpen,    setFormOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<(ProjectFormData & { _id?: string }) | null>(null);
  const [deleteTarget,setDeleteTarget]= useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search)              p.set("q",        search);
      if (statusF  !== "all") p.set("status",   statusF);
      if (priorityF !== "all") p.set("priority", priorityF);
      if (categoryF !== "all") p.set("category", categoryF);
      const res  = await fetch(`/api/projects?${p.toString()}`);
      const data = await res.json();
      if (res.ok) { setProjects(data.projects ?? []); setTotal(data.total ?? 0); }
    } finally {
      setLoading(false);
    }
  }, [search, statusF, priorityF, categoryF]);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 300);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };

  const openEdit = (p: Project) => {
    setEditTarget({ _id: p._id, title:p.title, description:p.description, clientId:p.clientId, clientName:p.clientName, category:p.category, status:p.status, priority:p.priority, budget:p.budget, currency:p.currency, paid:p.paid, progress:p.progress, startDate:p.startDate, dueDate:p.dueDate, tags:p.tags, milestones:p.milestones, notes:p.notes });
    setFormOpen(true);
  };

  const handleSaved = (p: Project) => {
    setProjects((prev) => {
      const idx = prev.findIndex((x) => x._id === p._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = p; return n; }
      return [p, ...prev];
    });
    if (!editTarget?._id) setTotal((t) => t + 1);
    setFormOpen(false);
  };

  const handleDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== id));
    setTotal((t) => t - 1);
  };

  const handleUpdated = (p: Project) =>
    setProjects((prev) => prev.map((x) => x._id === p._id ? p : x));

  // Compute stats across all loaded projects
  const activeCount    = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const totalBudget    = projects.reduce((s, p) => s + p.budget, 0);
  const totalPaid      = projects.reduce((s, p) => s + p.paid,   0);

  // Compute dynamic AI insights
  const aiInsights = useMemo(() => getAIProjectInsights(projects), [projects]);

  // Handle client-side sorting
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        valA = new Date(a.dueDate).getTime();
        valB = new Date(b.dueDate).getTime();
      } else if (sortBy === "createdAt") {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [projects, sortBy, sortOrder]);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", flexDirection:"column" }} className="page-enter">
      {/* Header Bar */}
      <header style={{ height:"60px", display:"flex", alignItems:"center", gap:"16px", padding:"0 24px", borderBottom:"0.5px solid var(--border)", background:"var(--surface-1)", position:"sticky", top:0, zIndex:20 }}>
        <Link href="/dashboard"
          style={{ display:"flex", alignItems:"center", gap:"6px", color:"var(--text-muted)", textDecoration:"none", fontSize:"13px", transition:"color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14}/> Dashboard
        </Link>
        <span style={{ color:"var(--border-strong)", fontSize:"12px" }}>/</span>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"26px", height:"26px", borderRadius:"7px", background:"var(--color-brand-subtle)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Briefcase size={13} color="var(--color-brand)"/>
          </div>
          <h1 className="font-heading" style={{ fontSize:"15px", letterSpacing:"-0.01em" }}>Projects Workspace</h1>
        </div>
        <div style={{ flex:1 }}/>
        <button
          id="add-project-btn"
          onClick={openAdd}
          className="btn-redesign btn-redesign-primary btn-redesign-sm"
        >
          <Plus size={13}/> New Project
        </button>
      </header>

      <main style={{ flex:1, padding:"28px", maxWidth:"1400px", width:"100%", margin:"0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Title and stats summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "28px", letterSpacing: "-0.02em" }}>
              Projects
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
              Manage deliverables, track schedules, and analyze budget collection metrics.
            </p>
          </div>
        </div>

        {/* Dynamic AI insights box */}
        {projects.length > 0 && (
          <div
            style={{
              background: "rgba(99, 102, 241, 0.04)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={15} color="var(--color-iris-violet)" />
              <h3 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-iris-violet)" }}>
                AI Project Assistant
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {aiInsights.map((insight, i) => (
                <p key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "var(--color-iris-violet)" }}>•</span>
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Project KPI widgets */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"16px" }}>
          {[
            { label:"Total Projects", value:total,          color:"var(--color-brand)",  icon:<Briefcase size={15}/> },
            { label:"Active Status",  value:activeCount,    color:"var(--color-iris-violet)",  icon:<Zap size={15}/> },
            { label:"Completed",      value:completedCount, color:"var(--color-pulse-green)",     icon:<CheckCircle size={15}/> },
            { label:"Aggregated Budget", value:`$${totalBudget.toLocaleString()}`, color:"var(--color-brand)", icon:<DollarSign size={15}/> },
            { label:"Amount Settled", value:`$${totalPaid.toLocaleString()}`,   color:"var(--color-signal-teal)", icon:<TrendingUp size={15}/> },
          ].map((s) => (
            <div key={s.label} style={{ background:"var(--surface-1)", border:"0.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"16px 20px", display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{ width:"34px", height:"34px", borderRadius:"var(--radius)", background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:"20px", fontWeight:800, color:"var(--text-primary)", lineHeight:1.15, letterSpacing:"-0.02em" }}>{s.value}</p>
                <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and search block */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", padding: "12px 16px", border: "1px solid var(--border)", background: "var(--surface-1)", borderRadius: "var(--radius-lg)" }}>
          {/* Search */}
          <div className="search-input-wrapper" style={{ flex:1, minWidth:"180px", maxWidth:"280px" }}>
            <span className="search-input-icon"><Search size={13}/></span>
            <input id="proj-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..." className="search-input"/>
          </div>

          {/* Status filter */}
          <div className="filter-tabs">
            {["all", ...Object.keys(STATUS_CFG)].map((s) => (
              <button key={s} id={`status-filter-${s}`} onClick={() => setStatusF(s)}
                className={`filter-tab${statusF===s ? " active" : ""}`}>
                {s === "all" ? "All" : STATUS_CFG[s as ProjectStatus].label}
              </button>
            ))}
          </div>

          {/* Category filter dropdown */}
          <select
            id="category-filter"
            value={categoryF}
            onChange={(e) => setCategoryF(e.target.value)}
            className="input-redesign"
            style={{ width: "auto", height: "36px", cursor: "pointer", fontSize: "12px" }}
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Priority filter dropdown */}
          <select id="priority-filter" value={priorityF} onChange={(e) => setPriorityF(e.target.value)}
            className="input-redesign" style={{ width:"auto", height:"36px", cursor:"pointer", fontSize:"12px" }}>
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CFG).map(([v,c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>

          {/* Sorting controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-redesign"
              style={{ width: "auto", height: "36px", cursor: "pointer", fontSize: "12px" }}
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="budget">Budget</option>
              <option value="progress">Progress</option>
              <option value="title">Project Title</option>
            </select>
            <button
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              style={{
                height: "36px",
                padding: "0 10px",
                background: "var(--surface-2)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "var(--text-secondary)",
              }}
            >
              {sortOrder === "asc" ? "ASC" : "DESC"}
            </button>
          </div>

          <div style={{ flex:1 }}/>

          {/* View Mode Grid/List toggle */}
          <div className="filter-tabs" style={{ flexShrink: 0 }}>
            {(["grid","list"] as const).map((m) => (
              <button key={m} id={`view-${m}`} onClick={() => setViewMode(m)}
                className={`filter-tab${viewMode===m ? " active" : ""}`}>
                {m === "grid" ? <LayoutGrid size={14}/> : <List size={14}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Content list block */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"20px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height:"240px", borderRadius:"var(--radius-lg)" }} />
            ))}
          </div>
        ) : sortedProjects.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            heading={search || statusF !== "all" || priorityF !== "all" || categoryF !== "all" ? "No projects match your filters" : "No projects yet"}
            description={search || statusF !== "all" || priorityF !== "all" || categoryF !== "all" ? "Try adjusting your filters" : "Create your first project to get started"}
            actionLabel={!search && statusF === "all" && priorityF === "all" && categoryF === "all" ? "New Project" : undefined}
            onActionClick={openAdd}
          />
        ) : viewMode === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"20px" }}>
            {sortedProjects.map((p) => (
              <ProjectCard key={p._id} project={p} onEdit={openEdit} onDelete={setDeleteTarget} onUpdated={handleUpdated}/>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Progress</th>
                    <th>Budget</th>
                    <th>Due Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map((p) => (
                    <ProjectRow key={p._id} project={p} onEdit={openEdit} onDelete={setDeleteTarget} onUpdated={handleUpdated}/>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Dialog Modals */}
      <ProjectFormModal open={formOpen} onClose={() => setFormOpen(false)} initial={editTarget} onSaved={handleSaved}/>
      <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted}/>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// Helper to calculate AI insights list
function getAIProjectInsights(allProjects: Project[]) {
  const insights = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdueCount = allProjects.filter((p) => p.dueDate && new Date(p.dueDate) < now && p.status !== "completed" && p.status !== "cancelled").length;
  if (overdueCount > 0) {
    insights.push(`⚠️ Timeline Alert: You have ${overdueCount} overdue project(s). We suggest updating timelines or prompting the client.`);
  }

  const billingOwed = allProjects
    .filter((p) => p.status === "completed" && p.budget > p.paid)
    .reduce((sum, p) => sum + (p.budget - p.paid), 0);
  if (billingOwed > 0) {
    insights.push(`💰 Outstanding Billings: $${billingOwed.toLocaleString()} is remaining to be collected across completed projects. Click to trigger invoice reminder.`);
  }

  const atRisk = allProjects.filter((p) => {
    if (!p.dueDate || p.status === "completed" || p.status === "cancelled") return false;
    const due = new Date(p.dueDate);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && p.progress < 50;
  });
  if (atRisk.length > 0) {
    const days = getDaysRemaining(atRisk[0].dueDate);
    insights.push(`🚨 Schedule Risk: "${atRisk[0].title}" is due in ${days} days but is only ${atRisk[0].progress}% complete. Suggested action: prioritize upcoming milestone.`);
  }

  if (insights.length === 0) {
    insights.push("✨ Project pipeline status: All project schedules, milestones, and payments are currently on track.");
  }

  return insights;
}
