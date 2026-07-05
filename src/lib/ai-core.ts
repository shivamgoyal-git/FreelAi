/**
 * AiCore — Abstract base class for all AI service modules in FreelAI.
 *
 * Provides:
 *  • callGemini()       — structured JSON call to Gemini REST API
 *  • trackMetadata()    — records response time, model, estimated tokens & cost
 *  • mockFallback()     — returns mock data when GEMINI_API_KEY is absent
 *
 * All future AI services (ProposalIntelligenceEngine, LearningEngine, etc.)
 * extend this class and inherit these capabilities automatically.
 */

export interface AiRequestMetadata {
  model: string;
  responseTimeMs: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
  timestamp: Date;
  cacheHit: boolean;
}

export interface GeminiCallResult<T> {
  data: T;
  metadata: AiRequestMetadata;
}

// Gemini 1.5 Flash pricing (public, per 1M tokens, as of 2025)
const GEMINI_FLASH_INPUT_COST_PER_1M = 0.075;
const GEMINI_FLASH_OUTPUT_COST_PER_1M = 0.30;
const DEFAULT_MODEL = "gemini-1.5-flash";

export abstract class AiCore {
  /**
   * Call Gemini with a text prompt and return parsed JSON of type T.
   * Tracks metadata automatically.
   *
   * @param prompt  Full prompt string
   * @param model   Gemini model name (defaults to gemini-1.5-flash)
   */
  protected static async callGemini<T>(
    prompt: string,
    model: string = DEFAULT_MODEL
  ): Promise<GeminiCallResult<T>> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set — use mockFallback() instead");
    }

    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Gemini API error: HTTP ${response.status}`);
    }

    const raw = await response.json();
    const rawText: string = raw?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }

    let parsed: T;
    try {
      parsed = JSON.parse(rawText.trim()) as T;
    } catch {
      throw new Error(`Gemini response was not valid JSON: ${rawText.slice(0, 200)}`);
    }

    const metadata = AiCore.buildMetadata({
      model,
      responseTimeMs,
      inputText: prompt,
      outputText: rawText,
      cacheHit: false,
    });

    return { data: parsed, metadata };
  }

  /**
   * Build an AiRequestMetadata record.
   * Input/output token counts are estimated at ~4 chars per token.
   */
  protected static buildMetadata({
    model,
    responseTimeMs,
    inputText,
    outputText,
    cacheHit,
  }: {
    model: string;
    responseTimeMs: number;
    inputText: string;
    outputText: string;
    cacheHit: boolean;
  }): AiRequestMetadata {
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    const estimatedOutputTokens = Math.ceil(outputText.length / 4);
    const estimatedCostUsd =
      (estimatedInputTokens / 1_000_000) * GEMINI_FLASH_INPUT_COST_PER_1M +
      (estimatedOutputTokens / 1_000_000) * GEMINI_FLASH_OUTPUT_COST_PER_1M;

    return {
      model,
      responseTimeMs,
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 1_000_000) / 1_000_000,
      timestamp: new Date(),
      cacheHit,
    };
  }

  /**
   * Returns mock data with an artificial delay when GEMINI_API_KEY is absent.
   * Also produces realistic-looking metadata for the mock.
   */
  protected static async mockFallback<T>(
    data: T,
    delayMs: number = 1200,
    prompt: string = ""
  ): Promise<GeminiCallResult<T>> {
    await new Promise((r) => setTimeout(r, delayMs));

    const metadata = AiCore.buildMetadata({
      model: `${DEFAULT_MODEL} (mock)`,
      responseTimeMs: delayMs,
      inputText: prompt,
      outputText: JSON.stringify(data),
      cacheHit: false,
    });

    return { data, metadata };
  }

  /**
   * Utility: check if Gemini API key is configured.
   */
  protected static hasApiKey(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  /**
   * Builds a cache metadata record for a cache-hit response (no Gemini call).
   */
  protected static cacheHitMetadata(model: string = DEFAULT_MODEL): AiRequestMetadata {
    return {
      model,
      responseTimeMs: 0,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      estimatedCostUsd: 0,
      timestamp: new Date(),
      cacheHit: true,
    };
  }
}
