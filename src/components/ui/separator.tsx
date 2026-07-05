"use client";

import * as React from "react";
import * as RadixSeparator from "@radix-ui/react-separator";

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixSeparator.Root>
>(({ orientation = "horizontal", className = "", style, ...props }, ref) => (
  <RadixSeparator.Root
    ref={ref}
    orientation={orientation}
    style={{
      background: "var(--border)",
      height: orientation === "horizontal" ? "0.5px" : "100%",
      width: orientation === "horizontal" ? "100%" : "0.5px",
      margin: orientation === "horizontal" ? "12px 0" : "0 12px",
      ...style,
    }}
    {...props}
  />
));
Separator.displayName = "Separator";
