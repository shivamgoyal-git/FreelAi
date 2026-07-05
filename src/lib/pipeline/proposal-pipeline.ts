/**
 * Proposal Pipeline — Main Orchestrator
 *
 * Runs all 11 stages in order and returns the final proposal + metadata.
 *
 * Gemini call budget:
 *  - Stage 1: 1 call (cached by job hash — 0 if seen before)
 *  - Stage 6: 1 call (always)
 *  - Stage 9: 1 call (conditional — only if validation fails)
 *  ────────────────────────────────────────────
 *  Typical: 1–2 Gemini calls per generation
 *  Worst case: 3 calls
 */

import { JobIntelligenceEngine, type JobIntelligence } from "./stage1-job-intelligence";
import { PortfolioMatcher, type IMatchedPortfolioProject } from "../portfolio-matcher";
import { MissingInfoDetector, type MissingInfoResult, type MissingInfoInput } from "./stage3-missing-info-detector";
import { BlueprintBuilder, type ProposalBlueprint } from "./stage4-blueprint-builder";
import { FewShotRetriever, type RetrievedExamples } from "./stage5-retrieval";
import { ProposalWriter, type WriterResult } from "./stage6-writer";
import { LocalHumanizer, type HumanizationResult } from "./stage7-local-humanizer";
import { ValidationEngine, type GenerationContext, type ValidationEngineResult } from "../validation-engine";
import { SimilarityDeduplicator, type SimilarityResult } from "./stage10-similarity";
import { ProposalCopilot, type CopilotAnalysis } from "./stage11-copilot";
import { AiContextService } from "../ai-context-service";
import { ProposalScorer, type ProposalScorerResult } from "../proposal-scorer";
import type { AiRequestMetadata } from "../ai-core";
import connectDB from "../mongodb";
import Proposal from "@/models/Proposal";

// ─── INPUT / OUTPUT TYPES ────────────────────────────────────────────────────

export interface PipelineInput {
  userId: string;
  clientName: string;
  platform: string;
  jobPost: string;
  budget: number;
  timeline: string;
  tone: string;
  proposalId?: string; // For versioning
}

export interface PipelineResult {
  /** The final, clean proposal text */
  proposalBody: string;
  /** Raw with debug origin annotations (dev only) */
  rawProposalBody: string;

  /** Stage outputs for the debug panel */
  jobIntelligence: JobIntelligence;
  matchedPortfolio: IMatchedPortfolioProject[];
  blueprint: ProposalBlueprint;
  humanizationResult: HumanizationResult;
  validationResult: ValidationEngineResult;
  similarityResult: SimilarityResult;
  copilotAnalysis: CopilotAnalysis;
  scorerResult: ProposalScorerResult;

  /** Missing info questions (returned when info is absent, pipeline skips writing) */
  missingInfoResult: MissingInfoResult;

  /** Metadata */
  generationMetadata: GenerationMetadata;
}

export interface GenerationMetadata {
  pipelineVersion: string;
  generationId: string;
  totalGeminiCalls: number;
  stage1CacheHit: boolean;
  validationAttempts: number;
  deduplicationApplied: boolean;
  isMockMode: boolean;
  totalTimeMs: number;
  stage1TimeMs: number;
  stage6TimeMs: number;
  stage6Model: string;
  wordCount: number;
  charCount: number;
}

// ─── PIPELINE ────────────────────────────────────────────────────────────────

