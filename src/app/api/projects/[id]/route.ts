import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/projects/[id] ────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: { select: { name: true, company: true } },
      milestones: true,
    },
  });

  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const populatedProject = {
    ...project,
    _id: project.id,
    clientName: project.client?.name || project.clientName || "",
    clientCompany: project.client?.company || "",
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate,
      completed: m.completed,
    })),
  };

  return NextResponse.json({ project: populatedProject });
}

// ── PATCH /api/projects/[id] — update ────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  try {
    const body = await req.json();
    delete body.userId;
    delete body._id;
    delete body.id;

    const existingProject = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existingProject)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const originalPaid = existingProject.paid;
    const originalStatus = existingProject.status;

    if (Array.isArray(body.milestones)) {
      await prisma.milestone.deleteMany({ where: { projectId: id } });
      for (let i = 0; i < body.milestones.length; i++) {
        const m = body.milestones[i];
        await prisma.milestone.create({
          data: {
            id: m.id || `m-${id}-${i}-${Date.now()}`,
            projectId: id,
            title: m.title || "Milestone",
            dueDate: m.dueDate || "",
            completed: !!m.completed,
          },
        });
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.clientId !== undefined && { clientId: body.clientId }),
        ...(body.clientName !== undefined && { clientName: body.clientName }),
        ...(body.category && { category: body.category }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.budget !== undefined && { budget: Number(body.budget) }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.paid !== undefined && { paid: Number(body.paid) }),
        ...(body.progress !== undefined && { progress: Number(body.progress) }),
        ...(body.startDate !== undefined && { startDate: body.startDate }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
        ...(body.tags && { tags: body.tags }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        client: { select: { name: true, company: true } },
        milestones: true,
      },
    });

    // Activity Logger integrations:
    if (body.paid !== undefined && body.paid > originalPaid) {
      const difference = body.paid - originalPaid;
      await logActivity(
        session.user.id,
        "invoice_paid",
        "Invoice paid",
        `Received payment of $${difference.toLocaleString()} for "${updated.title}" (Total paid: $${updated.paid.toLocaleString()}).`
      );
    }

    if (body.status === "completed" && originalStatus !== "completed") {
      const remaining = updated.budget - updated.paid;
      await logActivity(
        session.user.id,
        "invoice_paid",
        "Project completed",
        `"${updated.title}" has been completed! Final budget of $${updated.budget.toLocaleString()} cleared (Outstanding balance: $${remaining.toLocaleString()}).`
      );
    }

    const populatedProject = {
      ...updated,
      _id: updated.id,
      clientName: updated.client?.name || updated.clientName || "",
      clientCompany: updated.client?.company || "",
      milestones: updated.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    };

    return NextResponse.json({ project: populatedProject });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update project";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ── DELETE /api/projects/[id] ─────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  const deleted = await prisma.project.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (deleted.count === 0)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
