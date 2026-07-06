import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: string | number;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, maxWidth = "var(--page-max-width)" }) => {
  return (
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-28)",
      }}
    >
      {children}
    </div>
  );
};

export default PageLayout;
