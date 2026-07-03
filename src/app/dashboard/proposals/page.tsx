"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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
    portfolios: ["https://case-studies.freelai.com/ecommerce-growth", "https://portfolio.freelai.com/seo-results"],
  },
];

export default function AIProposalsPage() {
  useSession();
  
  const [activeTab, setActiveTab] = useState<"workspace" | "compare" | "history">("workspace");
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);

  // Workspace Form States
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState<IProposal["platform"]>("Upwork");
  const [jobPost, setJobPost] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [tone, setTone] = useState("Professional");
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [newPortfolioLink, setNewPortfolioLink] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("custom");

  // AI Active Proposal States
  const [activeProposal, setActiveProposal] = useState<IProposal | null>(null);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number>(1);
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

  // Section Tab inside Right Workspace
  const [activeSectionTab, setActiveSectionTab] = useState<keyof IProposalSection | "pricing" | "analysis">("executiveSummary");

  // Version Comparison States
  const [comparePropId, setComparePropId] = useState("");
  const [compareVerA, setCompareVerA] = useState<number>(1);
  const [compareVerB, setCompareVerB] = useState<number>(1);

  // Proposal History States
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState(false);


  // Handle template selection
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setClientName(tmpl.clientName);
      setPlatform(tmpl.platform);
      setJobPost(tmpl.jobPost);
      setBudget(tmpl.budget);
      setTimeline(tmpl.timeline);
      setTone(tmpl.tone);
      setPortfolios(tmpl.portfolios);
    }
  };

  // Add portfolio link
  const addPortfolioLink = () => {
    if (newPortfolioLink.trim() && !portfolios.includes(newPortfolioLink.trim())) {
      setPortfolios([...portfolios, newPortfolioLink.trim()]);
      setNewPortfolioLink("");
    }
  };

  // Remove portfolio link
  const removePortfolioLink = (index: number) => {
    setPortfolios(portfolios.filter((_, idx) => idx !== index));
  };

  // Fetch Proposals History
  const fetchProposalsHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (favoriteFilter) params.set("favorite", "true");

      const res = await fetch(`/api/proposals?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error("Failed to load proposals history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [searchQuery, statusFilter, platformFilter, favoriteFilter]);

  // Load history on filter change or tab switch
  useEffect(() => {
    if (activeTab === "history" || activeTab === "compare") {
      fetchProposalsHistory();
    }
  }, [activeTab, fetchProposalsHistory]);

  // Trigger proposal generation
  const handleGenerateProposal = async () => {
    if (!clientName.trim() || !jobPost.trim()) {
      alert("Please fill in the Client Name and Job Post details.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          platform,
          jobPost,
          portfolios,
          budget: Number(budget) || 0,
          timeline,
          tone,
        }),
      });

      const generated = await res.json();
      if (res.ok) {
        // Construct a new unsaved active proposal local wrapper
        const mockProposal: IProposal = {
          _id: activeProposal?._id || "", // keep id if regenerating/versioning
          title: `Proposal for ${clientName}`,
          status: "draft",
          value: generated.pricingBreakdown.standard.price,
          currency: "USD",
          isFavorite: false,
          clientName,
          platform,
          jobPost,
          portfolios,
          budget: Number(budget) || 0,
          timeline,
          tone,
          activeVersionIndex: activeProposal ? activeProposal.versions.length : 0,
          versions: activeProposal
            ? [
                ...activeProposal.versions,
                {
                  versionNumber: activeProposal.versions.length + 1,
                  sections: generated.sections,
                  pricingBreakdown: generated.pricingBreakdown,
                  aiAnalysis: generated.aiAnalysis,
                  scoreBreakdown: generated.scoreBreakdown,
                  detectedPainPoints: generated.detectedPainPoints,
                  aiSuggestions: generated.aiSuggestions,
                  promptVersion: generated.promptVersion,
                  createdAt: new Date().toISOString(),
                },
              ]
            : [
                {
                  versionNumber: 1,
                  sections: generated.sections,
                  pricingBreakdown: generated.pricingBreakdown,
                  aiAnalysis: generated.aiAnalysis,
                  scoreBreakdown: generated.scoreBreakdown,
                  detectedPainPoints: generated.detectedPainPoints,
                  aiSuggestions: generated.aiSuggestions,
                  promptVersion: generated.promptVersion,
                  createdAt: new Date().toISOString(),
                },
              ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setActiveProposal(mockProposal);
        const lastIdx = mockProposal.versions.length - 1;
        setActiveVersionNumber(mockProposal.versions[lastIdx].versionNumber);
        setEditingSections(mockProposal.versions[lastIdx].sections);
        setEditingPricing(mockProposal.versions[lastIdx].pricingBreakdown);
        setActiveSectionTab("executiveSummary");
      } else {
        alert(generated.error || "Failed to generate proposal");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating proposal");
    } finally {
      setLoading(false);
    }
  };

  // Save/Update proposal to database
  const handleSaveProposal = async () => {
    if (!activeProposal) return;

    setLoading(true);
    try {
      const activeVer = activeProposal.versions.find((v) => v.versionNumber === activeVersionNumber);
      if (!activeVer) return;

      const isUpdate = activeProposal._id !== "";
      
      const payload = {
        proposalId: isUpdate ? activeProposal._id : undefined,
        clientName: activeProposal.clientName,
        platform: activeProposal.platform,
        jobPost: activeProposal.jobPost,
        portfolios: activeProposal.portfolios,
        budget: activeProposal.budget,
        timeline: activeProposal.timeline,
        tone: activeProposal.tone,
        templateId: selectedTemplateId === "custom" ? null : selectedTemplateId,
        sections: editingSections, // save edited overrides
        pricingBreakdown: editingPricing,
        aiAnalysis: activeVer.aiAnalysis,
        scoreBreakdown: activeVer.scoreBreakdown,
        detectedPainPoints: activeVer.detectedPainPoints,
        aiSuggestions: activeVer.aiSuggestions,
        promptVersion: activeVer.promptVersion,
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveProposal(data.proposal);
        const lastIdx = data.proposal.versions.length - 1;
        setActiveVersionNumber(data.proposal.versions[lastIdx].versionNumber);
        setEditingSections(data.proposal.versions[lastIdx].sections);
        setEditingPricing(data.proposal.versions[lastIdx].pricingBreakdown);
        alert(isUpdate ? "New version saved successfully!" : "Proposal saved successfully!");
      } else {
        alert(data.error || "Failed to save proposal");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving proposal");
    } finally {
      setLoading(false);
    }
  };

  // Reopen saved proposal from history
  const handleReopenProposal = (prop: IProposal) => {
    setActiveProposal(prop);
    setSelectedTemplateId(prop.templateId || "custom");
    setClientName(prop.clientName);
    setPlatform(prop.platform);
    setJobPost(prop.jobPost);
    setBudget(prop.budget.toString());
    setTimeline(prop.timeline);
    setTone(prop.tone);
    setPortfolios(prop.portfolios);

    const activeIdx = prop.activeVersionIndex;
    const version = prop.versions[activeIdx];
    
    setActiveVersionNumber(version.versionNumber);
    setEditingSections(version.sections);
    setEditingPricing(version.pricingBreakdown);
    setActiveSectionTab("executiveSummary");
    setActiveTab("workspace");
  };

  // Switch versions in editor
  const handleSwitchVersion = (versionNum: number) => {
    if (!activeProposal) return;
    const ver = activeProposal.versions.find((v) => v.versionNumber === versionNum);
    if (ver) {
      setActiveVersionNumber(versionNum);
      setEditingSections(ver.sections);
      setEditingPricing(ver.pricingBreakdown);
    }
  };

  // Delete proposal handler
  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProposals(proposals.filter((p) => p._id !== id));
        if (activeProposal && activeProposal._id === id) {
          setActiveProposal(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete proposal");
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (prop: IProposal) => {
    try {
      const res = await fetch(`/api/proposals/${prop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !prop.isFavorite }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local list
        setProposals(proposals.map((p) => (p._id === prop._id ? updated.proposal : p)));
        if (activeProposal && activeProposal._id === prop._id) {
          setActiveProposal(updated.proposal);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update status dropdown
  const handleStatusChange = async (prop: IProposal, newStatus: IProposal["status"]) => {
    try {
      const res = await fetch(`/api/proposals/${prop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

  // Copy full proposal markdown to clipboard
  const handleCopyToClipboard = () => {
    const combined = `
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
    navigator.clipboard.writeText(combined.trim());
    alert("Proposal copied to clipboard in Markdown format!");
  };

  // Export as markdown file download
  const handleExportMarkdown = () => {
    const combined = `
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
    const blob = new Blob([combined.trim()], { type: "text/markdown;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `proposal_${clientName.replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger PDF print view
  const handlePrintPDF = () => {
    window.print();
  };

  // Pricing inputs handler helper
  const handlePricingFieldChange = (tier: keyof IPpricingBreakdown, field: keyof IPricingTier, val: string | number) => {
    setEditingPricing({
      ...editingPricing,
      [tier]: {
        ...editingPricing[tier],
        [field]: val,
      },
    });
  };

  // Compare active selection resolver
  const getCompareProposal = () => proposals.find((p) => p._id === comparePropId);

  return (
    <div className="proposals-page-container" style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
      
      {/* Printable CSS Page Styles for PDF Handoff */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-doc {
            border: none !important;
            background: white !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .proposals-page-container {
            background: white !important;
          }
        }
      `}</style>

      {/* Top Navigation Header */}
      <header className="no-print" style={{ height: "60px", display: "flex", alignItems: "center", gap: "16px", padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface-1)", position: "sticky", top: 0, zIndex: 20 }}>
        <Link href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px", transition: "color 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
        >
          <ChevronLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={13} color="var(--color-brand)" />
          </div>
          <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>AI Proposals</h1>
        </div>
        <div style={{ flex: 1 }} />
        
        {/* Workspace Tab Selectors */}
        <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-sm)" }}>
          {[
            { id: "workspace", label: "Workspace" },
            { id: "compare", label: "Compare Versions" },
            { id: "history", label: "Proposal History" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "workspace" | "compare" | "history")}
              style={{
                padding: "6px 14px",
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
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="print-full" style={{ flex: 1, padding: "24px", maxWidth: "1500px", width: "100%", margin: "0 auto" }}>
        
        {/* VIEW 1: WORKSPACE */}
        {activeTab === "workspace" && (
          <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px", alignItems: "start" }}>
            
            {/* LEFT INPUT PANEL */}
            <section style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)" }}>Generation Studio</h3>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Provide client specifics to generate an optimized proposal outline.</p>
              </div>

              {/* Template selector */}
              <div className="input-group">
                <label className="input-label">System Templates</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "12.5px" }}
                >
                  {TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client & Platform Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Client / Org Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Freelance Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as IProposal["platform"])}
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  >
                    {["Upwork", "Freelancer", "Fiverr", "LinkedIn", "Direct", "Other"].map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job post body */}
              <div className="input-group">
                <label className="input-label">Client Job Post Brief</label>
                <textarea
                  value={jobPost}
                  onChange={(e) => setJobPost(e.target.value)}
                  placeholder="Paste the Upwork description, client requirements, or RFPs here..."
                  className="input-field"
                  style={{ height: "140px", resize: "none", fontSize: "12.5px", lineHeight: "1.5" }}
                />
              </div>

              {/* Budget, Timeline & Tone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Timeline Target</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 4 weeks, Monthly"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Proposal Tone Style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "12.5px" }}
                >
                  {["Professional", "Friendly", "Confident", "Expert", "Premium Agency"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Portfolio Link Manager */}
              <div className="input-group" style={{ gap: "6px" }}>
                <label className="input-label">Portfolio Link References</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newPortfolioLink}
                    onChange={(e) => setNewPortfolioLink(e.target.value)}
                    placeholder="https://behance.net/work"
                    className="input-field"
                    style={{ fontSize: "12.5px" }}
                  />
                  <Button variant="secondary" size="sm" onClick={addPortfolioLink} style={{ height: "36px" }}>
                    <Plus size={13} /> Add
                  </Button>
                </div>
                {portfolios.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                    {portfolios.map((link, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", padding: "4px 10px", borderRadius: "4px", fontSize: "11px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px", color: "var(--text-secondary)" }}>{link}</span>
                        <button onClick={() => removePortfolioLink(idx)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trigger button */}
              <Button
                variant="primary"
                onClick={handleGenerateProposal}
                disabled={loading}
                leftIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={13} />}
                style={{ marginTop: "8px" }}
              >
                {loading ? "Analyzing & Generating..." : activeProposal ? "Regenerate Proposal" : "Generate Proposal Blueprint"}
              </Button>
            </section>

            {/* RIGHT OUTPUT PANEL */}
            <section style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "600px" }}>
              {!activeProposal ? (
                <EmptyState
                  icon={<Sparkles />}
                  heading="AI Proposal Workspace"
                  description="Use the left panel to define parameters and kickstart proposal generation. Your output, pricing tiers, version logs, and analytics scores will compile here."
                />
              ) : (
                <>
                  {/* Top Version bar & Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 className="font-heading" style={{ fontSize: "14px", color: "var(--text-primary)" }}>Proposal Document Editor</h3>
                      {activeProposal._id && (
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Document ID: {activeProposal._id}</p>
                      )}
                    </div>
                    
                    {/* Version Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>Active Version</span>
                      <select
                        value={activeVersionNumber}
                        onChange={(e) => handleSwitchVersion(Number(e.target.value))}
                        className="input-field"
                        style={{ width: "auto", padding: "4px 24px 4px 10px", height: "30px", fontSize: "11.5px" }}
                      >
                        {activeProposal.versions.map((ver) => (
                          <option key={ver.versionNumber} value={ver.versionNumber}>
                            v{ver.versionNumber} ({ver.promptVersion.substring(0, 10)})
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => handleToggleFavorite(activeProposal)}
                        style={{ background: "none", border: "none", color: activeProposal.isFavorite ? "var(--color-brand)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Star size={16} fill={activeProposal.isFavorite ? "var(--color-brand)" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Right Panel Tabs */}
                  <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-sm)", overflowX: "auto" }}>
                    {([
                      { id: "executiveSummary", label: "Executive Summary" },
                      { id: "scopeOfWork", label: "Scope" },
                      { id: "timelineAndMilestones", label: "Timeline" },
                      { id: "callToAction", label: "CTA" },
                      { id: "pricing", label: "Pricing Breakdown" },
                      { id: "analysis", label: "AI Analysis" },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSectionTab(tab.id)}
                        style={{
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: activeSectionTab === tab.id ? "var(--surface-1)" : "transparent",
                          color: activeSectionTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents: Textareas for standard sections */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {activeSectionTab === "executiveSummary" && (
                      <textarea
                        value={editingSections.executiveSummary}
                        onChange={(e) => setEditingSections({ ...editingSections, executiveSummary: e.target.value })}
                        className="input-field"
                        style={{ flex: 1, minHeight: "260px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "12.5px", lineHeight: "1.65", padding: "12px 14px", background: "var(--surface-2)" }}
                      />
                    )}
                    {activeSectionTab === "scopeOfWork" && (
                      <textarea
                        value={editingSections.scopeOfWork}
                        onChange={(e) => setEditingSections({ ...editingSections, scopeOfWork: e.target.value })}
                        className="input-field"
                        style={{ flex: 1, minHeight: "260px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "12.5px", lineHeight: "1.65", padding: "12px 14px", background: "var(--surface-2)" }}
                      />
                    )}
                    {activeSectionTab === "timelineAndMilestones" && (
                      <textarea
                        value={editingSections.timelineAndMilestones}
                        onChange={(e) => setEditingSections({ ...editingSections, timelineAndMilestones: e.target.value })}
                        className="input-field"
                        style={{ flex: 1, minHeight: "260px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "12.5px", lineHeight: "1.65", padding: "12px 14px", background: "var(--surface-2)" }}
                      />
                    )}
                    {activeSectionTab === "callToAction" && (
                      <textarea
                        value={editingSections.callToAction}
                        onChange={(e) => setEditingSections({ ...editingSections, callToAction: e.target.value })}
                        className="input-field"
                        style={{ flex: 1, minHeight: "260px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "12.5px", lineHeight: "1.65", padding: "12px 14px", background: "var(--surface-2)" }}
                      />
                    )}

                    {/* Pricing Tier Inputs */}
                    {activeSectionTab === "pricing" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {(["basic", "standard", "premium"] as const).map((tier) => (
                          <div key={tier} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", background: "var(--surface-2)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ fontSize: "12.5px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-primary)" }}>{tier} Tier</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Price ($)</span>
                                <input
                                  type="number"
                                  value={editingPricing[tier].price}
                                  onChange={(e) => handlePricingFieldChange(tier, "price", Number(e.target.value))}
                                  className="input-field"
                                  style={{ width: "80px", height: "26px", padding: "2px 6px", fontSize: "12px" }}
                                />
                              </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                              <input
                                type="text"
                                value={editingPricing[tier].description}
                                onChange={(e) => handlePricingFieldChange(tier, "description", e.target.value)}
                                placeholder="Core deliverables..."
                                className="input-field"
                                style={{ height: "28px", padding: "2px 8px", fontSize: "12px" }}
                              />
                              <input
                                type="text"
                                value={editingPricing[tier].timeline}
                                onChange={(e) => handlePricingFieldChange(tier, "timeline", e.target.value)}
                                placeholder="Timeline (e.g. 2 weeks)"
                                className="input-field"
                                style={{ height: "28px", padding: "2px 8px", fontSize: "12px" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Scoring & Analytics view */}
                    {activeSectionTab === "analysis" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        
                        {/* Explainable Scoring */}
                        {activeProposal.versions.find((v) => v.versionNumber === activeVersionNumber) && (
                          (() => {
                            const ver = activeProposal.versions.find((v) => v.versionNumber === activeVersionNumber)!;
                            return (
                              <>
                                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "16px", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 18px" }}>
                                  
                                  {/* Overall score radial feel */}
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid var(--border)", paddingRight: "16px" }}>
                                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: ver.scoreBreakdown.overall >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", borderColor: ver.scoreBreakdown.overall >= 80 ? "#10b981" : "var(--color-brand)", marginBottom: "6px" }}>
                                      <span style={{ fontSize: "20px", fontWeight: "bold", color: ver.scoreBreakdown.overall >= 80 ? "#10b981" : "var(--color-brand)" }}>{ver.scoreBreakdown.overall}</span>
                                    </div>
                                    <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase" }}>Overall Score</span>
                                  </div>

                                  {/* Detailed Score breakdown */}
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                                    {[
                                      { label: "Clarity", val: ver.scoreBreakdown.clarity },
                                      { label: "Alignment", val: ver.scoreBreakdown.alignment },
                                      { label: "CTA Strength", val: ver.scoreBreakdown.callToAction },
                                      { label: "Value Proposition", val: ver.scoreBreakdown.valueProposition },
                                    ].map((s) => (
                                      <div key={s.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px", fontWeight: 600 }}>
                                          <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                                          <span style={{ color: "var(--text-primary)" }}>{s.val}/100</span>
                                        </div>
                                        <div style={{ height: "4px", background: "var(--surface-3)", borderRadius: "2px", overflow: "hidden" }}>
                                          <div style={{ width: `${s.val}%`, height: "100%", background: "var(--color-brand)", borderRadius: "2px" }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Advanced AI analysis matrix */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11.5px" }}>
                                  {[
                                    { label: "Readability", value: ver.aiAnalysis.readability, color: "var(--text-primary)" },
                                    { label: "Communication Style", value: ver.aiAnalysis.communicationStyle, color: "var(--text-primary)" },
                                    { label: "Project Complexity", value: ver.aiAnalysis.complexity, color: ver.aiAnalysis.complexity === "High" ? "var(--color-brand)" : "var(--text-secondary)" },
                                    { label: "Budget Sensitivity", value: ver.aiAnalysis.budgetSensitivity, color: ver.aiAnalysis.budgetSensitivity === "High" ? "var(--error)" : "var(--text-secondary)" },
                                    { label: "Urgency Detected", value: ver.aiAnalysis.urgency, color: ver.aiAnalysis.urgency === "High" ? "var(--error)" : "var(--text-secondary)" },
                                    { label: "Professionalism", value: `${ver.aiAnalysis.professionalism}%`, color: "#10b981" },
                                    { label: "Confidence", value: `${ver.aiAnalysis.confidence}%`, color: "#10b981" },
                                    { label: "Personalization", value: `${ver.aiAnalysis.personalization}%`, color: "#10b981" },
                                  ].map((m) => (
                                    <div key={m.label} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "4px", background: "var(--surface-2)", display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{m.label}</span>
                                      <span style={{ color: m.color, fontWeight: "bold" }}>{m.value}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Pain Points list */}
                                <div>
                                  <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Detected Pain Points</span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {ver.detectedPainPoints.map((pt, i) => (
                                      <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                        <span style={{ color: "var(--error)" }}>•</span>
                                        <span>{pt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Suggestions list */}
                                <div>
                                  <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>AI Improvement Suggestions</span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {ver.aiSuggestions.map((sug, i) => (
                                      <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                        <span style={{ color: "var(--color-brand)" }}>→</span>
                                        <span>{sug}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "auto", flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" onClick={handleCopyToClipboard} leftIcon={<Copy size={13} />}>
                      Copy combined markdown
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleExportMarkdown} leftIcon={<Download size={13} />}>
                      Export Markdown
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handlePrintPDF} leftIcon={<FileText size={13} />}>
                      Print PDF
                    </Button>
                    
                    <div style={{ flex: 1 }} />
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveProposal}
                      disabled={loading}
                      leftIcon={loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} />}
                    >
                      {activeProposal._id ? "Save version" : "Save Proposal"}
                    </Button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: COMPARE VERSIONS */}
        {activeTab === "compare" && (
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Version Selectors bar */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "var(--surface-1)", border: "1px solid var(--border)", padding: "14px 18px", borderRadius: "var(--radius)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: 600 }}>Proposal to Compare:</span>
                <select
                  value={comparePropId}
                  onChange={(e) => {
                    setComparePropId(e.target.value);
                    const prop = proposals.find((p) => p._id === e.target.value);
                    if (prop && prop.versions.length > 0) {
                      setCompareVerA(prop.versions[0].versionNumber);
                      setCompareVerB(prop.versions[prop.versions.length - 1].versionNumber);
                    }
                  }}
                  className="input-field"
                  style={{ width: "auto", fontSize: "12px" }}
                >
                  <option value="">-- Choose saved proposal --</option>
                  {proposals.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.versions.length} versions)
                    </option>
                  ))}
                </select>
              </div>

              {comparePropId && getCompareProposal() && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Compare Version A</span>
                    <select
                      value={compareVerA}
                      onChange={(e) => setCompareVerA(Number(e.target.value))}
                      className="input-field"
                      style={{ width: "auto", padding: "2px 20px 2px 8px", height: "26px", fontSize: "11px" }}
                    >
                      {getCompareProposal()!.versions.map((v) => (
                        <option key={v.versionNumber} value={v.versionNumber}>
                          v{v.versionNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>with Version B</span>
                    <select
                      value={compareVerB}
                      onChange={(e) => setCompareVerB(Number(e.target.value))}
                      className="input-field"
                      style={{ width: "auto", padding: "2px 20px 2px 8px", height: "26px", fontSize: "11px" }}
                    >
                      {getCompareProposal()!.versions.map((v) => (
                        <option key={v.versionNumber} value={v.versionNumber}>
                          v{v.versionNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Split Comparison grid */}
            {!comparePropId ? (
              <EmptyState
                icon={<Award />}
                heading="Version Comparison Workspace"
                description="Select a proposal from the dropdown above to load and compare different generation iterations side-by-side."
              />
            ) : (
              (() => {
                const prop = getCompareProposal();
                if (!prop) return null;
                const verA = prop.versions.find((v) => v.versionNumber === compareVerA);
                const verB = prop.versions.find((v) => v.versionNumber === compareVerB);
                
                if (!verA || !verB) return <p>Selected versions are invalid.</p>;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    
                    {/* VERSION A PANEL */}
                    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>Version {verA.versionNumber}</span>
                        <Badge variant="active">Score: {verA.scoreBreakdown.overall}</Badge>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>EXECUTIVE SUMMARY</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                            {verA.sections.executiveSummary}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>SCOPE OF WORK</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                            {verA.sections.scopeOfWork}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>PRICING (STANDARD)</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "var(--color-brand)", fontWeight: "bold" }}>
                            ${verA.pricingBreakdown.standard.price.toLocaleString()} ({verA.pricingBreakdown.standard.timeline})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VERSION B PANEL */}
                    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>Version {verB.versionNumber}</span>
                        <Badge variant="active">Score: {verB.scoreBreakdown.overall}</Badge>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>EXECUTIVE SUMMARY</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                            {verB.sections.executiveSummary}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>SCOPE OF WORK</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                            {verB.sections.scopeOfWork}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)" }}>PRICING (STANDARD)</span>
                          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "var(--color-brand)", fontWeight: "bold" }}>
                            ${verB.pricingBreakdown.standard.price.toLocaleString()} ({verB.pricingBreakdown.standard.timeline})
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* VIEW 3: PROPOSAL HISTORY */}
        {activeTab === "history" && (
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Search & Filter tools */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              
              {/* Search */}
              <div className="search-input-wrapper" style={{ flex: 1, minWidth: "240px", maxWidth: "340px" }}>
                <span className="search-input-icon"><Search size={13} /></span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client or job post..."
                  className="search-input"
                />
              </div>

              {/* Platform selector */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="input-redesign"
                style={{ width: "auto", height: "36px", fontSize: "12px", cursor: "pointer" }}
              >
                <option value="all">All Platforms</option>
                {["Upwork", "Freelancer", "Fiverr", "LinkedIn", "Direct", "Other"].map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>

              {/* Status Filters */}
              <div className="filter-tabs">
                {["all", "draft", "sent", "won", "lost"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`filter-tab${statusFilter === st ? " active" : ""}`}
                    style={{ textTransform: "capitalize", fontSize: "12px" }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Favorite Toggle button */}
              <button
                onClick={() => setFavoriteFilter(!favoriteFilter)}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-strong)",
                  background: favoriteFilter ? "rgba(245,166,35,0.08)" : "transparent",
                  color: favoriteFilter ? "var(--color-brand)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <Star size={13} fill={favoriteFilter ? "var(--color-brand)" : "none"} />
                <span>Starred</span>
              </button>
            </div>

            {/* List Table of History */}
            {historyLoading ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton" style={{ height: "70px", borderRadius: "var(--radius)" }} />
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <EmptyState
                icon={<Briefcase />}
                heading="No proposals match filters"
                description="Try broadening your search query or platforms parameters."
              />
            ) : (
              <div className="glass-card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Starred</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Title & Client</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Platform</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Versions</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Standard Price</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Score</th>
                        <th style={{ padding: "12px 18px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.map((prop) => {
                        const activeVer = prop.versions[prop.activeVersionIndex] || { scoreBreakdown: { overall: 0 }, pricingBreakdown: { standard: { price: 0 } } };
                        return (
                          <tr key={prop._id} style={{ borderBottom: "1px solid var(--border)" }}>
                            
                            {/* Starred */}
                            <td style={{ padding: "12px 18px" }}>
                              <button
                                onClick={() => handleToggleFavorite(prop)}
                                style={{ background: "none", border: "none", color: prop.isFavorite ? "var(--color-brand)" : "var(--text-muted)", cursor: "pointer" }}
                              >
                                <Star size={14} fill={prop.isFavorite ? "var(--color-brand)" : "none"} />
                              </button>
                            </td>

                            {/* Client & Title */}
                            <td style={{ padding: "12px 18px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "bold", color: "var(--text-primary)", fontSize: "13.5px" }}>{prop.title}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Client: {prop.clientName}</span>
                              </div>
                            </td>

                            {/* Platform */}
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", fontWeight: 500 }}>{prop.platform}</span>
                            </td>

                            {/* Versions */}
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: "11px", background: "var(--surface-2)", color: "var(--text-secondary)", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                                v{prop.versions.length}
                              </span>
                            </td>

                            {/* Value */}
                            <td style={{ padding: "12px 18px", fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>
                              ${activeVer.pricingBreakdown.standard.price.toLocaleString()}
                            </td>

                            {/* Score */}
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                background: activeVer.scoreBreakdown.overall >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,166,35,0.1)",
                                color: activeVer.scoreBreakdown.overall >= 80 ? "#10b981" : "var(--color-brand)",
                              }}>
                                {activeVer.scoreBreakdown.overall}
                              </span>
                            </td>

                            {/* Status Selector */}
                            <td style={{ padding: "12px 18px" }}>
                              <select
                                value={prop.status}
                                onChange={(e) => handleStatusChange(prop, e.target.value as IProposal["status"])}
                                className="input-field"
                                style={{ width: "auto", height: "26px", padding: "2px 20px 2px 6px", fontSize: "11px", textTransform: "capitalize", cursor: "pointer" }}
                              >
                                {["draft", "sent", "won", "lost"].map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: "12px 18px", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                <Button variant="secondary" size="sm" onClick={() => handleReopenProposal(prop)} leftIcon={<ArrowRight size={12} />}>
                                  Open
                                </Button>
                                <button
                                  onClick={() => handleDeleteProposal(prop._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "4px",
                                    borderRadius: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "color 0.15s, background 0.15s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--error)";
                                    e.currentTarget.style.background = "var(--surface-2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.background = "none";
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* PRINT SECTION (Displays formatted proposal contents cleanly for PDF exporting, hidden on screen) */}
        {activeProposal && (
          <div className="print-doc" style={{ display: "none" }}>
            <h1 style={{ fontSize: "28px", marginBottom: "8px", fontWeight: "bold" }}>{activeProposal.title}</h1>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>
              Prepared for: <strong>{activeProposal.clientName}</strong> | Platform: <strong>{activeProposal.platform}</strong> | Target Budget: <strong>${activeProposal.budget.toLocaleString()}</strong>
            </p>
            <hr style={{ border: "0.5px solid #ccc", marginBottom: "24px" }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "14px", lineHeight: 1.65 }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "8px" }}>Executive Summary</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{editingSections.executiveSummary}</div>
              </div>

              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "8px" }}>Scope of Work</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{editingSections.scopeOfWork}</div>
              </div>

              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "8px" }}>Timeline and Milestones</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{editingSections.timelineAndMilestones}</div>
              </div>

              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "8px" }}>Call to Action</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{editingSections.callToAction}</div>
              </div>

              <div style={{ pageBreakBefore: "always" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "12px" }}>Pricing Options</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  {(["basic", "standard", "premium"] as const).map((tier) => (
                    <div key={tier} style={{ border: "1px solid #ccc", padding: "12px 16px", borderRadius: "6px" }}>
                      <h4 style={{ textTransform: "capitalize", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{tier} Tier</h4>
                      <span style={{ fontSize: "18px", fontWeight: "bold", color: "#f5a623", display: "block", marginBottom: "8px" }}>
                        ${editingPricing[tier].price.toLocaleString()}
                      </span>
                      <p style={{ fontSize: "11.5px", color: "#555", marginBottom: "8px" }}>{editingPricing[tier].description}</p>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#888" }}>Delivery: {editingPricing[tier].timeline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
