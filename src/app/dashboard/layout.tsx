"use client";

import React from "react";
import { useSession } from "next-auth/react";
import AppShell from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "Freelancer";
  const userInitial = userName.charAt(0).toUpperCase();
  const userImage = session?.user?.image;
  const userEmail = session?.user?.email;

  return (
    <AppShell
      userName={userName}
      userInitial={userInitial}
      userImage={userImage}
      userEmail={userEmail}
    >
      {children}
    </AppShell>
  );
}
