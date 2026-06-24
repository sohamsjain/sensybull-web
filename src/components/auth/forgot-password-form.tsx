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
      <div className="text-center space-y-4">
        <p className="text-white/70 text-base">
          If an account with that email exists, we&apos;ve sent a password reset
          link.
        </p>
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 text-base font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-white/50 text-base text-center">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 bg-[#1a1a2e] border-transparent text-base text-white placeholder:text-white/30 focus-visible:border-violet-500/50 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-violet-600 hover:bg-violet-500"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
      <p className="text-center text-base text-white/50">
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 font-medium"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
