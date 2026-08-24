import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-sunken p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sensybull"
            className="size-14 opacity-80 dark:invert"
          />
        </Link>
        <div className="rounded-lg border border-line-subtle bg-surface p-6 shadow-popover">
          {children}
        </div>
      </div>
    </div>
  );
}
