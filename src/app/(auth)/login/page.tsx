import { LoginForm } from "@/components/auth/login-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-white/90 font-bold text-3xl text-center mb-8">
        Sign in to your account
      </h1>
      <LoginForm />
      <div className="mt-8">
        <GoogleAuthButton />
      </div>
    </div>
  );
}
