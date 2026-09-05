import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitation = await prisma.clientInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or nonexistent invitation link.", code: "not_found" },
        { status: 404 }
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted. Please log in.", code: "already_accepted" },
        { status: 400 }
      );
    }

    if (invitation.status === "revoked") {
      return NextResponse.json(
        { error: "This invitation has been revoked by the freelancer.", code: "revoked" },
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
        { error: "This invitation has expired. Please request a new invitation.", code: "expired" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: invitation.clientId },
    });
    const freelancer = await prisma.user.findUnique({
      where: { id: invitation.freelancerId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Associated client record not found", code: "client_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      clientName: client.name,
      company: client.company || "",
      freelancerName: freelancer?.name || "Your Freelancer",
      expiresAt: invitation.expiresAt,
    });
  } catch (error: any) {
    console.error("[GET /api/portal/invite/verify] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify invitation" },
      { status: 500 }
    );
  }
}
