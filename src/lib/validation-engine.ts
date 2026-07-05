import type { JobAnalysis } from "./job-analyzer";
import type { IMatchedPortfolioProject } from "./portfolio-matcher";

export interface GenerationContext {
  freelancerProfile: any;
  matchedPortfolio: IMatchedPortfolioProject[];
  currentJobAnalysis: JobAnalysis;
  rawJobPost: string;
  currentUserInput: { clientName: string; platform: string; budget: number; timeline: string; tone: string };
  aiPreferences: any;
  generationId: string;
  createdAt: Date;
}

export interface RequirementCoverage {
  covered: string[];
  missing: string[];
  partiallyAddressed: string[];
  percentage: number;
}

export interface ConfidenceScore {
  score: number;
  reason: string;
}

export interface ValidationEngineResult {
  passed: boolean;
  violations: string[];
  coverage: RequirementCoverage;
  confidence: ConfidenceScore;
}

const FORBIDDEN_WORDS = [
  "executive summary", "outcome-driven", "leverage", "aligning our strategy",
  "high-quality build", "deliver clean results", "optimize user engagement",
  "hit the ground running", "robust solution", "best-in-class",
  "streamlined workflow", "synergy", "comprehensive solution",
  "innovative approach", "value-add", "dive deep", "game-changer",
  "cutting-edge", "state-of-the-art", "game changer", "testament",
];

// List of common tech terms to check for hallucination
const TECH_DICTIONARY = [
  "react", "next.js", "nextjs", "typescript", "javascript", "vue", "angular", "node", "nodejs",
  "express", "mongodb", "postgresql", "mysql", "python", "django", "flask", "fastapi", "ruby", "rails",
  "php", "laravel", "wordpress", "shopify", "webflow", "figma", "sketch", "photoshop", "illustrator",
  "premiere", "after effects", "final cut", "davinci", "storytelling", "motion graphics", "seo",
  "sem", "google ads", "facebook ads", "stripe", "supabase", "firebase", "aws", "docker", "kubernetes",
];

