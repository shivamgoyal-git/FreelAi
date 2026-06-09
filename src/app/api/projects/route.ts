import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

// ── GET /api/projects — list with search/filter/sort ──────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const q       = searchParams.get("q")      || "";
  const status  = searchParams.get("status") || "";
  const priority= searchParams.get("priority")|| "";
  const category= searchParams.get("category")|| "";
  const page    = parseInt(searchParams.get("page")  || "1",  10);
  const limit   = parseInt(searchParams.get("limit") || "50", 10);
  const skip    = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId: session.user.id };
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (q) {
    filter.$or = [
      { title:      { $regex: q, $options: "i" } },
      { clientName: { $regex: q, $options: "i" } },
      { description:{ $regex: q, $options: "i" } },
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);

  return NextResponse.json({ projects, total, page, limit });
}

// ── POST /api/projects — create ───────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  try {
    const body = await req.json();
    const project = await Project.create({ ...body, userId: session.user.id });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
