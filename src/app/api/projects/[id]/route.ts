import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

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

  return NextResponse.json({ project });
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

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project });
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