export async function runProposalPipeline(input: PipelineInput): Promise<PipelineResult> {
  const startTime = Date.now();
  const generationId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const isMockMode = !process.env.GEMINI_API_KEY;

  console.log(`\n[Pipeline] ── Starting generation ${generationId} ──`);
  console.log(`[Pipeline] Client: ${input.clientName} | Platform: ${input.platform} | Mock: ${isMockMode}`);

  await connectDB();

  let totalGeminiCalls = 0;
  let validationAttempts = 1;

  // ─── STAGE 1: JOB INTELLIGENCE ────────────────────────────────────────────
  const stage1Start = Date.now();
  console.log("[Pipeline] Stage 1: Job Intelligence...");
  const jobResult = await JobIntelligenceEngine.analyze(input.jobPost);
  const jobIntelligence = jobResult.data;
  const stage1TimeMs = Date.now() - stage1Start;
  const stage1CacheHit = jobResult.metadata.cacheHit;
  if (!stage1CacheHit) totalGeminiCalls++;

  console.log(`[Pipeline] Stage 1 done. Industry: ${jobIntelligence.industry}, Urgency: ${jobIntelligence.urgency}, Cache: ${stage1CacheHit}`);

  // ─── STAGE 2: PORTFOLIO MATCHING ──────────────────────────────────────────
  console.log("[Pipeline] Stage 2: Portfolio Matching...");
  const matchedPortfolio = await PortfolioMatcher.findTopMatches(input.userId, jobIntelligence as any);
  console.log(`[Pipeline] Stage 2 done. Matched: ${matchedPortfolio.length} project(s).`);

  // ─── STAGE 3: MISSING INFO DETECTION ─────────────────────────────────────
  console.log("[Pipeline] Stage 3: Missing Info Detection...");
  const freelancerProfile = await AiContextService.getProfile(input.userId);
  const freelancerContextBlock = await AiContextService.getAiSystemContext(input.userId);

  const missingInfoInput: MissingInfoInput = {
    jobIntelligence,
    userBudget: input.budget || null,
    userTimeline: input.timeline || null,
    userTone: input.tone,
    freelancerHasPortfolio: matchedPortfolio.length > 0,
    freelancerHasPricing: !!(freelancerProfile?.pricing?.hourlyRate && freelancerProfile.pricing.hourlyRate > 0),
  };
  const missingInfoResult = MissingInfoDetector.check(missingInfoInput);

  // Note: we proceed even if missingInfoResult.complete is false
  // The caller (route.ts) decides whether to return questions to UI or proceed
  // For non-blocking questions we always continue

  // ─── STAGE 4: BLUEPRINT BUILDER ──────────────────────────────────────────
  console.log("[Pipeline] Stage 4: Building Blueprint...");
  const blueprintInput = {
    jobIntelligence,
    matchedPortfolio,
    freelancerProfile: freelancerProfile
      ? {
          fullName: freelancerProfile.personal?.fullName || "",
          professionalTitle: freelancerProfile.personal?.professionalTitle || "",
          yearsOfExperience: freelancerProfile.professional?.yearsOfExperience || 0,
          skills: freelancerProfile.professional?.skills || [],
          bio: freelancerProfile.professional?.bio || "",
          hourlyRate: freelancerProfile.pricing?.hourlyRate || 0,
          pricingModel: freelancerProfile.pricing?.pricingModel || "Hourly",
          currency: freelancerProfile.pricing?.currency || "USD",
        }
      : null,
    userInput: {
      clientName: input.clientName,
      platform: input.platform,
      budget: input.budget,
      timeline: input.timeline,
      tone: input.tone,
    },
  };
  const blueprint = BlueprintBuilder.build(blueprintInput);
  console.log(`[Pipeline] Stage 4 done. Template: ${blueprint.templateId}, Persona: ${blueprint.personaId}`);

  // ─── STAGE 5: FEW-SHOT RETRIEVAL ─────────────────────────────────────────
  console.log("[Pipeline] Stage 5: Few-Shot Retrieval...");
  const retrievedExamples = FewShotRetriever.retrieve(jobIntelligence);
  console.log(`[Pipeline] Stage 5 done. Retrieved ${retrievedExamples.examples.length} examples from category: ${retrievedExamples.category}`);

  // ─── STAGE 6: SINGLE GEMINI WRITE ────────────────────────────────────────
  console.log("[Pipeline] Stage 6: Writing Proposal (Gemini)...");
  const stage6Start = Date.now();
  const writerResult = await ProposalWriter.write({
    blueprint,
    retrievedExamples,
    freelancerContextBlock,
    jobPost: input.jobPost,
  });
  const stage6TimeMs = Date.now() - stage6Start;
  totalGeminiCalls++;
  let proposalText = writerResult.proposalText;
  console.log(`[Pipeline] Stage 6 done in ${stage6TimeMs}ms. Words: ${proposalText.split(/\s+/).filter(Boolean).length}`);

  // ─── STAGE 7: LOCAL HUMANIZATION ─────────────────────────────────────────
  console.log("[Pipeline] Stage 7: Local Humanization...");
  const humanizationResult = LocalHumanizer.humanize(proposalText);
  proposalText = humanizationResult.text;

  // ─── STAGE 8: VALIDATION ──────────────────────────────────────────────────
  console.log("[Pipeline] Stage 8: Validation...");
  const generationContext: GenerationContext = {
    freelancerProfile,
    matchedPortfolio,
    currentJobAnalysis: jobIntelligence as any,
    rawJobPost: input.jobPost,
    currentUserInput: {
      clientName: input.clientName,
      platform: input.platform,
      budget: input.budget,
      timeline: input.timeline,
      tone: input.tone,
    },
    aiPreferences: freelancerProfile?.aiPreferences || {},
    generationId,
    createdAt: new Date(),
  };

  let validationResult = ValidationEngine.validate(proposalText, generationContext);

  // ─── STAGE 9: CONDITIONAL GEMINI REWRITE (validation failure) ────────────
  if (!validationResult.passed && process.env.GEMINI_API_KEY) {
    validationAttempts++;
    totalGeminiCalls++;
    console.log(`[Pipeline] Stage 9: Validation failed (${validationResult.violations.length} violations). Targeted rewrite...`);

    const retryPrompt = `The following proposal failed validation with these specific issues:
${validationResult.violations.map((v) => `- ${v}`).join("\n")}

Fix ONLY the violations listed above. Keep everything else exactly as written.
Return ONLY the corrected proposal text. No JSON, no explanation.

Proposal to fix:
"""
${proposalText}
"""`;

    try {
      const retryResult = await ProposalWriter["callGeminiRawText"](retryPrompt);
      proposalText = LocalHumanizer.humanize(retryResult.data).text;
      validationResult = ValidationEngine.validate(proposalText, generationContext);
      console.log(`[Pipeline] Stage 9 done. Validation now: ${validationResult.passed ? "PASSED" : "STILL FAILING"}`);
    } catch (err) {
      console.error("[Pipeline] Stage 9 retry failed:", err);
    }
  }

  // ─── STAGE 10: SIMILARITY DEDUPLICATION ──────────────────────────────────
  console.log("[Pipeline] Stage 10: Similarity Check...");
  const pastProposals = await fetchPastProposalBodies(input.userId, 5);
  const similarityResult = SimilarityDeduplicator.deduplicate(
    proposalText,
    pastProposals,
    jobIntelligence,
    blueprint
  );
  proposalText = similarityResult.proposalText;

  // ─── STAGE 11: COPILOT ANALYSIS ──────────────────────────────────────────
  console.log("[Pipeline] Stage 11: Copilot Analysis...");
  const copilotAnalysis = ProposalCopilot.analyze(
    proposalText,
    jobIntelligence,
    matchedPortfolio,
    similarityResult.maxSimilarityScore
  );

  // ─── SCORING ─────────────────────────────────────────────────────────────
  const scorerResult = ProposalScorer.score(proposalText, jobIntelligence as any, matchedPortfolio);

  // ─── FINALIZE ─────────────────────────────────────────────────────────────
  const wordCount = proposalText.split(/\s+/).filter(Boolean).length;
  const totalTimeMs = Date.now() - startTime;

  const generationMetadata: GenerationMetadata = {
    pipelineVersion: "v4.0 (Phase-11-Multi-Stage)",
    generationId,
    totalGeminiCalls,
    stage1CacheHit,
    validationAttempts,
    deduplicationApplied: similarityResult.deduplicationApplied,
    isMockMode,
    totalTimeMs,
    stage1TimeMs,
    stage6TimeMs,
    stage6Model: writerResult.metadata.model,
    wordCount,
    charCount: proposalText.length,
  };

  console.log(`[Pipeline] ── Complete in ${totalTimeMs}ms | Gemini calls: ${totalGeminiCalls} | Words: ${wordCount} ──\n`);

  return {
    proposalBody: proposalText,
    rawProposalBody: proposalText,
    jobIntelligence,
    matchedPortfolio,
    blueprint,
    humanizationResult,
    validationResult,
    similarityResult,
    copilotAnalysis,
    scorerResult,
    missingInfoResult,
    generationMetadata,
  };
}

/**
 * Fetch the last N proposalBody strings for a user (for similarity check).
 */
async function fetchPastProposalBodies(userId: string, limit: number): Promise<string[]> {
  try {
    const proposals = await Proposal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return proposals.flatMap((p: any) => {
      const latest = p.versions?.[p.activeVersionIndex || 0];
      return latest?.proposalBody ? [latest.proposalBody] : [];
    });
  } catch {
    return [];
  }
}
