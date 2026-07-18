import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/projects/[id] ────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const project = await Project.findOne({ _id: id, userId: session.user.id }).lean();
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  let clientName = project.clientName || "";
  let clientCompany = "";

  if (project.clientId) {
    const client = await Client.findOne({ _id: project.clientId, userId: session.user.id }).select("name company").lean();
    if (client) {
      clientName = client.name;
      clientCompany = client.company || "";
    }
  }

  const populatedProject = {
    ...project,
    clientName,
    clientCompany,
  };

  return NextResponse.json({ project: populatedProject });
}

// ── PATCH /api/projects/[id] — update ────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  try {
    const body = await req.json();
    delete body.userId;
    delete body._id;

    const existingProject = await Project.findOne({ _id: id, userId: session.user.id });
    if (!existingProject)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const originalPaid = existingProject.paid;
    const originalStatus = existingProject.status;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Activity Logger integrations:
    // 1. If paid amount increased, log invoice paid
    if (body.paid !== undefined && body.paid > originalPaid) {
      const difference = body.paid - originalPaid;
      await logActivity(
        session.user.id,
        "invoice_paid",
        "Invoice paid",
        `Received payment of $${difference.toLocaleString()} for "${project.title}" (Total paid: $${project.paid.toLocaleString()}).`
      );
    }

    // 2. If status changed to completed, log invoice paid (if there was remaining balance) or complete status
    if (body.status === "completed" && originalStatus !== "completed") {
      const remaining = project.budget - project.paid;
      await logActivity(
        session.user.id,
        "invoice_paid",
        "Project completed",
        `"${project.title}" has been completed! Final budget of $${project.budget.toLocaleString()} cleared (Outstanding balance: $${remaining.toLocaleString()}).`
      );
    }

    let clientName = project.clientName || "";
    let clientCompany = "";

    if (project.clientId) {
      const client = await Client.findOne({ _id: project.clientId, userId: session.user.id }).select("name company").lean();
      if (client) {
        clientName = client.name;
        clientCompany = client.company || "";
      }
    }

    const populatedProject = {
      ...project,
      clientName,
      clientCompany,
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

  await connectDB();
  const { id } = await params;

  const deleted = await Project.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!deleted)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
