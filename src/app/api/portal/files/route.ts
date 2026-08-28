import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientProject } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import ProjectFile from "@/models/ProjectFile";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = authCtx;
    await connectDB();

    const filter: Record<string, unknown> = {
      clientId,
      isClientVisible: true,
    };

    if (projectId) filter.projectId = projectId;
    if (category && category !== "all") filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };

    const files = await ProjectFile.find(filter)
      .populate("projectId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("[GET /api/portal/files] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      name,
      url,
      size = "1 MB",
      fileType = "document",
      category = "asset",
      previewClientId,
    } = body;

    if (!projectId || !name || !url) {
      return NextResponse.json(
        { error: "projectId, name, and url are required" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client, role } = authCtx;
    await connectDB();

    // Verify project belongs to client
    const project = await requireClientProject(clientId, projectId);

    const file = await ProjectFile.create({
      projectId,
      clientId,
      userId: project.userId,
      name: name.trim(),
      url: url.trim(),
      size,
      fileType,
      category,
      uploadedBy: role === "freelancer" ? "freelancer" : "client",
      uploaderName: client.name,
      isClientVisible: true,
    });

    // If uploaded by client, notify freelancer
    if (role === "client") {
      await sendNotification({
        recipientId: project.userId,
        recipientRole: "freelancer",
        title: "New File Uploaded",
        message: `${client.name} uploaded "${name}" to ${project.title}.`,
        type: "general",
        link: `/dashboard/projects/${projectId}?tab=files`,
        projectId,
      });

      await recordActivity({
        userId: project.userId,
        type: "file_uploaded",
        title: "File Uploaded",
        description: `${client.name} uploaded file "${name}" to "${project.title}".`,
        projectId,
        clientId,
        actorRole: "client",
      });
    }

    return NextResponse.json({ success: true, file }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/portal/files] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: error.status || 500 }
    );
  }
}
