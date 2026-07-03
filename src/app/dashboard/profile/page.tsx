"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProfileCompletion from "@/components/ProfileCompletion";

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
        alert("Identity profile saved successfully!");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
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
    <div style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
      
      {/* Header bar */}
      <header style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}>
          <ChevronLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={13} color="var(--color-brand)" />
          </div>
          <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>Identity & AI Profile</h1>
        </div>

        <div style={{ flex: 1 }} />

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saveLoading}
          leftIcon={saveLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
        >
          {saveLoading ? "Saving Profile..." : "Save Changes"}
        </Button>
      </header>

      {/* Main split dashboard panel */}
      <main style={{ flex: 1, padding: "24px", maxWidth: "1400px", width: "100%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
        
        {/* Left configurations area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Tabs bar */}
          <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            {[
              { id: "identity", label: "Identity & Business", icon: <User size={13} />, hasError: !!errors.fullName || !!errors.professionalTitle },
              { id: "services", label: "Skills & Services", icon: <Layers size={13} />, hasError: !!errors.skills || !!errors.services },
              { id: "preferences", label: "Work & AI Preferences", icon: <Settings size={13} />, hasError: false },
              { id: "voice", label: "Brand Voice & AI Notes", icon: <Volume2 size={13} />, hasError: false },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as "identity" | "services" | "preferences" | "voice")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: activeTab === t.id ? "var(--surface-1)" : "transparent",
                  color: activeTab === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                  cursor: "pointer",
                  boxShadow: activeTab === t.id ? "var(--shadow-sm)" : "none",
                }}
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
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" }}>
            
            {/* TAB 1: IDENTITY & BUSINESS */}
            {activeTab === "identity" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Personal Section */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Personal Details</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Full Name *</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" style={{ fontSize: "12.5px", borderColor: errors.fullName ? "var(--color-danger)" : "var(--border)" }} />
                      {errors.fullName && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px" }}>{errors.fullName}</span>}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Professional Title *</label>
                      <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className="input-field" style={{ fontSize: "12.5px", borderColor: errors.professionalTitle ? "var(--color-danger)" : "var(--border)" }} />
                      {errors.professionalTitle && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px" }}>{errors.professionalTitle}</span>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Timezone</label>
                      <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Profile Photo URL</label>
                      <input type="text" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://..." />
                    </div>
                    
                    {/* Languages Tag manager */}
                    <div className="input-group">
                      <label className="input-label">Languages</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(languages, setLanguages, newLanguage, setNewLanguage); } }}
                          placeholder="e.g. English, French"
                          className="input-field"
                          style={{ fontSize: "12.5px", height: "34px" }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleAddTag(languages, setLanguages, newLanguage, setNewLanguage)} style={{ height: "34px" }}>
                          Add
                        </Button>
                      </div>
                      {languages.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                          {languages.map((l) => (
                            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              {l}
                              <button onClick={() => handleRemoveTag(languages, setLanguages, l)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Section */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Business Profile</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
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
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Social Links & Portfolio</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Website</label>
                      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://..." />
                    </div>
                    <div className="input-group">
                      <label className="input-label">LinkedIn</label>
                      <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Professional background */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Professional Credentials</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Years of Experience</label>
                      <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: "12px" }}>
                    <label className="input-label">Professional Bio Summary</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" style={{ height: "80px", fontSize: "12.5px", resize: "none", lineHeight: "1.4" }} />
                  </div>

                  {/* Skills tags */}
                  <div className="input-group">
                    <label className="input-label">Expertise Skills *</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(skills, setSkills, newSkill, setNewSkill); } }}
                        placeholder="Add skill tag..."
                        className="input-field"
                        style={{ fontSize: "12.5px", height: "34px" }}
                      />
                      <Button variant="secondary" size="sm" onClick={() => handleAddTag(skills, setSkills, newSkill, setNewSkill)} style={{ height: "34px" }}>
                        Add
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {skills.map((sk) => (
                          <span key={sk} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                            {sk}
                            <button onClick={() => handleRemoveTag(skills, setSkills, sk)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.skills && <span style={{ color: "var(--color-danger)", fontSize: "11px", marginTop: "4px" }}>{errors.skills}</span>}
                  </div>
                </div>

                {/* Services catalogs */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>
                    <h3 className="font-heading" style={{ fontSize: "14px" }}>Services Catalog *</h3>
                    <Button variant="secondary" size="sm" onClick={addServiceRow} leftIcon={<Plus size={12} />}>
                      Add Service Item
                    </Button>
                  </div>
                  {errors.services && <div style={{ color: "var(--color-danger)", fontSize: "11px", marginBottom: "12px", fontWeight: 500 }}>{errors.services}</div>}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {services.map((svc, idx) => (
                      <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--surface-2)", position: "relative" }}>
                        <button
                          onClick={() => removeServiceRow(idx)}
                          style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                        >
                          <Trash2 size={13} />
                        </button>

                        <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                          Service Item #{idx + 1}
                        </span>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
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
                            style={{ fontSize: "12px" }}
                          >
                            {["Development", "Design", "Writing", "Video", "Marketing", "Consulting", "Other"].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Price ($)</span>
                            <input
                              type="number"
                              value={svc.startingPrice}
                              onChange={(e) => handleServiceChange(idx, "startingPrice", Number(e.target.value))}
                              className="input-field"
                              style={{ fontSize: "12px", padding: "4px 8px" }}
                            />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Delivery</span>
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
                          style={{ height: "60px", fontSize: "12px", resize: "none", marginBottom: "10px", lineHeight: "1.4" }}
                        />

                        {/* Features repeater */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 600 }}>Standard deliverables checklist</span>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              value={newFeatureText[idx] || ""}
                              onChange={(e) => setNewFeatureText({ ...newFeatureText, [idx]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addServiceFeature(idx); } }}
                              placeholder="Add deliverable feature..."
                              className="input-field"
                              style={{ fontSize: "11.5px", height: "26px" }}
                            />
                            <Button variant="secondary" size="sm" onClick={() => addServiceFeature(idx)} style={{ height: "26px" }}>
                              Add
                            </Button>
                          </div>
                          {svc.features && svc.features.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                              {svc.features.map((f, fIdx) => (
                                <span key={fIdx} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-3)", padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>
                                  {f}
                                  <button onClick={() => removeServiceFeature(idx, fIdx)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                    <X size={9} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: WORK & AI PREFERENCES */}
            {activeTab === "preferences" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Standard Pricing details */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Standard Pricing & Availability</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Hourly Rate ($ USD)</label>
                      <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="input-field" style={{ fontSize: "12.5px" }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Default Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }}>
                        {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Pricing Model</label>
                      <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value as "hourly" | "fixed" | "custom")} className="input-field" style={{ fontSize: "12.5px" }}>
                        <option value="hourly">Hourly Billing</option>
                        <option value="fixed">Fixed-Price milestones</option>
                        <option value="custom">Custom Retainers</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Availability Status</label>
                      <select value={availability} onChange={(e) => setAvailability(e.target.value as "Available" | "Busy" | "Part-Time" | "Vacation")} className="input-field" style={{ fontSize: "12.5px" }}>
                        <option value="Available">Available (Open for work)</option>
                        <option value="Busy">Busy (No bandwidth)</option>
                        <option value="Part-Time">Part-Time availability</option>
                        <option value="Vacation">On Vacation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Work preferences */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Work Capacity & Industry Preferences</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
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
                  <div className="input-group" style={{ marginBottom: "14px" }}>
                    <label className="input-label">Target Industries</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(industries, setIndustries, newIndustry, setNewIndustry); } }}
                        placeholder="e.g. SaaS, FinTech, E-Commerce"
                        className="input-field"
                        style={{ fontSize: "12.5px", height: "34px" }}
                      />
                      <Button variant="secondary" size="sm" onClick={() => handleAddTag(industries, setIndustries, newIndustry, setNewIndustry)} style={{ height: "34px" }}>
                        Add
                      </Button>
                    </div>
                    {industries.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {industries.map((ind) => (
                          <span key={ind} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                            {ind}
                            <button onClick={() => handleRemoveTag(industries, setIndustries, ind)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checkbox selections */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Preferred Project Sizes</label>
                      {["Small (<$2k)", "Medium ($2k-$10k)", "Large (>$10k)"].map((size) => (
                        <label key={size} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={preferredSizes.includes(size)}
                            onChange={() => handleCheckboxChange(preferredSizes, setPreferredSizes, size)}
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                    <div className="input-group">
                      <label className="input-label">Preferred Project Types</label>
                      {["Fixed", "Retainer", "Hourly"].map((t) => (
                        <label key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={projectTypes.includes(t)}
                            onChange={() => handleCheckboxChange(projectTypes, setProjectTypes, t)}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI parameters config */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Central AI Assistant Preferences</h3>
                  
                  <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-primary)", cursor: "pointer" }}>
                      <input type="checkbox" checked={enableAi} onChange={(e) => setEnableAi(e.target.checked)} />
                      <span>Enable AI Assistance features</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-primary)", cursor: "pointer" }}>
                      <input type="checkbox" checked={autoDraftReplies} onChange={(e) => setAutoDraftReplies(e.target.checked)} />
                      <span>Automatically draft client replies</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="input-group">
                      <label className="input-label">Preferred LLM Engine Model</label>
                      <select value={preferredModel} onChange={(e) => setPreferredModel(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }}>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Performance)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Accuracy)</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">AI Profile Context Sync</label>
                      <select value={contextRefresh} onChange={(e) => setContextRefresh(e.target.value)} className="input-field" style={{ fontSize: "12.5px" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Brand Voice Style properties */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>Brand Voice & Stylistic Alignment</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    
                    {/* Voice descriptors keywords */}
                    <div className="input-group">
                      <label className="input-label">Voice Descriptors</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={newDescriptor}
                          onChange={(e) => setNewDescriptor(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(voiceDescriptors, setVoiceDescriptors, newDescriptor, setNewDescriptor); } }}
                          placeholder="e.g. Warm, Bold, Direct"
                          className="input-field"
                          style={{ fontSize: "12.5px", height: "34px" }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleAddTag(voiceDescriptors, setVoiceDescriptors, newDescriptor, setNewDescriptor)} style={{ height: "34px" }}>
                          Add
                        </Button>
                      </div>
                      {voiceDescriptors.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                          {voiceDescriptors.map((d) => (
                            <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                              {d}
                              <button onClick={() => handleRemoveTag(voiceDescriptors, setVoiceDescriptors, d)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Industry Jargon Intensity</label>
                      <select value={jargonLevel} onChange={(e) => setJargonLevel(e.target.value as "none" | "low" | "moderate" | "high")} className="input-field" style={{ fontSize: "12.5px" }}>
                        <option value="none">No Jargon (Plain layperson English)</option>
                        <option value="low">Low (Clear and approachable)</option>
                        <option value="moderate">Moderate (Standard industry terms)</option>
                        <option value="high">High (Deeply technical/niche terms)</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: "14px" }}>
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    
                    {/* Custom phrases to include */}
                    <div className="input-group">
                      <label className="input-label">Key Phrases to Include</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={newPhrase}
                          onChange={(e) => setNewPhrase(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(customPhrases, setCustomPhrases, newPhrase, setNewPhrase); } }}
                          placeholder="e.g. Outcome-driven development"
                          className="input-field"
                          style={{ fontSize: "12px", height: "34px" }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleAddTag(customPhrases, setCustomPhrases, newPhrase, setNewPhrase)} style={{ height: "34px" }}>
                          Add
                        </Button>
                      </div>
                      {customPhrases.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "4px" }}>
                          {customPhrases.map((phrase) => (
                            <span key={phrase} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "3px", fontSize: "10.5px" }}>
                              {phrase}
                              <button onClick={() => handleRemoveTag(customPhrases, setCustomPhrases, phrase)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Forbidden phrases to avoid */}
                    <div className="input-group">
                      <label className="input-label">Forbidden Words/Phrases to Avoid</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={newForbidden}
                          onChange={(e) => setNewForbidden(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(forbiddenPhrases, setForbiddenPhrases, newForbidden, setNewForbidden); } }}
                          placeholder="e.g. Synergy, Revolutionary"
                          className="input-field"
                          style={{ fontSize: "12px", height: "34px" }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => handleAddTag(forbiddenPhrases, setForbiddenPhrases, newForbidden, setNewForbidden)} style={{ height: "34px" }}>
                          Add
                        </Button>
                      </div>
                      {forbiddenPhrases.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "4px" }}>
                          {forbiddenPhrases.map((f) => (
                            <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "3px", fontSize: "10.5px" }}>
                              {f}
                              <button onClick={() => handleRemoveTag(forbiddenPhrases, setForbiddenPhrases, f)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* AI Custom directives override */}
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "14px" }}>AI Custom Behavior Notes</h3>
                  <div className="input-group">
                    <label className="input-label">Custom Prompt Directives</label>
                    <textarea
                      value={aiNotes}
                      onChange={(e) => setAiNotes(e.target.value)}
                      placeholder="e.g. I never work on weekends, do not offer weekend deadlines. Always suggest a standard discovery video call first. Highlight that I specialize in TailwindCSS and next.js."
                      className="input-field"
                      style={{ height: "130px", fontSize: "12.5px", resize: "none", lineHeight: "1.5" }}
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Right completeness sidebar & Stats widget */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Completeness score Card */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
            <h3 className="font-heading" style={{ fontSize: "13px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <ShieldCheck size={14} color="var(--color-brand)" /> Identity Authenticated
            </h3>
            
            <div style={{ marginBottom: "16px" }}>
              <ProfileCompletion percentage={completeness} showProgressLine={true} />
            </div>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11.5px", color: "var(--text-secondary)" }}>
              {[
                { label: "Basic Information", ok: !!fullName && !!professionalTitle },
                { label: "Expert Skills List", ok: skills.length > 0 },
                { label: "Services Cataloged", ok: services.length > 0 },
                { label: "Portfolio / Social Links", ok: !!website || !!github || !!linkedin || !!behance || !!dribbble },
                { label: "Hourly Pricing Set", ok: hourlyRate > 0 && !!pricingModel },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: item.ok ? "rgba(16,185,129,0.1)" : "rgba(130,130,130,0.1)",
                    border: "1px solid",
                    borderColor: item.ok ? "#10b981" : "var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.ok ? "#10b981" : "var(--text-muted)",
                  }}>
                    {item.ok && <Check size={8} />}
                  </span>
                  <span style={{ textDecoration: item.ok ? "line-through" : "none", color: item.ok ? "var(--text-muted)" : "var(--text-secondary)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Info tip */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px", display: "flex", gap: "10px", alignItems: "start" }}>
            <Sparkles size={16} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "11.5px", lineHeight: "1.45" }}>
              <span style={{ fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>AI Central Integration</span>
              Every service deliverable, pricing setting, brand voice tone, and custom directive note entered here is immediately aggregated into a unified AI identity layer context.
              This context powers the proposal editor, pricing assistants, and reply generators without double entry.
            </div>
          </div>

        </aside>

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
