import type { Metadata } from "next";

// The feed page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Live SEC filing feed",
  description:
    "Every material 8-K and company press release, briefed in plain English seconds after it is published.",
  alternates: { canonical: "/feed" },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
