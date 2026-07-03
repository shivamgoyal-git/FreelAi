import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import PortfolioProject from "@/models/PortfolioProject";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const projects = await PortfolioProject.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, projects });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load projects";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const { title, description, skills = [], link } = await req.json();
    if (!title || !description || !link) {
      return NextResponse.json({ error: "Title, description, and link are required." }, { status: 400 });
    }

    const newProject = new PortfolioProject({
      userId: session.user.id,
      title,
      description,
      skills,
      link,
    });

    await newProject.save();
    return NextResponse.json({ success: true, project: newProject });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
