import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function MagicLinkPage() {
  return (
    <div>
      <h1 className="text-white/90 font-bold text-3xl text-center mb-8">
        Sign in with email
      </h1>
      <MagicLinkForm />
    </div>
  );
}
