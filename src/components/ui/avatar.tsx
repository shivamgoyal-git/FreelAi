"use client";

import * as React from "react";
import * as RadixAvatar from "@radix-ui/react-avatar";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof RadixAvatar.Root> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: number;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, fallback, size = 32, className = "", style, ...props }, ref) => (
    <RadixAvatar.Root
      ref={ref}
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontSize: `${size * 0.4}px`,
        ...style,
      }}
      {...props}
    >
      <RadixAvatar.Image
        src={src ?? undefined}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <RadixAvatar.Fallback
        delayMs={200}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontWeight: 700,
          background: "var(--color-brand)",
          color: "var(--color-on-brand)",
        }}
      >
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
);
Avatar.displayName = "Avatar";
