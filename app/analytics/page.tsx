"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAnalytics } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Analytics = {
  totalApplications: number;
  saved: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  assessments: number;
  interviewRate: number;
  offerRate: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const result = await getAnalytics(token);

        setAnalytics(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load analytics");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading analytics...
        </p>
      </main>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="p-8 text-slate-400">
          {error || "No analytics available"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Insights
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Understand how your job search is performing.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Overview */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            label="Total Applications"
            value={analytics.totalApplications}
          />

          <AnalyticsCard
            label="Interviews"
            value={analytics.interviews}
          />

          <AnalyticsCard
            label="Offers"
            value={analytics.offers}
          />

          <AnalyticsCard
            label="Rejected"
            value={analytics.rejected}
          />
        </div>

        {/* Pipeline */}
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Application Pipeline
          </h2>

          <div className="mt-6 space-y-5">
            <PipelineRow
              label="Saved"
              value={analytics.saved}
              total={analytics.totalApplications}
            />

            <PipelineRow
              label="Applied"
              value={analytics.applied}
              total={analytics.totalApplications}
            />

            <PipelineRow
              label="Interviews"
              value={analytics.interviews}
              total={analytics.totalApplications}
            />

            <PipelineRow
              label="Assessments"
              value={analytics.assessments}
              total={analytics.totalApplications}
            />

            <PipelineRow
              label="Offers"
              value={analytics.offers}
              total={analytics.totalApplications}
            />

            <PipelineRow
              label="Rejected"
              value={analytics.rejected}
              total={analytics.totalApplications}
            />
          </div>
        </section>

        {/* Conversion */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Interview Rate
            </p>

            <p className="mt-3 text-4xl font-bold">
              {analytics.interviewRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Applications resulting in interviews
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Offer Rate
            </p>

            <p className="mt-3 text-4xl font-bold">
              {analytics.offerRate}%
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Applications resulting in offers
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function AnalyticsCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function PipelineRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">
          {label}
        </span>

        <span className="text-slate-400">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}