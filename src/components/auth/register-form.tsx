"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { resolvePostAuthPath } from "@/lib/pending-action";
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
      // ?next= / a stored pending action (e.g. a shared /add/MU link) wins
      router.push(resolvePostAuthPath("/feed"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-label font-medium text-ink-muted">
          Name
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10"
        />
      </div>
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
        <label className="mb-1.5 block text-label font-medium text-ink-muted">
          Password
        </label>
        <Input
          type="password"
          placeholder="6+ characters"
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-label text-ink-faint">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-ink hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
