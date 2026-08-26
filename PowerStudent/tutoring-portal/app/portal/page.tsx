"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  name: string;
  subject: string | null;
  teacher: string | null;
  schedule: string | null;
  grade: string | null;
  gradePercent: number | null;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string | null;
  maxScore: number | null;
  courseName: string;
  score: number | null;
  status: string;
  feedback: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  assigned: "待完成",
  submitted: "已提交",
  graded: "已批改",
  missing: "未提交",
};

export default function PortalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/portal/me")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        setName(data.name);
        setStudentId(data.studentId);
        setCourses(data.courses);
        setAssignments(data.assignments);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center text-[var(--ink-soft)]">
        加载中…
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center text-[var(--stamp-red-deep)]">
        {error}
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12">
      <header className="flex items-start justify-between mb-10 ledger-rule pb-6">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-1">
            学号 {studentId}
          </p>
          <h1 className="font-display text-3xl font-semibold">{name} 同学</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
        >
          退出登录
        </button>
      </header>

      <section className="mb-12">
        <h2 className="font-display text-xl font-semibold mb-4">我的课程</h2>
        {courses.length === 0 ? (
          <p className="text-[var(--ink-soft)] text-sm">
            老师还没有为你安排课程。
          </p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white rounded-lg border border-[var(--paper-line)] px-5 py-4"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {[c.subject, c.teacher, c.schedule].filter(Boolean).join(" · ") ||
                      "暂无更多信息"}
                  </p>
                </div>
                <div className="stamp w-16 h-16 shrink-0 text-lg">
                  {c.grade ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4">我的作业</h2>
        {assignments.length === 0 ? (
          <p className="text-[var(--ink-soft)] text-sm">暂时没有作业记录。</p>
        ) : (
          <div className="bg-white rounded-lg border border-[var(--paper-line)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">作业</th>
                  <th className="px-5 py-3">课程</th>
                  <th className="px-5 py-3">截止日期</th>
                  <th className="px-5 py-3">状态</th>
                  <th className="px-5 py-3 text-right">得分</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="ledger-rule last:border-b-0">
                    <td className="px-5 py-3">
                      <p className="font-medium">{a.title}</p>
                      {a.feedback && (
                        <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                          老师评语：{a.feedback}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--ink-soft)]">{a.courseName}</td>
                    <td className="px-5 py-3 text-[var(--ink-soft)] font-mono">
                      {a.dueDate ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs">
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {a.score !== null ? a.score : "—"}
                      {a.maxScore ? ` / ${a.maxScore}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
