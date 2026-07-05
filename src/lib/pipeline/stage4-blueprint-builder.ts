/**
 * Stage 4 — Proposal Blueprint Builder
 *
 * Responsibility: Build a fully structured 9-section JSON blueprint from
 * Stage 1 intelligence + matched portfolio + freelancer profile.
 *
 * This stage is PURELY DETERMINISTIC — no Gemini call.
 * It selects openings, CTAs, and structures every section reference
 * so that Stage 6 has a detailed map to write from, not a vague brief.
 */

import type { JobIntelligence } from "./stage1-job-intelligence";
import type { IMatchedPortfolioProject } from "../portfolio-matcher";
import {
  selectOpening,
  resolveOpeningIndustry,
  type OpeningIndustry,
} from "./libraries/opening-library";
import {
  selectCta,
  resolveCtaStyle,
  type CtaStyle,
} from "./libraries/cta-library";
import {
  resolveTemplateId,
  type TemplateId,
} from "./libraries/template-library";
import {
  selectPersona,
  type PersonaId,
} from "./libraries/persona-library";

export interface BlueprintSection {
  include: boolean;
  content?: string; // Specific content reference or instruction for Gemini
  sourceRef?: string; // What data this comes from
}

export interface ProposalBlueprint {
  // Metadata
  templateId: TemplateId;
  personaId: PersonaId;
  openingIndustry: OpeningIndustry;
  ctaStyle: CtaStyle;

  // The 9 sections
  sections: {
    greeting: BlueprintSection & { clientName: string; platform: string };
    opening: BlueprintSection & { selectedOpening: string };
    clientProblem: BlueprintSection & { painPoints: string[]; keywords: string[] };
    evidence: BlueprintSection & { yearsExp: number; relevantSkills: string[] };
    portfolioExample: BlueprintSection & { title: string; relevance: string; link: string; skills: string[] };
    implementation: BlueprintSection & { approach: string; tools: string[] };
    timeline: BlueprintSection & { estimate: string; hasTimeline: boolean };
    pricing: BlueprintSection & { model: string; rate: string; hasPricing: boolean };
    cta: BlueprintSection & { selectedCta: string };
    closing: BlueprintSection & { signoff: string };
  };

  // Writing constraints for Stage 6
  constraints: {
    maxWords: number;
    targetGrade: string;
    avgSentenceLen: string;
    forbidHeadings: boolean;
    forbidBulletLists: boolean;
    useContractions: boolean;
  };
}

export interface BlueprintInput {
  jobIntelligence: JobIntelligence;
  matchedPortfolio: IMatchedPortfolioProject[];
  freelancerProfile: {
    fullName: string;
    professionalTitle: string;
    yearsOfExperience: number;
    skills: string[];
    bio: string;
    hourlyRate: number;
    pricingModel: string;
    currency: string;
  } | null;
  userInput: {
    clientName: string;
    platform: string;
    budget: number;
    timeline: string;
    tone: string;
  };
}

