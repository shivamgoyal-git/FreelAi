/**
 * ProposalIntelligenceEngine
 *
 * Hybrid pipeline: local deterministic analysis + Gemini for reasoning-heavy dims.
 * Extends AiCore for Gemini calls and metadata tracking.
 *
 * Caching: SHA-256(proposalText + jobPost) — if hash matches stored intelligence,
 * the entire Gemini call is skipped and cached result is returned instantly.
 */

import { AiCore, AiRequestMetadata, GeminiCallResult } from "./ai-core";
import { ProposalLocalAnalyzer, LocalAnalysisResult, WinChecklistItem, PainPointResult } from "./proposal-local-analyzer";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

export interface IScoredField {
  score: number;       // 0–100
  reason: string;      // human-readable explanation
  confidence: number;  // 0–1
}

export interface IDiffChunk {
  type: "equal" | "insert" | "delete";
  value: string;
}

export interface IProposalIntelligence {
  contentHash: string;
  overallScore: number;
  overallReason: string;
  overallConfidence: number;

  sectionScores: {
    professionalism: IScoredField;
    personalization: IScoredField;
    readability: IScoredField;
    confidence: IScoredField;
    structure: IScoredField;
    grammar: IScoredField;
    callToAction: IScoredField;
    valueProp: IScoredField;
    clientFocus: IScoredField;
    pricingClarity: IScoredField;
    communicationStyle: IScoredField;
    completeness: IScoredField;
  };

  strengths: string[];
  weaknesses: string[];
  improvements: {
    suggestion: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }[];

  clientAnalysis: {
    communicationStyle: string;
    decisionDriver: string;
    urgency: "Low" | "Medium" | "High";
    budgetSensitivity: "Low" | "Medium" | "High";
    riskLevel: "Low" | "Medium" | "High";
    longTermPotential: boolean;
    expectedExperience: string;
    confidence: number;
  };

  toneMatch: {
    clientTone: string;
    proposalTone: string;
    score: number;       // locally computed
    suggestion: string;  // Gemini-generated
  };

  painPointCoverage: PainPointResult[];
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    overused: string[];
  };

  winChecklist: WinChecklistItem[];

  successPrediction: {
    probability: number;        // locally computed weighted formula
    explanation: string;        // Gemini-generated
    factors: Record<string, number>;
  };

  coachingTips: string[];

  optimizedVersion?: string;
  optimizedDiff?: IDiffChunk[];

  proposalText: string;
  requestMetadata: AiRequestMetadata;
  analyzedAt: Date;
}

export interface AnalysisInput {
  proposalText: string;
  jobPost: string;
  clientName?: string;
  freelancerContext?: string;
  cachedIntelligence?: IProposalIntelligence | null;
}

export interface OptimizeResult {
  optimized: string;
  diff: IDiffChunk[];
  changes: string[];
  metadata: AiRequestMetadata;
}

export interface RewriteSectionResult {
  rewritten: string;
  diff: IDiffChunk[];
  changes: string[];
  metadata: AiRequestMetadata;
}

export type ProposalSectionKey =
  | "executiveSummary"
  | "scopeOfWork"
  | "timelineAndMilestones"
  | "callToAction"
  | "pricingExplanation";

export interface ComparisonMatrix {
  proposals: {
    id: string;
    label: string;
    overallScore: number;
    sectionScores: Record<string, number>;
    successProbability: number;
  }[];
  winners: Record<string, string>; // dimension -> proposal id/label
  recommendation: string;
}

// ─── GEMINI RESPONSE SHAPE (partial — local fills the rest) ──────────────────

