import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";

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
      client: {
        ...client,
        _id: client.id,
      },
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

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (company !== undefined) updateFields.company = company.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (website !== undefined) updateFields.website = website.trim();

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: updateFields,
    });

    if (role === "client" && name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      client: { ...updatedClient, _id: updatedClient.id },
    });
  } catch (error: any) {
    console.error("[PATCH /api/portal/settings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: error.status || 500 }
    );
  }
}
