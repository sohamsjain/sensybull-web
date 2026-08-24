import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-heading font-semibold text-ink">
        Reset your password
      </h1>
      <ForgotPasswordForm />
    </div>
  );
}
