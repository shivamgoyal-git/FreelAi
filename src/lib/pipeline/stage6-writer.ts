/**
 * Stage 6 — Human Proposal Writer
 *
 * Responsibility: ONE Gemini call that writes the complete proposal
 * from the structured blueprint, persona, few-shot examples, and template.
 *
 * This is the ONLY Gemini call in the main pipeline path.
 *
 * The AI receives:
 *  - The 9-section blueprint (structured, not raw job post)
 *  - The writing persona prompt block
 *  - The industry template structure guidance
 *  - Top-3 few-shot examples as writing reference
 *  - The forbidden phrase blacklist
 *  - Hard constraints (word count, reading level, no headings)
 *
 * The AI NEVER receives:
 *  - The raw conversation history
 *  - Vague instructions like "write a great proposal"
 *  - The full job post text (only the structured intelligence)
 */

import { AiCore, GeminiCallResult } from "../ai-core";
import type { ProposalBlueprint } from "./stage4-blueprint-builder";
import type { RetrievedExamples } from "./stage5-retrieval";
import { TEMPLATES } from "./libraries/template-library";
import { PERSONAS } from "./libraries/persona-library";
import { FORBIDDEN_PHRASE_BLACKLIST } from "./libraries/phrase-filter";

export interface WriterInput {
  blueprint: ProposalBlueprint;
  retrievedExamples: RetrievedExamples;
  freelancerContextBlock: string; // Pre-formatted context from AiContextService
  jobPost: string; // Kept for full context reference
}

export interface WriterResult {
  proposalText: string;
  metadata: GeminiCallResult<string>["metadata"];
  promptUsed: string;
}

export class ProposalWriter extends AiCore {
  /**
   * Generate the complete proposal in ONE Gemini call.
   */
  static async write(input: WriterInput): Promise<WriterResult> {
    const { blueprint, retrievedExamples, freelancerContextBlock } = input;

    const persona = PERSONAS[blueprint.personaId];
    const template = TEMPLATES[blueprint.templateId];
    const sections = blueprint.sections;

    // Build the few-shot block
    const fewShotBlock = retrievedExamples.examples.length > 0
      ? `\n--- REFERENCE PROPOSALS (writing style and tone to emulate) ---\n` +
        retrievedExamples.examples
          .map((ex, i) => `Example ${i + 1}:\n${ex.proposal}`)
          .join("\n\n") +
        `\n--- END REFERENCES ---\n`
      : "";

    // Build the blueprint instructions block
    const blueprintBlock = this.buildBlueprintBlock(blueprint);

    // Build the forbidden phrases block
    const forbiddenBlock = `\nNEVER USE THESE PHRASES (rewrite any sentence containing them):\n${FORBIDDEN_PHRASE_BLACKLIST.map((p) => `- "${p}"`).join("\n")}`;

    const prompt = `${persona.promptBlock}

${freelancerContextBlock}

${template.structurePrompt}
${fewShotBlock}
${blueprintBlock}

HARD RULES (violations will cause rejection and regeneration):
- Maximum ${blueprint.constraints.maxWords} words total
- Reading level: ${blueprint.constraints.targetGrade}
- Average sentence: ${blueprint.constraints.avgSentenceLen}
- NO markdown headings (no #, ##, bold section titles)
- NO bullet lists unless the job post specifically uses them
- USE contractions naturally (I'm, I've, you'll, you're, let's, don't)
- NEVER invent client names, companies, certifications, awards, statistics
- NEVER invent portfolio projects — only reference what is provided
- If information is missing from the blueprint, omit that section entirely
${forbiddenBlock}

Write the complete proposal now. Return ONLY the proposal text. No JSON, no markdown, no explanation.`;

    console.log(`[Stage6] Writing proposal. Persona: ${blueprint.personaId}, Template: ${blueprint.templateId}, Examples: ${retrievedExamples.examples.length}`);

    let result: GeminiCallResult<string>;

    if (this.hasApiKey()) {
      try {
        result = await this.callGeminiRawText(prompt);
      } catch (err) {
        console.error("[Stage6] Gemini write failed, using mock fallback:", err);
        result = await this.mockFallback<string>(
          this.buildMockProposal(blueprint),
          0,
          prompt
        );
      }
    } else {
      console.log("[Stage6] No API key — using mock proposal.");
      result = await this.mockFallback<string>(
        this.buildMockProposal(blueprint),
        800,
        prompt
      );
    }

    return {
      proposalText: result.data,
      metadata: result.metadata,
      promptUsed: prompt,
    };
  }

