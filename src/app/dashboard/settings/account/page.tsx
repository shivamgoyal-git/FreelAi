"use client";

import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Settings, ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("UTC");
  const [themePreference, setThemePreference] = useState("dark");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyApp, setNotifyApp] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || "");
      setLoading(false);
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate save response
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Account Settings updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update account settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
              <h2 className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)" }}>General Settings</h2>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                Update your registered email, language, active timezone, and system notifications.
              </p>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 size={24} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Update Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="input-group">
                    <label className="input-label">Language Preference</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    >
                      {["English", "Spanish", "French", "German", "Japanese"].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">System Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    >
                      {["UTC", "EST", "PST", "GMT", "IST", "AEDT"].map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Theme Preference</label>
                  <select
                    value={themePreference}
                    onChange={(e) => setThemePreference(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>

                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "16px", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", display: "block", marginBottom: "12px" }}>
                    Notification Channels
                  </span>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                        style={{ accentColor: "var(--color-brand)" }}
                      />
                      Send email reports for paid and outstanding invoices
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={notifyApp}
                        onChange={(e) => setNotifyApp(e.target.checked)}
                        style={{ accentColor: "var(--color-brand)" }}
                      />
                      Enable app notifications for newly matching contracts
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "18px", marginTop: "10px" }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
                  >
                    {saving ? "Saving settings..." : "Save Changes"}
                  </Button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
  );
}
