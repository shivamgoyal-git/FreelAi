"use client";

import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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
        style={{
          borderRadius: "var(--radius-cards)",
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ padding: "var(--spacing-24) var(--spacing-24) 0", ...style }}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-heading ${className}`}
      style={{
        fontSize: "var(--text-body-sm)",
        fontWeight: 510,
        color: "var(--text-primary)",
        margin: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <p
      ref={ref}
      className={className}
      style={{
        fontSize: "var(--text-caption)",
        color: "var(--text-muted)",
        marginTop: "var(--spacing-4)",
        ...style
      }}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ padding: "var(--spacing-16) var(--spacing-24)", ...style }}
      {...props}
    >
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        padding: "var(--spacing-12) var(--spacing-24) var(--spacing-20)",
        borderTop: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-8)",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

export default Card;
