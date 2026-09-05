import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientProject } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client, freelancerUser } = authCtx;

    // IDOR Protection: Verifies project belongs to clientId or authorized preview
    const project = await requireClientProject(clientId, id, authCtx);

    const [deliverables, files, messages, invoices, activities] = await Promise.all([
      prisma.deliverable.findMany({
        where: { projectId: id },
        include: { versions: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.projectFile.findMany({
        where: { projectId: id, isClientVisible: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.invoice.findMany({
        where: { projectId: id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activity.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Mark messages as read by client if user is client
    if (authCtx.role === "client") {
      await prisma.message.updateMany({
        where: { projectId: id, senderRole: "freelancer", readByClient: false },
        data: { readByClient: true },
      });
    }

    return NextResponse.json({
      project: {
        ...project,
        _id: project.id,
        milestones: project.milestones?.map((m: any) => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          completed: m.completed,
        })),
      },
      client: {
        _id: client.id,
        name: client.name,
        email: client.email,
        company: client.company || "",
        avatar: client.avatar || "",
      },
      freelancer: {
        name: freelancerUser?.name || "Freelancer",
        email: freelancerUser?.email || "",
        avatar: freelancerUser?.image || "",
      },
      deliverables: deliverables.map((d) => ({
        ...d,
        _id: d.id,
        versions: d.versions.map((v) => ({ ...v, _id: v.id })),
      })),
      files: files.map((f) => ({ ...f, _id: f.id })),
      messages: messages.map((m) => ({
        ...m,
        _id: m.id,
        attachments: Array.isArray(m.attachments) ? m.attachments : [],
      })),
      invoices: invoices.map((inv) => ({ ...inv, _id: inv.id })),
      activities: activities.map((a) => ({ ...a, _id: a.id })),
    });
  } catch (error: any) {
    console.error("[GET /api/portal/projects/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project details" },
      { status: error.status || 500 }
    );
  }
}
