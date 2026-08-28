import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const previewClientId = searchParams.get("previewClientId");

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client, freelancerUser } = authCtx;

    return NextResponse.json({
      client,
      freelancer: {
        name: freelancerUser?.name || "Freelancer",
        email: freelancerUser?.email || "",
        avatar: freelancerUser?.image || "",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/portal/settings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: error.status || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, company, location, website, previewClientId } = body;

    const authCtx = await getClientSession(previewClientId);
    if (!authCtx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, userId, role } = authCtx;
    await connectDB();

    const updateFields: Record<string, string> = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (company !== undefined) updateFields.company = company.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (website !== undefined) updateFields.website = website.trim();

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $set: updateFields },
      { new: true }
    );

    if (role === "client" && name) {
      await User.findByIdAndUpdate(userId, { $set: { name: name.trim() } });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      client: updatedClient,
    });
  } catch (error: any) {
    console.error("[PATCH /api/portal/settings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: error.status || 500 }
    );
  }
}
