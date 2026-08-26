import type { Metadata } from "next";
import { cache } from "react";
import type { ShareInfo } from "@/types/api";
import { normalizeSymbol, SITE_URL } from "@/lib/share";
import { displayCompanyName } from "@/lib/company-name";
import { AddFlow } from "@/components/share/add-flow";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/** Public share info for the ticker; cached per request (metadata + page). */
const getShareInfo = cache(async (symbol: string): Promise<ShareInfo | null> => {
  try {
    const res = await fetch(`${API_URL}/share/${encodeURIComponent(symbol)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ShareInfo;
  } catch {
    // API unreachable at render time — the client flow retries on its own.
    return null;
  }
});

interface AddPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: AddPageProps): Promise<Metadata> {
  const symbol = normalizeSymbol((await params).symbol);
  const info = symbol ? await getShareInfo(symbol) : null;

  if (!symbol || !info) {
    return {
      title: "Track a company on Sensybull",
      description:
        "Receive material filings, earnings, press releases and company updates.",
      robots: { index: false, follow: false },
    };
  }

  const title = `Track ${displayCompanyName(info.company.name)} on Sensybull`;
  const description =
    "Receive material filings, earnings, press releases and company updates.";
  return {
    title,
    description,
    alternates: { canonical: `/add/${symbol}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/add/${symbol}`,
      siteName: "Sensybull",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AddPage({ params }: AddPageProps) {
  const symbol = normalizeSymbol((await params).symbol);
  const info = symbol ? await getShareInfo(symbol) : null;

  const jsonLd = info && {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: displayCompanyName(info.company.name),
    tickerSymbol: info.symbol,
    url: `${SITE_URL}/add/${info.symbol}`,
    ...(info.company.sector ? { industry: info.company.sector } : {}),
    ...(info.company.market_cap
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Market cap",
            value: info.company.market_cap,
            unitText: "USD",
          },
        }
      : {}),
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AddFlow
        symbol={symbol}
        company={
          info
            ? {
                name: displayCompanyName(info.company.name),
                ticker: info.symbol,
              }
            : null
        }
      />
    </>
  );
}
