"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface IServiceInput {
  name: string;
  description: string;
  startingPrice: number;
  deliveryTime: string;
  category: string;
  features: string[];
}

function OnboardingSetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [parseLoading, setParseLoading] = useState<boolean>(false);
  const [loadDraftLoading, setLoadDraftLoading] = useState<boolean>(true);

  // Resume raw text
  const [resumeText, setResumeText] = useState("");

  // Step 1 Form States: Basic Information
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [country, setCountry] = useState("United States");
  const [timezone, setTimezone] = useState("EST");

  // Step 2 Form States: Professional Details
  const [primaryProfession, setPrimaryProfession] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Step 3 Form States: Services
  const [services, setServices] = useState<IServiceInput[]>([
    {
      name: "",
      description: "",
      startingPrice: 500,
      deliveryTime: "1 week",
      category: "Development",
      features: [],
    },
  ]);
  const [newFeatureText, setNewFeatureText] = useState<Record<number, string>>({});

  // Pricing default overrides
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  const [currency, setCurrency] = useState("USD");
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Part-Time" | "Vacation">("Available");
  const [preferredTone, setPreferredTone] = useState("Professional");

  // On mount: fetch existing profile to load as draft
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.profile;
          if (p) {
            setFullName(p.personal?.fullName || "");
            setProfessionalTitle(p.personal?.professionalTitle || "");
            setCountry(p.personal?.country || "United States");
            setTimezone(p.personal?.timezone || "EST");

            setPrimaryProfession(p.professional?.primaryProfession || "");
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

            // Resume furthest step
            if (p.professional?.services && p.professional.services.length > 0 && p.professional.services[0].name !== "") {
              setStep(4);
            } else if (p.professional?.skills && p.professional.skills.length > 0) {
              setStep(3);
            } else if (p.personal?.fullName && p.professional?.primaryProfession) {
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

  // AI Autofill from Resume text
  const handleAutofill = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume or CV bio text first.");
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
        setPrimaryProfession(data.primaryProfession || "");
        setYearsOfExperience(Number(data.yearsOfExperience) || 3);
        setBio(data.bio || "");
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills);
        }
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        }
        alert("AI successfully parsed details! Proceeding to verify basic details.");
      } else {
        alert(data.error || "Autofill parser failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to resume parsing API.");
    } finally {
      setParseLoading(false);
    }
  };

  // Add skill tag
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter((s) => s !== sk));
  };

  // Service list modifiers
  const handleServiceChange = (index: number, key: keyof IServiceInput, value: string | number | string[]) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [key]: value };
    setServices(updated);
  };

  const addServiceRow = () => {
    setServices([
      ...services,
      {
        name: "",
        description: "",
        startingPrice: 500,
        deliveryTime: "1 week",
        category: primaryProfession || "Development",
        features: [],
      },
    ]);
  };

  const removeServiceRow = (index: number) => {
    if (services.length === 1) return;
    setServices(services.filter((_, idx) => idx !== index));
  };

  // Service features helper
  const addServiceFeature = (index: number) => {
    const text = newFeatureText[index] || "";
    if (text.trim()) {
      const updated = [...services];
      const currentFeatures = updated[index].features || [];
      updated[index].features = [...currentFeatures, text.trim()];
      setServices(updated);
      setNewFeatureText({ ...newFeatureText, [index]: "" });
    }
  };

  const removeServiceFeature = (serviceIdx: number, featureIdx: number) => {
    const updated = [...services];
    updated[serviceIdx].features = updated[serviceIdx].features.filter((_, idx) => idx !== featureIdx);
    setServices(updated);
  };

  // Save draft progress after each step completes
  const saveStepDraft = async (targetStep: number) => {
    setLoading(true);
    try {
      const payload = {
        personal: {
          fullName,
          professionalTitle,
          country,
          timezone,
          languages: ["English"],
        },
        professional: {
          primaryProfession: primaryProfession || "Freelancer",
          yearsOfExperience,
          bio,
          skills,
          services: services.map((s) => ({
            ...s,
            name: s.name || "General Service",
            description: s.description || "Consultation and delivery",
          })),
        },
        pricing: {
          hourlyRate,
          currency,
          pricingModel: "fixed",
        },
        brandVoice: {
          voiceDescriptors: [preferredTone],
          jargonLevel: "moderate",
          sentenceStructure: "Direct and Outcome-driven",
        },
        availability,
        preferences: {
          preferredProposalTone: preferredTone,
          preferredCurrency: currency,
          defaultTimeline: "4 weeks",
          defaultRevisionCount: 3,
        },
      };

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStep(targetStep);
    } catch (err) {
      console.error("Auto-save draft error:", err);
      // Still proceed to next step even if draft save hits a network issue
      setStep(targetStep);
    } finally {
      setLoading(false);
    }
  };

  // Validation checking per step
  const handleNextStep = async () => {
    if (step === 1) {
      if (!fullName.trim()) {
        alert("Full Name is required.");
        return;
      }
      await saveStepDraft(2);
    } else if (step === 2) {
      if (!primaryProfession.trim() || skills.length === 0) {
        alert("Primary Profession and at least one Skill are required.");
        return;
      }
      await saveStepDraft(3);
    } else if (step === 3) {
      const hasEmptyService = services.some((s) => !s.name.trim() || !s.description.trim());
      if (hasEmptyService || services.length === 0) {
        alert("Please complete Name and Description for at least one service.");
        return;
      }
      await saveStepDraft(4);
    }
  };

  // Redirect back to query destination
  const handleContinue = () => {
    router.push(redirectUrl);
  };

  if (loadDraftLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-0)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "680px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="var(--color-brand)" />
          </div>
          <h2 className="font-heading" style={{ fontSize: "18px", letterSpacing: "-0.015em" }}>Freelancer Profile Setup</h2>
        </div>

        {/* Step Progress indicators */}
        <div style={{ display: "flex", gap: "8px", background: "var(--surface-2)", padding: "4px", borderRadius: "8px" }}>
          {[
            { n: 1, l: "Basic Info" },
            { n: 2, l: "Professional Details" },
            { n: 3, l: "Services Offered" },
            { n: 4, l: "Finish Setup" },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                flex: 1,
                padding: "8px 4px",
                fontSize: "11px",
                fontWeight: 600,
                textAlign: "center",
                borderRadius: "6px",
                background: step === s.n ? "var(--surface-1)" : "transparent",
                color: step === s.n ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: step === s.n ? "var(--shadow-sm)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <span style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: step > s.n ? "#10b981" : step === s.n ? "var(--color-brand)" : "var(--border-strong)",
                color: "white",
                fontSize: "9.5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {step > s.n ? <Check size={9} /> : s.n}
              </span>
              <span>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Wizard step cards */}
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
          
          {/* STEP 1: BASIC INFORMATION & RESUME AUTOFILL */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "14.5px", color: "var(--text-primary)" }}>Basic Information</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Provide your name and professional title.
                </p>
              </div>

              {/* Optional Resume parsing helper */}
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  💡 Tip: AI Resume Autofill
                </span>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume bio text here to parse and prefill all onboarding fields automatically..."
                  className="input-field"
                  style={{ height: "70px", fontSize: "11.5px", resize: "none", marginBottom: "8px", lineHeight: "1.4" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAutofill}
                  disabled={parseLoading}
                  leftIcon={parseLoading ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={11} />}
                >
                  {parseLoading ? "Parsing CV..." : "Autofill Setup Fields"}
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Liam Foster"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Professional Title</label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Senior Copywriter"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={loading}
                  rightIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={13} />}
                >
                  {loading ? "Saving draft..." : "Next: Professional Details"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL DETAILS */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "14.5px", color: "var(--text-primary)" }}>Professional Details</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Specify your primary profession and add your skills. At least one skill is required.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Primary Profession *</label>
                  <input
                    type="text"
                    value={primaryProfession}
                    onChange={(e) => setPrimaryProfession(e.target.value)}
                    placeholder="e.g. UI/UX Designer, Web Developer"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Bio Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your background and primary focus..."
                  className="input-field"
                  style={{ height: "80px", fontSize: "12.5px", resize: "none", lineHeight: "1.4" }}
                />
              </div>

              {/* Skills Tags input */}
              <div className="input-group">
                <label className="input-label">Expert Skills *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. Next.js, Figma, SEO"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                  <Button variant="secondary" onClick={addSkill} style={{ height: "38px" }}>
                    <Plus size={13} /> Add
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                    {skills.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "var(--surface-2)",
                          color: "var(--text-secondary)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                        }}
                      >
                        {sk}
                        <button
                          onClick={() => removeSkill(sk)}
                          style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={13} />}>
                  Back
                </Button>
                <div style={{ flex: 1 }} />
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={loading}
                  rightIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={13} />}
                >
                  {loading ? "Saving draft..." : "Next: Services"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICES CATALOG */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "14.5px", color: "var(--text-primary)" }}>Services Offered</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Catalog at least one service offered. Complete the Name and Description fields.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {services.map((svc, idx) => (
                  <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--surface-2)", position: "relative" }}>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeServiceRow(idx)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                      >
                        <X size={14} />
                      </button>
                    )}

                    <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                      Service Item #{idx + 1}
                    </span>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                        placeholder="Service Name (e.g. Website Implementation)"
                        className="input-field"
                        style={{ fontSize: "12.5px" }}
                      />
                      <select
                        value={svc.category}
                        onChange={(e) => handleServiceChange(idx, "category", e.target.value)}
                        className="input-field"
                        style={{ fontSize: "12.5px" }}
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
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Starting ($)</span>
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
                      placeholder="Service deliverables..."
                      className="input-field"
                      style={{ height: "60px", fontSize: "12.5px", resize: "none", marginBottom: "10px", lineHeight: "1.4" }}
                    />

                    {/* Features repeater */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 600 }}>Deliverables list</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={newFeatureText[idx] || ""}
                          onChange={(e) => setNewFeatureText({ ...newFeatureText, [idx]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addServiceFeature(idx); } }}
                          placeholder="Add feature..."
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

                <Button variant="secondary" size="sm" onClick={addServiceRow} leftIcon={<Plus size={12} />}>
                  Add another Service
                </Button>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft size={13} />}>
                  Back
                </Button>
                <div style={{ flex: 1 }} />
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={loading}
                  rightIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <ArrowRight size={13} />}
                >
                  {loading ? "Saving draft..." : "Next: Finish Setup"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: FINISH */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #10b981", marginBottom: "8px" }}>
                <Check size={24} color="#10b981" />
              </div>
              
              <h3 className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)" }}>Your Freelancer Profile is ready.</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", lineHeight: "1.5" }}>
                Your professional brand voice, skills, services, and default rates are now saved as your central identity layer. You are ready to generate custom, personalized AI content!
              </p>

              <Button variant="primary" onClick={handleContinue} style={{ width: "200px", marginTop: "12px" }}>
                Continue
              </Button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading onboarding...</div>}>
      <OnboardingSetupWizard />
    </Suspense>
  );
}
