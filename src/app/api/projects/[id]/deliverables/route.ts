import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const deliverables = await prisma.deliverable.findMany({
      where: { projectId: id },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      deliverables: deliverables.map((d) => ({
        ...d,
        _id: d.id,
        versions: d.versions.map((v) => ({ ...v, _id: v.id })),
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/projects/[id]/deliverables] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deliverables" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      version = "v1",
      description = "",
      milestoneId = "",
      fileUrl = "",
      fileName = "",
      fileSize = "",
      fileType = "",
      externalUrl = "",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Deliverable title is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    if (!project.clientId) {
      return NextResponse.json(
        { error: "Project must be assigned to a client before uploading deliverables" },
        { status: 400 }
      );
    }

    const ws = await prisma.workspace.findFirst({ where: { ownerId: session.user.id } });

    const deliverable = await prisma.deliverable.create({
      data: {
        projectId: project.id,
        clientId: project.clientId,
        userId: session.user.id,
        workspaceId: ws?.id,
        title: title.trim(),
        version: version.trim() || "v1",
        description: description.trim(),
        milestoneId: milestoneId || null,
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim(),
        fileSize: fileSize.trim() || "1.2 MB",
        fileType: fileType.trim() || "figma",
        externalUrl: externalUrl.trim(),
        status: "pending_review",
        uploadedBy: "freelancer",
        versions: {
          create: {
            id: `v-${Date.now()}`,
            versionNumber: version.trim() || "v1",
            fileUrl: fileUrl.trim(),
            fileName: fileName.trim(),
            fileSize: fileSize.trim() || "1.2 MB",
            fileType: fileType.trim() || "figma",
            externalUrl: externalUrl.trim(),
            uploadedBy: "freelancer",
            status: "pending_review",
          },
        },
      },
      include: {
        versions: true,
      },
    });

    // Notify Client
    await sendNotification({
      recipientId: project.clientId,
      recipientRole: "client",
      title: "New Deliverable Ready for Review",
      message: `Your freelancer uploaded "${title}" (${version}) for "${project.title}". Please review and approve.`,
      type: "deliverable_uploaded",
      link: `/portal/projects/${project.id}?tab=deliverables`,
      projectId: project.id,
    });

    // Record Activity
    await recordActivity({
      userId: session.user.id,
      type: "deliverable_uploaded",
      title: "Deliverable Uploaded",
      description: `Uploaded deliverable "${title}" (${version}) for project "${project.title}".`,
      projectId: project.id,
      clientId: project.clientId,
      actorRole: "freelancer",
    });

    return NextResponse.json(
      {
        success: true,
        deliverable: {
          ...deliverable,
          _id: deliverable.id,
          versions: deliverable.versions.map((v) => ({ ...v, _id: v.id })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/deliverables] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload deliverable" },
      { status: 500 }
    );
  }
}
