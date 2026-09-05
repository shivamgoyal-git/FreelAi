import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    if (!id) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedProjectId = body?.projectId;

    // 1. Validate Client ownership
    const client = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Validate Client email
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
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: session.user.id },
    });

    const personal = (freelancerProfile?.personal as any) || {};
    const business = (freelancerProfile?.business as any) || {};

    const freelancerName =
      personal.fullName ||
      session.user.name ||
      "Your Freelancer";
    const freelancerCompany = business.companyName || "";
    const freelancerEmail = session.user.email || "";

    // 4. Fetch Associated Project(s) and Milestones
    let targetProjectSummary: ProjectSummary | undefined = undefined;
    let multiProjectSummaries: ProjectSummary[] | undefined = undefined;

    if (requestedProjectId) {
      const singleProj = await prisma.project.findFirst({
        where: { id: requestedProjectId, userId: session.user.id },
        include: { milestones: true },
      });

      if (singleProj) {
        const milestones: ProjectMilestoneSummary[] = singleProj.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate || undefined,
          completed: !!m.completed,
        }));

        targetProjectSummary = {
          id: singleProj.id,
          title: singleProj.title,
          description: singleProj.description || "",
          status: singleProj.status,
          priority: singleProj.priority,
          budget: singleProj.budget,
          currency: singleProj.currency || "USD",
          progress: singleProj.progress,
          startDate: singleProj.startDate || "",
          dueDate: singleProj.dueDate || "",
          milestones,
        };
      }
    }

    if (!targetProjectSummary) {
      const clientProjects = await prisma.project.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { clientId: client.id },
            { clientName: client.name },
          ],
        },
        include: { milestones: true },
        orderBy: { updatedAt: "desc" },
      });

      if (clientProjects.length === 1) {
        const p = clientProjects[0];
        const milestones: ProjectMilestoneSummary[] = p.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate || undefined,
          completed: !!m.completed,
        }));

        targetProjectSummary = {
          id: p.id,
          title: p.title,
          description: p.description || "",
          status: p.status,
          priority: p.priority,
          budget: p.budget,
          currency: p.currency || "USD",
          progress: p.progress,
          startDate: p.startDate || "",
          dueDate: p.dueDate || "",
          milestones,
        };
      } else if (clientProjects.length > 1) {
        multiProjectSummaries = clientProjects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          status: p.status,
          priority: p.priority,
          budget: p.budget,
          currency: p.currency || "USD",
          progress: p.progress,
          startDate: p.startDate || "",
          dueDate: p.dueDate || "",
        }));
      }
    }

    // 5. Invalidate / revoke previous pending invitations
    await prisma.clientInvitation.updateMany({
      where: { clientId: client.id, status: "pending" },
      data: { status: "revoked" },
    });

    // 6. Generate secure random token and 7-day expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.clientInvitation.create({
      data: {
        freelancerId: session.user.id,
        clientId: client.id,
        email: normalizedEmail,
        token,
        status: "pending",
        expiresAt,
      },
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
      clientCompany: client.company || "",
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
      clientId: client.id,
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
