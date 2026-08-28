import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import ClientInvitation from "@/models/ClientInvitation";
import crypto from "crypto";
import { recordActivity } from "@/lib/portal-notifications";

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
    await connectDB();

    const client = await Client.findOne({ _id: id, userId: session.user.id });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Revoke any previous pending invitations for this client
    await ClientInvitation.updateMany(
      { clientId: id, status: "pending" },
      { $set: { status: "revoked" } }
    );

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await ClientInvitation.create({
      freelancerId: session.user.id,
      clientId: client._id,
      email: client.email.toLowerCase().trim(),
      token,
      status: "pending",
      expiresAt,
    });

    const origin = req.nextUrl.origin;
    const inviteUrl = `${origin}/portal/invite/${token}`;

    await recordActivity({
      userId: session.user.id,
      type: "client_invited",
      title: "Client Portal Invitation Sent",
      description: `Generated Client Portal invitation for ${client.name} (${client.email}).`,
      clientId: client._id,
      actorRole: "freelancer",
    });

    return NextResponse.json({
      success: true,
      invitation,
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
