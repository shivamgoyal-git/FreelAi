/**
 * Stage 10 — Proposal Similarity Deduplication
 *
 * Responsibility: Compare the freshly generated proposal against the user's
 * last 5 sent proposals. If similarity exceeds 70%, swap the opening and CTA
 * to ensure every proposal feels unique.
 *
 * Algorithm: Trigram Jaccard similarity (same as Stage 5 retrieval).
 * No API call — entirely local and deterministic.
 */

import {
  selectOpening,
  resolveOpeningIndustry,
} from "./libraries/opening-library";
import {
  CTAS,
  type CtaStyle,
} from "./libraries/cta-library";
import type { JobIntelligence } from "./stage1-job-intelligence";
import type { ProposalBlueprint } from "./stage4-blueprint-builder";

export interface SimilarityResult {
  highSimilarity: boolean;
  maxSimilarityScore: number;
  proposalText: string;
  deduplicationApplied: boolean;
  previousProposalCount: number;
}

export class SimilarityDeduplicator {
  private static readonly SIMILARITY_THRESHOLD = 0.70;

  /**
   * Compare the new proposal against past proposals.
   * If similarity is above threshold, swap opening and CTA.
   */
  static deduplicate(
    proposalText: string,
    pastProposals: string[],
    jobIntelligence: JobIntelligence,
    blueprint: ProposalBlueprint
  ): SimilarityResult {
    if (pastProposals.length === 0) {
      return {
        highSimilarity: false,
        maxSimilarityScore: 0,
        proposalText,
        deduplicationApplied: false,
        previousProposalCount: 0,
      };
    }

    // Calculate max similarity against past proposals
    const scores = pastProposals.map((past) =>
      this.trigramJaccard(proposalText, past)
    );
    const maxScore = Math.max(...scores);

    if (maxScore < this.SIMILARITY_THRESHOLD) {
      console.log(`[Stage10] Similarity check passed. Max score: ${(maxScore * 100).toFixed(1)}%. No deduplication needed.`);
      return {
        highSimilarity: false,
        maxSimilarityScore: Math.round(maxScore * 100),
        proposalText,
        deduplicationApplied: false,
        previousProposalCount: pastProposals.length,
      };
    }

    console.log(`[Stage10] High similarity detected: ${(maxScore * 100).toFixed(1)}%. Swapping opening and CTA.`);

    // Swap the opening with a different one from the library
    const openingIndustry = resolveOpeningIndustry(jobIntelligence.industry);
    const currentOpening = blueprint.sections.opening.selectedOpening;
    const newOpening = this.getDifferentOpening(currentOpening, jobIntelligence, openingIndustry);

    // Swap the CTA with a different one
    const currentCta = blueprint.sections.cta.selectedCta;
    const newCta = this.getDifferentCta(currentCta, blueprint.ctaStyle);

    // Apply swaps to the proposal text
    let deduplicatedText = proposalText;
    if (newOpening && deduplicatedText.includes(currentOpening)) {
      deduplicatedText = deduplicatedText.replace(currentOpening, newOpening);
    }
    if (newCta && deduplicatedText.includes(currentCta)) {
      deduplicatedText = deduplicatedText.replace(currentCta, newCta);
    }

    return {
      highSimilarity: true,
      maxSimilarityScore: Math.round(maxScore * 100),
      proposalText: deduplicatedText,
      deduplicationApplied: true,
      previousProposalCount: pastProposals.length,
    };
  }

  /**
   * Select a different opening from the library than the current one.
   */
  private static getDifferentOpening(
    currentOpening: string,
    jobIntelligence: JobIntelligence,
    industry: string
  ): string {
    // Use a different seed to get a different opening
    const altSeed = jobIntelligence.keywords.reverse().join(" ");
    const altOpening = selectOpening(altSeed, resolveOpeningIndustry(industry));
    return altOpening !== currentOpening ? altOpening : currentOpening;
  }

  /**
   * Select a different CTA from the same style pool.
   */
  private static getDifferentCta(currentCta: string, style: CtaStyle): string {
    const pool = CTAS[style];
    const alternatives = pool.filter((cta) => cta !== currentCta);
    if (alternatives.length === 0) return currentCta;
    // Pick a random alternative
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  /**
   * Trigram Jaccard similarity between two strings.
   */
  private static trigramJaccard(a: string, b: string): number {
    const ta = this.buildTrigrams(a);
    const tb = this.buildTrigrams(b);

    if (ta.size === 0 && tb.size === 0) return 1;
    if (ta.size === 0 || tb.size === 0) return 0;

    let intersection = 0;
    for (const t of ta) {
      if (tb.has(t)) intersection++;
    }

    const union = ta.size + tb.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  private static buildTrigrams(text: string): Set<string> {
    const cleaned = text.toLowerCase().replace(/\s+/g, " ").trim();
    const trigrams = new Set<string>();
    for (let i = 0; i <= cleaned.length - 3; i++) {
      trigrams.add(cleaned.slice(i, i + 3));
    }
    return trigrams;
  }
}
