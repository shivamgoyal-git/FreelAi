"use client";

import React, { createContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const applyTheme = (themeValue: Theme) => {
    let resolvedTheme: "light" | "dark" = "dark";

    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
      resolvedTheme = systemTheme;
    } else {
      resolvedTheme = themeValue;
    }

    document.documentElement.setAttribute("data-theme", resolvedTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "system";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  };

  const toggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
