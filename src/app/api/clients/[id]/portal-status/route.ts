import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import ClientInvitation from "@/models/ClientInvitation";
import User from "@/models/User";
import mongoose from "mongoose";

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

    // Check if client User account already exists or an invitation has been accepted
    const clientUser = await User.findOne({
      $or: [{ clientId: client._id }, { email: client.email.toLowerCase().trim() }],
      role: "client",
    });

    const acceptedInvitation = await ClientInvitation.findOne({
      clientId: client._id,
      status: "accepted",
    });

    if (clientUser || acceptedInvitation) {
      return NextResponse.json({
        status: "active",
        clientEmail: client.email,
        user: clientUser
          ? {
              id: clientUser._id.toString(),
              name: clientUser.name,
              email: clientUser.email,
            }
          : undefined,
      });
    }

    // Find the latest invitation for this client
    const latestInvitation = await ClientInvitation.findOne({
      clientId: client._id,
    }).sort({ createdAt: -1 });

    if (latestInvitation) {
      const origin = req.nextUrl.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";

      if (latestInvitation.status === "pending") {
        if (new Date(latestInvitation.expiresAt) > new Date()) {
          return NextResponse.json({
            status: "invitation_pending",
            clientEmail: client.email,
            invitation: {
              token: latestInvitation.token,
              inviteUrl: `${origin}/portal/invite/${latestInvitation.token}`,
              recipient: latestInvitation.email,
              expiresAt: latestInvitation.expiresAt,
              createdAt: latestInvitation.createdAt,
            },
          });
        } else {
          // Token has expired
          latestInvitation.status = "expired";
          await latestInvitation.save();
          return NextResponse.json({
            status: "invitation_expired",
            clientEmail: client.email,
          });
        }
      }

      if (latestInvitation.status === "expired") {
        return NextResponse.json({
          status: "invitation_expired",
          clientEmail: client.email,
        });
      }

      if (latestInvitation.status === "revoked") {
        return NextResponse.json({
          status: "invitation_revoked",
          clientEmail: client.email,
        });
      }
    }

    return NextResponse.json({
      status: "not_invited",
      clientEmail: client.email,
    });
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

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
