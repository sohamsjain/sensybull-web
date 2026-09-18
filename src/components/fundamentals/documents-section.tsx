import Link from "next/link";
import type { FilingDocument, FundamentalsDocuments } from "@/types/fundamentals";
import { formatFilingDate } from "@/lib/fundamentals/format";
import { ImportantMarker } from "@/components/ui/badge";
import { ExternalLinkIcon } from "@/components/ui/icons";

/**
 * Documents: the company's SEC filings straight from EDGAR (annual reports,
 * quarterly reports, proxy statements) and Sensybull's own briefings of its
 * recent 8-Ks and press releases. Server-rendered.
 */
export function DocumentsSection({
  docs,
  companyId,
}: {
  docs: FundamentalsDocuments | null;
  companyId: string;
}) {
  if (!docs) {
    return (
      <p className="text-label text-ink-faint">
        Couldn&apos;t load filings right now. The company&apos;s EDGAR page is
        the source of truth in the meantime.
      </p>
    );
  }
  const { filings, updates } = docs;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="min-w-0 space-y-5">
        <FilingList title="Annual reports" docs={filings.annual} empty="No 10-K on file." />
        <FilingList title="Quarterly reports" docs={filings.quarterly} empty="No 10-Q on file." />
        <FilingList title="Proxy statements" docs={filings.proxy} empty="No proxy on file." />
        {docs.filings_error && (
          <p className="text-micro text-ink-faint">
            EDGAR was unreachable; the lists above may be incomplete.
          </p>
        )}
        {docs.edgar_url && (
          <a
            href={docs.edgar_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-meta text-brand-ink underline-offset-2 hover:underline"
          >
            All filings on EDGAR
            <ExternalLinkIcon className="size-3" />
          </a>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="eyebrow mb-2">Recent updates</h3>
        {updates.length === 0 ? (
          <p className="text-label text-ink-faint">
            No 8-Ks or press releases briefed yet.
          </p>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {updates.map((u) => (
              <li key={u.id} className="py-2">
                <Link href={`/e/${u.id}`} className="group/update block">
                  <p className="flex items-center gap-2 text-micro text-ink-faint">
                    <span className="font-mono tabular-nums">
                      {formatFilingDate(u.filing_date)}
                    </span>
                    <span>{u.signal_type === "PR" ? "Press release" : u.signal_type}</span>
                    {u.important && <ImportantMarker />}
                  </p>
                  <p className="text-label leading-snug text-ink transition-colors group-hover/update:text-brand-ink">
                    {u.headline || "Update"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/watchlist?c=${companyId}`}
          className="mt-2 inline-block text-meta text-brand-ink underline-offset-2 hover:underline"
        >
          Full update history
        </Link>
      </div>
    </div>
  );
}

function FilingList({
  title,
  docs,
  empty,
}: {
  title: string;
  docs: FilingDocument[];
  empty: string;
}) {
  return (
    <div>
      <h3 className="eyebrow mb-1.5">{title}</h3>
      {docs.length === 0 ? (
        <p className="text-meta text-ink-faint">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {docs.map((d) => (
            <li key={d.url}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${d.form} filed ${formatFilingDate(d.filed)}`}
                className="inline-flex h-7 items-center gap-1 rounded-sm bg-surface-hover px-2 font-mono text-micro tabular-nums text-ink-muted transition-colors hover:bg-surface-active hover:text-ink"
              >
                {periodLabel(d)}
                <ExternalLinkIcon className="size-3 text-ink-faint" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "FY2025" for annual reports, "Jun 2025" for quarters, filing date otherwise. */
function periodLabel(d: FilingDocument): string {
  const period = d.period || d.filed;
  if (!period) return d.form;
  const date = new Date(`${period.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return d.form;
  if (d.form.startsWith("10-K") || d.form.startsWith("20-F") || d.form.startsWith("40-F")) {
    return `FY${date.getUTCFullYear()}`;
  }
  if (d.form.startsWith("10-Q")) {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
