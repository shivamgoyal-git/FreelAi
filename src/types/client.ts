export type ClientStatus = "active" | "inactive" | "prospect" | "archived";

export interface Client {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  location: string;
  avatar: string | null;
  status: ClientStatus;
  tags: string[];
  notes: string;
  totalProjects: number;
  totalEarned: number;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ClientFormData = Omit<Client, "_id" | "userId" | "createdAt" | "updatedAt">;
