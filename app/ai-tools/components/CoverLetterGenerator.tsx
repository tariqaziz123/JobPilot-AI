"use client";

import { useState } from "react";
import { generateCoverLetter, getCoverLetters } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { CoverLetter, Job } from "../types";

interface CoverLetterGeneratorProps {
    jobs: Job[];
    selectedJobId: string;
    setSelectedJobId: (id: string) => void;
    coverLetters: CoverLetter[];
    setCoverLetters: (letters: CoverLetter[]) => void;
}

export default function CoverLetterGenerator({
    jobs,
    selectedJobId,
    setSelectedJobId,
    coverLetters,
    setCoverLetters,
}: CoverLetterGeneratorProps) {
    const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
    const [coverLetterLoading, setCoverLetterLoading] = useState(false);
    const [coverLetterError, setCoverLetterError] = useState("");
    const [copied, setCopied] = useState(false);
    const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);

    async function handleGenerateCoverLetter() {
        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        if (!selectedJobId) {
            setCoverLetterError("Please select a job first.");
            return;
        }

        setCoverLetterLoading(true);
        setCoverLetterError("");
        setCoverLetter(null);
        setCopied(false);

        try {
            const result = await generateCoverLetter(
                token,
                selectedJobId
            );
            setCoverLetter(result.data);
            const historyResult = await getCoverLetters(token);
            setCoverLetters(historyResult.data);
        } catch (error) {
            setCoverLetterError(
                error instanceof Error
                    ? error.message
                    : "Failed to generate cover letter"
            );
        } finally {
            setCoverLetterLoading(false);
        }
    }

    return (
        <>
            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div>
                    <p className="text-sm font-medium text-purple-400">
                        AI Writing Tool
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Cover Letter Generator
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Generate a personalized cover letter based on your
                        resume, skills, and the selected job description.
                    </p>
                </div>

                <div className="mt-6">
                    <label
                        htmlFor="cover-letter-job"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Select Job
                    </label>

                    <select
                        id="cover-letter-job"
                        value={selectedJobId}
                        onChange={(event) => {
                            setSelectedJobId(event.target.value);
                            setCoverLetter(null);
                            setCoverLetterError("");
                            setCopied(false);
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
                    onClick={handleGenerateCoverLetter}
                    disabled={
                        !selectedJobId ||
                        coverLetterLoading
                    }
                    className="mt-6 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {coverLetterLoading
                        ? "Generating..."
                        : "Generate Cover Letter"}
                </button>

                {coverLetterError && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {coverLetterError}
                    </div>
                )}

                {coverLetterLoading && (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
                        <p className="text-sm text-slate-400">
                            Writing a personalized cover letter...
                        </p>
                    </div>
                )}

                {coverLetter && (
                    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-400">
                                    Generated Cover Letter
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Created{" "}
                                    {new Date(
                                        coverLetter.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(
                                            coverLetter.content
                                        );
                                        setCopied(true);
                                        setTimeout(() => {
                                            setCopied(false);
                                        }, 2000);
                                    } catch {
                                        setCoverLetterError(
                                            "Unable to copy the cover letter. Please copy it manually."
                                        );
                                    }
                                }}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-purple-500 hover:text-white"
                            >
                                {copied
                                    ? "✓ Copied to Clipboard"
                                    : "Copy Cover Letter"}
                            </button>
                        </div>
                        {copied && (
                            <p className="mt-3 text-sm text-emerald-400">
                                Your cover letter has been copied. You can now paste it into
                                your application or email.
                            </p>
                        )}
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                            <div className="border-b border-slate-800 px-6 py-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Cover Letter
                                </p>
                            </div>

                            <div className="p-6">
                                <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                                    {coverLetter.content}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                onClick={handleGenerateCoverLetter}
                                disabled={coverLetterLoading}
                                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {coverLetterLoading
                                    ? "Generating..."
                                    : "Regenerate"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setCoverLetter(null);
                                    setCopied(false);
                                    setCoverLetterError("");
                                }}
                                className="text-sm text-slate-500 transition hover:text-white"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div>
                    <p className="text-sm font-medium text-purple-400">
                        History
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Cover Letter History
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        View cover letters you previously generated.
                    </p>
                </div>

                {coverLetters.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6 text-center">
                        <p className="text-sm text-slate-400">
                            No cover letters generated yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {coverLetters.map((letter) => (
                            <div
                                key={letter.id}
                                className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-medium text-white">
                                        {letter.job.title}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {letter.job.company}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {new Date(
                                            letter.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedCoverLetter(letter)
                                    }
                                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                                >
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {selectedCoverLetter && (
                <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-purple-400">
                                Cover Letter
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                {selectedCoverLetter.job.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {selectedCoverLetter.job.company}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {new Date(
                                    selectedCoverLetter.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedCoverLetter(null)
                            }
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6">
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                            {selectedCoverLetter.content}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigator.clipboard.writeText(
                                selectedCoverLetter.content
                            )
                        }
                        className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        Copy Cover Letter
                    </button>
                </section>
            )}
        </>
    );
}
