"use client";

import { toast } from "sonner";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Loader2,
  User,
  Layers,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProfileImageUploader from "@/components/shared/ProfileImageUploader";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
interface IServiceInput {
  name: string;
  description: string;
  startingPrice: number;
  deliveryTime: string;
  category: string;
  features: string[];
}

/* ─────────────────────────────────────────────────────────────────
   Step config (defined inside function to allow JSX)
───────────────────────────────────────────────────────────────── */
const STEP_CONFIG = [
  { n: 1, label: "Basic Info",    desc: "Identity & Location",  icon: "user"    },
  { n: 2, label: "Professional",  desc: "Skills & Bio",         icon: "layers"  },
  { n: 3, label: "Services",      desc: "What You Offer",       icon: "package" },
  { n: 4, label: "Finish",        desc: "All Done!",            icon: "sparkles"},
];

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
function StepIcon({ name, size = 14 }: { name: string; size?: number }) {
  switch (name) {
    case "user":     return <User size={size} />;
    case "layers":   return <Layers size={size} />;
    case "package":  return <Package size={size} />;
    case "sparkles": return <Sparkles size={size} />;
    default:         return <Sparkles size={size} />;
  }
}

/* ─────────────────────────────────────────────────────────────────
   Wizard Component
───────────────────────────────────────────────────────────────── */
function OnboardingSetupWizard() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  /* ── State ────────────────────────────────────────────────── */
  const [step, setStep]                   = useState<number>(1);
  const [loading, setLoading]             = useState<boolean>(false);
  const [parseLoading, setParseLoading]   = useState<boolean>(false);
  const [loadDraftLoading, setLoadDraftLoading] = useState<boolean>(true);
  const [showAutofill, setShowAutofill]   = useState<boolean>(false);

  // Resume autofill text
  const [resumeText, setResumeText] = useState("");

  // Step 1 — Basic Info
  const [profilePhoto, setProfilePhoto]               = useState("");
  const [fullName, setFullName]                       = useState("");
  const [professionalTitle, setProfessionalTitle]     = useState("");
  const [country, setCountry]                         = useState("United States");
  const [timezone, setTimezone]                       = useState("EST");

  // Step 2 — Professional Details
  const [errors, setErrors]                           = useState<Record<string, string>>({});
  const [yearsOfExperience, setYearsOfExperience]     = useState<number>(3);
  const [bio, setBio]                                 = useState("");
  const [skills, setSkills]                           = useState<string[]>([]);
  const [newSkill, setNewSkill]                       = useState("");

  // Step 3 — Services
  const [services, setServices] = useState<IServiceInput[]>([
    { name: "", description: "", startingPrice: 500, deliveryTime: "1 week", category: "Development", features: [] },
  ]);
  const [newFeatureText, setNewFeatureText] = useState<Record<number, string>>({});

  // Pricing / preferences
  const [hourlyRate, setHourlyRate]         = useState<number>(50);
  const [currency, setCurrency]             = useState("USD");
  const [availability, setAvailability]     = useState<"Available" | "Busy" | "Part-Time" | "Vacation">("Available");
  const [preferredTone, setPreferredTone]   = useState("Professional");

  /* ── Load draft on mount ──────────────────────────────────── */
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          if (p) {
            setProfilePhoto(p.personal?.profilePhoto || "");
            setFullName(p.personal?.fullName || "");
            setProfessionalTitle(p.personal?.professionalTitle || "");
            setCountry(p.personal?.country || "United States");
            setTimezone(p.personal?.timezone || "EST");

            setYearsOfExperience(p.professional?.yearsOfExperience || 3);
            setBio(p.professional?.bio || "");
            setSkills(p.professional?.skills || []);

            if (p.professional?.services && p.professional.services.length > 0) {
              setServices(p.professional.services);
            }

            setHourlyRate(p.pricing?.hourlyRate || 50);
            setCurrency(p.pricing?.currency || "USD");
            setAvailability(p.availability || "Available");
            setPreferredTone(p.preferences?.preferredProposalTone || "Professional");

            // Resume furthest completed step
            if (p.professional?.services && p.professional.services.length > 0 && p.professional.services[0].name !== "") {
              setStep(4);
            } else if (p.professional?.skills && p.professional.skills.length > 0) {
              setStep(3);
            } else if (p.personal?.fullName && p.personal?.professionalTitle) {
              setStep(2);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile draft:", err);
      } finally {
        setLoadDraftLoading(false);
      }
    };
    if (session?.user?.id) {
      loadDraft();
    } else {
      setLoadDraftLoading(false);
    }
  }, [session]);

  /* ── AI Autofill ──────────────────────────────────────────── */
  const handleAutofill = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume or CV bio text first.");
      return;
    }
    setParseLoading(true);
    try {
      const res = await fetch("/api/profile/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (res.ok) {
        setFullName(data.fullName || "");
        setProfessionalTitle(data.professionalTitle || "");
        setYearsOfExperience(Number(data.yearsOfExperience) || 3);
        setBio(data.bio || "");
        if (data.skills && data.skills.length > 0)     setSkills(data.skills);
        if (data.services && data.services.length > 0) setServices(data.services);
        toast.success("AI successfully parsed details! Review and continue.");
        setShowAutofill(false);
      } else {
        toast.error(data.error || "Autofill parser failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to resume parsing API.");
    } finally {
      setParseLoading(false);
    }
  };

  /* ── Skills ───────────────────────────────────────────────── */
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (sk: string) => setSkills(skills.filter((s) => s !== sk));

  /* ── Services ─────────────────────────────────────────────── */
  const handleServiceChange = (index: number, key: keyof IServiceInput, value: string | number | string[]) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [key]: value };
    setServices(updated);
  };
  const addServiceRow = () => {
    setServices([...services, { name: "", description: "", startingPrice: 500, deliveryTime: "1 week", category: "Development", features: [] }]);
  };
  const removeServiceRow = (index: number) => {
    if (services.length === 1) return;
    setServices(services.filter((_, idx) => idx !== index));
  };
  const addServiceFeature = (index: number) => {
    const text = newFeatureText[index] || "";
    if (text.trim()) {
      const updated = [...services];
      updated[index].features = [...(updated[index].features || []), text.trim()];
      setServices(updated);
      setNewFeatureText({ ...newFeatureText, [index]: "" });
    }
  };
  const removeServiceFeature = (serviceIdx: number, featureIdx: number) => {
    const updated = [...services];
    updated[serviceIdx].features = updated[serviceIdx].features.filter((_, idx) => idx !== featureIdx);
    setServices(updated);
  };

  /* ── Save draft ───────────────────────────────────────────── */
  const saveStepDraft = async (targetStep: number) => {
    setLoading(true);
    try {
      const payload = {
        personal: { fullName, professionalTitle, profilePhoto, country, timezone, languages: ["English"] },
        professional: {
          yearsOfExperience,
          bio,
          skills,
          services: services.map((s) => ({
            ...s,
            name:        s.name        || "General Service",
            description: s.description || "Consultation and delivery",
          })),
        },
        pricing:    { hourlyRate, currency, pricingModel: "fixed" },
        brandVoice: { voiceDescriptors: [preferredTone], jargonLevel: "moderate", sentenceStructure: "Direct and Outcome-driven" },
        availability,
        preferences: { preferredProposalTone: preferredTone, preferredCurrency: currency, defaultTimeline: "4 weeks", defaultRevisionCount: 3 },
      };
      await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setStep(targetStep);
    } catch (err) {
      console.error("Auto-save draft error:", err);
      setStep(targetStep);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step validation ──────────────────────────────────────── */
  const handleNextStep = async () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!fullName.trim())          newErrors.fullName          = "Full Name is required.";
      if (!professionalTitle.trim()) newErrors.professionalTitle = "Professional Title is required.";
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setErrors({});
      await saveStepDraft(2);
    } else if (step === 2) {
      if (skills.length === 0) newErrors.skills = "Please add at least one expert skill.";
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setErrors({});
      await saveStepDraft(3);
    } else if (step === 3) {
      const hasEmpty = services.some((s) => !s.name.trim() || !s.description.trim());
      if (hasEmpty || services.length === 0) newErrors.services = "Please complete Name and Description for all service items.";
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setErrors({});
      await saveStepDraft(4);
    }
  };

  const handleContinue = () => router.push(redirectUrl);

  /* ── Loading splash ───────────────────────────────────────── */
  if (loadDraftLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-0)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={24} color="var(--color-brand)" />
          </div>
          <Loader2 size={20} color="var(--color-brand)" style={{ animation: "spin 0.85s linear infinite" }} />
          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Loading your profile...</span>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────── */
  /*   Shared style helpers                                      */
  /* ─────────────────────────────────────────────────────────── */
  const card: React.CSSProperties = {
    background:    "var(--surface-1)",
    border:        "1px solid var(--border)",
    borderRadius:  "var(--radius-lg)",
    padding:       "24px",
    boxShadow:     "var(--shadow-sm)",
    display:       "flex",
    flexDirection: "column",
    gap:           "16px",
  };

  const ig: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "6px" };

  const helperText: React.CSSProperties = {
    fontSize: "10.5px",
    color:    "var(--text-muted)",
    lineHeight: "1.4",
  };

  function CardHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
          background: "var(--color-brand-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", lineHeight: 1.4 }}>{description}</div>
        </div>
      </div>
    );
  }

  const stepPercent = Math.round((step / 4) * 100);

  /* ─────────────────────────────────────────────────────────── */
  /*   Render                                                    */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-0)" }}>

      {/* ══════════════════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════════════════ */}
      <header style={{
        position:     "sticky",
        top:          0,
        zIndex:       100,
        background:   "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        boxShadow:    "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth:       "820px",
          margin:         "0 auto",
          padding:        "0 24px",
          height:         "56px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "var(--color-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Sparkles size={13} color="var(--color-on-brand)" />
            </div>
            <span style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              FreelAI
            </span>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: "99px", padding: "2px 8px",
            }}>
              Profile Setup
            </span>
          </div>

          {/* Step counter + progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)" }}>
              Step {step} of 4
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "72px", height: "4px", background: "var(--border-strong)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width:  `${stepPercent}%`,
                  background: "var(--color-brand)",
                  borderRadius: "99px",
                  transition:  "width 600ms cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-brand)", minWidth: "32px" }}>
                {stepPercent}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          STEP STEPPER NAV
      ══════════════════════════════════════════════════════ */}
      <nav style={{
        background:   "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        padding:      "18px 24px",
      }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {STEP_CONFIG.map((s, idx) => (
              <React.Fragment key={s.n}>
                {/* Step node */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", minWidth: "80px" }}>
                  {/* Circle */}
                  <div style={{
                    width:      "38px",
                    height:     "38px",
                    borderRadius: "50%",
                    background: step > s.n ? "#10b981" : step === s.n ? "var(--color-brand)" : "var(--surface-2)",
                    border:     `2.5px solid ${step > s.n ? "#10b981" : step === s.n ? "var(--color-brand)" : "var(--border-strong)"}`,
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 300ms ease",
                    boxShadow:  step === s.n ? "0 0 0 5px var(--color-brand-subtle)" : "none",
                    flexShrink: 0,
                  }}>
                    {step > s.n ? (
                      <Check size={15} color="white" strokeWidth={2.5} />
                    ) : (
                      <span style={{ color: step === s.n ? "var(--color-on-brand)" : "var(--text-muted)", display: "flex" }}>
                        <StepIcon name={s.icon} size={14} />
                      </span>
                    )}
                  </div>
                  {/* Labels */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize:  "11.5px",
                      fontWeight: 700,
                      color:     step >= s.n ? "var(--text-primary)" : "var(--text-muted)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                    }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {s.desc}
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {idx < STEP_CONFIG.length - 1 && (
                  <div style={{
                    flex:       1,
                    height:     "2.5px",
                    marginTop:  "17px",
                    background: step > s.n ? "#10b981" : "var(--border-strong)",
                    transition: "background 400ms ease",
                    minWidth:   "16px",
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SCROLLABLE CONTENT
      ══════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, padding: "32px 24px 130px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Step page heading */}
          <div key={`hd-${step}`} className="animate-fade-in-up">
            {step === 1 && (
              <div>
                <h1 className="font-heading" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "6px" }}>
                  Build Your Identity
                </h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Your name and professional title will appear on every proposal you send to clients.
                </p>
              </div>
            )}
            {step === 2 && (
              <div>
                <h1 className="font-heading" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "6px" }}>
                  Showcase Your Expertise
                </h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Help AI understand your background to craft personalized, winning proposals on your behalf.
                </p>
              </div>
            )}
            {step === 3 && (
              <div>
                <h1 className="font-heading" style={{ fontSize: "22px", letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "6px" }}>
                  Define Your Services
                </h1>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  List what you offer to clients. AI uses this to match you with opportunities and personalize your pitches.
                </p>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────
              STEP 1 — BASIC INFO
          ───────────────────────────────────────────────── */}
          {step === 1 && (
            <div key="step-1" className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* AI Autofill Callout */}
              <div style={{
                background:   "var(--color-brand-subtle)",
                border:       "1px solid rgba(228,242,34,0.15)",
                borderRadius: "var(--radius-lg)",
                overflow:     "hidden",
              }}>
                <button
                  type="button"
                  onClick={() => setShowAutofill(!showAutofill)}
                  style={{
                    width:          "100%",
                    padding:        "14px 18px",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    background:     "none",
                    border:         "none",
                    cursor:         "pointer",
                    gap:            "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: "var(--color-brand)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Zap size={14} color="var(--color-on-brand)" />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        AI Resume Autofill
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Paste your CV or LinkedIn bio to instantly fill all fields
                      </div>
                    </div>
                  </div>
                  {showAutofill
                    ? <ChevronUp size={15} color="var(--text-muted)" />
                    : <ChevronDown size={15} color="var(--text-muted)" />
                  }
                </button>

                {showAutofill && (
                  <div style={{ padding: "0 18px 16px" }}>
                    <div style={{ height: "1px", background: "var(--border)", marginBottom: "14px" }} />
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume, CV, or LinkedIn bio text here..."
                      className="input-field"
                      style={{ height: "104px", fontSize: "12.5px", resize: "none", lineHeight: "1.5", marginBottom: "10px" }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAutofill}
                      disabled={parseLoading}
                      leftIcon={parseLoading
                        ? <Loader2 size={12} style={{ animation: "spin 0.85s linear infinite" }} />
                        : <Sparkles size={12} />
                      }
                    >
                      {parseLoading ? "Parsing CV..." : "Autofill All Fields"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Photo Card */}
              <div style={card}>
                <CardHeader
                  icon={<User size={16} color="var(--color-brand)" />}
                  title="Profile Photo"
                  description="A professional photo builds trust with clients and personalizes your proposals."
                />
                <ProfileImageUploader
                  currentUrl={profilePhoto}
                  onUploadComplete={(url) => setProfilePhoto(url)}
                  onRemove={() => setProfilePhoto("")}
                />
              </div>

              {/* Personal Details Card */}
              <div style={card}>
                <CardHeader
                  icon={<User size={16} color="var(--color-brand)" />}
                  title="Personal Details"
                  description="Your name and title appear on every proposal and client-facing material."
                />

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                  <div style={ig}>
                    <label className="input-label">
                      Full Name <span style={{ color: "var(--color-coral-red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Liam Foster"
                      className="input-field"
                      style={{ fontSize: "13px", borderColor: errors.fullName ? "var(--color-coral-red)" : undefined }}
                    />
                    {errors.fullName && (
                      <span style={{ color: "var(--color-coral-red)", fontSize: "11px", fontWeight: 500 }}>
                        {errors.fullName}
                      </span>
                    )}
                  </div>
                  <div style={ig}>
                    <label className="input-label">
                      Professional Title <span style={{ color: "var(--color-coral-red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. Senior Copywriter"
                      className="input-field"
                      style={{ fontSize: "13px", borderColor: errors.professionalTitle ? "var(--color-coral-red)" : undefined }}
                    />
                    {errors.professionalTitle
                      ? <span style={{ color: "var(--color-coral-red)", fontSize: "11px", fontWeight: 500 }}>{errors.professionalTitle}</span>
                      : <span style={helperText}>Appears on every proposal you send</span>
                    }
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={ig}>
                    <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Globe size={11} style={{ flexShrink: 0 }} /> Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="input-field"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                  <div style={ig}>
                    <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Clock size={11} style={{ flexShrink: 0 }} /> Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g. EST, GMT+5:30"
                      className="input-field"
                      style={{ fontSize: "13px" }}
                    />
                    <span style={helperText}>Used to coordinate with clients</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────
              STEP 2 — PROFESSIONAL DETAILS
          ───────────────────────────────────────────────── */}
          {step === 2 && (
            <div key="step-2" className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Professional Background Card */}
              <div style={card}>
                <CardHeader
                  icon={<Sparkles size={16} color="var(--color-brand)" />}
                  title="Professional Background"
                  description="Your experience and bio are used by AI to craft personalized proposals in your voice."
                />

                <div style={ig}>
                  <label className="input-label">Years of Experience</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                      className="input-field"
                      style={{ fontSize: "13px", maxWidth: "140px" }}
                    />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>years in the industry</span>
                  </div>
                </div>

                <div style={ig}>
                  <label className="input-label">Bio Summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about your background and what makes you stand out..."
                    className="input-field"
                    style={{ height: "96px", fontSize: "13px", resize: "none", lineHeight: "1.55" }}
                  />
                  <span style={helperText}>Used as context for AI-generated proposals. Keep it punchy and outcome-focused.</span>
                </div>
              </div>

              {/* Skills Card */}
              <div style={card}>
                <CardHeader
                  icon={<Layers size={16} color="var(--color-brand)" />}
                  title="Expert Skills"
                  description="Add your core skills — press Enter after each one. At least one is required."
                />

                <div style={ig}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder="e.g. Next.js, Figma, SEO — press Enter to add"
                      className="input-field"
                      style={{ fontSize: "13px", borderColor: errors.skills ? "var(--color-coral-red)" : undefined }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      style={{
                        width: "40px", height: "40px", flexShrink: 0,
                        background:   "var(--surface-2)",
                        border:       "1px solid var(--border-strong)",
                        borderRadius: "var(--radius)",
                        cursor:       "pointer",
                        display:      "flex", alignItems: "center", justifyContent: "center",
                        color:        "var(--text-secondary)",
                        transition:   "all 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background    = "var(--color-brand)";
                        e.currentTarget.style.color         = "var(--color-on-brand)";
                        e.currentTarget.style.borderColor   = "var(--color-brand)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background    = "var(--surface-2)";
                        e.currentTarget.style.color         = "var(--text-secondary)";
                        e.currentTarget.style.borderColor   = "var(--border-strong)";
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {skills.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "4px" }}>
                      {skills.map((sk) => (
                        <span
                          key={sk}
                          style={{
                            display:      "inline-flex",
                            alignItems:   "center",
                            gap:          "6px",
                            background:   "var(--surface-2)",
                            border:       "1px solid var(--border-strong)",
                            padding:      "5px 11px",
                            borderRadius: "99px",
                            fontSize:     "12px",
                            fontWeight:   600,
                            color:        "var(--text-primary)",
                          }}
                        >
                          {sk}
                          <button
                            type="button"
                            onClick={() => removeSkill(sk)}
                            style={{
                              background: "none", border: "none",
                              color: "var(--text-muted)", cursor: "pointer",
                              display: "flex", alignItems: "center",
                              padding: "1px", borderRadius: "50%",
                              transition: "color 150ms ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-coral-red)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      border:       "1.5px dashed var(--border-strong)",
                      borderRadius: "var(--radius-lg)",
                      padding:      "22px 20px",
                      textAlign:    "center",
                    }}>
                      <Layers size={20} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                      <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        Start typing your skills above.<br />
                        <span style={{ color: "var(--text-subtle)" }}>e.g. &quot;React&quot;, &quot;UX Writing&quot;, &quot;Figma&quot;</span>
                      </p>
                    </div>
                  )}

                  {errors.skills && (
                    <span style={{ color: "var(--color-coral-red)", fontSize: "11.5px", fontWeight: 500 }}>
                      {errors.skills}
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────
              STEP 3 — SERVICES CATALOG
          ───────────────────────────────────────────────── */}
          {step === 3 && (
            <div key="step-3" className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {errors.services && (
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                  background:   "rgba(235,87,87,0.08)",
                  border:       "1px solid rgba(235,87,87,0.25)",
                  borderRadius: "var(--radius)",
                  padding:      "12px 16px",
                  fontSize:     "13px",
                  color:        "var(--color-coral-red)",
                  fontWeight:   500,
                }}>
                  {errors.services}
                </div>
              )}

              {services.map((svc, idx) => (
                <div key={idx} style={{ ...card, gap: "14px" }}>

                  {/* Service card header */}
                  <div style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    paddingBottom:  "14px",
                    borderBottom:   "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "8px",
                        background:  "var(--color-brand-subtle)",
                        border:      "1px solid rgba(228,242,34,0.15)",
                        display:     "flex", alignItems: "center", justifyContent: "center",
                        fontSize:    "12px", fontWeight: 700, color: "var(--color-brand)",
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {svc.name || `Service #${idx + 1}`}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                          {svc.category} · {svc.deliveryTime || "Delivery TBD"}
                        </div>
                      </div>
                    </div>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceRow(idx)}
                        style={{
                          display:      "flex", alignItems: "center", gap: "5px",
                          background:   "rgba(235,87,87,0.08)",
                          border:       "1px solid rgba(235,87,87,0.2)",
                          borderRadius: "var(--radius)",
                          padding:      "5px 10px",
                          cursor:       "pointer",
                          fontSize:     "11.5px", fontWeight: 600, color: "var(--color-coral-red)",
                          transition:   "background 150ms ease",
                        }}
                      >
                        <X size={11} /> Remove
                      </button>
                    )}
                  </div>

                  {/* Service fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                    <div style={ig}>
                      <label className="input-label">Service Name *</label>
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                        placeholder="e.g. Full-Stack Web Development"
                        className="input-field"
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                    <div style={ig}>
                      <label className="input-label">Category</label>
                      <select
                        value={svc.category}
                        onChange={(e) => handleServiceChange(idx, "category", e.target.value)}
                        className="input-field"
                        style={{ fontSize: "13px" }}
                      >
                        {["Development", "Design", "Writing", "Video", "Marketing", "Consulting", "Other"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={ig}>
                      <label className="input-label">Starting Price (USD)</label>
                      <input
                        type="number"
                        value={svc.startingPrice}
                        onChange={(e) => handleServiceChange(idx, "startingPrice", Number(e.target.value))}
                        className="input-field"
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                    <div style={ig}>
                      <label className="input-label">Delivery Time</label>
                      <input
                        type="text"
                        value={svc.deliveryTime}
                        onChange={(e) => handleServiceChange(idx, "deliveryTime", e.target.value)}
                        placeholder="e.g. 5 days, 2 weeks"
                        className="input-field"
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <div style={ig}>
                    <label className="input-label">Description *</label>
                    <textarea
                      value={svc.description}
                      onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                      placeholder="What does this service include? What are the outcomes for the client?"
                      className="input-field"
                      style={{ height: "80px", fontSize: "13px", resize: "none", lineHeight: "1.55" }}
                    />
                    <span style={helperText}>AI uses this to match services with client job posts.</span>
                  </div>

                  {/* Deliverables */}
                  <div style={ig}>
                    <label className="input-label">Deliverables / Features</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={newFeatureText[idx] || ""}
                        onChange={(e) => setNewFeatureText({ ...newFeatureText, [idx]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addServiceFeature(idx); } }}
                        placeholder="Add deliverable and press Enter..."
                        className="input-field"
                        style={{ fontSize: "12.5px" }}
                      />
                      <Button variant="secondary" size="sm" onClick={() => addServiceFeature(idx)}>
                        Add
                      </Button>
                    </div>
                    {svc.features && svc.features.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "4px" }}>
                        {svc.features.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              display:      "inline-flex", alignItems: "center", gap: "5px",
                              background:   "var(--surface-2)",
                              border:       "1px solid var(--border)",
                              padding:      "3px 9px",
                              borderRadius: "4px",
                              fontSize:     "11.5px", color: "var(--text-secondary)",
                            }}
                          >
                            {f}
                            <button
                              type="button"
                              onClick={() => removeServiceFeature(idx, fIdx)}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, display: "flex" }}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add service button */}
              {services.length < 3 && (
                <button
                  type="button"
                  onClick={addServiceRow}
                  style={{
                    display:        "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding:        "18px",
                    background:     "var(--surface-1)",
                    border:         "1.5px dashed var(--border-strong)",
                    borderRadius:   "var(--radius-lg)",
                    cursor:         "pointer",
                    fontSize:       "13px", fontWeight: 600, color: "var(--text-muted)",
                    transition:     "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-brand)";
                    e.currentTarget.style.color       = "var(--text-primary)";
                    e.currentTarget.style.background  = "var(--color-brand-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.color       = "var(--text-muted)";
                    e.currentTarget.style.background  = "var(--surface-1)";
                  }}
                >
                  <Plus size={15} />
                  Add Another Service
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                    ({3 - services.length} remaining)
                  </span>
                </button>
              )}

            </div>
          )}

          {/* ─────────────────────────────────────────────────
              STEP 4 — FINISH / SUCCESS
          ───────────────────────────────────────────────── */}
          {step === 4 && (
            <div key="step-4" className="animate-fade-in-up">
              <div style={{
                ...card,
                alignItems:  "center",
                textAlign:   "center",
                padding:     "52px 32px",
                gap:         "20px",
              }}>
                {/* Green success ring */}
                <div style={{
                  width:          "72px",
                  height:         "72px",
                  borderRadius:   "50%",
                  background:     "rgba(16,185,129,0.1)",
                  border:         "2.5px solid #10b981",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  marginBottom:   "4px",
                }}>
                  <Check size={32} color="#10b981" strokeWidth={2.5} />
                </div>

                <div>
                  <h2 className="font-heading" style={{ fontSize: "21px", color: "var(--text-primary)", marginBottom: "10px" }}>
                    Your Freelancer Profile is Ready! 🎉
                  </h2>
                  <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "380px", lineHeight: "1.6", margin: "0 auto" }}>
                    Your professional brand voice, skills, services, and rates are now saved.
                    AI-powered proposals and matching are live.
                  </p>
                </div>

                {/* Summary chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  {[
                    { label: fullName || "Identity Set",                       show: true },
                    { label: `${skills.length} Skill${skills.length !== 1 ? "s" : ""}`, show: skills.length > 0 },
                    { label: `${services.filter(s => s.name).length} Service${services.filter(s => s.name).length !== 1 ? "s" : ""}`, show: services.some(s => s.name) },
                  ].filter(item => item.show).map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display:    "flex", alignItems: "center", gap: "6px",
                        background: "rgba(16,185,129,0.1)",
                        border:     "1px solid rgba(16,185,129,0.3)",
                        borderRadius: "99px",
                        padding:    "5px 13px",
                        fontSize:   "12px", fontWeight: 600, color: "#10b981",
                      }}
                    >
                      <Check size={11} strokeWidth={2.5} />
                      {item.label}
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={handleContinue}
                  rightIcon={<ArrowRight size={14} />}
                  style={{ marginTop: "8px", minWidth: "200px" }}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══════════════════════════════════════════════════════
          STICKY FOOTER (hidden on final step)
      ══════════════════════════════════════════════════════ */}
      {step < 4 && (
        <footer style={{
          position:     "sticky",
          bottom:       0,
          background:   "var(--surface-1)",
          borderTop:    "1px solid var(--border)",
          padding:      "14px 24px",
          display:      "flex",
          alignItems:   "center",
          gap:          "16px",
          zIndex:       100,
          boxShadow:    "0 -2px 20px rgba(0,0,0,0.1)",
        }}>
          {/* Left: progress info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Setup Progress
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "90px", height: "5px", background: "var(--border-strong)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height:     "100%",
                  width:      `${stepPercent}%`,
                  background: "var(--color-brand)",
                  borderRadius: "99px",
                  transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                {stepPercent}% Complete
              </span>
            </div>
          </div>

          {/* Right: nav actions */}
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => { setErrors({}); setStep(step - 1); }}
                leftIcon={<ArrowLeft size={13} />}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={loading}
              rightIcon={
                loading
                  ? <Loader2 size={13} style={{ animation: "spin 0.85s linear infinite" }} />
                  : <ArrowRight size={13} />
              }
            >
              {loading
                ? "Saving..."
                : step === 1 ? "Continue to Skills"
                : step === 2 ? "Continue to Services"
                : "Finish Setup"}
            </Button>
          </div>
        </footer>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Page export with Suspense boundary
───────────────────────────────────────────────────────────────── */
export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} color="var(--color-brand)" style={{ animation: "spin 0.85s linear infinite" }} />
      </div>
    }>
      <OnboardingSetupWizard />
    </Suspense>
  );
}
