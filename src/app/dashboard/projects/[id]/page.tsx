"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Briefcase,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  Pause,
  XCircle,
  FileText,
  Zap,
  AlertTriangle,
  DollarSign,
  Calendar,
  Tag,
  StickyNote,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Flame,
  X,
  Plus,
  Circle,
  TrendingUp,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import type {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectCategory,
  ProjectFormData,
  ProjectMilestone,
} from "@/types/project";

// ─── CONFIG (mirrors list page) ───────────────────────────────
const STATUS_CFG: Record<ProjectStatus, { label: string; badge: string; icon: React.ReactNode; color: string }> = {
  draft:     { label:"Draft",     badge:"badge-info",    icon:<FileText size={12}/>,   color:"var(--info)" },
  active:    { label:"Active",    badge:"badge-success", icon:<Zap size={12}/>,         color:"var(--success)" },
  in_review: { label:"In Review", badge:"badge-warning", icon:<Clock size={12}/>,       color:"var(--warning)" },
  completed: { label:"Completed", badge:"badge-success", icon:<CheckCircle size={12}/>, color:"var(--success)" },
  on_hold:   { label:"On Hold",   badge:"badge-warning", icon:<Pause size={12}/>,       color:"var(--warning)" },
  cancelled: { label:"Cancelled", badge:"badge-error",   icon:<XCircle size={12}/>,     color:"var(--error)" },
};

const PRIORITY_CFG: Record<ProjectPriority, { label: string; icon: React.ReactNode; color: string }> = {
  low:    { label:"Low",    icon:<ArrowDown size={13}/>,  color:"var(--success)" },
  medium: { label:"Medium", icon:<ArrowRight size={13}/>, color:"var(--warning)" },
  high:   { label:"High",   icon:<ArrowUp size={13}/>,    color:"#f97316" },
  urgent: { label:"Urgent", icon:<Flame size={13}/>,      color:"var(--error)" },
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  design:"Design", development:"Development", illustration:"Illustration",
  video:"Video", writing:"Writing", marketing:"Marketing",
  consulting:"Consulting", other:"Other",
};

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  design:"#6366f1", development:"#06b6d4", illustration:"#8b5cf6",
  video:"#ec4899", writing:"#f59e0b", marketing:"#10b981",
  consulting:"#e8a838", other:"var(--text-muted)",
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
}

function isOverdue(d?: string, status?: ProjectStatus) {
  if (!d || status === "completed" || status === "cancelled") return false;
  return new Date(d) < new Date();
}

const EMPTY_FORM: ProjectFormData = {
  title:"", description:"", clientId:undefined, clientName:"",
  category:"design", status:"draft", priority:"medium",
  budget:0, currency:"USD", paid:0, progress:0,
  startDate:"", dueDate:"", tags:[], milestones:[], notes:"",
};

