"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileGuard from "@/components/ProfileGuard";
import {
  Sparkles,
  ChevronLeft,
  Briefcase,
  Star,
  Copy,
  Download,
  FileText,
  Trash2,
  Loader2,
  Plus,
  X,
  Search,
  Check,
  Award,
  ArrowRight,
  Printer,
  Wand2,
  Sliders,
  CheckCircle2,
  Layers,
  BarChart3,
  FileCode,
  ArrowLeft,
  Eye,
  Edit2,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, ProposalListSkeleton } from "@/components/ui/Skeleton";

interface IProposalSection {
  executiveSummary: string;
  scopeOfWork: string;
  timelineAndMilestones: string;
  callToAction: string;
}

interface IPricingTier {
  price: number;
  description: string;
  timeline: string;
}

interface IPpricingBreakdown {
  basic: IPricingTier;
  standard: IPricingTier;
  premium: IPricingTier;
}

interface IAiAnalysis {
  readability: string;
  personalization: number;
  professionalism: number;
  confidence: number;
  urgency: string;
  budgetSensitivity: string;
  complexity: string;
  communicationStyle: string;
}

interface IScoreBreakdown {
  overall: number;
  clarity: number;
  alignment: number;
  callToAction: number;
  valueProposition: number;
}

interface IProposalVersion {
  versionNumber: number;
  sections: IProposalSection;
  pricingBreakdown: IPpricingBreakdown;
  aiAnalysis: IAiAnalysis;
  scoreBreakdown: IScoreBreakdown;
  detectedPainPoints: string[];
  aiSuggestions: string[];
  promptVersion: string;
  proposalBody?: string;
  jobAnalysis?: any;
  matchedPortfolio?: any[];
  explainableScores?: any;
  winChecklist?: any[];
  winChecklistPercentage?: number;
  generationMetadata?: any;
  createdAt: string;
}

