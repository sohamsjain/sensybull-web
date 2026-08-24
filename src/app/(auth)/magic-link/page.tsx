import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function MagicLinkPage() {
  return (
    <div>
      <h1 className="mb-6 text-center text-heading font-semibold text-ink">
        Sign in with email
      </h1>
      <MagicLinkForm />
    </div>
  );
}
