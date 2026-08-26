"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Student = { id: string; student_id: string; name: string };
type Course = {
  id: string;
  name: string;
  subject: string | null;
  teacher: string | null;
  schedule: string | null;
};
type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  grade: string | null;
  grade_percent: number | null;
};
type Assignment = {
  id: string;
  course_id: string;
  title: string;
  due_date: string | null;
  max_score: number | null;
};
type ScoreRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  score: number | null;
  status: string;
  feedback: string | null;
};

type Overview = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  assignments: Assignment[];
  scores: ScoreRow[];
};

const TABS = ["学生", "课程", "成绩", "作业"] as const;

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("学生");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading || !data) {
    return (
      <main className="flex-1 flex items-center justify-center text-[var(--ink-soft)]">
        加载中…
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-1">
            管理后台
          </p>
          <h1 className="font-display text-2xl font-semibold">数据登记台</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
        >
          退出登录
        </button>
      </header>

      <nav className="flex gap-1 mb-8 border-b border-[var(--paper-line)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[var(--ledger-blue)] text-[var(--ledger-blue)]"
                : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="mb-6 text-sm text-[var(--ledger-blue-deep)] bg-white border border-[var(--paper-line)] rounded-md px-4 py-2">
          {notice}
        </p>
      )}

      {tab === "学生" && (
        <StudentsTab data={data} reload={load} flash={flash} />
      )}
      {tab === "课程" && <CoursesTab data={data} reload={load} flash={flash} />}
      {tab === "成绩" && (
        <EnrollmentsTab data={data} reload={load} flash={flash} />
      )}
      {tab === "作业" && (
        <AssignmentsTab data={data} reload={load} flash={flash} />
      )}
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--paper-line)] p-5">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-[var(--ink-soft)]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--paper-line)] px-3 py-2 outline-none focus:border-[var(--ledger-blue)]";

function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className="rounded-md bg-[var(--ledger-blue)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--ledger-blue-deep)] disabled:opacity-60"
    />
  );
}

function DangerLink(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="text-xs text-[var(--stamp-red-deep)] underline"
    />
  );
}

