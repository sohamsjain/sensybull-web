"use client";

import { useFontScale } from "@/hooks/use-font-scale";
import { IconButton } from "@/components/ui/icon-button";
import { FontSizeIcon } from "@/components/ui/icons";

/** Cycles the root font size through three steps; rem-based text follows. */
export function FontSizeToggle({ className = "" }: { className?: string }) {
  const { scale, cycle } = useFontScale();

  return (
    <IconButton
      size="lg"
      onClick={cycle}
      title={`Text size: ${scale.label} — click to change`}
      aria-label={`Text size: ${scale.label}. Activate to change.`}
      className={`relative ${className}`}
    >
      <FontSizeIcon />
      {scale.id !== "md" && (
        <span className="absolute top-1.5 right-1.5 size-1 rounded-full bg-brand" />
      )}
    </IconButton>
  );
}
