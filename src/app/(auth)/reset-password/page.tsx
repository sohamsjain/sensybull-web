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
        <p className="text-red-400 text-sm">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <p className="text-slate-700 dark:text-slate-200 text-sm">Password reset successfully.</p>
        <Link
          href="/login"
          className="text-violet-400 hover:text-violet-300 text-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-slate-900 dark:text-white font-semibold text-lg">New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="New password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-white dark:bg-[#0a0a12] border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-slate-500 dark:focus-visible:border-violet-500/40 focus-visible:ring-0"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500"
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
      fallback={<p className="text-slate-500 dark:text-slate-400 text-sm text-center">Loading...</p>}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
