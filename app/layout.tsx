import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sensybull | Smart Financial News for Investors",
  description: "Discover hidden gems in the market. Get personalized 60-second financial insights through swipeable cards. Stay informed, invest smarter.",
  keywords: "financial news, stock market, equity investing, AI news, personalized finance, market insights",
  openGraph: {
    title: "Sensybull | Smart Financial News for Investors",
    description: "Discover hidden gems in the market. Get personalized 60-second financial insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
