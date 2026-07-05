"use client";

import * as React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";

export const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>
>(({ className = "", style, checked, onCheckedChange, ...props }, ref) => (
  <RadixSwitch.Root
    ref={ref}
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={`switch ${checked ? "on" : ""} ${className}`}
    style={{ border: "none", outline: "none", ...style }}
    {...props}
  >
    <RadixSwitch.Thumb
      style={{
        display: "block",
        width: "15px",
        height: "15px",
        background: "white",
        borderRadius: "50%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: checked ? "translateX(17px)" : "translateX(0)",
      }}
    />
  </RadixSwitch.Root>
));
Switch.displayName = "Switch";
