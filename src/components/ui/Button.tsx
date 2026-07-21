"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
    const cls = `${variantClass[variant]} ${sizeClass[size]} ${className}`.trim();
    const isInteractive = !disabled && !loading;

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cls}
          style={style}
          {...(props as any)}
        >
          {children}
        </Slot>
      );
    }

    // Omit drag handlers to avoid type conflicts with HTMLMotionProps
    const { onDrag, onDragStart, onDragEnd, onAnimationStart, ...motionProps } = props as any;

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        className={cls}
        style={style}
        whileHover={isInteractive ? { y: -1.5, scale: 1.01 } : undefined}
        whileTap={isInteractive ? { scale: 0.975, y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        {...motionProps}
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
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export default Button;
