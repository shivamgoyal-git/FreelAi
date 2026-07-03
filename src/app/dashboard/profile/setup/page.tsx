"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [parseLoading, setParseLoading] = useState<boolean>(false);

  // Resume raw text
  const [resumeText, setResumeText] = useState("");

  // Step 2 Form States
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [primaryProfession, setPrimaryProfession] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("United States");
  const [timezone, setTimezone] = useState("EST");

  // Step 3 Form States
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
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

  // Step 4 Form States
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  const [currency, setCurrency] = useState("USD");
  const [pricingModel, setPricingModel] = useState<"hourly" | "fixed" | "custom">("fixed");
  const [availability, setAvailability] = useState<"Available" | "Busy" | "Part-Time" | "Vacation">("Available");
  const [preferredTone, setPreferredTone] = useState("Professional");

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
        alert("AI successfully parsed your resume! Reviewing setup foundation fields next.");
        setStep(2);
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

  // Validation checking per step
  const handleNextStep = () => {
    if (step === 2) {
      if (!fullName.trim() || !primaryProfession.trim()) {
        alert("Full Name and Primary Profession are required.");
        return;
      }
    }
    if (step === 3) {
      if (skills.length === 0) {
        alert("Please add at least one professional skill.");
        return;
      }
      const hasEmptyService = services.some((s) => !s.name.trim() || !s.description.trim());
      if (hasEmptyService) {
        alert("Please complete details (Name & Description) for all services.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  // Submit profile setup
  const handleSubmit = async () => {
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
          primaryProfession,
          yearsOfExperience,
          bio,
          skills,
          services,
        },
        pricing: {
          hourlyRate,
          currency,
          pricingModel,
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

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Profile setup completed successfully!");
        router.push("/dashboard");
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-0)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "680px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="var(--color-brand)" />
          </div>
          <h2 className="font-heading" style={{ fontSize: "18px", letterSpacing: "-0.015em" }}>Freelancer Identity Onboarding</h2>
        </div>

        {/* Step Progress indicators */}
        <div style={{ display: "flex", gap: "8px", background: "var(--surface-2)", padding: "4px", borderRadius: "8px" }}>
          {[
            { n: 1, l: "Resume Parsing" },
            { n: 2, l: "Foundation" },
            { n: 3, l: "Skills & Services" },
            { n: 4, l: "Pricing & Prefs" },
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
              <span style={{ display: "inline-block" }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Wizard step cards */}
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
          
          {/* STEP 1: RESUME UPLOAD / PASTE */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>Autofill Identity Profile</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Paste your resume text, LinkedIn description, or agency biography brief. Our AI will automatically parse skills, services, and profile structures to bypass manual configuration.
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">Resume / CV Copy Paste Block</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your professional experience summary, key accomplishments, skills lists, and education here..."
                  className="input-field"
                  style={{ height: "200px", fontSize: "12.5px", resize: "none", lineHeight: "1.5" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <Button
                  variant="primary"
                  onClick={handleAutofill}
                  disabled={parseLoading}
                  leftIcon={parseLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={13} />}
                >
                  {parseLoading ? "Analyzing resume text..." : "AI Autofill Profile Setup"}
                </Button>
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Skip, configure manually
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE FOUNDATION */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>Professional Foundation</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Provide your primary identity markers. Full Name and Profession are required.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Primary Profession *</label>
                  <input
                    type="text"
                    value={primaryProfession}
                    onChange={(e) => setPrimaryProfession(e.target.value)}
                    placeholder="e.g. UI/UX Designer, Copywriter"
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Professional Title (Optional)</label>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder="e.g. Senior Product & Handoff Designer"
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Professional Bio Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your credentials, target audience alignment, and key accomplishments..."
                  className="input-field"
                  style={{ height: "90px", fontSize: "13px", resize: "none", lineHeight: "1.5" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={13} />}>
                  Back
                </Button>
                <div style={{ flex: 1 }} />
                <Button variant="primary" onClick={handleNextStep} rightIcon={<ArrowRight size={13} />}>
                  Next: Skills & Services
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SKILLS & SERVICES */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>Skills & Services</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Add at least one professional skill and at least one catalogued service.
                </p>
              </div>

              {/* Skills Tag input */}
              <div className="input-group">
                <label className="input-label">Professional Skills *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. Next.js, Figma, SEO"
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                  <Button variant="secondary" onClick={addSkill} style={{ height: "38px" }}>
                    <Plus size={13} /> Add
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
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
                          fontSize: "11.5px",
                          fontWeight: 600,
                          border: "1px solid var(--border)",
                        }}
                      >
                        {sk}
                        <button
                          onClick={() => removeSkill(sk)}
                          style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Repeater */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label className="input-label">Services Catalogue *</label>
                
                {services.map((svc, idx) => (
                  <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px", background: "var(--surface-2)", position: "relative" }}>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeServiceRow(idx)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                      Service #{idx + 1}
                    </span>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                        placeholder="Service Name (e.g. Website Development)"
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
                          style={{ fontSize: "12.5px", padding: "4px 8px" }}
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
                          style={{ fontSize: "12.5px", padding: "4px 8px" }}
                        />
                      </div>
                    </div>

                    <textarea
                      value={svc.description}
                      onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                      placeholder="Service description outlining main deliverables and handoff specifications..."
                      className="input-field"
                      style={{ height: "60px", fontSize: "12.5px", resize: "none", marginBottom: "10px", lineHeight: "1.4" }}
                    />

                    {/* Features checklist inside service */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 600 }}>Features / Deliverables checklist</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={newFeatureText[idx] || ""}
                          onChange={(e) => setNewFeatureText({ ...newFeatureText, [idx]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addServiceFeature(idx); } }}
                          placeholder="e.g. 3 Revisions, SEO setup"
                          className="input-field"
                          style={{ fontSize: "11.5px", height: "28px" }}
                        />
                        <Button variant="secondary" size="sm" onClick={() => addServiceFeature(idx)} style={{ height: "28px" }}>
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

                <Button variant="secondary" size="sm" onClick={addServiceRow} leftIcon={<Plus size={13} />}>
                  Add another Service
                </Button>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft size={13} />}>
                  Back
                </Button>
                <div style={{ flex: 1 }} />
                <Button variant="primary" onClick={handleNextStep} rightIcon={<ArrowRight size={13} />}>
                  Next: Pricing & Preferences
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PRICING & PREFERENCES */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <h3 className="font-heading" style={{ fontSize: "15px", color: "var(--text-primary)" }}>Pricing & AI Preferences</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Configure your pricing model, preferred tone, and system preferences.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Hourly Rate ($ USD)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  >
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
                  <label className="input-label">Pricing Model Preference</label>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value as "hourly" | "fixed" | "custom")}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="hourly">Hourly Billing</option>
                    <option value="fixed">Fixed-Price milestones</option>
                    <option value="custom">Custom Retainers</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Availability Status</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as "Available" | "Busy" | "Part-Time" | "Vacation")}
                    className="input-field"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="Available">Available (Open for work)</option>
                    <option value="Busy">Busy (No bandwidth)</option>
                    <option value="Part-Time">Part-Time availability</option>
                    <option value="Vacation">On Vacation</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Preferred Brand Voice/Proposal Tone</label>
                <select
                  value={preferredTone}
                  onChange={(e) => setPreferredTone(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "13px" }}
                >
                  {["Professional", "Friendly", "Corporate", "Confident", "Minimal"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <Button variant="secondary" onClick={() => setStep(3)} leftIcon={<ArrowLeft size={13} />}>
                  Back
                </Button>
                <div style={{ flex: 1 }} />
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  leftIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} />}
                >
                  {loading ? "Completing setup..." : "Complete Identity Setup"}
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
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
