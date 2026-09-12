"use client";

import { useState, useEffect } from "react";
import { startMockInterview, answerMockInterview, getMockInterviewSessions, getMockInterviewSession } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { MockInterviewSession, MockInterviewQuestion, MockInterviewEvaluation, MockInterviewHistoryItem, Job } from "../types";

interface MockInterviewProps {
    jobs: Job[];
    selectedJobId: string;
    setSelectedJobId: (id: string) => void;
}

export default function MockInterview({
    jobs,
    selectedJobId,
    setSelectedJobId,
}: MockInterviewProps) {
    const [mockInterview, setMockInterview] = useState<MockInterviewSession | null>(null);
    const [mockInterviewAnswer, setMockInterviewAnswer] = useState("");
    const [mockInterviewEvaluation, setMockInterviewEvaluation] = useState<MockInterviewEvaluation | null>(null);
    const [mockInterviewLoading, setMockInterviewLoading] = useState(false);
    const [mockInterviewSubmitting, setMockInterviewSubmitting] = useState(false);
    const [mockInterviewError, setMockInterviewError] = useState("");
    const [mockInterviewCompleted, setMockInterviewCompleted] = useState(false);
    const [mockInterviewFinalScore, setMockInterviewFinalScore] = useState<number | null>(null);
    const [mockInterviewHistory, setMockInterviewHistory] = useState<MockInterviewHistoryItem[]>([]);
    const [mockInterviewHistoryLoading, setMockInterviewHistoryLoading] = useState(false);
    const [selectedMockHistory, setSelectedMockHistory] = useState<MockInterviewHistoryItem | null>(null);
    const [pendingNextQuestion, setPendingNextQuestion] = useState<MockInterviewQuestion | null>(null);
    const [pendingNextQuestionIndex, setPendingNextQuestionIndex] = useState<number | null>(null);

    useEffect(() => {
        async function loadMockInterviewHistory() {
            const token = getToken();

            if (!token) {
                return;
            }

            setMockInterviewHistoryLoading(true);

            try {
                const result = await getMockInterviewSessions(token);
                setMockInterviewHistory(result.data ?? []);
            } catch (error) {
                console.error(
                    "Failed to load mock interview history:",
                    error
                );
            } finally {
                setMockInterviewHistoryLoading(false);
            }
        }

        loadMockInterviewHistory();
    }, []);

    async function handleStartMockInterview() {
        if (!selectedJobId) {
            setMockInterviewError("Please select a job first.");
            return;
        }

        const token = getToken();

        if (!token) {
            setMockInterviewError("Please log in again.");
            return;
        }

        setMockInterviewLoading(true);
        setMockInterviewError("");
        setMockInterviewEvaluation(null);
        setMockInterviewAnswer("");
        setMockInterviewCompleted(false);
        setMockInterviewFinalScore(null);

        try {
            const result = await startMockInterview(
                token,
                selectedJobId
            );
            setMockInterview(result.data);
        } catch (error) {
            setMockInterviewError(
                error instanceof Error
                    ? error.message
                    : "Failed to start mock interview"
            );
        } finally {
            setMockInterviewLoading(false);
        }
    }

    async function handleSubmitMockInterviewAnswer() {
        if (!mockInterview) {
            return;
        }

        if (!mockInterviewAnswer.trim()) {
            setMockInterviewError("Please enter your answer.");
            return;
        }

        const token = getToken();

        if (!token) {
            setMockInterviewError("Please log in again.");
            return;
        }

        setMockInterviewSubmitting(true);
        setMockInterviewError("");

        try {
            const result = await answerMockInterview(
                token,
                mockInterview.sessionId,
                mockInterviewAnswer.trim()
            );

            const data = result.data;
            setMockInterviewEvaluation(data.evaluation);

            if (data.completed) {
                setMockInterviewCompleted(true);
                setMockInterviewFinalScore(data.finalScore);

                const historyResult = await getMockInterviewSessions(token);
                setMockInterviewHistory(historyResult.data ?? []);
            } else {
                setPendingNextQuestion(data.nextQuestion);
                setPendingNextQuestionIndex(data.nextQuestionIndex);
            }
        } catch (error) {
            setMockInterviewError(
                error instanceof Error
                    ? error.message
                    : "Failed to submit answer"
            );
        } finally {
            setMockInterviewSubmitting(false);
        }
    }

    function handleContinueMockInterview() {
        if (
            !mockInterview ||
            pendingNextQuestion === null ||
            pendingNextQuestionIndex === null
        ) {
            return;
        }

        setMockInterview({
            ...mockInterview,
            questionIndex: pendingNextQuestionIndex,
            question: pendingNextQuestion,
        });

        setPendingNextQuestion(null);
        setPendingNextQuestionIndex(null);
        setMockInterviewEvaluation(null);
        setMockInterviewAnswer("");
        setMockInterviewError("");
    }

    async function handleViewMockHistory(session: MockInterviewHistoryItem) {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            const result = await getMockInterviewSession(
                token,
                session.id
            );
            setSelectedMockHistory(result.data);
        } catch (error) {
            console.error(
                "Failed to load mock interview session:",
                error
            );
        }
    }

    return (
        <>
            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div>
                    <p className="text-sm font-medium text-purple-400">
                        AI Interview Coach
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Mock Interview
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Practice your interview with AI. Answer questions based
                        on your saved Interview Preparation and receive
                        instant feedback.
                    </p>
                </div>

                {!mockInterview && (
                    <>
                        <div className="mt-6">
                            <label
                                htmlFor="mock-interview-job"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Select Job
                            </label>

                            <select
                                id="mock-interview-job"
                                value={selectedJobId}
                                onChange={(event) => {
                                    setSelectedJobId(event.target.value);
                                    setMockInterview(null);
                                    setMockInterviewEvaluation(null);
                                    setMockInterviewAnswer("");
                                    setMockInterviewError("");
                                    setMockInterviewCompleted(false);
                                    setMockInterviewFinalScore(null);
                                    setPendingNextQuestion(null);
                                    setPendingNextQuestionIndex(null);
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
                            onClick={handleStartMockInterview}
                            disabled={
                                !selectedJobId ||
                                mockInterviewLoading
                            }
                            className="mt-6 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {mockInterviewLoading
                                ? "Starting Interview..."
                                : "Start Mock Interview"}
                        </button>
                    </>
                )}

                {mockInterviewError && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {mockInterviewError}
                    </div>
                )}
            </section>

            {mockInterview && (
                <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    {!mockInterviewCompleted ? (
                        <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-400">
                                        Mock Interview
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-white">
                                        {mockInterview.job.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {mockInterview.job.company}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-purple-800 bg-purple-950/40 px-5 py-3 text-center">
                                    <p className="text-xl font-bold text-purple-400">
                                        {mockInterview.questionIndex + 1}
                                        <span className="text-slate-500">
                                            {" "}
                                            / {mockInterview.totalQuestions}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Question
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                    Interview Question
                                </p>
                                <h3 className="mt-3 text-lg font-semibold leading-7 text-white">
                                    <span className="mr-2 text-purple-400">
                                        {mockInterview.questionIndex + 1}.
                                    </span>
                                    {typeof mockInterview.question === "string"
                                        ? mockInterview.question
                                        : mockInterview.question.question}
                                </h3>
                                {typeof mockInterview.question !== "string" &&
                                    mockInterview.question.type && (
                                        <span className="mt-4 inline-flex rounded-full border border-blue-800 bg-blue-950/40 px-3 py-1 text-xs text-blue-400">
                                            {mockInterview.question.type}
                                        </span>
                                    )}
                            </div>

                            {!pendingNextQuestion && (
                                <div className="mt-6">
                                    <label
                                        htmlFor="mock-interview-answer"
                                        className="block text-sm font-medium text-slate-300"
                                    >
                                        Your Answer
                                    </label>
                                    <textarea
                                        id="mock-interview-answer"
                                        value={mockInterviewAnswer}
                                        onChange={(event) =>
                                            setMockInterviewAnswer(
                                                event.target.value
                                            )
                                        }
                                        disabled={mockInterviewSubmitting}
                                        placeholder="Speak or type your interview answer here..."
                                        rows={8}
                                        className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={
                                                handleSubmitMockInterviewAnswer
                                            }
                                            disabled={
                                                mockInterviewSubmitting ||
                                                !mockInterviewAnswer.trim()
                                            }
                                            className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {mockInterviewSubmitting
                                                ? "AI Is Evaluating..."
                                                : "Submit Answer"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMockInterview(null);
                                                setMockInterviewAnswer("");
                                                setMockInterviewEvaluation(null);
                                                setMockInterviewError("");
                                                setPendingNextQuestion(null);
                                                setPendingNextQuestionIndex(null);
                                            }}
                                            disabled={mockInterviewSubmitting}
                                            className="rounded-lg border border-slate-700 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                                        >
                                            Exit Interview
                                        </button>
                                    </div>
                                </div>
                            )}

                            {mockInterviewSubmitting && (
                                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6">
                                    <p className="text-sm text-slate-400">
                                        AI is evaluating your answer...
                                    </p>
                                    <p className="mt-2 text-xs text-slate-600">
                                        This may take a few seconds.
                                    </p>
                                </div>
                            )}

                            {mockInterviewEvaluation && (
                                <div className="mt-8 space-y-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-400">
                                                AI Evaluation
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold text-white">
                                                Your Answer Review
                                            </h3>
                                        </div>

                                        <div className="rounded-xl border border-purple-800 bg-purple-950/40 px-6 py-4 text-center">
                                            <p className="text-3xl font-bold text-purple-400">
                                                {mockInterviewEvaluation.score}
                                                <span className="text-lg">
                                                    /100
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Score
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 lg:grid-cols-2">
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                            <h4 className="font-semibold text-white">
                                                Strengths
                                            </h4>
                                            <ul className="mt-4 space-y-3">
                                                {mockInterviewEvaluation.strengths.map(
                                                    (strength, index) => (
                                                        <li
                                                            key={`${strength}-${index}`}
                                                            className="text-sm leading-6 text-slate-300"
                                                        >
                                                            <span className="mr-2 text-emerald-400">
                                                                ✓
                                                            </span>
                                                            {strength}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>

                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                            <h4 className="font-semibold text-white">
                                                Areas to Improve
                                            </h4>
                                            <ul className="mt-4 space-y-3">
                                                {mockInterviewEvaluation.weaknesses.map(
                                                    (weakness, index) => (
                                                        <li
                                                            key={`${weakness}-${index}`}
                                                            className="text-sm leading-6 text-slate-300"
                                                        >
                                                            <span className="mr-2 text-amber-400">
                                                                •
                                                            </span>
                                                            {weakness}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                                        <h4 className="font-semibold text-white">
                                            Feedback
                                        </h4>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {mockInterviewEvaluation.feedback}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-purple-900/60 bg-purple-950/20 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                            Improved Answer
                                        </p>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            {mockInterviewEvaluation.improvedAnswer}
                                        </p>
                                    </div>

                                    {pendingNextQuestion && (
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={
                                                    handleContinueMockInterview
                                                }
                                                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                                            >
                                                Next Question →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm font-medium text-emerald-400">
                                Interview Completed
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-white">
                                Great job! 🎉
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                                You completed all {mockInterview.totalQuestions}{" "}
                                interview questions.
                            </p>

                            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-purple-800 bg-purple-950/40 p-8">
                                <p className="text-sm text-slate-400">
                                    Final Score
                                </p>
                                <p className="mt-2 text-5xl font-bold text-purple-400">
                                    {mockInterviewFinalScore ?? 0}
                                    <span className="text-2xl">
                                        /100
                                    </span>
                                </p>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMockInterview(null);
                                        setMockInterviewAnswer("");
                                        setMockInterviewEvaluation(null);
                                        setMockInterviewError("");
                                        setMockInterviewCompleted(false);
                                        setMockInterviewFinalScore(null);
                                        setPendingNextQuestion(null);
                                        setPendingNextQuestionIndex(null);
                                    }}
                                    className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-500"
                                >
                                    Start Another Interview
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            History
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-white">
                            Mock Interview History
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Review your previous mock interview sessions and scores.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">
                            {mockInterviewHistory.length}
                        </p>
                        <p className="text-xs text-slate-500">
                            Sessions
                        </p>
                    </div>
                </div>

                {mockInterviewHistoryLoading && (
                    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
                        <p className="text-sm text-slate-400">
                            Loading mock interview history...
                        </p>
                    </div>
                )}

                {!mockInterviewHistoryLoading &&
                    mockInterviewHistory.length === 0 && (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                            <p className="text-sm font-medium text-slate-300">
                                No mock interviews yet
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Complete your first mock interview and your results
                                will appear here.
                            </p>
                        </div>
                    )}

                {!mockInterviewHistoryLoading &&
                    mockInterviewHistory.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {mockInterviewHistory.map((session) => (
                                <button
                                    key={session.id}
                                    type="button"
                                    onClick={() => handleViewMockHistory(session)}
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-purple-800 hover:bg-slate-900"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-purple-800 bg-purple-950/40 px-3 py-1 text-xs font-medium text-purple-400">
                                                    Mock Interview
                                                </span>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${session.status ===
                                                        "COMPLETED"
                                                        ? "bg-emerald-950 text-emerald-400"
                                                        : "bg-amber-950 text-amber-400"
                                                        }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </div>
                                            <h3 className="mt-3 font-semibold text-white">
                                                {session.job.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {session.job.company}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {new Date(
                                                    session.startedAt
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">
                                                    Score
                                                </p>
                                                <p className="mt-1 text-xl font-bold text-purple-400">
                                                    {session.finalScore !== null
                                                        ? `${session.finalScore}%`
                                                        : "—"}
                                                </p>
                                            </div>
                                            <span className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300">
                                                View →
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
            </section>

            {selectedMockHistory && (
                <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-400">
                                Previous Mock Interview
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                {selectedMockHistory.job.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {selectedMockHistory.job.company}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Started{" "}
                                {new Date(
                                    selectedMockHistory.startedAt
                                ).toLocaleString()}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedMockHistory(null)
                            }
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                            <p className="text-sm text-slate-400">
                                Final Score
                            </p>
                            <p className="mt-2 text-3xl font-bold text-purple-400">
                                {selectedMockHistory.finalScore ?? 0}%
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                            <p className="text-sm text-slate-400">
                                Questions
                            </p>
                            <p className="mt-2 text-3xl font-bold text-white">
                                {selectedMockHistory.totalQuestions}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                            <p className="text-sm text-slate-400">
                                Status
                            </p>
                            <p className="mt-2 text-lg font-bold text-emerald-400">
                                {selectedMockHistory.status}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-5">
                        <h3 className="text-lg font-semibold text-white">
                            Answer Review
                        </h3>

                        {selectedMockHistory.answers.map(
                            (answer) => (
                                <div
                                    key={answer.id}
                                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <h4 className="font-semibold leading-6 text-white">
                                            <span className="mr-2 text-purple-400">
                                                {answer.questionIndex + 1}.
                                            </span>
                                            {answer.question}
                                        </h4>
                                        <span className="shrink-0 rounded-full border border-purple-800 bg-purple-950/40 px-3 py-1 text-sm font-semibold text-purple-400">
                                            {answer.score ?? 0}/100
                                        </span>
                                    </div>

                                    <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Your Answer
                                        </p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">
                                            {answer.candidateAnswer}
                                        </p>
                                    </div>

                                    {answer.feedback && (
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-white">
                                                Feedback
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {answer.feedback}
                                            </p>
                                        </div>
                                    )}

                                    {answer.improvedAnswer && (
                                        <div className="mt-4 rounded-lg border border-purple-900/60 bg-purple-950/20 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
                                                Improved Answer
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {answer.improvedAnswer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}
        </>
    );
}
