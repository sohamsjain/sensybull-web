"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
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
      router.push("/chats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-white/80">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-violet-400 hover:text-violet-300"
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
          className="h-12 bg-[#1a1a2e] border-transparent text-base text-white placeholder:text-white/30 focus-visible:border-violet-500/50 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-violet-600 hover:bg-violet-500"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-base text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium">
          Create an account
        </Link>
      </p>
    </form>
  );
}
