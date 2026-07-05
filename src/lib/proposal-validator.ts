import type { JobAnalysis } from "./job-analyzer";
import type { IMatchedPortfolioProject } from "./portfolio-matcher";

export interface ValidationResult {
  passed: boolean;
  violations: string[];
}

const FORBIDDEN_WORDS = [
  "executive summary", "outcome-driven", "leverage", "aligning our strategy",
  "high-quality build", "deliver clean results", "optimize user engagement",
  "hit the ground running", "robust solution", "best-in-class",
  "streamlined workflow", "synergy", "comprehensive solution",
  "innovative approach", "value-add", "dive deep", "game-changer",
  "cutting-edge", "state-of-the-art", "game changer", "testament",
];

export class ProposalValidator {
  /**
   * Stage 5: Validate proposal draft for authenticity.
   */
  static validate(
    proposalText: string,
    job: JobAnalysis,
    portfolio: IMatchedPortfolioProject[]
  ): ValidationResult {
    const violations: string[] = [];
    const text = proposalText.trim();
    const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);

    // 1. Any paragraph exceeds ~120 words?
    for (let i = 0; i < paragraphs.length; i++) {
      const wc = paragraphs[i].split(/\s+/).filter(Boolean).length;
      if (wc > 120) {
        violations.push(`Paragraph ${i + 1} is too long (${wc} words). Keep under 120 words for readability.`);
      }
    }

    // 2. More than two consecutive paragraphs starting with the same word?
    if (paragraphs.length >= 3) {
      for (let i = 0; i < paragraphs.length - 2; i++) {
        const w1 = this.getFirstWord(paragraphs[i]);
        const w2 = this.getFirstWord(paragraphs[i + 1]);
        const w3 = this.getFirstWord(paragraphs[i + 2]);
        if (w1 && w1 === w2 && w2 === w3) {
          violations.push(`Three consecutive paragraphs start with the same word ("${w1}"). Vary sentence starts.`);
        }
      }
    }

    // 3. Forbidden AI/corporate phrases?
    const textLower = text.toLowerCase();
    for (const phrase of FORBIDDEN_WORDS) {
      if (textLower.includes(phrase)) {
        violations.push(`Contains forbidden corporate/AI cliché phrase: "${phrase}".`);
      }
    }

    // 4. Mention at least 1 matched portfolio project?
    if (portfolio.length > 0) {
      const hasPortfolioMention = portfolio.some((p) => {
        const titleWords = p.project.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleWords.some((word) => textLower.includes(word));
      });
      if (!hasPortfolioMention) {
        violations.push("Fails to explicitly mention any of the matched portfolio projects.");
      }
    }

    // 5. Reference at least three specific client requirements/keywords?
    const allKeywords = [...new Set([...job.requiredSkills, ...job.technologies, ...job.importantKeywords])];
    const matchedCount = allKeywords.filter((kw) => textLower.includes(kw.toLowerCase())).length;
    if (matchedCount < 3) {
      violations.push(`Only references ${matchedCount} client requirements. Must address at least 3 requirements/keywords from the job post.`);
    }

    // 6. Proposal length bounds (under 80 words is too short, over 800 words is too long)
    const totalWordCount = text.split(/\s+/).filter(Boolean).length;
    if (totalWordCount < 80) {
      violations.push(`Proposal is extremely short (${totalWordCount} words). Add more details showing your expertise.`);
    } else if (totalWordCount > 800) {
      violations.push(`Proposal is too long (${totalWordCount} words). Keep under 800 words.`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  private static getFirstWord(paragraph: string): string {
    const cleaned = paragraph.replace(/[^\w\s]/g, "").trim();
    const firstWord = cleaned.split(/\s+/)[0] || "";
    return firstWord.toLowerCase();
  }
}
