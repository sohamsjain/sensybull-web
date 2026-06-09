"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "Email verified!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Verification failed"
        );
      });
  }, [token]);

  return (
    <div className="text-center space-y-4">
      <h2 className="text-white font-semibold text-lg">Email Verification</h2>

      {status === "loading" && (
        <p className="text-slate-400 text-sm">Verifying...</p>
      )}

      {status === "success" && (
        <>
          <p className="text-green-400 text-sm">{message}</p>
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Sign in
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-red-400 text-sm">{message}</p>
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<p className="text-slate-400 text-sm text-center">Verifying...</p>}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
