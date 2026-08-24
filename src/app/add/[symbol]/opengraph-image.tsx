import { ImageResponse } from "next/og";
import { normalizeSymbol } from "@/lib/share";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Track this company on Sensybull";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

async function companyName(symbol: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/share/${encodeURIComponent(symbol)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const info = await res.json();
    return info?.company?.name ?? null;
  } catch {
    return null;
  }
}

/** Fetch the company logo as a data URI, or null — never let a flaky logo
 *  CDN break OG image generation. */
async function logoDataUri(symbol: string): Promise<string | null> {
  if (!LOGO_DEV_TOKEN) return null;
  try {
    const res = await fetch(
      `https://img.logo.dev/ticker/${encodeURIComponent(symbol)}?token=${LOGO_DEV_TOKEN}&format=png&size=160&theme=dark`
    );
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const symbol = normalizeSymbol((await params).symbol) ?? "—";
  const [name, logo] = await Promise.all([
    symbol === "—" ? null : companyName(symbol),
    symbol === "—" ? null : logoDataUri(symbol),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#131519",
          color: "#e9eaee",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {logo ? (
            <img
              src={logo}
              alt=""
              width={112}
              height={112}
              style={{ borderRadius: 20, background: "#191c22" }}
            />
          ) : (
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 20,
                background: "#1f222a",
                color: "#8b90a0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              {symbol.slice(0, 4)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, color: "#a99bf5", fontWeight: 600 }}>
              {symbol}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.15,
                maxWidth: 900,
              }}
            >
              {name ? `Track ${name}` : "Track this company"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#5546c8",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 600,
              padding: "20px 44px",
              borderRadius: 14,
            }}
          >
            + Track Company
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>Sensybull</div>
            <div style={{ fontSize: 22, color: "#8b90a0" }}>
              SEC filings, decoded
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
