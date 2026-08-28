import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientProject } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Deliverable from "@/models/Deliverable";
import ProjectFile from "@/models/ProjectFile";
import Message from "@/models/Message";
import Invoice from "@/models/Invoice";
import Activity from "@/models/Activity";

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
    await connectDB();

    // IDOR Protection: Verifies project belongs to clientId or authorized preview
    const project = await requireClientProject(clientId, id, authCtx);

    // Parallel fetch related resources for this project
    const projectQueryId = mongoose.Types.ObjectId.isValid(id)
      ? { $in: [id, new mongoose.Types.ObjectId(id)] }
      : id;

    const [deliverables, files, messages, invoices, activities] =
      await Promise.all([
        Deliverable.find({ projectId: projectQueryId }).sort({ createdAt: -1 }).lean(),
        ProjectFile.find({ projectId: projectQueryId, isClientVisible: true })
          .sort({ createdAt: -1 })
          .lean(),
        Message.find({ projectId: projectQueryId }).sort({ createdAt: 1 }).lean(),
        Invoice.find({ projectId: projectQueryId }).sort({ createdAt: -1 }).lean(),
        Activity.find({ projectId: projectQueryId }).sort({ createdAt: -1 }).limit(20).lean(),
      ]);

    // Mark messages as read by client if user is client
    if (authCtx.role === "client") {
      await Message.updateMany(
        { projectId: id, senderRole: "freelancer", readByClient: false },
        { $set: { readByClient: true } }
      );
    }

    return NextResponse.json({
      project,
      client: {
        _id: client._id.toString(),
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
      deliverables,
      files,
      messages,
      invoices,
      activities,
    });
  } catch (error: any) {
    console.error("[GET /api/portal/projects/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project details" },
      { status: error.status || 500 }
    );
  }
}
