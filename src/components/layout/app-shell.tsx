"use client";

import React from "react";
import AppContainer from "./AppContainer";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userInitial: string;
  userImage?: string | null;
  userEmail?: string | null;
}

export default function AppShell({ children, userName, userInitial, userImage, userEmail }: AppShellProps) {
  return (
    <AppContainer
      userName={userName}
      userInitial={userInitial}
      userImage={userImage}
      userEmail={userEmail}
    >
      {children}
    </AppContainer>
  );
}
