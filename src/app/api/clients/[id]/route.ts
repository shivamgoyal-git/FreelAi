import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/clients/[id] — single client ─────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
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

    const client = await Client.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (err: unknown) {
    console.error("[GET /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to load client";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH /api/clients/[id] — update ──────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
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

    const body = await req.json();
    // Strip fields that must not be overwritten
    delete body.userId;
    delete body._id;

    const client = await Client.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (err: unknown) {
    console.error("[PATCH /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to update client";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ── DELETE /api/clients/[id] — delete ─────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
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

    const deleted = await Client.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/clients/[id]] Error:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete client";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
