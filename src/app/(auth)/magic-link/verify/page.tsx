"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
        setTimeout(() => router.push("/chats"), 1000);
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
      <h2 className="text-white font-semibold text-lg">Email Sign-In</h2>

      {status === "loading" && (
        <p className="text-white/50 text-sm">Signing you in...</p>
      )}

      {status === "success" && (
        <p className="text-green-400 text-sm">{message}</p>
      )}

      {status === "error" && (
        <>
          <p className="text-red-400 text-sm">{message}</p>
          <div className="space-y-2">
            <Link
              href="/magic-link"
              className="block text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Request a new link
            </Link>
            <Link
              href="/login"
              className="block text-indigo-400 hover:text-indigo-300 text-sm"
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
        <p className="text-white/50 text-sm text-center">Signing you in...</p>
      }
    >
      <MagicLinkVerifyContent />
    </Suspense>
  );
}
