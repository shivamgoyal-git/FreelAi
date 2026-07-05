/**
 * AI Phrase Filter — Blacklist + deterministic replacement map.
 *
 * Applied in two places:
 *  1. stage7-local-humanizer.ts — post-write string replacement (zero cost)
 *  2. stage6-writer.ts — injected into Gemini prompt as a forbidden-phrase constraint
 *
 * Rules:
 *  - Replacements are case-insensitive
 *  - Whole-word matching where applicable to avoid partial replacements
 *  - Order matters: longer phrases are matched before shorter ones
 */

export interface PhraseReplacement {
  pattern: RegExp;
  replacement: string;
  note: string;
}

/**
 * Ordered replacement rules — longest / most specific first.
 */
export const PHRASE_REPLACEMENTS: PhraseReplacement[] = [
  // ── Verbose openings ────────────────────────────────────────────────────────
  { pattern: /I have carefully reviewed your requirements/gi, replacement: "I read through your requirements", note: "verbose opener" },
  { pattern: /I have thoroughly reviewed/gi, replacement: "I've read through", note: "verbose opener" },
  { pattern: /I have carefully read/gi, replacement: "I read through", note: "verbose opener" },
  { pattern: /I have taken the time to/gi, replacement: "I", note: "filler phrase" },
  { pattern: /I would like to take this opportunity/gi, replacement: "I'd like to", note: "filler opener" },
  { pattern: /Thank you for considering me for this opportunity/gi, replacement: "", note: "sycophantic opener" },
  { pattern: /Thank you for considering my application/gi, replacement: "", note: "sycophantic opener" },
  { pattern: /I am writing to express my interest in/gi, replacement: "I'm interested in", note: "formal opener" },
  { pattern: /I am excited to apply for/gi, replacement: "I'd love to work on", note: "generic opener" },
  { pattern: /Please do not hesitate to/gi, replacement: "Feel free to", note: "formal phrasing" },
  { pattern: /Do not hesitate to/gi, replacement: "Feel free to", note: "formal phrasing" },

  // ── AI buzzwords ─────────────────────────────────────────────────────────────
  { pattern: /\bhit the ground running\b/gi, replacement: "start quickly", note: "cliche" },
  { pattern: /\bsynergy\b/gi, replacement: "coordination", note: "buzzword" },
  { pattern: /\boutcome-driven\b/gi, replacement: "results-focused", note: "buzzword" },
  { pattern: /\bseamless(ly)?\b/gi, replacement: "smooth", note: "overused" },
  { pattern: /\binnovative solution(s)?\b/gi, replacement: "fresh approach", note: "buzzword" },
  { pattern: /\brobust solution(s)?\b/gi, replacement: "solid approach", note: "buzzword" },
  { pattern: /\bcomprehensive solution(s)?\b/gi, replacement: "thorough approach", note: "buzzword" },
  { pattern: /\bcutting-edge\b/gi, replacement: "modern", note: "overused" },
  { pattern: /\bworld-class\b/gi, replacement: "excellent", note: "overused" },
  { pattern: /\bbest-in-class\b/gi, replacement: "top quality", note: "overused" },
  { pattern: /\bstate-of-the-art\b/gi, replacement: "modern", note: "overused" },
  { pattern: /\bgame-changer\b/gi, replacement: "significant improvement", note: "cliche" },
  { pattern: /\bgame changer\b/gi, replacement: "significant improvement", note: "cliche" },
  { pattern: /\bvalue-add\b/gi, replacement: "benefit", note: "buzzword" },
  { pattern: /\bvalue add\b/gi, replacement: "benefit", note: "buzzword" },
  { pattern: /\bleverage\b/gi, replacement: "use", note: "buzzword" },
  { pattern: /\bstreamline\b/gi, replacement: "simplify", note: "buzzword" },
  { pattern: /\bstreamlined\b/gi, replacement: "simplified", note: "buzzword" },
  { pattern: /\bstreamlining\b/gi, replacement: "simplifying", note: "buzzword" },
  { pattern: /\bcomprehensive\b/gi, replacement: "thorough", note: "overused" },
  { pattern: /\bhigh-quality deliverables\b/gi, replacement: "strong results", note: "buzzword" },
  { pattern: /\bhigh quality deliverables\b/gi, replacement: "strong results", note: "buzzword" },
  { pattern: /\balign(ing)? our strateg(y|ies)\b/gi, replacement: "align on the plan", note: "corporate speak" },
  { pattern: /\bexecutive summary\b/gi, replacement: "", note: "heading in prose" },
  { pattern: /\bdive deep\b/gi, replacement: "dig into", note: "overused" },
  { pattern: /\btestament to\b/gi, replacement: "proof of", note: "formal" },

  // ── Verbose constructions ────────────────────────────────────────────────────
  { pattern: /\bin order to\b/gi, replacement: "to", note: "verbose" },
  { pattern: /\bfurthermore\b/gi, replacement: "also", note: "formal connector" },
  { pattern: /\badditionally\b/gi, replacement: "and", note: "formal connector" },
  { pattern: /\bmoreover\b/gi, replacement: "also", note: "formal connector" },
  { pattern: /\bnevertheless\b/gi, replacement: "still", note: "formal" },
  { pattern: /\bnotwithstanding\b/gi, replacement: "despite", note: "formal" },
  { pattern: /\butilize\b/gi, replacement: "use", note: "unnecessarily formal" },
  { pattern: /\butilization\b/gi, replacement: "use", note: "unnecessarily formal" },
  { pattern: /\bfacilitate\b/gi, replacement: "help", note: "corporate speak" },
  { pattern: /\bendeavor\b/gi, replacement: "try", note: "formal" },
  { pattern: /\bcommence\b/gi, replacement: "start", note: "formal" },
  { pattern: /\bprior to\b/gi, replacement: "before", note: "formal" },
  { pattern: /\bsubsequent to\b/gi, replacement: "after", note: "formal" },
  { pattern: /\bat this point in time\b/gi, replacement: "now", note: "verbose" },
  { pattern: /\bdue to the fact that\b/gi, replacement: "because", note: "verbose" },
  { pattern: /\bin the event that\b/gi, replacement: "if", note: "verbose" },
  { pattern: /\bit is important to note (that)?\b/gi, replacement: "", note: "filler" },
  { pattern: /\bit should be noted (that)?\b/gi, replacement: "", note: "filler" },
  { pattern: /\bI have extensive experience\b/gi, replacement: "I've worked on", note: "generic claim" },
  { pattern: /\bI am passionate about\b/gi, replacement: "I enjoy", note: "generic" },
  { pattern: /\bI am dedicated to\b/gi, replacement: "I focus on", note: "generic" },
  { pattern: /\bI am confident (that|in)\b/gi, replacement: "I'm confident", note: "contraction needed" },
  { pattern: /\bI am available\b/gi, replacement: "I'm available", note: "contraction needed" },
  { pattern: /\bI am excited\b/gi, replacement: "I'm excited", note: "contraction needed" },
  { pattern: /\bI would love\b/gi, replacement: "I'd love", note: "contraction needed" },
  { pattern: /\bI would like\b/gi, replacement: "I'd like", note: "contraction needed" },
  { pattern: /\bI would be happy\b/gi, replacement: "I'd be happy", note: "contraction needed" },
  { pattern: /\bI will\b/g, replacement: "I'll", note: "contraction needed" },
  { pattern: /\byou will\b/gi, replacement: "you'll", note: "contraction needed" },
  { pattern: /\byou are\b/gi, replacement: "you're", note: "contraction needed" },
  { pattern: /\blet us\b/gi, replacement: "let's", note: "contraction needed" },
  { pattern: /\bwe are\b/gi, replacement: "we're", note: "contraction needed" },
  { pattern: /\bdo not\b/gi, replacement: "don't", note: "contraction needed" },
  { pattern: /\bcan not\b/gi, replacement: "can't", note: "contraction needed" },
  { pattern: /\bcannot\b/gi, replacement: "can't", note: "contraction needed" },
  { pattern: /\bwill not\b/gi, replacement: "won't", note: "contraction needed" },
  { pattern: /\bdid not\b/gi, replacement: "didn't", note: "contraction needed" },
  { pattern: /\bdoes not\b/gi, replacement: "doesn't", note: "contraction needed" },
  { pattern: /\bhas not\b/gi, replacement: "hasn't", note: "contraction needed" },
  { pattern: /\bhave not\b/gi, replacement: "haven't", note: "contraction needed" },
];

