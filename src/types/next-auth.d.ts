import { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: UserRole | "freelancer" | "client" | "admin";
      clientId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: UserRole | "freelancer" | "client" | "admin";
    clientId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole | "freelancer" | "client" | "admin";
    clientId?: string;
  }
}
