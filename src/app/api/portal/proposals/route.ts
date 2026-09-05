import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client } = authCtx;

    const where: any = {
      OR: [
        { clientId: client.id },
        ...(client.name ? [{ clientName: { contains: client.name, mode: "insensitive" } }] : []),
      ],
      status: { not: "draft" },
    };

    const proposals = await prisma.proposal.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      proposals: proposals.map((p) => ({ ...p, _id: p.id })),
    });
  } catch (error: any) {
    console.error("[GET /api/portal/proposals] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: error.status || 500 }
    );
  }
}
