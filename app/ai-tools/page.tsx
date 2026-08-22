"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { analyzeJob, getJobs, getAIAnalyses, analyzeResume, getResumeAnalyses, getJobRecommendations } from "@/lib/api";
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
    skillsMatched: string[];
    missingSkills: string[];
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

type ResumeAnalysis = {
    analysisId: string;
    resumeScore: number;
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    improvements: string[];
    recommendedSkills: string[];
    createdAt: string;
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

export default function AIToolsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState("");

    const [analysis, setAnalysis] =
        useState<Analysis | null>(null);
    const [history, setHistory] = useState<
        AnalysisHistory[]
    >([]);
    const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
    const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
    const [resumeHistory, setResumeHistory] = useState<
        ResumeAnalysis[]
    >([]);
    const [selectedResumeHistory, setSelectedResumeHistory] =
        useState<ResumeAnalysis | null>(null);
    const [recommendations, setRecommendations] = useState<
        JobRecommendation[]
    >([]);

    const [recommendationsLoading, setRecommendationsLoading] =
        useState(false);

    const [recommendationsError, setRecommendationsError] =
        useState("");
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const jobIdFromUrl = searchParams.get("jobId");

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
                        (job: Job) => job.description?.trim()
                    );

                setJobs(jobsWithDescription);

                if (
                    jobIdFromUrl &&
                    jobsWithDescription.some(
                        (job: Job) => job.id === jobIdFromUrl
                    )
                ) {
                    setSelectedJobId(jobIdFromUrl);
                }

                setHistory(analysesResult.data);
                const resumeResult =
                    await getResumeAnalyses(token);

                setResumeHistory(resumeResult.data);
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
    }, [jobIdFromUrl]);

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

    async function handleResumeAnalysis() {
        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setResumeAnalyzing(true);
        setError("");

        try {
            const result = await analyzeResume(token);

            setResumeAnalysis(result.data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to analyze resume"
            );
        } finally {
            setResumeAnalyzing(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        AI Tools
                    </p>
                    <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <div>
                            <p className="text-sm font-medium text-purple-400">
                                AI Resume Tool
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Resume Analyzer
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Analyze your saved resume for ATS compatibility,
                                strengths, weaknesses, and improvement opportunities.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleResumeAnalysis}
                            disabled={resumeAnalyzing}
                            className="mt-6 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {resumeAnalyzing
                                ? "Analyzing Resume..."
                                : "Analyze Resume"}
                        </button>
                    </section>
                    {resumeAnalysis && (
                        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                            <div>
                                <p className="text-sm font-medium text-purple-400">
                                    Resume Analysis
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Your Resume Results
                                </h2>
                            </div>

                            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <p className="text-sm text-slate-400">
                                        Resume Score
                                    </p>

                                    <p className="mt-2 text-4xl font-bold text-white">
                                        {resumeAnalysis.resumeScore}%
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <p className="text-sm text-slate-400">
                                        ATS Score
                                    </p>

                                    <p className="mt-2 text-4xl font-bold text-white">
                                        {resumeAnalysis.atsScore}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <h3 className="text-lg font-semibold">
                                        Strengths
                                    </h3>

                                    <ul className="mt-4 space-y-2">
                                        {resumeAnalysis.strengths.map(
                                            (item) => (
                                                <li
                                                    key={item}
                                                    className="text-sm text-slate-300"
                                                >
                                                    ✓ {item}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <h3 className="text-lg font-semibold">
                                        Weaknesses
                                    </h3>

                                    <ul className="mt-4 space-y-2">
                                        {resumeAnalysis.weaknesses.map(
                                            (item) => (
                                                <li
                                                    key={item}
                                                    className="text-sm text-slate-300"
                                                >
                                                    • {item}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <h3 className="text-lg font-semibold">
                                        Missing Keywords
                                    </h3>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {resumeAnalysis.missingKeywords.map(
                                            (item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1.5 text-sm text-amber-400"
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <h3 className="text-lg font-semibold">
                                        Recommended Skills
                                    </h3>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {resumeAnalysis.recommendedSkills.map(
                                            (item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-blue-800 bg-blue-950/40 px-3 py-1.5 text-sm text-blue-400"
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <h3 className="text-lg font-semibold">
                                    Improvements
                                </h3>

                                <ul className="mt-4 space-y-3">
                                    {resumeAnalysis.improvements.map(
                                        (item) => (
                                            <li
                                                key={item}
                                                className="text-sm leading-6 text-slate-300"
                                            >
                                                → {item}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </section>
                    )}
                    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <div>
                            <p className="text-sm font-medium text-purple-400">
                                History
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Resume Analysis History
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                View your previous resume analyses.
                            </p>
                        </div>

                        {resumeHistory.length === 0 ? (
                            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">
                                <p className="text-sm text-slate-400">
                                    No resume analyses yet.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">
                                {resumeHistory.map((analysis) => (
                                    <div
                                        key={analysis.analysisId}
                                        className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                Resume Analysis
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {new Date(
                                                    analysis.createdAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Resume
                                                </p>

                                                <p className="font-semibold text-white">
                                                    {analysis.resumeScore}%
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    ATS
                                                </p>

                                                <p className="font-semibold text-white">
                                                    {analysis.atsScore}%
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedResumeHistory(analysis)
                                                }
                                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    {selectedResumeHistory && (
                        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-purple-400">
                                        Previous Analysis
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-white">
                                        Resume Analysis
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {new Date(
                                            selectedResumeHistory.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedResumeHistory(null)
                                    }
                                    className="text-sm text-slate-400 hover:text-white"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg bg-slate-950 p-5">
                                    <p className="text-sm text-slate-400">
                                        Resume Score
                                    </p>

                                    <p className="mt-2 text-3xl font-bold">
                                        {selectedResumeHistory.resumeScore}%
                                    </p>
                                </div>

                                <div className="rounded-lg bg-slate-950 p-5">
                                    <p className="text-sm text-slate-400">
                                        ATS Score
                                    </p>

                                    <p className="mt-2 text-3xl font-bold">
                                        {selectedResumeHistory.atsScore}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <div>
                                    <h3 className="font-semibold">
                                        Strengths
                                    </h3>

                                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                        {selectedResumeHistory.strengths.map(
                                            (item) => (
                                                <li key={item}>✓ {item}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Weaknesses
                                    </h3>

                                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                                        {selectedResumeHistory.weaknesses.map(
                                            (item) => (
                                                <li key={item}>• {item}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Missing Keywords
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedResumeHistory.missingKeywords.map(
                                            (item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        Recommended Skills
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedResumeHistory.recommendedSkills.map(
                                            (item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-blue-800 px-3 py-1 text-xs text-blue-400"
                                                >
                                                    {item}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-semibold">
                                    Improvements
                                </h3>

                                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                                    {selectedResumeHistory.improvements.map(
                                        (item) => (
                                            <li key={item}>→ {item}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </section>
                    )}
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
                                    {recommendations.map((recommendation) => (
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
                                                        window.location.href =
                                                        `/ai-tools?jobId=${recommendation.jobId}`
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
                                                onClick={() => setSelectedHistory(item)}
                                                className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/50 last:border-b-0"
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
                {selectedHistory && (
                    <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-400">
                                    Previous Analysis
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    {selectedHistory.job.title}
                                </h2>

                                <p className="mt-1 text-slate-400">
                                    {selectedHistory.job.company}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Analyzed on{" "}
                                    {new Date(
                                        selectedHistory.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedHistory(null)}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <p className="text-sm text-slate-400">
                                    Match Score
                                </p>

                                <p className="mt-2 text-4xl font-bold text-white">
                                    {selectedHistory.matchScore ?? 0}%
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <p className="text-sm text-slate-400">
                                    ATS Score
                                </p>

                                <p className="mt-2 text-4xl font-bold text-white">
                                    {selectedHistory.atsScore ?? 0}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <h3 className="text-lg font-semibold text-white">
                                    Skills Matched
                                </h3>

                                {selectedHistory.skillsMatched?.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedHistory.skillsMatched.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-400"
                                            >
                                                ✓ {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-slate-500">
                                        No matching skills found.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                <h3 className="text-lg font-semibold text-white">
                                    Missing Skills
                                </h3>

                                {selectedHistory.missingSkills?.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedHistory.missingSkills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1.5 text-sm text-amber-400"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-emerald-400">
                                        No major missing skills identified.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
                            <h3 className="text-lg font-semibold text-white">
                                Recommendation
                            </h3>

                            <p className="mt-3 leading-7 text-slate-300">
                                {selectedHistory.recommendation ||
                                    "No recommendation available."}
                            </p>
                        </div>
                    </section>
                )}
            </div>

        </DashboardLayout>
    );
}