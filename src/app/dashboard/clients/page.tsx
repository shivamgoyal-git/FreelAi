"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronLeft,
  AlertTriangle,
  Loader2,
  StickyNote,
  DollarSign,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import type { Client, ClientStatus, ClientFormData } from "@/types/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_FORM);
      setTagInput("");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={17} color="var(--primary)" />
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: "18px", color: "var(--text-primary)" }}
            >
              {isEdit ? "Edit Client" : "Add New Client"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid var(--border-default)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "var(--error-bg)",
              border: "1px solid var(--error)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--error)",
              fontSize: "13px",
            }}
          >
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-name">Name *</label>
              <input
                id="client-name"
                className="input-redesign"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-email">Email *</label>
              <input
                id="client-email"
                className="input-redesign"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          {/* Phone & Company */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-phone">Phone</label>
              <input
                id="client-phone"
                className="input-redesign"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-company">Company</label>
              <input
                id="client-company"
                className="input-redesign"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          {/* Website & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-website">Website</label>
              <input
                id="client-website"
                className="input-redesign"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-location">Location</label>
              <input
                id="client-location"
                className="input-redesign"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="New York, USA"
              />
            </div>
          </div>

          {/* Status & Rating */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-status">Status</label>
              <select
                id="client-status"
                className="input-redesign"
                value={form.status}
                onChange={(e) => set("status", e.target.value as ClientStatus)}
                style={{ cursor: "pointer" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-rating">Rating (1–5)</label>
              <input
                id="client-rating"
                className="input-redesign"
                type="number"
                min={1}
                max={5}
                value={form.rating ?? ""}
                onChange={(e) =>
                  set("rating", e.target.value ? Number(e.target.value) : null)
                }
                placeholder="—"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group-redesign">
            <label className="label-redesign">Tags</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                padding: "8px",
                background: "var(--surface-2)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                minHeight: "44px",
                alignItems: "center",
              }}
            >
              {form.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    background: "var(--color-brand-subtle)",
                    color: "var(--color-brand-hover)",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-brand-hover)",
                      display: "flex",
                      padding: "0",
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                id="client-tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag & press Enter"
                style={{
                  flex: 1,
                  minWidth: "120px",
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group-redesign">
            <label className="label-redesign" htmlFor="client-notes">Notes</label>
            <textarea
              id="client-notes"
              className="textarea-redesign"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes about this client..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "4px",
            }}
          >
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
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
        background: "rgba(0,0,0,0.72)",
        zIndex: 300,
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
          maxWidth: "400px",
          padding: "28px",
          animation: "scaleIn 0.2s ease",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "var(--error-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={22} color="var(--error)" />
        </div>
        <h3
          className="font-heading"
          style={{ fontSize: "18px", marginBottom: "8px" }}
        >
          Delete Client?
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
          This will permanently remove{" "}
          <strong style={{ color: "var(--text-primary)" }}>{client.name}</strong>{" "}
          from your client list. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button
            id="delete-cancel-btn"
            onClick={onClose}
            variant="secondary"
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
            style={{ minWidth: "100px" }}
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

// ── CLIENT CARD ───────────────────────────────────────────────
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
      className="glass-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
      }}
    >
      {/* Top Row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Avatar */}
        <div
          className="avatar"
          style={{
            width: "46px",
            height: "46px",
            fontSize: "15px",
            background: avatarGradient(client.name),
            flexShrink: 0,
          }}
        >
          {getInitials(client.name)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {client.name}
          </p>
          {client.company && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
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
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "34px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 50,
                  minWidth: "150px",
                  overflow: "hidden",
                  animation: "scaleIn 0.15s ease",
                }}
              >
                {[
                  {
                    id: `view-${client._id}`,
                    icon: <Eye size={13} />,
                    label: "View Details",
                    href: `/dashboard/clients/${client._id}`,
                  },
                  {
                    id: `edit-${client._id}`,
                    icon: <Edit3 size={13} />,
                    label: "Edit",
                    action: () => { onEdit(client); setMenuOpen(false); },
                  },
                  {
                    id: `delete-${client._id}`,
                    icon: <Trash2 size={13} />,
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
                        padding: "9px 14px",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")
                      }
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
                        padding: "9px 14px",
                        fontSize: "13px",
                        color: item.danger ? "var(--error)" : "var(--text-secondary)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                      }
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
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <a
          href={`mailto:${client.email}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "12px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          <Mail size={12} color="var(--text-subtle)" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {client.email}
          </span>
        </a>
        {client.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--text-muted)" }}>
            <Phone size={12} color="var(--text-subtle)" />
            {client.phone}
          </div>
        )}
        {client.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--text-muted)" }}>
            <MapPin size={12} color="var(--text-subtle)" />
            {client.location}
          </div>
        )}
      </div>
      {/* Tags */}
      {client.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {client.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              style={{
                padding: "2px 8px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-full)",
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {t}
            </span>
          ))}
          {client.tags.length > 3 && (
            <span style={{ fontSize: "11px", color: "var(--text-subtle)", padding: "2px 4px" }}>
              +{client.tags.length - 3}
            </span>
          )}
        </div>
      )}
      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
            {client.totalProjects}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Projects
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary)" }}>
            ${client.totalEarned.toLocaleString()}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Earned
          </p>
        </div>
      </div>
      {/* Footer */}
      <div style={{ display: "flex", gap: "6px" }}>
        <Link href={`/dashboard/clients/${client._id}`}>
          <Button variant="secondary" size="sm" leftIcon={<Eye size={12} />} style={{ flex: 1 }}>
            View
          </Button>
        </Link>
        <Button
          id={`edit-card-${client._id}`}
          onClick={() => onEdit(client)}
          variant="ghost"
          size="sm"
          leftIcon={<Edit3 size={12} />}
          style={{ flex: 1 }}
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Summary stats
  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalEarned = clients.reduce((s, c) => s + c.totalEarned, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      {/* Top Nav */}
      <header
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "0 24px",
          borderBottom: "0.5px solid var(--border)",
          background: "var(--surface-1)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "13px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>

        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={13} color="var(--color-brand)" />
          </div>
          <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            Clients
          </h1>
        </div>

        <div style={{ flex: 1 }} />

        <button
          id="add-client-btn"
          onClick={openAdd}
          className="btn-redesign btn-redesign-primary btn-redesign-sm"
        >
          <Plus size={13} /> Add Client
        </button>
      </header>
      <main style={{ flex: 1, padding: "28px", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
        {/* Page Title + Summary */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div>
            <h2 className="font-heading" style={{ fontSize: "22px", marginBottom: "4px", letterSpacing: "-0.02em" }}>
              Client Management
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {total} client{total !== 1 ? "s" : ""} in your network
            </p>
          </div>

          {/* Stat pills */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { icon: <Users size={13} />, label: "Total", value: total, color: "var(--color-brand)" },
              { icon: <CheckCircle size={13} />, label: "Active", value: activeCount, color: "var(--color-success)" },
              { icon: <DollarSign size={13} />, label: "Earned", value: `$${totalEarned.toLocaleString()}`, color: "var(--color-accent)" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "var(--radius)", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {/* Search */}
          <div className="search-input-wrapper" style={{ flex: "1", minWidth: "180px", maxWidth: "320px" }}>
            <span className="search-input-icon"><Search size={13} /></span>
            <input
              id="client-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="search-input"
            />
          </div>

          {/* Status filter */}
          <div className="filter-tabs">
            {["all", "active", "inactive", "prospect", "archived"].map((s) => (
              <button
                key={s}
                id={`filter-status-${s}`}
                onClick={() => setStatusFilter(s)}
                className={`filter-tab${statusFilter === s ? " active" : ""}`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div className="filter-tabs">
            {(["grid", "list"] as const).map((m) => (
              <button
                key={m}
                id={`view-${m}`}
                onClick={() => setViewMode(m)}
                className={`filter-tab${viewMode === m ? " active" : ""}`}
              >
                {m === "grid" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="0" y="0" width="7" height="7" rx="1.5" />
                    <rect x="9" y="0" width="7" height="7" rx="1.5" />
                    <rect x="0" y="9" width="7" height="7" rx="1.5" />
                    <rect x="9" y="9" width="7" height="7" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="0" y="1" width="16" height="2.5" rx="1.25" />
                    <rect x="0" y="6.75" width="16" height="2.5" rx="1.25" />
                    <rect x="0" y="12.5" width="16" height="2.5" rx="1.25" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<UserX />}
            heading={search || statusFilter !== "all" ? "No clients match your search" : "No clients yet"}
            description={search || statusFilter !== "all" ? "Try adjusting your filters" : "Add your first client to get started"}
            actionLabel={!search && statusFilter === "all" ? "Add Client" : undefined}
            onActionClick={openAdd}
          />
        ) : viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {clients.map((c) => (
              <ClientCard
                key={c._id}
                client={c}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {["Client", "Company", "Status", "Tags", "Projects", "Earned", "Rating", ""].map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, i) => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <tr
                        key={c._id}
                        style={{
                          borderBottom:
                            i < clients.length - 1
                              ? "1px solid var(--border-subtle)"
                              : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-elevated)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                        }
                      >
                        {/* Client */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              className="avatar"
                              style={{
                                width: "34px",
                                height: "34px",
                                fontSize: "12px",
                                background: avatarGradient(c.name),
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                                {c.name}
                              </p>
                              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Company */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            {c.company || "—"}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: "14px 16px" }}>
                          <Badge variant={getBadgeVariant(c.status)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                          </Badge>
                        </td>
                        {/* Tags */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {c.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                style={{
                                  padding: "2px 7px",
                                  background: "var(--bg-elevated)",
                                  border: "1px solid var(--border-default)",
                                  borderRadius: "var(--radius-full)",
                                  fontSize: "11px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {t}
                              </span>
                            ))}
                            {c.tags.length === 0 && (
                              <span style={{ fontSize: "12px", color: "var(--text-subtle)" }}>—</span>
                            )}
                          </div>
                        </td>
                        {/* Projects */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {c.totalProjects}
                          </span>
                        </td>
                        {/* Earned */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--primary)" }}>
                            ${c.totalEarned.toLocaleString()}
                          </span>
                        </td>
                        {/* Rating */}
                        <td style={{ padding: "14px 16px" }}>
                          {c.rating ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#f59e0b" }}>
                              <Star size={12} fill="#f59e0b" />
                              {c.rating}
                            </span>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-subtle)" }}>—</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <Link href={`/dashboard/clients/${c._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye size={13} />
                              </Button>
                            </Link>
                            <Button
                              id={`list-edit-${c._id}`}
                              onClick={() => openEdit(c)}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit3 size={13} />
                            </Button>
                            <Button
                              id={`list-delete-${c._id}`}
                              onClick={() => setDeleteTarget(c)}
                              variant="ghost"
                              size="sm"
                              style={{ color: "var(--color-danger)" }}
                            >
                              <Trash2 size={13} />
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
      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
