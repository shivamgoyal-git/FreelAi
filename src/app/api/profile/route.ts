import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AiContextService } from "@/lib/ai-context-service";

// ── GET /api/profile ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await AiContextService.getProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST /api/profile — create new ──────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Parsed backend body for profile (POST):", JSON.stringify(body, null, 2));

    // Validations
    if (!body.personal?.fullName) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }
    if (!body.personal?.professionalTitle) {
      return NextResponse.json({ error: "Professional Title is required" }, { status: 400 });
    }
    if (!body.professional?.skills || body.professional.skills.length === 0) {
      return NextResponse.json({ error: "At least one skill is required" }, { status: 400 });
    }
    if (!body.professional?.services || body.professional.services.length === 0) {
      return NextResponse.json({ error: "At least one service is required" }, { status: 400 });
    }

    const saved = await AiContextService.saveProfile(session.user.id, body);
    return NextResponse.json({ success: true, profile: saved }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PUT /api/profile — update existing ──────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Parsed backend body for profile (PUT):", JSON.stringify(body, null, 2));

    // Validations (must not clear required fields)
    if (body.personal && body.personal.fullName !== undefined && !body.personal.fullName) {
      return NextResponse.json({ error: "Full Name cannot be empty" }, { status: 400 });
    }
    if (body.personal && body.personal.professionalTitle !== undefined && !body.personal.professionalTitle) {
      return NextResponse.json({ error: "Professional Title cannot be empty" }, { status: 400 });
    }
    if (body.professional && body.professional.skills !== undefined && body.professional.skills.length === 0) {
      return NextResponse.json({ error: "At least one skill is required" }, { status: 400 });
    }
    if (body.professional && body.professional.services !== undefined && body.professional.services.length === 0) {
      return NextResponse.json({ error: "At least one service is required" }, { status: 400 });
    }

    const saved = await AiContextService.saveProfile(session.user.id, body);
    return NextResponse.json({ success: true, profile: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE /api/profile ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await AiContextService.deleteProfile(session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
