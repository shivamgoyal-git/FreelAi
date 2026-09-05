import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendNotification, recordActivity } from "@/lib/portal-notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const invitation = await prisma.clientInvitation.findUnique({
      where: { token },
      include: { client: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token." },
        { status: 400 }
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted. Please log in." },
        { status: 400 }
      );
    }

    if (invitation.status === "revoked") {
      return NextResponse.json(
        { error: "This invitation has been revoked by the freelancer." },
        { status: 400 }
      );
    }

    if (invitation.status === "expired" || new Date(invitation.expiresAt) < new Date()) {
      if (invitation.status !== "expired") {
        await prisma.clientInvitation.update({
          where: { id: invitation.id },
          data: { status: "expired" },
        });
      }
      return NextResponse.json(
        { error: "This invitation has expired. Please request a new invitation." },
        { status: 400 }
      );
    }

    const client = invitation.client;
    if (!client) {
      return NextResponse.json(
        { error: "Associated client not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userEmail = invitation.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "client",
          clientId: client.id,
          password: hashedPassword,
          ...(name ? { name: name.trim() } : {}),
          onboardingCompleted: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name?.trim() || client.name,
          email: userEmail,
          password: hashedPassword,
          role: "client",
          clientId: client.id,
          onboardingCompleted: true,
        },
      });
    }

    // Mark invitation as accepted
    await prisma.clientInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
      },
    });

    // Notify Freelancer
    await sendNotification({
      recipientId: invitation.freelancerId,
      recipientRole: "freelancer",
      title: "Client Joined Portal",
      message: `${user.name} accepted your invitation and activated their Client Portal account.`,
      type: "client_joined",
      link: `/dashboard/clients/${client.id}`,
    });

    // Record Activity
    await recordActivity({
      userId: invitation.freelancerId,
      type: "client_joined",
      title: "Client Joined Portal",
      description: `${user.name} (${user.email}) activated their Client Portal account.`,
      clientId: client.id,
      actorRole: "client",
    });

    return NextResponse.json({
      success: true,
      message: "Account activated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/portal/invite/accept] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate account" },
      { status: 500 }
    );
  }
}
