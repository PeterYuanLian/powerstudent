import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "补习班学生门户",
  description: "查看课程、成绩与作业进度",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
