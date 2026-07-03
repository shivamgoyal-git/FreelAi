import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import PortfolioProject from "@/models/PortfolioProject";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { id } = await params;
    const project = await PortfolioProject.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!project) {
      return NextResponse.json({ error: "Portfolio project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
