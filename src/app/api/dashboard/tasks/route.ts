import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  await connectDB();

  try {
    const { taskId, projectId, completed } = await req.json();

    if (!projectId || !taskId) {
      return NextResponse.json({ error: "projectId and taskId are required" }, { status: 400 });
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let milestoneTitle = "";
    let milestoneFound = false;

    if (Array.isArray(project.milestones)) {
      project.milestones = project.milestones.map((m: any) => {
        if (m.id === taskId || String(m._id) === taskId) {
          milestoneFound = true;
          milestoneTitle = m.title;
          return {
            ...m,
            completed: Boolean(completed),
          };
        }
        return m;
      });
    }

    if (!milestoneFound) {
      return NextResponse.json({ error: "Milestone/task not found in project" }, { status: 404 });
    }

    // Recalculate project progress based on completed milestones
    const totalMilestones = project.milestones.length;
    const completedCount = project.milestones.filter((m: any) => m.completed).length;
    if (totalMilestones > 0) {
      project.progress = Math.round((completedCount / totalMilestones) * 100);
      if (project.progress === 100 && project.status === "active") {
        project.status = "completed";
      } else if (project.progress < 100 && project.status === "completed") {
        project.status = "active";
      }
    }

    await project.save();

    // Log activity if completed
    if (completed) {
      await logActivity(
        userId,
        "project_updated",
        "Task completed",
        `Task "${milestoneTitle}" marked as completed for project "${project.title}".`
      );
    }

    return NextResponse.json({
      success: true,
      taskId,
      projectId,
      completed: Boolean(completed),
      progress: project.progress,
      status: project.status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle task status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
