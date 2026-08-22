"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import ApiStatus from "@/components/dashboard/ApiStatus";

import {
  getDashboardStats,
  getMe,
  getJobRecommendations
} from "@/lib/api";
import { getToken } from "@/lib/auth";

type User = {
  id: string;
  name: string | null;
  email: string;
};

type DashboardStats = {
  totalApplications: number;
  interviews: number;
  assessments: number;
  offers: number;
};

type JobRecommendation = {
  jobId: string;
  matchScore: number;
  reason: string;
  strengths: string[];
  missingSkills: string[];
  job: {
    id: string;
    title: string;
    company: string;
    description: string | null;
  };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const [recommendationsError, setRecommendationsError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const [userResult, statsResult] = await Promise.all([
          getMe(token),
          getDashboardStats(token),
        ]);

        setUser(userResult.data);
        setStats(statsResult.data);
      } catch {
        localStorage.removeItem("jobpilot_token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function loadRecommendations() {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setRecommendationsLoading(true);
    setRecommendationsError("");

    try {
      const result = await getJobRecommendations(token);

      setRecommendations(result.data);
    } catch (error) {
      setRecommendationsError(
        error instanceof Error
          ? error.message
          : "Failed to load recommendations"
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }

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
          <StatCard
            label="Total Applications"
            value={stats?.totalApplications ?? 0}
            description="All tracked applications"
          />

          <StatCard
            label="Interviews"
            value={stats?.interviews ?? 0}
            description="Upcoming and completed"
          />

          <StatCard
            label="Assessments"
            value={stats?.assessments ?? 0}
            description="Technical assessments"
          />

          <StatCard
            label="Offers"
            value={stats?.offers ?? 0}
            description="Active offers"
          />
        </div>
        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">
                AI Powered
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Recommended Jobs
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Find the saved jobs that best match your profile.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRecommendations}
              disabled={recommendationsLoading}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recommendationsLoading
                ? "Analyzing..."
                : recommendations.length > 0
                  ? "Refresh Recommendations"
                  : "Get AI Recommendations"}
            </button>
          </div>
          {recommendationsError && (
            <div className="mt-5 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {recommendationsError}
            </div>
          )}

          {recommendationsLoading ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="font-medium text-white">
                AI is analyzing your jobs...
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Comparing your skills and resume with your saved jobs.
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/50 text-purple-400">
                ✦
              </div>

              <h3 className="mt-4 font-semibold text-white">
                Discover your best matches
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Let AI compare your skills and resume against
                your saved jobs and identify the opportunities
                you should prioritize.
              </p>

              <button
                type="button"
                onClick={loadRecommendations}
                className="mt-5 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-500"
              >
                Analyze My Jobs
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {recommendations
                .slice(0, 4)
                .map((recommendation) => (
                  <div
                    key={recommendation.jobId}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {recommendation.job.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {recommendation.job.company}
                        </p>
                      </div>

                      <div className="rounded-lg bg-purple-950/50 px-3 py-2 text-center">
                        <p className="text-2xl font-bold text-purple-400">
                          {recommendation.matchScore}%
                        </p>

                        <p className="text-xs text-slate-500">
                          Match
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-slate-300">
                      {recommendation.reason}
                    </p>

                    {recommendation.missingSkills.length >
                      0 && (
                        <div className="mt-5">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Missing Skills
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {recommendation.missingSkills
                              .slice(0, 4)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() =>
                          window.location.href = `/ai-tools?jobId=${recommendation.jobId}`
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                      >
                        Analyze Job
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

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