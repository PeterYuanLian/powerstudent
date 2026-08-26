"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败。");
        return;
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-2">
          管理后台
        </p>
        <h1 className="font-display text-2xl font-semibold mb-8">老师登录</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[var(--ink-soft)]">
              管理密码
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
            {loading ? "登录中…" : "进入管理后台"}
          </button>
        </form>
      </div>
    </main>
  );
}
