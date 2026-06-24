import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-white/90 font-bold text-3xl text-center mb-8">
        Create your account
      </h1>
      <RegisterForm />
      <div className="mt-8">
        <GoogleAuthButton />
      </div>
    </div>
  );
}
