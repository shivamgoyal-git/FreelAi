import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { AiContextService } from "@/lib/ai-context-service";
import { ProposalIntelligenceEngine } from "@/lib/proposal-intelligence";
import { AiCore } from "@/lib/ai-core";

const VALID_FOCUS_AREAS = [
  "Introduction",
  "Body",
  "Portfolio Mention",
  "Pricing",
  "CTA",
  "Readability",
  "Personalization",
  "Grammar",
  "Tone",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { proposalText, jobPost, focus, feedback = "" } = await req.json();

    if (!proposalText?.trim() || !jobPost?.trim() || !focus) {
      return NextResponse.json(
        { error: "proposalText, jobPost, and focus are required" },
        { status: 400 }
      );
    }

    if (!VALID_FOCUS_AREAS.includes(focus)) {
      return NextResponse.json(
        { error: `Invalid focus area. Must be one of: ${VALID_FOCUS_AREAS.join(", ")}` },
        { status: 400 }
      );
    }

    const freelancerContext = await AiContextService.getAiSystemContext(session.user.id);
    const apiKey = process.env.GEMINI_API_KEY;

    let rewrittenText = "";
    let changes: string[] = [];
    let responseTimeMs = 0;
    let model = "gemini-1.5-flash";

    const prompt = `
You are an expert freelance editor.
We have this client job post:
"""
${jobPost}
"""

And this current proposal draft:
"""
${proposalText}
"""

Freelancer Context:
${freelancerContext}

Task: Improve the proposal draft by rewriting ONLY the aspects relevant to this focus: "${focus}".
${feedback ? `Specific feedback to address: "${feedback}".` : ""}
Preserve the core structure and most of the original wording. Only refine where necessary. Do NOT add headings or markdown sections.

Return a JSON object with this exact shape:
{
  "rewritten": "<full rewritten proposal text>",
  "changes": ["<brief description of change 1>", "<brief description of change 2>"]
}

Do NOT wrap the JSON in markdown code blocks. Do not write \`\`\`json. Return ONLY valid JSON.
`;

    if (apiKey) {
      const startTime = Date.now();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      responseTimeMs = Date.now() - startTime;
      if (!response.ok) {
        throw new Error(`Gemini API failed with status ${response.status}`);
      }

      const raw = await response.json();
      const rawText = raw?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = JSON.parse(rawText.trim());
      rewrittenText = parsed.rewritten;
      changes = parsed.changes || [];
    } else {
      // Mock fallback
      await new Promise((r) => setTimeout(r, 900));
      rewrittenText = proposalText + `\n\n[Section improved for ${focus}.]`;
      changes = [`Refined phrasing to optimize for ${focus}.`];
      responseTimeMs = 900;
      model = "gemini-1.5-flash (mock)";
    }

    // Compute diff using Myers-style diff from ProposalIntelligenceEngine
    const diff = ProposalIntelligenceEngine.computeDiff(proposalText, rewrittenText);

    // Build metadata
    const metadata = {
      model,
      responseTimeMs,
      estimatedInputTokens: Math.ceil(prompt.length / 4),
      estimatedOutputTokens: Math.ceil(rewrittenText.length / 4),
      estimatedCostUsd: 0,
      timestamp: new Date(),
      cacheHit: false,
    };

    return NextResponse.json({
      rewritten: rewrittenText,
      diff,
      changes,
      metadata,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Proposal improvement failed";
    console.error("[improve]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