interface GeminiAnalysisResult {
  sectionScores: {
    professionalism: { score: number; reason: string; confidence: number };
    personalization: { score: number; reason: string; confidence: number };
    confidence: { score: number; reason: string; confidence: number };
    structure: { score: number; reason: string; confidence: number };
    grammar: { score: number; reason: string; confidence: number };
    callToAction: { score: number; reason: string; confidence: number };
    valueProp: { score: number; reason: string; confidence: number };
    clientFocus: { score: number; reason: string; confidence: number };
    communicationStyle: { score: number; reason: string; confidence: number };
    completeness: { score: number; reason: string; confidence: number };
  };
  strengths: string[];
  weaknesses: string[];
  improvements: { suggestion: string; reason: string; priority: "high" | "medium" | "low" }[];
  clientAnalysis: {
    communicationStyle: string;
    decisionDriver: string;
    urgency: "Low" | "Medium" | "High";
    budgetSensitivity: "Low" | "Medium" | "High";
    riskLevel: "Low" | "Medium" | "High";
    longTermPotential: boolean;
    expectedExperience: string;
    confidence: number;
  };
  toneMatch: {
    clientTone: string;
    proposalTone: string;
    suggestion: string;
  };
  successPrediction: { explanation: string };
  coachingTips: string[];
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────

export class ProposalIntelligenceEngine extends AiCore {
  /**
   * MAIN ENTRY POINT — hybrid local + Gemini analysis with caching.
   */
  static async analyzeProposal(input: AnalysisInput): Promise<IProposalIntelligence> {
    const { proposalText, jobPost, clientName, freelancerContext, cachedIntelligence } = input;

    // 1. Always run local analysis (no cost, instant)
    const local = ProposalLocalAnalyzer.analyze(proposalText, jobPost, clientName);

    // 2. Cache check: if hash matches stored intelligence, return immediately
    if (cachedIntelligence && cachedIntelligence.contentHash === local.contentHash) {
      return {
        ...cachedIntelligence,
        requestMetadata: this.cacheHitMetadata(),
      };
    }

    // 3. Call Gemini for reasoning-heavy dimensions
    let geminiResult: GeminiCallResult<GeminiAnalysisResult>;

    if (this.hasApiKey()) {
      const prompt = this.buildAnalysisPrompt(proposalText, jobPost, local, freelancerContext);
      try {
        geminiResult = await this.callGemini<GeminiAnalysisResult>(prompt);
      } catch (err) {
        console.error("[ProposalIntelligence] Gemini call failed, using mock:", err);
        geminiResult = await this.mockFallback<GeminiAnalysisResult>(
          this.buildMockGeminiResult(local),
          0,
          ""
        );
      }
    } else {
      geminiResult = await this.mockFallback<GeminiAnalysisResult>(
        this.buildMockGeminiResult(local),
        1200,
        ""
      );
    }

    // 4. Merge local + Gemini outputs
    return this.mergeAnalysis(proposalText, local, geminiResult.data, geminiResult.metadata);
  }

  /**
   * Optimize the entire proposal for flow, clarity, conciseness, personalization.
   */
  static async optimizeProposal(
    proposalText: string,
    jobPost: string,
    freelancerContext: string = "",
    targetAreas: string[] = []
  ): Promise<OptimizeResult> {
    const areasText = targetAreas.length > 0
      ? `Focus especially on: ${targetAreas.join(", ")}.`
      : "Improve all dimensions equally.";

    const prompt = `
You are an expert freelance proposal editor.

${freelancerContext ? `Freelancer Context:\n${freelancerContext}\n` : ""}

Client Job Post:
"""
${jobPost}
"""

Original Proposal:
"""
${proposalText}
"""

Task: Rewrite the proposal to improve flow, readability, conciseness, personalization, and CTA strength. 
Do NOT change the freelancer's core offering, pricing, or intent.
${areasText}

Return a JSON object with this exact shape:
{
  "optimized": "<full rewritten proposal as a single string>",
  "changes": ["<description of change 1>", "<description of change 2>", ...]
}

Return ONLY raw JSON. No markdown code blocks.
`;

    let result: GeminiCallResult<{ optimized: string; changes: string[] }>;
    if (this.hasApiKey()) {
      result = await this.callGemini<{ optimized: string; changes: string[] }>(prompt);
    } else {
      result = await this.mockFallback(
        {
          optimized: proposalText + "\n\n[Optimized version would appear here with improved flow and stronger CTA.]",
          changes: [
            "Strengthened the opening to directly address client pain points",
            "Added specific portfolio reference in paragraph 2",
            "Replaced passive CTA with direct call-to-action sentence",
            "Shortened paragraph 3 for better readability",
            "Clarified pricing section with clearer value justification",
          ],
        },
        1000,
        prompt
      );
    }

    const diff = this.computeDiff(proposalText, result.data.optimized);
    return {
      optimized: result.data.optimized,
      diff,
      changes: result.data.changes,
      metadata: result.metadata,
    };
  }

