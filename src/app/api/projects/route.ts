import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// ── GET /api/projects — list with search/filter/sort ──────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q       = searchParams.get("q")      || "";
  const status  = searchParams.get("status") || "";
  const priority= searchParams.get("priority")|| "";
  const category= searchParams.get("category")|| "";
  const page    = parseInt(searchParams.get("page")  || "1",  10);
  const limit   = parseInt(searchParams.get("limit") || "50", 10);
  const skip    = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status && status !== "all")   where.status   = status;
  if (priority && priority !== "all") where.priority = priority;
  if (category && category !== "all") where.category = category;
  if (q) {
    where.OR = [
      { title:      { contains: q, mode: "insensitive" } },
      { clientName: { contains: q, mode: "insensitive" } },
      { description:{ contains: q, mode: "insensitive" } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, company: true } },
        milestones: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  const populatedProjects = projects.map((p) => ({
    ...p,
    _id: p.id,
    clientName: p.client?.name || p.clientName || "",
    clientCompany: p.client?.company || "",
    milestones: p.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate,
      completed: m.completed,
    })),
  }));

  return NextResponse.json({ projects: populatedProjects, total, page, limit });
}

// ── POST /api/projects — create ───────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const ws = await prisma.workspace.findFirst({ where: { ownerId: session.user.id } });

    let clientName = body.clientName || "";
    if (body.clientId && !clientName) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      if (client) clientName = client.name;
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        workspaceId: ws?.id,
        title: body.title,
        description: body.description || "",
        clientId: body.clientId || null,
        clientName,
        category: body.category || "design",
        status: body.status || "draft",
        priority: body.priority || "medium",
        budget: Number(body.budget) || 0,
        currency: body.currency || "USD",
        paid: Number(body.paid) || 0,
        progress: Number(body.progress) || 0,
        startDate: body.startDate || "",
        dueDate: body.dueDate || "",
        tags: Array.isArray(body.tags) ? body.tags : [],
        notes: body.notes || "",
        milestones: {
          create: (body.milestones || []).map((m: any, idx: number) => ({
            id: m.id || `m-${Date.now()}-${idx}`,
            title: m.title,
            dueDate: m.dueDate || "",
            completed: !!m.completed,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });
    
    // Log Proposal Generated activity
    await logActivity(
      session.user.id,
      "proposal_generated",
      "Proposal generated",
      `AI-powered proposal generated for "${project.title}" (Budget: $${project.budget.toLocaleString()}).`
    );

    // If initial payment was logged, log Invoice Paid activity
    if (project.paid > 0) {
      await logActivity(
        session.user.id,
        "invoice_paid",
        "Invoice paid",
        `Received payment of $${project.paid.toLocaleString()} for "${project.title}".`
      );
    }

    return NextResponse.json(
      {
        project: {
          ...project,
          _id: project.id,
          milestones: project.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate,
            completed: m.completed,
          })),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
