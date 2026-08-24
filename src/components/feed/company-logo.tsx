"use client";

import { CompanyAvatar } from "@/components/watchlist/company-avatar";

/**
 * The company mark as it appears in the feed. Same mark as everywhere else —
 * one component, so a logo can never be a circle in one place and a square
 * in another.
 */
export function CompanyLogo({
  ticker,
  name,
}: {
  ticker: string | null;
  name: string;
}) {
  return <CompanyAvatar ticker={ticker} name={name} size="md" />;
}
