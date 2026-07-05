"use client";

import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltip.Provider>{children}</RadixTooltip.Provider>;
}

export function Tooltip({ content, children, delayDuration = 300 }: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="top"
          align="center"
          sideOffset={5}
          style={{
            background: "var(--surface-3)",
            border: "0.5px solid var(--border-strong)",
            color: "var(--text-primary)",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "11.5px",
            boxShadow: "var(--shadow-md)",
            zIndex: 300,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {content}
          <RadixTooltip.Arrow style={{ fill: "var(--surface-3)" }} />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
