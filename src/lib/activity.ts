import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

/**
 * Logs a new user-scoped activity to the database.
 * 
 * @param userId - ID of the logged-in user (freelancer)
 * @param type - The category of the activity
 * @param title - Brief summary of the action
 * @param description - Detailed description or context
 */
export async function logActivity(
  userId: string,
  type: string,
  title: string,
  description: string = "",
  invoiceId?: string
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type: type as ActivityType,
        title,
        description,
        invoiceId: invoiceId ? invoiceId.toString() : null,
        actorRole: "freelancer",
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
