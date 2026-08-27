import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 grid-texture flex flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 py-24 flex-1 flex flex-col justify-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--sky)] mb-4">
            Student Grades &amp; Assignments Portal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1] mb-6 text-[var(--ledger-blue)]">
            A report card you
            <br />
            can open anytime.
          </h1>
          <p className="text-[var(--ink-soft)] text-lg max-w-xl mb-10">
            Every student logs in to see their monthly report cards, course
            details, and assignment progress — while the teacher manages it
            all from one dashboard.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-[var(--ledger-blue)] text-white font-medium hover:bg-[var(--ledger-blue-deep)] transition-colors shadow-sm"
            >
              Student Login
            </Link>
            <Link
              href="/admin/login"
              className="px-6 py-3 rounded-lg border border-[var(--paper-line)] bg-white text-[var(--ink)] font-medium hover:border-[var(--sky)] transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-[var(--paper-line)] bg-white py-6 text-center text-xs text-[var(--ink-soft)] font-mono">
        Maintained by your teacher · For class use only
      </footer>
    </main>
  );
}
