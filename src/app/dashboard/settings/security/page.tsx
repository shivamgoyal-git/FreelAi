"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, ChevronLeft, Loader2, Save, Key, AppWindow, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";

export default function SecuritySettingsPage() {
  const [saving, setSaving] = useState(false);
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password must match.");
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      alert("Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-0)" }}>
      <Sidebar active="settings" setActive={() => {}} userName="User" userInitial="U" />

      <div style={{ flex: 1, marginLeft: "252px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        
        {/* Navigation Header */}
        <header style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={13} color="var(--color-brand)" />
            </div>
            <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Security settings</h1>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px", maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Password section */}
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Key size={18} color="var(--color-brand)" />
                <div>
                  <h2 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>Update Password</h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Ensure your account uses a long, random password to stay secure.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "6px" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : undefined}
                  >
                    {saving ? "Updating password..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </div>

            {/* 2FA section */}
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                  <ShieldAlert size={18} color="var(--color-brand)" style={{ marginTop: "2px" }} />
                  <div>
                    <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>Two-Factor Authentication (2FA)</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", maxWidth: "480px", lineHeight: "1.5" }}>
                      Add an additional layer of security to your FreelAI identity. Verification codes will be required upon signing in.
                    </p>
                  </div>
                </div>
                <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tfaEnabled}
                    onChange={(e) => setTfaEnabled(e.target.checked)}
                    style={{ width: "40px", height: "20px", appearance: "none", background: tfaEnabled ? "var(--color-brand)" : "var(--surface-3)", borderRadius: "99px", position: "relative", outline: "none", transition: "background 0.2s" }}
                  />
                  <span style={{ position: "absolute", left: tfaEnabled ? "22px" : "2px", top: "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%", transition: "left 0.2s" }} />
                </label>
              </div>
            </div>

            {/* Active Sessions & Login Activity */}
            <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <AppWindow size={18} color="var(--color-brand)" />
                <div>
                  <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>Active Browser Sessions</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>These devices are currently logged in to your account.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)" }}>Chrome on Windows 11</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#10b981", fontWeight: 600, marginTop: "2px" }}>Current Session • Delhi, India</span>
                  </div>
                  <Button variant="secondary" size="sm" disabled>Revoke</Button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", opacity: 0.8 }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary)" }}>Safari on iPhone 15</span>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Last active: 2 hours ago • Delhi, India</span>
                  </div>
                  <Button variant="secondary" size="sm">Revoke</Button>
                </div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
