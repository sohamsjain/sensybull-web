import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Separator } from "@/components/ui/separator";

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-slate-900 dark:text-white/90 font-medium text-base">Create Account</h2>
      <GoogleAuthButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1 bg-slate-200 dark:bg-white/[0.08]" />
        <span className="text-slate-400 dark:text-slate-500 text-xs">or</span>
        <Separator className="flex-1 bg-slate-200 dark:bg-white/[0.08]" />
      </div>
      <RegisterForm />
    </div>
  );
}
