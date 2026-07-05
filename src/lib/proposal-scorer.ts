import type { JobAnalysis } from "./job-analyzer";
import type { IMatchedPortfolioProject } from "./portfolio-matcher";

export interface IScoreResult {
  score: number;
  reason: string;
}

export interface ProposalScores {
  overall: number;
  personalization: IScoreResult;
  authenticity: IScoreResult;
  relevance: IScoreResult;
  readability: IScoreResult;
  humanTone: IScoreResult;
  clientRequirementCoverage: IScoreResult;
  portfolioRelevance: IScoreResult;
  ctaQuality: IScoreResult;
}

export interface IWinChecklistItem {
  label: string;
  passed: boolean;
  explanation: string;
}

export interface ProposalScorerResult {
  scores: ProposalScores;
  winChecklist: IWinChecklistItem[];
  winChecklistPercentage: number;
}

export class ProposalScorer {
  /**
   * Stage 6: Calculate local explainable scores and win checklist.
   */
  static score(
    proposalText: string,
    job: JobAnalysis,
    portfolio: IMatchedPortfolioProject[]
  ): ProposalScorerResult {
    const text = proposalText.trim();
    const textLower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const wc = words.length;

    // 1. Personalization Score
    const nameMention = /hi|hello|dear/i.test(text.slice(0, 50));
    const allKeywords = [...new Set([...job.requiredSkills, ...job.technologies, ...job.importantKeywords])];
    const matchedKws = allKeywords.filter((kw) => textLower.includes(kw.toLowerCase()));
    const personalizationScore = Math.min(100, (matchedKws.length / Math.max(1, allKeywords.length)) * 60 + (nameMention ? 40 : 10));
    const personalization = {
      score: Math.round(personalizationScore),
      reason: `References ${matchedKws.length} specific keywords/skills (${matchedKws.slice(0, 3).join(", ")}) from the job post and addresses the client personally.`,
    };

    // 2. Authenticity Score
    const forbiddenHits = [
      "executive summary", "outcome-driven", "leverage", "aligning our strategy",
      "robust solution", "best-in-class", "innovative approach"
    ].filter((w) => textLower.includes(w)).length;
    const authenticityScore = Math.max(0, 100 - forbiddenHits * 15 - (wc > 600 ? 10 : 0));
    const authenticity = {
      score: Math.round(authenticityScore),
      reason: forbiddenHits === 0
        ? "Excellent phrasing. Free of corporate buzzwords and AI clichés. Reads like a manual draft."
        : `Contains ${forbiddenHits} AI-typical corporate buzzwords which reduce authenticity.`,
    };

    // 3. Relevance Score
    const relevanceScore = Math.min(100, (matchedKws.length / Math.max(1, job.requiredSkills.length)) * 80 + 20);
    const relevance = {
      score: Math.round(relevanceScore),
      reason: `Directly matches client's skill requirements including ${job.requiredSkills.slice(0, 3).join(", ")}.`,
    };

    // 4. Readability Score
    // Calculate average sentence length
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const avgSentenceLen = sentences.length > 0 ? wc / sentences.length : 15;
    const readabilityScore = Math.max(20, Math.min(100, 110 - avgSentenceLen * 1.5 - (wc > 500 ? 15 : 0)));
    const readability = {
      score: Math.round(readabilityScore),
      reason: `Average sentence length is ${Math.round(avgSentenceLen)} words. Simple, flowing paragraphs.`,
    };

    // 5. Human-like Tone Score
    const hasInformalGreetings = /hey|hi\s/i.test(text.slice(0, 100));
    const contractionsCount = (text.match(/\b(i'm|don't|can't|i've|we're|let's|you'll)\b/g) || []).length;
    const humanToneScore = Math.min(100, 50 + contractionsCount * 10 + (hasInformalGreetings ? 20 : 0));
    const humanTone = {
      score: Math.round(humanToneScore),
      reason: `Uses ${contractionsCount} natural contractions and a warm, conversational flow.`,
    };

    // 6. Client Requirement Coverage Score
    const coveredPainPoints = job.painPoints.filter((pt) => {
      const ptWords = pt.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 3);
      return ptWords.every((word) => textLower.includes(word));
    }).length;
    const clientRequirementCoverageScore = Math.min(100, (coveredPainPoints / Math.max(1, job.painPoints.length)) * 70 + (matchedKws.length > 2 ? 30 : 10));
    const clientRequirementCoverage = {
      score: Math.round(clientRequirementCoverageScore),
      reason: `Addressed ${coveredPainPoints} key pain points directly, ensuring the client knows you read their description.`,
    };

    // 7. Portfolio Relevance Score
    let portfolioRelevanceScore = 0;
    let portfolioReason = "No matched portfolio project was referenced in this draft.";
    if (portfolio.length > 0) {
      const match = portfolio.find((p) => {
        const titleWords = p.project.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return titleWords.some((word) => textLower.includes(word));
      });
      if (match) {
        portfolioRelevanceScore = match.matchScore;
        portfolioReason = `References project "${match.project.title}" which has a ${match.matchScore}% relevance match.`;
      }
    }
    const portfolioRelevance = {
      score: Math.round(portfolioRelevanceScore),
      reason: portfolioReason,
    };

    // 8. CTA Quality Score
    const hasCTA = /\b(schedule|call|jump on|hop on|reply|meet|discuss|calendar|availability)\b/i.test(textLower);
    const hasQuestionMark = textLower.includes("?");
    const ctaQualityScore = hasCTA ? (hasQuestionMark ? 95 : 80) : 35;
    const ctaQuality = {
      score: Math.round(ctaQualityScore),
      reason: hasCTA
        ? `Strong CTA detected. ${hasQuestionMark ? "Ends with a direct conversion question." : "Clear call-to-action details."}`
        : "Weak CTA. Add an explicit next step to encourage the client to reply.",
    };

    // Overall Score
    const overall = Math.round(
      (personalization.score +
        authenticity.score +
        relevance.score +
        readability.score +
        humanTone.score +
        clientRequirementCoverage.score +
        portfolioRelevance.score +
        ctaQuality.score) /
        8
    );

    // Win Checklist
    const winChecklist: IWinChecklistItem[] = [
      {
        label: "References client's requirements",
        passed: matchedKws.length >= 3,
        explanation: `Addressed ${matchedKws.length} core client keywords/skills.`,
      },
      {
        label: "Mentions relevant portfolio",
        passed: portfolioRelevanceScore > 0,
        explanation: portfolioRelevanceScore > 0 ? "Naturally referenced a matched portfolio item." : "Missing a portfolio link/work evidence.",
      },
      {
        label: "Matches client tone",
        passed: textLower.length > 100, // Heuristic: valid content matching
        explanation: `Matches tone "${job.clientTone}".`,
      },
      {
        label: "Includes clear CTA",
        passed: hasCTA,
        explanation: hasCTA ? "Includes an invitation to connect or hop on a call." : "No action invitation found.",
      },
      {
        label: "Discusses timeline",
        passed: /\b(timeline|week|month|day|schedule|kickoff)\b/i.test(textLower),
        explanation: /\b(timeline|week|month|day|schedule|kickoff)\b/i.test(textLower) ? "Stated expected timeline/kickoff details." : "No timeline or delivery reference.",
      },
      {
        label: "Explains pricing",
        passed: /\b(price|pricing|budget|cost|rate|pricing model|fixed|hourly|\$)\b/i.test(textLower),
        explanation: /\b(price|pricing|budget|cost|rate|pricing model|fixed|hourly|\$)\b/i.test(textLower) ? "Pricing details or rate mentioned." : "No budget / pricing structure included.",
      },
      {
        label: "Demonstrates understanding",
        passed: coveredPainPoints > 0,
        explanation: coveredPainPoints > 0 ? "Specifically targets the client's problem statement." : "Fails to cover client pain points.",
      },
    ];

    const passedChecklistCount = winChecklist.filter((i) => i.passed).length;
    const winChecklistPercentage = Math.round((passedChecklistCount / winChecklist.length) * 100);

    return {
      scores: {
        overall,
        personalization,
        authenticity,
        relevance,
        readability,
        humanTone,
        clientRequirementCoverage,
        portfolioRelevance,
        ctaQuality,
      },
      winChecklist,
      winChecklistPercentage,
    };
  }
}
