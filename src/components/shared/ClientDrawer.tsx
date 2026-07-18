import React, { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

interface Client {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  location?: string;
  avatar?: string | null;
  notes?: string;
}

interface ClientDrawerProps {
  open: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export default function ClientDrawer({ open, onClose, onClientCreated }: { open: boolean; onClose: () => void; onClientCreated: (c: Client) => void }) {
  useBodyScrollLock(open);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Fetch clients to check duplicates
  useEffect(() => {
    if (open) {
      const fetchClients = async () => {
        try {
          const res = await fetch("/api/clients?limit=100");
          const data = await res.json();
          if (res.ok) {
            setClients(data.clients || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchClients();

      // Reset form fields
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setCountry("");
      setNotes("");
      setError("");
      setIsDuplicate(false);
    }
  }, [open]);

  // Duplicate email check
  useEffect(() => {
    if (email.trim() && clients.length > 0) {
      const exists = clients.some((c) => c.email.toLowerCase() === email.trim().toLowerCase());
      setIsDuplicate(exists);
    } else {
      setIsDuplicate(false);
    }
  }, [email, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: country.trim(), // Maps to location in model
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create client.");
      }

      onClientCreated(data.client);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 400,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      />

      {/* Slide drawer container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "460px",
          background: "var(--bg-elevated)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
          zIndex: 401,
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 className="font-heading" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
              Create New Client
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Add a client record to attach projects and track invoices.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: "6px",
              borderRadius: "50%",
              transition: "background var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body - scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {error && (
            <div className="error-banner" style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <AlertTriangle size={15} />
              <span style={{ fontSize: "13px" }}>{error}</span>
            </div>
          )}

          <form id="drawer-client-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-name">Full Name *</label>
              <input
                id="client-name"
                className="input-redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swati Jain"
                required
              />
            </div>

            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-company">Company (Optional)</label>
              <input
                id="client-company"
                className="input-redesign"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Pixel Design Studio"
              />
            </div>

            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-email">Email Address *</label>
              <input
                id="client-email"
                type="email"
                className="input-redesign"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. swati@pixeldesign.com"
                required
              />
              {isDuplicate && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--warning)",
                    fontSize: "11px",
                    marginTop: "6px",
                    fontWeight: 500,
                  }}
                >
                  <AlertTriangle size={12} />
                  A client with this email already exists in your workspace.
                </div>
              )}
            </div>

            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-phone">Phone Number (Optional)</label>
              <input
                id="client-phone"
                className="input-redesign"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-country">Country (Optional)</label>
              <input
                id="client-country"
                className="input-redesign"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
              />
            </div>

            <div className="form-group-redesign">
              <label className="label-redesign" htmlFor="client-notes">Notes (Optional)</label>
              <textarea
                id="client-notes"
                className="textarea-redesign"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any relevant notes about the relationship..."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </form>
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            background: "rgba(0,0,0,0.1)",
          }}
        >
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            form="drawer-client-form"
            type="submit"
            variant="primary"
            size="sm"
            style={{ minWidth: "120px" }}
            disabled={saving}
            leftIcon={saving ? <Loader2 size={13} className="loading-spinner" /> : undefined}
          >
            {saving ? "Saving..." : "Save Client"}
          </Button>
        </div>

        {/* Keyframe animation declarations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}
