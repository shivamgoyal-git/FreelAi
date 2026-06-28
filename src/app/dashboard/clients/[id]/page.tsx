"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Star,
  Tag,
  StickyNote,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  Users,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  Archive,
  X,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { Client, ClientStatus, ClientFormData } from "@/types/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "active";
    case "prospect":
    case "inactive":
      return "pending";
    case "archived":
    default:
      return "inactive";
  }
};

// ── HELPERS ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    badge: "badge-success",
    icon: <CheckCircle size={11} />,
  },
  inactive: {
    label: "Inactive",
    badge: "badge-warning",
    icon: <Clock size={11} />,
  },
  prospect: {
    label: "Prospect",
    badge: "badge-info",
    icon: <TrendingUp size={11} />,
  },
  archived: {
    label: "Archived",
    badge: "badge-error",
    icon: <Archive size={11} />,
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#e8a838,#d4922a)",
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#06b6d4,#6366f1)",
  "linear-gradient(135deg,#10b981,#06b6d4)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#34d399,#10b981)",
];

function avatarGradient(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

const EMPTY_FORM: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  location: "",
  avatar: null,
  status: "active",
  tags: [],
  notes: "",
  totalProjects: 0,
  totalEarned: 0,
  rating: null,
};

// ── EDIT MODAL ────────────────────────────────────────────────
function EditModal({
  open,
  client,
  onClose,
  onSaved,
}: {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSaved: (c: Client) => void;
}) {
  const [form, setForm] = useState<ClientFormData & { _id?: string }>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && client) {
      setForm({ ...client });
      setTagInput("");
      setError("");
    }
  }, [open, client]);

  const set = (k: keyof ClientFormData, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) =>
    set("tags", form.tags.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${client._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      onSaved(data.client as Client);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.18s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          animation: "scaleIn 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 className="font-heading" style={{ fontSize: "18px" }}>Edit Client</h2>
          <button
            onClick={onClose}
            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border-default)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--error)", fontSize: "13px" }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-name">Name *</label>
              <input id="edit-name" className="input-redesign" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-email">Email *</label>
              <input id="edit-email" className="input-redesign" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-phone">Phone</label>
              <input id="edit-phone" className="input-redesign" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-company">Company</label>
              <input id="edit-company" className="input-redesign" value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-website">Website</label>
              <input id="edit-website" className="input-redesign" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-location">Location</label>
              <input id="edit-location" className="input-redesign" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-status">Status</label>
              <select id="edit-status" className="input-redesign" value={form.status} onChange={(e) => set("status", e.target.value as ClientStatus)} style={{ cursor: "pointer" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-projects">Projects</label>
              <input id="edit-projects" className="input-redesign" type="number" min={0} value={form.totalProjects} onChange={(e) => set("totalProjects", Number(e.target.value))} />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-earned">Total Earned ($)</label>
              <input id="edit-earned" className="input-redesign" type="number" min={0} value={form.totalEarned} onChange={(e) => set("totalEarned", Number(e.target.value))} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="edit-rating">Rating (1–5)</label>
              <input id="edit-rating" className="input-redesign" type="number" min={1} max={5} value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value ? Number(e.target.value) : null)} placeholder="—" />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group-redesign">
            <label className="label-redesign">Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", minHeight: "44px", alignItems: "center" }}>
              {form.tags.map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", background: "var(--color-brand-subtle)", color: "var(--color-brand-hover)", borderRadius: "var(--radius-pill)", fontSize: "12px", fontWeight: 600 }}>
                  {t}
                  <button type="button" onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-brand-hover)", display: "flex", padding: 0 }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag & press Enter"
                style={{ flex: 1, minWidth: "120px", background: "none", border: "none", outline: "none", fontSize: "13px", color: "var(--text-primary)", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div className="form-group-redesign">
            <label className="label-redesign" htmlFor="edit-notes">Notes</label>
            <textarea id="edit-notes" className="textarea-redesign" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "4px" }}>
            <Button type="button" onClick={onClose} variant="secondary" size="sm" disabled={saving}>Cancel</Button>
            <Button type="submit" id="edit-save-btn" variant="primary" size="sm" style={{ minWidth: "110px" }} disabled={saving} leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DELETE MODAL ──────────────────────────────────────────────
