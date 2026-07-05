/**
 * Stage 1 — Job Intelligence Engine
 *
 * Responsibility: Analyze the client's job description and return structured JSON.
 * This stage NEVER generates any proposal prose.
 * Gemini call is cached by SHA-256(jobPost) to avoid duplicate calls for the same job.
 *
 * Returns: JobIntelligence — a richer superset of the old JobAnalysis type.
 */

import { AiCore, GeminiCallResult } from "../ai-core";
import { createHash } from "crypto";

export interface JobIntelligence {
  industry: string;
  clientTone: string;
  communicationStyle: string;
  deliverables: string[];
  timeline: string;
  budget: string;
  painPoints: string[];
  keywords: string[];
  /** Alias for keywords — kept for backwards compat with portfolio-matcher, scorer, validator, and frontend */
  importantKeywords: string[];
  requiredSkills: string[];
  technologies: string[];
  urgency: "Low" | "Medium" | "High";
  budgetSensitivity: "Low" | "Medium" | "High";
  longTermPotential: boolean;
  projectComplexity: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High";
  decisionDrivers: string[];
  preferredExperience: string;
  missingInfo: string[]; // Info absent from the job post that would help
}

// In-memory cache: SHA-256(jobPost) → JobIntelligence
const intelligenceCache: Record<string, JobIntelligence> = {};

export class JobIntelligenceEngine extends AiCore {
  /**
   * Analyze a job post and return structured intelligence JSON.
   * Result is cached by job post hash.
   */
  static async analyze(jobPost: string): Promise<GeminiCallResult<JobIntelligence>> {
    const rawPost = (jobPost || "").trim();
    const hash = createHash("sha256").update(rawPost).digest("hex");

    // Cache hit
    if (intelligenceCache[hash]) {
      console.log(`[Stage1] Cache hit for job hash: ${hash.slice(0, 8)}...`);
      return {
        data: intelligenceCache[hash],
        metadata: this.cacheHitMetadata(),
      };
    }

    console.log(`[Stage1] Analyzing job post (${rawPost.length} chars)...`);

    const prompt = `You are a freelance business analyst. Analyze the following client job post and extract structured intelligence.

Return ONLY a valid JSON object. No prose, no markdown, no explanation. Just JSON.

Required JSON shape:
{
  "industry": "e.g. Video Editing, Web Development, UI Design, SEO",
  "clientTone": "e.g. Professional, Casual, Urgent, Friendly, Technical",
  "communicationStyle": "e.g. Direct, Detail-oriented, Collaborative, Results-focused",
  "deliverables": ["list", "of", "specific", "deliverables"],
  "timeline": "e.g. 48 hours, 2 weeks, Ongoing",
  "budget": "e.g. $500 fixed, $50/hr, Not specified",
  "painPoints": ["what is bothering the client or slowing them down"],
  "keywords": ["important", "terms", "from", "the", "post"],
  "requiredSkills": ["skill1", "skill2"],
  "technologies": ["tool1", "tool2"],
  "urgency": "Low|Medium|High",
  "budgetSensitivity": "Low|Medium|High",
  "longTermPotential": true|false,
  "projectComplexity": "Low|Medium|High",
  "riskLevel": "Low|Medium|High",
  "decisionDrivers": ["what matters most to this client"],
  "preferredExperience": "e.g. Senior, Mid-level, Specialist",
  "missingInfo": ["pieces of information absent from the post that would help scope this project"]
}

Rules:
- Only include skills and technologies that actually appear in the post
- missingInfo should list 1-3 things that are genuinely unclear from the post
- If budget or timeline is not mentioned, note it in missingInfo
- Return ONLY raw JSON. No \`\`\`json wrapper.

Job Post:
"""
${rawPost}
"""`;

    let result: GeminiCallResult<JobIntelligence>;

    if (this.hasApiKey()) {
      try {
        result = await this.callGemini<JobIntelligence>(prompt);
        result.data = this.validateAndSanitize(result.data, rawPost);
        // Ensure importantKeywords alias is populated
        result.data.importantKeywords = result.data.importantKeywords || result.data.keywords;
        intelligenceCache[hash] = result.data;
      } catch (err) {
        console.error("[Stage1] Gemini call failed, using local fallback:", err);
        const fallback = this.localFallback(rawPost);
        result = await this.mockFallback<JobIntelligence>(fallback, 0, prompt);
        // Ensure importantKeywords alias is populated
        result.data.importantKeywords = result.data.importantKeywords || result.data.keywords;
        intelligenceCache[hash] = result.data;
      }
    } else {
      console.log("[Stage1] No API key — using local regex fallback.");
      const fallback = this.localFallback(rawPost);
      result = await this.mockFallback<JobIntelligence>(fallback, 400, prompt);
      // Ensure importantKeywords alias is populated
      result.data.importantKeywords = result.data.importantKeywords || result.data.keywords;
      intelligenceCache[hash] = result.data;
    }

    return result;
  }

