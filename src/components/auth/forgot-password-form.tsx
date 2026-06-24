"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-slate-700 dark:text-slate-200 text-sm">
          If an account with that email exists, we&apos;ve sent a password reset
          link.
        </p>
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 text-sm"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white dark:bg-[#0a0a12] border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-slate-500 dark:focus-visible:border-violet-500/40 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500"
      >
        {loading ? "..." : "Send Reset Link"}
      </Button>
      <p className="text-center text-xs">
        <Link
          href="/login"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
