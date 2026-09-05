import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// ── GET /api/clients  — list with optional search/filter ──────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({
    clients: clients.map((c) => ({ ...c, _id: c.id })),
    total,
    page,
    limit,
  });
}

// ── POST /api/clients — create ────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const ws = await prisma.workspace.findFirst({ where: { ownerId: session.user.id } });

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        workspaceId: ws?.id,
        name: body.name,
        email: body.email?.toLowerCase().trim() || "",
        phone: body.phone || "",
        company: body.company || "",
        website: body.website || "",
        location: body.location || "",
        avatar: body.avatar || null,
        status: body.status || "active",
        tags: Array.isArray(body.tags) ? body.tags : [],
        notes: body.notes || "",
        totalProjects: Number(body.totalProjects) || 0,
        totalEarned: Number(body.totalEarned) || 0,
        rating: typeof body.rating === "number" ? body.rating : null,
      },
    });

    // Log activity
    await logActivity(
      session.user.id,
      "client_added",
      "Client added",
      `${client.name} has been added as a client.`
    );

    return NextResponse.json(
      { client: { ...client, _id: client.id } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create client";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
