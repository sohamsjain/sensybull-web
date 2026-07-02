import { SIGNIFICANCE_CONFIG, type Significance } from "@/config/constants";

/** Materiality indicator: colored dot + level, no box outline. */
export function SignificanceBadge({ level }: { level: Significance }) {
  const config = SIGNIFICANCE_CONFIG[level] || SIGNIFICANCE_CONFIG.Medium;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${config.badge}`}
      title={`${level} significance`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
