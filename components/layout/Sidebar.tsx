"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Jobs",
    href: "/jobs",
  },
  {
    name: "AI Tools",
    href: "/ai",
  },
  {
    name: "Analytics",
    href: "/analytics",
  },
  {
    name: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:block">
      <div className="flex h-full min-h-screen flex-col">
        <div className="border-b border-slate-800 px-6 py-5">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            JobPilot <span className="text-blue-400">AI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-lg bg-slate-900 p-3">
            <p className="text-sm font-medium text-white">
              AI Credits
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Free tier usage
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/4 rounded-full bg-blue-500" />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              25% used
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}