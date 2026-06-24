export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a12] p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-slate-900 dark:text-white/90 font-semibold text-xl text-center mb-8">
          Sensybull
        </h1>
        <div className="bg-slate-100 dark:bg-[#12121e] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
