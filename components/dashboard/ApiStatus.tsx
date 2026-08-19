"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export default function ApiStatus() {
  const [status, setStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  useEffect(() => {
    getHealth()
      .then(() => setStatus("connected"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "checking") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Connecting to JobPilot API...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/30 p-6">
        <p className="text-sm text-red-400">
          Backend connection failed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-6">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

        <div>
          <p className="text-sm font-medium text-emerald-400">
            API Connected
          </p>

          <p className="mt-1 text-xs text-slate-500">
            JobPilot backend is running normally.
          </p>
        </div>
      </div>
    </div>
  );
}