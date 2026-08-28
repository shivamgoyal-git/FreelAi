import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClientInvitation from "@/models/ClientInvitation";
import Client from "@/models/Client";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectDB();

    const invitation = await ClientInvitation.findOne({ token });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation link" },
        { status: 404 }
      );
    }

    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been used. Please log in." },
        { status: 400 }
      );
    }

    if (invitation.status === "revoked") {
      return NextResponse.json(
        { error: "This invitation has been revoked by the freelancer." },
        { status: 400 }
      );
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired. Please request a new invitation." },
        { status: 400 }
      );
    }

    const client = await Client.findById(invitation.clientId);
    const freelancer = await User.findById(invitation.freelancerId);

    if (!client) {
      return NextResponse.json(
        { error: "Associated client record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      clientName: client.name,
      company: client.company || "",
      freelancerName: freelancer?.name || "Freelancer",
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
