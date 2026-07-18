"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  User,
  Layers,
  Settings,
  Check,
  Plus,
  X,
  Loader2,
  Save,
  ShieldCheck,
  Volume2,
  Briefcase,
  Building2,
  Globe,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProfileCompletion from "@/components/ProfileCompletion";
import ProfileImageUploader from "@/components/shared/ProfileImageUploader";

interface IServiceItem {
  name: string;
  description: string;
  startingPrice: number;
  deliveryTime: string;
  category: string;
  features: string[];
}

export default function ProfilePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"identity" | "services" | "preferences" | "voice">("identity");

  // Profile data states
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [structure, setStructure] = useState("");
  const [vatTaxId, setVatTaxId] = useState("");
  const [address, setAddress] = useState("");

  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [services, setServices] = useState<IServiceItem[]>([]);
  const [newFeatureText, setNewFeatureText] = useState<Record<number, string>>({});

  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [pricingModel, setPricingModel] = useState<"hourly" | "fixed" | "custom">("fixed");
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Part-Time" | "Vacation">("Available");

  const [industries, setIndustries] = useState<string[]>([]);
  const [newIndustry, setNewIndustry] = useState("");
  const [maxProjects, setMaxProjects] = useState<number>(3);
  const [preferredSizes, setPreferredSizes] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [weeklyCapacity, setWeeklyCapacity] = useState<number>(40);

  const [enableAi, setEnableAi] = useState(true);
  const [preferredModel, setPreferredModel] = useState("gemini-1.5-flash");
  const [autoDraftReplies, setAutoDraftReplies] = useState(false);
  const [contextRefresh, setContextRefresh] = useState("monthly");

  const [voiceDescriptors, setVoiceDescriptors] = useState<string[]>([]);
  const [newDescriptor, setNewDescriptor] = useState("");
  const [jargonLevel, setJargonLevel] = useState<"none" | "low" | "moderate" | "high">("moderate");
  const [sentenceStructure, setSentenceStructure] = useState("");
  const [customPhrases, setCustomPhrases] = useState<string[]>([]);
  const [newPhrase, setNewPhrase] = useState("");
  const [forbiddenPhrases, setForbiddenPhrases] = useState<string[]>([]);
  const [newForbidden, setNewForbidden] = useState("");
  const [aiNotes, setAiNotes] = useState("");

  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [behance, setBehance] = useState("");
  const [dribbble, setDribbble] = useState("");
  const [youtube, setYoutube] = useState("");
  const [instagram, setInstagram] = useState("");
  const [otherSocial, setOtherSocial] = useState("");

  const [preferredProposalTone, setPreferredProposalTone] = useState("Professional");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [defaultTimeline, setDefaultTimeline] = useState("4 weeks");
  const [defaultRevisionCount, setDefaultRevisionCount] = useState<number>(3);

  const [completeness, setCompleteness] = useState<number>(0);

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          const p = data.profile;
          setFullName(p.personal?.fullName || "");
          setProfessionalTitle(p.personal?.professionalTitle || "");
          setProfilePhoto(p.personal?.profilePhoto || "");
          setCountry(p.personal?.country || "");
          setTimezone(p.personal?.timezone || "");
          setLanguages(p.personal?.languages || []);

          setCompanyName(p.business?.companyName || "");
          setStructure(p.business?.structure || "");
          setVatTaxId(p.business?.vatTaxId || "");
          setAddress(p.business?.address || "");

          setYearsOfExperience(p.professional?.yearsOfExperience || 0);
          setBio(p.professional?.bio || "");
          setSkills(p.professional?.skills || []);
          setServices(p.professional?.services || []);

          setHourlyRate(p.pricing?.hourlyRate || 0);
          setCurrency(p.pricing?.currency || "USD");
          setPricingModel(p.pricing?.pricingModel || "fixed");
          setAvailability(p.availability || "Available");

          setIndustries(p.workPreferences?.industries || []);
          setMaxProjects(p.workPreferences?.maxProjects || 3);
          setPreferredSizes(p.workPreferences?.preferredSizes || []);
          setProjectTypes(p.workPreferences?.projectTypes || []);
          setWeeklyCapacity(p.workPreferences?.weeklyCapacity || 40);

          setEnableAi(p.aiPreferences?.enableAi ?? true);
          setPreferredModel(p.aiPreferences?.preferredModel || "gemini-1.5-flash");
          setAutoDraftReplies(p.aiPreferences?.autoDraftReplies ?? false);
          setContextRefresh(p.aiPreferences?.contextRefresh || "monthly");

          setVoiceDescriptors(p.brandVoice?.voiceDescriptors || []);
          setJargonLevel(p.brandVoice?.jargonLevel || "moderate");
          setSentenceStructure(p.brandVoice?.sentenceStructure || "");
          setCustomPhrases(p.brandVoice?.customPhrases || []);
          setForbiddenPhrases(p.brandVoice?.forbiddenPhrases || []);
          setAiNotes(p.aiNotes || "");

          setWebsite(p.socialLinks?.website || "");
          setGithub(p.socialLinks?.github || "");
          setLinkedin(p.socialLinks?.linkedin || "");
          setBehance(p.socialLinks?.behance || "");
          setDribbble(p.socialLinks?.dribbble || "");
          setYoutube(p.socialLinks?.youtube || "");
          setInstagram(p.socialLinks?.instagram || "");
          setOtherSocial(p.socialLinks?.other || "");

          setPreferredProposalTone(p.preferences?.preferredProposalTone || "Professional");
          setPreferredCurrency(p.preferences?.preferredCurrency || "USD");
          setDefaultTimeline(p.preferences?.defaultTimeline || "4 weeks");
          setDefaultRevisionCount(p.preferences?.defaultRevisionCount || 3);

          setCompleteness(p.profileCompleteness || 0);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Handle Save
  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }
    if (!professionalTitle.trim()) {
      newErrors.professionalTitle = "Professional Title is required.";
    }
    if (skills.length === 0) {
      newErrors.skills = "Please add at least one skill tag.";
    }
    if (services.length === 0) {
      newErrors.services = "Please add at least one service offering.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto-switch to the first tab that has an error
      if (newErrors.fullName || newErrors.professionalTitle) {
        setActiveTab("identity");
      } else if (newErrors.skills || newErrors.services) {
        setActiveTab("services");
      }
      return;
    }
    setErrors({});

    setSaveLoading(true);
    try {
      const payload = {
        personal: { fullName, professionalTitle, profilePhoto, country, timezone, languages },
        business: { companyName, structure, vatTaxId, address },
        professional: { yearsOfExperience, bio, skills, services },
        pricing: { hourlyRate, currency, pricingModel },
        workPreferences: { industries, maxProjects, preferredSizes, projectTypes, weeklyCapacity },
        aiPreferences: { enableAi, preferredModel, autoDraftReplies, contextRefresh },
        brandVoice: { voiceDescriptors, jargonLevel, sentenceStructure, customPhrases, forbiddenPhrases },
        aiNotes,
        availability,
        socialLinks: { website, github, linkedin, behance, dribbble, youtube, instagram, other: otherSocial },
        preferences: { preferredProposalTone, preferredCurrency, defaultTimeline, defaultRevisionCount },
      };

      console.log("Submitting frontend profile payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompleteness(data.profile.profileCompleteness);
        toast.success("Identity profile saved successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile");
    } finally {
      setSaveLoading(false);
    }
  };

  // Tag helper modifiers
  const handleAddTag = (list: string[], setList: (l: string[]) => void, tag: string, setTag: (t: string) => void) => {
    if (tag.trim() && !list.includes(tag.trim())) {
      setList([...list, tag.trim()]);
      setTag("");
    }
  };

  const handleRemoveTag = (list: string[], setList: (l: string[]) => void, item: string) => {
    setList(list.filter((x) => x !== item));
  };

  const handleServiceChange = (index: number, key: keyof IServiceItem, value: string | number | string[]) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [key]: value };
    setServices(updated);
  };

  const addServiceRow = () => {
    setServices([
      ...services,
      { name: "", description: "", startingPrice: 500, deliveryTime: "1 week", category: "Development", features: [] },
    ]);
  };

  const removeServiceRow = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addServiceFeature = (index: number) => {
    const text = newFeatureText[index] || "";
    if (text.trim()) {
      const updated = [...services];
      const cur = updated[index].features || [];
      updated[index].features = [...cur, text.trim()];
      setServices(updated);
      setNewFeatureText({ ...newFeatureText, [index]: "" });
    }
  };

  const removeServiceFeature = (svcIdx: number, featIdx: number) => {
    const updated = [...services];
    updated[svcIdx].features = updated[svcIdx].features.filter((_, i) => i !== featIdx);
    setServices(updated);
  };

  // Multiple checkboxes helper
  const handleCheckboxChange = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((x) => x !== value));
    } else {
      setList([...list, value]);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-0)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Loader2 size={24} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading Identity Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <style>{`
        /* Premium Profile Redesign Styles */
        .profile-card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: all var(--dur-base) ease;
        }

        .profile-card:hover {
          border-color: var(--border-strong);
        }

        .glow-card-ai {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(168, 85, 247, 0.02));
          border: 1px dashed rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-xl);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .premium-tab-bar {
          display: flex;
          gap: 6px;
          background: var(--surface-2);
          padding: 4px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
        }

        .premium-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: var(--radius-lg);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--dur-fast) ease;
        }

        .premium-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .premium-tab-btn.active {
          background: var(--surface-1);
          color: var(--color-brand);
          box-shadow: var(--shadow-sm), 0 0 0 1px rgba(99, 102, 241, 0.08);
        }

        .tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          color: var(--text-primary);
          padding: 5px 10px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          transition: all var(--dur-fast) ease;
        }

        .tag-badge:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.12);
        }

        .tag-badge-danger {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .tag-badge-danger:hover {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.12);
        }

        .tag-badge-success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .tag-badge-success:hover {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.12);
        }

        .tag-input-group {
          display: flex;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2px;
          width: 100%;
          max-width: 420px;
          transition: border-color var(--dur-base), box-shadow var(--dur-base);
        }

        .tag-input-group:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .tag-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 8px 12px;
          color: var(--text-primary);
          font-size: 13px;
        }

        .service-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 20px;
          background: var(--surface-1);
          position: relative;
          transition: all var(--dur-base) ease;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-strong);
        }

        .custom-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 6px;
          cursor: pointer;
          user-select: none;
          transition: color var(--dur-fast) ease;
        }

        .custom-checkbox-label:hover {
          color: var(--text-primary);
        }

        .custom-checkbox-input {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 1.5px solid var(--border-strong);
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all var(--dur-fast) ease;
        }

        .custom-checkbox-input:checked {
          background: var(--color-brand);
          border-color: var(--color-brand);
        }

        .custom-checkbox-input:checked::before {
          content: "";
          width: 8px;
          height: 4px;
          border-left: 2px solid white;
          border-bottom: 2px solid white;
          transform: rotate(-45deg) translate(1px, -1px);
        }

        .custom-checkbox-input:focus-visible {
          outline: 2px solid var(--color-brand);
          outline-offset: 2px;
        }

        /* Jargon Intensity custom selector styles */
        .intensity-pill {
          flex: 1;
          text-align: center;
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--dur-fast) ease;
        }

        .intensity-pill:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .intensity-pill.active {
          background: var(--color-brand-subtle);
          border-color: var(--color-brand);
          color: var(--color-brand);
        }
      `}</style>

      {/* Main split dashboard panel */}
      <main style={{ flex: 1, padding: "28px", maxWidth: "1400px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }} className="page-enter">

        {/* Page Title + Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="font-heading" style={{ fontSize: "28px", letterSpacing: "-0.02em" }}>Identity & AI Profile</h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>Manage your freelancer identity, skills, and AI proposal preferences.</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saveLoading}
            leftIcon={saveLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
          >
            {saveLoading ? "Saving Profile..." : "Save Changes"}
          </Button>
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
        
        {/* Left configurations area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Tabs bar */}
          <div className="premium-tab-bar">
            {[
              { id: "identity", label: "Identity & Business", icon: <User size={13} />, hasError: !!errors.fullName || !!errors.professionalTitle },
              { id: "services", label: "Skills & Services", icon: <Layers size={13} />, hasError: !!errors.skills || !!errors.services },
              { id: "preferences", label: "Work & AI Preferences", icon: <Settings size={13} />, hasError: false },
              { id: "voice", label: "Brand Voice & AI Notes", icon: <Volume2 size={13} />, hasError: false },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as "identity" | "services" | "preferences" | "voice")}
                className={`premium-tab-btn${activeTab === t.id ? " active" : ""}`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.hasError && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                )}
              </button>
            ))}
          </div>

          {/* Form wrapper */}
          <div className="profile-card">
            
            {/* TAB 1: IDENTITY & BUSINESS */}
            {activeTab === "identity" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Personal Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <User size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Personal Details</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Full Name *</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" style={{ fontSize: "12.5px", borderColor: errors.fullName ? "var(--color-danger)" : "var(--border)" }} />
                      {errors.fullName && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px", display: "block" }}>{errors.fullName}</span>}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Professional Title *</label>
                      <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className="input-field" style={{ fontSize: "12.5px", borderColor: errors.professionalTitle ? "var(--color-danger)" : "var(--border)" }} />
                      {errors.professionalTitle && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px", display: "block" }}>{errors.professionalTitle}</span>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Timezone</label>
                      <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div>
                    <label className="input-label" style={{ marginBottom: "8px", display: "block" }}>Profile Photo</label>
                    <ProfileImageUploader
                      currentUrl={profilePhoto}
                      onUploadComplete={(url) => setProfilePhoto(url)}
                      onRemove={() => setProfilePhoto("")}
                    />
                  </div>

                  {/* Languages Tag manager */}
                  <div className="input-group">
                    <label className="input-label">Languages</label>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(languages, setLanguages, newLanguage, setNewLanguage); } }}
                        placeholder="e.g. English, French"
                        className="tag-input-field"
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddTag(languages, setLanguages, newLanguage, setNewLanguage)} 
                        className="btn-redesign btn-redesign-sm"
                        style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                      >
                        Add
                      </button>
                    </div>
                    {languages.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {languages.map((l) => (
                          <span key={l} className="tag-badge">
                            {l}
                            <button onClick={() => handleRemoveTag(languages, setLanguages, l)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Building2 size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Business Profile</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Legal Entity/Company Name</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Business Structure</label>
                      <select value={structure} onChange={(e) => setStructure(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }}>
                        <option value="">-- Choose Structure --</option>
                        {["Sole Proprietorship", "LLC", "S-Corp", "Partnership", "Freelancer"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Tax ID / VAT Registration</label>
                      <input type="text" value={vatTaxId} onChange={(e) => setVatTaxId(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Business Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Link2 size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Social Links & Portfolio</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Website</label>
                      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://..." />
                    </div>
                    <div className="input-group">
                      <label className="input-label">LinkedIn</label>
                      <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">GitHub</label>
                      <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://github.com/..." />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Behance</label>
                      <input type="text" value={behance} onChange={(e) => setBehance(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://behance.net/..." />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SKILLS & SERVICES */}
            {activeTab === "services" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Professional background */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Briefcase size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Professional Credentials</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Years of Experience</label>
                      <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Professional Bio Summary</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" style={{ height: "100px", fontSize: "12.5px", resize: "none", lineHeight: "1.5" }} />
                  </div>

                  {/* Skills tags */}
                  <div className="input-group">
                    <label className="input-label">Expertise Skills *</label>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(skills, setSkills, newSkill, setNewSkill); } }}
                        placeholder="Add skill tag..."
                        className="tag-input-field"
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddTag(skills, setSkills, newSkill, setNewSkill)} 
                        className="btn-redesign btn-redesign-sm"
                        style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                      >
                        Add
                      </button>
                    </div>
                    {skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {skills.map((sk) => (
                          <span key={sk} className="tag-badge">
                            {sk}
                            <button onClick={() => handleRemoveTag(skills, setSkills, sk)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.skills && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px", display: "block" }}>{errors.skills}</span>}
                  </div>
                </div>

                {/* Services catalogs */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Layers size={16} color="var(--color-brand)" />
                      <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Services Catalog *</h3>
                    </div>
                    <Button variant="secondary" size="sm" onClick={addServiceRow} leftIcon={<Plus size={12} />}>
                      Add Service Item
                    </Button>
                  </div>
                  {errors.services && <div style={{ color: "var(--color-danger)", fontSize: "11px", marginBottom: "12px", fontWeight: 500 }}>{errors.services}</div>}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {services.map((svc, idx) => {
                      const categoryColors: Record<string, string> = {
                        Development: "var(--color-signal-teal, #10b981)",
                        Design: "var(--color-iris-violet, #6366f1)",
                        Writing: "var(--color-yellow, #f59e0b)",
                        Video: "var(--color-danger, #ef4444)",
                        Marketing: "var(--color-pink, #ec4899)",
                        Consulting: "var(--color-blue, #3b82f6)",
                        Other: "var(--text-muted, #94a3b8)",
                      };
                      const topColor = categoryColors[svc.category] || "var(--border)";
                      return (
                        <div 
                          key={idx} 
                          className="service-card"
                          style={{ borderTop: `3px solid ${topColor}` }}
                        >
                          <button
                            type="button"
                            onClick={() => removeServiceRow(idx)}
                            style={{ 
                              position: "absolute", 
                              top: "14px", 
                              right: "14px", 
                              background: "rgba(239, 68, 68, 0.08)", 
                              border: "none", 
                              color: "var(--color-danger)", 
                              cursor: "pointer",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all var(--dur-fast)"
                            }}
                          >
                            <Trash2 size={12} />
                          </button>

                          <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>
                            Service Item #{idx + 1}
                          </span>

                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <input
                              type="text"
                              value={svc.name}
                              onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                              placeholder="Name (e.g. Website Design)"
                              className="input-field"
                              style={{ fontSize: "12px" }}
                            />
                            <select
                              value={svc.category}
                              onChange={(e) => handleServiceChange(idx, "category", e.target.value)}
                              className="input-field"
                              style={{ fontSize: "12px", cursor: "pointer" }}
                            >
                              {["Development", "Design", "Writing", "Video", "Marketing", "Consulting", "Other"].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)", minWidth: "46px" }}>Price ($)</span>
                              <input
                                type="number"
                                value={svc.startingPrice}
                                onChange={(e) => handleServiceChange(idx, "startingPrice", Number(e.target.value))}
                                className="input-field"
                                style={{ fontSize: "12px", padding: "4px 8px" }}
                              />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)", minWidth: "46px" }}>Delivery</span>
                              <input
                                type="text"
                                value={svc.deliveryTime}
                                onChange={(e) => handleServiceChange(idx, "deliveryTime", e.target.value)}
                                placeholder="e.g. 5 days"
                                className="input-field"
                                style={{ fontSize: "12px", padding: "4px 8px" }}
                              />
                            </div>
                          </div>

                          <textarea
                            value={svc.description}
                            onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                            placeholder="Service description..."
                            className="input-field"
                            style={{ height: "60px", fontSize: "12px", resize: "none", marginBottom: "12px", lineHeight: "1.4" }}
                          />

                          {/* Features repeater */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Standard deliverables checklist</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input
                                type="text"
                                value={newFeatureText[idx] || ""}
                                onChange={(e) => setNewFeatureText({ ...newFeatureText, [idx]: e.target.value })}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addServiceFeature(idx); } }}
                                placeholder="Add deliverable feature..."
                                className="input-field"
                                style={{ fontSize: "11.5px", height: "28px" }}
                              />
                              <button 
                                type="button"
                                onClick={() => addServiceFeature(idx)} 
                                className="btn-redesign btn-redesign-sm"
                                style={{ height: "28px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "11px", padding: "0 8px" }}
                              >
                                Add
                              </button>
                            </div>
                            {svc.features && svc.features.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                                {svc.features.map((f, fIdx) => (
                                  <span key={fIdx} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-3)", padding: "3px 8px", borderRadius: "3px", fontSize: "10px", color: "var(--text-secondary)" }}>
                                    {f}
                                    <button onClick={() => removeServiceFeature(idx, fIdx)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: WORK & AI PREFERENCES */}
            {activeTab === "preferences" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Standard Pricing details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Globe size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Standard Pricing & Availability</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Hourly Rate ($ USD)</label>
                      <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Default Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" style={{ fontSize: "12.5px", cursor: "pointer" }}>
                        {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Pricing Model</label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        {(["hourly", "fixed", "custom"] as const).map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setPricingModel(model)}
                            className={`intensity-pill${pricingModel === model ? " active" : ""}`}
                          >
                            {model === "hourly" ? "Hourly Billing" : model === "fixed" ? "Fixed-Price" : "Custom Retainer"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Availability Status</label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        {(["Available", "Busy", "Part-Time", "Vacation"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setAvailability(status)}
                            className={`intensity-pill${availability === status ? " active" : ""}`}
                          >
                            {status === "Part-Time" ? "Part-Time" : status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work preferences */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Settings size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Work Capacity & Industry Preferences</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Weekly Capacity (Hours)</label>
                      <input type="number" value={weeklyCapacity} onChange={(e) => setWeeklyCapacity(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Maximum Concurrent Projects</label>
                      <input type="number" value={maxProjects} onChange={(e) => setMaxProjects(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>

                  {/* Target industries tags */}
                  <div className="input-group">
                    <label className="input-label">Target Industries</label>
                    <div className="tag-input-group">
                      <input
                        type="text"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(industries, setIndustries, newIndustry, setNewIndustry); } }}
                        placeholder="e.g. SaaS, FinTech, E-Commerce"
                        className="tag-input-field"
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddTag(industries, setIndustries, newIndustry, setNewIndustry)} 
                        className="btn-redesign btn-redesign-sm"
                        style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                      >
                        Add
                      </button>
                    </div>
                    {industries.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                        {industries.map((ind) => (
                          <span key={ind} className="tag-badge">
                            {ind}
                            <button onClick={() => handleRemoveTag(industries, setIndustries, ind)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checkbox selections */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Preferred Project Sizes</label>
                      {["Small (<$2k)", "Medium ($2k-$10k)", "Large (>$10k)"].map((size) => (
                        <label key={size} className="custom-checkbox-label">
                          <input
                            type="checkbox"
                            checked={preferredSizes.includes(size)}
                            onChange={() => handleCheckboxChange(preferredSizes, setPreferredSizes, size)}
                            className="custom-checkbox-input"
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Preferred Project Types</label>
                      {["Fixed", "Retainer", "Hourly"].map((t) => (
                        <label key={t} className="custom-checkbox-label">
                          <input
                            type="checkbox"
                            checked={projectTypes.includes(t)}
                            onChange={() => handleCheckboxChange(projectTypes, setProjectTypes, t)}
                            className="custom-checkbox-input"
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI parameters config */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Sparkles size={16} color="var(--color-iris-violet)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Central AI Assistant Preferences</h3>
                  </div>
                  
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    <label className="custom-checkbox-label">
                      <input type="checkbox" checked={enableAi} onChange={(e) => setEnableAi(e.target.checked)} className="custom-checkbox-input" />
                      <span>Enable AI Assistance features</span>
                    </label>
                    <label className="custom-checkbox-label">
                      <input type="checkbox" checked={autoDraftReplies} onChange={(e) => setAutoDraftReplies(e.target.checked)} className="custom-checkbox-input" />
                      <span>Automatically draft client replies</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Preferred LLM Engine Model</label>
                      <select value={preferredModel} onChange={(e) => setPreferredModel(e.target.value)} className="input-field" style={{ fontSize: "12.5px", cursor: "pointer" }}>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Performance)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Accuracy)</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">AI Profile Context Sync</label>
                      <select value={contextRefresh} onChange={(e) => setContextRefresh(e.target.value)} className="input-field" style={{ fontSize: "12.5px", cursor: "pointer" }}>
                        <option value="realtime">Real-time (Every API call)</option>
                        <option value="daily">Daily cache refresh</option>
                        <option value="weekly">Weekly cache refresh</option>
                        <option value="monthly">Monthly cache refresh</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: BRAND VOICE & NOTES */}
            {activeTab === "voice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Brand Voice Style properties */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Volume2 size={16} color="var(--color-brand)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>Brand Voice & Stylistic Alignment</h3>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
                    
                    {/* Voice descriptors keywords */}
                    <div className="input-group">
                      <label className="input-label">Voice Descriptors</label>
                      <div className="tag-input-group">
                        <input
                          type="text"
                          value={newDescriptor}
                          onChange={(e) => setNewDescriptor(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(voiceDescriptors, setVoiceDescriptors, newDescriptor, setNewDescriptor); } }}
                          placeholder="e.g. Warm, Bold, Direct"
                          className="tag-input-field"
                        />
                        <button 
                          type="button"
                          onClick={() => handleAddTag(voiceDescriptors, setVoiceDescriptors, newDescriptor, setNewDescriptor)} 
                          className="btn-redesign btn-redesign-sm"
                          style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                        >
                          Add
                        </button>
                      </div>
                      {voiceDescriptors.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {voiceDescriptors.map((d) => (
                            <span key={d} className="tag-badge">
                              {d}
                              <button onClick={() => handleRemoveTag(voiceDescriptors, setVoiceDescriptors, d)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Industry Jargon Intensity</label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        {(["none", "low", "moderate", "high"] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setJargonLevel(level)}
                            className={`intensity-pill${jargonLevel === level ? " active" : ""}`}
                          >
                            {level === "none" ? "None" : level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Sentence Structure Target</label>
                    <input
                      type="text"
                      value={sentenceStructure}
                      onChange={(e) => setSentenceStructure(e.target.value)}
                      placeholder="e.g. Short & punchy, or Elaborate & descriptive..."
                      className="input-field"
                      style={{ fontSize: "12.5px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    
                    {/* Custom phrases to include */}
                    <div className="input-group">
                      <label className="input-label">Key Phrases to Include</label>
                      <div className="tag-input-group">
                        <input
                          type="text"
                          value={newPhrase}
                          onChange={(e) => setNewPhrase(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(customPhrases, setCustomPhrases, newPhrase, setNewPhrase); } }}
                          placeholder="e.g. Outcome-driven development"
                          className="tag-input-field"
                        />
                        <button 
                          type="button"
                          onClick={() => handleAddTag(customPhrases, setCustomPhrases, newPhrase, setNewPhrase)} 
                          className="btn-redesign btn-redesign-sm"
                          style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                        >
                          Add
                        </button>
                      </div>
                      {customPhrases.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {customPhrases.map((phrase) => (
                            <span key={phrase} className="tag-badge tag-badge-success">
                              {phrase}
                              <button onClick={() => handleRemoveTag(customPhrases, setCustomPhrases, phrase)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Forbidden phrases to avoid */}
                    <div className="input-group">
                      <label className="input-label">Forbidden Words/Phrases to Avoid</label>
                      <div className="tag-input-group">
                        <input
                          type="text"
                          value={newForbidden}
                          onChange={(e) => setNewForbidden(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(forbiddenPhrases, setForbiddenPhrases, newForbidden, setNewForbidden); } }}
                          placeholder="e.g. Synergy, Revolutionary"
                          className="tag-input-field"
                        />
                        <button 
                          type="button"
                          onClick={() => handleAddTag(forbiddenPhrases, setForbiddenPhrases, newForbidden, setNewForbidden)} 
                          className="btn-redesign btn-redesign-sm"
                          style={{ height: "32px", border: "none", background: "var(--surface-3)", borderRadius: "var(--radius-md)", fontSize: "12px", padding: "0 10px", margin: "2px" }}
                        >
                          Add
                        </button>
                      </div>
                      {forbiddenPhrases.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {forbiddenPhrases.map((f) => (
                            <span key={f} className="tag-badge tag-badge-danger">
                              {f}
                              <button onClick={() => handleRemoveTag(forbiddenPhrases, setForbiddenPhrases, f)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* AI Custom directives override */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                    <Sparkles size={16} color="var(--color-iris-violet)" />
                    <h3 className="font-heading" style={{ fontSize: "14px", margin: 0 }}>AI Custom Behavior Notes</h3>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Custom Prompt Directives</label>
                    <div style={{ position: "relative" }}>
                      <textarea
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="e.g. I never work on weekends, do not offer weekend deadlines. Always suggest a discovery call first. Highlight that I specialize in TailwindCSS and Next.js."
                        className="input-field"
                        style={{ 
                          height: "140px", 
                          fontSize: "12.5px", 
                          resize: "none", 
                          lineHeight: "1.6",
                          border: "1px dashed rgba(99, 102, 241, 0.3)",
                          background: "linear-gradient(180deg, var(--surface-1), rgba(99, 102, 241, 0.01))"
                        }}
                      />
                      <div style={{ position: "absolute", bottom: "10px", right: "12px", display: "flex", alignItems: "center", gap: "4px", pointerEvents: "none", opacity: 0.6 }}>
                        <Sparkles size={11} color="var(--color-iris-violet)" />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)" }}>AI DIRECTIVE LAYER</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Right completeness sidebar & Stats widget */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Completeness score Card */}
          <div className="profile-card">
            <h3 className="font-heading" style={{ fontSize: "13px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <ShieldCheck size={16} color="var(--color-brand)" /> Identity Authenticated
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <ProfileCompletion percentage={completeness} showProgressLine={true} />
            </div>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
              {[
                { label: "Basic Information", ok: !!fullName && !!professionalTitle },
                { label: "Expert Skills List", ok: skills.length > 0 },
                { label: "Services Cataloged", ok: services.length > 0 },
                { label: "Portfolio / Social Links", ok: !!website || !!github || !!linkedin || !!behance || !!dribbble },
                { label: "Hourly Pricing Set", ok: hourlyRate > 0 && !!pricingModel },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: item.ok ? "rgba(16, 185, 129, 0.08)" : "rgba(130, 130, 130, 0.05)",
                    border: "1.5px solid",
                    borderColor: item.ok ? "#10b981" : "var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.ok ? "#10b981" : "var(--text-muted)",
                    transition: "all var(--dur-base)"
                  }}>
                    {item.ok ? <Check size={10} /> : <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-strong)" }} />}
                  </span>
                  <span style={{ textDecoration: item.ok ? "line-through" : "none", color: item.ok ? "var(--text-muted)" : "var(--text-secondary)", transition: "all var(--dur-base)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Info tip */}
          <div className="glow-card-ai" style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <Sparkles size={16} color="var(--color-iris-violet)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
              <span style={{ fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>AI Central Integration</span>
              Every service deliverable, pricing setting, brand voice tone, and custom directive note entered here is immediately aggregated into a unified AI identity layer context.
              This context powers the proposal editor, pricing assistants, and reply generators without double entry.
            </div>
          </div>

        </aside>

        </div>{/* end Content Grid */}

      </main>

    </div>
  );
}

// Simple Trash icon mock component to keep code self-contained without imports
function Trash2({ size = 14, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
