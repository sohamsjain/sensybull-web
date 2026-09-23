import type { Metadata } from "next";
import LandingPage from "@/components/landing/landing-page";
import { SignedInRedirect } from "@/components/landing/signed-in-redirect";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Runs before the landing is parsed: a browser that believes it holds a
// session hides the landing until SignedInRedirect decides. Keys mirror
// hasSession() in src/lib/api-client.ts.
const MARK_SESSION = `try{var s=localStorage;if(s.getItem("sensybull:session")==="1"||s.getItem("access_token")!==null)document.documentElement.setAttribute("data-session","")}catch(e){}`;

/**
 * The landing page, server-rendered: its HTML is what search engines and AI
 * crawlers read, and most of those never run JavaScript. Signed-in readers
 * are forwarded to /watchlist on the client.
 */
export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: MARK_SESSION }} />
      <SignedInRedirect />
      <div data-landing className="contents">
        <LandingPage />
      </div>
    </>
  );
}
