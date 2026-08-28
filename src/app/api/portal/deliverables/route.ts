import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Deliverable from "@/models/Deliverable";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = authCtx;
    await connectDB();

    const filter: Record<string, unknown> = { clientId };
    if (projectId) filter.projectId = projectId;
    if (status && status !== "all") filter.status = status;

    const deliverables = await Deliverable.find(filter)
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ deliverables });
  } catch (error: any) {
    console.error("[GET /api/portal/deliverables] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deliverables" },
      { status: error.status || 500 }
    );
  }
}
