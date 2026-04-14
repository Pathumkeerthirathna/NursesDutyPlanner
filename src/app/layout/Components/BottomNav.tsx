"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clock, Home, Settings, Tag, Wallet } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/DutyPlan", label: "Duties", icon: CalendarCheck },
  { href: "/shifts", label: "Shifts", icon: Clock },
  { href: "/dutytypes", label: "Types", icon: Tag },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/DutySettings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 px-3">
      <div className="mx-auto flex max-w-4xl items-center justify-around rounded-[1.4rem] border border-sky-100 bg-white/90 px-2 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-slate-500 hover:bg-sky-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
