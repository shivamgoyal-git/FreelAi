export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  userId: string;
  invoiceNumber: string;
  clientId: string; // references Client
  projectId?: string; // references Project (optional)
  status: InvoiceStatus;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // flat discount amount
  discountAmount: number; // server-calculated discount amount
  taxableAmount: number; // server-calculated taxable amount
  taxRate: number; // percentage, e.g. 18 for 18%
  taxAmount: number;
  total: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string; // default "INR"
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceFormData = Omit<
  Invoice,
  "_id" | "userId" | "createdAt" | "updatedAt" | "total" | "subtotal" | "taxAmount" | "remainingAmount" | "discountAmount" | "taxableAmount"
> & {
  // Frontend can submit partial updates
  status?: InvoiceStatus;
};
