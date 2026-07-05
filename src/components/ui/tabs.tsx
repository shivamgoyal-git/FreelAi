"use client";

import * as React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

export const Tabs = RadixTabs.Root;

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.List>
>(({ className = "", style, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    className={`filter-tabs ${className}`}
    style={{ display: "flex", gap: "2px", ...style }}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(({ className = "", style, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={`filter-tab ${className}`}
    style={{ border: "none", background: "transparent", cursor: "pointer", ...style }}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(({ className = "", style, ...props }, ref) => (
  <RadixTabs.Content
    ref={ref}
    className={className}
    style={{ outline: "none", ...style }}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
