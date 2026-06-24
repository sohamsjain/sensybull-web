import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const siteUrl = "https://www.sensybull.com";

export const metadata: Metadata = {
  title: {
    default: "Sensybull — SEC 8-K Filings, Decoded",
    template: "%s | Sensybull",
  },
  description:
    "Every SEC 8-K filing decoded into a plain-English briefing, seconds after it hits EDGAR. Track your companies, get alerts, stay ahead. Free to use.",
  keywords: [
    "SEC filings",
    "8-K filings",
    "EDGAR",
    "SEC alerts",
    "stock filings",
    "SEC filing tracker",
    "SEC filing alerts",
    "investment research",
    "real-time SEC filings",
  ],
  authors: [{ name: "Sensybull, LLC" }],
  creator: "Sensybull",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Sensybull",
    title: "Sensybull — SEC 8-K Filings, Decoded",
    description:
      "Every SEC 8-K filing decoded into a plain-English briefing, seconds after it hits EDGAR. Free to use.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Sensybull",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sensybull — SEC 8-K Filings, Decoded",
    description:
      "Every SEC 8-K filing decoded into a plain-English briefing, seconds after it hits EDGAR. Free to use.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Sensybull",
              url: siteUrl,
              description:
                "Every SEC 8-K filing decoded into a plain-English briefing, seconds after it hits EDGAR.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
