"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
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
  Tag,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Flame,
  LayoutGrid,
  List,
  ChevronDown,
  Circle,
  TrendingUp,
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
  illustration:"Illustration",
  video:       "Video",
  writing:     "Writing",
  marketing:   "Marketing",
  consulting:  "Consulting",
  other:       "Other",
};

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  design:      "#6366f1",
  development: "#06b6d4",
  illustration:"#8b5cf6",
  video:       "#ec4899",
  writing:     "#f59e0b",
  marketing:   "#10b981",
  consulting:  "#e8a838",
  other:       "var(--text-muted)",
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

function isOverdue(d?: string) {
  if (!d) return false;
  return new Date(d) < new Date();
}

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div style={{ width:"52px", height:"52px", borderRadius:"var(--radius-lg)", background:"var(--color-danger-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Trash2 size={22} color="var(--color-danger)"/>
          </div>
          <h3 className="font-heading" style={{ fontSize:"17px", marginBottom:"6px" }}>Delete Project?</h3>
          <p style={{ fontSize:"13.5px", color:"var(--text-muted)", marginBottom:"20px", lineHeight:"1.6" }}>
            Permanently remove <strong style={{ color:"var(--text-primary)" }}>{project.title}</strong>. This action cannot be undone.
          </p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <Button id="proj-delete-cancel" onClick={onClose} variant="secondary" size="sm" disabled={deleting}>Cancel</Button>
            <Button id="proj-delete-confirm" onClick={handleDelete} variant="danger" size="sm" style={{ minWidth:"100px" }} disabled={deleting} leftIcon={deleting ? <Loader2 size={13} className="loading-spinner" /> : <Trash2 size={13}/>}>
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
                <span style={{ color:c.color }}>{c.icon}</span>{c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PROJECT CARD (Kanban-style) ──────────────────────────────
function ProjectCard({ project, onEdit, onDelete, onUpdated }: { project: Project; onEdit: (p: Project) => void; onDelete: (p: Project) => void; onUpdated: (p: Project) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pCfg = PRIORITY_CFG[project.priority];
  const overdue = isOverdue(project.dueDate) && project.status !== "completed" && project.status !== "cancelled";
  const completedMs = project.milestones.filter((m) => m.completed).length;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div
      className="glass-card"
      style={{ padding:"18px", display:"flex", flexDirection:"column", gap:"12px", cursor:"default", borderLeft:`3px solid ${CATEGORY_COLORS[project.category]}`, transition:"box-shadow var(--dur-fast)" }}
    >
      {/* Top row */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
            <span style={{ fontSize:"11px", fontWeight:700, color:CATEGORY_COLORS[project.category], letterSpacing:"0.06em" }}>
              {CATEGORY_LABELS[project.category]}
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:pCfg.color }}>
              {pCfg.icon}{pCfg.label}
            </span>
          </div>
          <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {project.title}
          </p>
          {project.clientName && (
            <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>{project.clientName}</p>
          )}
        </div>

        {/* Menu */}
        <div style={{ position:"relative", flexShrink:0 }} ref={menuRef}>
          <button
            id={`proj-menu-${project._id}`}
            onClick={() => setMenuOpen((v) => !v)}
            style={{ width:"28px", height:"28px", borderRadius:"6px", border:"1px solid var(--border-default)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)" }}
          >
            <MoreHorizontal size={14}/>
          </button>
          {menuOpen && (
            <div className="dropdown-menu" style={{ right:0, top:"34px" }}>
              {[
                { id:`view-${project._id}`,   icon:<Eye size={13}/>,   label:"View Details", href:`/dashboard/projects/${project._id}` },
                { id:`edit-${project._id}`,   icon:<Edit3 size={13}/>, label:"Edit",          action: () => { onEdit(project); setMenuOpen(false); } },
                { id:`delete-${project._id}`, icon:<Trash2 size={13}/>,label:"Delete",        action: () => { onDelete(project); setMenuOpen(false); }, danger:true },
              ].map((item) =>
                item.href ? (
                  <Link key={item.id} id={item.id} href={item.href} className="dropdown-item">{item.icon}{item.label}</Link>
                ) : (
                  <button key={item.id} id={item.id} onClick={item.action} className={`dropdown-item${item.danger ? " danger" : ""}`}>{item.icon}{item.label}</button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <StatusDropdown project={project} onUpdated={onUpdated}/>

      {/* Progress */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>Progress</span>
          <span style={{ fontSize:"12px", fontWeight:700, color:"var(--text-primary)" }}>{project.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width:`${project.progress}%`,
              background: project.progress >= 100 ? "var(--success)" : project.progress > 50 ? "var(--primary)" : "#6366f1",
            }}
          />
        </div>
      </div>

      {/* Budget row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
        <div>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.06em", marginBottom:"2px" }}>Budget</p>
          <p style={{ fontSize:"14px", fontWeight:800, color:"var(--primary)" }}>
            {project.budget > 0 ? `$${project.budget.toLocaleString()}` : "—"}
          </p>
        </div>
        <div>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.06em", marginBottom:"2px" }}>Paid</p>
          <p style={{ fontSize:"14px", fontWeight:800, color:"var(--success)" }}>
            {project.paid > 0 ? `$${project.paid.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:"10px", borderTop:"1px solid var(--border-subtle)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {/* Due date */}
          {project.dueDate && (
            <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", color: overdue ? "var(--error)" : "var(--text-muted)" }}>
              <Calendar size={11} color={overdue ? "var(--error)" : "var(--text-subtle)"}/>
              {overdue ? "Overdue" : fmtDate(project.dueDate)}
            </span>
          )}
          {/* Milestones */}
          {project.milestones.length > 0 && (
            <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", color:"var(--text-muted)" }}>
              <CheckCircle size={11} color="var(--text-subtle)"/>
              {completedMs}/{project.milestones.length}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:"4px" }}>
          <Link href={`/dashboard/projects/${project._id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye size={12}/>}>
              View
            </Button>
          </Link>
          <Button id={`proj-edit-card-${project._id}`} onClick={() => onEdit(project)} variant="ghost" size="sm" leftIcon={<Edit3 size={12}/>}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────
function ProjectRow({ project, onEdit, onDelete, onUpdated }: { project: Project; onEdit: (p: Project) => void; onDelete: (p: Project) => void; onUpdated: (p: Project) => void }) {
  const pCfg = PRIORITY_CFG[project.priority];
  const overdue = isOverdue(project.dueDate) && project.status !== "completed" && project.status !== "cancelled";

  return (
    <tr
      style={{ borderBottom:"1px solid var(--border-subtle)", transition:"background 0.15s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-elevated)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
    >
      {/* Project */}
      <td style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"4px", height:"36px", borderRadius:"2px", background:CATEGORY_COLORS[project.category], flexShrink:0 }}/>
          <div>
            <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)", marginBottom:"2px" }}>{project.title}</p>
            <p style={{ fontSize:"11px", color:"var(--text-muted)" }}>{project.clientName || CATEGORY_LABELS[project.category]}</p>
          </div>
        </div>
      </td>
      {/* Status */}
      <td style={{ padding:"14px 16px" }}><StatusDropdown project={project} onUpdated={onUpdated}/></td>
      {/* Priority */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"12px", color:pCfg.color, fontWeight:600 }}>
          {pCfg.icon}{pCfg.label}
        </span>
      </td>
      {/* Progress */}
      <td style={{ padding:"14px 16px", minWidth:"120px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div className="progress-bar" style={{ flex:1 }}>
            <div className="progress-fill" style={{ width:`${project.progress}%`, background: project.progress >= 100 ? "var(--success)" : "var(--primary)" }}/>
          </div>
          <span style={{ fontSize:"11px", color:"var(--text-muted)", minWidth:"30px" }}>{project.progress}%</span>
        </div>
      </td>
      {/* Budget */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ fontSize:"13px", fontWeight:700, color:"var(--primary)" }}>
          {project.budget > 0 ? `$${project.budget.toLocaleString()}` : "—"}
        </span>
      </td>
      {/* Due */}
      <td style={{ padding:"14px 16px" }}>
        <span style={{ fontSize:"12px", color: overdue ? "var(--error)" : "var(--text-secondary)", display:"flex", alignItems:"center", gap:"4px" }}>
          <Calendar size={11}/>
          {project.dueDate ? fmtDate(project.dueDate) : "—"}
        </span>
      </td>
      {/* Actions */}
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
          <Button id={`row-delete-${project._id}`} onClick={() => onDelete(project)} variant="ghost" size="sm" style={{ color:"var(--color-danger)" }}>
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

  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("all");
  const [priorityF,setPriorityF]= useState("all");
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
      const res  = await fetch(`/api/projects?${p.toString()}`);
      const data = await res.json();
      if (res.ok) { setProjects(data.projects ?? []); setTotal(data.total ?? 0); }
    } finally {
      setLoading(false);
    }
  }, [search, statusF, priorityF]);

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

  // Summary stats
  const activeCount    = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const totalBudget    = projects.reduce((s, p) => s + p.budget, 0);
  const totalPaid      = projects.reduce((s, p) => s + p.paid,   0);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", flexDirection:"column" }}>
      {/* Top Nav */}
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
          <h1 className="font-heading" style={{ fontSize:"15px", letterSpacing:"-0.01em" }}>Projects</h1>
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

      <main style={{ flex:1, padding:"28px", maxWidth:"1400px", width:"100%", margin:"0 auto" }}>

        {/* Summary Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:"14px", marginBottom:"24px" }}>
          {[
            { label:"Total Projects", value:total,          color:"var(--color-brand)",  icon:<Briefcase size={15}/> },
            { label:"Active",         value:activeCount,    color:"var(--color-success)",  icon:<Zap size={15}/> },
            { label:"Completed",      value:completedCount, color:"var(--color-accent)",     icon:<CheckCircle size={15}/> },
            { label:"Total Budget",   value:`$${totalBudget.toLocaleString()}`, color:"var(--color-brand)", icon:<DollarSign size={15}/> },
            { label:"Total Paid",     value:`$${totalPaid.toLocaleString()}`,   color:"var(--color-success)", icon:<TrendingUp size={15}/> },
          ].map((s) => (
            <div key={s.label} style={{ background:"var(--surface-1)", border:"0.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"var(--radius)", background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:"18px", fontWeight:800, color:"var(--text-primary)", lineHeight:1, letterSpacing:"-0.02em" }}>{s.value}</p>
                <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px", flexWrap:"wrap" }}>
          {/* Search */}
          <div className="search-input-wrapper" style={{ flex:1, minWidth:"180px", maxWidth:"300px" }}>
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

          {/* Priority filter */}
          <select id="priority-filter" value={priorityF} onChange={(e) => setPriorityF(e.target.value)}
            className="input-redesign" style={{ width:"auto", height:"36px", cursor:"pointer", fontSize:"12px" }}>
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CFG).map(([v,c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>

          <div style={{ flex:1 }}/>

          {/* View toggle */}
          <div className="filter-tabs">
            {(["grid","list"] as const).map((m) => (
              <button key={m} id={`view-${m}`} onClick={() => setViewMode(m)}
                className={`filter-tab${viewMode===m ? " active" : ""}`}>
                {m === "grid" ? <LayoutGrid size={14}/> : <List size={14}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"16px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height:"220px", borderRadius:"var(--radius-lg)" }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            heading={search || statusF !== "all" || priorityF !== "all" ? "No projects match your filters" : "No projects yet"}
            description={search || statusF !== "all" ? "Try adjusting your filters" : "Create your first project to get started"}
            actionLabel={!search && statusF === "all" && priorityF === "all" ? "New Project" : undefined}
            onActionClick={openAdd}
          />
        ) : viewMode === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"20px" }}>
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} onEdit={openEdit} onDelete={setDeleteTarget} onUpdated={handleUpdated}/>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {["Project","Status","Priority","Progress","Budget","Due Date",""].map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <ProjectRow key={p._id} project={p} onEdit={openEdit} onDelete={setDeleteTarget} onUpdated={handleUpdated}/>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ProjectFormModal open={formOpen} onClose={() => setFormOpen(false)} initial={editTarget} onSaved={handleSaved}/>
      <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted}/>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
