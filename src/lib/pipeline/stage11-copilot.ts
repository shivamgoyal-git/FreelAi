/**
 * Stage 11 — Proposal Copilot
 *
 * Responsibility: Post-generation analysis that provides actionable, specific
 * coaching suggestions — like Grammarly, but for freelance proposals.
 *
 * Entirely local and deterministic. No API call.
 * Runs after the proposal is finalized and is returned alongside the proposal.
 *
 * Returns specific, actionable suggestions with section-level targeting.
 */

import { countForbiddenPhrases } from "./libraries/phrase-filter";
import { LocalHumanizer } from "./stage7-local-humanizer";
import type { JobIntelligence } from "./stage1-job-intelligence";
import type { IMatchedPortfolioProject } from "../portfolio-matcher";

export type SuggestionType = "critical" | "warning" | "tip";
export type SuggestionSection =
  | "opening"
  | "portfolio"
  | "cta"
  | "timeline"
  | "pricing"
  | "length"
  | "tone"
  | "authenticity"
  | "general";

export interface CopilotSuggestion {
  type: SuggestionType;
  section: SuggestionSection;
  message: string;
  action: string;
}

export interface CopilotAnalysis {
  suggestions: CopilotSuggestion[];
  readingGrade: number;
  wordCount: number;
  contractionCount: number;
  estimatedReadTimeSec: number;
  forbiddenPhraseCount: number;
  overallScore: number; // 0–100 human-likeness score
  paragraphCount: number;
  avgSentenceLength: number;
}

export class ProposalCopilot {
  /**
   * Analyze the final proposal and return actionable suggestions.
   */
  static analyze(
    proposalText: string,
    jobIntelligence: JobIntelligence,
    matchedPortfolio: IMatchedPortfolioProject[],
    pastProposalSimilarityScore: number
  ): CopilotAnalysis {
    const suggestions: CopilotSuggestion[] = [];
    const text = proposalText.trim();
    const textLower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 10);

