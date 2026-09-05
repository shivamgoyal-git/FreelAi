import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/clients/[id] — single client ─────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: { ...client, _id: client.id } });
  } catch (err: unknown) {
    console.error("[GET /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to load client";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH /api/clients/[id] — update ──────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await req.json();
    delete body.userId;
    delete body._id;
    delete body.id;

    const updated = await prisma.client.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email.toLowerCase().trim() }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.status && { status: body.status }),
        ...(body.tags && { tags: body.tags }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.totalProjects !== undefined && { totalProjects: Number(body.totalProjects) }),
        ...(body.totalEarned !== undefined && { totalEarned: Number(body.totalEarned) }),
        ...(body.rating !== undefined && { rating: body.rating }),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = await prisma.client.findUnique({ where: { id } });

    return NextResponse.json({ client: { ...client, _id: client?.id } });
  } catch (err: unknown) {
    console.error("[PATCH /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to update client";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ── DELETE /api/clients/[id] — delete ─────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const deleted = await prisma.client.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete client";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
