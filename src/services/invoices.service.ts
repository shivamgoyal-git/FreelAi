import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@prisma/client";

export class InvoicesService {
  static calculateInvoiceTotals(data: {
    items?: Array<{ description?: string; quantity: number; rate: number; amount?: number }>;
    discount?: number;
    taxRate?: number;
    amountPaid?: number;
    dueDate?: Date | string;
    currentStatus?: string;
  }) {
    let subtotal = 0;
    const items = (data.items || []).map((item) => {
      const q = Number(item.quantity) || 0;
      const r = Number(item.rate) || 0;
      const amount = Number((q * r).toFixed(2));
      subtotal += amount;
      return {
        ...item,
        quantity: q,
        rate: r,
        amount,
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    const discount = Number(data.discount) || 0;
    const discountAmount = discount;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = Number(data.taxRate) || 0;
    const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const total = Number((taxableAmount + taxAmount).toFixed(2));
    const amountPaid = Number(data.amountPaid) || 0;
    const remainingAmount = Number((total - amountPaid).toFixed(2));

    let status: InvoiceStatus = (data.currentStatus as InvoiceStatus) || "draft";
    if (status !== "cancelled") {
      if (amountPaid >= total && total > 0) {
        status = "paid";
      } else {
        const isOverdue = data.dueDate && new Date(data.dueDate) < new Date();
        if (isOverdue && status !== "draft") {
          status = "overdue";
        } else if (amountPaid > 0) {
          status = "partially_paid";
        } else if (status === "paid" || status === "partially_paid" || status === "overdue") {
          status = "sent";
        }
      }
    }

    return {
      items,
      subtotal,
      discount,
      discountAmount,
      taxableAmount,
      taxRate,
      taxAmount,
      total,
      amountPaid,
      remainingAmount,
      status,
    };
  }

  static async getInvoicesByUserId(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        client: true,
        project: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices.map((inv) => ({
      ...inv,
      _id: inv.id,
      clientId: inv.client ? { ...inv.client, _id: inv.client.id } : inv.clientId,
      projectId: inv.project ? { ...inv.project, _id: inv.project.id } : inv.projectId,
    }));
  }

  static async getInvoiceById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    if (!invoice) return null;

    return {
      ...invoice,
      _id: invoice.id,
      clientId: invoice.client ? { ...invoice.client, _id: invoice.client.id } : invoice.clientId,
      projectId: invoice.project ? { ...invoice.project, _id: invoice.project.id } : invoice.projectId,
    };
  }

  static async createInvoice(userId: string, data: any) {
    const ws = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    const totals = this.calculateInvoiceTotals({
      items: data.items,
      discount: data.discount,
      taxRate: data.taxRate,
      amountPaid: data.amountPaid,
      dueDate: data.dueDate,
      currentStatus: data.status,
    });

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        workspaceId: ws?.id,
        invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        clientId: data.clientId,
        projectId: data.projectId || null,
        status: totals.status,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: totals.amountPaid,
        remainingAmount: totals.remainingAmount,
        currency: data.currency || "INR",
        notes: data.notes || "",
        paymentTerms: data.paymentTerms || "",
        items: {
          create: totals.items.map((item, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            description: item.description || "Service",
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    return {
      ...invoice,
      _id: invoice.id,
    };
  }

  static async updateInvoice(id: string, userId: string, data: any) {
    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!existing) return null;

    const totals = this.calculateInvoiceTotals({
      items: data.items || existing.items,
      discount: data.discount !== undefined ? data.discount : existing.discount,
      taxRate: data.taxRate !== undefined ? data.taxRate : existing.taxRate,
      amountPaid: data.amountPaid !== undefined ? data.amountPaid : existing.amountPaid,
      dueDate: data.dueDate || existing.dueDate,
      currentStatus: data.status || existing.status,
    });

    if (data.items) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...(data.invoiceNumber && { invoiceNumber: data.invoiceNumber }),
        ...(data.clientId && { clientId: data.clientId }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        status: totals.status,
        ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: totals.amountPaid,
        remainingAmount: totals.remainingAmount,
        ...(data.currency && { currency: data.currency }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
        ...(data.items && {
          items: {
            create: totals.items.map((item, idx) => ({
              id: `item-${id}-${idx}-${Date.now()}`,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })),
          },
        }),
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });

    return {
      ...updated,
      _id: updated.id,
    };
  }

  static async deleteInvoice(id: string, userId: string) {
    const result = await prisma.invoice.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
