import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/auth/onboarding
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ onboardingCompleted: !!user.onboardingCompleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch onboarding status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/auth/onboarding
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { onboardingCompleted: true },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, onboardingCompleted: user.onboardingCompleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update onboarding status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
