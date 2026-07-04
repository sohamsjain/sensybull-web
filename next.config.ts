import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sensybull.com" }],
        destination: "https://sensybull.com/:path*",
        permanent: true,
      },
      // Old alert deep links and bookmarks from the "Chats" era
      {
        source: "/chats",
        destination: "/watchlist",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