// ---------- 学生 ----------
function StudentsTab({
  data,
  reload,
  flash,
}: {
  data: Overview;
  reload: () => void;
  flash: (m: string) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, name, password }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return flash(json.error);
    setStudentId("");
    setName("");
    setPassword("");
    flash("已添加学生。");
    reload();
  }

  async function resetPassword(id: string) {
    const newPassword = prompt("输入这名学生的新密码：");
    if (!newPassword) return;
    const res = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: newPassword }),
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("密码已更新。");
  }

  async function removeStudent(id: string) {
    if (!confirm("确定删除这名学生？相关成绩和作业记录也会一并删除。")) return;
    const res = await fetch(`/api/admin/students?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("已删除。");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">添加学生</h2>
        <form onSubmit={addStudent} className="grid sm:grid-cols-3 gap-4">
          <Field label="学号">
            <input
              className={inputClass}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="s001"
              required
            />
          </Field>
          <Field label="姓名">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="初始密码">
            <input
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <div className="sm:col-span-3">
            <PrimaryButton disabled={submitting}>
              {submitting ? "添加中…" : "添加学生"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          学生名单（{data.students.length}）
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">学号</th>
              <th className="py-2">姓名</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.id} className="ledger-rule last:border-b-0">
                <td className="py-2 font-mono">{s.student_id}</td>
                <td className="py-2">{s.name}</td>
                <td className="py-2 text-right space-x-4">
                  <DangerLink onClick={() => resetPassword(s.id)}>
                    重置密码
                  </DangerLink>
                  <DangerLink onClick={() => removeStudent(s.id)}>删除</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- 课程 ----------
function CoursesTab({
  data,
  reload,
  flash,
}: {
  data: Overview;
  reload: () => void;
  flash: (m: string) => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [schedule, setSchedule] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, teacher, schedule }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return flash(json.error);
    setName("");
    setSubject("");
    setTeacher("");
    setSchedule("");
    flash("已添加课程。");
    reload();
  }

  async function removeCourse(id: string) {
    if (!confirm("确定删除这门课程？相关成绩和作业也会一并删除。")) return;
    const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("已删除。");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">添加课程</h2>
        <form onSubmit={addCourse} className="grid sm:grid-cols-4 gap-4">
          <Field label="课程名称">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="科目">
            <input
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="任课老师">
            <input
              className={inputClass}
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            />
          </Field>
          <Field label="上课时间">
            <input
              className={inputClass}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="周六 14:00-16:00"
            />
          </Field>
          <div className="sm:col-span-4">
            <PrimaryButton disabled={submitting}>
              {submitting ? "添加中…" : "添加课程"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          课程列表（{data.courses.length}）
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">名称</th>
              <th className="py-2">科目</th>
              <th className="py-2">老师</th>
              <th className="py-2">时间</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.courses.map((c) => (
              <tr key={c.id} className="ledger-rule last:border-b-0">
                <td className="py-2">{c.name}</td>
                <td className="py-2 text-[var(--ink-soft)]">{c.subject}</td>
                <td className="py-2 text-[var(--ink-soft)]">{c.teacher}</td>
                <td className="py-2 text-[var(--ink-soft)] font-mono">
                  {c.schedule}
                </td>
                <td className="py-2 text-right">
                  <DangerLink onClick={() => removeCourse(c.id)}>删除</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- 成绩（选课 + 成绩登记） ----------
function EnrollmentsTab({
  data,
  reload,
  flash,
}: {
  data: Overview;
  reload: () => void;
  flash: (m: string) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [grade, setGrade] = useState("");
  const [gradePercent, setGradePercent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const studentName = (id: string) =>
    data.students.find((s) => s.id === id)?.name ?? "（已删除学生）";
  const courseName = (id: string) =>
    data.courses.find((c) => c.id === id)?.name ?? "（已删除课程）";

  async function upsertEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !courseId) return flash("请选择学生和课程。");
    setSubmitting(true);
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId,
        grade: grade || null,
        gradePercent: gradePercent ? Number(gradePercent) : null,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return flash(json.error);
    setGrade("");
    setGradePercent("");
    flash("成绩已登记。");
    reload();
  }

  async function removeEnrollment(id: string) {
    const res = await fetch(`/api/admin/enrollments?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("已删除。");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          登记选课 / 成绩
        </h2>
        <form onSubmit={upsertEnrollment} className="grid sm:grid-cols-4 gap-4">
          <Field label="学生">
            <select
              className={inputClass}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">选择学生</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.student_id}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="课程">
            <select
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">选择课程</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="成绩（如 A / 92分）">
            <input
              className={inputClass}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </Field>
          <Field label="百分比（可选，用于统计）">
            <input
              type="number"
              className={inputClass}
              value={gradePercent}
              onChange={(e) => setGradePercent(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-4">
            <PrimaryButton disabled={submitting}>
              {submitting ? "保存中…" : "保存成绩"}
            </PrimaryButton>
            <span className="ml-3 text-xs text-[var(--ink-soft)]">
              同一位学生 + 同一门课程再次提交会覆盖原有成绩。
            </span>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          已登记成绩（{data.enrollments.length}）
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">学生</th>
              <th className="py-2">课程</th>
              <th className="py-2">成绩</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.enrollments.map((en) => (
              <tr key={en.id} className="ledger-rule last:border-b-0">
                <td className="py-2">{studentName(en.student_id)}</td>
                <td className="py-2">{courseName(en.course_id)}</td>
                <td className="py-2 font-mono">
                  {en.grade ?? "—"}
                  {en.grade_percent !== null ? ` (${en.grade_percent}%)` : ""}
                </td>
                <td className="py-2 text-right">
                  <DangerLink onClick={() => removeEnrollment(en.id)}>
                    删除
                  </DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- 作业 ----------
function AssignmentsTab({
  data,
  reload,
  flash,
}: {
  data: Overview;
  reload: () => void;
  flash: (m: string) => void;
}) {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const [scoreAssignmentId, setScoreAssignmentId] = useState("");
  const [scoreStudentId, setScoreStudentId] = useState("");
  const [score, setScore] = useState("");
  const [status, setStatus] = useState("graded");
  const [feedback, setFeedback] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);

  const courseName = (id: string) =>
    data.courses.find((c) => c.id === id)?.name ?? "（已删除课程）";
  const studentName = (id: string) =>
    data.students.find((s) => s.id === id)?.name ?? "（已删除学生）";
  const assignmentTitle = (id: string) =>
    data.assignments.find((a) => a.id === id)?.title ?? "（已删除作业）";

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return flash("请选择课程。");
    setSubmittingAssignment(true);
    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        dueDate: dueDate || null,
        maxScore: maxScore ? Number(maxScore) : null,
      }),
    });
    const json = await res.json();
    setSubmittingAssignment(false);
    if (!res.ok) return flash(json.error);
    setTitle("");
    setDueDate("");
    setMaxScore("");
    flash("已添加作业。");
    reload();
  }

  async function removeAssignment(id: string) {
    const res = await fetch(`/api/admin/assignments?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("已删除。");
    reload();
  }

  async function upsertScore(e: React.FormEvent) {
    e.preventDefault();
    if (!scoreAssignmentId || !scoreStudentId) return flash("请选择作业和学生。");
    setSubmittingScore(true);
    const res = await fetch("/api/admin/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: scoreAssignmentId,
        studentId: scoreStudentId,
        score: score ? Number(score) : null,
        status,
        feedback: feedback || null,
      }),
    });
    const json = await res.json();
    setSubmittingScore(false);
    if (!res.ok) return flash(json.error);
    setScore("");
    setFeedback("");
    flash("已登记作业得分。");
    reload();
  }

  async function removeScore(id: string) {
    const res = await fetch(`/api/admin/scores?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("已删除。");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">添加作业</h2>
        <form onSubmit={addAssignment} className="grid sm:grid-cols-4 gap-4">
          <Field label="所属课程">
            <select
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">选择课程</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="作业标题">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="截止日期">
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label="满分">
            <input
              type="number"
              className={inputClass}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-4">
            <PrimaryButton disabled={submittingAssignment}>
              {submittingAssignment ? "添加中…" : "添加作业"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          作业列表（{data.assignments.length}）
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">标题</th>
              <th className="py-2">课程</th>
              <th className="py-2">截止日期</th>
              <th className="py-2">满分</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.assignments.map((a) => (
              <tr key={a.id} className="ledger-rule last:border-b-0">
                <td className="py-2">{a.title}</td>
                <td className="py-2 text-[var(--ink-soft)]">
                  {courseName(a.course_id)}
                </td>
                <td className="py-2 font-mono text-[var(--ink-soft)]">
                  {a.due_date ?? "—"}
                </td>
                <td className="py-2 font-mono text-[var(--ink-soft)]">
                  {a.max_score ?? "—"}
                </td>
                <td className="py-2 text-right">
                  <DangerLink onClick={() => removeAssignment(a.id)}>
                    删除
                  </DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          登记学生作业得分
        </h2>
        <form onSubmit={upsertScore} className="grid sm:grid-cols-5 gap-4">
          <Field label="作业">
            <select
              className={inputClass}
              value={scoreAssignmentId}
              onChange={(e) => setScoreAssignmentId(e.target.value)}
              required
            >
              <option value="">选择作业</option>
              {data.assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}（{courseName(a.course_id)}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="学生">
            <select
              className={inputClass}
              value={scoreStudentId}
              onChange={(e) => setScoreStudentId(e.target.value)}
              required
            >
              <option value="">选择学生</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.student_id}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="得分">
            <input
              type="number"
              className={inputClass}
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </Field>
          <Field label="状态">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="assigned">待完成</option>
              <option value="submitted">已提交</option>
              <option value="graded">已批改</option>
              <option value="missing">未提交</option>
            </select>
          </Field>
          <Field label="评语（可选）">
            <input
              className={inputClass}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-5">
            <PrimaryButton disabled={submittingScore}>
              {submittingScore ? "保存中…" : "保存得分"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          已登记的作业得分（{data.scores.length}）
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">作业</th>
              <th className="py-2">学生</th>
              <th className="py-2">状态</th>
              <th className="py-2">得分</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.scores.map((s) => (
              <tr key={s.id} className="ledger-rule last:border-b-0">
                <td className="py-2">{assignmentTitle(s.assignment_id)}</td>
                <td className="py-2">{studentName(s.student_id)}</td>
                <td className="py-2 font-mono text-xs">{s.status}</td>
                <td className="py-2 font-mono">{s.score ?? "—"}</td>
                <td className="py-2 text-right">
                  <DangerLink onClick={() => removeScore(s.id)}>删除</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
