import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      { success: true, message: "✅ MongoDB connected successfully!" },
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
