"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProfileGuard from "@/components/ProfileGuard";
import {
  Sparkles, ChevronLeft, Brain, Zap, Loader2, Copy,
  CheckCircle, XCircle, BarChart3, Target, Lightbulb, RefreshCw,
  Search, AlertCircle,
} from "lucide-react";
import type { IProposalIntelligence, IDiffChunk, ProposalSectionKey } from "@/lib/proposal-intelligence";

import dynamic from "next/dynamic";

const ProposalScoreRing = dynamic(
  () => import("@/components/proposals/ProposalScoreRing").then((mod) => mod.ProposalScoreRing),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "140px", width: "140px", borderRadius: "50%" }} /> }
);
const ProposalRadarChart = dynamic(
  () => import("@/components/proposals/ProposalRadarChart").then((mod) => mod.ProposalRadarChart),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "300px" }} /> }
);
const ProposalBarChart = dynamic(
  () => import("@/components/proposals/ProposalBarChart").then((mod) => mod.ProposalBarChart),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "300px" }} /> }
);
const ProposalComparison = dynamic(
  () => import("@/components/proposals/ProposalComparison").then((mod) => mod.ProposalComparison),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "400px" }} /> }
);
const ToneMatchIndicator = dynamic(
  () => import("@/components/proposals/ToneMatchIndicator").then((mod) => mod.ToneMatchIndicator),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "200px" }} /> }
);
const SuccessPredictionCard = dynamic(
  () => import("@/components/proposals/SuccessPredictionCard").then((mod) => mod.SuccessPredictionCard),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: "220px" }} /> }
);
const DiffViewer = dynamic(
  () => import("@/components/proposals/DiffViewer").then((mod) => mod.DiffViewer),
  { ssr: false }
);

// Other Components
import { ProposalScoreCard } from "@/components/proposals/ProposalScoreCard";
import { ProposalSuggestions } from "@/components/proposals/ProposalSuggestions";
import { ClientAnalysisCard } from "@/components/proposals/ClientAnalysisCard";
import { PainPointCoverage } from "@/components/proposals/PainPointCoverage";
import { WinChecklist } from "@/components/proposals/WinChecklist";
import { AiMetadataBadge } from "@/components/proposals/AiMetadataBadge";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface IProposalStub {
  _id: string;
  title: string;
  clientName: string;
  platform: string;
  jobPost: string;
  intelligence?: IProposalIntelligence;
  versions: Array<{
    versionNumber: number;
    sections: {
      executiveSummary: string;
      scopeOfWork: string;
      timelineAndMilestones: string;
      callToAction: string;
    };
    aiAnalysis: { readability: string; personalization: number; professionalism: number; confidence: number; urgency: string; budgetSensitivity: string; complexity: string; communicationStyle: string };
    scoreBreakdown: { overall: number; clarity: number; alignment: number; callToAction: number; valueProposition: number };
    detectedPainPoints: string[];
    aiSuggestions: string[];
    promptVersion: string;
    createdAt: string;
  }>;
  activeVersionIndex: number;
  createdAt: string;
}

type AnalyzeMode = "existing" | "paste";
type DashTab = "analysis" | "comparison" | "optimize";

