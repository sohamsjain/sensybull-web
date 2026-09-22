"use client";

import { useState } from "react";
import type { FundamentalsAnalysis, FundamentalsCompany } from "@/types/fundamentals";
import { formatCount } from "@/lib/fundamentals/format";

const CLAMP_CHARS = 320;

/**
 * "About": what the company is, beside the stats rather than below them.
 * A reader who doesn't know the ticker needs the sentence and the numbers
 * in one glance, which is why screener sets them side by side.
 */
export function AboutPanel({
  company,
  analysis,
}: {
  company: FundamentalsCompany;
  analysis: FundamentalsAnalysis;
}) {
  const [open, setOpen] = useState(false);
  const description = company.description?.trim() || "";
  const long = description.length > CLAMP_CHARS;
  const shown = open || !long ? description : `${description.slice(0, CLAMP_CHARS).trimEnd()}…`;

  const facts: string[] = [];
  if (company.ceo) facts.push(`CEO ${company.ceo}`);
  if (company.employees) facts.push(`${formatCount(company.employees)} employees`);
  if (company.ipo_date) facts.push(`Listed ${company.ipo_date.slice(0, 4)}`);
  if (company.fiscal_year_end_month) {
    const month = new Date(Date.UTC(2000, company.fiscal_year_end_month - 1, 1)).toLocaleString(
      "en-US",
      { month: "long", timeZone: "UTC" }
    );
    facts.push(`Fiscal year ends ${month}`);
  }

  return (
    <div className="min-w-0">
      <h2 className="eyebrow mb-2">About</h2>
      {description ? (
        <p className="text-label leading-relaxed text-ink-muted">
          {shown}
          {long && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="text-brand-ink underline-offset-2 hover:underline"
              >
                {open ? "Show less" : "Read more"}
              </button>
            </>
          )}
        </p>
      ) : (
        <p className="text-label text-ink-faint">No description on file.</p>
      )}
      {facts.length > 0 && <p className="mt-2 text-meta text-ink-faint">{facts.join(" · ")}</p>}
      {analysis.key_points.length > 0 && (
        <>
          <h3 className="eyebrow mt-4 mb-1.5">Key points</h3>
          <ul className="space-y-1 text-label text-ink-muted">
            {analysis.key_points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-ink-faint" aria-hidden>
                  ·
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * "Analysis": the rule-generated pros and cons. The sentences cite the
 * numbers they were built from (see the API's analysis.py) and are never
 * edited here.
 */
export function AnalysisPanel({ analysis }: { analysis: FundamentalsAnalysis }) {
  const hasAnalysis = analysis.pros.length > 0 || analysis.cons.length > 0;
  if (!hasAnalysis) {
    return (
      <p className="text-label text-ink-faint">Not enough reported history to judge yet.</p>
    );
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProsCons title="Pros" items={analysis.pros} />
        <ProsCons title="Cons" items={analysis.cons} />
      </div>
      <p className="mt-3 text-micro text-ink-faint">
        Pros and cons are generated from the statements below by fixed rules. They are a
        starting point for reading the numbers, not a recommendation.
      </p>
    </>
  );
}

function ProsCons({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-meta font-semibold text-ink">{title}</p>
      {items.length === 0 ? (
        <p className="text-meta text-ink-faint">None flagged.</p>
      ) : (
        <ul className="space-y-1.5 text-meta leading-snug text-ink-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-ink-faint" aria-hidden>
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
