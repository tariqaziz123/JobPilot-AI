"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getJobRecommendations } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { JobRecommendation } from "../types";

export default function JobRecommendations() {
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
    const [recommendationRange, setRecommendationRange] = useState<
        "24h" | "7d" | "30d" | "all"
    >("7d");
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState("");

    async function loadRecommendations() {
        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setRecommendationsLoading(true);
        setRecommendationsError("");

        try {
            const result = await getJobRecommendations(
                token,
                recommendationRange
            );
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

    const sortedRecommendations = [...recommendations].sort(
        (a, b) => {
            const priority = {
                HIGH: 3,
                MEDIUM: 2,
                LOW: 1,
            };

            return (
                priority[b.priority] -
                priority[a.priority] ||
                b.matchScore - a.matchScore
            );
        }
    );

    return (
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-purple-400">
                        AI Powered
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Job Recommendations
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Find the saved jobs that best match your skills and resume.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="recommendation-range"
                        className="text-xs font-medium text-slate-500"
                    >
                        Jobs from
                    </label>

                    <select
                        id="recommendation-range"
                        value={recommendationRange}
                        onChange={(event) => {
                            setRecommendationRange(
                                event.target.value as
                                | "24h"
                                | "7d"
                                | "30d"
                                | "all"
                            );
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-purple-500"
                    >
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="all">All saved jobs</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={loadRecommendations}
                    disabled={recommendationsLoading}
                    className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {recommendationsLoading
                        ? "Analyzing..."
                        : recommendations.length > 0
                            ? "Refresh Recommendations"
                            : "Get Recommendations"}
                </button>
            </div>

            {recommendationsError && (
                <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    {recommendationsError}
                </div>
            )}

            {!recommendationsLoading &&
                !recommendationsError &&
                recommendations.length === 0 && (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/50 text-purple-400">
                            ✦
                        </div>
                        <h3 className="mt-4 font-semibold text-white">
                            Discover your best matches
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                            Let AI compare your profile against your saved jobs
                            and identify the opportunities you should prioritize.
                        </p>
                    </div>
                )}

            {recommendationsLoading && (
                <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">
                        Finding your best job matches...
                    </p>
                </div>
            )}

            {!recommendationsLoading &&
                recommendations.length > 0 && (
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {sortedRecommendations.map((recommendation) => (
                            <div
                                key={recommendation.jobId}
                                className="rounded-xl border border-slate-800 bg-slate-950 p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {recommendation.job.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {recommendation.job.company}
                                        </p>
                                        <div className="mt-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${recommendation.priority === "HIGH"
                                                    ? "bg-emerald-950 text-emerald-400"
                                                    : recommendation.priority === "MEDIUM"
                                                        ? "bg-amber-950 text-amber-400"
                                                        : "bg-slate-800 text-slate-400"
                                                    }`}
                                            >
                                                {recommendation.priority} PRIORITY
                                            </span>
                                        </div>
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

                                {recommendation.strengths.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Strengths
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {recommendation.strengths
                                                .slice(0, 4)
                                                .map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400"
                                                    >
                                                        ✓ {skill}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {recommendation.missingSkills.length > 0 && (
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
                                                        className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs text-amber-400"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(`/ai-tools?jobId=${recommendation.jobId}`)
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
    );
}
