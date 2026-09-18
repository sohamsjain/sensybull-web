import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AppToaster } from "@/components/ui/app-toaster";
import "./globals.css";

const siteUrl = "https://www.sensybull.com";

export const metadata: Metadata = {
  title: {
    default: "Sensybull — Know when your investment thesis changes",
    template: "%s | Sensybull",
  },
  description:
    "Sensybull watches the companies you own and tells you when something happens that could change why you own them. Every 8-K and press release, read against your thesis, seconds after it's published. Free while in beta.",
  keywords: [
    "investment thesis",
    "portfolio monitoring",
    "thesis drift",
    "SEC filings",
    "8-K alerts",
    "EDGAR",
    "stock filings",
    "SEC filing tracker",
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
    title: "Sensybull — Know when your investment thesis changes",
    description:
      "Sensybull watches the companies you own and tells you when something happens that could change why you own them. Free while in beta.",
    // The opaque tile rather than the transparent mark: social cards paint
    // their own background, so a bare silhouette can land invisible.
    images: [
      {
        url: "/logo-tile.png",
        width: 1024,
        height: 1024,
        alt: "Sensybull",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sensybull — Know when your investment thesis changes",
    description:
      "Sensybull watches the companies you own and tells you when something happens that could change why you own them. Free while in beta.",
    images: ["/logo-tile.png"],
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
                "Every material SEC filing decoded into a plain-English briefing, seconds after it hits EDGAR.",
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
          {/* Global toast target — mounted once so toasts fired right before
              a client-side redirect survive the navigation. */}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
