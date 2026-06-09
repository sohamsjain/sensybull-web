import { SIGNIFICANCE_CONFIG, type Significance } from "@/config/constants";

export function SignificanceBadge({ level }: { level: Significance }) {
  const config = SIGNIFICANCE_CONFIG[level] || SIGNIFICANCE_CONFIG.Medium;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.badge}`}
    >
      {config.label}
    </span>
  );
}
