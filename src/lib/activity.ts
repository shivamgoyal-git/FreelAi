import connectDB from "./mongodb";
import Activity, { ActivityType } from "@/models/Activity";

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
  type: ActivityType,
  title: string,
  description: string = "",
  invoiceId?: string
) {
  try {
    await connectDB();
    await Activity.create({
      userId,
      type,
      title,
      description,
      invoiceId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