/**
 * Blacklist used to populate Gemini's forbidden phrase list in the prompt.
 * Simpler strings rather than regex patterns.
 */
export const FORBIDDEN_PHRASE_BLACKLIST: string[] = [
  "leverage", "robust", "streamline", "synergy", "outcome-driven",
  "innovative solution", "comprehensive", "hit the ground running",
  "high-quality deliverables", "cutting-edge", "world-class", "best-in-class",
  "align our strategy", "value-add", "dive deep", "game-changer",
  "state-of-the-art", "seamlessly", "furthermore", "additionally",
  "utilize", "facilitate", "executive summary", "testament to",
  "I am passionate", "I am dedicated", "Thank you for considering",
  "Please do not hesitate",
];

/**
 * Apply all phrase replacements to a proposal text.
 * Returns the cleaned text.
 */
export function applyPhraseFilter(text: string): string {
  let result = text;
  for (const rule of PHRASE_REPLACEMENTS) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  // Clean up double spaces from empty replacements
  result = result.replace(/  +/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return result;
}

/**
 * Count how many blacklisted phrases appear in a text.
 * Used by the validator and Copilot.
 */
export function countForbiddenPhrases(text: string): { count: number; found: string[] } {
  const lower = text.toLowerCase();
  const found = FORBIDDEN_PHRASE_BLACKLIST.filter((p) => lower.includes(p.toLowerCase()));
  return { count: found.length, found };
}
