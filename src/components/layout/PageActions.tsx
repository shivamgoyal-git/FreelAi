import React from "react";

interface PageActionsProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageActions: React.FC<PageActionsProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-12)",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageActions;