export class BlueprintBuilder {
  /**
   * Build the complete 9-section proposal blueprint.
   */
  static build(input: BlueprintInput): ProposalBlueprint {
    const { jobIntelligence, matchedPortfolio, freelancerProfile, userInput } = input;

    const industry = jobIntelligence.industry;
    const skills = freelancerProfile?.skills || [];

    // Resolve library selections
    const openingIndustry = resolveOpeningIndustry(industry);
    const templateId = resolveTemplateId(industry, skills);
    const personaId = selectPersona(industry, skills, userInput.tone).id;
    const ctaStyle = resolveCtaStyle(jobIntelligence.clientTone, jobIntelligence.urgency);

    // Deterministically select opening and CTA
    const selectedOpening = selectOpening(jobIntelligence.keywords.join(" "), openingIndustry);
    const selectedCta = selectCta(userInput.clientName, userInput.platform, ctaStyle);

    // Best matching portfolio project
    const topPortfolioMatch = matchedPortfolio[0] || null;

    // Pricing logic
    const hasPricing = !!(freelancerProfile?.hourlyRate && freelancerProfile.hourlyRate > 0) || userInput.budget > 0;
    const rateString = freelancerProfile?.hourlyRate
      ? `$${freelancerProfile.hourlyRate}/${freelancerProfile.pricingModel === "Hourly" ? "hr" : "project"}`
      : userInput.budget > 0
      ? `$${userInput.budget}`
      : "";

    // Timeline logic
    const hasTimeline = !!(userInput.timeline && userInput.timeline.trim());
    const timelineEstimate = hasTimeline
      ? userInput.timeline
      : jobIntelligence.timeline !== "Flexible"
      ? jobIntelligence.timeline
      : "";

    // Evidence: skills that overlap between freelancer and job
    const relevantSkills = skills.filter((skill) =>
      jobIntelligence.requiredSkills.some(
        (req) =>
          req.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(req.toLowerCase())
      )
    );

    // Implementation approach hint
    const tools = [...new Set([...jobIntelligence.technologies, ...skills.slice(0, 3)])].slice(0, 5);
    const approach = jobIntelligence.deliverables.slice(0, 3).join(", ");

    const blueprint: ProposalBlueprint = {
      templateId,
      personaId,
      openingIndustry,
      ctaStyle,

      sections: {
        greeting: {
          include: true,
          clientName: userInput.clientName,
          platform: userInput.platform,
          content: `Start with a brief, warm greeting to ${userInput.clientName}.`,
          sourceRef: "userInput.clientName",
        },

        opening: {
          include: true,
          selectedOpening,
          content: `Begin with this opening line and continue naturally: "${selectedOpening}"`,
          sourceRef: `opening-library[${openingIndustry}]`,
        },

        clientProblem: {
          include: true,
          painPoints: jobIntelligence.painPoints,
          keywords: jobIntelligence.keywords.slice(0, 5),
          content: `Address these specific pain points: ${jobIntelligence.painPoints.slice(0, 2).join(" and ")}. Use these keywords naturally: ${jobIntelligence.keywords.slice(0, 4).join(", ")}.`,
          sourceRef: "jobIntelligence.painPoints",
        },

        evidence: {
          include: !!(freelancerProfile && relevantSkills.length > 0),
          yearsExp: freelancerProfile?.yearsOfExperience || 0,
          relevantSkills: relevantSkills.slice(0, 4),
          content: relevantSkills.length > 0
            ? `Briefly mention ${freelancerProfile?.yearsOfExperience || "several"} years of experience with ${relevantSkills.slice(0, 3).join(", ")}.`
            : "",
          sourceRef: "freelancerProfile.professional",
        },

        portfolioExample: {
          include: !!topPortfolioMatch,
          title: topPortfolioMatch?.project.title || "",
          relevance: topPortfolioMatch?.matchReason || "",
          link: topPortfolioMatch?.project.link || "",
          skills: topPortfolioMatch?.project.skills || [],
          content: topPortfolioMatch
            ? `Reference the project "${topPortfolioMatch.project.title}" naturally. Reason it's relevant: ${topPortfolioMatch.matchReason}.${topPortfolioMatch.project.link ? ` Include the link: ${topPortfolioMatch.project.link}` : ""}`
            : "",
          sourceRef: `portfolio[0]: ${topPortfolioMatch?.project.title || "none"}`,
        },

        implementation: {
          include: true,
          approach,
          tools,
          content: `Briefly describe how you'd approach: ${approach}. Mention relevant tools only if they appear in the job post: ${jobIntelligence.technologies.join(", ")}.`,
          sourceRef: "jobIntelligence.deliverables + technologies",
        },

        timeline: {
          include: !!(timelineEstimate),
          estimate: timelineEstimate,
          hasTimeline,
          content: timelineEstimate
            ? `Mention a realistic timeline: ${timelineEstimate}. Frame it as an estimate, not a promise.`
            : "",
          sourceRef: "userInput.timeline || jobIntelligence.timeline",
        },

        pricing: {
          include: hasPricing,
          model: freelancerProfile?.pricingModel || "Hourly",
          rate: rateString,
          hasPricing,
          content: hasPricing
            ? `Mention your rate briefly (${rateString}) without being transactional. Tie it to value if possible.`
            : "",
          sourceRef: "freelancerProfile.pricing || userInput.budget",
        },

        cta: {
          include: true,
          selectedCta,
          content: `End with this call-to-action: "${selectedCta}"`,
          sourceRef: `cta-library[${ctaStyle}]`,
        },

        closing: {
          include: true,
          signoff: freelancerProfile?.fullName ? freelancerProfile.fullName.split(" ")[0] : "",
          content: `Close with your first name${freelancerProfile?.fullName ? `: ${freelancerProfile.fullName.split(" ")[0]}` : "."}`,
          sourceRef: "freelancerProfile.personal.fullName",
        },
      },

      constraints: {
        maxWords: 280,
        targetGrade: "Grade 8-10",
        avgSentenceLen: "12-18 words",
        forbidHeadings: true,
        forbidBulletLists: true,
        useContractions: true,
      },
    };

    console.log(`[Stage4] Blueprint built. Template: ${templateId}, Persona: ${personaId}, CTA: ${ctaStyle}`);
    return blueprint;
  }
}