function DeleteModal({
  client,
  onClose,
  onDeleted,
}: {
  client: Client | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!client) return;
    setDeleting(true);
    try {
      await fetch(`/api/clients/${client._id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  if (!client) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.18s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "28px", animation: "scaleIn 0.2s ease", textAlign: "center" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--error-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={22} color="var(--error)" />
        </div>
        <h3 className="font-heading" style={{ fontSize: "18px", marginBottom: "8px" }}>Delete Client?</h3>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
          This will permanently remove <strong style={{ color: "var(--text-primary)" }}>{client.name}</strong>. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button id="detail-delete-cancel" onClick={onClose} variant="secondary" size="sm" disabled={deleting}>Cancel</Button>
          <Button id="detail-delete-confirm" onClick={handleDelete} variant="danger" size="sm" style={{ minWidth: "100px" }} disabled={deleting} leftIcon={deleting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL ROW ────────────────────────────────────────────────
function DetailRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ width: "20px", flexShrink: 0, marginTop: "2px", color: "var(--text-muted)" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            {value}
            <ExternalLink size={11} />
          </a>
        ) : (
          <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{value}</p>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        if (res.ok) setClient(data.client);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} color="var(--primary)" />
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading client...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={28} color="var(--text-muted)" />
        </div>
        <div>
          <p className="font-heading" style={{ fontSize: "20px", marginBottom: "8px" }}>Client not found</p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>This client may have been deleted or you don&apos;t have access.</p>
        </div>
        <Link href="/dashboard/clients" passHref legacyBehavior>
          <Button variant="primary" size="sm" leftIcon={<ChevronLeft size={14} />}>
            Back to Clients
          </Button>
        </Link>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[client.status];
  const joinedDate = new Date(client.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Top Nav */}
      <header style={{ height: "64px", display: "flex", alignItems: "center", gap: "16px", padding: "0 28px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-surface)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link
          href="/dashboard/clients"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={15} /> Clients
        </Link>
        <span style={{ color: "var(--border-strong)" }}>•</span>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</p>
        <div style={{ flex: 1 }} />
        <Button
          id="client-detail-edit-btn"
          onClick={() => setEditOpen(true)}
          variant="secondary"
          size="sm"
          leftIcon={<Edit3 size={13} />}
        >
          Edit
        </Button>
        <Button
          id="client-detail-delete-btn"
          onClick={() => setDeleteOpen(true)}
          variant="danger"
          size="sm"
          leftIcon={<Trash2 size={13} />}
        >
          Delete
        </Button>
      </header>

      <main style={{ flex: 1, padding: "28px", maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>
          {/* ── LEFT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Profile Card */}
            <div
              className="glass-card"
              style={{ padding: "28px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
            >
              {/* Avatar */}
              <div
                className="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "26px",
                  background: avatarGradient(client.name),
                  boxShadow: "0 0 0 4px var(--bg-card), 0 0 0 8px var(--primary-light)",
                }}
              >
                {getInitials(client.name)}
              </div>

              <div>
                <h1 className="font-heading" style={{ fontSize: "22px", marginBottom: "4px" }}>{client.name}</h1>
                {client.company && (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>{client.company}</p>
                )}
                <Badge variant={getBadgeVariant(client.status)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>
                </Badge>
              </div>

              {/* Rating */}
              {client.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= client.rating! ? "#f59e0b" : "transparent"}
                      color={s <= client.rating! ? "#f59e0b" : "var(--border-strong)"}
                    />
                  ))}
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "4px" }}>{client.rating}/5</span>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
                <a href={`mailto:${client.email}`} id="client-email-action" style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="sm" leftIcon={<Mail size={12} />} style={{ width: "100%" }}>
                    Email
                  </Button>
                </a>
                {client.phone ? (
                  <a href={`tel:${client.phone}`} id="client-phone-action" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" leftIcon={<Phone size={12} />} style={{ width: "100%" }}>
                      Call
                    </Button>
                  </a>
                ) : (
                  <Button variant="secondary" size="sm" leftIcon={<Phone size={12} />} style={{ width: "100%", opacity: 0.4 }} disabled>
                    Call
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <h3 className="font-heading" style={{ fontSize: "14px", marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stats</h3>
              {[
                { icon: <Briefcase size={15} color="var(--primary)" />, label: "Total Projects", value: String(client.totalProjects), color: "var(--primary)" },
                { icon: <DollarSign size={15} color="var(--success)" />, label: "Total Earned", value: `$${client.totalEarned.toLocaleString()}`, color: "var(--success)" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {s.icon}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "10px" }}>
                <Calendar size={15} color="var(--text-muted)" />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Client since {joinedDate}</span>
              </div>
            </div>

            {/* Tags Card */}
            {client.tags.length > 0 && (
              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Tag size={14} color="var(--text-muted)" />
                  <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tags</h3>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {client.tags.map((t) => (
                    <span
                      key={t}
                      style={{ padding: "4px 10px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Contact Info */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-heading" style={{ fontSize: "17px", marginBottom: "4px" }}>Contact Information</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Details and reachable channels</p>

              <DetailRow icon={<Mail size={15} />} label="Email" value={client.email} href={`mailto:${client.email}`} />
              <DetailRow icon={<Phone size={15} />} label="Phone" value={client.phone || null} />
              <DetailRow icon={<Building2 size={15} />} label="Company" value={client.company || null} />
              <DetailRow icon={<Globe size={15} />} label="Website" value={client.website || null} href={client.website || undefined} />
              <DetailRow icon={<MapPin size={15} />} label="Location" value={client.location || null} />
            </div>

            {/* Notes */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <StickyNote size={16} color="var(--text-muted)" />
                <h2 className="font-heading" style={{ fontSize: "17px" }}>Notes</h2>
              </div>
              {client.notes ? (
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                  {client.notes}
                </p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", color: "var(--text-subtle)" }}>
                  <StickyNote size={15} />
                  <p style={{ fontSize: "13px" }}>No notes yet. Click Edit to add notes about this client.</p>
                </div>
              )}
            </div>

            {/* Activity placeholder */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h2 className="font-heading" style={{ fontSize: "17px", marginBottom: "4px" }}>Project History</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {client.totalProjects > 0
                  ? `${client.totalProjects} project${client.totalProjects !== 1 ? "s" : ""} completed with this client`
                  : "No projects recorded yet"}
              </p>

              {client.totalProjects > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Projects completed</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{client.totalProjects}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min((client.totalProjects / 10) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", color: "var(--text-subtle)" }}>
                  <Briefcase size={15} />
                  <p style={{ fontSize: "13px" }}>No projects yet. Start a project with this client.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EditModal open={editOpen} client={client} onClose={() => setEditOpen(false)} onSaved={(updated) => { setClient(updated); setEditOpen(false); }} />
      <DeleteModal client={deleteOpen ? client : null} onClose={() => setDeleteOpen(false)} onDeleted={() => router.push("/dashboard/clients")} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
