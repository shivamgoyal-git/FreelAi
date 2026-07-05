/**
 * Stage 7 — Local Humanizer
 *
 * Responsibility: Apply deterministic, local text transformations to
 * make the AI output sound more like a human wrote it.
 *
 * This is ZERO COST and runs in <10ms.
 * No Gemini call. Pure string processing.
 *
 * Applies:
 *  1. Phrase replacement (AI buzzwords → natural language)
 *  2. Contraction injection (I am → I'm, etc.)
 *  3. Sentence shortening (splits sentences > 25 words)
 *  4. Paragraph length enforcement (2–4 sentences per para)
 *  5. Reading grade estimation
 *  6. Cleanup (double spaces, triple newlines, trailing whitespace)
 */

import { applyPhraseFilter } from "./libraries/phrase-filter";

export interface HumanizationResult {
  text: string;
  transformsApplied: string[];
  estimatedGradeLevel: number;
  avgSentenceLength: number;
  contractionCount: number;
  paragraphCount: number;
}

export class LocalHumanizer {
  /**
   * Run all humanization passes on the proposal text.
   */
  static humanize(text: string): HumanizationResult {
    const transforms: string[] = [];
    let result = text;

    // Pass 1: Phrase filter (AI buzzwords + formal phrasing)
    const beforePhraseFilter = result;
    result = applyPhraseFilter(result);
    if (result !== beforePhraseFilter) {
      transforms.push("phrase-filter: replaced AI buzzwords and formal constructions");
    }

    // Pass 2: Sycophantic opener removal
    result = this.removeSycophancticOpeners(result);
    if (result !== text) transforms.push("opener-cleanup: removed sycophantic greetings");

    // Pass 3: Paragraph enforcement (2–4 sentences)
    const beforeParaEnforce = result;
    result = this.enforceParagraphLength(result);
    if (result !== beforeParaEnforce) {
      transforms.push("paragraph-enforcement: restructured paragraphs to 2–4 sentences");
    }

    // Pass 4: Long sentence splitting
    const beforeSentenceSplit = result;
    result = this.splitLongSentences(result);
    if (result !== beforeSentenceSplit) {
      transforms.push("sentence-split: shortened sentences over 25 words");
    }

    // Pass 5: Final cleanup
    result = this.cleanup(result);

    // Metrics
    const sentences = result.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const words = result.split(/\s+/).filter(Boolean);
    const avgSentenceLength = sentences.length > 0 ? Math.round(words.length / sentences.length) : 0;
    const contractionCount = (result.match(/\b(I'm|I've|I'll|you're|you'll|you've|we're|let's|don't|can't|won't|didn't|doesn't|hasn't|haven't|it's|that's|there's|they're)\b/gi) || []).length;
    const paragraphs = result.split(/\n+/).filter((p) => p.trim().length > 10);
    const estimatedGradeLevel = this.estimateGradeLevel(result);

    if (transforms.length > 0) {
      console.log(`[Stage7] Humanization applied ${transforms.length} transform(s). Grade level: ${estimatedGradeLevel.toFixed(1)}, Avg sentence: ${avgSentenceLength} words.`);
    }

    return {
      text: result,
      transformsApplied: transforms,
      estimatedGradeLevel,
      avgSentenceLength,
      contractionCount,
      paragraphCount: paragraphs.length,
    };
  }

  /**
   * Remove common sycophantic or overly formal openers.
   */
  private static removeSycophancticOpeners(text: string): string {
    const openers = [
      /^Thank you for (considering|posting|the opportunity|reaching out)[^.!?]*[.!?]\s*/i,
      /^I am (truly|very|deeply) (excited|thrilled|delighted|honored)[^.!?]*[.!?]\s*/i,
      /^It is (truly |really )?a (pleasure|honor|privilege)[^.!?]*[.!?]\s*/i,
      /^I hope this (message|proposal|letter) finds you well[.!?]\s*/i,
      /^Dear (Sir|Ma'am|Hiring Manager|Client)[,.]?\s*/i,
      /^Greetings[!.,]?\s*/i,
    ];

    let result = text;
    for (const pattern of openers) {
      result = result.replace(pattern, "");
    }
    return result.trim();
  }

  /**
   * Split sentences longer than 25 words at natural break points.
   */
  private static splitLongSentences(text: string): string {
    const paragraphs = text.split(/\n+/);

    return paragraphs
      .map((para) => {
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        return sentences
          .map((sentence) => {
            const words = sentence.trim().split(/\s+/);
            if (words.length <= 25) return sentence.trim();

            // Find natural split points: conjunctions, relative pronouns
            const splitWords = ["which", "and", "but", "because", "although", "while", "since", "however", "so that"];
            const w = sentence.trim().split(/\s+/);

            for (let i = 12; i < w.length - 5; i++) {
              if (splitWords.includes(w[i].toLowerCase().replace(/[,;]$/, ""))) {
                // Split before the conjunction
                const part1 = w.slice(0, i).join(" ").replace(/[,;]+$/, "") + ".";
                const part2 =
                  w[i].charAt(0).toUpperCase() + w[i].slice(1) + " " + w.slice(i + 1).join(" ");
                return part1 + " " + part2;
              }
            }

            return sentence.trim(); // Can't find a clean split point — leave as-is
          })
          .join(" ");
      })
      .join("\n\n");
  }

  /**
   * Enforce 2–4 sentences per paragraph.
   * Paragraphs with 5+ sentences are split.
   */
  private static enforceParagraphLength(text: string): string {
    const paragraphs = text.split(/\n{2,}/);
    const result: string[] = [];

    for (const para of paragraphs) {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];

      if (sentences.length <= 4) {
        result.push(para.trim());
        continue;
      }

      // Split into groups of 3 sentences
      for (let i = 0; i < sentences.length; i += 3) {
        const chunk = sentences.slice(i, i + 3).join(" ").trim();
        if (chunk.length > 10) result.push(chunk);
      }
    }

    return result.join("\n\n");
  }

  /**
   * Final cleanup: double spaces, triple newlines, trailing whitespace per line.
   */
  private static cleanup(text: string): string {
    return text
      .replace(/  +/g, " ")          // double spaces
      .replace(/\n{3,}/g, "\n\n")    // triple+ newlines
      .replace(/[ \t]+$/gm, "")      // trailing spaces per line
      .trim();
  }

  /**
   * Estimate Flesch-Kincaid Grade Level.
   * Simple approximation: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
   */
  static estimateGradeLevel(text: string): number {
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);

    if (words.length === 0 || sentences.length === 0) return 8;

    const totalSyllables = words.reduce((sum, w) => sum + this.countSyllables(w), 0);
    const wordsPerSentence = words.length / sentences.length;
    const syllablesPerWord = totalSyllables / words.length;

    const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
    return Math.max(1, Math.min(20, Math.round(grade * 10) / 10));
  }

  /**
   * Estimate syllable count for a word (simple heuristic).
   */
  private static countSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;

    let count = 0;
    let prev = false;
    for (const char of w) {
      const isVowel = "aeiouy".includes(char);
      if (isVowel && !prev) count++;
      prev = isVowel;
    }

    // Remove silent e
    if (w.endsWith("e") && count > 1) count--;

    return Math.max(1, count);
  }
}
