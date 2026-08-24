import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { AppleAuthButton } from "@/components/auth/apple-auth-button";

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-heading font-semibold text-ink">
        Sign in
      </h1>
      {/* One-click options first — most people never need the password form */}
      <div className="space-y-3">
        <GoogleAuthButton />
        <AppleAuthButton />
        <Link
          href="/magic-link"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line text-label font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          Email me a sign-in link
        </Link>
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-meta text-ink-faint">or use a password</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <LoginForm />
    </div>
  );
}
