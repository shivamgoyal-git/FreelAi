import { AiCore, GeminiCallResult } from "./ai-core";
import { createHash } from "crypto";

export interface JobAnalysis {
  requiredSkills: string[];
  deliverables: string[];
  technologies: string[];
  timeline: string;
  budget: string;
  communicationStyle: string;
  clientTone: string;
  painPoints: string[];
  longTermOpportunity: boolean;
  riskIndicators: string[];
  importantKeywords: string[];
  urgency: "Low" | "Medium" | "High";
  decisionDrivers: string[];
  communicationPreference: string;
  budgetSensitivity: "Low" | "Medium" | "High";
  longTermPotential: boolean;
  projectComplexity: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High";
  preferredExperience: string;
}

// In-memory cache for Job Analysis
const jobAnalysisCache: Record<string, JobAnalysis> = {};

export class JobAnalyzer extends AiCore {
  /**
   * Stage 1: Semantic analysis of the client's job description.
   */
  static async analyze(jobPost: string): Promise<GeminiCallResult<JobAnalysis>> {
    const rawPost = jobPost || "";
    
    // Calculate SHA-256 hash of raw jobPost
    const hash = createHash("sha256").update(rawPost.trim()).digest("hex");
    
    // Check Cache Status
    if (jobAnalysisCache[hash]) {
      console.log(`[JobAnalyzer] Cache hit for job description hash: ${hash}`);
      return {
        data: jobAnalysisCache[hash],
        metadata: {
          model: "cache-hit",
          responseTimeMs: 0,
          estimatedInputTokens: 0,
          estimatedOutputTokens: 0,
          estimatedCostUsd: 0,
          timestamp: new Date(),
          cacheHit: true,
        }
      };
    }

    console.log(`[JobAnalyzer] Cache miss. Initiating semantic analysis for job post.`);
    const prompt = `
You are an expert freelance strategist. Analyze the following client job post and extract structural client metrics.
Respond ONLY with a raw JSON object containing these exact fields:
{
  "requiredSkills": ["skill1", "skill2"],
  "deliverables": ["deliverable1", "deliverable2"],
  "technologies": ["tech1", "tech2"],
  "timeline": "timeline description (e.g. 1 month)",
  "budget": "budget description (e.g. $5,000 fixed)",
  "communicationStyle": "client's communication preference (e.g. direct, detail-oriented)",
  "clientTone": "tone keywords (e.g. professional, urgent, friendly)",
  "painPoints": ["painPoint1", "painPoint2"],
  "longTermOpportunity": true|false,
  "riskIndicators": ["risk1", "risk2"],
  "importantKeywords": ["kw1", "kw2"],
  "urgency": "Low"|"Medium"|"High",
  "decisionDrivers": ["driver1", "driver2"],
  "communicationPreference": "e.g. video call, async, slack",
  "budgetSensitivity": "Low"|"Medium"|"High",
  "longTermPotential": true|false,
  "projectComplexity": "Low"|"Medium"|"High",
  "riskLevel": "Low"|"Medium"|"High",
  "preferredExperience": "e.g. Senior developer, Mid-level designer"
}

Client Job Post:
"""
${rawPost}
"""

Do NOT wrap the JSON in markdown code blocks. Do not write \`\`\`json. Return ONLY valid JSON.
`;

    let result: GeminiCallResult<JobAnalysis>;

    if (this.hasApiKey()) {
      try {
        result = await this.callGemini<JobAnalysis>(prompt);
        // Post-analysis validation: ensure skills/tech actually exist in the job description text
        result.data = this.validateAndFilter(result.data, rawPost);
        // Store in cache
        jobAnalysisCache[hash] = result.data;
      } catch (err) {
        console.error("[JobAnalyzer] Gemini semantic analyzer failed, falling back to regex parser:", err);
        const fallbackData = this.getMockAnalysis(rawPost);
        result = await this.mockFallback<JobAnalysis>(fallbackData, 0, prompt);
        jobAnalysisCache[hash] = result.data;
      }
    } else {
      console.log("[JobAnalyzer] No API Key found, using fallback regex analyzer.");
      const fallbackData = this.getMockAnalysis(rawPost);
      result = await this.mockFallback<JobAnalysis>(fallbackData, 500, prompt);
      jobAnalysisCache[hash] = result.data;
    }

    return result;
  }

