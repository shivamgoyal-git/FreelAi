import React, { ReactNode } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: "active" | "pending" | "draft" | "overdue" | "inactive" | "cancelled";
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = "", ...props }) => {
  const mappedVariant = (variant === "cancelled" || variant === "inactive") ? "inactive" : variant;
  const classNames = [
    "badge-redesign",
    `badge-redesign-${mappedVariant}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  );
};
