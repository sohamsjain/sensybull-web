import { describe, expect, it } from "vitest";
import { GET } from "./route";

async function get(path: string, symbol: string) {
  return GET(new Request(`https://sensybull.com${path}`), {
    params: Promise.resolve({ symbol }),
  });
}

describe("GET /embed/:symbol", () => {
  it("serves a frameable, cacheable HTML button", async () => {
    const res = await get("/embed/MU", "MU");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors *"
    );
    expect(res.headers.get("X-Frame-Options")).toBeNull();
    expect(res.headers.get("Cache-Control")).toContain("public");
    const html = await res.text();
    expect(html).toContain("/add/MU?ref=embed");
    expect(html).toContain("Track MU on Sensybull");
  });

  it("404s on malformed symbols", async () => {
    const res = await get("/embed/%3Cscript%3E", "<script>");
    expect(res.status).toBe(404);
  });

  it("escapes custom labels", async () => {
    const res = await get(
      "/embed/MU?label=" + encodeURIComponent('<img onerror=alert(1)>'),
      "MU"
    );
    const html = await res.text();
    expect(html).not.toContain("<img onerror");
    expect(html).toContain("&lt;img onerror=alert(1)&gt;");
  });

  it("clamps numeric customization params", async () => {
    const res = await get("/embed/MU?width=99999&radius=-5&fontSize=abc", "MU");
    const html = await res.text();
    expect(html).toContain("width:480px");
    expect(html).toContain("border-radius:0px");
    expect(html).toContain("font-size:14px");
  });

  it("honors theme=dark", async () => {
    const res = await get("/embed/MU?theme=dark", "MU");
    const html = await res.text();
    expect(html).toContain("#12141b");
    expect(html).not.toContain("prefers-color-scheme");
  });
});
