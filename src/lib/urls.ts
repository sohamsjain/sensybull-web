const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.sensybull.com";
const WWW_URL =
  process.env.NEXT_PUBLIC_WWW_URL || "https://www.sensybull.com";

export function getAppUrl(path = ""): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return path || "/";
    }
  }
  return `${APP_URL}${path}`;
}

export function getWwwUrl(path = ""): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return path || "/";
    }
  }
  return `${WWW_URL}${path}`;
}

export function isAppSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.startsWith("app.");
}
