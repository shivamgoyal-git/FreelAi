import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalsService } from "@/services/proposals.service";

// ── GET /api/proposals — list with search & filter ──────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const favoriteOnly = searchParams.get("favorite") === "true";
    const platform = searchParams.get("platform") || "";

    const where: any = { userId };
    
    if (status && status !== "all") {
      where.status = status;
    }
    
    if (platform && platform !== "all") {
      where.platform = platform;
    }

    if (favoriteOnly) {
      where.isFavorite = true;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { clientName: { contains: q, mode: "insensitive" } },
        { jobPost: { contains: q, mode: "insensitive" } },
      ];
    }

    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      proposals: proposals.map((p) => ({ ...p, _id: p.id })),
    });
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

  try {
    const body = await req.json();
    const {
      proposalId,
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
      const proposal = await prisma.proposal.findFirst({
        where: { id: proposalId, userId },
      });
      if (!proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      const existingVersions = Array.isArray(proposal.versions) ? (proposal.versions as any[]) : [];
      const nextVersionNumber = existingVersions.length + 1;
      const newVersions = [
        ...existingVersions,
        {
          versionNumber: nextVersionNumber,
          sections,
          pricingBreakdown,
          aiAnalysis,
          scoreBreakdown,
          detectedPainPoints,
          aiSuggestions,
          promptVersion,
          createdAt: new Date(),
        },
      ];

      const val = pricingBreakdown?.standard?.price || budget || proposal.value;

      const updated = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          versions: newVersions,
          activeVersionIndex: newVersions.length - 1,
          value: Number(val) || 0,
          budget: Number(budget) || proposal.budget,
          timeline: timeline || proposal.timeline,
          tone: tone || proposal.tone,
          portfolios: portfolios.length > 0 ? portfolios : proposal.portfolios,
        },
      });

      return NextResponse.json({
        success: true,
        proposal: { ...updated, _id: updated.id },
      });
    } else {
      if (!clientName || !jobPost || !sections || !pricingBreakdown) {
        return NextResponse.json(
          { error: "Client name, job post, sections, and pricing details are required" },
          { status: 400 }
        );
      }

      const title = `Proposal for ${clientName} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      
      const newProposal = await ProposalsService.createProposal(userId, {
        title,
        status: "draft",
        value: pricingBreakdown.standard?.price || budget || 0,
        currency: "USD",
        isFavorite: false,
        clientName,
        platform,
        jobPost,
        portfolios,
        budget: Number(budget) || 0,
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
