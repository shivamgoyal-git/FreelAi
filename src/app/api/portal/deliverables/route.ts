import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

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

    const where: any = { clientId };
    if (projectId) where.projectId = projectId;
    if (status && status !== "all") where.status = status;

    const deliverables = await prisma.deliverable.findMany({
      where,
      include: {
        project: { select: { title: true } },
        versions: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      deliverables: deliverables.map((d) => ({
        ...d,
        _id: d.id,
        projectId: d.project ? { title: d.project.title, _id: d.projectId } : d.projectId,
        versions: d.versions.map((v) => ({ ...v, _id: v.id })),
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/portal/deliverables] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deliverables" },
      { status: error.status || 500 }
    );
  }
}
