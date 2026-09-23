import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/share";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/** Matches the API's own cache of the list (routes/discovery.py). */
export const revalidate = 21600;

interface SitemapData {
  companies: { symbol: string; lastmod: string | null }[];
  events: { id: string; lastmod: string | null }[];
}

async function fetchSitemapData(): Promise<SitemapData | null> {
  try {
    const res = await fetch(`${API_URL}/discovery/sitemap`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as SitemapData;
  } catch {
    return null;
  }
}

/**
 * /sitemap.xml: the public pages worth indexing.
 *
 * The API decides which dynamic pages qualify — companies with a
 * fundamentals page, and only the events that carry verified evidence
 * quotes (the permalink of an event without them is noindex; see
 * src/app/(dashboard)/e/[id]/page.tsx). If the API is unreachable the
 * sitemap still lists the static pages rather than failing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/feed`, changeFrequency: "always", priority: 0.8 },
    { url: `${SITE_URL}/company`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const data = await fetchSitemapData();
  if (!data) return staticPages;

  return [
    ...staticPages,
    ...data.companies.map((c) => ({
      url: `${SITE_URL}/company/${encodeURIComponent(c.symbol)}`,
      lastModified: c.lastmod ?? undefined,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...data.events.map((e) => ({
      url: `${SITE_URL}/e/${encodeURIComponent(e.id)}`,
      lastModified: e.lastmod ?? undefined,
      changeFrequency: "never" as const,
      priority: 0.5,
    })),
  ];
}
