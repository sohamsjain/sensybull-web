import { robotsTxt } from "@/lib/robots";

// Policy and paths live in src/lib/robots.ts.
export const dynamic = "force-static";

export function GET() {
  return new Response(robotsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
