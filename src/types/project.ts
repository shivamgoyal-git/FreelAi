export type ProjectStatus =
  | "draft"
  | "active"
  | "in_review"
  | "completed"
  | "on_hold"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type ProjectCategory =
  | "design"
  | "development"
  | "illustration"
  | "video"
  | "writing"
  | "marketing"
  | "consulting"
  | "other";

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  description: string;
  clientId?: string;
  clientName?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  currency: string;
  paid: number;
  progress: number; // 0-100
  startDate?: string;
  dueDate?: string;
  tags: string[];
  milestones: ProjectMilestone[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = Omit<Project, "_id" | "userId" | "createdAt" | "updatedAt">;
