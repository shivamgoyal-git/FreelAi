import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json(
      {
        success: true,
        message: "✅ Supabase PostgreSQL connected successfully via Prisma!",
        userCount,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `❌ Connection failed: ${message}` },
      { status: 500 }
    );
  }
}
