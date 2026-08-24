"use client";

import { useTheme } from "next-themes";

import { IconButton } from "@/components/ui/icon-button";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

/**
 * Both icons are rendered and swapped with the `dark:` variant rather than
 * by reading the resolved theme: `resolvedTheme` is undefined on the server,
 * so branching on it would render the wrong glyph and fail hydration.
 */
export function ThemeToggle({
  className = "",
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <IconButton
      size={size}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Toggle theme"
      aria-label="Toggle theme"
      className={className}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </IconButton>
  );
}
