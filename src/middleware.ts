import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_ROUTES = ["/chats", "/feed", "/alerts"];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return NextResponse.next();
  }

  const isAppSubdomain = hostname.startsWith("app.");

  if (!isAppSubdomain) {
    if (
      DASHBOARD_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
      )
    ) {
      const baseDomain = hostname.replace(/^www\./, "");
      const appUrl = new URL(pathname, `https://app.${baseDomain}`);
      appUrl.search = request.nextUrl.search;
      return NextResponse.redirect(appUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
