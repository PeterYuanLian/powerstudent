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
  period: string;
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

const TABS = ["Students", "Courses", "Report Cards", "Assignments"] as const;

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Students");
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
        Loading…
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-1">
            Admin Dashboard
          </p>
          <h1 className="font-display text-2xl font-semibold">Data Manager</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
        >
          Log out
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

      {tab === "Students" && (
        <StudentsTab data={data} reload={load} flash={flash} />
      )}
      {tab === "Courses" && <CoursesTab data={data} reload={load} flash={flash} />}
      {tab === "Report Cards" && (
        <EnrollmentsTab data={data} reload={load} flash={flash} />
      )}
      {tab === "Assignments" && (
        <AssignmentsTab data={data} reload={load} flash={flash} />
      )}
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card p-5">{children}</div>;
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

// ---------- Students ----------
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
    flash("Student added.");
    reload();
  }

  async function resetPassword(id: string) {
    const newPassword = prompt("Enter a new password for this student:");
    if (!newPassword) return;
    const res = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: newPassword }),
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Password updated.");
  }

  async function removeStudent(id: string) {
    if (!confirm("Delete this student? Their grades and assignments will also be removed.")) return;
    const res = await fetch(`/api/admin/students?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Deleted.");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Add Student</h2>
        <form onSubmit={addStudent} className="grid sm:grid-cols-3 gap-4">
          <Field label="Student ID">
            <input
              className={inputClass}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="s001"
              required
            />
          </Field>
          <Field label="Name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="Initial Password">
            <input
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <div className="sm:col-span-3">
            <PrimaryButton disabled={submitting}>
              {submitting ? "Adding…" : "Add Student"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Students ({data.students.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">Student ID</th>
              <th className="py-2">Name</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.id} className="ledger-rule last:border-b-0">
                <td className="py-2 font-mono">{s.student_id}</td>
                <td className="py-2">{s.name}</td>
                <td className="py-2 text-right space-x-4">
                  <DangerLink onClick={() => resetPassword(s.id)}>
                    Reset password
                  </DangerLink>
                  <DangerLink onClick={() => removeStudent(s.id)}>Delete</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- Courses ----------
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
    flash("Course added.");
    reload();
  }

  async function removeCourse(id: string) {
    if (!confirm("Delete this course? Related grades and assignments will also be removed.")) return;
    const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Deleted.");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Add Course</h2>
        <form onSubmit={addCourse} className="grid sm:grid-cols-4 gap-4">
          <Field label="Course Name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="Subject">
            <input
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="Teacher">
            <input
              className={inputClass}
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
            />
          </Field>
          <Field label="Schedule">
            <input
              className={inputClass}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="Sat 2:00-4:00 PM"
            />
          </Field>
          <div className="sm:col-span-4">
            <PrimaryButton disabled={submitting}>
              {submitting ? "Adding…" : "Add Course"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Courses ({data.courses.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">Name</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Teacher</th>
              <th className="py-2">Schedule</th>
              <th className="py-2 text-right">Actions</th>
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
                  <DangerLink onClick={() => removeCourse(c.id)}>Delete</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function periodLabel(period: string) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ---------- Report Cards (enrollment + monthly grade entry) ----------
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
  const [period, setPeriod] = useState(currentPeriod());
  const [grade, setGrade] = useState("");
  const [gradePercent, setGradePercent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("all");

  const studentName = (id: string) =>
    data.students.find((s) => s.id === id)?.name ?? "(deleted student)";
  const courseName = (id: string) =>
    data.courses.find((c) => c.id === id)?.name ?? "(deleted course)";

  const availablePeriods = Array.from(
    new Set(data.enrollments.map((en) => en.period))
  ).sort((a, b) => (a < b ? 1 : -1));

  const visibleEnrollments =
    filterPeriod === "all"
      ? data.enrollments
      : data.enrollments.filter((en) => en.period === filterPeriod);

  async function upsertEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !courseId || !period)
      return flash("Please select a student, course, and month.");
    setSubmitting(true);
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId,
        period,
        grade: grade || null,
        gradePercent: gradePercent ? Number(gradePercent) : null,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return flash(json.error);
    setGrade("");
    setGradePercent("");
    flash("Report card entry saved.");
    reload();
  }

  async function removeEnrollment(id: string) {
    const res = await fetch(`/api/admin/enrollments?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Deleted.");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Add Report Card Entry
        </h2>
        <form onSubmit={upsertEnrollment} className="grid sm:grid-cols-5 gap-4">
          <Field label="Student">
            <select
              className={inputClass}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            >
              <option value="">Select student</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Course">
            <select
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select course</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Month">
            <input
              type="month"
              className={inputClass}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
            />
          </Field>
          <Field label="Grade (e.g. A / 92)">
            <input
              className={inputClass}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </Field>
          <Field label="Percent (optional, for stats)">
            <input
              type="number"
              className={inputClass}
              value={gradePercent}
              onChange={(e) => setGradePercent(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-5">
            <PrimaryButton disabled={submitting}>
              {submitting ? "Saving…" : "Save Entry"}
            </PrimaryButton>
            <span className="ml-3 text-xs text-[var(--ink-soft)]">
              Submitting again for the same student + course + month overwrites that entry.
            </span>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">
            Report Card Entries ({visibleEnrollments.length})
          </h2>
          <select
            className={`${inputClass} w-auto`}
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="all">All months</option>
            {availablePeriods.map((p) => (
              <option key={p} value={p}>
                {periodLabel(p)}
              </option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">Student</th>
              <th className="py-2">Course</th>
              <th className="py-2">Month</th>
              <th className="py-2">Grade</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleEnrollments.map((en) => (
              <tr key={en.id} className="ledger-rule last:border-b-0">
                <td className="py-2">{studentName(en.student_id)}</td>
                <td className="py-2">{courseName(en.course_id)}</td>
                <td className="py-2 font-mono text-[var(--ink-soft)]">
                  {periodLabel(en.period)}
                </td>
                <td className="py-2 font-mono">
                  {en.grade ?? "—"}
                  {en.grade_percent !== null ? ` (${en.grade_percent}%)` : ""}
                </td>
                <td className="py-2 text-right">
                  <DangerLink onClick={() => removeEnrollment(en.id)}>
                    Delete
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


// ---------- Assignments ----------
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
    data.courses.find((c) => c.id === id)?.name ?? "(deleted course)";
  const studentName = (id: string) =>
    data.students.find((s) => s.id === id)?.name ?? "(deleted student)";
  const assignmentTitle = (id: string) =>
    data.assignments.find((a) => a.id === id)?.title ?? "(deleted assignment)";

  async function addAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return flash("Please select a course.");
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
    flash("Assignment added.");
    reload();
  }

  async function removeAssignment(id: string) {
    const res = await fetch(`/api/admin/assignments?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Deleted.");
    reload();
  }

  async function upsertScore(e: React.FormEvent) {
    e.preventDefault();
    if (!scoreAssignmentId || !scoreStudentId) return flash("Please select an assignment and a student.");
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
    flash("Score saved.");
    reload();
  }

  async function removeScore(id: string) {
    const res = await fetch(`/api/admin/scores?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return flash(json.error);
    flash("Deleted.");
    reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Add Assignment</h2>
        <form onSubmit={addAssignment} className="grid sm:grid-cols-4 gap-4">
          <Field label="Course">
            <select
              className={inputClass}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">Select course</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignment Title">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Field>
          <Field label="Due Date">
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label="Max Score">
            <input
              type="number"
              className={inputClass}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-4">
            <PrimaryButton disabled={submittingAssignment}>
              {submittingAssignment ? "Adding…" : "Add Assignment"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Assignments ({data.assignments.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">Title</th>
              <th className="py-2">Course</th>
              <th className="py-2">Due Date</th>
              <th className="py-2">Max Score</th>
              <th className="py-2 text-right">Actions</th>
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
                    Delete
                  </DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Record Assignment Score
        </h2>
        <form onSubmit={upsertScore} className="grid sm:grid-cols-5 gap-4">
          <Field label="Assignment">
            <select
              className={inputClass}
              value={scoreAssignmentId}
              onChange={(e) => setScoreAssignmentId(e.target.value)}
              required
            >
              <option value="">Select assignment</option>
              {data.assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({courseName(a.course_id)})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Student">
            <select
              className={inputClass}
              value={scoreStudentId}
              onChange={(e) => setScoreStudentId(e.target.value)}
              required
            >
              <option value="">Select student</option>
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Score">
            <input
              type="number"
              className={inputClass}
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="assigned">Assigned</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="missing">Missing</option>
            </select>
          </Field>
          <Field label="Feedback (optional)">
            <input
              className={inputClass}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-5">
            <PrimaryButton disabled={submittingScore}>
              {submittingScore ? "Saving…" : "Save Score"}
            </PrimaryButton>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">
          Recorded Scores ({data.scores.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="ledger-rule text-left text-[var(--ink-soft)] font-mono text-xs uppercase">
              <th className="py-2">Assignment</th>
              <th className="py-2">Student</th>
              <th className="py-2">Status</th>
              <th className="py-2">Score</th>
              <th className="py-2 text-right">Actions</th>
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
                  <DangerLink onClick={() => removeScore(s.id)}>Delete</DangerLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
