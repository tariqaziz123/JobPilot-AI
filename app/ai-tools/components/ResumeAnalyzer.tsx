"use client";

import { useState } from "react";
import { analyzeResume, getResumeAnalyses } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { ResumeAnalysis } from "../types";

interface ResumeAnalyzerProps {
    resumeHistory: ResumeAnalysis[];
    setResumeHistory: (history: ResumeAnalysis[]) => void;
}

export default function ResumeAnalyzer({ resumeHistory, setResumeHistory }: ResumeAnalyzerProps) {
    const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
    const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
    const [selectedResumeHistory, setSelectedResumeHistory] = useState<ResumeAnalysis | null>(null);
    const [error, setError] = useState("");

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
            const historyResult = await getResumeAnalyses(token);
            setResumeHistory(historyResult.data);
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
        <>
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

                {error && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
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
        </>
    );
}