interface IProposal {
  _id: string;
  title: string;
  clientId?: string | null;
  status: "draft" | "sent" | "won" | "lost";
  value: number;
  currency: string;
  isFavorite: boolean;
  clientName: string;
  platform: "Upwork" | "Freelancer" | "Fiverr" | "LinkedIn" | "Direct" | "Other";
  jobPost: string;
  portfolios: string[];
  budget: number;
  timeline: string;
  tone: string;
  templateId?: string | null;
  activeVersionIndex: number;
  versions: IProposalVersion[];
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES = [
  {
    id: "custom",
    name: "Custom (Blank)",
    clientName: "",
    platform: "Upwork" as const,
    budget: "",
    timeline: "",
    tone: "Professional",
    jobPost: "",
    portfolios: [],
  },
  {
    id: "saas",
    name: "SaaS Product Development",
    clientName: "Aether Capital",
    platform: "Upwork" as const,
    budget: "12000",
    timeline: "8 weeks",
    tone: "Expert",
    jobPost: "Looking for an experienced Next.js developer to build a SaaS dashboard from Figma designs. Needs Stripe integration, Supabase auth, and high performance. Please share similar dashboard builds in React.",
    portfolios: ["https://portfolio.freelai.com/saas-dashboard", "https://github.com/freelancer/stripe-nextjs-template"],
  },
  {
    id: "mobile-ux",
    name: "Mobile UX Audit & Redesign",
    clientName: "BiteSize Delivery",
    platform: "LinkedIn" as const,
    budget: "3500",
    timeline: "3 weeks",
    tone: "Premium Agency",
    jobPost: "Our mobile web checkout flow is dropping off at 45%. We need a senior mobile UI/UX designer to conduct an audit of our flow and redesign the screens to boost conversions. Figma handoff is required.",
    portfolios: ["https://behance.net/freelancer/food-delivery-ux", "https://dribbble.com/freelancer/mobile-checkout"],
  },
  {
    id: "marketing-retainer",
    name: "Growth Marketing Retainer",
    clientName: "Bloom Cosmetics",
    platform: "Direct" as const,
    budget: "2500",
    timeline: "Monthly",
    tone: "Friendly",
    jobPost: "Looking for a monthly growth partner to manage our SEO, Google Ads, and landing page conversions. We currently spend $5k/mo on ads but aren't seeing positive ROI. Need detailed weekly reporting.",
    portfolios: ["https://freelai.com/case-studies/bloom-seo"],
  },
];

const GENERATION_STEPS = [
  "Analyzing job requirements & pain points...",
  "Querying profile skills & past case studies...",
  "Auto-matching high-confidence portfolio links...",
  "Synthesizing win-strategy & tiered pricing...",
  "Formatting markdown proposal document...",
];

export default function ProposalsPage() {
  useSession();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"workspace" | "compare" | "history">("workspace");

  // Step Wizard state for Left Studio Panel (1: Client Brief -> 2: Strategy & Terms -> 3: Review & Generate)
  const [studioStep, setStudioStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState("custom");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState<IProposal["platform"]>("Upwork");
  const [jobPost, setJobPost] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [tone, setTone] = useState("Auto");
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [portfolioInput, setPortfolioInput] = useState("");

  // Right Panel Display mode: Edit mode vs Rendered Formatted Proposal Preview
  const [outputViewMode, setOutputViewMode] = useState<"edit" | "preview">("preview");

  // Response / Execution State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<IProposal | null>(null);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number>(1);
  const [activeSectionTab, setActiveSectionTab] = useState<
    "proposal" | "analysis" | "portfolio" | "score" | "suggestions" | "versions"
  >("proposal");

  // Active editable fields
  const [proposalBody, setProposalBody] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [matchedPortfolio, setMatchedPortfolio] = useState<any[]>([]);
  const [explainableScores, setExplainableScores] = useState<any>(null);
  const [winChecklist, setWinChecklist] = useState<any[]>([]);
  const [generationMetadata, setGenerationMetadata] = useState<any>(null);

  const [editingSections, setEditingSections] = useState<IProposalSection>({
    executiveSummary: "",
    scopeOfWork: "",
    timelineAndMilestones: "",
    callToAction: "",
  });

  const [editingPricing, setEditingPricing] = useState<IPpricingBreakdown>({
    basic: { price: 0, description: "", timeline: "" },
    standard: { price: 0, description: "", timeline: "" },
    premium: { price: 0, description: "", timeline: "" },
  });

  // Compare version states
  const [comparePropId, setComparePropId] = useState<string>("");
  const [historySearch, setHistorySearch] = useState("");

  // Auto-save debouncing
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "">("");

  const [pageLoading, setPageLoading] = useState(true);

  // Fetch proposals list
  const fetchProposals = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await fetch("/api/proposals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("Failed to load proposals:", err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Loading animation step ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 750);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setClientName(tmpl.clientName);
      setPlatform(tmpl.platform);
      setBudget(tmpl.budget);
      setTimeline(tmpl.timeline);
      setTone(tmpl.tone);
      setJobPost(tmpl.jobPost);
      setPortfolios(tmpl.portfolios);
    }
  };

  // Add portfolio handler
  const handleAddPortfolio = () => {
    if (portfolioInput.trim() && !portfolios.includes(portfolioInput.trim())) {
      setPortfolios([...portfolios, portfolioInput.trim()]);
      setPortfolioInput("");
    }
  };

  const handleRemovePortfolio = (url: string) => {
    setPortfolios(portfolios.filter((p) => p !== url));
  };

  // Update body text with auto-save trigger
  const updateBody = (newVal: string) => {
    setProposalBody(newVal);
    setSaveStatus("Saving...");
  };

  useEffect(() => {
    if (!activeProposal || !saveStatus) return;

    const timer = setTimeout(async () => {
      try {
        const activeIdx = activeProposal.activeVersionIndex;
        const currentVersion = activeProposal.versions[activeIdx];
        if (!currentVersion) return;

        const updatedVersions = [...activeProposal.versions];
        updatedVersions[activeIdx] = {
          ...currentVersion,
          proposalBody,
          sections: editingSections,
          pricingBreakdown: editingPricing,
        };

        const res = await fetch(`/api/proposals/${activeProposal._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            versions: updatedVersions,
            sections: editingSections,
            pricingBreakdown: editingPricing,
          }),
        });

        if (res.ok) {
          setSaveStatus("Saved");
          setTimeout(() => setSaveStatus(""), 2000);
        }
      } catch (err) {
        console.error("Failed to auto-save proposal:", err);
        setSaveStatus("");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [proposalBody, editingSections, editingPricing]);

  // Main proposal generation trigger
  const handleGenerateProposal = async () => {
    if (!jobPost.trim()) {
      toast.error("Please provide a client job post brief.");
      setStudioStep(1);
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        clientName: clientName || "Valued Client",
        platform,
        jobPost,
        budget: budget ? parseFloat(budget) : undefined,
        timeline: timeline || undefined,
        tone: tone === "Auto" ? undefined : tone,
        portfolios,
      };

      if (activeProposal) {
        payload.proposalId = activeProposal._id;
      }

      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate proposal");
      }

      toast.success(data.message || "Proposal generated successfully!");

      const newProp: IProposal = data.proposal;
      setActiveProposal(newProp);
      
      const activeIdx = newProp.activeVersionIndex;
      const latestVer = newProp.versions[activeIdx];

      setActiveVersionNumber(latestVer.versionNumber);
      setEditingSections(latestVer.sections);
      setEditingPricing(latestVer.pricingBreakdown);
      setProposalBody(latestVer.proposalBody || latestVer.sections.executiveSummary || "");
      setJobAnalysis(latestVer.jobAnalysis || null);
      setMatchedPortfolio(latestVer.matchedPortfolio || []);
      setExplainableScores(latestVer.explainableScores || null);
      setWinChecklist(latestVer.winChecklist || []);
      setGenerationMetadata(latestVer.generationMetadata || null);

      fetchProposals();
      setActiveSectionTab("proposal");
      setOutputViewMode("preview");
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error generating proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProposal = (prop: IProposal) => {
    setActiveProposal(prop);
    setClientName(prop.clientName || "");
    setPlatform(prop.platform || "Upwork");
    setJobPost(prop.jobPost || "");
    setBudget(prop.budget ? prop.budget.toString() : "");
    setTimeline(prop.timeline || "");
    setTone(prop.tone || "Auto");
    setPortfolios(prop.portfolios || []);

    const activeIdx = prop.activeVersionIndex;
    const version = prop.versions[activeIdx];
    
    setActiveVersionNumber(version.versionNumber);
    setProposalBody(version.proposalBody || version.sections.executiveSummary || "");
    setJobAnalysis(version.jobAnalysis || null);
    setMatchedPortfolio(version.matchedPortfolio || []);
    setExplainableScores(version.explainableScores || null);
    setWinChecklist(version.winChecklist || []);
    setGenerationMetadata(version.generationMetadata || null);

    setEditingSections(version.sections);
    setEditingPricing(version.pricingBreakdown);
    setActiveSectionTab("proposal");
    setActiveTab("workspace");
    setOutputViewMode("preview");
  };

  const handleSwitchVersion = (versionNum: number) => {
    if (!activeProposal) return;
    const ver = activeProposal.versions.find((v) => v.versionNumber === versionNum);
    if (ver) {
      setActiveVersionNumber(versionNum);
      setProposalBody(ver.proposalBody || ver.sections.executiveSummary || "");
      setJobAnalysis(ver.jobAnalysis || null);
      setMatchedPortfolio(ver.matchedPortfolio || []);
      setExplainableScores(ver.explainableScores || null);
      setWinChecklist(ver.winChecklist || []);
      setGenerationMetadata(ver.generationMetadata || null);

      setEditingSections(ver.sections);
      setEditingPricing(ver.pricingBreakdown);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProposals(proposals.filter((p) => p._id !== id));
        if (activeProposal && activeProposal._id === id) {
          setActiveProposal(null);
        }
        toast.success("Proposal deleted");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete proposal");
    }
  };

  const handleToggleFavorite = async (prop: IProposal) => {
    try {
      const res = await fetch(`/api/proposals/${prop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !prop.isFavorite }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProposals(proposals.map((p) => (p._id === prop._id ? updated.proposal : p)));
        if (activeProposal && activeProposal._id === prop._id) {
          setActiveProposal(updated.proposal);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = proposalBody || `
# ${activeProposal?.title}
---

${editingSections.executiveSummary}

## Scope of Work
${editingSections.scopeOfWork}

## Timeline and Milestones
${editingSections.timelineAndMilestones}

## Call to Action
${editingSections.callToAction}

---
## Pricing Breakdown
- **Basic Tier**: $${editingPricing.basic.price.toLocaleString()} (${editingPricing.basic.timeline}) - ${editingPricing.basic.description}
- **Standard Tier**: $${editingPricing.standard.price.toLocaleString()} (${editingPricing.standard.timeline}) - ${editingPricing.standard.description}
- **Premium Tier**: $${editingPricing.premium.price.toLocaleString()} (${editingPricing.premium.timeline}) - ${editingPricing.premium.description}
`;
    navigator.clipboard.writeText(textToCopy.trim());
    toast.success("Proposal copied to clipboard!");
  };

  const handleExportMarkdown = () => {
    const textToCopy = proposalBody || `
# ${activeProposal?.title}
---

${editingSections.executiveSummary}

## Scope of Work
${editingSections.scopeOfWork}

## Timeline and Milestones
${editingSections.timelineAndMilestones}

## Call to Action
${editingSections.callToAction}

---
## Pricing Breakdown
- **Basic Tier**: $${editingPricing.basic.price.toLocaleString()} (${editingPricing.basic.timeline}) - ${editingPricing.basic.description}
- **Standard Tier**: $${editingPricing.standard.price.toLocaleString()} (${editingPricing.standard.timeline}) - ${editingPricing.standard.description}
- **Premium Tier**: $${editingPricing.premium.price.toLocaleString()} (${editingPricing.premium.timeline}) - ${editingPricing.premium.description}
`;
    const blob = new Blob([textToCopy.trim()], { type: "text/markdown;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `proposal_${clientName.replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const getCompareProposal = () => proposals.find((p) => p._id === comparePropId);

  return (
    <ProfileGuard feature="proposal-generator">
      <div className="proposals-page-container" style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      
      {/* Printable CSS Page Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-full { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-doc { border: none !important; background: white !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>

      {/* Top Header Navbar */}
      <header className="no-print" style={{ height: "54px", display: "flex", alignItems: "center", gap: "14px", padding: "0 20px", borderBottom: "0.5px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", textDecoration: "none", fontSize: "12.5px" }}
        >
          <ChevronLeft size={13} /> Dashboard
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "11px" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={14} color="var(--color-brand)" />
          <h1 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0 }}>AI Proposal Studio</h1>
        </div>
        <div style={{ flex: 1 }} />
        
        {/* Nav Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-base)", padding: "2px", borderRadius: "var(--radius-inputs)", border: "0.5px solid var(--border)" }}>
          {[
            { id: "workspace", label: "Studio Workflow" },
            { id: "compare", label: "Compare" },
            { id: "history", label: "History" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: "4px 12px",
                fontSize: "11.5px",
                fontWeight: 510,
                borderRadius: "var(--radius-buttons)",
                border: "none",
                background: activeTab === t.id ? "var(--surface-2)" : "transparent",
                color: activeTab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
          <Link
            href="/dashboard/proposals/intelligence"
            style={{
              padding: "4px 10px",
              fontSize: "11.5px",
              fontWeight: 510,
              borderRadius: "var(--radius-buttons)",
              background: "transparent",
              color: "var(--color-brand)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Intelligence ✦
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="print-full" style={{ flex: 1, padding: "20px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        
        {/* VIEW 1: STUDIO WORKFLOW */}
        {activeTab === "workspace" && (
          <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "20px", alignItems: "start" }}>
            
            {/* LEFT PANEL: 3-STEP WIZARD STUDIO */}
            <section
              style={{
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-cards)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Wizard Step Progress Tracker Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)", paddingBottom: "12px" }}>
                <div>
                  <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0, color: "var(--text-primary)" }}>
                    Generation Studio
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    Step {studioStep} of 3: {studioStep === 1 ? "Job Brief" : studioStep === 2 ? "Terms & Tone" : "Synthesize"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3].map((stepNum) => (
                    <button
                      key={stepNum}
                      onClick={() => setStudioStep(stepNum as any)}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: "0.5px solid var(--border)",
                        background: studioStep === stepNum ? "var(--color-brand)" : studioStep > stepNum ? "rgba(39,166,68,0.2)" : "var(--bg-base)",
                        color: studioStep === stepNum ? "#08090a" : studioStep > stepNum ? "var(--color-pulse-green)" : "var(--text-muted)",
                        fontSize: "11px",
                        fontWeight: 590,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {studioStep > stepNum ? "✓" : stepNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wizard Step 1: Client & Job Post Brief */}
              <AnimatePresence mode="wait">
                {studioStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    {/* Template Preset Dropdown */}
                    <div className="form-group-redesign">
                      <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Template Preset</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        {TEMPLATES.map((tmpl) => (
                          <option key={tmpl.id} value={tmpl.id}>
                            {tmpl.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group-redesign">
                        <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Client Name</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div className="form-group-redesign">
                        <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value as IProposal["platform"])}
                          style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          {["Upwork", "Freelancer", "Fiverr", "LinkedIn", "Direct", "Other"].map((plat) => (
                            <option key={plat} value={plat}>
                              {plat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group-redesign">
                      <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Client Job Post Brief *</label>
                      <textarea
                        value={jobPost}
                        onChange={(e) => setJobPost(e.target.value)}
                        placeholder="Paste Upwork description, client requirements, or RFPs..."
                        rows={6}
                        style={{ resize: "none", fontSize: "12px", lineHeight: "1.5", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", padding: "10px" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                      <Button variant="secondary" size="sm" onClick={() => setStudioStep(2)} rightIcon={<ArrowRight size={13} />}>
                        Next: Terms & Tone
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Wizard Step 2: Budget, Timeline & Tone Style */}
                {studioStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group-redesign">
                        <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Budget ($ USD)</label>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="e.g. 5000"
                          style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div className="form-group-redesign">
                        <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Timeline Target</label>
                        <input
                          type="text"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          placeholder="e.g. 4 weeks"
                          style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>

                    <div className="form-group-redesign">
                      <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Proposal Tone Style</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        style={{ fontSize: "12px", height: "34px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", cursor: "pointer" }}
                      >
                        <option value="Auto">Auto (Recommended)</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Confident">Confident</option>
                        <option value="Casual">Casual</option>
                        <option value="Minimal">Minimal</option>
                      </select>
                    </div>

                    {/* Manual Portfolio Add */}
                    <div className="form-group-redesign">
                      <label className="label-redesign" style={{ fontSize: "11px", fontWeight: 510, color: "var(--text-muted)" }}>Reference Case Study Links</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={portfolioInput}
                          onChange={(e) => setPortfolioInput(e.target.value)}
                          placeholder="https://behance.net/my-project"
                          style={{ flex: 1, fontSize: "12px", height: "32px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", padding: "0 8px" }}
                        />
                        <Button variant="outline" size="sm" onClick={handleAddPortfolio}>Add</Button>
                      </div>
                      {portfolios.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                          {portfolios.map((url) => (
                            <div key={url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-base)", padding: "4px 8px", borderRadius: "var(--radius-badges)", border: "0.5px solid var(--border)" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{url}</span>
                              <button onClick={() => handleRemovePortfolio(url)} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={11} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <Button variant="ghost" size="sm" onClick={() => setStudioStep(1)} leftIcon={<ArrowLeft size={13} />}>
                        Back
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setStudioStep(3)} rightIcon={<ArrowRight size={13} />}>
                        Next: Review & Generate
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Wizard Step 3: Review & Synthesize */}
                {studioStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    <div style={{ padding: "12px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 590, textTransform: "uppercase", color: "var(--text-muted)" }}>Parameter Summary</span>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                        <span>Client:</span> <strong style={{ fontWeight: 510 }}>{clientName || "Valued Client"} ({platform})</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                        <span>Budget Target:</span> <strong style={{ fontWeight: 510 }}>{budget ? `$${budget}` : "Not specified"}</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                        <span>Tone:</span> <strong style={{ fontWeight: 510 }}>{tone}</strong>
                      </div>
                    </div>

                    {/* Matched Portfolio count */}
                    {matchedPortfolio && matchedPortfolio.length > 0 && (
                      <div style={{ fontSize: "11.5px", color: "var(--color-pulse-green)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle size={13} /> {matchedPortfolio.length} portfolio project(s) ready for auto-matching.
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                      <Button variant="ghost" size="sm" onClick={() => setStudioStep(2)} leftIcon={<ArrowLeft size={13} />}>
                        Back
                      </Button>
                      {/* FOCAL PRIMARY CTA (DESIGN.md Acid Lime #e4f222 flashlight button) */}
                      <Button
                        variant="primary"
                        onClick={handleGenerateProposal}
                        disabled={loading}
                        leftIcon={loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
                      >
                        {loading ? "Synthesizing..." : activeProposal ? "Regenerate Proposal" : "Generate Proposal"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* RIGHT OUTPUT PANEL: WORKSPACE & DOCUMENT PREVIEW */}
            <section
              style={{
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius-cards)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {loading ? (
                /* ANIMATED SKELETON LOADING STATE MATCHING DASHBOARD PAGES */
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={20} width="80px" rounded />
                  </div>
                  <Skeleton height={180} style={{ borderRadius: "var(--radius-cards)", marginTop: "8px" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "4px" }}>
                    <Skeleton height={80} style={{ borderRadius: "var(--radius-inputs)" }} />
                    <Skeleton height={80} style={{ borderRadius: "var(--radius-inputs)" }} />
                    <Skeleton height={80} style={{ borderRadius: "var(--radius-inputs)" }} />
                  </div>
                </div>
              ) : !activeProposal ? (
                <EmptyState
                  icon={<Sparkles />}
                  heading="AI Proposal Workspace"
                  description="Use the left studio wizard to define parameters and generate a structured proposal document, tier breakdown, and win score."
                />
              ) : (
                <>
                  {/* Top Bar: Title, Confidence & Document Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--border)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 className="font-heading" style={{ fontSize: "14px", fontWeight: 510, margin: 0, color: "var(--text-primary)" }}>
                          Proposal Document
                        </h3>
                        {(() => {
                          const activeVer = activeProposal.versions.find((v) => v.versionNumber === activeVersionNumber);
                          const conf = activeVer?.aiAnalysis?.confidence ?? 90;
                          return (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 590,
                                padding: "1px 6px",
                                borderRadius: "var(--radius-pills)",
                                background: conf >= 85 ? "rgba(39,166,68,0.12)" : "rgba(245,158,11,0.12)",
                                color: conf >= 85 ? "var(--color-pulse-green)" : "var(--warning)",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              ✦ {conf}% Match Confidence
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* View mode toggle (Preview vs Raw Edit) + Toolbar Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ background: "var(--bg-base)", padding: "2px", borderRadius: "var(--radius-inputs)", border: "0.5px solid var(--border)", display: "flex" }}>
                        <button
                          onClick={() => setOutputViewMode("preview")}
                          style={{
                            padding: "3px 8px",
                            fontSize: "11px",
                            border: "none",
                            borderRadius: "4px",
                            background: outputViewMode === "preview" ? "var(--surface-2)" : "transparent",
                            color: outputViewMode === "preview" ? "var(--text-primary)" : "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Eye size={11} /> Preview
                        </button>
                        <button
                          onClick={() => setOutputViewMode("edit")}
                          style={{
                            padding: "3px 8px",
                            fontSize: "11px",
                            border: "none",
                            borderRadius: "4px",
                            background: outputViewMode === "edit" ? "var(--surface-2)" : "transparent",
                            color: outputViewMode === "edit" ? "var(--text-primary)" : "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Edit2 size={11} /> Raw Code
                        </button>
                      </div>

                      <Button variant="ghost" size="sm" onClick={handleCopyToClipboard} leftIcon={<Copy size={12} />}>
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleExportMarkdown} leftIcon={<Download size={12} />}>
                        Export .md
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handlePrintPDF} leftIcon={<Printer size={12} />}>
                        PDF
                      </Button>
                      <button
                        onClick={() => handleToggleFavorite(activeProposal)}
                        style={{ background: "none", border: "none", color: activeProposal.isFavorite ? "var(--color-brand)" : "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}
                      >
                        <Star size={15} fill={activeProposal.isFavorite ? "var(--color-brand)" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Right Section Tabs */}
                  <div style={{ display: "flex", gap: "4px", background: "var(--bg-base)", padding: "2px", borderRadius: "var(--radius-inputs)", border: "0.5px solid var(--border)", overflowX: "auto" }}>
                    {[
                      { id: "proposal", label: "Proposal Document" },
                      { id: "analysis", label: "Client Analysis" },
                      { id: "portfolio", label: "Portfolios" },
                      { id: "score", label: "Score Breakdown" },
                      { id: "suggestions", label: "Suggestions" },
                      { id: "versions", label: "Versions" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSectionTab(tab.id as any)}
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 510,
                          borderRadius: "var(--radius-buttons)",
                          border: "none",
                          background: activeSectionTab === tab.id ? "var(--surface-2)" : "transparent",
                          color: activeSectionTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents with Framer Motion AnimatePresence */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeSectionTab}-${outputViewMode}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}
                    >
                      {/* 1. PROPOSAL TEXT TAB */}
                      {activeSectionTab === "proposal" && (
                        outputViewMode === "edit" ? (
                          /* RAW MONOSPACE EDIT MODE */
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontWeight: 590, textTransform: "uppercase" }}>RAW MARKDOWN CODE</span>
                              {saveStatus && <span style={{ fontSize: "10.5px", color: "var(--color-brand)" }}>{saveStatus}</span>}
                            </div>
                            <textarea
                              value={proposalBody}
                              onChange={(e) => updateBody(e.target.value)}
                              placeholder="Proposal text..."
                              style={{
                                flex: 1,
                                minHeight: "360px",
                                resize: "vertical",
                                fontFamily: "var(--font-berkeley-mono), monospace",
                                fontSize: "12px",
                                lineHeight: 1.6,
                                padding: "12px",
                                background: "var(--bg-base)",
                                border: "0.5px solid var(--border)",
                                borderRadius: "var(--radius-inputs)",
                                color: "var(--text-primary)",
                                outline: "none",
                              }}
                            />
                          </div>
                        ) : (
                          /* FORMATTED RICH DOCUMENT PREVIEW MODE */
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, padding: "16px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", maxHeight: "460px", overflowY: "auto" }}>
                            <div style={{ borderBottom: "0.5px solid var(--border)", paddingBottom: "10px" }}>
                              <h2 style={{ fontSize: "18px", fontWeight: 510, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.015em" }}>
                                {activeProposal.title}
                              </h2>
                              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                                Prepared for {activeProposal.clientName || "Valued Client"} • {activeProposal.platform}
                              </p>
                            </div>

                            {/* Section Blocks */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div>
                                <h4 style={{ fontSize: "12px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>
                                  Executive Summary
                                </h4>
                                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                                  {editingSections.executiveSummary || proposalBody}
                                </p>
                              </div>

                              {editingSections.scopeOfWork && (
                                <div>
                                  <h4 style={{ fontSize: "12px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "10px 0 4px 0" }}>
                                    Scope of Work & Deliverables
                                  </h4>
                                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                                    {editingSections.scopeOfWork}
                                  </p>
                                </div>
                              )}

                              {/* Tiered Pricing Breakdown */}
                              {editingPricing && editingPricing.standard?.price > 0 && (
                                <div style={{ marginTop: "10px" }}>
                                  <h4 style={{ fontSize: "12px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>
                                    Tiered Investment Breakdown
                                  </h4>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                                    {(["basic", "standard", "premium"] as const).map((tierKey) => {
                                      const tier = editingPricing[tierKey];
                                      return (
                                        <div key={tierKey} style={{ padding: "10px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)" }}>
                                          <span style={{ fontSize: "10px", fontWeight: 590, textTransform: "uppercase", color: "var(--text-muted)" }}>{tierKey} Tier</span>
                                          <div style={{ fontSize: "16px", fontWeight: 590, color: "var(--text-primary)", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>
                                            ${tier.price.toLocaleString()}
                                          </div>
                                          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{tier.timeline}</p>
                                          <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0 0", lineHeight: 1.4 }}>{tier.description}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}

                      {/* 2. CLIENT ANALYSIS TAB */}
                      {activeSectionTab === "analysis" && jobAnalysis && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ padding: "14px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)" }}>
                            <h4 style={{ fontSize: "12px", fontWeight: 590, color: "var(--text-primary)", margin: 0 }}>Detected Core Needs</h4>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", margin: 0, lineHeight: 1.5 }}>
                              {jobAnalysis.coreNeed}
                            </p>
                          </div>
                          {jobAnalysis.keyPainPoints && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 590, textTransform: "uppercase" }}>Key Pain Points</span>
                              {jobAnalysis.keyPainPoints.map((pt: string, idx: number) => (
                                <div key={idx} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "8px 10px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ color: "var(--color-coral-red)" }}>•</span> {pt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. PORTFOLIOS TAB */}
                      {activeSectionTab === "portfolio" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {matchedPortfolio.length === 0 ? (
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No portfolio projects matched.</p>
                          ) : (
                            matchedPortfolio.map((item, idx) => (
                              <div key={idx} style={{ padding: "12px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <h4 style={{ fontSize: "13px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>{item.project.title}</h4>
                                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{item.project.category}</p>
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 590, color: "var(--color-pulse-green)", fontVariantNumeric: "tabular-nums" }}>
                                  {item.matchScore}% Match
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* 4. SCORE BREAKDOWN TAB */}
                      {activeSectionTab === "score" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {winChecklist.length > 0 && (
                            <div style={{ padding: "12px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)" }}>
                              <span style={{ fontSize: "11px", fontWeight: 590, color: "var(--text-muted)", textTransform: "uppercase" }}>Win Checklist Compliance</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                                {winChecklist.map((chk, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: chk.passed ? "var(--text-primary)" : "var(--text-muted)" }}>
                                    <CheckCircle2 size={13} color={chk.passed ? "var(--color-pulse-green)" : "var(--border-strong)"} />
                                    <span>{chk.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. SUGGESTIONS TAB */}
                      {activeSectionTab === "suggestions" && activeProposal.versions[0]?.aiSuggestions && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {activeProposal.versions[0].aiSuggestions.map((sug: string, idx: number) => (
                            <div key={idx} style={{ padding: "10px", background: "var(--bg-base)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                              💡 {sug}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 6. VERSIONS TAB */}
                      {activeSectionTab === "versions" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {activeProposal.versions.map((ver) => (
                            <div
                              key={ver.versionNumber}
                              onClick={() => handleSwitchVersion(ver.versionNumber)}
                              style={{
                                padding: "10px 12px",
                                background: activeVersionNumber === ver.versionNumber ? "var(--surface-2)" : "var(--bg-base)",
                                border: "0.5px solid var(--border)",
                                borderRadius: "var(--radius-inputs)",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <span style={{ fontSize: "12.5px", fontWeight: 510, color: "var(--text-primary)" }}>Version {ver.versionNumber}</span>
                                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "1px 0 0 0" }}>{new Date(ver.createdAt).toLocaleTimeString()}</p>
                              </div>
                              {activeVersionNumber === ver.versionNumber && (
                                <Badge variant="active">Active</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: COMPARE VERSIONS */}
        {activeTab === "compare" && (
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Compare Version Target:</span>
              <select
                value={comparePropId}
                onChange={(e) => setComparePropId(e.target.value)}
                style={{ fontSize: "12px", height: "32px", padding: "0 10px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)" }}
              >
                <option value="">Select a proposal to compare...</option>
                {proposals.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            {getCompareProposal() ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "16px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 510, margin: "0 0 10px 0" }}>Active Proposal: {activeProposal?.title}</h4>
                  <pre style={{ fontSize: "11.5px", fontFamily: "var(--font-berkeley-mono), monospace", whiteSpace: "pre-wrap", color: "var(--text-secondary)", margin: 0 }}>
                    {proposalBody}
                  </pre>
                </div>
                <div style={{ padding: "16px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-cards)" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 510, margin: "0 0 10px 0" }}>Compared Proposal: {getCompareProposal()?.title}</h4>
                  <pre style={{ fontSize: "11.5px", fontFamily: "var(--font-berkeley-mono), monospace", whiteSpace: "pre-wrap", color: "var(--text-secondary)", margin: 0 }}>
                    {getCompareProposal()?.versions[0]?.proposalBody || getCompareProposal()?.versions[0]?.sections?.executiveSummary}
                  </pre>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Layers />}
                heading="Select Proposal to Compare"
                description="Choose a saved proposal from the dropdown above to run side-by-side version comparison."
              />
            )}
          </div>
        )}

        {/* VIEW 3: PROPOSAL HISTORY */}
        {activeTab === "history" && (
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ position: "relative", width: "240px" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search proposals..."
                  style={{ width: "100%", height: "32px", paddingLeft: "30px", fontSize: "12px", background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-inputs)", color: "var(--text-primary)", outline: "none" }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                {proposals.length} total proposals
              </span>
            </div>

            {pageLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{
                      height: "140px",
                      borderRadius: "var(--radius-cards)",
                      background: "var(--surface-1)",
                      border: "0.5px solid var(--border)",
                    }}
                  />
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                heading="No Saved Proposals"
                description="Proposals created in the Studio will automatically save into your history."
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                {proposals
                  .filter((p) => p.title.toLowerCase().includes(historySearch.toLowerCase()) || p.clientName.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((prop) => (
                    <div
                      key={prop._id}
                      style={{
                        padding: "16px",
                        background: "var(--surface-1)",
                        border: "0.5px solid var(--border)",
                        borderRadius: "var(--radius-cards)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ fontSize: "13.5px", fontWeight: 510, color: "var(--text-primary)", margin: 0 }}>{prop.title}</h4>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>{prop.clientName || "Direct Client"} • {prop.platform}</p>
                        </div>
                        <Badge variant={prop.status === "won" ? "active" : "draft"}>{prop.status}</Badge>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "0.5px solid var(--border)" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                          v{prop.versions.length} • {new Date(prop.updatedAt).toLocaleDateString()}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <Button variant="outline" size="sm" onClick={() => handleLoadProposal(prop)}>
                            Load
                          </Button>
                          <Button variant="ghost" size="icon" style={{ width: "24px", height: "24px", color: "var(--color-coral-red)" }} onClick={() => handleDeleteProposal(prop._id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
    </ProfileGuard>
  );
}
