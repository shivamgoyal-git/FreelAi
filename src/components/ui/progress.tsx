"use client";

import * as React from "react";
import * as RadixProgress from "@radix-ui/react-progress";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof RadixProgress.Root> {
  value?: number;
  indicatorColor?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, indicatorColor = "var(--primary)", className = "", style, ...props }, ref) => (
    <RadixProgress.Root
      ref={ref}
      className={`progress-bar ${className}`}
      style={{ position: "relative", overflow: "hidden", width: "100%", ...style }}
      {...props}
    >
      <RadixProgress.Indicator
        className="progress-fill"
        style={{
          width: `${value}%`,
          background: indicatorColor,
          height: "100%",
          transition: "transform 660ms cubic-bezier(0.65, 0, 0.35, 1)",
        }}
      />
    </RadixProgress.Root>
  )
);
Progress.displayName = "Progress";
