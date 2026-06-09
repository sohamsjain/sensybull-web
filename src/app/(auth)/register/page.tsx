import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-lg">Create Account</h2>
      <GoogleAuthButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1 bg-slate-700" />
        <span className="text-slate-500 text-xs">or</span>
        <Separator className="flex-1 bg-slate-700" />
      </div>
      <RegisterForm />
    </div>
  );
}
