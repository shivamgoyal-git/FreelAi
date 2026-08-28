export type DeliverableStatus = "pending_review" | "changes_requested" | "approved";

export interface Deliverable {
  _id: string;
  projectId: string;
  projectName?: string;
  milestoneId?: string;
  clientId: string;
  clientName?: string;
  userId: string; // freelancer
  title: string;
  version: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  externalUrl?: string;
  status: DeliverableStatus;
  clientFeedback?: string;
  feedbackDate?: string;
  approvedDate?: string;
  uploadedBy: "freelancer" | "client";
  createdAt: string;
  updatedAt: string;
}

export type FileCategory =
  | "deliverable"
  | "contract"
  | "guidelines"
  | "invoice"
  | "asset"
  | "other";

export interface ProjectFile {
  _id: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  userId: string;
  name: string;
  url: string;
  size: string;
  fileType: string;
  uploadedBy: "freelancer" | "client";
  uploaderName: string;
  category: FileCategory;
  isClientVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface Message {
  _id: string;
  projectId: string;
  projectName?: string;
  clientId: string;
  userId: string;
  senderRole: "freelancer" | "client";
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: MessageAttachment[];
  readByClient: boolean;
  readByFreelancer: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | "deliverable_uploaded"
  | "deliverable_approved"
  | "changes_requested"
  | "invoice_sent"
  | "invoice_due"
  | "invoice_overdue"
  | "invoice_paid"
  | "new_message"
  | "proposal_received"
  | "proposal_accepted"
  | "milestone_completed"
  | "client_invited"
  | "client_joined"
  | "general";

export interface PortalNotification {
  _id: string;
  recipientId: string;
  recipientRole: "freelancer" | "client";
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  projectId?: string;
  invoiceId?: string;
  createdAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface ClientInvitation {
  _id: string;
  freelancerId: string;
  clientId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface ClientPortalOverview {
  client: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    avatar?: string;
  };
  freelancer: {
    name: string;
    email: string;
    company?: string;
    avatar?: string;
  };
  stats: {
    activeProjects: number;
    pendingApprovals: number;
    outstandingAmount: number;
    upcomingDeadlines: number;
    currency: string;
  };
  attentionItems: Array<{
    id: string;
    type: "deliverable" | "invoice" | "message" | "proposal";
    title: string;
    subtitle: string;
    actionLabel: string;
    actionLink: string;
    urgency: "high" | "medium" | "low";
  }>;
  projects: Array<{
    _id: string;
    title: string;
    category: string;
    status: string;
    progress: number;
    budget: number;
    currency: string;
    dueDate?: string;
    currentMilestone?: string;
    pendingDeliverableCount: number;
  }>;
  recentActivity: Array<{
    _id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}
