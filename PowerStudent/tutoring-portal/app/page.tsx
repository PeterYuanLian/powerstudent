import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 flex-1 flex flex-col justify-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-4">
          Student Grades &amp; Assignments Portal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-6">
          A gradebook you can
          <br />
          open anytime.
        </h1>
        <p className="text-[var(--ink-soft)] text-lg max-w-xl mb-10">
          Every student can log in to see their own courses, grades, and assignment
          progress, while the teacher manages everything from one dashboard.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-[var(--ledger-blue)] text-white font-medium hover:bg-[var(--ledger-blue-deep)] transition-colors"
          >
            Student Login
          </Link>
          <Link
            href="/admin/login"
            className="px-6 py-3 rounded-md border border-[var(--paper-line)] text-[var(--ink)] font-medium hover:border-[var(--ink-soft)] transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>

      <footer className="border-t border-[var(--paper-line)] py-6 text-center text-xs text-[var(--ink-soft)] font-mono">
        Maintained by your teacher · For class use only
      </footer>
    </main>
  );
}