  /**
   * Rewrite a single named proposal section.
   */
  static async rewriteSection(
    section: ProposalSectionKey,
    sectionText: string,
    jobPost: string,
    freelancerContext: string = "",
    reason?: string
  ): Promise<RewriteSectionResult> {
    const sectionLabels: Record<ProposalSectionKey, string> = {
      executiveSummary: "Executive Summary",
      scopeOfWork: "Scope of Work",
      timelineAndMilestones: "Timeline & Milestones",
      callToAction: "Call to Action",
      pricingExplanation: "Pricing Explanation",
    };

    const sectionLabel = sectionLabels[section];
    const reasonText = reason ? `Specific issue to fix: ${reason}` : "";

    const prompt = `
You are an expert freelance proposal writer.

${freelancerContext ? `Freelancer Context:\n${freelancerContext}\n` : ""}

Client Job Post:
"""
${jobPost}
"""

Original "${sectionLabel}" section:
"""
${sectionText}
"""

Task: Rewrite ONLY the "${sectionLabel}" section.
${reasonText}
Improve: personalization, clarity, confidence, and conversion potential.
Do NOT add content that belongs in other sections.

Return a JSON object:
{
  "rewritten": "<improved section text>",
  "changes": ["<change 1>", "<change 2>", ...]
}

Return ONLY raw JSON. No markdown code blocks.
`;

    let result: GeminiCallResult<{ rewritten: string; changes: string[] }>;
    if (this.hasApiKey()) {
      result = await this.callGemini<{ rewritten: string; changes: string[] }>(prompt);
    } else {
      result = await this.mockFallback(
        {
          rewritten: sectionText + "\n\n[Rewritten section would appear here with improved personalization and clarity.]",
          changes: [
            `Personalized the ${sectionLabel} to directly reference client's requirements`,
            "Removed generic phrasing and replaced with specific value statement",
            "Added confidence-building language",
          ],
        },
        800,
        prompt
      );
    }

    const diff = this.computeDiff(sectionText, result.data.rewritten);
    return {
      rewritten: result.data.rewritten,
      diff,
      changes: result.data.changes,
      metadata: result.metadata,
    };
  }

  /**
   * Compare multiple proposals by their intelligence data.
   * Returns a ComparisonMatrix with per-dimension winners.
   */
  static compareProposals(
    intelligences: Array<IProposalIntelligence & { id: string; label: string }>
  ): ComparisonMatrix {
    const dimensions = [
      "professionalism", "personalization", "readability", "confidence",
      "structure", "grammar", "callToAction", "valueProp",
      "clientFocus", "pricingClarity", "communicationStyle", "completeness",
    ] as const;

    const winners: Record<string, string> = {};

    for (const dim of dimensions) {
      let bestId = intelligences[0].id;
      let bestScore = intelligences[0].sectionScores[dim]?.score ?? 0;
      for (const intel of intelligences.slice(1)) {
        const score = intel.sectionScores[dim]?.score ?? 0;
        if (score > bestScore) {
          bestScore = score;
          bestId = intel.id;
        }
      }
      winners[dim] = bestId;
    }

    // Winner by overall
    const sortedByOverall = [...intelligences].sort((a, b) => b.overallScore - a.overallScore);
    const topProposal = sortedByOverall[0];
    const recommendation = `Proposal "${topProposal.label}" scores highest overall (${topProposal.overallScore}/100) and has a ${topProposal.successPrediction.probability}% success probability. It wins in ${Object.values(winners).filter((v) => v === topProposal.id).length}/${dimensions.length} dimensions.`;

    return {
      proposals: intelligences.map((intel) => ({
        id: intel.id,
        label: intel.label,
        overallScore: intel.overallScore,
        sectionScores: Object.fromEntries(
          Object.entries(intel.sectionScores).map(([k, v]) => [k, v.score])
        ),
        successProbability: intel.successPrediction.probability,
      })),
      winners,
      recommendation,
    };
  }

