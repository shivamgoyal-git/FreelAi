import { NextResponse } from "next/server";
import { AiContextService } from "./ai-context-service";

/**
 * Reusable backend profile validation helper.
 * If the user has no Freelancer Profile, returns a 403 Forbidden response.
 * If the profile exists, returns null.
 */
export async function requireFreelancerProfile(userId: string): Promise<NextResponse | null> {
  try {
    const profile = await AiContextService.getProfile(userId);
    if (!profile) {
      return NextResponse.json(
        {
          error: "PROFILE_REQUIRED",
          message: "Complete your Freelancer Profile before using this AI feature.",
        },
        { status: 403 }
      );
    }
    return null;
  } catch (err) {
    console.error("Profile gate verification error:", err);
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Failed to verify freelancer identity profile status.",
      },
      { status: 500 }
    );
  }
}
