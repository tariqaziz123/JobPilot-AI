"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import ApiStatus from "@/components/dashboard/ApiStatus";

import { getMe } from "@/lib/api";
import { getToken } from "@/lib/auth";

type User = {
  id: string;
  name: string | null;
  email: string;
};

const stats = [
  {
    label: "Total Applications",
    value: 24,
    description: "All tracked applications",
  },
  {
    label: "Interviews",
    value: 5,
    description: "Upcoming and completed",
  },
  {
    label: "Assessments",
    value: 3,
    description: "Technical assessments",
  },
  {
    label: "Offers",
    value: 1,
    description: "Active offers",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const result = await getMe(token);
        setUser(result.data);
      } catch {
        localStorage.removeItem("jobpilot_token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading dashboard...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome back, {user.name || "there"} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Here's an overview of your job search.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </div>

        <div className="mt-8">
          <ApiStatus />
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Application Pipeline
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your application pipeline will appear here.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}