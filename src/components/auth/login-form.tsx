"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { resolvePostAuthPath } from "@/lib/pending-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // ?next= / a stored pending action (e.g. a shared /add/MU link) wins
      router.push(resolvePostAuthPath("/watchlist"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-label font-medium text-ink-muted">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-label text-brand-ink hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-10"
        />
      </div>
      {error && <p className="text-label text-danger">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="h-10 w-full"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-label text-ink-faint">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-ink hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
