import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

// ── GET /api/proposals — list with search & filter ──────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const favoriteOnly = searchParams.get("favorite") === "true";
    const platform = searchParams.get("platform") || "";

    const filter: Record<string, unknown> = { userId };
    
    if (status && status !== "all") {
      filter.status = status;
    }
    
    if (platform && platform !== "all") {
      filter.platform = platform;
    }

    if (favoriteOnly) {
      filter.isFavorite = true;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { clientName: { $regex: q, $options: "i" } },
        { jobPost: { $regex: q, $options: "i" } },
      ];
    }

    const proposals = await Proposal.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ proposals });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load proposals";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST /api/proposals — create or save new version ─────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    const body = await req.json();
    const {
      proposalId, // if provided, we append a version
      clientName,
      platform,
      jobPost,
      portfolios = [],
      budget,
      timeline,
      tone,
      templateId,
      sections,
      pricingBreakdown,
      aiAnalysis,
      scoreBreakdown,
      detectedPainPoints = [],
      aiSuggestions = [],
      promptVersion = "v2.0",
    } = body;

    if (proposalId) {
      // Append a new version to an existing proposal
      const proposal = await Proposal.findOne({ _id: proposalId, userId });
      if (!proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      const nextVersionNumber = proposal.versions.length + 1;
      proposal.versions.push({
        versionNumber: nextVersionNumber,
        sections,
        pricingBreakdown,
        aiAnalysis,
        scoreBreakdown,
        detectedPainPoints,
        aiSuggestions,
        promptVersion,
        createdAt: new Date(),
      });

      proposal.activeVersionIndex = proposal.versions.length - 1;
      proposal.value = pricingBreakdown.standard.price || budget || 0;
      proposal.budget = budget || proposal.budget;
      proposal.timeline = timeline || proposal.timeline;
      proposal.tone = tone || proposal.tone;
      proposal.portfolios = portfolios.length > 0 ? portfolios : proposal.portfolios;

      await proposal.save();
      return NextResponse.json({ success: true, proposal });
    } else {
      // Create a brand new proposal with Version 1
      if (!clientName || !jobPost || !sections || !pricingBreakdown) {
        return NextResponse.json(
          { error: "Client name, job post, sections, and pricing details are required" },
          { status: 400 }
        );
      }

      const title = `Proposal for ${clientName} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      
      const newProposal = await Proposal.create({
        userId,
        title,
        status: "draft",
        value: pricingBreakdown.standard.price || budget || 0,
        currency: "USD",
        isFavorite: false,
        clientName,
        platform,
        jobPost,
        portfolios,
        budget,
        timeline,
        tone,
        templateId: templateId || null,
        activeVersionIndex: 0,
        versions: [
          {
            versionNumber: 1,
            sections,
            pricingBreakdown,
            aiAnalysis,
            scoreBreakdown,
            detectedPainPoints,
            aiSuggestions,
            promptVersion,
            createdAt: new Date(),
          },
        ],
      });

      return NextResponse.json({ success: true, proposal: newProposal }, { status: 201 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save proposal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
