import React from "react";

interface ToolbarProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--spacing-12)",
        marginBottom: "var(--spacing-20)",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Toolbar;
