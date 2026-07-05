"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";

export default function AIPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data payload storage
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

  // AI preferences states
  const [preferredTone, setPreferredTone] = useState("Professional");
  const [writingStyle, setWritingStyle] = useState("Direct & outcome-driven");
  const [preferredLength, setPreferredLength] = useState("Medium");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [defaultTimeline, setDefaultTimeline] = useState("4 weeks");
  const [defaultRevisionCount, setDefaultRevisionCount] = useState(3);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = (await res.json()) as { profile: Record<string, unknown> };
          const p = data.profile;
          if (p) {
            setProfileData(p);
            const preferences = (p.preferences || {}) as Record<string, unknown>;
            const brandVoice = (p.brandVoice || {}) as Record<string, unknown>;
            const aiPreferences = (p.aiPreferences || {}) as Record<string, unknown>;

            setPreferredTone((preferences.preferredProposalTone as string) || "Professional");
            setWritingStyle((brandVoice.sentenceStructure as string) || "Direct & outcome-driven");
            setPreferredLength((aiPreferences.contextRefresh as string) || "Medium");
            setPreferredCurrency((preferences.preferredCurrency as string) || "USD");
            setDefaultTimeline((preferences.defaultTimeline as string) || "4 weeks");
            setDefaultRevisionCount((preferences.defaultRevisionCount as number) || 3);
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI preferences:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Merge into complete payload to maintain validations
      const payload = {
        ...(profileData || {}),
        brandVoice: {
          ...((profileData?.brandVoice as Record<string, unknown>) || {}),
          sentenceStructure: writingStyle,
        },
        aiPreferences: {
          ...((profileData?.aiPreferences as Record<string, unknown>) || {}),
          contextRefresh: preferredLength, // preferred length alias
        },
        preferences: {
          ...((profileData?.preferences as Record<string, unknown>) || {}),
          preferredProposalTone: preferredTone,
          preferredCurrency,
          defaultTimeline,
          defaultRevisionCount,
        }
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("AI Preferences saved successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update AI preferences");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving AI preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
              <h2 className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)" }}>AI Agent Customizations</h2>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                Configure how the AI Proposal Generator, Writing Assistants, and smart engines format content.
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
                    <label className="input-label">Default Proposal Tone Style</label>
                    <select
                      value={preferredTone}
                      onChange={(e) => setPreferredTone(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    >
                      {["Professional", "Friendly", "Confident", "Expert", "Premium Agency"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Preferred Writing Style / Layout</label>
                    <input
                      type="text"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      placeholder="e.g. Short & punchy, or Elaborate & technical"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="input-group">
                    <label className="input-label">Preferred Proposal length</label>
                    <select
                      value={preferredLength}
                      onChange={(e) => setPreferredLength(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    >
                      {["Short", "Medium", "Long"].map((l) => (
                        <option key={l} value={l}>{l} Blueprint</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Default Invoice Currency</label>
                    <select
                      value={preferredCurrency}
                      onChange={(e) => setPreferredCurrency(e.target.value)}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    >
                      {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((cur) => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="input-group">
                    <label className="input-label">Default Project Timeline</label>
                    <input
                      type="text"
                      value={defaultTimeline}
                      onChange={(e) => setDefaultTimeline(e.target.value)}
                      placeholder="e.g. 4 weeks, 2 months"
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Default Contract Revisions</label>
                    <input
                      type="number"
                      value={defaultRevisionCount}
                      onChange={(e) => setDefaultRevisionCount(Number(e.target.value))}
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "18px", marginTop: "10px" }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    leftIcon={saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                  >
                    {saving ? "Saving options..." : "Save Preferences"}
                  </Button>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
  );
}
