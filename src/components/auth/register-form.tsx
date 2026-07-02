"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Name
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12 bg-[#1a1a2e] border-transparent text-base text-white placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-0"
        />
      </div>
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
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Password
        </label>
        <Input
          type="password"
          placeholder="6+ characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 bg-[#1a1a2e] border-transparent text-base text-white placeholder:text-white/30 focus-visible:border-indigo-500/50 focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-500"
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-base text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
