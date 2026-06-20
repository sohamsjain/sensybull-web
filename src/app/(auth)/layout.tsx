export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-slate-900 dark:text-white font-bold text-2xl text-center mb-8">
          Sensybull
        </h1>
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
