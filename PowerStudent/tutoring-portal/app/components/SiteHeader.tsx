import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-[var(--ledger-blue)] text-white">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="brand-mark">P</span>
          <span className="font-display text-lg font-semibold tracking-tight">
            PowerStudent
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[#cfe0f2]">
          <Link href="/login" className="hover:text-white transition-colors">
            Student Login
          </Link>
          <Link href="/admin/login" className="hover:text-white transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
