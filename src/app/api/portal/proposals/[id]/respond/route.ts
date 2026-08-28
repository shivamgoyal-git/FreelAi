import { NextRequest, NextResponse } from "next/server";
import { getClientSession, requireClientProposal } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, feedback, previewClientId } = body;

    if (!action || !["accept", "request_changes", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept', 'request_changes', or 'decline'" },
        { status: 400 }
      );
    }

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, client } = authCtx;
    await connectDB();

    // Verify ownership
    const proposal = await requireClientProposal(client.email, clientId, id);

    if (action === "accept") {
      proposal.status = "won";
      await proposal.save();

      // Notify Freelancer
      await sendNotification({
        recipientId: proposal.userId,
        recipientRole: "freelancer",
        title: "Proposal Accepted!",
        message: `${client.name} accepted your proposal "${proposal.title}".`,
        type: "proposal_accepted",
        link: `/dashboard/proposals/${proposal._id}`,
      });

      // Record Activity
      await recordActivity({
        userId: proposal.userId,
        type: "proposal_accepted",
        title: "Proposal Accepted",
        description: `${client.name} accepted proposal "${proposal.title}".`,
        clientId: client._id,
        actorRole: "client",
      });

      return NextResponse.json({
        success: true,
        message: "Proposal accepted successfully",
        proposal,
      });
    }

    if (action === "request_changes") {
      // Notify Freelancer
      await sendNotification({
        recipientId: proposal.userId,
        recipientRole: "freelancer",
        title: "Proposal Feedback Received",
        message: `${client.name} requested changes on proposal "${proposal.title}": "${feedback || "Please adjust terms."}"`,
        type: "general",
        link: `/dashboard/proposals/${proposal._id}`,
      });

      return NextResponse.json({
        success: true,
        message: "Feedback sent to freelancer",
        proposal,
      });
    }

    if (action === "decline") {
      proposal.status = "lost";
      await proposal.save();

      // Notify Freelancer
      await sendNotification({
        recipientId: proposal.userId,
        recipientRole: "freelancer",
        title: "Proposal Declined",
        message: `${client.name} declined proposal "${proposal.title}".`,
        type: "general",
        link: `/dashboard/proposals/${proposal._id}`,
      });

      return NextResponse.json({
        success: true,
        message: "Proposal declined",
        proposal,
      });
    }
  } catch (error: any) {
    console.error("[PATCH /api/portal/proposals/[id]/respond] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to proposal" },
      { status: error.status || 500 }
    );
  }
}
