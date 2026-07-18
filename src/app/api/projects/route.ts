import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { logActivity } from "@/lib/activity";

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

  const clientIds = [...new Set(projects.map((p) => p.clientId).filter(Boolean))] as string[];
  const clients = clientIds.length
    ? await Client.find({ userId: session.user.id, _id: { $in: clientIds } }).select("name company").lean()
    : [];
  const clientMap = new Map(clients.map((c) => [c._id.toString(), c]));

  const populatedProjects = projects.map((p) => {
    const client = p.clientId ? clientMap.get(p.clientId.toString()) : null;
    return {
      ...p,
      clientName: client ? client.name : p.clientName || "",
      clientCompany: client ? client.company || "" : "",
    };
  });

  return NextResponse.json({ projects: populatedProjects, total, page, limit });
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

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
