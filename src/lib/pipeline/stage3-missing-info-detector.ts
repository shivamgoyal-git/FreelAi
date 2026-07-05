/**
 * Stage 3 — Missing Information Detector
 *
 * Responsibility: Check whether critical information is absent from the job
 * post and the user's inputs. Return structured questions to the UI instead
 * of letting Gemini hallucinate answers.
 *
 * This stage is purely local and deterministic — no API call.
 *
 * Returns: { complete: true } or { complete: false, questions: MissingInfoQuestion[] }
 */

import type { JobIntelligence } from "./stage1-job-intelligence";

export interface MissingInfoQuestion {
  field: "budget" | "timeline" | "deliverables" | "pricing-model" | "revision-rounds" | "target-audience" | "other";
  question: string;
  /** If true, blocking — the pipeline should pause until answered */
  blocking: boolean;
  /** Suggested default the user can accept with one click */
  suggestedDefault?: string;
}

export interface MissingInfoResult {
  complete: boolean;
  questions: MissingInfoQuestion[];
}

export interface MissingInfoInput {
  jobIntelligence: JobIntelligence;
  userBudget: number | null;
  userTimeline: string | null;
  userTone: string;
  freelancerHasPortfolio: boolean;
  freelancerHasPricing: boolean;
}

export class MissingInfoDetector {
  /**
   * Determine whether the pipeline has enough information to generate a proposal.
   * Returns questions for anything critical that's missing.
   */
  static check(input: MissingInfoInput): MissingInfoResult {
    const questions: MissingInfoQuestion[] = [];
    const {
      jobIntelligence,
      userBudget,
      userTimeline,
      freelancerHasPortfolio,
      freelancerHasPricing,
    } = input;

    // ── Budget ─────────────────────────────────────────────────────────────────
    const budgetMissingFromJob = jobIntelligence.budget === "Not specified"
      || jobIntelligence.missingInfo.some((m) => m.toLowerCase().includes("budget"));
    const budgetMissingFromUser = !userBudget || userBudget === 0;

    if (budgetMissingFromJob && budgetMissingFromUser && !freelancerHasPricing) {
      questions.push({
        field: "budget",
        question: "The job post doesn't mention a budget. How would you like to handle pricing in this proposal?",
        blocking: false,
        suggestedDefault: "Omit pricing — mention I'm happy to discuss rates",
      });
    }

    // ── Timeline ───────────────────────────────────────────────────────────────
    const timelineMissingFromJob = jobIntelligence.timeline === "Flexible"
      || jobIntelligence.missingInfo.some((m) => m.toLowerCase().includes("timeline"));
    const timelineMissingFromUser = !userTimeline || userTimeline.trim() === "";

    if (timelineMissingFromJob && timelineMissingFromUser) {
      questions.push({
        field: "timeline",
        question: "The job post doesn't specify a timeline. Would you like to include a timeline estimate or leave it out?",
        blocking: false,
        suggestedDefault: "Omit timeline — ask the client during discussion",
      });
    }

    // ── Deliverables ───────────────────────────────────────────────────────────
    const vagueDeliverables =
      jobIntelligence.deliverables.length === 0 ||
      (jobIntelligence.deliverables.length === 1 &&
        jobIntelligence.deliverables[0].toLowerCase().includes("brief"));

    if (vagueDeliverables) {
      questions.push({
        field: "deliverables",
        question: "The job post has vague deliverables. Should the proposal ask the client to clarify scope, or assume a standard set for this project type?",
        blocking: false,
        suggestedDefault: "Assume standard deliverables for this project type",
      });
    }

    // ── Portfolio ──────────────────────────────────────────────────────────────
    if (!freelancerHasPortfolio) {
      questions.push({
        field: "other",
        question: "You have no portfolio projects added. Proposals without portfolio references score significantly lower. Would you like to proceed without portfolio evidence?",
        blocking: false,
        suggestedDefault: "Proceed without portfolio reference",
      });
    }

    return {
      complete: questions.filter((q) => q.blocking).length === 0,
      questions,
    };
  }
}
