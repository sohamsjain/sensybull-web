import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPermalink } from "@/components/feed/event-permalink";
import { displayCompanyName } from "@/lib/company-name";
import { hasEvidence } from "@/lib/evidence";
import { getPublicEvent } from "@/lib/events/api";
import { SITE_URL } from "@/lib/share";
import type { FilingEvent } from "@/types/events";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

const DESCRIPTION_MAX = 200;

function describe(event: FilingEvent): string {
  const summary = event.briefing?.summary?.trim();
  if (summary) {
    return summary.length > DESCRIPTION_MAX
      ? `${summary.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`
      : summary;
  }
  return `${displayCompanyName(event.company_name)} ${event.signal_type} filing, briefed by Sensybull.`;
}

function titleFor(event: FilingEvent): string {
  const headline =
    event.briefing?.headline?.trim() ||
    `${displayCompanyName(event.company_name)} ${event.signal_type}`;
  return event.ticker ? `${event.ticker}: ${headline}` : headline;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicEvent(id);
  if (result.kind !== "ready") {
    return { title: "Update", robots: { index: false, follow: true } };
  }
  const { event } = result;
  const title = titleFor(event);
  const description = describe(event);
  return {
    title,
    description,
    alternates: { canonical: `/e/${event.id}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/e/${event.id}`,
      siteName: "Sensybull",
      title,
      description,
      publishedTime: event.filing_date ?? event.received_at ?? undefined,
    },
    twitter: { card: "summary", title, description },
    // Only updates that show their work — verified quotes from the filing —
    // are worth a search result. The rest is model prose over a public
    // document, which is thin content; the sitemap leaves them out too.
    // (Spread rather than `robots: undefined`, which would drop the root
    // layout's index/follow directives instead of inheriting them.)
    ...(hasEvidence(event) ? {} : { robots: { index: false, follow: true } }),
  };
}

/** Schema.org description of the update, for search and answer engines. */
function jsonLd(event: FilingEvent) {
  const name = displayCompanyName(event.company_name);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: titleFor(event),
    description: describe(event),
    datePublished: event.received_at ?? event.filing_date ?? undefined,
    url: `${SITE_URL}/e/${event.id}`,
    isBasedOn: event.edgar_url ?? undefined,
    about: {
      "@type": "Corporation",
      name,
      ...(event.ticker ? { tickerSymbol: event.ticker } : {}),
    },
    // The briefing is written by Sensybull's pipeline, not a named person,
    // so the author is the organization. Inventing a byline would misstate
    // who wrote it.
    author: { "@type": "Organization", name: "Sensybull", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Sensybull", url: SITE_URL },
  };
}

/**
 * Home › Live feed › this update, for search result breadcrumbs. Not the
 * company page as the middle step: an OTC filer has updates but no company
 * page, and a breadcrumb must never point at a 404.
 */
function breadcrumbLd(event: FilingEvent) {
  const trail = [
    { name: "Sensybull", url: SITE_URL },
    { name: "Live feed", url: `${SITE_URL}/feed` },
    { name: titleFor(event), url: `${SITE_URL}/e/${event.id}` },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.url,
    })),
  };
}

/**
 * Shareable permalink for a single filing event (public), rendered on the
 * server so the update is in the HTML: link unfurlers, crawlers and AI
 * agents read it without running JavaScript.
 */
export default async function EventPermalinkPage({ params }: EventPageProps) {
  const { id } = await params;
  const result = await getPublicEvent(id);
  // A real 404 for a deleted or mistyped id: a 200 "no longer exists" page
  // is a soft 404 to a crawler, and link checkers can't see it at all.
  if (result.kind === "missing") notFound();
  const event = result.kind === "ready" ? result.event : null;
  return (
    <>
      {event && (
        <script
          type="application/ld+json"
          // `<` is escaped so a headline can never close the script tag
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([jsonLd(event), breadcrumbLd(event)]).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />
      )}
      <EventPermalink event={event} state={result.kind} />
    </>
  );
}
