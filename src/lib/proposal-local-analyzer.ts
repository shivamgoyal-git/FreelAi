/**
 * ProposalLocalAnalyzer
 *
 * Computes deterministic, LLM-free metrics from proposal text and job post.
 * All outputs feed into ProposalIntelligenceEngine BEFORE any Gemini call.
 *
 * Key principle: if the answer can be computed with regex/math, don't spend
 * tokens asking Gemini. This keeps costs low and results reproducible.
 */

import crypto from "crypto";

export interface LocalAnalysisResult {
  contentHash: string;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  fleschReadabilityScore: number;     // 0–100, higher = easier
  readabilityLabel: "Very Easy" | "Easy" | "Medium" | "Difficult" | "Very Difficult";
  matchedKeywords: string[];
  missingKeywords: string[];
  overusedKeywords: string[];         // appear 3+ times in proposal vs job post
  painPoints: PainPointResult[];
  winChecklist: WinChecklistItem[];
  toneMatchScore: number;             // 0–100, bigram overlap heuristic
  lengthScore: number;                // 0–100 based on ideal word count range
  localSectionScores: LocalSectionScores;
}

export interface WinChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface PainPointResult {
  painPoint: string;
  covered: boolean;
  foundPhrase?: string;
}

export interface LocalSectionScores {
  pricingClarity: number;   // 0–100
  ctaStrength: number;      // 0–100
  portfolioPresence: number; // 0–100
  timelineMention: number;  // 0–100
  greeting: number;         // 0–100
  lengthScore: number;      // 0–100
}

// ─── WIN CHECKLIST CONSTANTS ──────────────────────────────────────────────────

const CTA_PHRASES = [
  "schedule", "let's connect", "let's hop on", "reply", "reach out",
  "book a call", "get in touch", "happy to discuss", "would love to",
  "feel free to message", "looking forward to hearing", "available for a call",
  "drop me", "send me a message",
];

const SOCIAL_PROOF_PHRASES = [
  "previously", "past project", "past client", "i've delivered", "i delivered",
  "i built", "i designed", "i developed", "worked with", "helped a", "similar project",
  "case study", "portfolio", "my work",
];

const FILLER_PHRASES = [
  "hope this finds you", "i am writing to", "to whom it may concern",
  "please find attached", "as per your requirement", "kindly", "hereby",
  "i humbly", "dear sir or madam", "i would like to apply",
];

const PRICING_INDICATORS = [
  /\$[\d,]+/,
  /\d+\s*(usd|eur|gbp)/i,
  /\bprice\b/, /\bpric(e|ing)\b/,
  /\bcost\b/, /\brate\b/, /\bbilling\b/,
  /\bbudget\b/, /\bpackage\b/, /\bquote\b/,
];

const TIMELINE_PATTERNS = [
  /\d+\s*(day|week|month|hour)s?\b/i,
  /\bdelivery\b/, /\bdeadline\b/, /\bmilestone/i,
  /\bturnaround\b/, /\bschedule\b/, /\btimeline\b/,
  /\bphase\s+\d+\b/i,
];

// ─── MAIN CLASS ───────────────────────────────────────────────────────────────

export class ProposalLocalAnalyzer {
  /**
   * Run full local analysis. Returns LocalAnalysisResult.
   */
  static analyze(proposalText: string, jobPost: string, clientName?: string): LocalAnalysisResult {
    const proposal = proposalText.trim();
    const job = jobPost.trim();

    const contentHash = this.computeHash(proposal, job);
    const wordCount = this.countWords(proposal);
    const sentenceCount = this.countSentences(proposal);
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const fleschScore = this.computeFlesch(proposal, wordCount, sentenceCount);
    const readabilityLabel = this.fleschLabel(fleschScore);

    const { matched, missing, overused } = this.analyzeKeywords(proposal, job);
    const painPoints = this.analyzePainPoints(proposal, job);
    const winChecklist = this.computeWinChecklist(proposal, job, clientName);
    const toneMatchScore = this.computeToneMatch(proposal, job);
    const lengthScore = this.computeLengthScore(wordCount);
    const localSectionScores = this.computeLocalSectionScores(proposal, job, clientName, wordCount);

    return {
      contentHash,
      wordCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      fleschReadabilityScore: Math.round(fleschScore),
      readabilityLabel,
      matchedKeywords: matched,
      missingKeywords: missing,
      overusedKeywords: overused,
      painPoints,
      winChecklist,
      toneMatchScore: Math.round(toneMatchScore),
      lengthScore: Math.round(lengthScore),
      localSectionScores,
    };
  }

