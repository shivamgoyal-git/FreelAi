import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.portfolioProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      success: true,
      projects: projects.map((p) => ({ ...p, _id: p.id })),
    });
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

  try {
    const { title, description, skills = [], link } = await req.json();
    if (!title || !description || !link) {
      return NextResponse.json({ error: "Title, description, and link are required." }, { status: 400 });
    }

    const ws = await prisma.workspace.findFirst({ where: { ownerId: session.user.id } });

    const newProject = await prisma.portfolioProject.create({
      data: {
        userId: session.user.id,
        title,
        description,
        skills: Array.isArray(skills) ? skills : [],
        link,
      },
    });

    return NextResponse.json({
      success: true,
      project: { ...newProject, _id: newProject.id },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
