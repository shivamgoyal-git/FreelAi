import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import Project from "@/models/Project";
import FreelancerProfile from "@/models/FreelancerProfile";
import ClientInvitation from "@/models/ClientInvitation";
import mongoose from "mongoose";
import crypto from "crypto";
import { recordActivity } from "@/lib/portal-notifications";
import {
  sendClientInvitationEmail,
  ProjectSummary,
  ProjectMilestoneSummary,
} from "@/lib/email";

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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedProjectId = body?.projectId;

    await connectDB();

    // 1. Validate Client ownership
    const client = await Client.findOne({ _id: id, userId: session.user.id });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Validate Client email from existing database record
    const rawEmail = client.email ? client.email.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return NextResponse.json(
        {
          error:
            "Please add a valid client email address before sending the invitation.",
        },
        { status: 400 }
      );
    }
    const normalizedEmail = rawEmail.toLowerCase();

    // 3. Fetch Freelancer details & business profile
    const freelancerProfile = await FreelancerProfile.findOne({
      userId: session.user.id,
    }).lean();

    const freelancerName =
      (freelancerProfile as any)?.personalInfo?.fullName ||
      session.user.name ||
      "Your Freelancer";
    const freelancerCompany = (freelancerProfile as any)?.businessInfo?.companyName || "";
    const freelancerEmail = session.user.email || "";

    // 4. Fetch Associated Project(s) and Milestones
    let targetProjectSummary: ProjectSummary | undefined = undefined;
    let multiProjectSummaries: ProjectSummary[] | undefined = undefined;

    if (requestedProjectId && mongoose.Types.ObjectId.isValid(requestedProjectId)) {
      const singleProj = await Project.findOne({
        _id: requestedProjectId,
        userId: session.user.id,
      }).lean();

      if (singleProj) {
        const milestones: ProjectMilestoneSummary[] = (
          (singleProj as any).milestones || []
        ).map((m: any) => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate,
          completed: !!m.completed,
        }));

        targetProjectSummary = {
          id: String((singleProj as any)._id),
          title: (singleProj as any).title,
          description: (singleProj as any).description,
          status: (singleProj as any).status,
          priority: (singleProj as any).priority,
          budget: (singleProj as any).budget,
          currency: (singleProj as any).currency || "USD",
          progress: (singleProj as any).progress,
          startDate: (singleProj as any).startDate,
          dueDate: (singleProj as any).dueDate,
          milestones,
        };
      }
    }

    if (!targetProjectSummary) {
      // Query projects belonging to this client
      const clientProjects = await Project.find({
        userId: session.user.id,
        $or: [
          { clientId: client._id.toString() },
          { clientName: client.name },
        ],
      })
        .sort({ updatedAt: -1 })
        .lean();

      if (clientProjects.length === 1) {
        const p = clientProjects[0] as any;
        const milestones: ProjectMilestoneSummary[] = (p.milestones || []).map(
          (m: any) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate,
            completed: !!m.completed,
          })
        );

        targetProjectSummary = {
          id: String(p._id),
          title: p.title,
          description: p.description,
          status: p.status,
          priority: p.priority,
          budget: p.budget,
          currency: p.currency || "USD",
          progress: p.progress,
          startDate: p.startDate,
          dueDate: p.dueDate,
          milestones,
        };
      } else if (clientProjects.length > 1) {
        multiProjectSummaries = clientProjects.map((p: any) => ({
          id: String(p._id),
          title: p.title,
          description: p.description,
          status: p.status,
          priority: p.priority,
          budget: p.budget,
          currency: p.currency || "USD",
          progress: p.progress,
          startDate: p.startDate,
          dueDate: p.dueDate,
        }));
      }
    }

    // 5. Invalidate / revoke any previous pending invitations for this client
    await ClientInvitation.updateMany(
      { clientId: client._id, status: "pending" },
      { $set: { status: "revoked" } }
    );

    // 6. Generate secure random token and 7-day expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await ClientInvitation.create({
      freelancerId: session.user.id,
      clientId: client._id,
      email: normalizedEmail,
      token,
      status: "pending",
      expiresAt,
    });

    const origin =
      req.nextUrl.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${origin}/portal/invite/${token}`;

    // 7. Send Real Project-Aware Invitation Email
    const emailResult = await sendClientInvitationEmail({
      freelancerName,
      freelancerEmail,
      freelancerCompany,
      clientName: client.name,
      clientEmail: normalizedEmail,
      clientCompany: client.company,
      invitationUrl: inviteUrl,
      expiresAt,
      project: targetProjectSummary,
      projects: multiProjectSummaries,
    });

    if (!emailResult.success) {
      console.error(
        `[POST /api/clients/[id]/invite] Failed to deliver email to ${normalizedEmail}:`,
        emailResult.error
      );
      // Invitation record exists in pending state and can be retried / resent by freelancer
      return NextResponse.json(
        {
          error: "Invitation could not be sent. Please try again.",
          details: emailResult.error,
          canRetry: true,
        },
        { status: 500 }
      );
    }

    // 8. Record Activity
    await recordActivity({
      userId: session.user.id,
      type: "client_invited",
      title: "Client Portal Invitation Sent",
      description: `Sent Client Portal invitation to ${client.name} (${normalizedEmail}) via email.`,
      clientId: client._id,
      actorRole: "freelancer",
    });

    return NextResponse.json({
      success: true,
      status: "invitation_pending",
      emailSent: true,
      recipient: normalizedEmail,
      deliveryMode: emailResult.mode,
      invitation: {
        token: invitation.token,
        inviteUrl,
        recipient: normalizedEmail,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
      inviteUrl,
      expiresAt,
    });
  } catch (error: any) {
    console.error("[POST /api/clients/[id]/invite] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate invitation" },
      { status: 500 }
    );
  }
}
