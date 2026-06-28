import React, { ReactNode, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", leftIcon, rightIcon, children, className = "", ...props }, ref) => {
    const classNames = [
      "btn-redesign",
      `btn-redesign-${variant}`,
      `btn-redesign-${size}`,
      className,
    ].filter(Boolean).join(" ");

    return (
      <button ref={ref} className={classNames} {...props}>
        {leftIcon && <span className="btn-icon-left" style={{ display: "inline-flex", alignItems: "center" }}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className="btn-icon-right" style={{ display: "inline-flex", alignItems: "center" }}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