  // ─── HASH ────────────────────────────────────────────────────────────────

  static computeHash(proposalText: string, jobPost: string): string {
    return crypto
      .createHash("sha256")
      .update(proposalText + "||" + jobPost)
      .digest("hex");
  }

  // ─── TEXT METRICS ─────────────────────────────────────────────────────────

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private static countSentences(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    return Math.max(1, sentences.length);
  }

  private static countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return Math.max(1, matches ? matches.length : 1);
  }

  private static computeFlesch(text: string, wordCount: number, sentenceCount: number): number {
    if (wordCount === 0) return 0;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const totalSyllables = words.reduce((sum, w) => sum + this.countSyllables(w), 0);
    const avgSyllablesPerWord = totalSyllables / wordCount;
    const avgWordsPerSentence = wordCount / sentenceCount;
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, score));
  }

  private static fleschLabel(score: number): LocalAnalysisResult["readabilityLabel"] {
    if (score >= 80) return "Very Easy";
    if (score >= 60) return "Easy";
    if (score >= 40) return "Medium";
    if (score >= 20) return "Difficult";
    return "Very Difficult";
  }

  // ─── KEYWORD ANALYSIS ─────────────────────────────────────────────────────

  private static extractKeywords(text: string): string[] {
    const STOP_WORDS = new Set([
      "a","an","the","and","or","but","in","on","at","to","for","of","with",
      "as","by","this","that","it","is","are","was","were","be","been","being",
      "have","has","had","do","does","did","will","would","could","should","may",
      "might","shall","can","i","we","you","he","she","they","my","your","our",
      "their","its","which","who","what","when","where","how","why","not","no",
      "from","up","about","into","through","during","before","after","above",
      "below","between","each","here","there","then","than","so","if","while",
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  }

  private static analyzeKeywords(proposalText: string, jobPost: string): {
    matched: string[];
    missing: string[];
    overused: string[];
  } {
    const jobKeywords = [...new Set(this.extractKeywords(jobPost))];
    const proposalWords = this.extractKeywords(proposalText);
    const proposalSet = new Set(proposalWords);

    // Count frequency in proposal
    const freqMap: Record<string, number> = {};
    for (const w of proposalWords) {
      freqMap[w] = (freqMap[w] || 0) + 1;
    }

    const matched: string[] = [];
    const missing: string[] = [];
    const overused: string[] = [];

    for (const kw of jobKeywords) {
      if (proposalSet.has(kw)) {
        matched.push(kw);
        // If it appears 4+ times in proposal but only once in job post — overused
        if ((freqMap[kw] || 0) >= 4) {
          overused.push(kw);
        }
      } else {
        missing.push(kw);
      }
    }

    // Return top-N to avoid massive arrays
    return {
      matched: matched.slice(0, 20),
      missing: missing.slice(0, 15),
      overused: overused.slice(0, 10),
    };
  }

  // ─── PAIN POINT COVERAGE ──────────────────────────────────────────────────

  private static analyzePainPoints(proposalText: string, jobPost: string): PainPointResult[] {
    // Extract sentences from job post as candidate pain points
    const jobSentences = jobPost
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && s.length < 200);

    // Pick up to 8 most representative sentences
    const candidates = jobSentences.slice(0, 8);
    const proposalLower = proposalText.toLowerCase();

    return candidates.map((painPoint) => {
      // Extract key phrases (3+ char words) from pain point sentence
      const phrases = this.extractKeywords(painPoint);
      // Covered if at least 50% of key phrases are found in proposal
      const coveredCount = phrases.filter((p) => proposalLower.includes(p)).length;
      const covered = phrases.length > 0 && coveredCount / phrases.length >= 0.5;
      const foundPhrase = covered ? phrases.find((p) => proposalLower.includes(p)) : undefined;

      return {
        painPoint: painPoint.length > 100 ? painPoint.slice(0, 100) + "…" : painPoint,
        covered,
        foundPhrase,
      };
    });
  }

  // ─── WIN CHECKLIST ────────────────────────────────────────────────────────

  private static computeWinChecklist(
    proposal: string,
    jobPost: string,
    clientName?: string
  ): WinChecklistItem[] {
    const p = proposal.toLowerCase();
    const opening = proposal.slice(0, 400).toLowerCase();

    // 1. Client name in opening
    const nameInOpening = clientName
      ? opening.includes(clientName.toLowerCase())
      : /dear|hi\s+\w+|hello\s+\w+/.test(opening);

    // 2. Portfolio / URL reference
    const hasPortfolio =
      /https?:\/\/\S+/.test(proposal) ||
      /\b(portfolio|behance|dribbble|github|case study)\b/i.test(proposal);

    // 3. CTA present
    const hasCta = CTA_PHRASES.some((phrase) => p.includes(phrase));

    // 4. Budget / pricing mentioned
    const hasPricing = PRICING_INDICATORS.some((rx) => rx.test(proposal));

    // 5. Timeline mentioned
    const hasTimeline = TIMELINE_PATTERNS.some((rx) => rx.test(proposal));

    // 6. Skill/technology from job post mentioned
    const jobKeywords = this.extractKeywords(jobPost).slice(0, 15);
    const skillMentioned = jobKeywords.some((kw) => p.includes(kw));

    // 7. Social proof
    const hasSocialProof = SOCIAL_PROOF_PHRASES.some((phrase) => p.includes(phrase));

    // 8. Question or next step
    const hasQuestion = /\?/.test(proposal) || /next step|following up|would love to/i.test(proposal);

    // 9. Word count in ideal range (200–800)
    const wc = this.countWords(proposal);
    const goodLength = wc >= 150 && wc <= 900;

    // 10. No filler phrases
    const noFiller = !FILLER_PHRASES.some((phrase) => p.includes(phrase));

    return [
      {
        id: "client-name",
        label: "Client name in opening",
        passed: nameInOpening,
        detail: nameInOpening
          ? "Client is addressed personally in the opening"
          : "Opening does not mention the client's name",
      },
      {
        id: "portfolio",
        label: "Portfolio or URL referenced",
        passed: hasPortfolio,
        detail: hasPortfolio
          ? "Proposal includes at least one portfolio link or reference"
          : "No portfolio link or project reference found",
      },
      {
        id: "cta",
        label: "Clear call to action",
        passed: hasCta,
        detail: hasCta
          ? "A clear CTA invites the client to respond"
          : "No strong CTA detected — proposal ends passively",
      },
      {
        id: "pricing",
        label: "Pricing or budget mentioned",
        passed: hasPricing,
        detail: hasPricing
          ? "Pricing or budget range is clearly referenced"
          : "No pricing language found — client is left guessing",
      },
      {
        id: "timeline",
        label: "Timeline or delivery stated",
        passed: hasTimeline,
        detail: hasTimeline
          ? "Timeline or delivery estimate is mentioned"
          : "No timeline or delivery estimate found",
      },
      {
        id: "skills",
        label: "Relevant skills from job post",
        passed: skillMentioned,
        detail: skillMentioned
          ? "Proposal references at least one technology or skill from the job post"
          : "None of the job post's key skills appear in the proposal",
      },
      {
        id: "social-proof",
        label: "Social proof or past work",
        passed: hasSocialProof,
        detail: hasSocialProof
          ? "Past work or client outcomes are referenced to build credibility"
          : "No mention of past projects or client success stories",
      },
      {
        id: "next-steps",
        label: "Next steps or question proposed",
        passed: hasQuestion,
        detail: hasQuestion
          ? "Proposal either asks a question or proposes clear next steps"
          : "No question or next steps — proposal is too one-directional",
      },
      {
        id: "length",
        label: `Appropriate length (150–900 words, got ${wc})`,
        passed: goodLength,
        detail: goodLength
          ? `${wc} words — within the ideal range`
          : wc < 150
          ? `Only ${wc} words — proposal is too brief to build confidence`
          : `${wc} words — proposal may be too long and risk losing the client's attention`,
      },
      {
        id: "no-filler",
        label: "No filler or clichéd phrases",
        passed: noFiller,
        detail: noFiller
          ? "No generic filler phrases detected"
          : "Clichéd opener detected (e.g. 'hope this finds you') — hurts authenticity",
      },
    ];
  }

  // ─── TONE MATCH ───────────────────────────────────────────────────────────

  private static computeToneMatch(proposalText: string, jobPost: string): number {
    // Bigram overlap between job post and proposal as a proxy for tone similarity
    const bigrams = (text: string): Set<string> => {
      const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
      const bg = new Set<string>();
      for (let i = 0; i < words.length - 1; i++) {
        bg.add(`${words[i]} ${words[i + 1]}`);
      }
      return bg;
    };

    const jobBigrams = bigrams(jobPost);
    const proposalBigrams = bigrams(proposalText);

    let overlap = 0;
    for (const bg of jobBigrams) {
      if (proposalBigrams.has(bg)) overlap++;
    }

    // Jaccard-like: overlap / union; scale to 0–100, cap at 95
    const union = jobBigrams.size + proposalBigrams.size - overlap;
    if (union === 0) return 50;
    const jaccard = overlap / union;
    // Boost: scale up since perfect job-post mirror isn't the goal
    return Math.min(95, Math.round(jaccard * 1000));
  }

  // ─── LENGTH SCORE ─────────────────────────────────────────────────────────

  private static computeLengthScore(wordCount: number): number {
    // Ideal range: 200–600 words; penalise outside that range
    if (wordCount < 50) return 20;
    if (wordCount < 150) return 40;
    if (wordCount < 200) return 60;
    if (wordCount <= 600) return 95;
    if (wordCount <= 800) return 80;
    if (wordCount <= 1000) return 65;
    return 45; // > 1000 words — too long
  }

  // ─── LOCAL SECTION SCORES ─────────────────────────────────────────────────

  private static computeLocalSectionScores(
    proposal: string,
    jobPost: string,
    clientName?: string,
    wordCount?: number
  ): LocalSectionScores {
    const p = proposal.toLowerCase();
    const wc = wordCount ?? this.countWords(proposal);

    // Pricing clarity (0–100)
    const pricingHits = PRICING_INDICATORS.filter((rx) => rx.test(proposal)).length;
    const pricingClarity = Math.min(100, pricingHits * 25);

    // CTA strength (0–100)
    const ctaHits = CTA_PHRASES.filter((phrase) => p.includes(phrase)).length;
    const ctaStrength = Math.min(100, 40 + ctaHits * 20);

    // Portfolio presence (0–100)
    const urlCount = (proposal.match(/https?:\/\/\S+/g) || []).length;
    const hasPortfolioWord = /\b(portfolio|behance|dribbble|github|work sample)\b/i.test(proposal);
    const portfolioPresence = Math.min(100, urlCount * 40 + (hasPortfolioWord ? 30 : 0));

    // Timeline mention (0–100)
    const timelineHits = TIMELINE_PATTERNS.filter((rx) => rx.test(proposal)).length;
    const timelineMention = Math.min(100, timelineHits * 30);

    // Greeting / personalization (0–100)
    const opening = proposal.slice(0, 400).toLowerCase();
    const hasName = clientName ? opening.includes(clientName.toLowerCase()) : false;
    const hasGreeting = /^(hi|hello|dear|hey)\b/i.test(proposal.trim());
    const greeting = (hasName ? 60 : 0) + (hasGreeting ? 40 : 0);

    return {
      pricingClarity,
      ctaStrength,
      portfolioPresence: Math.min(100, portfolioPresence),
      timelineMention,
      greeting: Math.min(100, greeting),
      lengthScore: this.computeLengthScore(wc),
    };
  }
}
