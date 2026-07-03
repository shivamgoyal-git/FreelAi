import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

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
  await connectDB();

  try {
    const proposal = await Proposal.findOne({ _id: id, userId }).lean();
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ proposal });
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
  await connectDB();

  try {
    const body = await req.json();
    const proposal = await Proposal.findOne({ _id: id, userId });
    
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Editable general fields
    if (body.title !== undefined) proposal.title = body.title;
    if (body.status !== undefined) proposal.status = body.status;
    if (body.isFavorite !== undefined) proposal.isFavorite = body.isFavorite;
    if (body.activeVersionIndex !== undefined) {
      if (body.activeVersionIndex >= 0 && body.activeVersionIndex < proposal.versions.length) {
        proposal.activeVersionIndex = body.activeVersionIndex;
        // Keep compat root value updated
        proposal.value = proposal.versions[body.activeVersionIndex].pricingBreakdown.standard.price || proposal.value;
      }
    }

    await proposal.save();
    return NextResponse.json({ success: true, proposal });
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
  await connectDB();

  try {
    const result = await Proposal.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Proposal deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete proposal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
