"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   "btn-redesign btn-redesign-primary",
  secondary: "btn-redesign btn-redesign-secondary",
  ghost:     "btn-redesign btn-redesign-ghost",
  danger:    "btn-redesign btn-redesign-danger",
  outline:   "btn-redesign btn-redesign-secondary",
};

const sizeClass: Record<ButtonSize, string> = {
  sm:   "btn-redesign-sm",
  md:   "btn-redesign-md",
  lg:   "btn-redesign-lg",
  icon: "btn-redesign-icon",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, asChild, leftIcon, rightIcon, children, disabled, className = "", style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const cls = `${variantClass[variant]} ${sizeClass[size]} ${className}`.trim();

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        style={style}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} style={{ animation: "spin 0.85s linear infinite", flexShrink: 0 }} />
        ) : leftIcon ? (
          <span style={{ display: "flex", flexShrink: 0 }}>{leftIcon}</span>
        ) : null}
        {size !== "icon" && children}
        {size === "icon" && !loading && children}
        {rightIcon && !loading && (
          <span style={{ display: "flex", flexShrink: 0 }}>{rightIcon}</span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export default Button;
