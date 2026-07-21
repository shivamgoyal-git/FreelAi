"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  X,
  Star,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Tag,
  CheckCircle,
  Clock,
  UserX,
  Archive,
  AlertTriangle,
  Loader2,
  DollarSign,
  Briefcase,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Check,
  ArrowUpRight,
} from "lucide-react";
import type { Client, ClientStatus, ClientFormData } from "@/types/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

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
  "linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(139,92,246,0.3) 100%)",
  "linear-gradient(135deg,rgba(2,184,204,0.2) 0%,rgba(99,102,241,0.3) 100%)",
  "linear-gradient(135deg,rgba(39,166,68,0.2) 0%,rgba(2,184,204,0.3) 100%)",
  "linear-gradient(135deg,rgba(139,92,246,0.2) 0%,rgba(236,72,153,0.3) 100%)",
  "linear-gradient(135deg,rgba(245,158,11,0.2) 0%,rgba(235,87,87,0.3) 100%)",
];

function avatarGradient(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

// ── EMPTY FORM ────────────────────────────────────────────────
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

// ── CLIENT FORM MODAL ─────────────────────────────────────────
function ClientFormModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: (ClientFormData & { _id?: string }) | null;
  onSaved: (client: Client) => void;
}) {
  const [form, setForm] = useState<ClientFormData & { _id?: string }>(
    initial ?? EMPTY_FORM
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial?._id;

  useBodyScrollLock(open);

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_FORM);
      setTagInput("");
      setError("");
    }
  }, [open, initial?._id]);

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
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/clients/${form._id}` : "/api/clients";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onSaved(data.client as Client);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save client");
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
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          position: "relative",
          borderRadius: "var(--radius-cards)",
          border: "0.5px solid var(--border)",
          background: "var(--surface-1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-inputs)",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={16} color="var(--text-primary)" />
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: "16px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}
            >
              {isEdit ? "Edit Client" : "Add New Client"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-inputs)",
              border: "0.5px solid var(--border)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(235,87,87,0.1)",
              border: "0.5px solid var(--color-coral-red)",
              borderRadius: "var(--radius-inputs)",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-coral-red)",
              fontSize: "12.5px",
            }}
          >
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-name" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Name *</label>
              <input
                id="client-name"
                className="input-redesign"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jane Doe"
                required
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-email" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Email *</label>
              <input
                id="client-email"
                className="input-redesign"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane@example.com"
                required
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
          </div>

          {/* Phone & Company */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-phone" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Phone</label>
              <input
                id="client-phone"
                className="input-redesign"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 555 000 0000"
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-company" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Company</label>
              <input
                id="client-company"
                className="input-redesign"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Acme Corp"
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
          </div>

          {/* Website & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-website" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Website</label>
              <input
                id="client-website"
                className="input-redesign"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://example.com"
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-location" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Location</label>
              <input
                id="client-location"
                className="input-redesign"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="New York, USA"
                style={{ fontSize: "12.5px", height: "36px" }}
              />
            </div>
          </div>

          {/* Status & Rating */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-status" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Status</label>
              <select
                id="client-status"
                className="input-redesign"
                value={form.status}
                onChange={(e) => set("status", e.target.value as ClientStatus)}
                style={{ cursor: "pointer", fontSize: "12.5px", height: "36px" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Rating</label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "36px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => set("rating", form.rating === star ? null : star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      color: form.rating && form.rating >= star ? "#f59e0b" : "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Star size={14} fill={form.rating && form.rating >= star ? "#f59e0b" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group-redesign">
            <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Tags</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="input-redesign"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag (press Enter)"
                style={{ fontSize: "12.5px", height: "36px" }}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {form.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "2px 8px",
                      background: "var(--surface-2)",
                      border: "0.5px solid var(--border)",
                      borderRadius: "var(--radius-badges)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group-redesign">
            <label className="label-redesign" htmlFor="client-notes" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Notes</label>
            <textarea
              id="client-notes"
              className="input-redesign"
              rows={3}
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal account notes..."
              style={{ resize: "vertical", fontSize: "12.5px" }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "6px",
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              id="client-form-submit"
              variant="primary"
              size="sm"
              style={{ minWidth: "110px" }}
              disabled={saving}
              leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DELETE CONFIRM MODAL ──────────────────────────────────────
function DeleteModal({
  client,
  onClose,
  onDeleted,
}: {
  client: Client | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  useBodyScrollLock(!!client);

  const handleDelete = async () => {
    if (!client) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(client._id);
      }
    } finally {
      setDeleting(false);
      onClose();
    }
  };

  if (!client) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "24px",
          textAlign: "center",
          borderRadius: "var(--radius-cards)",
          border: "0.5px solid var(--border)",
          background: "var(--surface-1)",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-inputs)",
            background: "rgba(235,87,87,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Trash2 size={20} color="var(--color-coral-red)" />
        </div>
        <h3
          className="font-heading"
          style={{ fontSize: "16px", fontWeight: 510, marginBottom: "6px", color: "var(--text-primary)" }}
        >
          Delete Client?
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>
          This will permanently remove{" "}
          <strong style={{ color: "var(--text-primary)", fontWeight: 590 }}>{client.name}</strong>{" "}
          from your account. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button
            id="delete-cancel-btn"
            onClick={onClose}
            variant="ghost"
            size="sm"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            id="delete-confirm-btn"
            onClick={handleDelete}
            variant="danger"
            size="sm"
            style={{ minWidth: "90px" }}
            disabled={deleting}
            leftIcon={deleting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── CLIENT CARD (GRID VIEW) ───────────────────────────────────
function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[client.status];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-cards)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "border-color var(--dur-fast)",
        position: "relative",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Top Row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Avatar */}
        <div
          className="avatar"
          style={{
            width: "40px",
            height: "40px",
            fontSize: "13px",
            fontWeight: 590,
            background: avatarGradient(client.name),
            color: "var(--text-primary)",
            borderRadius: "var(--radius-inputs)",
            flexShrink: 0,
          }}
        >
          {getInitials(client.name)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "2px" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 510,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {client.name}
            </p>
            {client.rating && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "1px 5px", borderRadius: "var(--radius-pills)", fontSize: "10px", fontWeight: 590 }}>
                <Star size={9} fill="#f59e0b" />
                {client.rating}
              </span>
            )}
          </div>
          {client.company && (
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
              {client.company}
            </p>
          )}
        </div>

        {/* Status badge + menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <Badge variant={getBadgeVariant(client.status)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              {cfg.icon}
              <span>{cfg.label}</span>
            </span>
          </Badge>
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              id={`client-menu-${client._id}`}
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "var(--radius-inputs)",
                border: "0.5px solid var(--border)",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <MoreHorizontal size={13} />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "30px",
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--border-strong)",
                  borderRadius: "var(--radius-inputs)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  minWidth: "140px",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    id: `view-${client._id}`,
                    icon: <Eye size={12} />,
                    label: "View Details",
                    href: `/dashboard/clients/${client._id}`,
                  },
                  {
                    id: `edit-${client._id}`,
                    icon: <Edit3 size={12} />,
                    label: "Edit",
                    action: () => { onEdit(client); setMenuOpen(false); },
                  },
                  {
                    id: `delete-${client._id}`,
                    icon: <Trash2 size={12} />,
                    label: "Delete",
                    action: () => { onDelete(client); setMenuOpen(false); },
                    danger: true,
                  },
                ].map((item) =>
                  item.href ? (
                    <Link
                      key={item.id}
                      id={item.id}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-3)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      id={item.id}
                      onClick={item.action}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: item.danger ? "var(--color-coral-red)" : "var(--text-secondary)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <a
          href={`mailto:${client.email}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}
        >
          <Mail size={11} color="var(--text-muted)" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {client.email}
          </span>
        </a>
        {client.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <Phone size={11} color="var(--text-muted)" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <MapPin size={11} color="var(--text-muted)" />
            <span>{client.location}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {client.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {client.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              style={{
                padding: "2px 6px",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-badges)",
                fontSize: "10.5px",
                color: "var(--text-muted)",
              }}
            >
              {t}
            </span>
          ))}
          {client.tags.length > 3 && (
            <span style={{ fontSize: "10.5px", color: "var(--text-muted)", padding: "2px 4px" }}>
              +{client.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metrics mini box */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          background: "var(--surface-2)",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-inputs)",
          padding: "10px",
        }}
      >
        <div>
          <p style={{ fontSize: "14px", fontWeight: 590, color: "var(--text-primary)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {client.totalProjects}
          </p>
          <p style={{ fontSize: "9.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1px 0 0 0" }}>
            Projects
          </p>
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 590, color: "var(--text-primary)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            ${client.totalEarned.toLocaleString()}
          </p>
          <p style={{ fontSize: "9.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1px 0 0 0" }}>
            Earned
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "4px" }}>
        <Link href={`/dashboard/clients/${client._id}`} style={{ flex: 1, display: "flex" }}>
          <Button variant="outline" size="sm" leftIcon={<Eye size={12} />} style={{ width: "100%", justifyContent: "center" }}>
            View
          </Button>
        </Link>
        <Button
          id={`edit-card-${client._id}`}
          onClick={() => onEdit(client)}
          variant="ghost"
          size="sm"
          leftIcon={<Edit3 size={12} />}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function ClientsPage() {
  useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter and Sorting state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [earnedFilter, setEarnedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Popover toggle states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(ClientFormData & { _id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setClients(data.clients ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  const openAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditTarget({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      website: c.website,
      location: c.location,
      avatar: c.avatar,
      status: c.status,
      tags: c.tags,
      notes: c.notes,
      totalProjects: c.totalProjects,
      totalEarned: c.totalEarned,
      rating: c.rating,
    });
    setFormOpen(true);
  };

  const handleSaved = (client: Client) => {
    setClients((prev) => {
      const idx = prev.findIndex((c) => c._id === client._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = client;
        return next;
      }
      return [client, ...prev];
    });
    if (!editTarget?._id) setTotal((t) => t + 1);
    setFormOpen(false);
  };

  const handleDeleted = (id: string) => {
    setClients((prev) => prev.filter((c) => c._id !== id));
    setTotal((t) => t - 1);
  };

  // Compute stats
  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalEarned = clients.reduce((s, c) => s + c.totalEarned, 0);

  // Filter & sort locally
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) => {
        if (ratingFilter !== "all") {
          if (ratingFilter === "unrated") {
            if (c.rating !== null && c.rating !== undefined) return false;
          } else {
            const minStars = parseInt(ratingFilter, 10);
            if (!c.rating || c.rating < minStars) return false;
          }
        }
        if (earnedFilter !== "all") {
          const minEarned = parseInt(earnedFilter, 10);
          if (c.totalEarned < minEarned) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "earned-desc") return b.totalEarned - a.totalEarned;
        if (sortBy === "earned-asc") return a.totalEarned - b.totalEarned;
        if (sortBy === "projects-desc") return b.totalProjects - a.totalProjects;
        if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [clients, ratingFilter, earnedFilter, sortBy]);

  const SORT_OPTIONS = [
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "earned-desc", label: "Earnings: High to Low" },
    { value: "earned-asc", label: "Earnings: Low to High" },
    { value: "projects-desc", label: "Projects: High to Low" },
    { value: "rating-desc", label: "Rating: High to Low" },
  ];

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || "Name: A to Z";

  const isFilterActive = statusFilter !== "all" || ratingFilter !== "all" || earnedFilter !== "all";
  const activeFilterCount = 
    (statusFilter !== "all" ? 1 : 0) +
    (ratingFilter !== "all" ? 1 : 0) +
    (earnedFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setStatusFilter("all");
    setRatingFilter("all");
    setEarnedFilter("all");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, padding: "4px 0", maxWidth: "1200px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Page Title + Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", borderBottom: "0.5px solid var(--border)", paddingBottom: "16px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "20px", fontWeight: 510, letterSpacing: "-0.015em", color: "var(--text-primary)", margin: 0 }}>
              Clients
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
              Manage corporate accounts, review project metrics, and analyze aggregated values.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              id="add-client-btn"
              onClick={openAdd}
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
            >
              Add Client
            </Button>
          </div>
        </div>

        {/* ASYMMETRIC KPI CARDS (DESIGN.md rule: avoid equal width) */}
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr", gap: "14px" }} className="grid-responsive-3">
          {/* Main Settled Value Metric (2.2fr) */}
          <div
            style={{
              padding: "18px 22px",
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-cards)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                Settled Pipeline Value
              </span>
              <h2 style={{ fontSize: "26px", fontWeight: 590, letterSpacing: "-0.022em", color: "var(--text-primary)", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>
                ${totalEarned.toLocaleString()}
              </h2>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                Aggregated earnings across {total} registered accounts
              </p>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-inputs)",
                background: "rgba(39,166,68,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-pulse-green)",
                flexShrink: 0,
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>

          {/* Active Accounts Metric (1.2fr) */}
          <div
            style={{
              padding: "18px",
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-cards)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(39,166,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-pulse-green)" }}>
                <CheckCircle size={12} />
              </div>
              <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Active Accounts</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 590, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {activeCount} <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>/ {total}</span>
            </div>
          </div>

          {/* Total Network Metric (1fr) */}
          <div
            style={{
              padding: "18px",
              background: "var(--surface-1)",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-cards)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(228,242,34,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
                <Users size={12} />
              </div>
              <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Total Network</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 590, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {total}
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & View Switcher */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", padding: "8px 12px", border: "0.5px solid var(--border)", background: "var(--surface-1)", borderRadius: "var(--radius-cards)" }}>
            
            {/* Search Input */}
            <div style={{ flex: "1", minWidth: "160px", maxWidth: "260px", position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="client-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts..."
                style={{
                  width: "100%",
                  height: "32px",
                  paddingLeft: "30px",
                  paddingRight: "10px",
                  background: "var(--bg-base)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "var(--radius-inputs)",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            {/* Filters Popover */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setFiltersOpen(!filtersOpen);
                  setSortOpen(false);
                }}
                style={{
                  background: isFilterActive ? "var(--surface-2)" : "transparent",
                  border: "0.5px solid var(--border)",
                  color: isFilterActive ? "var(--text-primary)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "32px",
                  padding: "0 10px",
                  fontSize: "12px",
                  borderRadius: "var(--radius-inputs)",
                  cursor: "pointer",
                }}
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span style={{
                    background: "var(--color-brand)",
                    color: "#08090a",
                    borderRadius: "9999px",
                    padding: "0 5px",
                    fontSize: "9.5px",
                    fontWeight: 590,
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setFiltersOpen(false)} />
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "4px",
                      zIndex: 10,
                      width: "260px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      background: "var(--surface-2)",
                      border: "0.5px solid var(--border-strong)",
                      borderRadius: "var(--radius-cards)",
                      boxShadow: "var(--shadow-xl)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "12px", fontWeight: 590, color: "var(--text-primary)", margin: 0 }}>Filter Clients</h4>
                      {isFilterActive && (
                        <button 
                          onClick={clearAllFilters}
                          style={{ border: "none", background: "none", color: "var(--color-brand)", fontSize: "11px", cursor: "pointer" }}
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ fontSize: "12px", height: "30px", padding: "0 8px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="prospect">Prospect</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase" }}>Rating</label>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        style={{ fontSize: "12px", height: "30px", padding: "0 8px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="unrated">Unrated Only</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase" }}>Minimum Earned</label>
                      <select
                        value={earnedFilter}
                        onChange={(e) => setEarnedFilter(e.target.value)}
                        style={{ fontSize: "12px", height: "30px", padding: "0 8px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        <option value="all">Any Amount</option>
                        <option value="1000">Over $1,000</option>
                        <option value="5000">Over $5,000</option>
                        <option value="10000">Over $10,000</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sort Popover */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setSortOpen(!sortOpen);
                  setFiltersOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "0.5px solid var(--border)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "32px",
                  padding: "0 10px",
                  fontSize: "12px",
                  borderRadius: "var(--radius-inputs)",
                  cursor: "pointer",
                }}
              >
                <ArrowUpDown size={12} />
                <span>Sort: {currentSortLabel}</span>
                <ChevronDown size={11} style={{ opacity: 0.7 }} />
              </button>

              {sortOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setSortOpen(false)} />
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "4px",
                      zIndex: 10,
                      width: "200px",
                      padding: "4px 0",
                      background: "var(--surface-2)",
                      border: "0.5px solid var(--border-strong)",
                      borderRadius: "var(--radius-inputs)",
                      boxShadow: "var(--shadow-xl)",
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "7px 12px",
                          fontSize: "12px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: sortBy === opt.value ? "var(--color-brand)" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Check size={12} color="var(--color-brand)" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* View Mode Toggle */}
            <div style={{ background: "var(--bg-base)", padding: "2px", borderRadius: "var(--radius-inputs)", border: "0.5px solid var(--border)", height: "32px", display: "flex", alignItems: "center" }}>
              {(["grid", "list"] as const).map((m) => (
                <button
                  key={m}
                  id={`view-${m}`}
                  onClick={() => setViewMode(m)}
                  style={{
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: viewMode === m ? "var(--surface-2)" : "transparent",
                    color: viewMode === m ? "var(--text-primary)" : "var(--text-muted)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {m === "grid" ? (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="0" width="7" height="7" rx="1.5" />
                      <rect x="9" y="0" width="7" height="7" rx="1.5" />
                      <rect x="0" y="9" width="7" height="7" rx="1.5" />
                      <rect x="9" y="9" width="7" height="7" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="1" width="16" height="2.5" rx="1.25" />
                      <rect x="0" y="6.75" width="16" height="2.5" rx="1.25" />
                      <rect x="0" y="12.5" width="16" height="2.5" rx="1.25" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Chips */}
          {isFilterActive && (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active:</span>
              {statusFilter !== "all" && (
                <span style={{ padding: "2px 7px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-badges)", fontSize: "11px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button onClick={() => setStatusFilter("all")} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}
              {ratingFilter !== "all" && (
                <span style={{ padding: "2px 7px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-badges)", fontSize: "11px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Rating: {ratingFilter === "unrated" ? "Unrated" : `${ratingFilter}+ Stars`}
                  <button onClick={() => setRatingFilter("all")} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}
              {earnedFilter !== "all" && (
                <span style={{ padding: "2px 7px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-badges)", fontSize: "11px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Earned: &gt;${parseInt(earnedFilter, 10).toLocaleString()}
                  <button onClick={() => setEarnedFilter("all")} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}
              <button onClick={clearAllFilters} style={{ border: "none", background: "none", color: "var(--color-brand)", fontSize: "11px", cursor: "pointer", marginLeft: "4px" }}>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Content list/grid rendering */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-cards)", background: "var(--surface-1)", border: "0.5px solid var(--border)" }} />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<UserX />}
            heading={search || isFilterActive ? "No matching clients" : "No clients added yet"}
            description={search || isFilterActive ? "Adjust search query or reset filter settings" : "Create your first corporate client profile to track projects and revenue."}
            actionLabel={!search && !isFilterActive ? "Add Client" : undefined}
            onActionClick={openAdd}
          />
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "14px",
            }}
          >
            {filteredClients.map((c) => (
              <ClientCard
                key={c._id}
                client={c}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          /* HIGH DENSITY TABLE VIEW (0.5px Hairline Grid) */
          <div className="glass-card" style={{ overflow: "hidden", borderRadius: "var(--radius-cards)", border: "0.5px solid var(--border)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)" }}>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tags</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Projects</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Earned</th>
                    <th style={{ padding: "10px 12px", fontSize: "10.5px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rating</th>
                    <th style={{ padding: "10px 12px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((c) => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <tr
                        key={c._id}
                        style={{
                          borderBottom: "0.5px solid var(--border)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                        }
                      >
                        {/* Client */}
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              className="avatar"
                              style={{
                                width: "28px",
                                height: "28px",
                                fontSize: "11px",
                                fontWeight: 590,
                                background: avatarGradient(c.name),
                                color: "var(--text-primary)",
                                borderRadius: "var(--radius-inputs)",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>
                                {c.name}
                              </p>
                              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{c.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Company */}
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                            {c.company || "—"}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: "10px 12px" }}>
                          <Badge variant={getBadgeVariant(c.status)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                          </Badge>
                        </td>
                        {/* Tags */}
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {c.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                style={{
                                  padding: "2px 6px",
                                  background: "var(--surface-2)",
                                  border: "0.5px solid var(--border)",
                                  borderRadius: "var(--radius-badges)",
                                  fontSize: "10.5px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {t}
                              </span>
                            ))}
                            {c.tags.length === 0 && (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                            )}
                          </div>
                        </td>
                        {/* Projects */}
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: 510, fontVariantNumeric: "tabular-nums" }}>
                            {c.totalProjects}
                          </span>
                        </td>
                        {/* Earned */}
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: 510, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                            ${c.totalEarned.toLocaleString()}
                          </span>
                        </td>
                        {/* Rating */}
                        <td style={{ padding: "10px 12px" }}>
                          {c.rating ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#f59e0b" }}>
                              <Star size={11} fill="#f59e0b" />
                              {c.rating}
                            </span>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                            <Link href={`/dashboard/clients/${c._id}`}>
                              <Button variant="ghost" size="icon" style={{ width: "24px", height: "24px" }}>
                                <Eye size={12} />
                              </Button>
                            </Link>
                            <Button
                              id={`list-edit-${c._id}`}
                              onClick={() => openEdit(c)}
                              variant="ghost"
                              size="icon"
                              style={{ width: "24px", height: "24px" }}
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button
                              id={`list-delete-${c._id}`}
                              onClick={() => setDeleteTarget(c)}
                              variant="ghost"
                              size="icon"
                              style={{ width: "24px", height: "24px", color: "var(--color-coral-red)" }}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ClientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editTarget}
        onSaved={handleSaved}
      />
      <DeleteModal
        client={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
