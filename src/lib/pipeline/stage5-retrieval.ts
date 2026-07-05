/**
 * Stage 5 — Few-Shot Retrieval
 *
 * Responsibility: Find the most relevant few-shot proposal examples
 * from the library using lightweight local similarity search.
 *
 * No API call. No vector database. Pure local computation.
 *
 * Algorithm: Trigram Jaccard similarity between the job post
 * and each example's jobKeywords. Returns top-3 examples per category.
 */

import {
  FEW_SHOT_EXAMPLES,
  type FewShotExample,
} from "./libraries/few-shot-examples";
import type { JobIntelligence } from "./stage1-job-intelligence";
import { resolveOpeningIndustry } from "./libraries/opening-library";

export interface RetrievedExamples {
  category: string;
  examples: FewShotExample[];
  similarityScores: number[];
}

export class FewShotRetriever {
  /**
   * Retrieve the top-N most relevant few-shot examples for this job.
   * Returns examples from the matching category, ranked by trigram similarity.
   */
  static retrieve(
    jobIntelligence: JobIntelligence,
    topN: number = 3
  ): RetrievedExamples {
    // Map job industry to example category
    const openingIndustry = resolveOpeningIndustry(jobIntelligence.industry);
    const category = this.mapToExampleCategory(openingIndustry, jobIntelligence.requiredSkills);

    // Build the search text from the job
    const searchText = [
      jobIntelligence.industry,
      ...jobIntelligence.keywords,
      ...jobIntelligence.requiredSkills,
      ...jobIntelligence.deliverables,
      ...jobIntelligence.painPoints,
    ]
      .join(" ")
      .toLowerCase();

    // Get all examples from the primary category, fall back to general
    const categoryExamples = FEW_SHOT_EXAMPLES.filter((e) => e.category === category);
    const generalExamples = FEW_SHOT_EXAMPLES.filter((e) => e.category === "general");
    const pool = categoryExamples.length > 0 ? categoryExamples : generalExamples;

    // Score each example by trigram Jaccard similarity to the search text
    const scored = pool.map((example) => {
      const exampleText = example.jobKeywords.join(" ").toLowerCase();
      const score = this.trigramJaccard(searchText, exampleText);
      return { example, score };
    });

    // Sort by similarity descending
    scored.sort((a, b) => b.score - a.score);

    const topExamples = scored.slice(0, topN);

    console.log(
      `[Stage5] Retrieved ${topExamples.length} examples for category "${category}". ` +
        `Top similarity: ${topExamples[0]?.score.toFixed(3) || "N/A"}`
    );

    return {
      category,
      examples: topExamples.map((s) => s.example),
      similarityScores: topExamples.map((s) => s.score),
    };
  }

  /**
   * Map an opening industry to a few-shot example category.
   */
  private static mapToExampleCategory(
    industry: string,
    skills: string[]
  ): string {
    const skillStr = skills.join(" ").toLowerCase();
    if (industry === "video-editing") return "video-editing";
    if (industry === "web-development") return "web-development";
    if (industry === "design") return "design";
    if (industry === "seo") return "seo";
    if (industry === "copywriting") return "copywriting";
    if (industry === "automation") return "automation";
    if (industry === "marketing") return "marketing";
    if (skillStr.includes("video")) return "video-editing";
    if (skillStr.includes("design") || skillStr.includes("figma")) return "design";
    return "general";
  }

  /**
   * Trigram Jaccard similarity between two strings.
   * Returns a value between 0 (no overlap) and 1 (identical).
   */
  private static trigramJaccard(a: string, b: string): number {
    const trigramsA = this.buildTrigrams(a);
    const trigramsB = this.buildTrigrams(b);

    if (trigramsA.size === 0 && trigramsB.size === 0) return 1;
    if (trigramsA.size === 0 || trigramsB.size === 0) return 0;

    let intersection = 0;
    for (const t of trigramsA) {
      if (trigramsB.has(t)) intersection++;
    }

    const union = trigramsA.size + trigramsB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Build a set of character trigrams from a string.
   */
  private static buildTrigrams(text: string): Set<string> {
    const cleaned = text.replace(/\s+/g, " ").trim();
    const trigrams = new Set<string>();
    for (let i = 0; i <= cleaned.length - 3; i++) {
      trigrams.add(cleaned.slice(i, i + 3));
    }
    return trigrams;
  }
}