const SECTION_KEYS: { key: ProposalSectionKey; label: string }[] = [
  { key: "executiveSummary", label: "Executive Summary" },
  { key: "scopeOfWork", label: "Scope of Work" },
  { key: "timelineAndMilestones", label: "Timeline & Milestones" },
  { key: "callToAction", label: "Call to Action" },
];

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Skeleton({ width = "100%", height = 16, style = {} }: { width?: number | string; height?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        background: "var(--surface-3)",
        borderRadius: "var(--radius-sm)",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ─── SECTION CHIP ─────────────────────────────────────────────────────────────

function SectionChip({
  label,
  onRewrite,
  loading,
}: {
  label: string;
  onRewrite: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onRewrite}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        fontSize: "11px",
        fontWeight: 600,
        borderRadius: "var(--radius-pill)",
        border: "0.5px solid var(--border-strong)",
        background: "var(--surface-2)",
        color: "var(--text-secondary)",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all var(--dur-fast)",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={10} />}
      Rewrite {label}
    </button>
  );
}

// ─── KEYWORD CHIP ────────────────────────────────────────────────────────────

function KeywordChips({ matched, missing, overused }: { matched: string[]; missing: string[]; overused: string[] }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Keyword Analysis</span>

      {[
        { label: "Matched", keywords: matched, color: "var(--color-success)", bg: "var(--color-success-bg)" },
        { label: "Missing", keywords: missing, color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
        { label: "Overused", keywords: overused, color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
      ].map(({ label, keywords, color, bg }) =>
        keywords.length > 0 ? (
          <div key={label}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
              {label} ({keywords.length})
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: bg,
                    color,
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ProposalIntelligencePage() {
  const [dashTab, setDashTab] = useState<DashTab>("analysis");
  const [mode, setMode] = useState<AnalyzeMode>("existing");

  // Proposals list for picker
  const [proposals, setProposals] = useState<IProposalStub[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [pasteJobPost, setPasteJobPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [intelligence, setIntelligence] = useState<IProposalIntelligence | null>(null);
  const [analyzeError, setAnalyzeError] = useState("");
  const [cachedResult, setCachedResult] = useState(false);

  // Chart tab in center panel
  const [chartView, setChartView] = useState<"radar" | "bar">("radar");

  // Rewrite state
  const [rewritingSection, setRewritingSection] = useState<ProposalSectionKey | null>(null);
  const [rewriteResults, setRewriteResults] = useState<Record<string, { rewritten: string; diff: IDiffChunk[]; changes: string[] }>>({});

  // Optimize state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<{ optimized: string; diff: IDiffChunk[]; changes: string[] } | null>(null);
  const [diffMode, setDiffMode] = useState<"inline" | "side-by-side">("inline");

  // Comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ matrix: import("@/lib/proposal-intelligence").ComparisonMatrix; intelligences: Array<IProposalIntelligence & { id: string; label: string }> } | null>(null);

  // ─── LOAD PROPOSALS ─────────────────────────────────────────────────────

  const loadProposals = useCallback(async () => {
    setProposalsLoading(true);
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      if (res.ok) setProposals(data.proposals ?? []);
    } catch {
      /* silent */
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  // ─── ANALYZE ─────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    setAnalyzeError("");
    setIntelligence(null);
    setOptimizeResult(null);
    setRewriteResults({});

    if (mode === "existing" && !selectedProposalId) {
      setAnalyzeError("Please select a proposal to analyze.");
      return;
    }
    if (mode === "paste" && (!pasteText.trim() || !pasteJobPost.trim())) {
      setAnalyzeError("Please paste both the proposal text and the job post.");
      return;
    }

    setAnalyzing(true);
    try {
      const body =
        mode === "existing"
          ? { proposalId: selectedProposalId }
          : { proposalText: pasteText, jobPost: pasteJobPost };

      const res = await fetch("/api/proposals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setIntelligence(data.intelligence);
      setCachedResult(data.cached ?? false);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── REWRITE SECTION ─────────────────────────────────────────────────────

  const handleRewriteSection = async (sectionKey: ProposalSectionKey) => {
    const selectedProposal = proposals.find((p) => p._id === selectedProposalId);
    const activeVer = selectedProposal?.versions[selectedProposal.activeVersionIndex];
    if (!activeVer) return;

    const sectionText = (activeVer.sections as Record<string, string>)[sectionKey] ?? "";
    const jobPost = selectedProposal?.jobPost ?? pasteJobPost;

    setRewritingSection(sectionKey);
    try {
      const res = await fetch("/api/proposals/rewrite-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, sectionText, jobPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRewriteResults((prev) => ({ ...prev, [sectionKey]: data }));
    } catch (err) {
      console.error("Rewrite failed:", err);
    } finally {
      setRewritingSection(null);
    }
  };

  // ─── OPTIMIZE ────────────────────────────────────────────────────────────

  const handleOptimize = async () => {
    const selectedProposal = proposals.find((p) => p._id === selectedProposalId);
    const activeVer = selectedProposal?.versions[selectedProposal?.activeVersionIndex ?? 0];
    if (!activeVer && !pasteText) return;

    const proposalText = activeVer
      ? [activeVer.sections.executiveSummary, activeVer.sections.scopeOfWork, activeVer.sections.timelineAndMilestones, activeVer.sections.callToAction].join("\n\n")
      : pasteText;
    const jobPost = selectedProposal?.jobPost ?? pasteJobPost;

    setOptimizing(true);
    setOptimizeResult(null);
    try {
      const res = await fetch("/api/proposals/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalText, jobPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOptimizeResult(data);
    } catch (err) {
      console.error("Optimize failed:", err);
    } finally {
      setOptimizing(false);
    }
  };

  // ─── COMPARE ─────────────────────────────────────────────────────────────

  const handleCompare = async () => {
    if (compareIds.length < 2) return;
    setComparing(true);
    setComparisonData(null);
    try {
      const res = await fetch("/api/proposals/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalIds: compareIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComparisonData(data);
    } catch (err) {
      console.error("Compare failed:", err);
    } finally {
      setComparing(false);
    }
  };

  const toggleCompareId = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const filteredProposals = proposals.filter((p) =>
    searchQuery
      ? p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // ─── COPY ANALYSIS ────────────────────────────────────────────────────────

  const handleCopyAnalysis = () => {
    if (!intelligence) return;
    const text = `Proposal Intelligence Report
Overall Score: ${intelligence.overallScore}/100
Success Probability: ${intelligence.successPrediction.probability}%

${intelligence.overallReason}

STRENGTHS:
${intelligence.strengths.map((s) => `• ${s}`).join("\n")}

WEAKNESSES:
${intelligence.weaknesses.map((w) => `• ${w}`).join("\n")}

IMPROVEMENTS:
${intelligence.improvements.map((i) => `[${i.priority.toUpperCase()}] ${i.suggestion}\n  Why: ${i.reason}`).join("\n\n")}

WIN CHECKLIST:
${intelligence.winChecklist.map((i) => `${i.passed ? "✓" : "✗"} ${i.label}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <ProfileGuard feature="proposal-intelligence">
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--surface-0)", display: "flex", flexDirection: "column" }}>
        {/* ── Header ── */}
        <header
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-1)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link
            href="/dashboard/proposals"
            style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "13px" }}
          >
            <ChevronLeft size={14} /> AI Proposals
          </Link>
          <span style={{ color: "var(--border-strong)", fontSize: "12px" }}>/</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 26, height: 26, borderRadius: "6px", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={13} color="var(--color-brand)" />
            </div>
            <h1 className="font-heading" style={{ fontSize: "15px", letterSpacing: "-0.01em" }}>
              Proposal Intelligence
            </h1>
          </div>
          <div style={{ flex: 1 }} />

          {/* Tab bar */}
          <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-sm)" }}>
            {(["analysis", "comparison", "optimize"] as DashTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setDashTab(t)}
                style={{
                  padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius-sm)",
                  border: "none", cursor: "pointer",
                  background: dashTab === t ? "var(--surface-1)" : "transparent",
                  color: dashTab === t ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: dashTab === t ? "var(--shadow-sm)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {t === "analysis" ? "Analysis" : t === "comparison" ? "Compare" : "Optimize"}
              </button>
            ))}
          </div>

          {/* Actions */}
          {intelligence && (
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleCopyAnalysis}
                style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius)", border: "0.5px solid var(--border)", background: "var(--surface-2)", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <Copy size={12} /> Copy Report
              </button>
            </div>
          )}
        </header>

        {/* ── Body ── */}
        <main style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: "0", minHeight: 0 }}>

          {/* ═══ LEFT PANEL — INPUT ═══ */}
          <aside
            style={{
              borderRight: "0.5px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              background: "var(--surface-1)",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Mode selector */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                  Input Mode
                </p>
                <div style={{ display: "flex", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "0.5px solid var(--border)" }}>
                  {(["existing", "paste"] as AnalyzeMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      style={{
                        flex: 1, padding: "7px 8px", fontSize: "11.5px", fontWeight: 600,
                        border: "none", cursor: "pointer",
                        background: mode === m ? "var(--color-brand)" : "var(--surface-2)",
                        color: mode === m ? "var(--color-on-brand)" : "var(--text-secondary)",
                        transition: "all var(--dur-fast)",
                      }}
                    >
                      {m === "existing" ? "My Proposals" : "Paste External"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing proposal picker */}
              {mode === "existing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Search */}
                  <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      placeholder="Search proposals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: "100%", paddingLeft: "30px", padding: "7px 10px 7px 30px", fontSize: "12px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", outline: "none" }}
                    />
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {proposalsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={46} style={{ borderRadius: "var(--radius)" }} />)
                    ) : filteredProposals.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                        No proposals found.
                      </p>
                    ) : (
                      filteredProposals.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => setSelectedProposalId(p._id)}
                          style={{
                            padding: "9px 12px", textAlign: "left", borderRadius: "var(--radius-sm)",
                            border: "0.5px solid",
                            borderColor: selectedProposalId === p._id ? "var(--color-brand)" : "var(--border)",
                            background: selectedProposalId === p._id ? "var(--color-brand-subtle)" : "var(--surface-2)",
                            cursor: "pointer", transition: "all var(--dur-fast)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.clientName}
                            </span>
                            {p.intelligence && (
                              <span style={{ fontSize: "10px", color: "var(--color-success)", fontWeight: 700, flexShrink: 0 }}>
                                {p.intelligence.overallScore}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{p.platform}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Paste mode inputs */}
              {mode === "paste" && (
                <>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "5px" }}>
                      Job Post
                    </label>
                    <textarea
                      value={pasteJobPost}
                      onChange={(e) => setPasteJobPost(e.target.value)}
                      placeholder="Paste the client's job post..."
                      rows={5}
                      style={{ width: "100%", padding: "8px 10px", fontSize: "12px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", resize: "vertical", outline: "none", lineHeight: 1.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "5px" }}>
                      Your Proposal
                    </label>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste your proposal text..."
                      rows={8}
                      style={{ width: "100%", padding: "8px 10px", fontSize: "12px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", resize: "vertical", outline: "none", lineHeight: 1.5 }}
                    />
                  </div>
                </>
              )}

              {/* Error */}
              {analyzeError && (
                <div style={{ display: "flex", gap: "6px", padding: "8px 10px", background: "var(--color-danger-bg)", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--color-danger)" }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                  {analyzeError}
                </div>
              )}

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  width: "100%", padding: "10px", fontSize: "13px", fontWeight: 700,
                  borderRadius: "var(--radius)", border: "none", cursor: analyzing ? "not-allowed" : "pointer",
                  background: "var(--color-brand)", color: "var(--color-on-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  boxShadow: "var(--shadow-brand)", opacity: analyzing ? 0.7 : 1,
                  transition: "all var(--dur-base)",
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain size={14} />
                    Analyze Proposal
                  </>
                )}
              </button>

              {/* Cache badge */}
              {intelligence && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <AiMetadataBadge metadata={intelligence.requestMetadata} compact />
                </div>
              )}

              {/* Win Checklist (always visible after analysis) */}
              {intelligence && (
                <WinChecklist checklist={intelligence.winChecklist} />
              )}
            </div>
          </aside>

          {/* ═══ CENTER PANEL — MAIN CONTENT ═══ */}
          <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* ── ANALYSIS TAB ── */}
            {dashTab === "analysis" && (
              <>
                {/* Empty state */}
                {!intelligence && !analyzing && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "60px 24px", textAlign: "center" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-xl)", background: "var(--color-brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Brain size={28} color="var(--color-brand)" />
                    </div>
                    <div>
                      <h2 className="font-heading" style={{ fontSize: "20px", marginBottom: "6px" }}>
                        Ready to Coach Your Proposal
                      </h2>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "400px" }}>
                        Select a proposal from your history or paste external text, then click Analyze to get a full AI-powered intelligence report.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                      {["12 scored dimensions", "Client psychology", "Win checklist", "Success prediction"].map((feat) => (
                        <span key={feat} style={{ padding: "4px 10px", borderRadius: "var(--radius-pill)", background: "var(--surface-2)", border: "0.5px solid var(--border)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                          ✦ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading skeleton */}
                {analyzing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
                      <div style={{ position: "relative", width: 120, height: 120 }}>
                        <Skeleton width={120} height={120} style={{ borderRadius: "50%" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Loader2 size={28} color="var(--color-brand)" style={{ animation: "spin 1s linear infinite" }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                      {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} height={80} style={{ borderRadius: "var(--radius)" }} />)}
                    </div>
                  </div>
                )}

                {/* Results */}
                {intelligence && !analyzing && (
                  <>
                    {/* Overall score + radar */}
                    <div
                      style={{
                        background: "var(--surface-1)",
                        border: "0.5px solid var(--border)",
                        borderRadius: "var(--radius-xl)",
                        padding: "24px",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "24px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <ProposalScoreRing score={intelligence.overallScore} size={140} label="Overall Score" />
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-brand)", padding: "3px 10px", borderRadius: "var(--radius-pill)", background: "var(--color-brand-subtle)" }}>
                            {intelligence.successPrediction.probability}% Win Probability
                          </span>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: "12px" }}>
                          {intelligence.overallReason}
                        </p>

                        {/* Strengths / Weaknesses */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "var(--color-success-bg)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-success)", marginBottom: "6px" }}>STRENGTHS</p>
                            {intelligence.strengths.slice(0, 3).map((s, i) => (
                              <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
                                <CheckCircle size={11} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                                <span style={{ fontSize: "11.5px", color: "var(--text-primary)" }}>{s}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ background: "var(--color-danger-bg)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-danger)", marginBottom: "6px" }}>WEAKNESSES</p>
                            {intelligence.weaknesses.slice(0, 3).map((w, i) => (
                              <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
                                <XCircle size={11} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: "2px" }} />
                                <span style={{ fontSize: "11.5px", color: "var(--text-primary)" }}>{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart selector */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 className="font-heading" style={{ fontSize: "14px" }}>Section Scores</h3>
                      <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", padding: "2px", borderRadius: "var(--radius-sm)" }}>
                        {(["radar", "bar"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setChartView(v)}
                            style={{
                              padding: "5px 12px", fontSize: "11px", fontWeight: 600, borderRadius: "var(--radius-xs)", border: "none", cursor: "pointer",
                              background: chartView === v ? "var(--surface-1)" : "transparent",
                              color: chartView === v ? "var(--text-primary)" : "var(--text-secondary)",
                              boxShadow: chartView === v ? "var(--shadow-sm)" : "none",
                              textTransform: "capitalize",
                            }}
                          >
                            {v === "radar" ? "Radar" : "Bar"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Charts */}
                    <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px" }}>
                      {chartView === "radar" ? (
                        <ProposalRadarChart intelligence={intelligence} height={300} />
                      ) : (
                        <ProposalBarChart intelligence={intelligence} height={300} />
                      )}
                    </div>

                    {/* Score cards grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                      {Object.entries(intelligence.sectionScores).map(([key, field]) => (
                        <ProposalScoreCard key={key} label={key} field={field} />
                      ))}
                    </div>

                    {/* Improvements */}
                    <div>
                      <h3 className="font-heading" style={{ fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
                        <Lightbulb size={15} color="var(--color-brand)" /> Improvement Suggestions
                      </h3>
                      <ProposalSuggestions improvements={intelligence.improvements} />
                    </div>

                    {/* Coaching tips */}
                    {intelligence.coachingTips.length > 0 && (
                      <div>
                        <h3 className="font-heading" style={{ fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
                          <Zap size={15} color="var(--color-brand)" /> AI Coaching Tips
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {intelligence.coachingTips.map((tip, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "12px 14px",
                                background: "var(--surface-1)",
                                border: "0.5px solid var(--border)",
                                borderLeft: "3px solid var(--color-brand)",
                                borderRadius: "var(--radius)",
                                fontSize: "12.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.55,
                              }}
                            >
                              <span style={{ fontWeight: 700, color: "var(--color-brand)", marginRight: "4px" }}>#{i + 1}</span>
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata footer */}
                    <div>
                      <AiMetadataBadge metadata={intelligence.requestMetadata} />
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── COMPARISON TAB ── */}
            {dashTab === "comparison" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h2 className="font-heading" style={{ fontSize: "16px", marginBottom: "4px" }}>Compare Proposals</h2>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>Select 2–3 proposals to compare side by side across all 12 intelligence dimensions.</p>
                </div>

                {/* Proposal selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {proposals.map((p) => {
                    const selected = compareIds.includes(p._id);
                    const disabled = !selected && compareIds.length >= 3;
                    return (
                      <button
                        key={p._id}
                        onClick={() => !disabled && toggleCompareId(p._id)}
                        style={{
                          padding: "10px 14px", textAlign: "left", borderRadius: "var(--radius)",
                          border: "0.5px solid",
                          borderColor: selected ? "var(--color-brand)" : "var(--border)",
                          background: selected ? "var(--color-brand-subtle)" : "var(--surface-1)",
                          cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all var(--dur-fast)",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{p.clientName}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>{p.platform}</span>
                        </div>
                        {selected && <CheckCircle size={16} color="var(--color-brand)" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCompare}
                  disabled={compareIds.length < 2 || comparing}
                  style={{
                    padding: "10px", fontSize: "13px", fontWeight: 700,
                    borderRadius: "var(--radius)", border: "none",
                    background: compareIds.length >= 2 ? "var(--color-brand)" : "var(--surface-3)",
                    color: compareIds.length >= 2 ? "var(--color-on-brand)" : "var(--text-muted)",
                    cursor: compareIds.length < 2 || comparing ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  }}
                >
                  {comparing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <BarChart3 size={14} />}
                  {comparing ? "Comparing..." : `Compare ${compareIds.length} Proposal${compareIds.length !== 1 ? "s" : ""}`}
                </button>

                {comparisonData && (
                  <div style={{ marginTop: "8px" }}>
                    <ProposalComparison
                      matrix={comparisonData.matrix}
                      intelligences={comparisonData.intelligences.map((i) => ({
                        id: i.id,
                        label: i.label,
                        overallScore: i.overallScore,
                        sectionScores: Object.fromEntries(Object.entries(i.sectionScores).map(([k, v]) => [k, v.score])),
                        successProbability: i.successPrediction.probability,
                      }))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── OPTIMIZE TAB ── */}
            {dashTab === "optimize" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h2 className="font-heading" style={{ fontSize: "16px", marginBottom: "4px" }}>Optimize & Rewrite</h2>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>AI improves flow, readability, and conversion potential. Rewrite individual sections or the entire proposal.</p>
                </div>

                {/* Section rewrites */}
                {intelligence && (
                  <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Section Rewrites</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {SECTION_KEYS.map(({ key, label }) => (
                        <SectionChip
                          key={key}
                          label={label}
                          onRewrite={() => handleRewriteSection(key)}
                          loading={rewritingSection === key}
                        />
                      ))}
                    </div>

                    {/* Rewrite results */}
                    {Object.entries(rewriteResults).map(([sectionKey, result]) => {
                      const label = SECTION_KEYS.find((s) => s.key === sectionKey)?.label ?? sectionKey;
                      return (
                        <div key={sectionKey} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                              {label} — Rewritten
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(result.rewritten)}
                              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", fontSize: "11px", fontWeight: 600, border: "0.5px solid var(--border)", borderRadius: "var(--radius-pill)", background: "var(--surface-2)", color: "var(--text-muted)", cursor: "pointer" }}
                            >
                              <Copy size={10} /> Copy
                            </button>
                          </div>
                          <DiffViewer diff={result.diff} mode="inline" />
                          {result.changes.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {result.changes.map((c, i) => (
                                <div key={i} style={{ fontSize: "11.5px", color: "var(--text-secondary)", padding: "4px 8px", background: "var(--surface-2)", borderRadius: "var(--radius-xs)" }}>
                                  • {c}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Full optimize */}
                <div style={{ background: "var(--surface-1)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Full Proposal Optimization</h3>
                    {optimizeResult && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        {(["inline", "side-by-side"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setDiffMode(m)}
                            style={{
                              padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                              borderRadius: "var(--radius-pill)", border: "0.5px solid var(--border)",
                              background: diffMode === m ? "var(--color-brand)" : "var(--surface-2)",
                              color: diffMode === m ? "var(--color-on-brand)" : "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            {m === "inline" ? "Inline" : "Side by Side"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleOptimize}
                    disabled={optimizing || (!selectedProposalId && !pasteText)}
                    style={{
                      padding: "10px", fontSize: "13px", fontWeight: 700, borderRadius: "var(--radius)", border: "none",
                      background: "var(--color-brand)", color: "var(--color-on-brand)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                      opacity: optimizing || (!selectedProposalId && !pasteText) ? 0.6 : 1,
                      boxShadow: "var(--shadow-brand)",
                    }}
                  >
                    {optimizing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
                    {optimizing ? "Optimizing..." : "Optimize Full Proposal"}
                  </button>

                  {optimizeResult && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Changes Made</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(optimizeResult.optimized)}
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: 600, border: "0.5px solid var(--border)", borderRadius: "var(--radius-pill)", background: "var(--surface-2)", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          <Copy size={10} /> Copy Optimized
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {optimizeResult.changes.map((c, i) => (
                          <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "4px 8px", background: "var(--color-success-bg)", borderRadius: "var(--radius-xs)", borderLeft: "2px solid var(--color-success)" }}>
                            ✓ {c}
                          </div>
                        ))}
                      </div>
                      <DiffViewer diff={optimizeResult.diff} mode={diffMode} maxHeight={500} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ═══ RIGHT PANEL — CLIENT & KEYWORD ═══ */}
          <aside
            style={{
              borderLeft: "0.5px solid var(--border)",
              overflowY: "auto",
              background: "var(--surface-1)",
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {!intelligence ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <Target size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Client analysis will appear here after analysis.
                  </p>
                </div>
              ) : (
                <>
                  <ClientAnalysisCard clientAnalysis={intelligence.clientAnalysis} />
                  <ToneMatchIndicator toneMatch={intelligence.toneMatch} />
                  <PainPointCoverage painPoints={intelligence.painPointCoverage} />
                  <KeywordChips
                    matched={intelligence.keywordAnalysis.matched}
                    missing={intelligence.keywordAnalysis.missing}
                    overused={intelligence.keywordAnalysis.overused}
                  />
                  <SuccessPredictionCard successPrediction={intelligence.successPrediction} />
                </>
              )}
            </div>
          </aside>
        </main>
      </div>
    </ProfileGuard>
  );
}