    const wordCount = words.length;
    const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const contractionCount = (text.match(/\b(I'm|I've|I'll|you're|you'll|you've|we're|let's|don't|can't|won't|didn't|doesn't|hasn't|haven't|it's|that's|there's|they're)\b/gi) || []).length;
    const { count: forbiddenCount, found: forbiddenFound } = countForbiddenPhrases(text);
    const readingGrade = LocalHumanizer.estimateGradeLevel(text);
    const estimatedReadTimeSec = Math.round(wordCount / (238 / 60));

    // ── Word count ────────────────────────────────────────────────────────────
    if (wordCount > 350) {
      suggestions.push({
        type: "critical",
        section: "length",
        message: `Your proposal is ${wordCount} words. Most clients don't read past 250. Cut the weakest paragraph.`,
        action: "reduce_length",
      });
    } else if (wordCount > 280) {
      suggestions.push({
        type: "warning",
        section: "length",
        message: `${wordCount} words is slightly long. Aim for 200–250 for better engagement.`,
        action: "reduce_length",
      });
    } else if (wordCount < 80) {
      suggestions.push({
        type: "warning",
        section: "length",
        message: `At ${wordCount} words, this may feel too brief to be credible. Consider adding one more specific detail.`,
        action: "expand_content",
      });
    }

    // ── Opening ────────────────────────────────────────────────────────────────
    const firstSentence = sentences[0] || "";
    const firstSentenceWords = firstSentence.split(/\s+/).filter(Boolean).length;
    if (firstSentenceWords > 20) {
      suggestions.push({
        type: "warning",
        section: "opening",
        message: `Your opening sentence is ${firstSentenceWords} words. Clients decide in the first line — cut it to under 15 words.`,
        action: "shorten_opening",
      });
    }

    const sycophancticPatterns = [
      /thank you for considering/i, /i am (truly |very |deeply )?excited/i,
      /it is (truly )?a (pleasure|honor)/i, /i hope this.*finds you well/i,
    ];
    if (sycophancticPatterns.some((p) => p.test(text.slice(0, 200)))) {
      suggestions.push({
        type: "critical",
        section: "opening",
        message: "Your opening sounds like a form letter. Remove the courtesy opener and start with something specific.",
        action: "rewrite_opening",
      });
    }

    // ── Portfolio ──────────────────────────────────────────────────────────────
    if (matchedPortfolio.length > 0) {
      const mentionsPortfolio = matchedPortfolio.some((p) => {
        const titleWords = p.project.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleWords.some((w) => textLower.includes(w));
      });
      if (!mentionsPortfolio) {
        suggestions.push({
          type: "critical",
          section: "portfolio",
          message: `You have a relevant portfolio project ("${matchedPortfolio[0].project.title}") but didn't mention it. This is a missed credibility opportunity.`,
          action: "add_portfolio_reference",
        });
      }
    } else if (!textLower.includes("project") && !textLower.includes("work") && !textLower.includes("built")) {
      suggestions.push({
        type: "warning",
        section: "portfolio",
        message: "No portfolio or past work evidence mentioned. Adding portfolio projects would significantly improve your credibility.",
        action: "add_portfolio",
      });
    }

    // ── Forbidden phrases ──────────────────────────────────────────────────────
    if (forbiddenCount > 0) {
      suggestions.push({
        type: "critical",
        section: "authenticity",
        message: `Your proposal contains ${forbiddenCount} AI cliché phrase${forbiddenCount > 1 ? "s" : ""}: ${forbiddenFound.slice(0, 3).map((p) => `"${p}"`).join(", ")}. These signal an AI-generated proposal to experienced clients.`,
        action: "remove_buzzwords",
      });
    }

    // ── Reading grade ──────────────────────────────────────────────────────────
    if (readingGrade > 12) {
      suggestions.push({
        type: "warning",
        section: "tone",
        message: `Reading level is Grade ${readingGrade.toFixed(0)} — too formal. Target Grade 8–10. Shorten sentences and use simpler words.`,
        action: "simplify_language",
      });
    }

    // ── Contractions ───────────────────────────────────────────────────────────
    if (contractionCount === 0 && wordCount > 100) {
      suggestions.push({
        type: "tip",
        section: "tone",
        message: `No contractions found. Using "I'm" instead of "I am", "you'll" instead of "you will", etc. makes the proposal feel less robotic.`,
        action: "add_contractions",
      });
    }

    // ── CTA ────────────────────────────────────────────────────────────────────
    const hasCta = /\b(schedule|call|jump on|reply|meet|discuss|message|send|share|connect|chat|available)\b/i.test(textLower);
    if (!hasCta) {
      suggestions.push({
        type: "critical",
        section: "cta",
        message: "No clear call-to-action found. The proposal ends without inviting a response. Add a specific next step.",
        action: "add_cta",
      });
    }

    // ── Similarity ─────────────────────────────────────────────────────────────
    if (pastProposalSimilarityScore >= 70) {
      suggestions.push({
        type: "warning",
        section: "general",
        message: `This proposal is ${pastProposalSimilarityScore}% similar to one you've sent before. The opening and CTA were automatically rotated, but consider refreshing the middle section too.`,
        action: "diversify_content",
      });
    }

    // ── Sentence length ────────────────────────────────────────────────────────
    if (avgSentenceLength > 22) {
      suggestions.push({
        type: "tip",
        section: "tone",
        message: `Average sentence length is ${avgSentenceLength} words — a bit long. Aim for 12–18 words per sentence for easier reading.`,
        action: "shorten_sentences",
      });
    }

    // ── Paragraph count ────────────────────────────────────────────────────────
    if (paragraphs.length === 1 && wordCount > 100) {
      suggestions.push({
        type: "warning",
        section: "general",
        message: "The entire proposal is one block of text. Break it into 2–4 paragraphs for readability.",
        action: "add_paragraph_breaks",
      });
    }

    // ── Timeline mention ───────────────────────────────────────────────────────
    if (jobIntelligence.urgency === "High" && !/\b(timeline|deadline|start|week|day|deliver)\b/i.test(textLower)) {
      suggestions.push({
        type: "tip",
        section: "timeline",
        message: "The client marked this as urgent, but you didn't mention a timeline. Acknowledging the deadline builds confidence.",
        action: "add_timeline",
      });
    }

    // ── Overall score calculation ──────────────────────────────────────────────
    const criticalCount = suggestions.filter((s) => s.type === "critical").length;
    const warningCount = suggestions.filter((s) => s.type === "warning").length;
    const overallScore = Math.max(
      10,
      Math.min(100, 100 - criticalCount * 20 - warningCount * 8)
    );

    console.log(`[Stage11] Copilot analysis complete. Suggestions: ${suggestions.length} (${criticalCount} critical). Score: ${overallScore}.`);

    return {
      suggestions,
      readingGrade,
      wordCount,
      contractionCount,
      estimatedReadTimeSec,
      forbiddenPhraseCount: forbiddenCount,
      overallScore,
      paragraphCount: paragraphs.length,
      avgSentenceLength,
    };
  }
}
