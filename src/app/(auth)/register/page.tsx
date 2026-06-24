import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { AppleAuthButton } from "@/components/auth/apple-auth-button";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-white/90 font-bold text-3xl text-center mb-8">
        Create your account
      </h1>
      <RegisterForm />
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-sm">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="mt-6 space-y-3">
        <GoogleAuthButton />
        <AppleAuthButton />
      </div>
    </div>
  );
}