  /**
   * Compute a Myers-style diff between two text strings.
   * Returns DiffChunk[] for the DiffViewer component.
   */
  static computeDiff(original: string, revised: string): IDiffChunk[] {
    // Word-level diff for readability
    const origWords = original.split(/(\s+)/);
    const revWords = revised.split(/(\s+)/);

    const m = origWords.length;
    const n = revWords.length;

    // LCS table
    const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        lcs[i][j] =
          origWords[i - 1] === revWords[j - 1]
            ? lcs[i - 1][j - 1] + 1
            : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }

    // Backtrack
    const chunks: IDiffChunk[] = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origWords[i - 1] === revWords[j - 1]) {
        chunks.unshift({ type: "equal", value: origWords[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        chunks.unshift({ type: "insert", value: revWords[j - 1] });
        j--;
      } else {
        chunks.unshift({ type: "delete", value: origWords[i - 1] });
        i--;
      }
    }

    // Merge consecutive same-type chunks to reduce array size
    const merged: IDiffChunk[] = [];
    for (const chunk of chunks) {
      const last = merged[merged.length - 1];
      if (last && last.type === chunk.type) {
        last.value += chunk.value;
      } else {
        merged.push({ ...chunk });
      }
    }

    return merged;
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

  private static buildAnalysisPrompt(
    proposalText: string,
    jobPost: string,
    local: LocalAnalysisResult,
    freelancerContext?: string
  ): string {
    return `
You are an expert freelance proposal coach with 10+ years of experience reviewing winning proposals.

${freelancerContext ? `Freelancer Identity Context:\n${freelancerContext}\n` : ""}

Client Job Post:
"""
${jobPost}
"""

Proposal to Analyze:
"""
${proposalText}
"""

Pre-computed local metrics (do NOT re-compute these):
- Word count: ${local.wordCount}
- Matched keywords: ${local.matchedKeywords.slice(0, 10).join(", ")}
- Missing keywords: ${local.missingKeywords.slice(0, 8).join(", ")}
- Win checklist pass rate: ${local.winChecklist.filter((i) => i.passed).length}/10

Your task: Analyze the proposal and return ONLY the following JSON structure.
Do NOT compute overallScore, toneMatch.score, painPointCoverage, keywordAnalysis, winChecklist, 
or successPrediction.probability — those are already computed locally.

Return this exact JSON shape:
{
  "sectionScores": {
    "professionalism": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "personalization": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "confidence": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "structure": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "grammar": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "callToAction": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "valueProp": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "clientFocus": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "communicationStyle": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 },
    "completeness": { "score": 0-100, "reason": "...", "confidence": 0.0-1.0 }
  },
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "improvements": [
    { "suggestion": "...", "reason": "...", "priority": "high|medium|low" }
  ],
  "clientAnalysis": {
    "communicationStyle": "...",
    "decisionDriver": "...",
    "urgency": "Low|Medium|High",
    "budgetSensitivity": "Low|Medium|High",
    "riskLevel": "Low|Medium|High",
    "longTermPotential": true|false,
    "expectedExperience": "...",
    "confidence": 0.0-1.0
  },
  "toneMatch": {
    "clientTone": "...",
    "proposalTone": "...",
    "suggestion": "..."
  },
  "successPrediction": {
    "explanation": "..."
  },
  "coachingTips": ["...", "...", "..."]
}

Every score must have a "reason" (1–2 sentences). Be specific, not generic.
Every improvement must have a "reason" explaining WHY it will help conversion.
Return ONLY raw JSON. No markdown code blocks.
`;
  }

  private static mergeAnalysis(
    proposalText: string,
    local: LocalAnalysisResult,
    gemini: GeminiAnalysisResult,
    metadata: AiRequestMetadata
  ): IProposalIntelligence {
    // Readability and pricingClarity scores come from local; others from Gemini
    const readabilityScore = local.fleschReadabilityScore;
    const readabilityReason = `Flesch readability score ${readabilityScore}/100. ${local.readabilityLabel} to read. Average sentence length: ${local.avgWordsPerSentence} words.`;
    const pricingScore = local.localSectionScores.pricingClarity;
    const pricingReason = pricingScore >= 75
      ? "Pricing language is clearly present with specific figures or ranges."
      : pricingScore >= 40
      ? "Some pricing indicators found, but the explanation lacks clarity."
      : "No clear pricing or budget language found — client is left guessing.";

    const sectionScores = {
      professionalism: gemini.sectionScores.professionalism,
      personalization: gemini.sectionScores.personalization,
      readability: { score: readabilityScore, reason: readabilityReason, confidence: 0.98 },
      confidence: gemini.sectionScores.confidence,
      structure: gemini.sectionScores.structure,
      grammar: gemini.sectionScores.grammar,
      callToAction: gemini.sectionScores.callToAction,
      valueProp: gemini.sectionScores.valueProp,
      clientFocus: gemini.sectionScores.clientFocus,
      pricingClarity: { score: pricingScore, reason: pricingReason, confidence: 0.99 },
      communicationStyle: gemini.sectionScores.communicationStyle,
      completeness: gemini.sectionScores.completeness,
    };

    // Overall score = weighted average (local + Gemini)
    const scores = Object.values(sectionScores).map((s) => s.score);
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const overallConfidence =
      Object.values(sectionScores).reduce((a, b) => a + b.confidence, 0) /
      Object.values(sectionScores).length;

    // Success probability: weighted formula
    const factors = {
      personalization: sectionScores.personalization.score / 100,
      callToAction: sectionScores.callToAction.score / 100,
      pricingClarity: sectionScores.pricingClarity.score / 100,
      clientFocus: sectionScores.clientFocus.score / 100,
      completeness: sectionScores.completeness.score / 100,
      toneMatch: local.toneMatchScore / 100,
      keywordCoverage:
        local.matchedKeywords.length /
        Math.max(1, local.matchedKeywords.length + local.missingKeywords.length),
      winChecklistScore:
        local.winChecklist.filter((i) => i.passed).length / local.winChecklist.length,
    };

    const weights: Record<string, number> = {
      personalization: 0.20,
      callToAction: 0.18,
      clientFocus: 0.15,
      completeness: 0.12,
      pricingClarity: 0.10,
      toneMatch: 0.08,
      keywordCoverage: 0.09,
      winChecklistScore: 0.08,
    };

    const probability = Math.round(
      Object.entries(factors).reduce((acc, [key, val]) => acc + val * (weights[key] || 0.05), 0) * 100
    );

    const overallReason =
      overallScore >= 85
        ? `Strong proposal overall. Scores well across professionalism, personalization, and CTA. Focus remaining improvements on: ${local.missingKeywords.slice(0, 3).join(", ")}.`
        : overallScore >= 70
        ? `Solid proposal with room for improvement. Key areas to focus on: ${Object.entries(sectionScores).sort((a, b) => a[1].score - b[1].score).slice(0, 2).map(([k]) => k).join(", ")}.`
        : `Proposal needs significant improvement. Priority: strengthen personalization, CTA, and address missing client keywords.`;

    return {
      contentHash: local.contentHash,
      overallScore,
      overallReason,
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      sectionScores,
      strengths: gemini.strengths,
      weaknesses: gemini.weaknesses,
      improvements: gemini.improvements,
      clientAnalysis: gemini.clientAnalysis,
      toneMatch: {
        clientTone: gemini.toneMatch.clientTone,
        proposalTone: gemini.toneMatch.proposalTone,
        score: local.toneMatchScore,
        suggestion: gemini.toneMatch.suggestion,
      },
      painPointCoverage: local.painPoints,
      keywordAnalysis: {
        matched: local.matchedKeywords,
        missing: local.missingKeywords,
        overused: local.overusedKeywords,
      },
      winChecklist: local.winChecklist,
      successPrediction: {
        probability,
        explanation: gemini.successPrediction.explanation,
        factors: Object.fromEntries(
          Object.entries(factors).map(([k, v]) => [k, Math.round(v * 100)])
        ),
      },
      coachingTips: gemini.coachingTips,
      proposalText,
      requestMetadata: metadata,
      analyzedAt: new Date(),
    };
  }

  private static buildMockGeminiResult(local: LocalAnalysisResult): GeminiAnalysisResult {
    const kw = local.matchedKeywords.slice(0, 3).join(", ") || "relevant skills";
    const missing = local.missingKeywords.slice(0, 2).join(", ") || "portfolio references";

    return {
      sectionScores: {
        professionalism: { score: 88, reason: "The proposal maintains a professional tone throughout with clear structure and appropriate language.", confidence: 0.87 },
        personalization: { score: 82, reason: `The proposal references key job requirements including ${kw}, showing the freelancer read the brief carefully.`, confidence: 0.83 },
        confidence: { score: 85, reason: "Language is assertive and outcome-focused. The freelancer presents themselves as a capable expert.", confidence: 0.80 },
        structure: { score: 84, reason: "Clear sections with logical flow from problem to solution to next steps.", confidence: 0.85 },
        grammar: { score: 91, reason: "Grammar and spelling are clean throughout. No notable errors detected.", confidence: 0.90 },
        callToAction: { score: local.localSectionScores.ctaStrength, reason: local.localSectionScores.ctaStrength >= 70 ? "CTA is clear and invites a response." : "CTA is present but could be more direct and compelling.", confidence: 0.88 },
        valueProp: { score: 80, reason: "Value proposition is present but could be more quantified with specific outcomes or ROI examples.", confidence: 0.79 },
        clientFocus: { score: 83, reason: "The proposal mostly addresses client needs but could benefit from directly quoting the client's language.", confidence: 0.82 },
        communicationStyle: { score: 86, reason: "Communication style is warm yet professional, appropriate for the platform and project type.", confidence: 0.84 },
        completeness: { score: 81, reason: `Proposal covers core sections well. Missing: ${missing}. Adding these would increase completeness significantly.`, confidence: 0.86 },
      },
      strengths: [
        "Personalized introduction that directly addresses the client's project",
        "Clear understanding of technical requirements",
        "Professional tone matched to the platform",
        "Structured presentation making it easy to scan",
      ],
      weaknesses: [
        `Missing reference to: ${missing}`,
        "Call-to-action could be more conversion-focused",
        "Pricing explanation lacks value justification",
        "No social proof or past work examples included",
      ],
      improvements: [
        { suggestion: `Add a specific portfolio link or case study related to this project type`, reason: `Portfolio evidence can increase conversion rates by 40%. The client needs proof before committing.`, priority: "high" },
        { suggestion: `Reference the client's exact timeline from the job post`, reason: `Mirroring the client's own language builds psychological trust and shows attention to detail.`, priority: "high" },
        { suggestion: `End with a specific question like "Would Tuesday work for a 15-minute call?"`, reason: `Questions create micro-commitments and are statistically more likely to get a response than passive CTAs.`, priority: "medium" },
        { suggestion: `Add one sentence explaining why your rate reflects the project value`, reason: `Clients who understand pricing rationale are less likely to negotiate down aggressively.`, priority: "medium" },
        { suggestion: `Mention a relevant technology or tool from the job post by name`, reason: `Technical name-dropping signals expertise without over-explaining.`, priority: "low" },
      ],
      clientAnalysis: {
        communicationStyle: "Direct and outcome-focused",
        decisionDriver: "Quality and reliability over price",
        urgency: local.winChecklist.find(i => i.id === "timeline")?.passed ? "High" : "Medium",
        budgetSensitivity: "Medium",
        riskLevel: "Medium",
        longTermPotential: true,
        expectedExperience: "Mid-to-senior level with relevant portfolio",
        confidence: 0.78,
      },
      toneMatch: {
        clientTone: "Professional and direct",
        proposalTone: "Friendly-professional",
        suggestion: "Your tone is close to the client's. Consider slightly more direct language in the opening sentence to immediately signal confidence.",
      },
      successPrediction: {
        explanation: `This proposal has strong personalization and professional structure. Key risk factors are the missing portfolio reference and a relatively passive CTA. Strengthening these two elements could push success probability above 90%.`,
      },
      coachingTips: [
        "If the client values fast communication, mention your response time SLA in the opening",
        "For clients seeking long-term work, explicitly state your availability for ongoing collaboration",
        "On Upwork, the first 2 lines of your proposal appear as preview — make them count",
        "Address the client's biggest fear first: 'I've done this exact type of project before'",
        "Mirror the client's vocabulary from the job post — if they say 'streamline', you say 'streamline'",
      ],
    };
  }
}