export class ValidationEngine {
  /**
   * Run the unified validations suite.
   */
  static validate(
    proposalText: string,
    context: GenerationContext
  ): ValidationEngineResult {
    const violations: string[] = [];
    const text = proposalText.trim();
    const textLower = text.toLowerCase();
    const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
    const words = text.split(/\s+/).filter(Boolean);
    const wc = words.length;

    const job = context.currentJobAnalysis;
    const profile = context.freelancerProfile;
    const portfolio = context.matchedPortfolio;
    const rawJobPost = context.rawJobPost.toLowerCase();

    // ─── 1. STRUCTURE VALIDATOR ───
    for (let i = 0; i < paragraphs.length; i++) {
      const pWc = paragraphs[i].split(/\s+/).filter(Boolean).length;
      if (pWc > 120) {
        violations.push(`Structure: Paragraph ${i + 1} exceeds 120 words (${pWc} words).`);
      }
    }
    if (wc < 20 || wc > 1000) {
      violations.push(`Structure: Proposal length is out of bounds (${wc} words). Keep between 20 and 1000 words.`);
    }
    if (/#|##|###/g.test(proposalText)) {
      violations.push("Structure: Proposal contains markdown headings. Keep it flowing like a real message.");
    }

    // ─── 2. FACT & HALLUCINATION VALIDATOR ───
    // Extract factual claims: verify that any technologies named actually exist in either (rawJobPost OR profile skills OR matched portfolio projects)
    const detectedTechs = TECH_DICTIONARY.filter((t) => textLower.includes(t));
    const profileSkills = profile?.professional?.skills?.map((s: string) => s.toLowerCase()) || [];
    const portfolioDesc = portfolio.map((p) => (p.project.title + " " + p.project.description).toLowerCase()).join(" ");

    for (const tech of detectedTechs) {
      const inJob = rawJobPost.includes(tech);
      const inProfile = profileSkills.some((ps: string) => ps.includes(tech) || tech.includes(ps));
      const inPortfolio = portfolioDesc.includes(tech);

      if (!inJob && !inProfile && !inPortfolio) {
        violations.push(`Hallucination: Proposal references technology "${tech}" which is not in the job post, freelancer profile, or portfolio.`);
      }
    }

    // Ensure proposal does not reference invented success statistics or awards
    const containsStats = /\b(award|awards|top rated|100%|99%|revenue|million|\$\d+k|\$\d+m|certifications|certified)\b/i.test(text);
    if (containsStats) {
      const bioLower = (profile?.professional?.bio || "").toLowerCase();
      if (!bioLower.includes("award") && !bioLower.includes("100%") && !bioLower.includes("top rated") && !textLower.includes(profile?.personal?.fullName?.toLowerCase())) {
        violations.push("Hallucination: Proposal references success stats, revenue, or awards not found in your profile.");
      }
    }

    // Pricing & timeline hallucination detection (No inventions validation)
    const hasInventedPrice = context.currentUserInput.budget === 0 && /\$\d+/g.test(text);
    if (hasInventedPrice) {
      violations.push("Hallucination: Proposal specifies a budget pricing when the budget context is empty.");
    }
    const hasInventedTimeline = !context.currentUserInput.timeline && /\b\d+\s*(week|month|day)/i.test(text);
    if (hasInventedTimeline) {
      violations.push("Hallucination: Proposal specifies a timeline when the timeline context is empty.");
    }

    // ─── 3. PROFILE VALIDATOR ───
    const freelancerName = profile?.personal?.fullName || "";
    if (freelancerName && textLower.includes(freelancerName.toLowerCase()) && !text.includes(freelancerName)) {
      violations.push("Profile: Freelancer name is misspelled or cased incorrectly.");
    }

    // ─── 4. PORTFOLIO VALIDATOR ───
    if (portfolio.length > 0) {
      const mentionsAnyPortfolio = portfolio.some((p) => {
        const titleWords = p.project.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleWords.some((word) => textLower.includes(word));
      });
      if (!mentionsAnyPortfolio) {
        violations.push("Portfolio: Proposal fails to reference any matched portfolio projects.");
      }
    }

    // ─── 5. REQUIREMENT COVERAGE VALIDATOR ───
    const covered: string[] = [];
    const missing: string[] = [];
    const partiallyAddressed: string[] = [];

    // Use only skills for coverage calculation in regression checks to avoid deliverable string-matching noise
    const requirements = job.requiredSkills || [];
    for (const req of requirements) {
      const reqClean = req.toLowerCase().trim();
      const inText = textLower.includes(reqClean);
      const partialTerms = reqClean.split(/\s+/).filter((w) => w.length > 4);
      const isPartial = partialTerms.some((term) => textLower.includes(term));

      if (inText) {
        covered.push(req);
      } else if (isPartial) {
        partiallyAddressed.push(req);
      } else {
        missing.push(req);
      }
    }

    const totalReqs = requirements.length || 1;
    const coveragePercentage = Math.round(((covered.length + partiallyAddressed.length * 0.5) / totalReqs) * 100);

    if (coveragePercentage < 40 && requirements.length > 0) {
      violations.push(`Coverage: Proposal coverage of client requirements is poor (${coveragePercentage}%). Address more requirements.`);
    }

    const coverage: RequirementCoverage = {
      covered,
      missing,
      partiallyAddressed,
      percentage: coveragePercentage,
    };

    // ─── 6. READABILITY VALIDATOR ───
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const avgSentenceLen = sentences.length > 0 ? wc / sentences.length : 15;
    if (avgSentenceLen > 30) {
      violations.push(`Readability: Sentences are too long on average (${Math.round(avgSentenceLen)} words). Keep them simple.`);
    }

    // ─── 7. TONE VALIDATOR ───
    const toneChoice = context.currentUserInput.tone || "Auto";
    if (toneChoice === "Minimal" && wc > 150) {
      violations.push(`Tone: Tone is set to Minimal but word count exceeds 150 words (${wc} words).`);
    }

    // ─── 8. AUTHENTICITY VALIDATOR ───
    for (const phrase of FORBIDDEN_WORDS) {
      if (textLower.includes(phrase)) {
        violations.push(`Authenticity: Proposal contains forbidden corporate/AI cliché phrase: "${phrase}".`);
      }
    }

    if (paragraphs.length >= 3) {
      for (let i = 0; i < paragraphs.length - 2; i++) {
        const w1 = this.getFirstWord(paragraphs[i]);
        const w2 = this.getFirstWord(paragraphs[i + 1]);
        const w3 = this.getFirstWord(paragraphs[i + 2]);
        if (w1 && w1 === w2 && w2 === w3) {
          violations.push(`Authenticity: Three consecutive paragraphs start with the same word ("${w1}").`);
        }
      }
    }

    // ─── CONFIDENCE SCORE CALCULATION ───
    let confScore = 100;
    confScore -= violations.length * 15;
    if (portfolio.length > 0 && !portfolio.some((p) => textLower.includes(p.project.title.toLowerCase()))) {
      confScore -= 10;
    }
    confScore -= (100 - coveragePercentage) * 0.3;

    confScore = Math.max(10, Math.min(100, Math.round(confScore)));

    const confidence: ConfidenceScore = {
      score: confScore,
      reason: confScore >= 90
        ? "Excellent score. All referenced tech, skills and portfolios have been verified with no hallucinations."
        : `Score is ${confScore}%. Review the debug panel for unresolved hallucination warnings or missing requirement coverage.`,
    };

    return {
      passed: violations.length === 0,
      violations,
      coverage,
      confidence,
    };
  }

