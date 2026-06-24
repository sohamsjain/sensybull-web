import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { AppleAuthButton } from "@/components/auth/apple-auth-button";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-white/90 font-bold text-3xl text-center mb-8">
        Sign in to your account
      </h1>
      <LoginForm />
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-sm">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="mt-6 space-y-3">
        <GoogleAuthButton />
        <AppleAuthButton />
        <Link
          href="/magic-link"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          Sign in with email link
        </Link>
      </div>
    </div>
  );
}
