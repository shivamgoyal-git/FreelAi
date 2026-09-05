import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { taskId, projectId, completed } = await req.json();

    if (!projectId || !taskId) {
      return NextResponse.json({ error: "projectId and taskId are required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { milestones: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const milestone = await prisma.milestone.findFirst({
      where: { id: taskId, projectId },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone/task not found in project" }, { status: 404 });
    }

    await prisma.milestone.update({
      where: { id: taskId },
      data: { completed: Boolean(completed) },
    });

    const allMilestones = await prisma.milestone.findMany({ where: { projectId } });
    const totalMilestones = allMilestones.length;
    const completedCount = allMilestones.filter((m) => m.completed).length;

    let newProgress = project.progress;
    let newStatus = project.status;

    if (totalMilestones > 0) {
      newProgress = Math.round((completedCount / totalMilestones) * 100);
      if (newProgress === 100 && project.status === "active") {
        newStatus = "completed";
      } else if (newProgress < 100 && project.status === "completed") {
        newStatus = "active";
      }

      await prisma.project.update({
        where: { id: projectId },
        data: { progress: newProgress, status: newStatus },
      });
    }

    if (completed) {
      await logActivity(
        userId,
        "project_updated",
        "Task completed",
        `Task "${milestone.title}" marked as completed for project "${project.title}".`
      );
    }

    return NextResponse.json({
      success: true,
      taskId,
      projectId,
      completed: Boolean(completed),
      progress: newProgress,
      status: newStatus,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle task status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
