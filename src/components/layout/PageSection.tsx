import React from "react";

interface PageSectionProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageSection: React.FC<PageSectionProps> = ({ children, style }) => {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-16)",
        marginBottom: "var(--spacing-96)",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </section>
  );
};

export default PageSection;
