import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a12] p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="w-7 h-7 dark:invert opacity-80"
          />
          <span className="text-slate-900 dark:text-white/90 font-semibold text-lg">
            Sensybull
          </span>
        </Link>
        <div className="bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
