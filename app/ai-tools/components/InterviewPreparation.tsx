"use client";

import { useState, useEffect } from "react";
import { generateInterviewPreparation, getInterviewPreparations } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { InterviewPreparation as InterviewPrepType, InterviewPreparationHistoryItem, Job } from "../types";

type InterviewQuestion = {
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "JOB_SPECIFIC";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  suggestedAnswer: string;
};

interface InterviewPreparationProps {
    jobs: Job[];
    selectedJobId: string;
    setSelectedJobId: (id: string) => void;
}

export default function InterviewPreparation({
    jobs,
    selectedJobId,
    setSelectedJobId,
}: InterviewPreparationProps) {
    const [interviewPreparation, setInterviewPreparation] = useState<InterviewPrepType | null>(null);
    const [interviewLoading, setInterviewLoading] = useState(false);
    const [interviewError, setInterviewError] = useState("");
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [interviewHistory, setInterviewHistory] = useState<InterviewPreparationHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    useEffect(() => {
        async function loadHistory() {
            const token = getToken();

            if (!token) {
                return;
            }

            setHistoryLoading(true);
            setHistoryError("");

            try {
                const result = await getInterviewPreparations(token);
                setInterviewHistory(result.data ?? []);
            } catch (error) {
                setHistoryError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load interview preparation history"
                );
            } finally {
                setHistoryLoading(false);
            }
        }

        loadHistory();
    }, []);

    async function handleGenerateInterviewPreparation() {
        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        if (!selectedJobId) {
            setInterviewError("Please select a job first.");
            return;
        }

        setInterviewLoading(true);
        setInterviewError("");
        setInterviewPreparation(null);
        setExpandedQuestion(null);

        try {
            const result = await generateInterviewPreparation(
                token,
                selectedJobId
            );
            setInterviewPreparation(result.data);
            const historyResult = await getInterviewPreparations(token);
            setInterviewHistory(historyResult.data ?? []);
        } catch (error) {
            setInterviewError(
                error instanceof Error
                    ? error.message
                    : "Failed to generate interview preparation"
            );
        } finally {
            setInterviewLoading(false);
        }
    }

    function openInterviewPreparation(
        preparation: InterviewPreparationHistoryItem
    ) {
        setSelectedJobId(preparation.jobId);
        setInterviewPreparation({
            id: preparation.id,
            jobId: preparation.jobId,
            questions: preparation.questions,
            preparationTips: preparation.preparationTips,
            createdAt: preparation.createdAt,
        });
        setExpandedQuestion(null);

        setTimeout(() => {
            document
                .getElementById("interview-preparation-result")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        }, 0);
    }

    return (
        <>
            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div>
                    <p className="text-sm font-medium text-purple-400">
                        AI Interview Coach
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Interview Preparation
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Generate technical, behavioral, and job-specific interview
                        questions based on your profile and the selected job.
                    </p>
                </div>

                <div className="mt-6">
                    <label
                        htmlFor="interview-job"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Select Job
                    </label>

                    <select
                        id="interview-job"
                        value={selectedJobId}
                        onChange={(event) => {
                            setSelectedJobId(event.target.value);
                            setInterviewPreparation(null);
                            setInterviewError("");
                            setExpandedQuestion(null);
                        }}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-purple-500"
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
                    onClick={handleGenerateInterviewPreparation}
                    disabled={!selectedJobId || interviewLoading}
                    className="mt-6 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {interviewLoading
                        ? "Preparing Interview..."
                        : "Generate Interview Preparation"}
                </button>

                {interviewError && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {interviewError}
                    </div>
                )}

                {interviewLoading && (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
                        <p className="text-sm text-slate-400">
                            Creating personalized interview questions...
                        </p>
                    </div>
                )}
            </section>

            {interviewPreparation && (
                <section id="interview-preparation-result" className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    {(() => {
                        const selectedJob = jobs.find(
                            (job) => job.id === selectedJobId
                        );

                        return (
                            <>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-400">
                                            AI Interview Coach
                                        </p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">
                                            Interview Preparation
                                        </h2>
                                        {selectedJob && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-white">
                                                    {selectedJob.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {selectedJob.company}
                                                </p>
                                            </div>
                                        )}
                                        <p className="mt-2 text-xs text-slate-500">
                                            Generated{" "}
                                            {new Date(
                                                interviewPreparation.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-purple-800 bg-purple-950/40 px-5 py-3 text-center">
                                        <p className="text-2xl font-bold text-purple-400">
                                            {interviewPreparation.questions.length}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Questions
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-white">
                                            Interview Questions
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Practice these questions using the ready-to-speak
                                            answers provided by the AI.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {interviewPreparation.questions.map(
                                            (question: InterviewQuestion, index: number) => {
                                                const isExpanded =
                                                    expandedQuestion === index;

                                                return (
                                                    <div
                                                        key={`${question.question}-${index}`}
                                                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedQuestion(
                                                                    isExpanded
                                                                        ? null
                                                                        : index
                                                                )
                                                            }
                                                            className="w-full p-5 text-left transition hover:bg-slate-900"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="rounded-full border border-blue-800 bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-400">
                                                                            {question.category.replace(
                                                                                "_",
                                                                                " "
                                                                            )}
                                                                        </span>
                                                                        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                                                                            {question.difficulty}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="mt-4 font-semibold leading-6 text-white">
                                                                        <span className="mr-2 text-purple-400">
                                                                            {index + 1}.
                                                                        </span>
                                                                        {question.question}
                                                                    </h4>
                                                                </div>

                                                                <span className="mt-1 shrink-0 text-slate-400">
                                                                    {isExpanded
                                                                        ? "▲"
                                                                        : "▼"}
                                                                </span>
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="border-t border-slate-800 px-5 pb-5">
                                                                <div className="mt-5 rounded-xl border border-purple-900/60 bg-purple-950/20 p-5">
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                                                        Ready-to-Speak Answer
                                                                    </p>
                                                                    <p className="mt-3 text-sm leading-7 text-slate-300">
                                                                        {question.suggestedAnswer}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
                                    <div>
                                        <p className="text-sm font-medium text-purple-400">
                                            Final Preparation
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-white">
                                            Preparation Tips
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Focus on these areas before the interview.
                                        </p>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {interviewPreparation.preparationTips.map(
                                            (tip: string, index: number) => (
                                                <div
                                                    key={`${tip}-${index}`}
                                                    className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4"
                                                >
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-950 text-xs font-semibold text-purple-400">
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-sm leading-6 text-slate-300">
                                                        {tip}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGenerateInterviewPreparation}
                                        disabled={interviewLoading}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {interviewLoading
                                            ? "Generating..."
                                            : "Regenerate Preparation"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedQuestion(null)}
                                        disabled={expandedQuestion === null}
                                        className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Collapse Answers
                                    </button>
                                </div>
                            </>
                        );
                    })()}
                </section>
            )}

            <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Saved Preparations
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-white">
                            Interview Preparation History
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Open a previous preparation session and continue
                            practicing.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">
                            {interviewHistory.length}
                        </p>
                        <p className="text-xs text-slate-500">
                            Sessions
                        </p>
                    </div>
                </div>

                {historyLoading && (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
                        <p className="text-sm text-slate-400">
                            Loading preparation history...
                        </p>
                    </div>
                )}

                {historyError && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {historyError}
                    </div>
                )}

                {!historyLoading &&
                    !historyError &&
                    interviewHistory.length === 0 && (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                            <p className="text-sm font-medium text-slate-300">
                                No interview preparations yet
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Generate your first interview preparation
                                above and it will appear here.
                            </p>
                        </div>
                    )}

                {!historyLoading &&
                    interviewHistory.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {interviewHistory.map((preparation) => (
                                <button
                                    key={preparation.id}
                                    type="button"
                                    onClick={() =>
                                        openInterviewPreparation(
                                            preparation
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-purple-800 hover:bg-slate-900"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-purple-800 bg-purple-950/40 px-3 py-1 text-xs font-medium text-purple-400">
                                                    Interview Preparation
                                                </span>
                                                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                                                    {preparation.questions.length}{" "}
                                                    Questions
                                                </span>
                                            </div>
                                            <h3 className="mt-3 truncate font-semibold text-white">
                                                {preparation.job.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {preparation.job.company}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Generated{" "}
                                                {new Date(
                                                    preparation.createdAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="shrink-0">
                                            <span className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-purple-700 hover:text-white">
                                                Open Preparation →
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
            </section>
        </>
    );
}
