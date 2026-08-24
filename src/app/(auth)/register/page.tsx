import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { AppleAuthButton } from "@/components/auth/apple-auth-button";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-heading font-semibold text-ink">
        Create your account
      </h1>
      {/* One-click options first */}
      <div className="space-y-3">
        <GoogleAuthButton />
        <AppleAuthButton />
      </div>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-meta text-ink-faint">or use email</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <RegisterForm />
    </div>
  );
}
