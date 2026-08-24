"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { resolvePostAuthPath } from "@/lib/pending-action";
import Link from "next/link";

function MagicLinkVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { magicLinkVerify } = useAuth();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid sign-in link.");
      return;
    }

    magicLinkVerify(token)
      .then(() => {
        setStatus("success");
        setMessage("Signed in successfully! Redirecting...");
        // A stored pending action (e.g. a shared /add/MU link) resumes here —
        // the email round-trip loses ?next=, localStorage doesn't.
        setTimeout(() => router.push(resolvePostAuthPath("/watchlist")), 1000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Sign-in failed"
        );
      });
  }, [token, magicLinkVerify, router]);

  return (
    <div className="text-center space-y-4">
      <h2 className="text-title font-medium text-ink">Email Sign-In</h2>

      {status === "loading" && (
        <p className="text-label text-ink-faint">Signing you in...</p>
      )}

      {status === "success" && (
        <p className="text-label text-success">{message}</p>
      )}

      {status === "error" && (
        <>
          <p className="text-label text-danger">{message}</p>
          <div className="space-y-2">
            <Link
              href="/magic-link"
              className="block text-label text-brand-ink hover:underline"
            >
              Request a new link
            </Link>
            <Link
              href="/login"
              className="block text-label text-brand-ink hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-label text-ink-faint">Signing you in...</p>
      }
    >
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
