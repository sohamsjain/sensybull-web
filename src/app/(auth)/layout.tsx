import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sensybull"
            className="w-20 h-20 invert opacity-90"
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