  /**
   * Build the blueprint instructions block for the Gemini prompt.
   */
  private static buildBlueprintBlock(blueprint: ProposalBlueprint): string {
    const s = blueprint.sections;
    const lines: string[] = ["--- PROPOSAL BLUEPRINT (follow this exactly) ---"];

    if (s.greeting.include) {
      lines.push(`GREETING: ${s.greeting.content}`);
    }
    if (s.opening.include) {
      lines.push(`OPENING: ${s.opening.content}`);
    }
    if (s.clientProblem.include) {
      lines.push(`CLIENT PROBLEM: ${s.clientProblem.content}`);
    }
    if (s.evidence.include && s.evidence.content) {
      lines.push(`EVIDENCE: ${s.evidence.content}`);
    }
    if (s.portfolioExample.include && s.portfolioExample.content) {
      lines.push(`PORTFOLIO: ${s.portfolioExample.content}`);
    }
    if (s.implementation.include) {
      lines.push(`APPROACH: ${s.implementation.content}`);
    }
    if (s.timeline.include && s.timeline.content) {
      lines.push(`TIMELINE: ${s.timeline.content}`);
    }
    if (s.pricing.include && s.pricing.content) {
      lines.push(`PRICING: ${s.pricing.content}`);
    }
    if (s.cta.include) {
      lines.push(`CALL TO ACTION: ${s.cta.content}`);
    }
    if (s.closing.include && s.closing.content) {
      lines.push(`CLOSING: ${s.closing.content}`);
    }

    lines.push("--- END BLUEPRINT ---");
    return lines.join("\n");
  }

  /**
   * Call Gemini and return the raw text response (not JSON).
   */
  protected static async callGeminiRawText(
    prompt: string
  ): Promise<GeminiCallResult<string>> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Gemini Stage6 error: HTTP ${response.status}`);
    }

    const raw = await response.json();
    const text: string = raw?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) throw new Error("Gemini returned empty text response");

    const metadata = this.buildMetadata({
      model: "gemini-1.5-flash",
      responseTimeMs,
      inputText: prompt,
      outputText: text,
      cacheHit: false,
    });

    return { data: text.trim(), metadata };
  }

  /**
   * Build a realistic mock proposal when no API key is available.
   */
  private static buildMockProposal(blueprint: ProposalBlueprint): string {
    const s = blueprint.sections;
    const parts: string[] = [];

    if (s.greeting.include && s.greeting.clientName) {
      parts.push(`Hi ${s.greeting.clientName},`);
    }

    parts.push(s.opening.selectedOpening + " — and I think I'm a good fit for what you're looking for.");

    if (s.clientProblem.painPoints.length > 0) {
      parts.push(`The ${s.clientProblem.painPoints[0].toLowerCase()} issue you mentioned is something I've dealt with on past projects. I know the approach that works well here, and I'd rather address it upfront than discover it halfway through.`);
    }

    if (s.portfolioExample.include && s.portfolioExample.title) {
      const linkPart = s.portfolioExample.link ? ` (${s.portfolioExample.link})` : "";
      parts.push(`I've worked on a project called "${s.portfolioExample.title}"${linkPart} that's very similar in scope — ${s.portfolioExample.relevance.toLowerCase()} That's the kind of result I'd aim for here too.`);
    }

    if (s.implementation.include) {
      parts.push(`My approach would be to start with a clear scope, agree on deliverables before anything is built, and check in regularly so there are no surprises at the end.`);
    }

    if (s.timeline.include && s.timeline.estimate) {
      parts.push(`Based on what you've described, I'd estimate a timeline of ${s.timeline.estimate}, though I'd want to confirm this once we've talked through the full scope.`);
    }

    parts.push(s.cta.selectedCta);

    if (s.closing.include && s.closing.signoff) {
      parts.push(s.closing.signoff);
    }

    return parts.join("\n\n");
  }
}
