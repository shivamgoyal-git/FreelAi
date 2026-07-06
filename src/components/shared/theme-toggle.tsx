"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Laptop, label: "System" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--surface-2)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: "var(--radius-pill)",
        padding: "3px",
        gap: "2px",
      }}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            title={`${opt.label} mode`}
            aria-label={`${opt.label} mode`}
            style={{
              background: isActive ? "var(--surface-1)" : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 12px",
              gap: "6px",
              borderRadius: "var(--radius-pill)",
              color: isActive ? "var(--color-brand)" : "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
              transition: "all var(--dur-fast)",
            }}
          >
            <Icon size={14} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
