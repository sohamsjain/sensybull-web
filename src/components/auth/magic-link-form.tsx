"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function MagicLinkForm() {
  const { magicLinkRequest } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await magicLinkRequest(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-white/70 text-base">
          Check your email for a sign-in link. It expires in 15 minutes.
        </p>
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 text-base font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-white/50 text-base text-center">
        Enter your email and we&apos;ll send you a link to sign in instantly.
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
          className="h-12 bg-[#1a1a2e] border-transparent text-base text-white placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-500"
      >
        {loading ? "Sending..." : "Send Sign-In Link"}
      </Button>
      <p className="text-center text-base text-white/50">
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