  /**
   * Validate the Gemini response and filter out hallucinated skills/technologies.
   */
  private static validateAndSanitize(data: JobIntelligence, rawPost: string): JobIntelligence {
    const postLower = rawPost.toLowerCase();

    const isPresent = (term: string): boolean => {
      const t = term.toLowerCase().trim();
      if (!t) return false;
      if (t.length <= 2) return new RegExp(`\\b${t}\\b`, "i").test(postLower);
      return postLower.includes(t);
    };

    data.requiredSkills = (data.requiredSkills || []).filter(isPresent);
    data.technologies = (data.technologies || []).filter(isPresent);

    if (!data.requiredSkills.length) data.requiredSkills = ["Freelance Services"];
    if (!data.deliverables?.length) data.deliverables = ["Project deliverables"];
    if (!data.painPoints?.length) data.painPoints = ["Reliable delivery"];
    if (!data.keywords?.length) data.keywords = data.requiredSkills.map((s) => s.toLowerCase());
    // Always populate the importantKeywords alias (required by frontend + scorer + validator)
    data.importantKeywords = data.importantKeywords?.length ? data.importantKeywords : data.keywords;
    if (!data.missingInfo) data.missingInfo = [];

    return data;
  }

  /**
   * Local regex-based fallback when Gemini is unavailable.
   */
  private static localFallback(jobPost: string): JobIntelligence {
    const p = jobPost.toLowerCase();
    const skills: string[] = [];
    const tech: string[] = [];
    const missing: string[] = [];

    // Detect industry category
    const isVideo = p.includes("video") || p.includes("edit") || p.includes("film") || p.includes("motion");
    const isDev = p.includes("react") || p.includes("next.js") || p.includes("typescript") || p.includes("web") || p.includes("app");
    const isDesign = p.includes("figma") || p.includes("ui") || p.includes("ux") || p.includes("design");
    const isSeo = p.includes("seo") || p.includes("search engine") || p.includes("ranking");
    const isCopy = p.includes("copywriting") || p.includes("content") || p.includes("writing");

    let industry = "General Freelancing";

    if (isVideo) {
      industry = "Video Editing";
      skills.push("Video Editing");
      if (p.includes("premiere")) { skills.push("Premiere Pro"); tech.push("Premiere Pro"); }
      if (p.includes("after effects") || p.includes("motion")) { skills.push("Motion Graphics"); tech.push("After Effects"); }
      if (p.includes("davinci")) { skills.push("Color Grading"); tech.push("DaVinci Resolve"); }
      if (p.includes("story")) skills.push("Storytelling");
    } else if (isDev) {
      industry = "Web Development";
      if (p.includes("react")) { skills.push("React"); tech.push("React"); }
      if (p.includes("next")) { skills.push("Next.js"); tech.push("Next.js"); }
      if (p.includes("typescript")) { skills.push("TypeScript"); tech.push("TypeScript"); }
      if (p.includes("node")) { skills.push("Node.js"); tech.push("Node.js"); }
    } else if (isDesign) {
      industry = "UI/UX Design";
      skills.push("UI Design");
      if (p.includes("figma")) { skills.push("Figma"); tech.push("Figma"); }
      if (p.includes("ux")) skills.push("UX Design");
    } else if (isSeo) {
      industry = "SEO";
      skills.push("SEO Optimization");
      if (p.includes("technical")) skills.push("Technical SEO");
      if (p.includes("content")) skills.push("Content Strategy");
    } else if (isCopy) {
      industry = "Copywriting";
      skills.push("Copywriting");
      if (p.includes("email")) skills.push("Email Marketing");
      if (p.includes("landing")) skills.push("Landing Page Copy");
    }

    if (skills.length === 0) skills.push("Freelance Consulting");

    const urgency: "Low" | "Medium" | "High" =
      p.includes("urgent") || p.includes("asap") || p.includes("immediately") ? "High" : "Medium";

    if (!p.includes("$") && !p.includes("budget") && !p.includes("rate")) {
      missing.push("Budget or rate not specified");
    }
    if (!p.includes("week") && !p.includes("month") && !p.includes("day") && !p.includes("deadline")) {
      missing.push("Timeline or deadline not mentioned");
    }

    return {
      industry,
      clientTone: urgency === "High" ? "Urgent" : "Professional",
      communicationStyle: "Direct",
      deliverables: ["Project deliverables per brief"],
      timeline: p.includes("week") ? "1–2 weeks" : p.includes("month") ? "1 month" : "Flexible",
      budget: p.includes("$") ? "Estimated from post" : "Not specified",
      painPoints: ["Reliable delivery", "Clear communication"],
      keywords: skills.map((s) => s.toLowerCase()),
      importantKeywords: skills.map((s) => s.toLowerCase()),
      requiredSkills: skills,
      technologies: tech,
      urgency,
      budgetSensitivity: p.includes("budget") || p.includes("cheap") ? "High" : "Medium",
      longTermPotential: p.includes("long term") || p.includes("ongoing") || p.includes("retainer"),
      projectComplexity: "Medium",
      riskLevel: "Low",
      decisionDrivers: ["Reliability", "Quality"],
      preferredExperience: "Mid-to-senior level",
      missingInfo: missing,
    };
  }
}
