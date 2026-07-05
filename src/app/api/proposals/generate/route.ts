/**
 * POST /api/proposals/generate
 *
 * Phase 11 v4 — Simplified route that delegates entirely to the multi-stage pipeline.
 *
 * This route is now responsible ONLY for:
 *  - Authentication + profile gate
 *  - DB connection + version management
 *  - Calling runProposalPipeline()
 *  - Saving the result and returning the response
 *
 * All proposal generation logic lives in src/lib/pipeline/proposal-pipeline.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { requireFreelancerProfile } from "@/lib/profile-gate";
import { runProposalPipeline } from "@/lib/pipeline/proposal-pipeline";
import Proposal from "@/models/Proposal";

export async function POST(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileGateResponse = await requireFreelancerProfile(session.user.id);
  if (profileGateResponse) return profileGateResponse;

  await connectDB();

  try {
    const {
      clientName,
      platform,
      jobPost,
      budget,
      timeline,
      tone = "Auto",
      proposalId,
    } = await req.json();

    if (!clientName || !jobPost) {
      return NextResponse.json(
        { error: "Client name and Job post are required." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // ─── Run the Pipeline ──────────────────────────────────────────────────
    const pipelineResult = await runProposalPipeline({
      userId,
      clientName,
      platform: platform || "Other",
      jobPost,
      budget: Number(budget) || 0,
      timeline: timeline || "",
      tone,
      proposalId,
    });

    // ─── If missing info has BLOCKING questions, return them to the UI ──────
    if (!pipelineResult.missingInfoResult.complete) {
      const blockingQuestions = pipelineResult.missingInfoResult.questions.filter((q) => q.blocking);
      if (blockingQuestions.length > 0) {
        return NextResponse.json({
          needsInfo: true,
          questions: blockingQuestions,
        });
      }
    }

    // ─── Version tracking ──────────────────────────────────────────────────
    let versionIndex = 0;
    if (proposalId) {
      const existingDoc = await Proposal.findOne({ _id: proposalId, userId });
      if (existingDoc) {
        versionIndex = existingDoc.versions.length;
      }
    }

    const { proposalBody, jobIntelligence, matchedPortfolio, scorerResult, validationResult, copilotAnalysis, similarityResult, generationMetadata } = pipelineResult;

    const isDev = process.env.NODE_ENV === "development" || generationMetadata.isMockMode;

    // ─── Build response payload (matches existing UI contract) ────────────
    const responsePayload = {
      proposalBody,
      rawProposalBodyWithOrigins: pipelineResult.rawProposalBody,

      // Sections (proposal is unified; kept for UI compat)
      sections: {
        executiveSummary: proposalBody,
        scopeOfWork: "Merged in Proposal Body",
        timelineAndMilestones: "Merged in Proposal Body",
        callToAction: "Merged in Proposal Body",
      },

      // Pricing tiers
      pricingBreakdown: {
        basic: {
          price: Number(budget) ? Math.round(Number(budget) * 0.7) : 0,
          description: "Core deliverables",
          timeline: timeline || "3 weeks",
        },
        standard: {
          price: Number(budget) || 0,
          description: "Full scope",
          timeline: timeline || "4 weeks",
        },
        premium: {
          price: Number(budget) ? Math.round(Number(budget) * 1.4) : 0,
          description: "Premium production",
          timeline: timeline || "5 weeks",
        },
      },

      // AI analysis scores
      aiAnalysis: {
        readability: scorerResult.scores.readability.score >= 80 ? "Easy" : scorerResult.scores.readability.score >= 60 ? "Medium" : "Complex",
        personalization: scorerResult.scores.personalization.score,
        professionalism: scorerResult.scores.relevance.score,
        confidence: validationResult.confidence.score,
        urgency: jobIntelligence.urgency,
        budgetSensitivity: jobIntelligence.budgetSensitivity,
        complexity: jobIntelligence.projectComplexity,
        communicationStyle: jobIntelligence.communicationStyle,
      },

      // Score breakdown
      scoreBreakdown: {
        overall: validationResult.confidence.score,
        clarity: scorerResult.scores.readability.score,
        alignment: scorerResult.scores.personalization.score,
        callToAction: scorerResult.scores.ctaQuality.score,
        valueProposition: scorerResult.scores.relevance.score,
      },

      // Intelligence data
      detectedPainPoints: jobIntelligence.painPoints,
      aiSuggestions: [
        scorerResult.scores.ctaQuality.reason,
        scorerResult.scores.portfolioRelevance.reason,
        scorerResult.scores.authenticity.reason,
      ],

      jobAnalysis: jobIntelligence,
      matchedPortfolio,

      explainableScores: {
        ...scorerResult.scores,
        authenticity: { score: validationResult.confidence.score, reason: validationResult.confidence.reason },
      },

      winChecklist: scorerResult.winChecklist,
      winChecklistPercentage: scorerResult.winChecklistPercentage,

      // Pipeline v4 extras
      copilotAnalysis,
      missingInfoQuestions: pipelineResult.missingInfoResult.questions,
      blueprint: isDev ? pipelineResult.blueprint : undefined,
      humanizationResult: isDev ? pipelineResult.humanizationResult : undefined,
      similarityResult: isDev ? pipelineResult.similarityResult : undefined,

      requirementCoverage: validationResult.coverage,
      generationMetadata: {
        ...generationMetadata,
        promptVersion: generationMetadata.pipelineVersion,
      },
      promptVersion: generationMetadata.pipelineVersion,
    };

    console.log(`[generate] Responded. Pipeline: ${generationMetadata.pipelineVersion} | Gemini calls: ${generationMetadata.totalGeminiCalls} | Words: ${generationMetadata.wordCount}`);

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Proposal generation failed";
    console.error("[generate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
