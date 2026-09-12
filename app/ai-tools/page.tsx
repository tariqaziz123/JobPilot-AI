"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    analyzeJob,
    getJobs,
    getAIAnalyses,
    analyzeResume,
    getResumeAnalyses,
    getJobRecommendations,
    generateCoverLetter,
    getCoverLetters,
    generateInterviewPreparation,
    getInterviewPreparations,
    startMockInterview,
    answerMockInterview,
    getMockInterviewSessions,
    getMockInterviewSession,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { InterviewPreparation } from "@/types/ai";

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
    priority: "HIGH" | "MEDIUM" | "LOW";
};

type CoverLetter = {
    id: string;
    jobId: string;
    content: string;
    createdAt: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
};

type InterviewPreparationHistoryItem = InterviewPreparation & {
    id: string;
    jobId: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
};

type MockInterviewQuestion =
    | string
    | {
        question?: string;
        answer?: string;
        type?: string;
        difficulty?: string;
        category?: string;
    };

type MockInterviewEvaluation = {
    score: number;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    improvedAnswer: string;
};

type MockInterviewSession = {
    sessionId: string;
    job: {
        id: string;
        title: string;
        company: string;
    };
    questionIndex: number;
    totalQuestions: number;
    question: MockInterviewQuestion;
};

type MockInterviewHistoryItem = {
    id: string;
    jobId: string;
    status: string;
    currentQuestion: number;
    totalQuestions: number;
    finalScore: number | null;
    startedAt: string;
    completedAt: string | null;
    job: {
        id: string;
        title: string;
        company: string;
    };
    answers: {
        id: string;
        questionIndex: number;
        question: string;
        candidateAnswer: string;
        score: number | null;
        strengths: string[] | null;
        weaknesses: string[] | null;
        feedback: string | null;
        improvedAnswer: string | null;
    }[];
};


function AIToolsContent() {
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

    const [recommendationRange, setRecommendationRange] = useState<
        "24h" | "7d" | "30d" | "all"
    >("7d");

    const [recommendationsLoading, setRecommendationsLoading] =
        useState(false);

    const [recommendationsError, setRecommendationsError] =
        useState("");
    const [error, setError] = useState("");
    const [coverLetter, setCoverLetter] =
        useState<CoverLetter | null>(null);

    const [coverLetterLoading, setCoverLetterLoading] =
        useState(false);

    const [coverLetterError, setCoverLetterError] =
        useState("");

    const [copied, setCopied] = useState(false);
    const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
    const [selectedCoverLetter, setSelectedCoverLetter] =
        useState<CoverLetter | null>(null);
    const [interviewPreparation, setInterviewPreparation] =
        useState<InterviewPreparation | null>(null);

    const [interviewLoading, setInterviewLoading] =
        useState(false);

    const [interviewError, setInterviewError] =
        useState("");
    const [expandedQuestion, setExpandedQuestion] =
        useState<number | null>(null);
    const [interviewHistory, setInterviewHistory] =
        useState<InterviewPreparationHistoryItem[]>([]);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [historyError, setHistoryError] =
        useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobIdFromUrl = searchParams.get("jobId");
    const [mockInterview, setMockInterview] =
        useState<MockInterviewSession | null>(null);

    const [mockInterviewAnswer, setMockInterviewAnswer] =
        useState("");

    const [mockInterviewEvaluation, setMockInterviewEvaluation] =
        useState<MockInterviewEvaluation | null>(null);

    const [mockInterviewLoading, setMockInterviewLoading] =
        useState(false);

    const [mockInterviewSubmitting, setMockInterviewSubmitting] =
        useState(false);

    const [mockInterviewError, setMockInterviewError] =
        useState("");

    const [mockInterviewCompleted, setMockInterviewCompleted] =
        useState(false);

    const [mockInterviewFinalScore, setMockInterviewFinalScore] =
        useState<number | null>(null);

    const [mockInterviewHistory, setMockInterviewHistory] =
        useState<MockInterviewHistoryItem[]>([]);

    const [mockInterviewHistoryLoading, setMockInterviewHistoryLoading] =
        useState(false);

    const [selectedMockHistory, setSelectedMockHistory] =
        useState<MockInterviewHistoryItem | null>(null);

    const [pendingNextQuestion, setPendingNextQuestion] =
        useState<MockInterviewQuestion | null>(null);

    const [pendingNextQuestionIndex, setPendingNextQuestionIndex] =
        useState<number | null>(null);

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

                setHistory(analysesResult.data);
                const resumeResult =
                    await getResumeAnalyses(token);

                setResumeHistory(resumeResult.data);
                const coverLetterResult =
                    await getCoverLetters(token);

                setCoverLetters(coverLetterResult.data);
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

    useEffect(() => {
        if (!jobIdFromUrl || jobs.length === 0) {
            return;
        }

        const jobExists = jobs.some(
            (job) => job.id === jobIdFromUrl
        );

        if (jobExists) {
            setSelectedJobId(jobIdFromUrl);
            setAnalysis(null);
            setError("");
        }
    }, [jobIdFromUrl, jobs]);

    useEffect(() => {
        async function loadHistory() {
            const token = getToken();

            if (!token) {
                return;
            }

            setHistoryLoading(true);
            setHistoryError("");

            try {
                const result =
                    await getInterviewPreparations(token);

                setInterviewHistory(
                    result.data ?? []
                );
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

    useEffect(() => {
        async function loadMockInterviewHistory() {
            const token = getToken();

            if (!token) {
                return;
            }

            setMockInterviewHistoryLoading(true);

            try {
                const result =
                    await getMockInterviewSessions(token);

                setMockInterviewHistory(
                    result.data ?? []
                );
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
            const historyResult =
                await getInterviewPreparations(token);

            setInterviewHistory(
                historyResult.data ?? [])
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

        // Wait for React to render the preparation section,
        // then scroll directly to it.
        setTimeout(() => {
            document
                .getElementById("interview-preparation-result")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        }, 0);
    }

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

                const historyResult =
                    await getMockInterviewSessions(token);

                setMockInterviewHistory(
                    historyResult.data ?? []
                );
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
                                        {/* Header */}
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

                                        {/* Questions */}
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
                                                    (question, index) => {
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

                                        {/* Preparation Tips */}
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
                                                    (tip, index) => (
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

                                        {/* Actions */}
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
                    {/* Mock Interview */}
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

                    {/* Active Mock Interview */}
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

                    {/* Mock Interview History */}
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
                                            onClick={async () => {
                                                const token = getToken();

                                                if (!token) {
                                                    return;
                                                }

                                                try {
                                                    const result =
                                                        await getMockInterviewSession(
                                                            token,
                                                            session.id
                                                        );

                                                    setSelectedMockHistory(
                                                        result.data
                                                    );
                                                } catch (error) {
                                                    console.error(
                                                        "Failed to load mock interview session:",
                                                        error
                                                    );
                                                }
                                            }}
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

                    {/* Selected Mock Interview History */}
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

function AIToolsLoading() {
    return (
        <DashboardLayout>
            <div className="p-8 text-slate-400">
                Loading AI Tools...
            </div>
        </DashboardLayout>
    );
}

export default function AIToolsPage() {
    return (
        <Suspense fallback={<AIToolsLoading />}>
            <AIToolsContent />
        </Suspense>
    );
}