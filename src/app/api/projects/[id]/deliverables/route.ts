import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Deliverable from "@/models/Deliverable";
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
    await connectDB();

    const project = await Project.findOne({ _id: id, userId: session.user.id });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const deliverables = await Deliverable.find({ projectId: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ deliverables });
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

    await connectDB();

    const project = await Project.findOne({ _id: id, userId: session.user.id });
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

    const deliverable = await Deliverable.create({
      projectId: project._id,
      clientId: project.clientId,
      userId: session.user.id,
      title: title.trim(),
      version: version.trim() || "v1",
      description: description.trim(),
      milestoneId: milestoneId || "",
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileSize: fileSize.trim() || "1.2 MB",
      fileType: fileType.trim() || "figma",
      externalUrl: externalUrl.trim(),
      status: "pending_review",
      uploadedBy: "freelancer",
    });

    // Notify Client
    await sendNotification({
      recipientId: project.clientId.toString(),
      recipientRole: "client",
      title: "New Deliverable Ready for Review",
      message: `Your freelancer uploaded "${title}" (${version}) for "${project.title}". Please review and approve.`,
      type: "deliverable_uploaded",
      link: `/portal/projects/${project._id}?tab=deliverables`,
      projectId: project._id,
    });

    // Record Activity
    await recordActivity({
      userId: session.user.id,
      type: "deliverable_uploaded",
      title: "Deliverable Uploaded",
      description: `Uploaded deliverable "${title}" (${version}) for project "${project.title}".`,
      projectId: project._id,
      clientId: project.clientId,
      actorRole: "freelancer",
    });

    return NextResponse.json({ success: true, deliverable }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects/[id]/deliverables] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload deliverable" },
      { status: 500 }
    );
  }
}
