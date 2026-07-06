import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-24)",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

export default DashboardLayout;
