import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientDeliverable } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, feedback, previewClientId } = body;

    if (!action || !["approve", "request_changes"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'request_changes'" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client } = authCtx;
    await connectDB();

    // Verify deliverable belongs to this client (IDOR protection)
    const deliverable = await requireClientDeliverable(clientId, id);
    const project = await Project.findById(deliverable.projectId);

    if (action === "approve") {
      deliverable.status = "approved";
      deliverable.approvedDate = new Date();
      await deliverable.save();

      // Notify Freelancer
      await sendNotification({
        recipientId: deliverable.userId,
        recipientRole: "freelancer",
        title: "Deliverable Approved",
        message: `${client.name} approved "${deliverable.title}" for ${project?.title || "project"}.`,
        type: "deliverable_approved",
        link: `/dashboard/projects/${deliverable.projectId}?tab=deliverables`,
        projectId: deliverable.projectId,
      });

      // Record Activity
      await recordActivity({
        userId: deliverable.userId,
        type: "deliverable_approved",
        title: "Deliverable Approved",
        description: `${client.name} approved deliverable "${deliverable.title}" (${deliverable.version}).`,
        projectId: deliverable.projectId,
        clientId: deliverable.clientId,
        actorRole: "client",
      });

      return NextResponse.json({
        success: true,
        message: "Deliverable approved successfully",
        deliverable,
      });
    }

    if (action === "request_changes") {
      if (!feedback || !feedback.trim()) {
        return NextResponse.json(
          { error: "Feedback is required when requesting changes" },
          { status: 400 }
        );
      }

      deliverable.status = "changes_requested";
      deliverable.clientFeedback = feedback.trim();
      deliverable.feedbackDate = new Date();
      await deliverable.save();

      // Notify Freelancer
      await sendNotification({
        recipientId: deliverable.userId,
        recipientRole: "freelancer",
        title: "Changes Requested",
        message: `${client.name} requested changes on "${deliverable.title}": "${feedback.trim()}"`,
        type: "changes_requested",
        link: `/dashboard/projects/${deliverable.projectId}?tab=deliverables`,
        projectId: deliverable.projectId,
      });

      // Record Activity
      await recordActivity({
        userId: deliverable.userId,
        type: "changes_requested",
        title: "Changes Requested on Deliverable",
        description: `${client.name} requested changes on "${deliverable.title}": "${feedback.trim()}"`,
        projectId: deliverable.projectId,
        clientId: deliverable.clientId,
        actorRole: "client",
      });

      return NextResponse.json({
        success: true,
        message: "Changes requested successfully",
        deliverable,
      });
    }
  } catch (error: any) {
    console.error("[PATCH /api/portal/deliverables/[id]/review] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review deliverable" },
      { status: error.status || 500 }
    );
  }
}
