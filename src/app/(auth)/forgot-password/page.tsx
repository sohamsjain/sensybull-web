import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-slate-900 dark:text-white font-semibold text-lg">Reset Password</h2>
      <ForgotPasswordForm />
    </div>
  );
}
