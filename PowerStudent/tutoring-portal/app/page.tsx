import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 flex-1 flex flex-col justify-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-4">
          学生成绩与作业门户
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-6">
          一本随时能翻开的
          <br />
          成绩册。
        </h1>
        <p className="text-[var(--ink-soft)] text-lg max-w-xl mb-10">
          每位同学都能登录查看自己的课程、成绩和作业进度，老师则在后台统一登记和更新。
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-[var(--ledger-blue)] text-white font-medium hover:bg-[var(--ledger-blue-deep)] transition-colors"
          >
            学生登录
          </Link>
          <Link
            href="/admin/login"
            className="px-6 py-3 rounded-md border border-[var(--paper-line)] text-[var(--ink)] font-medium hover:border-[var(--ink-soft)] transition-colors"
          >
            管理后台
          </Link>
        </div>
      </div>

      <footer className="border-t border-[var(--paper-line)] py-6 text-center text-xs text-[var(--ink-soft)] font-mono">
        由老师手动维护 · 数据仅供班级内部查看
      </footer>
    </main>
  );
}