  /**
   * Deterministic Post-analysis skill presence verification.
   * Discards any extracted skill or technology that doesn't share any substring match with the job description.
   */
  private static validateAndFilter(analysis: JobAnalysis, jobPost: string): JobAnalysis {
    const postLower = jobPost.toLowerCase();
    
    // Helper to verify keyword presence
    const isKeywordPresent = (kw: string) => {
      const cleanKw = kw.toLowerCase().trim();
      if (!cleanKw) return false;
      // If it's a short skill (like "go"), check for word boundaries
      if (cleanKw.length <= 2) {
        const regex = new RegExp(`\\b${cleanKw}\\b`, "i");
        return regex.test(postLower);
      }
      return postLower.includes(cleanKw);
    };

    // Filter skills
    const originalSkills = analysis.requiredSkills || [];
    analysis.requiredSkills = originalSkills.filter((s) => isKeywordPresent(s));
    
    // Filter technologies
    const originalTech = analysis.technologies || [];
    analysis.technologies = originalTech.filter((t) => isKeywordPresent(t));

    // If both ended up empty but there are some keywords in the post, fill with present words
    if (analysis.requiredSkills.length === 0) {
      const fallbackSkills = ["video editing", "writing", "design", "development", "seo", "consulting"];
      analysis.requiredSkills = fallbackSkills.filter((s) => isKeywordPresent(s));
      if (analysis.requiredSkills.length === 0) {
        analysis.requiredSkills = ["Freelance Services"];
      }
    }

    return analysis;
  }

  /**
   * Deterministic Fallback Regex Extractor
   */
  private static getMockAnalysis(jobPost: string): JobAnalysis {
    const postLower = (jobPost || "").toLowerCase();
    const skills: string[] = [];
    const tech: string[] = [];

    // Scan for Video Editing keywords
    if (postLower.includes("video") || postLower.includes("edit") || postLower.includes("premiere") || postLower.includes("after effects") || postLower.includes("storytelling") || postLower.includes("motion")) {
      if (postLower.includes("premiere")) skills.push("Premiere Pro");
      if (postLower.includes("after effects") || postLower.includes("motion")) {
        skills.push("Motion Graphics");
        tech.push("After Effects");
      }
      if (postLower.includes("story")) skills.push("Storytelling");
      skills.push("Video Editing");
    }

    // Scan for Development keywords
    if (postLower.includes("react") || postLower.includes("next.js") || postLower.includes("typescript") || postLower.includes("javascript") || postLower.includes("frontend") || postLower.includes("web")) {
      if (postLower.includes("react")) {
        skills.push("React Development");
        tech.push("React");
      }
      if (postLower.includes("next")) {
        skills.push("SaaS Dashboard Development");
        tech.push("Next.js");
      }
      if (postLower.includes("typescript")) {
        skills.push("TypeScript");
        tech.push("TypeScript");
      }
      if (postLower.includes("tailwind")) {
        skills.push("UI Styling");
        tech.push("Tailwind CSS");
      }
    }

    // Scan for Design keywords
    if (postLower.includes("design") || postLower.includes("ui") || postLower.includes("ux") || postLower.includes("figma") || postLower.includes("brand")) {
      if (postLower.includes("figma")) {
        skills.push("Figma Prototyping");
        tech.push("Figma");
      }
      skills.push("UI/UX Design");
    }

    // Scan for Marketing keywords
    if (postLower.includes("marketing") || postLower.includes("seo") || postLower.includes("ads") || postLower.includes("google")) {
      if (postLower.includes("seo")) skills.push("SEO Optimization");
      if (postLower.includes("ads")) skills.push("Google Ads Campaigns");
      skills.push("Growth Marketing");
    }

    // Default general skills if nothing matched
    if (skills.length === 0) {
      skills.push("Freelance Consulting");
    }

    const urgency: "Low" | "Medium" | "High" =
      postLower.includes("urgent") || postLower.includes("soon") || postLower.includes("asap") || postLower.includes("immediately")
        ? "High"
        : "Medium";

    const budgetSensitivity = postLower.includes("budget") || postLower.includes("cheap") || postLower.includes("tight") ? "High" : "Medium";
    const longTermPotential = postLower.includes("long term") || postLower.includes("ongoing") || postLower.includes("retainer");

    return {
      requiredSkills: skills,
      deliverables: [
        "First draft project sprint",
        "High-fidelity assets delivery",
        "Performance optimization walkthrough",
      ],
      technologies: tech,
      timeline: postLower.includes("week") ? "3 weeks" : "1 month",
      budget: postLower.includes("$") ? "Estimated Fixed Rate" : "Hourly standard rate",
      communicationStyle: "Direct, transparent and outcomes-focused",
      clientTone: postLower.includes("urgent") ? "Casual-Urgent" : "Friendly-Professional",
      painPoints: [
        "Need a reliable specialist to complete the project without delays",
        "Difficulty finding verified experts who communicate clearly",
      ],
      longTermOpportunity: longTermPotential,
      riskIndicators: postLower.includes("cheap") ? ["Low budget risk"] : [],
      importantKeywords: skills.map((s) => s.toLowerCase()),
      urgency,
      decisionDrivers: ["Technical competency", "Fast response times"],
      communicationPreference: "Async message board & video checkin",
      budgetSensitivity,
      longTermPotential,
      projectComplexity: "Medium",
      riskLevel: "Low",
      preferredExperience: "Mid-to-Senior Specialist",
    };
  }
}
