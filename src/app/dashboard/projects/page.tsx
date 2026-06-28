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

  const tabBtn = (id: typeof activeTab, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      style={{
        padding: "8px 16px",
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: activeTab === id ? "var(--bg-card)" : "transparent",
        color: activeTab === id ? "var(--primary)" : "var(--text-muted)",
        fontSize: "13px",
        fontWeight: activeTab === id ? 700 : 500,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: activeTab === id ? "var(--shadow-sm)" : "none",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.18s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{ width:"100%", maxWidth:"620px", maxHeight:"90vh", overflowY:"auto", padding:"28px", animation:"scaleIn 0.2s ease" }}
      >
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Briefcase size={17} color="var(--primary)" />
            </div>
            <h2 className="font-heading" style={{ fontSize:"18px" }}>
              {isEdit ? "Edit Project" : "New Project"}
            </h2>
          </div>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid var(--border-default)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)" }}>
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"4px", background:"var(--bg-elevated)", padding:"4px", borderRadius:"var(--radius-md)", marginBottom:"20px" }}>
          {tabBtn("basics",     "Details")}
          {tabBtn("milestones", `Milestones (${form.milestones.length})`)}
          {tabBtn("notes",      "Notes")}
        </div>

        {error && (
          <div style={{ background:"var(--error-bg)", border:"1px solid var(--error)", borderRadius:"var(--radius-md)", padding:"10px 14px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px", color:"var(--error)", fontSize:"13px" }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          {/* ── TAB: BASICS ── */}
          {activeTab === "basics" && (
            <>
              {/* Title */}
              <div className="form-group-redesign">
                <label className="label-redesign" htmlFor="proj-title">Project Title *</label>
                <input id="proj-title" className="input-redesign" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Brand Identity for Bloom Studio" required />
              </div>

              {/* Client + Category */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-client">Client Name</label>
                  <input id="proj-client" className="input-redesign" value={form.clientName ?? ""} onChange={(e) => set("clientName", e.target.value)} placeholder="Client or company" />
                </div>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-category">Category</label>
                  <select id="proj-category" className="input-redesign" value={form.category} onChange={(e) => set("category", e.target.value as ProjectCategory)} style={{ cursor:"pointer" }}>
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status + Priority */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-status">Status</label>
                  <select id="proj-status" className="input-redesign" value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} style={{ cursor:"pointer" }}>
                    {Object.entries(STATUS_CFG).map(([v, c]) => (
                      <option key={v} value={v}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-redesign">
                  <label className="label-redesign" htmlFor="proj-priority">Priority</label>
                  <select id="proj-priority" className="input-redesign" value={form.priority} onChange={(e) => set("priority", e.target.value as ProjectPriority)} style={{ cursor:"pointer" }}>
                    {Object.entries(PRIORITY_CFG).map(([v, c]) => (
                      <option key={v} value={v}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget + Paid */}
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

              {/* Start + Due Date */}
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

              {/* Description */}
              <div className="form-group-redesign">
                <label className="label-redesign" htmlFor="proj-desc">Description</label>
                <textarea id="proj-desc" className="textarea-redesign" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief project description..." rows={2} style={{ resize:"vertical" }} />
              </div>

              {/* Tags */}
              <div className="form-group-redesign">
                <label className="label-redesign">Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", padding:"8px", background:"var(--surface-2)", border:"0.5px solid var(--border)", borderRadius:"var(--radius)", minHeight:"44px", alignItems:"center" }}>
                  {form.tags.map((t) => (
                    <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"3px 8px", background:"var(--color-brand-subtle)", color:"var(--color-brand-hover)", borderRadius:"var(--radius-pill)", fontSize:"12px", fontWeight:600 }}>
                      {t}
                      <button type="button" onClick={() => set("tags", form.tags.filter((x) => x !== t))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-brand-hover)", display:"flex", padding:0 }}>
                        <X size={10}/>
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag & press Enter"
                    style={{ flex:1, minWidth:"120px", background:"none", border:"none", outline:"none", fontSize:"13px", color:"var(--text-primary)", fontFamily:"inherit" }}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── TAB: MILESTONES ── */}
          {activeTab === "milestones" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {/* Add milestone */}
              <div style={{ display:"flex", gap:"8px" }}>
                <input
                  className="input-redesign"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key==="Enter") { e.preventDefault(); addMilestone(); } }}
                  placeholder="Milestone title, e.g. Wireframes approved"
                  style={{ flex:1 }}
                />
                <Button type="button" onClick={addMilestone} variant="primary" size="sm" leftIcon={<Plus size={13}/>} style={{ flexShrink:0 }}>
                  Add
                </Button>
              </div>

              {form.milestones.length === 0 ? (
                <div style={{ textAlign:"center", padding:"28px", color:"var(--text-subtle)", fontSize:"13px" }}>
                  No milestones yet. Add one above.
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {form.milestones.map((m) => (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", border:"1px solid var(--border-default)" }}>
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
                      <button type="button" onClick={() => removeMilestone(m.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-subtle)", display:"flex", padding:"2px", borderRadius:"4px" }}>
                        <X size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.18s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width:"100%", maxWidth:"400px", padding:"28px", animation:"scaleIn 0.2s ease", textAlign:"center" }}>
        <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--error-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Trash2 size={22} color="var(--error)"/>
        </div>
        <h3 className="font-heading" style={{ fontSize:"18px", marginBottom:"8px" }}>Delete Project?</h3>
        <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"24px" }}>
          This will permanently remove <strong style={{ color:"var(--text-primary)" }}>{project.title}</strong>. This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
          <Button id="proj-delete-cancel" onClick={onClose} variant="secondary" size="sm" disabled={deleting}>Cancel</Button>
          <Button id="proj-delete-confirm" onClick={handleDelete} variant="danger" size="sm" style={{ minWidth:"100px" }} disabled={deleting} leftIcon={deleting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Trash2 size={13}/>}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
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
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:"var(--bg-elevated)", border:"1px solid var(--border-default)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-lg)", zIndex:100, minWidth:"150px", overflow:"hidden", animation:"scaleIn 0.15s ease" }}>
          {(Object.keys(STATUS_CFG) as ProjectStatus[]).map((s) => {
            const c = STATUS_CFG[s];
            return (
              <button
                key={s}
                id={`status-option-${s}-${project._id}`}
                onClick={() => change(s)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"9px 14px", fontSize:"13px", color: s===project.status ? "var(--primary)" : "var(--text-secondary)", background: s===project.status ? "var(--primary-light)" : "transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background 0.15s" }}
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
      style={{ padding:"18px", display:"flex", flexDirection:"column", gap:"12px", transition:"border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease", cursor:"default", borderLeft:`3px solid ${CATEGORY_COLORS[project.category]}` }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderTopColor="var(--border-strong)"; el.style.borderRightColor="var(--border-strong)"; el.style.borderBottomColor="var(--border-strong)"; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderTopColor="var(--border-default)"; el.style.borderRightColor="var(--border-default)"; el.style.borderBottomColor="var(--border-default)"; }}
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
            <div style={{ position:"absolute", right:0, top:"34px", background:"var(--bg-elevated)", border:"1px solid var(--border-default)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-lg)", zIndex:50, minWidth:"150px", overflow:"hidden", animation:"scaleIn 0.15s ease" }}>
              {[
                { id:`view-${project._id}`,   icon:<Eye size={13}/>,   label:"View Details", href:`/dashboard/projects/${project._id}` },
                { id:`edit-${project._id}`,   icon:<Edit3 size={13}/>, label:"Edit",          action: () => { onEdit(project); setMenuOpen(false); } },
                { id:`delete-${project._id}`, icon:<Trash2 size={13}/>,label:"Delete",        action: () => { onDelete(project); setMenuOpen(false); }, danger:true },
              ].map((item) =>
                item.href ? (
                  <Link key={item.id} id={item.id} href={item.href}
                    style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 14px", fontSize:"13px", color:"var(--text-secondary)", textDecoration:"none", transition:"background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                  >{item.icon}{item.label}</Link>
                ) : (
                  <button key={item.id} id={item.id} onClick={item.action}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"9px 14px", fontSize:"13px", color: item.danger ? "var(--error)" : "var(--text-secondary)", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background 0.15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  >{item.icon}{item.label}</button>
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
          <Link href={`/dashboard/projects/${project._id}`} passHref legacyBehavior>
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
          <Link href={`/dashboard/projects/${project._id}`} passHref legacyBehavior>
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
      <header style={{ height:"64px", display:"flex", alignItems:"center", gap:"16px", padding:"0 28px", borderBottom:"1px solid var(--border-default)", background:"var(--bg-surface)", position:"sticky", top:0, zIndex:20 }}>
        <Link href="/dashboard"
          style={{ display:"flex", alignItems:"center", gap:"6px", color:"var(--text-muted)", textDecoration:"none", fontSize:"13px", transition:"color 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={15}/> Dashboard
        </Link>
        <span style={{ color:"var(--border-strong)" }}>•</span>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Briefcase size={13} color="var(--primary)"/>
          </div>
          <h1 className="font-heading" style={{ fontSize:"16px" }}>Projects</h1>
        </div>
        <div style={{ flex:1 }}/>
        <Button
          id="add-project-btn"
          onClick={openAdd}
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14}/>}
        >
          New Project
        </Button>
      </header>

      <main style={{ flex:1, padding:"28px", maxWidth:"1400px", width:"100%", margin:"0 auto" }}>

        {/* Summary Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:"16px", marginBottom:"28px" }}>
          {[
            { label:"Total Projects", value:total,          color:"var(--primary)",  icon:<Briefcase size={16}/> },
            { label:"Active",         value:activeCount,    color:"var(--success)",  icon:<Zap size={16}/> },
            { label:"Completed",      value:completedCount, color:"var(--info)",     icon:<CheckCircle size={16}/> },
            { label:"Total Budget",   value:`$${totalBudget.toLocaleString()}`, color:"var(--primary)", icon:<DollarSign size={16}/> },
            { label:"Total Paid",     value:`$${totalPaid.toLocaleString()}`,   color:"var(--success)", icon:<TrendingUp size={16}/> },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding:"16px 18px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ color:s.color }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:"18px", fontWeight:800, color:"var(--text-primary)", lineHeight:1 }}>{s.value}</p>
                <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:"200px", maxWidth:"340px" }}>
            <Search size={14} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }}/>
            <input id="proj-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..." className="input-redesign" style={{ paddingLeft:"36px" }}/>
          </div>

          {/* Status filter */}
          <div style={{ display:"flex", gap:"4px", background:"var(--bg-elevated)", padding:"4px", borderRadius:"var(--radius-md)", flexWrap:"wrap" }}>
            {["all", ...Object.keys(STATUS_CFG)].map((s) => (
              <button key={s} id={`status-filter-${s}`} onClick={() => setStatusF(s)}
                style={{ padding:"6px 10px", borderRadius:"var(--radius-sm)", border:"none", background: statusF===s ? "var(--bg-card)" : "transparent", color: statusF===s ? "var(--text-primary)" : "var(--text-muted)", fontSize:"12px", fontWeight: statusF===s ? 700 : 500, cursor:"pointer", fontFamily:"inherit", boxShadow: statusF===s ? "var(--shadow-sm)" : "none", transition:"all 0.2s", textTransform:"capitalize" }}>
                {s === "all" ? "All" : STATUS_CFG[s as ProjectStatus].label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select id="priority-filter" value={priorityF} onChange={(e) => setPriorityF(e.target.value)}
            className="input-redesign" style={{ width:"auto", height:"40px", cursor:"pointer", fontSize:"13px" }}>
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_CFG).map(([v,c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>

          <div style={{ flex:1 }}/>

          {/* View toggle */}
          <div style={{ display:"flex", gap:"2px", background:"var(--bg-elevated)", padding:"4px", borderRadius:"var(--radius-md)" }}>
            {(["grid","list"] as const).map((m) => (
              <button key={m} id={`view-${m}`} onClick={() => setViewMode(m)}
                style={{ padding:"6px 10px", borderRadius:"var(--radius-sm)", border:"none", background: viewMode===m ? "var(--bg-card)" : "transparent", color: viewMode===m ? "var(--primary)" : "var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                {m === "grid" ? <LayoutGrid size={14}/> : <List size={14}/>}
              </button>
            ))}
          </div>

          <Button id="proj-filter-btn" variant="secondary" size="sm" leftIcon={<Filter size={13}/>}>
            Filter
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"320px", gap:"12px", color:"var(--text-muted)" }}>
            <Loader2 size={28} style={{ animation:"spin 1s linear infinite" }} color="var(--primary)"/>
            <p style={{ fontSize:"14px" }}>Loading projects...</p>
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
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Project","Status","Priority","Progress","Budget","Due Date",""].map((col) => (
                      <th key={col} style={{ padding:"12px 16px", textAlign:"left", fontSize:"11px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid var(--border-default)", whiteSpace:"nowrap", background:"var(--bg-elevated)" }}>
                        {col}
                      </th>
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
