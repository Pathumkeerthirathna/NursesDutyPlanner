import type { Metadata } from "next";
import { HeartPulse, Sparkles } from "lucide-react";
import "./globals.css";
import BottomNav from "./layout/Components/BottomNav";

export const metadata: Metadata = {
  title: "Nurse Duty Planner",
  description: "Mobile-friendly nurse duty planner for schedules, shifts and settings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen text-slate-900">
        <div className="sticky top-0 z-40 px-3 pt-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white shadow-lg">
                <HeartPulse size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Nurse Duty Planner
                </p>
                <p className="text-xs text-slate-500">Smart scheduling for care teams</p>
              </div>
            </div>
            <span className="soft-badge hidden sm:inline-flex">
              <Sparkles size={14} /> Professional mobile workspace
            </span>
          </div>
        </div>

        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

