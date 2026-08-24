import { MetaLabel } from "@/components/ui/badge";

/** Category label. Plain muted text — the taxonomy shouldn't compete with
 *  the headline, so it gets no pill and no colour. */
export function EventTypeTag({
  type,
  primary = false,
}: {
  type: string;
  primary?: boolean;
}) {
  return (
    <MetaLabel className={primary ? "shrink-0 text-ink-muted" : undefined}>
      {type}
    </MetaLabel>
  );
}
