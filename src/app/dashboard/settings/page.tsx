"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SettingsTemplate } from "@/components/templates";
import { Input, Textarea, Button, Select } from "@/components/ui";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/components/providers/ThemeProvider";
import AppShell from "@/components/layout/app-shell";
import { toast } from "sonner";
import {
  User, Sparkles, Monitor, Bell, Shield, CreditCard, Key, Eye, HelpCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form States - General
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");

  // Form States - AI Preferences
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLength, setAiLength] = useState("standard");
  const [autoIncludePortfolio, setAutoIncludePortfolio] = useState(true);

  // Form States - Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);

  // Form States - Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const userName = session?.user?.name ?? "Freelancer";
  const userInitial = userName.charAt(0).toUpperCase();
  const userImage = session?.user?.image;

  // Load user profile for initial preferences
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          if (data.profile?.personal?.fullName) {
            setDisplayName(data.profile.personal.fullName);
          }
          if (data.profile?.preferences?.aiTone) {
            setAiTone(data.profile.preferences.aiTone);
          }
          if (data.profile?.preferences?.aiLength) {
            setAiLength(data.profile.preferences.aiLength);
          }
        }
      } catch (err) {
        console.error("Failed to load settings profile:", err);
      }
    }
    if (session) {
      loadProfile();
    }
  }, [session]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If profile exists, update it, otherwise create a light one
      const res = await fetch("/api/profile", {
        method: profile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          personal: {
            ...profile?.personal,
            fullName: displayName,
          },
        }),
      });
      if (res.ok) {
        toast.success("General settings saved");
      } else {
        toast.error("Failed to save general settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: profile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          preferences: {
            ...profile?.preferences,
            aiTone,
            aiLength,
            autoIncludePortfolio,
          },
        }),
      });
      if (res.ok) {
        toast.success("AI preferences updated");
      } else {
        toast.error("Failed to update AI preferences");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in password fields");
      return;
    }
    setLoading(true);
    try {
      // Mock password update
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "general", label: "General", icon: <User size={15} /> },
    { id: "ai", label: "AI Preferences", icon: <Sparkles size={15} /> },
    { id: "appearance", label: "Appearance", icon: <Monitor size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { id: "security", label: "Security", icon: <Shield size={15} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={15} /> },
  ];

  return (
    <div className="page-enter">
      <SettingsTemplate
        title="Settings"
        subtitle="Manage your FreelAI account preferences and billing."
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {activeSection === "general" && (
          <form onSubmit={handleSaveGeneral} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>General Settings</h3>
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Shivam Goyal"
            />
            <Select
              label="Timezone"
              value={timezone}
              onValueChange={setTimezone}
              options={[
                { value: "UTC", label: "Coordinated Universal Time (UTC)" },
                { value: "EST", label: "Eastern Standard Time (EST)" },
                { value: "IST", label: "Indian Standard Time (IST)" },
              ]}
            />
            <Select
              label="Language"
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "de", label: "German" },
              ]}
            />
            <Button variant="primary" type="submit" loading={loading} style={{ alignSelf: "flex-start", marginTop: "8px" }}>
              Save General Settings
            </Button>
          </form>
        )}

        {activeSection === "ai" && (
          <form onSubmit={handleSaveAI} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>AI Preferences</h3>
            <Select
              label="Default Tone"
              value={aiTone}
              onValueChange={setAiTone}
              options={[
                { value: "Auto", label: "Auto (Detect from Job Post)" },
                { value: "Professional", label: "Professional" },
                { value: "Expert", label: "Expert / Authoritative" },
                { value: "Premium Agency", label: "Premium Agency" },
                { value: "Friendly", label: "Friendly & Casual" },
              ]}
            />
            <Select
              label="Default Proposal Length"
              value={aiLength}
              onValueChange={setAiLength}
              options={[
                { value: "short", label: "Short & Concise" },
                { value: "standard", label: "Standard Length" },
                { value: "detailed", label: "Detailed (Multi-tier)" },
              ]}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Auto-include Portfolio</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>Automatically suggest relevant work samples for matched jobs.</p>
              </div>
              <Switch checked={autoIncludePortfolio} onCheckedChange={setAutoIncludePortfolio} />
            </div>
            <Button variant="primary" type="submit" loading={loading} style={{ alignSelf: "flex-start", marginTop: "8px" }}>
              Save AI Preferences
            </Button>
          </form>
        )}

        {activeSection === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>Appearance</h3>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Theme Mode</p>
              <div style={{ display: "inline-flex", background: "var(--surface-2)", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius-pill)", padding: "3px", gap: "2px" }}>
                {(["light", "dark", "system"] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    style={{
                      background: theme === t ? "var(--surface-1)" : "transparent",
                      border: "none", cursor: "pointer", padding: "6px 14px",
                      borderRadius: "var(--radius-pill)", fontSize: "12px", fontWeight: 600,
                      color: theme === t ? "var(--color-brand)" : "var(--text-muted)",
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Alert variant="info">
              High contrast mode and animation options obey your operating system accessibility preferences.
            </Alert>
          </div>
        )}

        {activeSection === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>Notifications</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Email Alerts</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>Receive summary reports of your proposals and weekly analytics.</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>Proposal Activity</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>Get notified when proposals are processed or reviewed.</p>
              </div>
              <Switch checked={proposalAlerts} onCheckedChange={setProposalAlerts} />
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="font-heading" style={{ fontSize: "16px", margin: 0 }}>Security Settings</h3>
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button variant="primary" type="submit" loading={loading} style={{ alignSelf: "flex-start", marginTop: "8px" }}>
              Update Password
            </Button>
          </form>
        )}

        {activeSection === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
              <CreditCard size={22} style={{ margin: "auto" }} />
            </div>
            <div>
              <h3 className="font-heading" style={{ fontSize: "18px", margin: "8px 0 4px" }}>Pro Plan Active</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto 12px" }}>
                You have active unlimited AI generation and premium humanization model templates. Next billing cycle on Aug 5, 2026.
              </p>
              <Button variant="outline" size="sm">Manage Subscription</Button>
            </div>
          </div>
        )}
      </SettingsTemplate>
    </div>
  );
}
