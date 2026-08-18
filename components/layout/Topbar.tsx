"use client";

import { useState } from "react";

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 lg:hidden"
        >
          Menu
        </button>

        <div className="hidden text-sm text-slate-400 sm:block">
          AI-powered job search workspace
        </div>

        <div className="relative">
          <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
              TA
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-white">
                Tariq Aziz
              </p>

              <p className="text-xs text-slate-500">
                Free Plan
              </p>
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-800 px-4 py-3 lg:hidden">
          <p className="text-sm text-slate-400">
            Mobile navigation will be implemented in a later session.
          </p>
        </div>
      )}
    </header>
  );
}