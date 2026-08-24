/**
 * Canvas mirror of the design tokens.
 *
 * The price chart draws to a canvas via lightweight-charts, which parses its
 * own colour strings and cannot read CSS custom properties. These are the
 * hex equivalents of the `success` / `danger` / `ink-faint` / `line` tokens
 * in `globals.css` — if those change, change these with them.
 */
export interface ChartPalette {
  up: string;
  down: string;
  neutral: string;
  text: string;
  grid: string;
}

const LIGHT: ChartPalette = {
  up: "#0f9b6c",
  down: "#dc3b28",
  neutral: "#8b93a5",
  text: "#8b93a5",
  grid: "rgba(15, 23, 42, 0.06)",
};

const DARK: ChartPalette = {
  up: "#3ddc9a",
  down: "#f4705d",
  neutral: "#787f8f",
  text: "#787f8f",
  grid: "rgba(255, 255, 255, 0.05)",
};

/** Resolves against the theme in effect at call time. */
export function chartPalette(): ChartPalette {
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  return dark ? DARK : LIGHT;
}
