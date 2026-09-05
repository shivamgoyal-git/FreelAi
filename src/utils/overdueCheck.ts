import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

/**
 * Checks for invoices that are overdue but still marked as "sent" or "partially_paid",
 * updates their status to "overdue", and logs an activity for each.
 * 
 * @param userId - ID of the user whose invoices are being checked
 */
export async function checkAndUpdateOverdueInvoices(userId: string): Promise<void> {
  try {
    const currentDate = new Date();

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ["sent", "partially_paid"] },
        dueDate: { lt: currentDate },
      },
    });

    if (overdueInvoices.length === 0) return;

    for (const invoice of overdueInvoices) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "overdue" },
      });

      await logActivity(
        userId,
        "invoice_overdue",
        `Invoice ${invoice.invoiceNumber} is Overdue`,
        `Invoice ${invoice.invoiceNumber} has passed its due date of ${new Date(invoice.dueDate).toLocaleDateString()}. Remaining balance: ${invoice.currency} ${invoice.remainingAmount}`,
        invoice.id
      );
    }
  } catch (error) {
    console.error("Error checking and updating overdue invoices:", error);
  }
}
