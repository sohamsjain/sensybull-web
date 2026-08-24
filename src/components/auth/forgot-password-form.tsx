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
        <p className="text-label text-ink-muted">
          If an account with that email exists, we&apos;ve sent a password reset
          link.
        </p>
        <Link
          href="/login"
          className="text-label font-medium text-brand-ink hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-label text-ink-faint">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div>
        <label className="mb-1.5 block text-label font-medium text-ink-muted">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>
      {error && <p className="text-label text-danger">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="h-10 w-full"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
      <p className="text-center text-label text-ink-faint">
        <Link
          href="/login"
          className="font-medium text-brand-ink hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
