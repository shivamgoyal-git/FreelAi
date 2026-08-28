import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import ClientInvitation from "@/models/ClientInvitation";
import User from "@/models/User";

export async function GET(
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
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Check if client User account already exists
    const clientUser = await User.findOne({
      $or: [{ clientId: client._id }, { email: client.email.toLowerCase().trim() }],
      role: "client",
    });

    if (clientUser) {
      return NextResponse.json({
        status: "active",
        user: {
          id: clientUser._id.toString(),
          name: clientUser.name,
          email: clientUser.email,
        },
      });
    }

    // Check for pending invitation
    const activeInvitation = await ClientInvitation.findOne({
      clientId: client._id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activeInvitation) {
      const origin = req.nextUrl.origin;
      return NextResponse.json({
        status: "invitation_pending",
        invitation: {
          token: activeInvitation.token,
          inviteUrl: `${origin}/portal/invite/${activeInvitation.token}`,
          expiresAt: activeInvitation.expiresAt,
          createdAt: activeInvitation.createdAt,
        },
      });
    }

    return NextResponse.json({ status: "not_invited" });
  } catch (error: any) {
    console.error("[GET /api/clients/[id]/portal-status] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check portal status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    await ClientInvitation.updateMany(
      { clientId: id, freelancerId: session.user.id, status: "pending" },
      { $set: { status: "revoked" } }
    );

    return NextResponse.json({
      success: true,
      message: "Invitation revoked successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/clients/[id]/portal-status] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revoke invitation" },
      { status: 500 }
    );
  }
}
