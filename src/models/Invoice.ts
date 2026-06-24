import mongoose, { Document, Model, Schema } from "mongoose";
import type { InvoiceStatus, InvoiceItem } from "@/types/invoice";

export interface IInvoice extends Document {
  userId: string;
  invoiceNumber: string;
  clientId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string;
  notes?: string;
  paymentTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<InvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    rate: { type: Number, required: true, default: 0, min: 0 },
    amount: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      trim: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "clientId is required"],
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"],
      default: "draft",
      index: true,
    },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true, index: true },
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    notes: { type: String, default: "" },
    paymentTerms: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user-scoped queries, search, and sorting
InvoiceSchema.index({ userId: 1, createdAt: -1 });
InvoiceSchema.index({ userId: 1, dueDate: 1 });
InvoiceSchema.index({ userId: 1, total: 1 });
InvoiceSchema.index({ userId: 1, invoiceNumber: 1 });

// Pre-save hook for server-side calculations and status resolution
InvoiceSchema.pre("save", function (next?: any) {
  console.log("DEBUG: Invoice pre-save hook executing! typeof next =", typeof next);
  // 1. Calculate each item's amount and sum subtotal
  let subtotal = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.amount = Number((item.quantity * item.rate).toFixed(2));
      subtotal += item.amount;
    });
  }
  this.subtotal = Number(subtotal.toFixed(2));

  // 2. Taxable amount = subtotal - discount
  const taxableAmount = Math.max(0, this.subtotal - this.discount);

  // 3. Tax amount = taxableAmount * (taxRate / 100)
  this.taxAmount = Number((taxableAmount * (this.taxRate / 100)).toFixed(2));

  // 4. Total = taxableAmount + taxAmount
  this.total = Number((taxableAmount + this.taxAmount).toFixed(2));

  // 5. Remaining Amount = total - amountPaid
  this.remainingAmount = Number((this.total - this.amountPaid).toFixed(2));

  // 6. Status resolution logic
  if (this.status !== "cancelled") {
    if (this.amountPaid >= this.total) {
      this.status = "paid";
    } else {
      // It is unpaid or partially paid
      const isOverdue = this.dueDate && new Date(this.dueDate) < new Date();
      
      if (isOverdue && this.status !== "draft") {
        this.status = "overdue";
      } else if (this.amountPaid > 0) {
        this.status = "partially_paid";
      } else {
        // If not overdue and amountPaid is 0
        if (this.status === "paid" || this.status === "partially_paid" || this.status === "overdue") {
          this.status = "sent";
        }
      }
    }
  }

  if (typeof next === "function") {
    next();
  }
});

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