// ─── EDIT MODAL ───────────────────────────────────────────────
function EditModal({ open, project, onClose, onSaved }: { open:boolean; project:Project|null; onClose:()=>void; onSaved:(p:Project)=>void }) {
  const [form, setForm] = useState<ProjectFormData & { _id?: string }>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [tab, setTab] = useState<"basics"|"milestones"|"notes">("basics");

  useEffect(() => {
    if (open && project) { setForm({ ...project }); setTagInput(""); setMilestoneInput(""); setError(""); setTab("basics"); }
  }, [open, project]);

  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addMilestone = () => {
    const t = milestoneInput.trim(); if (!t) return;
    set("milestones", [...form.milestones, { id:uid(), title:t, completed:false }]);
    setMilestoneInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!project) return;
    setSaving(true); setError("");
    try {
      const res  = await fetch(`/api/projects/${project._id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      onSaved(data.project as Project);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  };

  if (!open) return null;

  const tabBtn = (id: typeof tab, label: string) => (
    <button type="button" onClick={() => setTab(id)}
      style={{ padding:"7px 14px", borderRadius:"var(--radius-sm)", border:"none", background: tab===id ? "var(--bg-card)" : "transparent", color: tab===id ? "var(--primary)" : "var(--text-muted)", fontSize:"13px", fontWeight: tab===id ? 700 : 500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.18s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width:"100%", maxWidth:"600px", maxHeight:"90vh", overflowY:"auto", padding:"28px", animation:"scaleIn 0.2s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <h2 className="font-heading" style={{ fontSize:"18px" }}>Edit Project</h2>
          <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid var(--border-default)", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-muted)" }}><X size={15}/></button>
        </div>
        <div style={{ display:"flex", gap:"4px", background:"var(--bg-elevated)", padding:"4px", borderRadius:"var(--radius-md)", marginBottom:"20px" }}>
          {tabBtn("basics","Details")}
          {tabBtn("milestones",`Milestones (${form.milestones.length})`)}
          {tabBtn("notes","Notes")}
        </div>
        {error && (
          <div style={{ background:"var(--error-bg)", border:"1px solid var(--error)", borderRadius:"var(--radius-md)", padding:"10px 14px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px", color:"var(--error)", fontSize:"13px" }}>
            <AlertTriangle size={14}/> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          {tab === "basics" && (
            <>
              <div className="input-group"><label className="input-label" htmlFor="d-title">Title *</label><input id="d-title" className="input-field" value={form.title} onChange={(e) => set("title",e.target.value)} required/></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div className="input-group"><label className="input-label" htmlFor="d-client">Client Name</label><input id="d-client" className="input-field" value={form.clientName??""} onChange={(e) => set("clientName",e.target.value)}/></div>
                <div className="input-group"><label className="input-label" htmlFor="d-cat">Category</label>
                  <select id="d-cat" className="input-field" value={form.category} onChange={(e) => set("category",e.target.value as ProjectCategory)} style={{ cursor:"pointer" }}>
                    {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div className="input-group"><label className="input-label" htmlFor="d-status">Status</label>
                  <select id="d-status" className="input-field" value={form.status} onChange={(e) => set("status",e.target.value as ProjectStatus)} style={{ cursor:"pointer" }}>
                    {Object.entries(STATUS_CFG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div className="input-group"><label className="input-label" htmlFor="d-priority">Priority</label>
                  <select id="d-priority" className="input-field" value={form.priority} onChange={(e) => set("priority",e.target.value as ProjectPriority)} style={{ cursor:"pointer" }}>
                    {Object.entries(PRIORITY_CFG).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                <div className="input-group"><label className="input-label" htmlFor="d-budget">Budget ($)</label><input id="d-budget" className="input-field" type="number" min={0} value={form.budget} onChange={(e) => set("budget",Number(e.target.value))}/></div>
                <div className="input-group"><label className="input-label" htmlFor="d-paid">Paid ($)</label><input id="d-paid" className="input-field" type="number" min={0} value={form.paid} onChange={(e) => set("paid",Number(e.target.value))}/></div>
                <div className="input-group"><label className="input-label" htmlFor="d-progress">Progress (%)</label><input id="d-progress" className="input-field" type="number" min={0} max={100} value={form.progress} onChange={(e) => set("progress",Number(e.target.value))}/></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div className="input-group"><label className="input-label" htmlFor="d-start">Start Date</label><input id="d-start" className="input-field" type="date" value={form.startDate??""} onChange={(e) => set("startDate",e.target.value)}/></div>
                <div className="input-group"><label className="input-label" htmlFor="d-due">Due Date</label><input id="d-due" className="input-field" type="date" value={form.dueDate??""} onChange={(e) => set("dueDate",e.target.value)}/></div>
              </div>
              <div className="input-group"><label className="input-label" htmlFor="d-desc">Description</label><textarea id="d-desc" className="input-field" value={form.description} onChange={(e) => set("description",e.target.value)} rows={3} style={{ resize:"vertical" }}/></div>
              <div className="input-group">
                <label className="input-label">Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", padding:"8px", background:"var(--bg-elevated)", border:"1.5px solid var(--border-default)", borderRadius:"var(--radius-md)", minHeight:"44px", alignItems:"center" }}>
                  {form.tags.map((t) => (
                    <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"3px 8px", background:"var(--primary-light)", color:"var(--primary)", borderRadius:"var(--radius-full)", fontSize:"12px", fontWeight:600 }}>
                      {t}<button type="button" onClick={() => set("tags",form.tags.filter((x) => x!==t))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--primary)", display:"flex", padding:0 }}><X size={10}/></button>
                    </span>
                  ))}
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); const t=tagInput.trim(); if(t&&!form.tags.includes(t)){set("tags",[...form.tags,t]);} setTagInput(""); } }}
                    placeholder="Add tag & Enter" style={{ flex:1, minWidth:"120px", background:"none", border:"none", outline:"none", fontSize:"13px", color:"var(--text-primary)", fontFamily:"inherit" }}/>
                </div>
              </div>
            </>
          )}
          {tab === "milestones" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ display:"flex", gap:"8px" }}>
                <input className="input-field" value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyDown={(e) => { if(e.key==="Enter"){e.preventDefault();addMilestone();} }}
                  placeholder="Milestone title..." style={{ flex:1 }}/>
                <button type="button" onClick={addMilestone} className="btn btn-primary btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"5px", flexShrink:0 }}><Plus size={13}/> Add</button>
              </div>
              {form.milestones.length === 0 ? (
                <p style={{ textAlign:"center", padding:"28px", color:"var(--text-subtle)", fontSize:"13px" }}>No milestones yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {form.milestones.map((m) => (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", border:"1px solid var(--border-default)" }}>
                      <button type="button" onClick={() => set("milestones",form.milestones.map((x) => x.id===m.id?{...x,completed:!x.completed}:x))}
                        style={{ width:"18px", height:"18px", borderRadius:"50%", border:`2px solid ${m.completed?"var(--success)":"var(--border-strong)"}`, background:m.completed?"var(--success)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
                        {m.completed && <CheckCircle size={10} color="white" fill="white"/>}
                      </button>
                      <span style={{ flex:1, fontSize:"13px", color:m.completed?"var(--text-muted)":"var(--text-primary)", textDecoration:m.completed?"line-through":"none" }}>{m.title}</span>
                      <button type="button" onClick={() => set("milestones",form.milestones.filter((x) => x.id!==m.id))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-subtle)", display:"flex", padding:"2px", borderRadius:"4px" }}><X size={13}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "notes" && (
            <div className="input-group">
              <label className="input-label" htmlFor="d-notes">Notes</label>
              <textarea id="d-notes" className="input-field" value={form.notes} onChange={(e) => set("notes",e.target.value)} rows={8} style={{ resize:"vertical" }}/>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", paddingTop:"8px", borderTop:"1px solid var(--border-subtle)", marginTop:"4px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius:"var(--radius-md)" }} disabled={saving}>Cancel</button>
            <button type="submit" id="detail-edit-save" className="btn btn-primary btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px", minWidth:"120px" }} disabled={saving}>
              {saving ? <><Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────
function DeleteModal({ project, onClose, onDeleted }: { project:Project|null; onClose:()=>void; onDeleted:()=>void }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!project) return; setDeleting(true);
    try { await fetch(`/api/projects/${project._id}`,{method:"DELETE"}); onDeleted(); }
    finally { setDeleting(false); }
  };
  if (!project) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.18s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width:"100%", maxWidth:"400px", padding:"28px", animation:"scaleIn 0.2s ease", textAlign:"center" }}>
        <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--error-bg)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Trash2 size={22} color="var(--error)"/>
        </div>
        <h3 className="font-heading" style={{ fontSize:"18px", marginBottom:"8px" }}>Delete Project?</h3>
        <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"24px" }}>
          Permanently remove <strong style={{ color:"var(--text-primary)" }}>{project.title}</strong>. This cannot be undone.
        </p>
        <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
          <button id="detail-del-cancel" onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius:"var(--radius-md)" }} disabled={deleting}>Cancel</button>
          <button id="detail-del-confirm" onClick={handleDelete} className="btn btn-sm" style={{ borderRadius:"var(--radius-md)", background:"var(--error)", color:"white", gap:"6px", minWidth:"100px" }} disabled={deleting}>
            {deleting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Trash2 size={13}/>}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── INLINE STATUS CHANGER ────────────────────────────────────
function InlineStatus({ project, onUpdated }: { project: Project; onUpdated:(p:Project)=>void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const change = async (status: ProjectStatus) => {
    setOpen(false);
    const res = await fetch(`/api/projects/${project._id}`,{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
    if (res.ok) { const d = await res.json(); onUpdated(d.project); }
  };

  const cfg = STATUS_CFG[project.status];
  return (
    <div style={{ position:"relative" }} ref={ref}>
      <button id="status-change-btn" onClick={() => setOpen((v)=>!v)}
        className={`badge ${cfg.badge}`}
        style={{ cursor:"pointer", gap:"6px", border:"none", display:"flex", alignItems:"center", fontSize:"13px", padding:"6px 12px" }}>
        {cfg.icon}{cfg.label}<ChevronDown size={11}/>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:"var(--bg-elevated)", border:"1px solid var(--border-default)", borderRadius:"var(--radius-md)", boxShadow:"var(--shadow-lg)", zIndex:100, minWidth:"160px", overflow:"hidden", animation:"scaleIn 0.15s ease" }}>
          {(Object.keys(STATUS_CFG) as ProjectStatus[]).map((s) => {
            const c = STATUS_CFG[s];
            return (
              <button key={s} id={`status-opt-${s}`} onClick={() => change(s)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", fontSize:"13px", color: s===project.status?"var(--primary)":"var(--text-secondary)", background: s===project.status?"var(--primary-light)":"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background 0.15s" }}>
                <span style={{ color:c.color }}>{c.icon}</span>{c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DETAIL PAGE ─────────────────────────────────────────
export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project,  setProject]  = useState<Project | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen,  setDelOpen]  = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        if (res.ok) setProject(data.project);
      } finally { setLoading(false); }
    };
    fetch_();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
        <Loader2 size={32} style={{ animation:"spin 1s linear infinite" }} color="var(--primary)"/>
        <p style={{ fontSize:"14px", color:"var(--text-muted)" }}>Loading project...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px", textAlign:"center" }}>
        <div style={{ width:"72px", height:"72px", borderRadius:"20px", background:"var(--bg-elevated)", display:"flex", alignItems:"center", justifyContent:"center" }}><Briefcase size={28} color="var(--text-muted)"/></div>
        <div>
          <p className="font-heading" style={{ fontSize:"20px", marginBottom:"8px" }}>Project not found</p>
          <p style={{ fontSize:"14px", color:"var(--text-muted)" }}>It may have been deleted or you don&apos;t have access.</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-primary btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px" }}><ChevronLeft size={14}/> Back to Projects</Link>
        <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  const sCfg = STATUS_CFG[project.status];
  const pCfg = PRIORITY_CFG[project.priority];
  const overdue = isOverdue(project.dueDate, project.status);
  const completedMs = project.milestones.filter((m) => m.completed).length;
  const msPercent   = project.milestones.length > 0 ? Math.round((completedMs / project.milestones.length) * 100) : 0;
  const remaining   = project.budget - project.paid;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)", display:"flex", flexDirection:"column" }}>
      {/* Nav */}
      <header style={{ height:"64px", display:"flex", alignItems:"center", gap:"16px", padding:"0 28px", borderBottom:"1px solid var(--border-default)", background:"var(--bg-surface)", position:"sticky", top:0, zIndex:20 }}>
        <Link href="/dashboard/projects"
          style={{ display:"flex", alignItems:"center", gap:"6px", color:"var(--text-muted)", textDecoration:"none", fontSize:"13px", transition:"color 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color="var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color="var(--text-muted)")}
        ><ChevronLeft size={15}/> Projects</Link>
        <span style={{ color:"var(--border-strong)" }}>•</span>
        <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{project.title}</p>
        <button id="detail-edit-btn" onClick={() => setEditOpen(true)} className="btn btn-secondary btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px" }}><Edit3 size={13}/> Edit</button>
        <button id="detail-delete-btn" onClick={() => setDelOpen(true)} className="btn btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px", background:"var(--error-bg)", color:"var(--error)", border:"1px solid var(--error)", cursor:"pointer" }}><Trash2 size={13}/> Delete</button>
      </header>

      <main style={{ flex:1, padding:"28px", maxWidth:"1100px", width:"100%", margin:"0 auto" }}>
        {/* Hero strip */}
        <div className="glass-card" style={{ padding:"24px 28px", marginBottom:"24px", borderLeft:`4px solid ${CATEGORY_COLORS[project.category]}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"20px", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px", flexWrap:"wrap" }}>
              <span style={{ fontSize:"11px", fontWeight:700, color:CATEGORY_COLORS[project.category], textTransform:"uppercase", letterSpacing:"0.08em" }}>{CATEGORY_LABELS[project.category]}</span>
              <span style={{ color:"var(--border-default)" }}>·</span>
              <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"12px", color:pCfg.color, fontWeight:600 }}>{pCfg.icon}{pCfg.label} Priority</span>
            </div>
            <h1 className="font-heading" style={{ fontSize:"26px", marginBottom:"6px", lineHeight:1.2 }}>{project.title}</h1>
            {project.clientName && <p style={{ fontSize:"14px", color:"var(--text-muted)", marginBottom:"12px" }}>Client: {project.clientName}</p>}
            {project.description && <p style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:1.7, maxWidth:"600px" }}>{project.description}</p>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"10px" }}>
            <InlineStatus project={project} onUpdated={setProject}/>
            {overdue && (
              <span style={{ display:"flex", alignItems:"center", gap:"5px", padding:"4px 10px", background:"var(--error-bg)", color:"var(--error)", borderRadius:"var(--radius-full)", fontSize:"12px", fontWeight:600 }}>
                <AlertTriangle size={12}/> Overdue
              </span>
            )}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", alignItems:"start" }}>
          {/* ── LEFT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            {/* Progress & Budget */}
            <div className="glass-card" style={{ padding:"24px" }}>
              <h2 className="font-heading" style={{ fontSize:"16px", marginBottom:"20px" }}>Progress & Financials</h2>

              {/* Overall progress */}
              <div style={{ marginBottom:"20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>Overall Progress</span>
                  <span style={{ fontSize:"16px", fontWeight:800, color:"var(--text-primary)" }}>{project.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height:"8px" }}>
                  <div className="progress-fill" style={{ width:`${project.progress}%`, background: project.progress>=100?"var(--success)":project.progress>50?"var(--primary)":"#6366f1", transition:"width 0.8s ease" }}/>
                </div>
              </div>

              {/* Financial grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
                {[
                  { label:"Budget",    value:`$${project.budget.toLocaleString()}`,   color:"var(--primary)" },
                  { label:"Paid",      value:`$${project.paid.toLocaleString()}`,     color:"var(--success)" },
                  { label:"Remaining", value:`$${Math.max(0,remaining).toLocaleString()}`, color: remaining>0?"var(--warning)":"var(--success)" },
                ].map((f) => (
                  <div key={f.label} style={{ padding:"14px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", textAlign:"center" }}>
                    <p style={{ fontSize:"18px", fontWeight:800, color:f.color, marginBottom:"4px" }}>{f.value}</p>
                    <p style={{ fontSize:"11px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.label}</p>
                  </div>
                ))}
              </div>

              {/* Payment progress */}
              {project.budget > 0 && (
                <div style={{ marginTop:"16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                    <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>Payment received</span>
                    <span style={{ fontSize:"12px", fontWeight:700, color:"var(--text-primary)" }}>
                      {Math.round((project.paid / project.budget) * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${Math.min((project.paid/project.budget)*100,100)}%`, background:"var(--success)" }}/>
                  </div>
                </div>
              )}
            </div>

            {/* Milestones */}
            <div className="glass-card" style={{ padding:"24px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                <h2 className="font-heading" style={{ fontSize:"16px" }}>Milestones</h2>
                {project.milestones.length > 0 && (
                  <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>{completedMs}/{project.milestones.length} done · {msPercent}%</span>
                )}
              </div>

              {project.milestones.length === 0 ? (
                <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"16px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", color:"var(--text-subtle)" }}>
                  <CheckCircle size={15}/>
                  <p style={{ fontSize:"13px" }}>No milestones. Add them via Edit.</p>
                </div>
              ) : (
                <>
                  {project.milestones.length > 0 && (
                    <div style={{ marginBottom:"14px" }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width:`${msPercent}%`, background:"var(--success)" }}/>
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                    {project.milestones.map((m, i) => (
                      <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", background:"var(--bg-elevated)", borderRadius:"var(--radius-md)", border:"1px solid var(--border-default)", transition:"border-color 0.2s" }}>
                        <div style={{ width:"20px", height:"20px", borderRadius:"50%", border:`2px solid ${m.completed?"var(--success)":"var(--border-strong)"}`, background:m.completed?"var(--success)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {m.completed && <CheckCircle size={11} color="white" fill="white"/>}
                        </div>
                        <span style={{ flex:1, fontSize:"13px", color:m.completed?"var(--text-muted)":"var(--text-primary)", textDecoration:m.completed?"line-through":"none" }}>
                          {m.title}
                        </span>
                        <span style={{ fontSize:"11px", color:"var(--text-subtle)" }}>#{i+1}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="glass-card" style={{ padding:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
                  <StickyNote size={16} color="var(--text-muted)"/>
                  <h2 className="font-heading" style={{ fontSize:"16px" }}>Notes</h2>
                </div>
                <p style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:"1.75", whiteSpace:"pre-wrap" }}>{project.notes}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            {/* Project Info */}
            <div className="glass-card" style={{ padding:"20px" }}>
              <h3 className="font-heading" style={{ fontSize:"13px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"16px" }}>Project Details</h3>
              {[
                { icon:<Calendar size={14}/>,    label:"Start Date", value: fmtDate(project.startDate) },
                { icon:<Calendar size={14}/>,    label:"Due Date",   value: project.dueDate ? fmtDate(project.dueDate) : "—", warn: overdue },
                { icon:<Briefcase size={14}/>,   label:"Category",   value: CATEGORY_LABELS[project.category] },
                { icon:<DollarSign size={14}/>,  label:"Currency",   value: project.currency },
              ].map((row) => (
                <div key={row.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border-subtle)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ color:"var(--text-muted)" }}>{row.icon}</span>
                    <span style={{ fontSize:"13px", color:"var(--text-muted)" }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize:"13px", fontWeight:600, color: row.warn ? "var(--error)" : "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="glass-card" style={{ padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                  <Tag size={14} color="var(--text-muted)"/>
                  <h3 className="font-heading" style={{ fontSize:"13px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Tags</h3>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {project.tags.map((t) => (
                    <span key={t} style={{ padding:"4px 10px", background:"var(--primary-light)", color:"var(--primary)", borderRadius:"var(--radius-full)", fontSize:"12px", fontWeight:600 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass-card" style={{ padding:"20px" }}>
              <h3 className="font-heading" style={{ fontSize:"13px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"12px" }}>Quick Actions</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                <button id="quick-edit-btn" onClick={() => setEditOpen(true)} className="btn btn-secondary btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px", justifyContent:"flex-start" }}><Edit3 size={13}/> Edit Project</button>
                {project.status !== "completed" && (
                  <button id="quick-complete-btn" onClick={async () => {
                    const res = await fetch(`/api/projects/${project._id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed",progress:100})});
                    if (res.ok){const d=await res.json();setProject(d.project);}
                  }} className="btn btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px", justifyContent:"flex-start", background:"var(--success-bg)", color:"var(--success)", border:"1px solid var(--success)", cursor:"pointer" }}>
                    <CheckCircle size={13}/> Mark Complete
                  </button>
                )}
                <button id="quick-delete-btn" onClick={() => setDelOpen(true)} className="btn btn-sm" style={{ borderRadius:"var(--radius-md)", gap:"6px", justifyContent:"flex-start", background:"var(--error-bg)", color:"var(--error)", border:"1px solid var(--error)", cursor:"pointer" }}>
                  <Trash2 size={13}/> Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EditModal open={editOpen} project={project} onClose={() => setEditOpen(false)} onSaved={(p) => { setProject(p); setEditOpen(false); }}/>
      <DeleteModal project={delOpen ? project : null} onClose={() => setDelOpen(false)} onDeleted={() => router.push("/dashboard/projects")}/>

      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
