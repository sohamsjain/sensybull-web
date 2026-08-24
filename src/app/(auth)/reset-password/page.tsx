"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-label text-danger">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="mt-2 inline-block text-label text-brand-ink hover:underline"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-label text-ink-muted">Password reset successfully.</p>
        <Link
          href="/login"
          className="text-label text-brand-ink hover:underline"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-title font-medium text-ink">New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="New password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-10"
        />
        {error && <p className="text-meta text-danger">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<p className="text-center text-label text-ink-faint">Loading...</p>}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
