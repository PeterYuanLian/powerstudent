"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
      router.push("/portal");
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-2">
          Student Login
        </p>
        <h1 className="font-display text-2xl font-semibold mb-8">
          View your courses and grades
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[var(--ink-soft)]">
              Student ID
            </label>
            <input
              className="w-full rounded-md border border-[var(--paper-line)] bg-white px-3 py-2 outline-none focus:border-[var(--ledger-blue)]"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. s001"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--ink-soft)]">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-[var(--paper-line)] bg-white px-3 py-2 outline-none focus:border-[var(--ledger-blue)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-[var(--stamp-red-deep)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--ledger-blue)] text-white py-2.5 font-medium hover:bg-[var(--ledger-blue-deep)] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-[var(--ink-soft)] mt-6">
          Forgot your password? Ask your teacher to reset it.
          <br />
          <Link href="/admin/login" className="underline">
            I&apos;m the teacher, go to Admin Dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
