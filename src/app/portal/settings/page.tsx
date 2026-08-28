"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/portal/LoadingSkeleton";

function ClientSettingsContent() {
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get("previewClientId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const url = previewClientId
          ? `/api/portal/settings?previewClientId=${previewClientId}`
          : `/api/portal/settings`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.client) {
            setForm({
              name: data.client.name || "",
              email: data.client.email || "",
              company: data.client.company || "",
              phone: data.client.phone || "",
              location: data.client.location || "",
              website: data.client.website || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [previewClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          previewClientId,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton height="400px" borderRadius="12px" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-paper, #ffffff)",
            letterSpacing: "-0.5px",
            margin: "0 0 4px 0",
          }}
        >
          Account Settings
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-fog, #8a8f98)", margin: 0 }}>
          Manage your client profile and contact details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-carbon, #0f1011)",
          border: "1px solid var(--color-graphite, #23252a)",
          borderRadius: "14px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {saved && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(39, 166, 68, 0.15)",
              border: "1px solid rgba(39, 166, 68, 0.3)",
              color: "var(--color-pulse-green, #27a644)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={16} />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{
              width: "100%",
              background: "var(--color-obsidian)",
              border: "1px solid var(--color-graphite)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "var(--color-paper)",
              fontSize: "13.5px",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            disabled
            style={{
              width: "100%",
              background: "var(--color-obsidian)",
              border: "1px solid var(--color-graphite)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "var(--color-fog)",
              fontSize: "13.5px",
              cursor: "not-allowed",
            }}
          />
          <span style={{ fontSize: "11px", color: "var(--color-ash)", marginTop: "4px", display: "block" }}>
            Email is managed by your freelancer or account invite.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Company / Organization
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. New York, USA"
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--color-bone)", marginBottom: "6px" }}>
              Website URL
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://acme.com"
              style={{
                width: "100%",
                background: "var(--color-obsidian)",
                border: "1px solid var(--color-graphite)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--color-paper)",
                fontSize: "13.5px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", minWidth: "130px" }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ClientSettingsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton height="400px" borderRadius="12px" />}>
      <ClientSettingsContent />
    </Suspense>
  );
}