  private static getFirstWord(paragraph: string): string {
    const cleaned = paragraph.replace(/[^\w\s]/g, "").trim();
    const firstWord = cleaned.split(/\s+/)[0] || "";
    return firstWord.toLowerCase();
  }

  /**
   * Validate a single named section of a proposal.
   * Used by Stage 9 to rewrite only the failed section.
   *
   * @param sectionName - human-readable label for logging
   * @param sectionText - the text of this section only
   * @param context     - the full generation context
   */
  static validateSection(
    sectionName: string,
    sectionText: string,
    context: GenerationContext
  ): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const text = sectionText.trim();
    const textLower = text.toLowerCase();

    // Forbidden words
    for (const phrase of FORBIDDEN_WORDS) {
      if (textLower.includes(phrase)) {
        violations.push(`Section "${sectionName}": contains forbidden phrase "${phrase}".`);
      }
    }

    // Hallucination check for this section
    const profile = context.freelancerProfile;
    const profileSkills = profile?.professional?.skills?.map((s: string) => s.toLowerCase()) || [];
    const portfolioDesc = context.matchedPortfolio
      .map((p) => (p.project.title + " " + p.project.description).toLowerCase())
      .join(" ");
    const rawJobPostLower = context.rawJobPost.toLowerCase();

    const detectedTechs = TECH_DICTIONARY.filter((t) => textLower.includes(t));
    for (const tech of detectedTechs) {
      const inJob = rawJobPostLower.includes(tech);
      const inProfile = profileSkills.some((ps: string) => ps.includes(tech) || tech.includes(ps));
      const inPortfolio = portfolioDesc.includes(tech);
      if (!inJob && !inProfile && !inPortfolio) {
        violations.push(`Section "${sectionName}": references technology "${tech}" not found in job, profile, or portfolio.`);
      }
    }

    // Markdown headings
    if (/#|##|###/g.test(sectionText)) {
      violations.push(`Section "${sectionName}": contains markdown headings.`);
    }

    return { passed: violations.length === 0, violations };
  }
}

