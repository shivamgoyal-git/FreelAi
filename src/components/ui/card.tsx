"use client";

import * as React from "react";

// ── Card ──────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "ghost";
  hover?: boolean;
}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hover, className = "", style, children, ...props }, ref) => {
    const base = variant === "elevated" ? "glass-card-strong" : variant === "ghost" ? "" : "glass-card";
    return (
      <div
        ref={ref}
        className={`${base} ${hover ? "stat-card" : ""} ${className}`.trim()}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// ── CardHeader ────────────────────────────────────────────────
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div ref={ref} className={className} style={{ padding: "20px 24px 0", ...style }} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

// ── CardTitle ─────────────────────────────────────────────────
export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-heading ${className}`}
      style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0, ...style }}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

// ── CardDescription ───────────────────────────────────────────
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <p ref={ref} className={className} style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "3px", ...style }} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

// ── CardContent ───────────────────────────────────────────────
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div ref={ref} className={className} style={{ padding: "16px 24px", ...style }} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

// ── CardFooter ────────────────────────────────────────────────
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div ref={ref} className={className} style={{ padding: "12px 24px 20px", borderTop: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", ...style }} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

export default Card;
