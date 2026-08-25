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
  /** Volume bars sit under the price and must never compete with it. */
  volumeUp: string;
  volumeDown: string;
  crosshair: string;
  /** The ticker printed faintly behind the candles. */
  watermark: string;
}

const LIGHT: ChartPalette = {
  up: "#0f9b6c",
  down: "#dc3b28",
  neutral: "#8b93a5",
  text: "#8b93a5",
  grid: "rgba(15, 23, 42, 0.06)",
  volumeUp: "rgba(15, 155, 108, 0.16)",
  volumeDown: "rgba(220, 59, 40, 0.16)",
  crosshair: "rgba(15, 23, 42, 0.3)",
  watermark: "rgba(15, 23, 42, 0.05)",
};

const DARK: ChartPalette = {
  up: "#3ddc9a",
  down: "#f4705d",
  neutral: "#787f8f",
  text: "#787f8f",
  grid: "rgba(255, 255, 255, 0.05)",
  volumeUp: "rgba(61, 220, 154, 0.15)",
  volumeDown: "rgba(244, 112, 93, 0.15)",
  crosshair: "rgba(255, 255, 255, 0.28)",
  watermark: "rgba(255, 255, 255, 0.045)",
};

/**
 * Resolves against the theme in effect. Pass the resolved theme when the
 * caller has it (next-themes) — reading the class is a fallback, and it can
 * still be a render behind on a theme switch.
 */
export function chartPalette(theme?: string | null): ChartPalette {
  if (theme) return theme === "dark" ? DARK : LIGHT;
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  return dark ? DARK : LIGHT;
}
