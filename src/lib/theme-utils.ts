/**
 * Design System Theme Utilities
 */

/**
 * Gets the computed value of a CSS custom property (design token)
 * @param token The name of the CSS variable (e.g. '--color-void')
 * @returns The resolved string value of the token
 */
export function getCSSVariable(token: string): string {
  if (typeof window === "undefined") return "";
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(token).trim();
}

/**
 * Maps the categories used in projects and portfolio breakdown charts
 * to their respective theme variables.
 */
export const categoryThemeColors: Record<string, string> = {
  design: "var(--color-iris-violet)",
  development: "var(--color-signal-teal)",
  illustration: "var(--color-lavender)",
  video: "var(--color-coral-red)",
  writing: "var(--color-mist)",
  marketing: "var(--color-pulse-green)",
  consulting: "var(--color-bone)",
  other: "var(--color-fog)",
};
