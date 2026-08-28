import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Proposal from "@/models/Proposal";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client } = authCtx;
    await connectDB();

    // Client can see proposals where clientEmail matches or client matches
    const proposals = await Proposal.find({
      $or: [
        { clientEmail: client.email.toLowerCase().trim() },
        { clientName: { $regex: new RegExp(client.name, "i") } },
      ],
      status: { $ne: "draft" }, // Clients only see sent, won, or lost proposals
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ proposals });
  } catch (error: any) {
    console.error("[GET /api/portal/proposals] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: error.status || 500 }
    );
  }
}
