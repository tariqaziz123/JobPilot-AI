"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { analyzeJob, getJobs, getAIAnalyses } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Job = {
    id: string;
    company: string;
    title: string;
    description: string | null;
    status: string;
};

type Analysis = {
    matchScore: number;
    atsScore: number;
    skillsMatched: string[];
    missingSkills: string[];
    recommendation: string;
    analysisId: string;
    jobId: string;
};

type AnalysisHistory = {
    id: string;
    matchScore: number | null;
    atsScore: number | null;
    skillsMatched: string | null;
    missingSkills: string | null;
    recommendation: string | null;
    createdAt: string;
    job: {
        id: string;
        company: string;
        title: string;
        location: string | null;
        status: string;
    };
};


export default function AIToolsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState("");

    const [analysis, setAnalysis] =
        useState<Analysis | null>(null);
    const [history, setHistory] = useState<
        AnalysisHistory[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            const token = getToken();

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const [jobsResult, analysesResult] =
                    await Promise.all([
                        getJobs(token),
                        getAIAnalyses(token),
                    ]);

                const jobsWithDescription =
                    jobsResult.data.filter(
                        (job: Job) =>
                            job.description?.trim()
                    );

                setJobs(jobsWithDescription);
                setHistory(analysesResult.data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load AI Tools"
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    async function handleAnalyze() {
        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        if (!selectedJobId) {
            setError("Please select a job first.");
            return;
        }

        setAnalyzing(true);
        setError("");
        setAnalysis(null);

        try {
            const result = await analyzeJob(
                token,
                selectedJobId
            );

            setAnalysis(result.data);

            const historyResult =
                await getAIAnalyses(token);

            setHistory(historyResult.data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to analyze job"
            );
        } finally {
            setAnalyzing(false);
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 text-slate-400">
                    Loading AI Tools...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        AI Tools
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Job Analyzer
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Compare your skills and resume against a job
                        description using AI.
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold">
                        Analyze a Job
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Select one of your saved jobs to see how well
                        your profile matches it.
                    </p>

                    {jobs.length === 0 ? (
                        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
                            <p className="text-sm text-slate-400">
                                No jobs with descriptions are available.
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Add a job with a full job description from
                                the Jobs page first.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-6">
                                <label
                                    htmlFor="job"
                                    className="block text-sm font-medium text-slate-300"
                                >
                                    Select Job
                                </label>

                                <select
                                    id="job"
                                    value={selectedJobId}
                                    onChange={(event) => {
                                        setSelectedJobId(event.target.value);
                                        setAnalysis(null);
                                        setError("");
                                    }}
                                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Select a job...
                                    </option>

                                    {jobs.map((job) => (
                                        <option
                                            key={job.id}
                                            value={job.id}
                                        >
                                            {job.title} — {job.company}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={
                                    !selectedJobId || analyzing
                                }
                                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {analyzing
                                    ? "Analyzing..."
                                    : "Analyze with AI"}
                            </button>
                        </>
                    )}
                </section>

                {analysis && (
                    <section className="mt-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">
                                AI Analysis
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Here's how your profile compares with this
                                job.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                                <p className="text-sm text-slate-400">
                                    Match Score
                                </p>

                                <p className="mt-3 text-4xl font-bold text-white">
                                    {analysis.matchScore}%
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                                <p className="text-sm text-slate-400">
                                    ATS Score
                                </p>

                                <p className="mt-3 text-4xl font-bold text-white">
                                    {analysis.atsScore}%
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                                <h3 className="text-lg font-semibold">
                                    Skills Matched
                                </h3>

                                {analysis.skillsMatched.length ===
                                    0 ? (
                                    <p className="mt-4 text-sm text-slate-500">
                                        No matching skills found.
                                    </p>
                                ) : (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {analysis.skillsMatched.map(
                                            (skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-400"
                                                >
                                                    ✓ {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                                <h3 className="text-lg font-semibold">
                                    Missing Skills
                                </h3>

                                {analysis.missingSkills.length ===
                                    0 ? (
                                    <p className="mt-4 text-sm text-emerald-400">
                                        No major missing skills identified.
                                    </p>
                                ) : (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {analysis.missingSkills.map(
                                            (skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1.5 text-sm text-amber-400"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                            <h3 className="text-lg font-semibold">
                                Recommendation
                            </h3>

                            <p className="mt-3 leading-7 text-slate-300">
                                {analysis.recommendation}
                            </p>
                        </div>
                    </section>
                )}
            </div>
            {history.length > 0 && (
                <section className="mt-10">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Analysis History
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Review your previous AI job analyses.
                        </p>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-800 text-sm text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">
                                            Job
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Company
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Match
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            ATS
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-800 last:border-b-0"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">
                                                    {item.job.title}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.job.status}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-slate-300">
                                                {item.job.company}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-400">
                                                    {item.matchScore ?? 0}%
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-purple-950 px-3 py-1 text-sm text-purple-400">
                                                    {item.atsScore ?? 0}%
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}
        </DashboardLayout>
    );
}