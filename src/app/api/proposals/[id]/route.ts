import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── GET /api/proposals/[id] ──────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const proposal = await prisma.proposal.findFirst({
      where: { id, userId },
      include: { client: true },
    });
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({
      proposal: {
        ...proposal,
        _id: proposal.id,
        clientId: proposal.client ? { ...proposal.client, _id: proposal.client.id } : proposal.clientId,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve proposal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PUT /api/proposals/[id] — update metadata, status, favorites ─────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const body = await req.json();
    const proposal = await prisma.proposal.findFirst({ where: { id, userId } });
    
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const versions = Array.isArray(proposal.versions) ? (proposal.versions as any[]) : [];
    let newValue = proposal.value;

    if (body.activeVersionIndex !== undefined) {
      if (body.activeVersionIndex >= 0 && body.activeVersionIndex < versions.length) {
        newValue = versions[body.activeVersionIndex]?.pricingBreakdown?.standard?.price || proposal.value;
      }
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.activeVersionIndex !== undefined && { activeVersionIndex: body.activeVersionIndex, value: newValue }),
      },
    });

    return NextResponse.json({
      success: true,
      proposal: { ...updated, _id: updated.id },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update proposal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE /api/proposals/[id] ───────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const result = await prisma.proposal.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Proposal deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete proposal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
