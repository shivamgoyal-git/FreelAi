import connectDB from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { logActivity } from "@/lib/activity";

/**
 * Checks for invoices that are overdue but still marked as "sent" or "partially_paid",
 * updates their status to "overdue", and logs an activity for each.
 * 
 * @param userId - ID of the user whose invoices are being checked
 */
export async function checkAndUpdateOverdueInvoices(userId: string): Promise<void> {
  try {
    await connectDB();
    const currentDate = new Date();

    // Find invoices whose dueDate has passed, and status is "sent" or "partially_paid"
    const overdueInvoices = await Invoice.find({
      userId,
      status: { $in: ["sent", "partially_paid"] },
      dueDate: { $lt: currentDate },
    });

    if (overdueInvoices.length === 0) return;

    for (const invoice of overdueInvoices) {
      invoice.status = "overdue";
      await invoice.save(); // Triggers the pre-save calculations/status hook

      // Log invoice overdue activity
      await logActivity(
        userId,
        "invoice_overdue",
        `Invoice ${invoice.invoiceNumber} is Overdue`,
        `Invoice ${invoice.invoiceNumber} for client has passed its due date of ${invoice.dueDate.toLocaleDateString()}. Remaining balance: ${invoice.currency} ${invoice.remainingAmount}`,
        invoice._id.toString()
      );
    }
  } catch (error) {
    console.error("Error checking and updating overdue invoices:", error);
  }
}
